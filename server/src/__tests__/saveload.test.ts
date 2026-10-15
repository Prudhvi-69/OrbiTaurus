import { BodySchema, SettingsSchema } from '../validators/schemas';

// Simulates a save → load round-trip: data that passes validation
// should survive JSON serialisation unchanged
describe('Save/load round-trip', () => {
  const body = {
    name: 'Earth', mass: 5.972, radius: 1.0, colour: '#4fa3e0',
    pos_x: 50.123, pos_y: 0, pos_z: 0,
    vel_x: 0, vel_y: 4.47, vel_z: 0,
  };

  it('body survives JSON round-trip', () => {
    const serialised = JSON.parse(JSON.stringify(body));
    const result = BodySchema.safeParse(serialised);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pos_x).toBeCloseTo(50.123);
      expect(result.data.vel_y).toBeCloseTo(4.47);
    }
  });

  it('settings survive JSON round-trip', () => {
    const settings = { timestep: 0.01, speed_multiplier: 2.5, gravitational_constant: 6.674, max_trail_length: 300 };
    const serialised = JSON.parse(JSON.stringify(settings));
    const result = SettingsSchema.safeParse(serialised);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.speed_multiplier).toBe(2.5);
    }
  });
});

// Edge cases at numeric boundaries
describe('Numeric boundary cases', () => {
  const base = {
    name: 'X', mass: 1, radius: 1, colour: '#ffffff',
    pos_x: 0, pos_y: 0, pos_z: 0, vel_x: 0, vel_y: 0, vel_z: 0,
  };

  it('accepts mass exactly at min boundary (1e-6)', () =>
    expect(BodySchema.safeParse({ ...base, mass: 1e-6 }).success).toBe(true));

  it('accepts mass exactly at max boundary (1e12)', () =>
    expect(BodySchema.safeParse({ ...base, mass: 1e12 }).success).toBe(true));

  it('rejects mass just above max (1e12 + 1)', () =>
    expect(BodySchema.safeParse({ ...base, mass: 1e12 + 1 }).success).toBe(false));

  it('rejects -0 velocity (treated as 0, should pass)', () =>
    expect(BodySchema.safeParse({ ...base, vel_x: -0 }).success).toBe(true));

  it('rejects string disguised as number', () =>
    expect(BodySchema.safeParse({ ...base, mass: '5' as any }).success).toBe(false));
});

// Colour validation
describe('Colour validation', () => {
  const base = {
    name: 'X', mass: 1, radius: 1,
    pos_x: 0, pos_y: 0, pos_z: 0, vel_x: 0, vel_y: 0, vel_z: 0,
  };
  it('accepts lowercase hex', () => expect(BodySchema.safeParse({ ...base, colour: '#aabbcc' }).success).toBe(true));
  it('accepts uppercase hex', () => expect(BodySchema.safeParse({ ...base, colour: '#AABBCC' }).success).toBe(true));
  it('rejects 3-digit hex', () => expect(BodySchema.safeParse({ ...base, colour: '#abc' }).success).toBe(false));
  it('rejects named colour', () => expect(BodySchema.safeParse({ ...base, colour: 'blue' }).success).toBe(false));
  it('rejects missing hash', () => expect(BodySchema.safeParse({ ...base, colour: 'aabbcc' }).success).toBe(false));
});
