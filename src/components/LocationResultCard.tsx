import type { LocationResult } from '../types';

export function LocationResultCard({ result, unit }: { result: LocationResult; unit: string }) {
  const r = result;
  const pct = Math.round(r.coverage * 100);
  return (
    <div className={`card${r.included ? ' card-accent' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0 }}>{r.location.name}</h3>
        <span className="badge">rank #{r.rank}</span>
      </div>
      <p style={{ margin: '0.6rem 0 0.2rem' }}>
        <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 650 }}>
          {r.allocated}
        </span>{' '}
        <span style={{ color: 'var(--text-muted)' }}>
          {unit} of {r.demand} estimated need
        </span>
      </p>
      {r.included ? (
        <>
          <div
            className="meter"
            role="img"
            aria-label={`${r.location.name}: ${pct}% of estimated need covered`}
          >
            <span
              className="meter-fill"
              style={{
                width: `${Math.min(100, pct)}%`,
                background: pct >= 100 ? 'var(--ok)' : pct >= 60 ? 'var(--bronze)' : 'var(--warn)',
              }}
            />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0.6rem' }}>
            {pct}% coverage · urgency {r.location.urgency}/5 · difficulty{' '}
            {r.location.deliveryDifficulty}/5
            {r.unmet > 0 && ` · ${r.unmet} ${unit} unmet`}
          </p>
        </>
      ) : (
        <p style={{ fontSize: '0.85rem', color: 'var(--warn)', margin: '0.4rem 0 0.6rem' }}>
          Excluded by constraints — see explanation.
        </p>
      )}
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{r.explanation}</p>
      {r.location.notes && (
        <p className="hint" style={{ marginTop: '0.5rem' }}>
          Note: {r.location.notes}
        </p>
      )}
    </div>
  );
}
