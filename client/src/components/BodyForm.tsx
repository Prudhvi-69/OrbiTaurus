import { useState } from 'react';
import { CelestialBody } from '../types';
import { validateBody } from '../utils/validate';
import { api } from '../utils/api';

interface Props {
  universeId: string;
  onSaved: () => void;
  existing?: CelestialBody;
}

const DEFAULTS = {
  name: '', mass: 1, radius: 1, colour: '#ffffff',
  pos_x: 0, pos_y: 0, pos_z: 0, vel_x: 0, vel_y: 0, vel_z: 0,
};

export function BodyForm({ universeId, onSaved, existing }: Props) {
  const [form, setForm] = useState(existing ? {
    name: existing.name, mass: existing.mass, radius: existing.radius, colour: existing.colour,
    pos_x: existing.pos_x, pos_y: existing.pos_y, pos_z: existing.pos_z,
    vel_x: existing.vel_x, vel_y: existing.vel_y, vel_z: existing.vel_z,
  } : DEFAULTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBody(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      if (existing) {
        await api.put(`/universes/${universeId}/bodies/${existing.id}`, form);
      } else {
        await api.post(`/universes/${universeId}/bodies`, form);
      }
      onSaved();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  const numField = (label: string, key: string, min: number, max: number) => (
    <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label}
      <input type="number" value={(form as any)[key]} step="any"
        onChange={e => set(key, parseFloat(e.target.value))}
        aria-describedby={errors[key] ? `err-${key}` : undefined} />
      {errors[key] && <span id={`err-${key}`} role="alert" style={{ color: '#f55', fontSize: 11 }}>{errors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label>Name
        <input value={form.name} onChange={e => set('name', e.target.value)} maxLength={64} />
        {errors.name && <span role="alert" style={{ color: '#f55', fontSize: 11 }}>{errors.name}</span>}
      </label>
      {numField('Mass', 'mass', 1e-6, 1e12)}
      {numField('Radius', 'radius', 1e-6, 1e6)}
      <label>Colour
        <input type="color" value={form.colour} onChange={e => set('colour', e.target.value)} />
        {errors.colour && <span role="alert" style={{ color: '#f55', fontSize: 11 }}>{errors.colour}</span>}
      </label>
      <fieldset>
        <legend>Initial Position</legend>
        {numField('X', 'pos_x', -1e9, 1e9)}
        {numField('Y', 'pos_y', -1e9, 1e9)}
        {numField('Z', 'pos_z', -1e9, 1e9)}
      </fieldset>
      <fieldset>
        <legend>Initial Velocity</legend>
        {numField('Vx', 'vel_x', -1e6, 1e6)}
        {numField('Vy', 'vel_y', -1e6, 1e6)}
        {numField('Vz', 'vel_z', -1e6, 1e6)}
      </fieldset>
      {serverError && <p role="alert" style={{ color: '#f55' }}>{serverError}</p>}
      <button type="submit">{existing ? 'Update Body' : 'Add Body'}</button>
    </form>
  );
}
