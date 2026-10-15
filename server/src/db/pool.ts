import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL ?? '';
const needsSsl = url.includes('sslmode=require') || url.includes('neon.tech');

export const pool = new Pool({
  connectionString: url,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});
