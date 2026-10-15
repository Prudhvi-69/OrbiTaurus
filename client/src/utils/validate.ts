export const LIMITS = {
  MAX_BODIES: 20,
  NUM_MIN: 1e-6,
  NUM_MAX: 1e12,
  POS_MAX: 1e9,
  VEL_MAX: 1e6,
};

export function validateNumber(v: number, min: number, max: number): string | null {
  if (!isFinite(v) || isNaN(v)) return 'Must be a finite number';
  if (v < min) return `Must be ≥ ${min}`;
  if (v > max) return `Must be ≤ ${max}`;
  return null;
}

export function validateColour(c: string): string | null {
  return /^#[0-9a-fA-F]{6}$/.test(c) ? null : 'Must be a hex colour (#rrggbb)';
}

export function validateBody(b: {
  name: string; mass: number; radius: number; colour: string;
  pos_x: number; pos_y: number; pos_z: number;
  vel_x: number; vel_y: number; vel_z: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!b.name.trim()) errors.name = 'Name is required';
  const massErr = validateNumber(b.mass, LIMITS.NUM_MIN, LIMITS.NUM_MAX);
  if (massErr) errors.mass = massErr;
  const radErr = validateNumber(b.radius, LIMITS.NUM_MIN, 1e6);
  if (radErr) errors.radius = radErr;
  const colErr = validateColour(b.colour);
  if (colErr) errors.colour = colErr;
  for (const k of ['pos_x', 'pos_y', 'pos_z'] as const) {
    const e = validateNumber(b[k], -LIMITS.POS_MAX, LIMITS.POS_MAX);
    if (e) errors[k] = e;
  }
  for (const k of ['vel_x', 'vel_y', 'vel_z'] as const) {
    const e = validateNumber(b[k], -LIMITS.VEL_MAX, LIMITS.VEL_MAX);
    if (e) errors[k] = e;
  }
  return errors;
}
