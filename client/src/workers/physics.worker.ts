// Velocity Verlet integrator — runs in a Web Worker to avoid UI freeze (NFR01)
// G is scaled for educational use, not SI units.

interface Body {
  id: string; mass: number;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

function computeAccelerations(bodies: Body[], G: number) {
  const acc = bodies.map(() => ({ ax: 0, ay: 0, az: 0 }));
  const SOFTENING = 0.5; // prevent singularity at r=0
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const dz = bodies[j].z - bodies[i].z;
      const r2 = dx * dx + dy * dy + dz * dz + SOFTENING * SOFTENING;
      const r = Math.sqrt(r2);
      const f = G / r2;
      const fx = f * dx / r;
      const fy = f * dy / r;
      const fz = f * dz / r;
      acc[i].ax += fx * bodies[j].mass;
      acc[i].ay += fy * bodies[j].mass;
      acc[i].az += fz * bodies[j].mass;
      acc[j].ax -= fx * bodies[i].mass;
      acc[j].ay -= fy * bodies[i].mass;
      acc[j].az -= fz * bodies[i].mass;
    }
  }
  return acc;
}

self.onmessage = (e: MessageEvent) => {
  const { bodies, dt, G, steps } = e.data as {
    bodies: Body[]; dt: number; G: number; steps: number;
  };

  let current = bodies.map(b => ({ ...b }));
  let acc = computeAccelerations(current, G);

  for (let s = 0; s < steps; s++) {
    // Half-step velocity + full position update
    const halfV = current.map((b, i) => ({
      vx: b.vx + 0.5 * acc[i].ax * dt,
      vy: b.vy + 0.5 * acc[i].ay * dt,
      vz: b.vz + 0.5 * acc[i].az * dt,
    }));
    current = current.map((b, i) => ({
      ...b,
      x: b.x + halfV[i].vx * dt,
      y: b.y + halfV[i].vy * dt,
      z: b.z + halfV[i].vz * dt,
      vx: halfV[i].vx,
      vy: halfV[i].vy,
      vz: halfV[i].vz,
    }));
    acc = computeAccelerations(current, G);
    // Complete velocity step
    current = current.map((b, i) => ({
      ...b,
      vx: b.vx + 0.5 * acc[i].ax * dt,
      vy: b.vy + 0.5 * acc[i].ay * dt,
      vz: b.vz + 0.5 * acc[i].az * dt,
    }));
  }

  self.postMessage(current);
};
