export function LimitationsNotice() {
  return (
    <aside role="note" style={{
      background: '#1a1a2e', border: '1px solid #444', borderRadius: 6,
      padding: 10, fontSize: 11, color: '#bbb', lineHeight: 1.5,
    }}>
      <strong style={{ color: '#f90' }}>⚠ Model Assumptions & Limits</strong>
      <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
        <li>Max <strong>20 bodies</strong> per universe</li>
        <li>No collisions — bodies pass through each other</li>
        <li>No relativistic effects or tidal forces</li>
        <li>Numerical drift accumulates over long runs</li>
        <li>G is scaled for education, not SI units</li>
        <li>Results are <em>not</em> exact astrophysical predictions</li>
      </ul>
    </aside>
  );
}
