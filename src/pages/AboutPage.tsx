export function AboutPage() {
  return (
    <main id="main" className="page page-narrow">
      <p className="kicker">About</p>
      <h1>Mechnain Labs</h1>
      <p className="lede">
        An independent engineering lab focused on practical prototypes: mechanical systems,
        robotics, data-driven tools, and public-impact technology.
      </p>
      <hr className="divider" />

      <h2>What we do</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Mechnain Labs builds working prototypes to learn what technologies can honestly do today —
        and publishes the results, including the limits. Projects span mechanical design, robotics,
        AI and data tooling, and software for public benefit. The Quantum Relief Planner is one of
        those projects: a genuinely useful classical planning tool, paired with a clearly scoped
        experiment on near-term quantum hardware.
      </p>

      <h2>How we work</h2>
      <ul style={{ color: 'var(--text-muted)' }}>
        <li><strong>Classical first.</strong> The boring, reliable method ships as the product. Experimental layers stay labeled as experiments.</li>
        <li><strong>Every number has a receipt.</strong> If a tool produces a figure, the formula behind it is published in plain language.</li>
        <li><strong>No inflated claims.</strong> We state plainly where a technology wins, where it doesn't yet, and which of our results are samples versus measurements.</li>
        <li><strong>Prototypes, labeled as prototypes.</strong> Our tools are for exploration and decision support, not certified or safety-critical use.</li>
      </ul>

      <h2>What we are not</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Mechnain Labs is not a certified engineering services firm, and nothing we publish
        constitutes professional engineering services. Our tools are not emergency-response systems
        and are not deployment-ready for disaster operations. Where a project touches public-impact
        domains — like resource allocation — we build it as decision support with explicit
        limitations, and we expect human judgment, local knowledge, and official systems to lead.
      </p>

      <h2>Contact</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Questions about this project or the methods behind it:{' '}
        <a href="mailto:mechnain.lab@gmail.com">mechnain.lab@gmail.com</a>.
      </p>
    </main>
  );
}
