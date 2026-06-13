interface Props {
  index: number;
  title: string;
  children: React.ReactNode;
}

export function CaseStudySection({ index, title, children }: Props) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <section aria-labelledby={`cs-${slug}`} style={{ marginBottom: '2.5rem' }}>
      <p className="kicker" style={{ marginBottom: '0.2rem' }}>
        {String(index).padStart(2, '0')}
      </p>
      <h2 id={`cs-${slug}`} style={{ marginTop: 0 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
