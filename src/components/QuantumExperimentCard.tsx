import type { QuantumResultData } from '../types';
import type { QuantumExperimentMeta } from '../data/quantumSamples';
import { QuantumCountsChart } from './QuantumCountsChart';

interface Props {
  meta: QuantumExperimentMeta;
  ideal: QuantumResultData;
  hardware: QuantumResultData;
  children?: React.ReactNode;
}

export function QuantumExperimentCard({ meta, ideal, hardware, children }: Props) {
  return (
    <section className="card card-experimental" aria-labelledby={`exp-${meta.id}`} style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
        <h3 id={`exp-${meta.id}`} style={{ margin: 0 }}>
          {meta.title}
        </h3>
        <span className="badge badge-experimental">experimental</span>
        <span className="badge">{meta.qubits} qubits</span>
      </div>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{meta.tagline}</p>

      <h4 style={{ margin: '1.2rem 0 0.3rem' }}>What this circuit does</h4>
      {meta.explanation.map((p) => (
        <p key={p.slice(0, 40)} style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {p}
        </p>
      ))}

      {children}

      <div className="grid-2" style={{ marginTop: '1.25rem' }}>
        <div className="card" style={{ background: 'var(--bg-inset)' }}>
          <h4 style={{ marginTop: 0 }}>Ideal result</h4>
          <QuantumCountsChart title="Ideal distribution" data={ideal} />
        </div>
        <div className="card" style={{ background: 'var(--bg-inset)' }}>
          <h4 style={{ marginTop: 0 }}>
            Hardware result{' '}
            {hardware.isSample && (
              <span className="badge badge-sample" style={{ marginLeft: '0.4rem' }}>
                placeholder — sample data
              </span>
            )}
          </h4>
          <QuantumCountsChart title="Measured distribution" data={hardware} ideal={ideal} />
          {hardware.isSample && (
            <p className="hint">
              No real hardware result has been pasted for this experiment yet. The numbers above are
              illustrative sample data in the correct format, never a claim about real device
              behavior.
            </p>
          )}
        </div>
      </div>

      <h4 style={{ margin: '1.2rem 0 0.3rem' }}>What this teaches</h4>
      <ul style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
        {meta.teaches.map((t) => (
          <li key={t.slice(0, 40)}>{t}</li>
        ))}
      </ul>

      <h4 style={{ margin: '1.2rem 0 0.3rem' }}>Limitations</h4>
      <ul style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
        {meta.limitations.map((t) => (
          <li key={t.slice(0, 40)}>{t}</li>
        ))}
        {hardware.limitations && <li>{hardware.limitations}</li>}
      </ul>
    </section>
  );
}
