import { BodySchema, UniverseSchema, SettingsSchema } from '../validators/schemas';

describe('BodySchema', () => {
  const valid = {
    name: 'Earth', mass: 5.97, radius: 1, colour: '#4fa3e0',
    pos_x: 50, pos_y: 0, pos_z: 0, vel_x: 0, vel_y: 4.47, vel_z: 0,
  };

  it('accepts valid body', () => expect(BodySchema.safeParse(valid).success).toBe(true));
  it('rejects NaN mass', () => expect(BodySchema.safeParse({ ...valid, mass: NaN }).success).toBe(false));
  it('rejects Infinity', () => expect(BodySchema.safeParse({ ...valid, mass: Infinity }).success).toBe(false));
  it('rejects mass below min', () => expect(BodySchema.safeParse({ ...valid, mass: 0 }).success).toBe(false));
  it('rejects mass above max', () => expect(BodySchema.safeParse({ ...valid, mass: 2e12 }).success).toBe(false));
  it('rejects bad colour', () => expect(BodySchema.safeParse({ ...valid, colour: 'red' }).success).toBe(false));
  it('rejects empty name', () => expect(BodySchema.safeParse({ ...valid, name: '' }).success).toBe(false));
});

describe('UniverseSchema', () => {
  it('accepts valid universe', () =>
    expect(UniverseSchema.safeParse({ name: 'My Universe', description: 'test', is_public: false }).success).toBe(true));
  it('rejects empty name', () =>
    expect(UniverseSchema.safeParse({ name: '', is_public: false }).success).toBe(false));
  it('rejects description over 1000 chars', () =>
    expect(UniverseSchema.safeParse({ name: 'x', description: 'a'.repeat(1001), is_public: false }).success).toBe(false));
});

describe('SettingsSchema', () => {
  const valid = { timestep: 0.01, speed_multiplier: 1, gravitational_constant: 6.674, max_trail_length: 200 };
  it('accepts valid settings', () => expect(SettingsSchema.safeParse(valid).success).toBe(true));
  it('rejects timestep=0', () => expect(SettingsSchema.safeParse({ ...valid, timestep: 0 }).success).toBe(false));
  it('rejects speed > 10', () => expect(SettingsSchema.safeParse({ ...valid, speed_multiplier: 11 }).success).toBe(false));
  it('rejects non-integer trail length', () =>
    expect(SettingsSchema.safeParse({ ...valid, max_trail_length: 1.5 }).success).toBe(false));
});
