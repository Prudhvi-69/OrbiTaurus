export interface CelestialBody {
  id: string;
  universe_id: string;
  name: string;
  mass: number;
  radius: number;
  colour: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  vel_x: number;
  vel_y: number;
  vel_z: number;
}

export interface SimulationSettings {
  timestep: number;
  speed_multiplier: number;
  gravitational_constant: number;
  max_trail_length: number;
}

export interface Universe {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  is_preset: boolean;
  is_archived: boolean;
  bodies: CelestialBody[];
  settings: SimulationSettings;
}

export interface Checkpoint {
  id: string;
  universe_id: string;
  name: string;
  snapshot: unknown;
  created_at: string;
}

// Simulation state (transient — never persisted directly)
export interface SimBody {
  id: string;
  name: string;
  mass: number;
  radius: number;
  colour: string;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  trail: [number, number, number][];
}

export interface SimState {
  bodies: SimBody[];
  step: number;
}
