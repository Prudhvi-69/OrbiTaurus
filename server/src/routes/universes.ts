import { Router } from 'express';
import { pool } from '../db/pool';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UniverseSchema, SettingsSchema } from '../validators/schemas';

const router = Router();

// List presets (public, no auth needed)
router.get('/presets', async (_req, res) => {
  const r = await pool.query(
    `SELECT u.id, u.name, u.description,
            COALESCE(json_agg(cb.*) FILTER (WHERE cb.id IS NOT NULL), '[]') AS bodies,
            row_to_json(ss.*) AS settings
     FROM universes u
     LEFT JOIN celestial_bodies cb ON cb.universe_id = u.id
     LEFT JOIN simulation_settings ss ON ss.universe_id = u.id
     WHERE u.is_preset = TRUE
     GROUP BY u.id, ss.id`
  );
  res.json(r.rows);
});

// List user's own universes
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const r = await pool.query(
    `SELECT id, name, description, is_public, is_archived, created_at, updated_at
     FROM universes WHERE owner_id=$1 AND is_preset=FALSE ORDER BY updated_at DESC`,
    [req.userId]
  );
  res.json(r.rows);
});

// Get single universe (owner or public share)
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  const r = await pool.query(
    `SELECT u.*, COALESCE(json_agg(cb.*) FILTER (WHERE cb.id IS NOT NULL), '[]') AS bodies, row_to_json(ss.*) AS settings
     FROM universes u
     LEFT JOIN celestial_bodies cb ON cb.universe_id = u.id
     LEFT JOIN simulation_settings ss ON ss.universe_id = u.id
     WHERE u.id=$1
     GROUP BY u.id, ss.id`,
    [req.params.id]
  );
  const u = r.rows[0];
  if (!u) return res.status(404).json({ error: 'Not found' });
  if (!u.is_public && !u.is_preset && u.owner_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(u);
});

// Create universe
router.post('/', authenticate, validate(UniverseSchema), async (req: AuthRequest, res) => {
  const { name, description, is_public } = req.body;
  const r = await pool.query(
    `INSERT INTO universes (owner_id, name, description, is_public)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.userId, name, description, is_public]
  );
  const uid = r.rows[0].id;
  await pool.query(
    `INSERT INTO simulation_settings (universe_id) VALUES ($1)`, [uid]
  );
  res.status(201).json(r.rows[0]);
});

// Update universe metadata
router.patch('/:id', authenticate, validate(UniverseSchema.partial()), async (req: AuthRequest, res) => {
  const r = await pool.query('SELECT owner_id FROM universes WHERE id=$1', [req.params.id]);
  if (!r.rows[0] || r.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const fields = Object.keys(req.body).map((k, i) => `${k}=$${i + 2}`).join(', ');
  const vals = Object.values(req.body);
  const u = await pool.query(
    `UPDATE universes SET ${fields}, updated_at=NOW() WHERE id=$1 RETURNING *`,
    [req.params.id, ...vals]
  );
  res.json(u.rows[0]);
});

// Duplicate universe
router.post('/:id/duplicate', authenticate, async (req: AuthRequest, res) => {
  const src = await pool.query(
    `SELECT u.*, COALESCE(json_agg(cb.*) FILTER (WHERE cb.id IS NOT NULL), '[]') AS bodies, row_to_json(ss.*) AS settings
     FROM universes u
     LEFT JOIN celestial_bodies cb ON cb.universe_id = u.id
     LEFT JOIN simulation_settings ss ON ss.universe_id = u.id
     WHERE u.id=$1 GROUP BY u.id, ss.id`,
    [req.params.id]
  );
  const s = src.rows[0];
  if (!s) return res.status(404).json({ error: 'Not found' });
  if (!s.is_public && !s.is_preset && s.owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });

  const newU = await pool.query(
    `INSERT INTO universes (owner_id, name, description, is_public)
     VALUES ($1,$2,$3,FALSE) RETURNING id`,
    [req.userId, `${s.name} (copy)`, s.description]
  );
  const uid = newU.rows[0].id;
  const ss = s.settings;
  await pool.query(
    `INSERT INTO simulation_settings (universe_id, timestep, speed_multiplier, gravitational_constant, max_trail_length)
     VALUES ($1,$2,$3,$4,$5)`,
    [uid, ss?.timestep ?? 0.01, ss?.speed_multiplier ?? 1, ss?.gravitational_constant ?? 6.674, ss?.max_trail_length ?? 200]
  );
  for (const b of (s.bodies || [])) {
    if (!b) continue;
    await pool.query(
      `INSERT INTO celestial_bodies (universe_id, name, mass, radius, colour, pos_x, pos_y, pos_z, vel_x, vel_y, vel_z)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [uid, b.name, b.mass, b.radius, b.colour, b.pos_x, b.pos_y, b.pos_z, b.vel_x, b.vel_y, b.vel_z]
    );
  }
  res.status(201).json({ id: uid });
});

// Archive / delete
router.patch('/:id/archive', authenticate, async (req: AuthRequest, res) => {
  const r = await pool.query('SELECT owner_id FROM universes WHERE id=$1', [req.params.id]);
  if (!r.rows[0] || r.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('UPDATE universes SET is_archived=TRUE WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const r = await pool.query('SELECT owner_id FROM universes WHERE id=$1', [req.params.id]);
  if (!r.rows[0] || r.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('DELETE FROM universes WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// Update simulation settings
router.put('/:id/settings', authenticate, validate(SettingsSchema), async (req: AuthRequest, res) => {
  const r = await pool.query('SELECT owner_id FROM universes WHERE id=$1', [req.params.id]);
  if (!r.rows[0] || r.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const { timestep, speed_multiplier, gravitational_constant, max_trail_length } = req.body;
  const s = await pool.query(
    `UPDATE simulation_settings SET timestep=$2, speed_multiplier=$3, gravitational_constant=$4, max_trail_length=$5
     WHERE universe_id=$1 RETURNING *`,
    [req.params.id, timestep, speed_multiplier, gravitational_constant, max_trail_length]
  );
  res.json(s.rows[0]);
});

// Export as JSON (FR17)
router.get('/:id/export', optionalAuth, async (req: AuthRequest, res) => {
  const r = await pool.query(
    `SELECT u.name, u.description, COALESCE(json_agg(cb.*) FILTER (WHERE cb.id IS NOT NULL), '[]') AS bodies, row_to_json(ss.*) AS settings
     FROM universes u
     LEFT JOIN celestial_bodies cb ON cb.universe_id = u.id
     LEFT JOIN simulation_settings ss ON ss.universe_id = u.id
     WHERE u.id=$1 GROUP BY u.id, ss.id`,
    [req.params.id]
  );
  const u = r.rows[0];
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Content-Disposition', `attachment; filename="${u.name}.json"`);
  res.json({ name: u.name, description: u.description, bodies: u.bodies, settings: u.settings });
});

export default router;
