import { Link } from 'react-router-dom';
import { CaseStudySection } from '../components/CaseStudySection';
import { PlainTerms } from '../components/PlainTerms';

export function CaseStudyPage() {
  let n = 0;
  const next = () => ++n;
  return (
    <main id="main" className="page page-narrow">
      <p className="kicker">Mechnain Labs · Case Study</p>
      <h1>Fair allocation, classical and reliable — with an honest peek at quantum hardware</h1>
      <p className="lede">
        How we built a working public-impact planning tool, then used it as a transparent vehicle to
        show what near-term quantum hardware can and cannot do.
      </p>
      <PlainTerms label="The short version" glyph="❝">
        We built a genuinely useful tool for sharing out scarce supplies fairly — then bolted on a
        small, honest quantum experiment beside it to show what today’s quantum computers really can
        and can’t do. The useful part is ordinary maths. The quantum part is a teaching exhibit. We
        never blur the line between them.
      </PlainTerms>

      <hr className="divider" />

      <CaseStudySection index={next()} title="Summary">
        <p>
          The Mechnain Quantum Relief Planner is a browser-based tool that helps small organizations
          split a limited resource — food boxes, clothing kits, volunteer slots — across locations
          using an explicit, user-chosen fairness rule. The allocation engine is deterministic
          classical optimization: priority scoring, minimum guarantees, caps, constraint handling,
          and fairness metrics, all computed instantly in the browser. Alongside it sits a clearly
          labeled educational quantum section that encodes a 5-variable toy version of the
          allocation tradeoff as a MaxCut problem for QAOA on Origin Wukong-class hardware. The
          planner is the product. The quantum section is the experiment. We keep those two sentences
          in that order everywhere.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Problem statement">
        <p>
          Small organizations face a recurring decision: <em>we have X units and N places that need
          more than X combined.</em> Today that split is made by gut feel, first-come-first-served, or
          a hand-built spreadsheet. The result is inconsistent between weeks and between people,
          hard to justify to boards and donors, and leaves no record of why a given allocation was
          chosen. There is rarely a fairness metric at all — “fair” is asserted, not measured.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Why fair resource allocation is hard">
        <ul>
          <li>
            <strong>Fairness is plural.</strong> “Equal coverage everywhere,” “urgent locations
            first,” and “biggest need first” are all defensible rules that produce different plans.
            A tool cannot pick the right one; it can only apply a chosen one consistently.
          </li>
          <li>
            <strong>Constraints interact.</strong> Minimum guarantees, maximum useful amounts, stop
            limits, and delivery capacity each look simple alone; together they create tradeoffs
            that manual spreadsheets get wrong at the edges (especially rounding).
          </li>
          <li>
            <strong>Decisions need receipts.</strong> The people affected deserve an explanation
            better than “that's what we decided.” Reconstructing reasoning after the fact rarely
            works; it has to be generated with the plan.
          </li>
        </ul>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Who this helps">
        <p>
          Food bank and pantry coordinators, small nonprofit operations managers, mutual aid
          organizers, school supply coordinators, volunteer coordinators, and small-scale relief
          logistics leads. The shared profile: they manage scarcity weekly, work in spreadsheets,
          and are accountable to boards, donors, and communities for decisions they need to justify.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="How the planner works">
        <p>
          The user describes the scenario: resource type, total units, and for each location a name,
          people affected, urgency (1–5), delivery difficulty (1–5), minimum needed, and maximum
          useful units. They pick one of five fairness preferences and optionally cap the number of
          stops or total delivery difficulty. The engine estimates each location's need, scores and
          ranks locations, allocates whole units deterministically, and returns the plan with
          per-location plain-English explanations, warnings, and fairness metrics. Same inputs, same
          plan, every time.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Classical optimization method">
        <p>
          Need is estimated from people affected (adjusted by a per-resource ratio) and clamped
          between the location's minimum and maximum. A weighted priority score combines normalized
          urgency, need, and delivery difficulty; the weights depend on the chosen fairness rule.
          If supply covers all minimums, minimums are satisfied first and the remainder is split by
          priority-weighted proportional shares with largest-remainder rounding, capped at each
          location's maximum. If supply cannot cover minimums, the tool switches to explicit
          rationing: proportional to urgency-weighted minimum need, and says so plainly. Constraint
          filters (max stops, difficulty budget) keep the highest-priority locations. The full
          formulas are on the <Link to="/methods">Methods page</Link>.
        </p>
        <p>
          A deliberate property: at this problem size — dozens of locations — these methods are
          exact and run in milliseconds. There is no performance problem here for quantum computing
          to solve, and the product copy says exactly that.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Fairness metrics">
        <p>
          Each plan reports a <strong>fairness score</strong> (Jain's index over per-location
          coverage: 1.00 when every served location reaches the same share of its need),{' '}
          <strong>urgency coverage</strong> (the share of high-urgency need the plan covers),
          per-location coverage percentages, and total unmet need. None of these declares a plan
          “objectively fair” — they measure the consequences of the rule the user chose, so the
          choice can be debated openly.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Quantum experiment layer">
        <p>
          The quantum section runs three small experiments: (A) measurement randomness as a
          transparent tie-breaker, (B) a GHZ correlation circuit that makes hardware noise visible
          and quantifiable, and (C) a 5-node MaxCut instance — locations as nodes, delivery
          conflicts as weighted edges — encoded for QAOA at depth p=1. Experiment C is the bridge to
          the planner: the same kind of grouping tradeoff the classical engine handles with a
          difficulty budget, shrunk to five binary variables so it fits honest near-term hardware.
          The brute-force optimum (32 candidates) is always computed classically and displayed next
          to the measured histogram.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Origin Wukong 180 hardware results">
        <p>
          This section is populated from real device output only. The app ships with clearly labeled
          sample data in the correct format; when a run completes on Origin Wukong, its JSON
          (counts, shots, backend, date, notes, limitations) is pasted into the demo page's admin
          panel and replaces the samples, labeled as a pasted result with the metadata provided.
          We do not fabricate device metadata, and we never present simulator output as hardware.
          Until real runs are pasted, every hardware panel on the{' '}
          <Link to="/quantum">Quantum Demo page</Link> carries a visible “sample data” badge.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="What this proves">
        <ul>
          <li>A genuinely useful fairness tool can be built with transparent classical methods and no server.</li>
          <li>A real allocation tradeoff can be encoded as a QUBO/Ising problem and expressed as a QAOA circuit that near-term hardware accepts.</li>
          <li>Honest side-by-side comparison — hardware histogram vs brute-force optimum — is practical and instructive, including when the hardware misses.</li>
        </ul>
      </CaseStudySection>

      <CaseStudySection index={next()} title="What this does not prove">
        <ul>
          <li>It does not prove quantum advantage of any kind — speed, quality, or otherwise.</li>
          <li>It does not show that quantum methods scale to real allocation problems. Five binary variables is a toy by construction.</li>
          <li>It does not show that the planner's recommendations are “correct” — they are consistent applications of a chosen rule, which is a different and humbler claim.</li>
        </ul>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Limitations">
        <ul>
          <li>Need estimation is a planning heuristic (people affected × a per-resource ratio, clamped). Real need is messier.</li>
          <li>Urgency and difficulty are subjective 1–5 inputs; the output inherits their bias.</li>
          <li>Single resource per plan; no multi-day routing, perishability, or storage modeling.</li>
          <li>The constraint handling is greedy-by-priority, which is transparent but not always globally optimal for the stop-selection subproblem.</li>
          <li>Data persists only in the local browser; there are no accounts or sync.</li>
        </ul>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Ethical note">
        <p>
          Allocation tools touch real people. This one is built to make a human-chosen rule visible
          and consistent — not to launder a hard moral decision through software. It does not decide
          who deserves help, must not override local knowledge or legal duties, and is not suitable
          for emergency dispatch. Anyone using it should treat the output as a starting draft for a
          human conversation, and the fairness rule itself as the real decision.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Future upgrades">
        <ul>
          <li>CSV import/export of locations and side-by-side comparison of fairness rules.</li>
          <li>Locked allocations (pin a location, redistribute the rest) and reserve buffers.</li>
          <li>Live submission to Origin Wukong with queue status and device metadata read from the backend at run time.</li>
          <li>Multi-resource plans and recurring-week tracking.</li>
        </ul>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Technical stack">
        <p>
          React + TypeScript, built with Vite. The allocation engine, fairness metrics, and quantum
          sample data are dependency-free pure TypeScript modules, separated from the UI. State
          persists in browser local storage. No backend, no accounts, no external APIs, no AI
          services — the planner is deterministic logic, fully inspectable.
        </p>
      </CaseStudySection>

      <CaseStudySection index={next()} title="Final reflection">
        <p>
          The tempting version of this project says “quantum-powered relief planning.” The true
          version is less glamorous and more useful: classical methods solve this problem completely
          at the sizes that matter, and today's quantum hardware can run a tiny, honest demonstration
          of how such problems are encoded. Building both — and labeling each for what it is —
          turned out to be the more interesting engineering exercise, and the only version we would
          put our name on.
        </p>
      </CaseStudySection>
    </main>
  );
}
