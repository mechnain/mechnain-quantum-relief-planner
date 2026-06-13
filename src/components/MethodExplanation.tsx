interface Props {
  title: string;
  formula?: string;
  children: React.ReactNode;
}

/** Expandable explanation block for the Methods page. */
export function MethodExplanation({ title, formula, children }: Props) {
  return (
    <details className="card" style={{ marginBottom: '1rem' }} open>
      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1.05rem' }}>{title}</summary>
      {formula && (
        <pre
          className="mono"
          style={{
            background: 'var(--bg-inset)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '0.8rem 1rem',
            overflowX: 'auto',
            fontSize: '0.85rem',
            margin: '0.9rem 0',
          }}
        >
          {formula}
        </pre>
      )}
      <div style={{ color: 'var(--text-muted)', fontSize: '0.97rem' }}>{children}</div>
    </details>
  );
}
