interface Props {
  index: number;
  title: string;
  children: React.ReactNode;
}

export function CaseStudySection({ index, title, children }: Props) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <section aria-labelledby={`cs-${slug}`} style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
        <span
          className="mono"
          aria-hidden="true"
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--bronze)',
            borderBottom: '2px solid var(--bronze-dim)',
            paddingBottom: '0.1rem',
          }}
        >
          {String(index).padStart(2, '0')}
        </span>
        <h2 id={`cs-${slug}`} style={{ margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ marginTop: '0.5rem' }}>{children}</div>
    </section>
  );
}
