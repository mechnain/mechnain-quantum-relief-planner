interface Props {
  title: string;
  formula?: string;
  children: React.ReactNode;
}

/** Expandable explanation block for the Methods page: plain words first, formula second. */
export function MethodExplanation({ title, formula, children }: Props) {
  return (
    <details className="card card-accent" style={{ marginBottom: '1rem' }} open>
      <summary
        style={{
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '1.08rem',
          fontFamily: 'var(--font-display)',
        }}
      >
        {title}
      </summary>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.97rem', marginTop: '0.6rem' }}>
        {children}
      </div>
      {formula && (
        <>
          <p
            className="mono"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              margin: '1rem 0 0.3rem',
            }}
          >
            The exact formula
          </p>
          <pre
            className="mono"
            style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.85rem 1rem',
              overflowX: 'auto',
              fontSize: '0.85rem',
              margin: 0,
              color: 'var(--bronze-bright)',
            }}
          >
            {formula}
          </pre>
        </>
      )}
    </details>
  );
}
