import { create } from 'zustand';
import { SimBody, SimState, Universe } from '../types';

interface SimStore {
  state: SimState | null;
  running: boolean;
  speed: number;
  selectedBodyId: string | null;
  reducedDetail: boolean;
  cameraDistance: number;

  loadUniverse: (u: Universe) => void;
  updateBodies: (bodies: SimBody[]) => void;
  incrementStep: () => void;
  setRunning: (v: boolean) => void;
  setSpeed: (v: number) => void;
  selectBody: (id: string | null) => void;
  reset: (u: Universe) => void;
  toggleReducedDetail: () => void;
}

function computeCameraDistance(u: Universe): number {
  const bodies = u.bodies || [];
  if (bodies.length === 0) return 120;
  const maxR = Math.max(...bodies.map(b => Math.sqrt(b.pos_x ** 2 + b.pos_y ** 2 + b.pos_z ** 2)));
  const maxRadius = Math.max(...bodies.map(b => b.radius));
  return Math.max(30, (maxR + maxRadius) * 2.5);
}

function universeToBodies(u: Universe): SimBody[] {
  return (u.bodies || []).map(b => ({
    id: b.id, name: b.name, mass: b.mass, radius: b.radius, colour: b.colour,
    x: b.pos_x, y: b.pos_y, z: b.pos_z,
    vx: b.vel_x, vy: b.vel_y, vz: b.vel_z,
    trail: [],
  }));
}

export const useSimStore = create<SimStore>((set) => ({
  state: null,
  running: false,
  speed: 1,
  selectedBodyId: null,
  reducedDetail: false,
  cameraDistance: 120,

  loadUniverse: (u) => set({ state: { bodies: universeToBodies(u), step: 0 }, running: false, speed: 1, cameraDistance: computeCameraDistance(u) }),
  updateBodies: (bodies) => set(s => s.state ? { state: { ...s.state, bodies } } : {}),
  incrementStep: () => set(s => s.state ? { state: { ...s.state, step: s.state.step + 1 } } : {}),
  setRunning: (running) => set({ running }),
  setSpeed: (speed) => set({ speed }),
  selectBody: (selectedBodyId) => set({ selectedBodyId }),
  reset: (u) => set({ state: { bodies: universeToBodies(u), step: 0 }, running: false }),
  toggleReducedDetail: () => set(s => ({ reducedDetail: !s.reducedDetail })),
}));
