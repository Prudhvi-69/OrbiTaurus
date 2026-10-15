import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { validate } from '../middleware/validate';
import { RegisterSchema, LoginSchema } from '../validators/schemas';

const router = Router();

router.post('/register', validate(RegisterSchema), async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  try {
    const r = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, hash]
    );
    const token = jwt.sign({ sub: r.rows[0].id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch {
    res.status(409).json({ error: 'Email already registered' });
  }
});

router.post('/login', validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body;
  const r = await pool.query('SELECT id, password_hash FROM users WHERE email=$1', [email]);
  const user = r.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  res.json({ token });
});

export default router;
