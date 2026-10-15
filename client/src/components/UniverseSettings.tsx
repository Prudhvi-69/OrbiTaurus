import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Universe } from '../types';
import { LIMITS } from '../utils/validate';

interface Props { universe: Universe; onRestorePreset: () => void; }

export function UniverseSettings({ universe, onRestorePreset }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState(universe.name);
  const [desc, setDesc] = useState(universe.description);
  const [isPublic, setIsPublic] = useState(universe.is_public);
  const [settings, setSettings] = useState(universe.settings);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const metaMutation = useMutation({
    mutationFn: () => api.patch(`/universes/${universe.id}`, { name, description: desc, is_public: isPublic }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['universe', universe.id] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
    onError: (e: any) => setError(e.message),
  });

  const settingsMutation = useMutation({
    mutationFn: () => api.put(`/universes/${universe.id}/settings`, settings),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['universe', universe.id] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
    onError: (e: any) => setError(e.message),
  });

  const setSetting = (k: keyof typeof settings, v: number) =>
    setSettings(s => ({ ...s, [k]: v }));

  return (
    <section aria-label="Universe settings" style={{ fontSize: 12 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Settings</h3>
      {error && <p role="alert" style={{ color: '#f55' }}>{error}</p>}
      {saved && <p style={{ color: '#8f8' }}>✓ Saved</p>}

      <label>Name
        <input value={name} onChange={e => setName(e.target.value)} maxLength={128} />
      </label>
      <label style={{ marginTop: 6 }}>Description
        <textarea value={desc} onChange={e => setDesc(e.target.value)} maxLength={1000} rows={2} />
      </label>
      <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        Public universe
      </label>
      <button onClick={() => metaMutation.mutate()} style={{ marginTop: 8 }}>Save Info</button>

      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />

      <label>Timestep (0.0001–1)
        <input type="number" value={settings.timestep} step={0.001} min={0.0001} max={1}
          onChange={e => setSetting('timestep', parseFloat(e.target.value))} />
      </label>
      <label style={{ marginTop: 6 }}>Gravity G (0.001–100)
        <input type="number" value={settings.gravitational_constant} step={0.1} min={0.001} max={100}
          onChange={e => setSetting('gravitational_constant', parseFloat(e.target.value))} />
      </label>
      <label style={{ marginTop: 6 }}>Trail Length (10–1000)
        <input type="number" value={settings.max_trail_length} step={10} min={10} max={1000}
          onChange={e => setSetting('max_trail_length', parseInt(e.target.value))} />
      </label>
      <button onClick={() => settingsMutation.mutate()} style={{ marginTop: 8 }}>Save Sim Settings</button>

      {universe.is_preset && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
          <button onClick={onRestorePreset} style={{ color: '#fa0' }}>↺ Restore Original Preset</button>
        </>
      )}
    </section>
  );
}
