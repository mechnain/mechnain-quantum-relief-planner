// Accessible horizontal bar chart built from plain markup.
// Information is conveyed by labels and numbers, never color alone.

export interface BarDatum {
  label: string;
  value: number;
  /** Optional secondary value rendered as a dimmer bar behind the primary one. */
  reference?: number;
  valueText: string;
  tone?: 'bronze' | 'violet' | 'gray';
}

interface Props {
  title: string;
  data: BarDatum[];
  /** Maximum used for scaling; defaults to the largest value/reference present. */
  max?: number;
}

export function BarChart({ title, data, max }: Props) {
  const scale = Math.max(
    max ?? 0,
    ...data.map((d) => Math.max(d.value, d.reference ?? 0)),
    1,
  );
  return (
    <figure style={{ margin: 0 }} role="img" aria-label={`${title}. ${data
      .map((d) => `${d.label}: ${d.valueText}`)
      .join('. ')}`}>
      <figcaption className="kicker" style={{ marginBottom: '0.6rem' }}>
        {title}
      </figcaption>
      <div aria-hidden="true">
        {data.map((d) => (
          <div className="bar-row" key={d.label}>
            <span className="bar-label" title={d.label}>
              {d.label}
            </span>
            <span className="bar-track">
              {d.reference !== undefined && (
                <span
                  className="bar-fill gray"
                  style={{ width: `${Math.min(100, (d.reference / scale) * 100)}%` }}
                />
              )}
              <span
                className={`bar-fill${d.tone === 'violet' ? ' violet' : ''}${
                  d.reference !== undefined ? '' : ''
                }`}
                style={{
                  width: `${Math.min(100, (d.value / scale) * 100)}%`,
                  ...(d.reference !== undefined ? { height: '12px', top: '4px', bottom: 'auto' } : {}),
                }}
              />
            </span>
            <span className="bar-value">{d.valueText}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
