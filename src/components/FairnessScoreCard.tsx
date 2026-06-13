interface Props {
  label: string;
  value: number; // 0..1
  description: string;
}

/** Indicator card for a 0..1 score (fairness, urgency coverage). */
export function FairnessScoreCard({ label, value, description }: Props) {
  const pct = Math.round(value * 100);
  const tone = value >= 0.85 ? 'var(--ok)' : value >= 0.6 ? 'var(--bronze)' : 'var(--warn)';
  const verdict = value >= 0.85 ? 'high' : value >= 0.6 ? 'moderate' : 'low';
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ color: tone }}>
        {value.toFixed(2)}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)', fontWeight: 400 }}>
          {' '}
          / 1.00 ({verdict})
        </span>
      </span>
      <div
        className="meter"
        role="img"
        aria-label={`${label}: ${value.toFixed(2)} out of 1, ${verdict}`}
      >
        <span className="meter-fill" style={{ width: `${pct}%`, background: tone }} />
      </div>
      <span className="stat-detail">{description}</span>
    </div>
  );
}
