import { Router, Request } from 'express';
import { pool } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { BodySchema } from '../validators/schemas';

type Params = { universeId: string; bodyId?: string };
type BodiesRequest = Request<Params>;

const router = Router({ mergeParams: true });

const MAX_BODIES = 20;

async function ownerCheck(universeId: string, userId: string, res: any): Promise<boolean> {
  const r = await pool.query('SELECT owner_id FROM universes WHERE id=$1', [universeId]);
  if (!r.rows[0] || r.rows[0].owner_id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

router.get('/', async (req: BodiesRequest, res) => {
  const r = await pool.query('SELECT * FROM celestial_bodies WHERE universe_id=$1', [(req.params as Params).universeId]);
  res.json(r.rows);
});

router.post('/', authenticate, validate(BodySchema), async (req: AuthRequest & BodiesRequest, res) => {
  const uid = (req.params as Params).universeId;
  if (!(await ownerCheck(uid, req.userId!, res))) return;

  const count = await pool.query('SELECT COUNT(*) FROM celestial_bodies WHERE universe_id=$1', [uid]);
  if (parseInt(count.rows[0].count) >= MAX_BODIES) {
    return res.status(400).json({ error: `Max ${MAX_BODIES} bodies per universe` });
  }

  const { name, mass, radius, colour, pos_x, pos_y, pos_z, vel_x, vel_y, vel_z } = req.body;
  const r = await pool.query(
    `INSERT INTO celestial_bodies (universe_id, name, mass, radius, colour, pos_x, pos_y, pos_z, vel_x, vel_y, vel_z)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [uid, name, mass, radius, colour, pos_x, pos_y, pos_z, vel_x, vel_y, vel_z]
  );
  res.status(201).json(r.rows[0]);
});

router.put('/:bodyId', authenticate, validate(BodySchema), async (req: AuthRequest & BodiesRequest, res) => {
  const p = req.params as Params;
  const uid = p.universeId;
  if (!(await ownerCheck(uid, req.userId!, res))) return;
  const { name, mass, radius, colour, pos_x, pos_y, pos_z, vel_x, vel_y, vel_z } = req.body;
  const r = await pool.query(
    `UPDATE celestial_bodies SET name=$2, mass=$3, radius=$4, colour=$5,
     pos_x=$6, pos_y=$7, pos_z=$8, vel_x=$9, vel_y=$10, vel_z=$11
     WHERE id=$1 AND universe_id=$12 RETURNING *`,
    [p.bodyId, name, mass, radius, colour, pos_x, pos_y, pos_z, vel_x, vel_y, vel_z, uid]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.delete('/:bodyId', authenticate, async (req: AuthRequest & BodiesRequest, res) => {
  const p = req.params as Params;
  const uid = p.universeId;
  if (!(await ownerCheck(uid, req.userId!, res))) return;
  await pool.query('DELETE FROM celestial_bodies WHERE id=$1 AND universe_id=$2', [p.bodyId, uid]);
  res.json({ ok: true });
});

export default router;
