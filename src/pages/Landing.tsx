import { Link } from 'react-router-dom';
import { PlainTerms } from '../components/PlainTerms';

const previews = [
  {
    glyph: '▣',
    title: 'Food bank allocation',
    text: 'Split 300 weekly boxes across five pantries that each have different demand, urgency, and route difficulty.',
  },
  {
    glyph: '❄',
    title: 'Winter clothing distribution',
    text: '400 clothing kits across six shelters, guaranteeing each a minimum before topping up the rest.',
  },
  {
    glyph: '✎',
    title: 'School supply planning',
    text: '2,500 supply kits across four schools, aiming for even coverage per student.',
  },
  {
    glyph: '⚐',
    title: 'Volunteer route support',
    text: '24 Saturday volunteers across six sites, limited to five stops and the easier routes.',
  },
];

const steps = [
  {
    title: 'Tell it what you have',
    text: 'The resource, how many units, and any limits on stops or delivery effort.',
  },
  {
    title: 'List who needs it',
    text: 'Each location’s people affected, urgency, delivery difficulty, and a sensible min and max.',
  },
  {
    title: 'Pick a fairness rule',
    text: 'Treat everyone evenly, favour the most urgent, cover the biggest need first — your call.',
  },
  {
    title: 'Get an explained plan',
    text: 'A clear allocation with fairness scores and a plain-English reason for every number.',
  },
];

export function Landing() {
  return (
    <>
      <div className="hero">
        <div className="page" style={{ paddingTop: 0, paddingBottom: '1.5rem' }}>
          <p className="kicker">Mechnain Labs · Public-impact tooling · Prototype</p>
          <h1 style={{ maxWidth: '16ch' }}>Plan limited resources fairly.</h1>
          <p className="lede">
            A public-impact planning tool for sharing out supplies, volunteers, and delivery
            capacity across communities — when there is never quite enough to go around.
          </p>
          <div className="btn-row">
            <Link to="/planner" className="btn btn-primary">
              Start Planning →
            </Link>
            <Link to="/quantum" className="btn">
              View Quantum Demo
            </Link>
          </div>
          <p style={{ color: 'var(--text-muted)', maxWidth: '44rem' }}>
            The planner does its real work with transparent, ordinary maths — no black box. A
            separate, clearly-labelled section shows how a tiny version of the same problem can be
            run on real quantum hardware, purely to learn from.
          </p>
        </div>
      </div>

      <main id="main">
        <div className="page" style={{ paddingBottom: '1rem' }}>
          <section aria-labelledby="mission">
            <p className="kicker">Why it exists</p>
            <h2 id="mission">The weekly question every coordinator knows</h2>
            <p style={{ maxWidth: '46rem', color: 'var(--text-muted)' }}>
              <em>“We have X units and more places that need them than X can cover. How do we split
              it — and how do we explain that split to everyone affected?”</em> Today that decision
              usually lives in a spreadsheet and a gut feeling. It comes out different every week,
              and it is hard to defend to a board, a donor, or the community.
            </p>
            <PlainTerms>
              You bring the supplies and the list of who needs them. This tool turns that into a
              fair, repeatable plan in seconds — and, just as importantly, <strong>tells you why</strong>{' '}
              each place got what it got, so you can stand behind the decision.
            </PlainTerms>
          </section>
        </div>

        <div className="band">
          <div className="page">
            <section aria-labelledby="how">
              <p className="kicker">How it works</p>
              <h2 id="how">Four steps, no jargon</h2>
              <ol className="steps">
                {steps.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{s.text}</span>
                  </li>
                ))}
              </ol>
              <Link to="/planner" className="btn btn-primary">
                Try it with a sample scenario →
              </Link>
            </section>
          </div>
        </div>

        <div className="page">
          <section aria-labelledby="previews">
            <p className="kicker">What you can plan</p>
            <h2 id="previews">Built for real, everyday scarcity</h2>
            <div className="grid-4">
              {previews.map((p) => (
                <div className="card card-accent card-hover" key={p.title}>
                  <div className="feature-icon-row">
                    <span className="glyph" aria-hidden="true">
                      {p.glyph}
                    </span>
                  </div>
                  <h3 style={{ marginTop: 0, fontSize: '1.05rem' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{p.text}</p>
                </div>
              ))}
            </div>
            <p className="hint" style={{ marginTop: '0.85rem' }}>
              All four load as one-click examples on the Planner page. The numbers are illustrative.
            </p>
          </section>

          <div className="divider-ornament" role="separator" aria-hidden="true">
            <span />
          </div>

          <section aria-labelledby="featured">
            <p className="kicker">Two layers, never confused</p>
            <h2 id="featured">Classical planner first. Quantum experiment second.</h2>
            <div className="grid-2">
              <div className="card card-accent">
                <div className="feature-icon-row">
                  <span className="glyph" aria-hidden="true">
                    ◆
                  </span>
                  <h3 style={{ margin: 0 }}>The planner — the useful part</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Ordinary, exact maths: priority scoring, minimum guarantees, caps, and fairness
                  measures. At the sizes a coordinator actually deals with, this is instant and
                  optimal. This is the part you can rely on.
                </p>
                <Link to="/planner" className="btn btn-small">
                  Open the planner
                </Link>
              </div>
              <div className="card card-experimental">
                <div className="feature-icon-row">
                  <span className="glyph glyph-violet" aria-hidden="true">
                    ⚛
                  </span>
                  <h3 style={{ margin: 0 }}>
                    The quantum demo{' '}
                    <span className="badge badge-experimental">experimental</span>
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  A small, honest experiment showing how a toy version of the problem maps onto real
                  quantum hardware (Origin Wukong). It teaches the idea. It claims no advantage —
                  because at this scale there isn’t one, and we say so.
                </p>
                <Link to="/quantum" className="btn btn-small">
                  See the quantum demo
                </Link>
              </div>
            </div>
          </section>

          <div className="note-box" role="note">
            <strong>A note on what this is.</strong> This is a prototype to support a decision, not
            replace one. It is not a substitute for local expertise or emergency professionals, and
            sample data is labelled clearly throughout.
          </div>
        </div>
      </main>
    </>
  );
}
