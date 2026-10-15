import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { useSimStore } from '../store/simStore';
import { Checkpoint, Universe } from '../types';

interface Props {
  universe: Universe;
}

export function CheckpointPanel({ universe }: Props) {
  const qc = useQueryClient();
  const { state, loadUniverse } = useSimStore();
  const [name, setName] = useState('');
  const [compareId, setCompareId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: checkpoints } = useQuery<Checkpoint[]>({
    queryKey: ['checkpoints', universe.id],
    queryFn: () => api.get(`/universes/${universe.id}/checkpoints`),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!state) throw new Error('No simulation state');
      return api.post(`/universes/${universe.id}/checkpoints`, {
        name: name.trim() || `Step ${state.step}`,
        snapshot: { bodies: state.bodies, step: state.step },
      });
    },
    onSuccess: () => {
      setName('');
      qc.invalidateQueries({ queryKey: ['checkpoints', universe.id] });
    },
    onError: (e: any) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (cpId: string) => api.delete(`/universes/${universe.id}/checkpoints/${cpId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checkpoints', universe.id] }),
  });

  const restore = (cp: Checkpoint) => {
    const snap = cp.snapshot as { bodies: any[]; step: number };
    // Restore transient sim state from snapshot (does not overwrite saved config)
    useSimStore.setState(s => ({
      state: s.state ? { ...s.state, bodies: snap.bodies, step: snap.step } : s.state,
      running: false,
    }));
  };

  const compareCheckpoint = checkpoints?.find(c => c.id === compareId);
  const compareSnap = compareCheckpoint?.snapshot as { bodies: any[] } | undefined;

  return (
    <section aria-label="Checkpoints" style={{ fontSize: 12 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Checkpoints</h3>

      {/* Save current state */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Checkpoint name…" style={{ flex: 1 }} maxLength={64} />
        <button onClick={() => saveMutation.mutate()} disabled={!state}>Save</button>
      </div>
      {error && <p role="alert" style={{ color: '#f55', margin: '0 0 6px' }}>{error}</p>}

      {/* List */}
      {checkpoints?.length === 0 && <p style={{ color: '#666' }}>No checkpoints yet.</p>}
      {checkpoints?.map(cp => (
        <div key={cp.id} style={{
          background: '#111', border: '1px solid #333', borderRadius: 4,
          padding: '6px 8px', marginBottom: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{cp.name}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => restore(cp)} style={{ fontSize: 11 }}>↩ Restore</button>
              <button onClick={() => setCompareId(compareId === cp.id ? null : cp.id)}
                style={{ fontSize: 11, color: compareId === cp.id ? '#8f8' : undefined }}>
                ⇄ Compare
              </button>
              <button onClick={() => deleteMutation.mutate(cp.id)}
                style={{ fontSize: 11, color: '#f55' }}>✕</button>
            </div>
          </div>
        </div>
      ))}

      {/* FR13 — Compare panel */}
      {compareSnap && state && (
        <div style={{ marginTop: 10, background: '#0d0d1f', border: '1px solid #446', borderRadius: 6, padding: 8 }}>
          <strong style={{ fontSize: 12 }}>Comparing: {compareCheckpoint?.name}</strong>
          <table style={{ width: '100%', fontSize: 11, marginTop: 6, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: '#888' }}>Body</th>
                <th style={{ color: '#88f' }}>Saved X</th>
                <th style={{ color: '#8f8' }}>Current X</th>
                <th style={{ color: '#88f' }}>Saved Y</th>
                <th style={{ color: '#8f8' }}>Current Y</th>
              </tr>
            </thead>
            <tbody>
              {compareSnap.bodies.map((sb: any, i: number) => {
                const cur = state.bodies[i];
                if (!cur) return null;
                return (
                  <tr key={sb.id}>
                    <td>{sb.name}</td>
                    <td style={{ color: '#88f' }}>{sb.x?.toFixed(2)}</td>
                    <td style={{ color: '#8f8' }}>{cur.x.toFixed(2)}</td>
                    <td style={{ color: '#88f' }}>{sb.y?.toFixed(2)}</td>
                    <td style={{ color: '#8f8' }}>{cur.y.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
