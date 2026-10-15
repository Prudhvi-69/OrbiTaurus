const TERMS = [
  { term: 'Mass', def: 'Amount of matter in a body. Heavier bodies exert stronger gravity.' },
  { term: 'Velocity', def: 'Speed and direction of motion. Determines the initial trajectory.' },
  { term: 'Orbit', def: 'Curved path a body follows under gravitational influence.' },
  { term: 'Timestep (dt)', def: 'How much simulated time passes per calculation step. Smaller = more accurate but slower.' },
  { term: 'Numerical drift', def: 'Tiny errors that accumulate over many steps. Results are approximate, not exact predictions.' },
  { term: 'Gravitational constant (G)', def: 'Scales the strength of gravity. This simulator uses an educational value, not SI units.' },
  { term: 'Velocity Verlet', def: 'The integration method used. Better energy conservation than simple Euler, but still approximate.' },
];

export function Glossary() {
  return (
    <section aria-label="Glossary">
      <h2 style={{ fontSize: 14, marginBottom: 8 }}>Glossary</h2>
      <dl style={{ fontSize: 12, lineHeight: 1.6 }}>
        {TERMS.map(({ term, def }) => (
          <div key={term} style={{ marginBottom: 6 }}>
            <dt style={{ fontWeight: 'bold', color: '#adf' }}>{term}</dt>
            <dd style={{ margin: 0, color: '#ccc' }}>{def}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
