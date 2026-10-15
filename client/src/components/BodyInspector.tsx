import { useSimStore } from '../store/simStore';

export function BodyInspector() {
  const { state, selectedBodyId, selectBody } = useSimStore();
  const body = state?.bodies.find(b => b.id === selectedBodyId);

  if (!body) return null;

  return (
    <aside aria-label="Body inspector" style={{
      background: '#111', border: '1px solid #333', borderRadius: 8,
      padding: 12, fontSize: 13, minWidth: 200,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>{body.name}</strong>
        <button onClick={() => selectBody(null)} aria-label="Close inspector">✕</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Mass', body.mass],
            ['Radius', body.radius],
            ['X', body.x.toFixed(3)],
            ['Y', body.y.toFixed(3)],
            ['Z', body.z.toFixed(3)],
            ['Vx', body.vx.toFixed(4)],
            ['Vy', body.vy.toFixed(4)],
            ['Vz', body.vz.toFixed(4)],
          ].map(([label, val]) => (
            <tr key={label as string}>
              <td style={{ color: '#888', paddingRight: 8 }}>{label}</td>
              <td>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
}
