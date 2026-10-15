import { pool } from './pool';

const sql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS universes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID UNIQUE REFERENCES universes(id) ON DELETE CASCADE,
  timestep DOUBLE PRECISION DEFAULT 0.01,
  speed_multiplier DOUBLE PRECISION DEFAULT 1.0,
  gravitational_constant DOUBLE PRECISION DEFAULT 6.674,
  max_trail_length INTEGER DEFAULT 200
);

CREATE TABLE IF NOT EXISTS celestial_bodies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mass DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL,
  colour TEXT NOT NULL DEFAULT '#ffffff',
  pos_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  pos_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  pos_z DOUBLE PRECISION NOT NULL DEFAULT 0,
  vel_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  vel_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  vel_z DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Anonymous',
  email TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

pool.query(sql)
  .then(() => { console.log('Migration complete'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
