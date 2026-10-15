import { useEffect, useRef } from 'react';
import { useSimStore } from '../store/simStore';
import { SimBody } from '../types';

const BASE_STEPS = 5;
const MAX_STEPS = 50;
const WARN_STEP = 10_000;

export function useSimulation(
  settings: { timestep: number; gravitational_constant: number; max_trail_length: number } | null,
  onDriftWarning?: () => void
) {
  const { state, running, speed, updateBodies, incrementStep } = useSimStore();
  const workerRef = useRef<Worker | null>(null);
  const busyRef = useRef(false);
  const rafRef = useRef<number>(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const tick = useRef(() => {
    const s = useSimStore.getState();
    if (!s.running || !s.state || busyRef.current || !settingsRef.current) return;
    if (s.state.step > WARN_STEP) onDriftWarning?.();
    busyRef.current = true;
    // Scale steps per tick with speed — dt stays fixed so orbits remain stable
    const steps = Math.min(MAX_STEPS, Math.max(1, Math.round(BASE_STEPS * s.speed)));
    workerRef.current?.postMessage({
      bodies: s.state.bodies,
      dt: settingsRef.current.timestep,
      G: settingsRef.current.gravitational_constant,
      steps,
    });
  });

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/physics.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current.onmessage = (e) => {
      const updated: SimBody[] = e.data.map((b: SimBody, i: number) => {
        const prev = useSimStore.getState().state?.bodies[i];
        const trail = prev?.trail ? [...prev.trail, [b.x, b.y, b.z] as [number, number, number]] : [];
        // No cap — trail grows for the full lifetime of the simulation
        return { ...b, trail };
      });
      updateBodies(updated);
      incrementStep();
      busyRef.current = false;
      // Only reschedule if still running — avoids the freeze bug
      if (useSimStore.getState().running) {
        rafRef.current = requestAnimationFrame(tick.current);
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!running) { cancelAnimationFrame(rafRef.current); return; }
    rafRef.current = requestAnimationFrame(tick.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  return { step: state?.step ?? 0 };
}
