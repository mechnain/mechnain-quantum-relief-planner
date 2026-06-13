interface Props {
  children: React.ReactNode;
  label?: string;
  glyph?: string;
}

/** A warm, plain-language callout that translates a technical idea into everyday terms. */
export function PlainTerms({ children, label = 'In plain terms', glyph = '☞' }: Props) {
  return (
    <div className="plain">
      <span className="glyph" aria-hidden="true">
        {glyph}
      </span>
      <div className="plain-body">
        <span className="plain-label">{label}</span>
        {children}
      </div>
    </div>
  );
}
