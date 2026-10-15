import { z } from 'zod';

const safeNum = (min: number, max: number) =>
  z.number().finite().min(min).max(max);

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const LoginSchema = RegisterSchema;

export const BodySchema = z.object({
  name: z.string().min(1).max(64),
  mass: safeNum(1e-6, 1e12),
  radius: safeNum(1e-6, 1e6),
  colour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  pos_x: safeNum(-1e9, 1e9),
  pos_y: safeNum(-1e9, 1e9),
  pos_z: safeNum(-1e9, 1e9),
  vel_x: safeNum(-1e6, 1e6),
  vel_y: safeNum(-1e6, 1e6),
  vel_z: safeNum(-1e6, 1e6),
});

export const UniverseSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(1000).default(''),
  is_public: z.boolean().default(false),
});

export const SettingsSchema = z.object({
  timestep: safeNum(0.0001, 1),
  speed_multiplier: safeNum(0.1, 10),
  gravitational_constant: safeNum(0.001, 100),
  max_trail_length: z.number().int().min(10).max(1000),
});

export const CheckpointSchema = z.object({
  name: z.string().min(1).max(64),
  snapshot: z.record(z.unknown()),
});
