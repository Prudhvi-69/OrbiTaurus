import { Router, Request } from 'express';
import { pool } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { CheckpointSchema } from '../validators/schemas';

type Params = { universeId: string; cpId?: string; token?: string };
type ExtrasRequest = Request<Params>;
type AuthExtras = AuthRequest & ExtrasRequest;

const router = Router({ mergeParams: true });

const MAX_CHECKPOINTS = 10;

// --- Checkpoints ---
router.get('/checkpoints', authenticate, async (req: AuthExtras, res) => {
  const p = req.params as Params;
  const r = await pool.query(
    `SELECT c.* FROM checkpoints c
     JOIN universes u ON u.id=c.universe_id
     WHERE c.universe_id=$1 AND u.owner_id=$2 ORDER BY c.created_at DESC`,
    [p.universeId, req.userId]
  );
  res.json(r.rows);
});

router.post('/checkpoints', authenticate, validate(CheckpointSchema), async (req: AuthExtras, res) => {
  const uid = (req.params as Params).universeId;
  const own = await pool.query('SELECT owner_id FROM universes WHERE id=$1', [uid]);
  if (!own.rows[0] || own.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });

  const cnt = await pool.query('SELECT COUNT(*) FROM checkpoints WHERE universe_id=$1', [uid]);
  if (parseInt(cnt.rows[0].count) >= MAX_CHECKPOINTS) {
    return res.status(400).json({ error: `Max ${MAX_CHECKPOINTS} checkpoints per universe` });
  }

  const r = await pool.query(
    `INSERT INTO checkpoints (universe_id, name, snapshot) VALUES ($1,$2,$3) RETURNING *`,
    [uid, req.body.name, req.body.snapshot]
  );
  res.status(201).json(r.rows[0]);
});

router.delete('/checkpoints/:cpId', authenticate, async (req: AuthExtras, res) => {
  const own = await pool.query(
    `SELECT u.owner_id FROM checkpoints c JOIN universes u ON u.id=c.universe_id WHERE c.id=$1`,
    [(req.params as Params).cpId]
  );
  if (!own.rows[0] || own.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('DELETE FROM checkpoints WHERE id=$1', [(req.params as Params).cpId]);
  res.json({ ok: true });
});

// --- Share links ---
// List active share links for owner
router.get('/share', authenticate, async (req: AuthExtras, res) => {
  const uid = (req.params as Params).universeId;
  const own = await pool.query('SELECT owner_id FROM universes WHERE id=$1', [uid]);
  if (!own.rows[0] || own.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const r = await pool.query(
    'SELECT id, token, revoked, created_at FROM share_links WHERE universe_id=$1 ORDER BY created_at DESC',
    [uid]
  );
  res.json(r.rows);
});

router.post('/share', authenticate, async (req: AuthExtras, res) => {
  const uid = (req.params as Params).universeId;
  const own = await pool.query('SELECT owner_id, is_public FROM universes WHERE id=$1', [uid]);
  if (!own.rows[0] || own.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  if (!own.rows[0].is_public) return res.status(400).json({ error: 'Universe must be public to share' });

  const r = await pool.query(
    `INSERT INTO share_links (universe_id) VALUES ($1) RETURNING token`, [uid]
  );
  res.status(201).json({ token: r.rows[0].token });
});

router.delete('/share/:token', authenticate, async (req: AuthExtras, res) => {
  const r = await pool.query(
    `SELECT sl.id, u.owner_id FROM share_links sl JOIN universes u ON u.id=sl.universe_id WHERE sl.token=$1`,
    [(req.params as Params).token]
  );
  if (!r.rows[0] || r.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('UPDATE share_links SET revoked=TRUE WHERE token=$1', [(req.params as Params).token]);
  res.json({ ok: true });
});

// Resolve share token (public) — mounted at top-level in index.ts
export async function resolveShareToken(token: string, res: any) {
  const r = await pool.query(
    `SELECT sl.universe_id FROM share_links sl WHERE sl.token=$1 AND sl.revoked=FALSE`,
    [token]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Link not found or revoked' });
  res.json({ universe_id: r.rows[0].universe_id });
}

export default router;
