import { MethodExplanation } from '../components/MethodExplanation';

export function MethodsPage() {
  return (
    <main id="main" className="page page-narrow">
      <p className="kicker">Methods · Transparency</p>
      <h1>How every number is calculated</h1>
      <p className="lede">
        The planner is deterministic: the same inputs always produce the same plan. This page spells
        out each formula in simple language so any allocation can be checked by hand.
      </p>
      <hr className="divider" />

      <MethodExplanation
        title="Estimated need"
        formula={`estimatedNeed = clamp(peopleAffected × resourceRatio,\n                     minimumNeeded, maximumUseful)`}
      >
        <p>
          People affected is converted to units with a rough per-resource ratio (for example, food
          boxes assume ~1 box per household of 3; clothing kits assume 1 per person; volunteers
          assume ~1 per 25 people served). The result is clamped so it never falls below the minimum
          you set or above the maximum useful amount. Your min/max bounds always win over the
          ratio — they encode your local knowledge.
        </p>
      </MethodExplanation>

      <MethodExplanation
        title="Priority score"
        formula={`score = U×(urgency/5) + N×(need/largestNeed) − D×(difficulty/5)\n\nBalanced:                U=0.45  N=0.35  D=0.20\nPrioritize urgency:      U=0.65  N=0.25  D=0.10\nPrioritize largest need: U=0.30  N=0.60  D=0.10\nEasier delivery:         U=0.35  N=0.25  D=0.40\nEqual distribution:      scores only order leftover units`}
      >
        <p>
          Urgency, need, and delivery difficulty are each scaled to 0–1, then combined with weights
          set by your fairness preference. Higher urgency and need raise the score; higher delivery
          difficulty lowers it. The score determines each location's rank and its share of the
          supply that remains after minimums are met.
        </p>
      </MethodExplanation>

      <MethodExplanation
        title="Allocation procedure"
        formula={`1. Apply constraints (max stops, difficulty budget) keeping top-ranked locations
2. If supply ≥ sum of minimums:
     give every selected location its minimum
     split the remainder by priority-weighted proportional shares
     (equal-distribution rule: proportional to need instead)
     round with the largest-remainder method; never exceed maximumUseful
3. If supply < sum of minimums:
     split everything in proportion to (minimumNeeded × urgency)
     capped at each minimum — and warn that this is rationing`}
      >
        <p>
          Whole units only — fractional allocations are rounded with the largest-remainder method so
          the total always adds up exactly. If some locations hit their maximum useful amount,
          freed-up units flow to the others; anything left when everyone is capped is reported as
          reserve.
        </p>
      </MethodExplanation>

      <MethodExplanation
        title="Fairness score (Jain's index)"
        formula={`coverage_i = allocated_i / estimatedNeed_i   (capped at 1)\nfairness = (Σ coverage)² / (n × Σ coverage²)`}
      >
        <p>
          A standard equality measure over per-location coverage. It equals 1.00 when every served
          location reaches the same share of its need, and falls toward 1/n as coverage becomes
          concentrated in fewer locations. Important: it measures <em>evenness of the chosen rule's
          outcome</em>, not moral correctness. A plan that deliberately prioritizes urgency will —
          and should — score below 1.00.
        </p>
      </MethodExplanation>

      <MethodExplanation
        title="Urgency coverage"
        formula={`urgencyCoverage = allocated_to_high_urgency / need_of_high_urgency\n(high urgency = locations rated 4–5; falls back to 3+ if none)`}
      >
        <p>
          Answers “did the most urgent places actually get covered?” independently of the overall
          numbers. A plan can have high total coverage and still leave urgent locations short — this
          metric exposes that.
        </p>
      </MethodExplanation>

      <MethodExplanation
        title="Unmet need and coverage"
        formula={`unmet_i = max(0, estimatedNeed_i − allocated_i)\ncoverage% = totalAllocated / totalEstimatedNeed × 100`}
      >
        <p>
          Unmet need is the gap this plan leaves, in units, per location and in total. It is the
          number to bring to a board or donor conversation: “we need this many more units to close
          the gap.”
        </p>
      </MethodExplanation>

      <MethodExplanation
        title="Constraints"
        formula={`maxStops: serve only the top-K locations by priority rank\nmaxTotalDifficulty: walk locations in rank order, include while\n                    Σ difficulty stays within the budget`}
      >
        <p>
          Both constraints filter locations <em>before</em> allocation, keeping the highest-priority
          ones. Excluded locations are listed explicitly with the reason — they never silently
          disappear. This greedy-by-priority selection is transparent and predictable, though for
          the stop-selection subproblem it is not guaranteed to be globally optimal in every case.
        </p>
      </MethodExplanation>

      <MethodExplanation title="Limitations of the model">
        <ul>
          <li>Need estimation is a heuristic; the per-resource ratios are planning conventions, not measurements.</li>
          <li>Urgency and difficulty ratings are subjective inputs. The output inherits whatever bias they contain.</li>
          <li>One resource per plan; no routing, scheduling, perishability, or storage modeling.</li>
          <li>The fairness score measures evenness only — it cannot tell you whether the rule itself is the right one for your community.</li>
        </ul>
      </MethodExplanation>

      <MethodExplanation title="Why human judgment still matters">
        <p>
          The planner applies a rule consistently and shows its consequences. It cannot know that
          one shelter just lost a freezer, that a school has a parent group covering part of its
          need, or that a community was shorted last month and is owed catch-up. Choosing the
          fairness rule, sanity-checking the inputs, and overriding the output when reality
          disagrees are human responsibilities by design. Treat every plan as a defensible draft,
          not a verdict.
        </p>
      </MethodExplanation>

      <div className="note-box" role="note">
        <strong>Honesty notes.</strong> The planner is a prototype decision-support tool — not a
        replacement for local knowledge, emergency professionals, or official response systems.
        Practical recommendations are generated using classical optimization logic. The quantum
        section is an educational hardware experiment and does not claim quantum advantage. Sample
        results are clearly labeled unless real Origin Wukong results are pasted.
      </div>
    </main>
  );
}
