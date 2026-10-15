import { pool } from './pool';

// Orbital velocity for circular orbit: v = sqrt(G * M_sun / r)
// G=6.674, M_sun=1000 → v = sqrt(6674 / r)
const orb = (r: number) => parseFloat(Math.sqrt(6674 / r).toFixed(3));

const PRESETS = [
  {
    name: 'Solar System',
    description: 'All 8 planets + Pluto in scaled circular orbits around the Sun.',
    bodies: [
      { name: 'Sun',     mass: 1000, radius: 4.0, colour: '#FFD700', pos_x:   0, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: 0,           vel_z: 0 },
      { name: 'Mercury', mass:  0.5, radius: 0.4, colour: '#b5b5b5', pos_x:  12, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(12),     vel_z: 0 },
      { name: 'Venus',   mass:  1.2, radius: 0.9, colour: '#e8cda0', pos_x:  20, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(20),     vel_z: 0 },
      { name: 'Earth',   mass:  1.3, radius: 1.0, colour: '#4fa3e0', pos_x:  28, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(28),     vel_z: 0 },
      { name: 'Mars',    mass:  0.7, radius: 0.6, colour: '#c1440e', pos_x:  38, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(38),     vel_z: 0 },
      { name: 'Jupiter', mass: 15.0, radius: 2.5, colour: '#c88b3a', pos_x:  58, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(58),     vel_z: 0 },
      { name: 'Saturn',  mass: 12.0, radius: 2.1, colour: '#e4d191', pos_x:  78, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(78),     vel_z: 0 },
      { name: 'Uranus',  mass:  4.0, radius: 1.5, colour: '#7de8e8', pos_x:  98, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(98),     vel_z: 0 },
      { name: 'Neptune', mass:  4.2, radius: 1.4, colour: '#3f54ba', pos_x: 118, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(118),    vel_z: 0 },
      { name: 'Pluto',   mass:  0.1, radius: 0.3, colour: '#c2a882', pos_x: 135, pos_y: 0, pos_z: 0, vel_x: 0,          vel_y: orb(135),    vel_z: 0 },
    ],
    settings: { timestep: 0.01, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 8000 },
  },
  {
    name: 'Unstable Three-Body',
    description: 'Three equal masses — chaotic, unpredictable orbits.',
    bodies: [
      { name: 'Alpha', mass: 100, radius: 2, colour: '#ff4444', pos_x: -20, pos_y: -12, pos_z: 0, vel_x:  0.5, vel_y:  1.5, vel_z: 0 },
      { name: 'Beta',  mass: 100, radius: 2, colour: '#44ff44', pos_x:  20, pos_y: -12, pos_z: 0, vel_x:  0.5, vel_y: -1.5, vel_z: 0 },
      { name: 'Gamma', mass: 100, radius: 2, colour: '#4488ff', pos_x:   0, pos_y:  22, pos_z: 0, vel_x: -1.0, vel_y:  0.0, vel_z: 0 },
    ],
    settings: { timestep: 0.005, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 500 },
  },
  {
    name: 'Binary Star',
    description: 'Two equal stars orbiting their common centre of mass.',
    bodies: [
      { name: 'Star A', mass: 500, radius: 3, colour: '#fff4e0', pos_x: -15, pos_y: 0, pos_z: 0, vel_x: 0, vel_y: -3.16, vel_z: 0 },
      { name: 'Star B', mass: 500, radius: 3, colour: '#ffa040', pos_x:  15, pos_y: 0, pos_z: 0, vel_x: 0, vel_y:  3.16, vel_z: 0 },
    ],
    settings: { timestep: 0.01, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 300 },
  },
  {
    name: 'Figure-Eight',
    description: 'Three equal masses chasing each other in a stable figure-eight orbit.',
    bodies: [
      { name: 'P1', mass: 100, radius: 1.5, colour: '#ff6688', pos_x:  19.7, pos_y:  0.0,  pos_z: 0, vel_x:  0.306, vel_y:  0.747, vel_z: 0 },
      { name: 'P2', mass: 100, radius: 1.5, colour: '#66ffaa', pos_x: -19.7, pos_y:  0.0,  pos_z: 0, vel_x:  0.306, vel_y:  0.747, vel_z: 0 },
      { name: 'P3', mass: 100, radius: 1.5, colour: '#88aaff', pos_x:   0.0, pos_y:  0.0,  pos_z: 0, vel_x: -0.612, vel_y: -1.494, vel_z: 0 },
    ],
    settings: { timestep: 0.002, speed_multiplier: 1.0, gravitational_constant: 1.0, max_trail_length: 800 },
  },
  {
    name: 'Rogue Planet',
    description: 'A fast rogue planet slingshots through a binary star system.',
    bodies: [
      { name: 'Star A',  mass: 600, radius: 3.5, colour: '#ffe0a0', pos_x: -12, pos_y:  0, pos_z: 0, vel_x:  0,   vel_y: -2.5, vel_z: 0 },
      { name: 'Star B',  mass: 600, radius: 3.5, colour: '#ffc060', pos_x:  12, pos_y:  0, pos_z: 0, vel_x:  0,   vel_y:  2.5, vel_z: 0 },
      { name: 'Rogue',   mass:   5, radius: 1.0, colour: '#aaffee', pos_x:   0, pos_y: 80, pos_z: 0, vel_x:  3.5, vel_y: -6.0, vel_z: 0 },
    ],
    settings: { timestep: 0.005, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 600 },
  },
  {
    name: 'Trojan Asteroids',
    description: 'A planet with two Trojan asteroid clusters at its L4 and L5 Lagrange points.',
    bodies: [
      { name: 'Star',      mass: 1000, radius: 4,   colour: '#FFD700', pos_x:   0,    pos_y:   0,    pos_z: 0, vel_x:  0,     vel_y:  0,     vel_z: 0 },
      { name: 'Planet',    mass:   10, radius: 1.2, colour: '#4fa3e0', pos_x:  40,    pos_y:   0,    pos_z: 0, vel_x:  0,     vel_y: 12.91,  vel_z: 0 },
      { name: 'Trojan L4', mass:    1, radius: 0.6, colour: '#ff9944', pos_x:  20,    pos_y:  34.64, pos_z: 0, vel_x: -11.18, vel_y:  6.46,  vel_z: 0 },
      { name: 'Trojan L5', mass:    1, radius: 0.6, colour: '#ff9944', pos_x:  20,    pos_y: -34.64, pos_z: 0, vel_x:  11.18, vel_y:  6.46,  vel_z: 0 },
    ],
    settings: { timestep: 0.005, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 400 },
  },
  {
    name: 'Hierarchical Triple',
    description: 'Two close stars orbited by a distant third — a stable hierarchical system.',
    bodies: [
      { name: 'Inner A', mass: 300, radius: 2.5, colour: '#ffcc44', pos_x:  -8, pos_y:  0, pos_z: 0, vel_x: 0, vel_y: -5.0, vel_z: 0 },
      { name: 'Inner B', mass: 300, radius: 2.5, colour: '#ff8844', pos_x:   8, pos_y:  0, pos_z: 0, vel_x: 0, vel_y:  5.0, vel_z: 0 },
      { name: 'Outer C', mass: 100, radius: 1.8, colour: '#aaddff', pos_x:   0, pos_y: 70, pos_z: 0, vel_x: 9.8, vel_y: 0,  vel_z: 0 },
    ],
    settings: { timestep: 0.005, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 500 },
  },
  {
    name: 'Earth & Moon',
    description: 'Earth and its Moon in a close, zoomed-in orbit — the most familiar system in space.',
    bodies: [
      { name: 'Earth', mass: 500, radius: 3.0, colour: '#4fa3e0', pos_x:  0, pos_y: 0, pos_z: 0, vel_x: 0, vel_y: 0,     vel_z: 0 },
      { name: 'Moon',  mass:   6, radius: 0.8, colour: '#cccccc', pos_x: 15, pos_y: 0, pos_z: 0, vel_x: 0, vel_y: 14.93, vel_z: 0 },
    ],
    settings: { timestep: 0.002, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 2000 },
  },
  {
    name: 'Pulsar & Planets',
    description: 'A dense neutron star with two planets in tight, fast orbits.',
    bodies: [
      { name: 'Pulsar',   mass: 5000, radius: 1.0, colour: '#ffffff', pos_x:  0, pos_y:  0, pos_z: 0, vel_x: 0,     vel_y: 0,     vel_z: 0 },
      { name: 'Planet I', mass:    1, radius: 0.5, colour: '#ff6644', pos_x: 15, pos_y:  0, pos_z: 0, vel_x: 0,     vel_y: 18.26, vel_z: 0 },
      { name: 'Planet II',mass:    2, radius: 0.7, colour: '#44aaff', pos_x: 28, pos_y:  0, pos_z: 0, vel_x: 0,     vel_y: 13.37, vel_z: 0 },
    ],
    settings: { timestep: 0.003, speed_multiplier: 1.0, gravitational_constant: 6.674, max_trail_length: 400 },
  },
];

async function seed() {
  await pool.query(`DELETE FROM universes WHERE is_preset = TRUE`);

  for (const preset of PRESETS) {
    const uRes = await pool.query(
      `INSERT INTO universes (name, description, is_public, is_preset)
       VALUES ($1, $2, TRUE, TRUE) RETURNING id`,
      [preset.name, preset.description]
    );
    const uid = uRes.rows[0].id;

    await pool.query(
      `INSERT INTO simulation_settings (universe_id, timestep, speed_multiplier, gravitational_constant, max_trail_length)
       VALUES ($1, $2, $3, $4, $5)`,
      [uid, preset.settings.timestep, preset.settings.speed_multiplier, preset.settings.gravitational_constant, preset.settings.max_trail_length]
    );

    for (const b of preset.bodies) {
      await pool.query(
        `INSERT INTO celestial_bodies (universe_id, name, mass, radius, colour, pos_x, pos_y, pos_z, vel_x, vel_y, vel_z)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [uid, b.name, b.mass, b.radius, b.colour, b.pos_x, b.pos_y, b.pos_z, b.vel_x, b.vel_y, b.vel_z]
      );
    }
  }
  console.log('Seed complete');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
