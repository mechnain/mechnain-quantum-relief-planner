import { Link } from 'react-router-dom';

const previews = [
  {
    title: 'Food bank allocation',
    text: '300 weekly boxes across five pantries with different demand, urgency, and route difficulty.',
  },
  {
    title: 'Winter clothing distribution',
    text: '400 clothing kits across six shelters, with minimum guarantees and urgency weighting.',
  },
  {
    title: 'School supply planning',
    text: '2,500 supply kits across four schools, aimed at even per-student coverage.',
  },
  {
    title: 'Volunteer route support',
    text: '24 Saturday volunteers across six sites, limited to five stops and easier routes.',
  },
];

export function Landing() {
  return (
    <>
      <div className="hero">
        <div className="page" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
          <p className="kicker">Mechnain Labs · Public-impact tooling · Prototype</p>
          <h1>Plan limited resources fairly.</h1>
          <p className="lede">
            A public-impact planning tool for allocating supplies, volunteers, and delivery capacity
            across communities.
          </p>
          <div className="btn-row">
            <Link to="/planner" className="btn btn-primary">
              Start Planning
            </Link>
            <Link to="/quantum" className="btn">
              View Quantum Demo
            </Link>
          </div>
          <p style={{ color: 'var(--text-muted)', maxWidth: '46rem' }}>
            The planner uses transparent classical optimization for practical recommendations. The
            quantum section demonstrates how a tiny version of the problem can be represented on
            quantum hardware.
          </p>
        </div>
      </div>

      <main id="main" className="page">
        <section aria-labelledby="mission">
          <h2 id="mission">Why this exists</h2>
          <p style={{ maxWidth: '46rem', color: 'var(--text-muted)' }}>
            Small organizations face the same hard question every week: <em>we have X units and N
            places that need more than X combined — how do we split it, and how do we explain the
            split?</em> Today that decision lives in spreadsheets, gut feel, and first-come-first-served.
            The result is inconsistent week to week and hard to justify to boards, donors, and the
            communities affected.
          </p>
          <p style={{ maxWidth: '46rem', color: 'var(--text-muted)' }}>
            This tool turns <strong>what you have + who needs it + a fairness rule you choose</strong>{' '}
            into a repeatable, explainable, metric-backed allocation plan. Every number traces back
            to an input and a rule. It does not decide who deserves help, and it does not replace
            human judgment — it makes the human decision visible and defensible.
          </p>
        </section>

        <section aria-labelledby="previews">
          <h2 id="previews">What you can plan</h2>
          <div className="grid-4">
            {previews.map((p) => (
              <div className="card card-accent" key={p.title}>
                <h3 style={{ marginTop: 0, fontSize: '1.02rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{p.text}</p>
              </div>
            ))}
          </div>
          <p className="hint" style={{ marginTop: '0.75rem' }}>
            All four are loadable as one-click sample scenarios on the Planner page. Sample numbers
            are illustrative.
          </p>
        </section>

        <section aria-labelledby="featured">
          <h2 id="featured">Classical planner first. Quantum experiment second.</h2>
          <div className="grid-2">
            <div className="card card-accent">
              <h3 style={{ marginTop: 0 }}>The planner — practical and classical</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                The working tool is deterministic classical optimization: priority scoring, minimum
                guarantees, caps, constraint handling, and fairness metrics. At this problem size,
                classical methods are exact and instant. That is the part you can actually use.
              </p>
              <Link to="/planner" className="btn btn-small">
                Open the planner
              </Link>
            </div>
            <div className="card card-experimental">
              <h3 style={{ marginTop: 0 }}>
                The quantum section — educational{' '}
                <span className="badge badge-experimental">experimental</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                A small, honest proof-of-concept: three tiny circuits showing how a toy version of
                an allocation tradeoff maps onto quantum hardware (Origin Wukong). It demonstrates
                encoding and workflow. It claims no quantum advantage, because there is none at this
                scale.
              </p>
              <Link to="/quantum" className="btn btn-small">
                See the quantum demo
              </Link>
            </div>
          </div>
        </section>

        <div className="note-box" role="note">
          <strong>Prototype notice:</strong> this is a prototype decision-support tool, not a
          replacement for local expertise or emergency professionals. Sample data is clearly labeled
          throughout.
        </div>
      </main>
    </>
  );
}
