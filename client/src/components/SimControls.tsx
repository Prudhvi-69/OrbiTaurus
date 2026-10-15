import { useSimStore } from '../store/simStore';
import { Universe } from '../types';

interface Props {
  universe: Universe;
  step: number;
  driftWarning: boolean;
}

export function SimControls({ universe, step, driftWarning }: Props) {
  const { running, speed, setRunning, setSpeed, reset } = useSimStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setRunning(!running)} aria-label={running ? 'Pause' : 'Resume'}>
          {running ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={() => { setRunning(false); reset(universe); }} aria-label="Reset simulation">
          ↺ Reset
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Speed
          <input type="range" min={0.1} max={10} step={0.1} value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            aria-label="Simulation speed" />
          {speed.toFixed(1)}×
        </label>
      </div>
      <div style={{ fontSize: 12, color: '#aaa' }}>Step: {step.toLocaleString()}</div>
      {driftWarning && (
        <div role="alert" style={{ color: '#f90', fontSize: 12 }}>
          ⚠ Numerical drift may be accumulating. Results are approximate.
        </div>
      )}
    </div>
  );
}
