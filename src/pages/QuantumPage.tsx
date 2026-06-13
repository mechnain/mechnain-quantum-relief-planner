import { useEffect, useState } from 'react';
import { usePlanner } from '../state/PlannerContext';
import type { QuantumExperimentId, QuantumResultData } from '../types';
import {
  fetchPublishedResults,
  MAXCUT_EDGES,
  MAXCUT_NODES,
  MAXCUT_OPTIMUM,
  QUANTUM_EXPERIMENTS,
  SAMPLE_RESULTS,
} from '../data/quantumSamples';
import { QuantumExperimentCard } from '../components/QuantumExperimentCard';
import { PasteResultsPanel } from '../components/PasteResultsPanel';
import { WarningBanner } from '../components/WarningBanner';

/** Static SVG of the 5-node MaxCut instance, with the optimal split shown by shape + label. */
function MaxCutGraph() {
  // Pentagon layout.
  const cx = 230;
  const cy = 160;
  const R = 115;
  const pos = MAXCUT_NODES.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
  });
  // Optimal bitstring 01100: bit i = group of node i.
  const group = MAXCUT_OPTIMUM.bitstrings[0].split('').map(Number);

  return (
    <figure style={{ margin: '1rem 0' }}>
      <svg
        viewBox="0 0 460 330"
        role="img"
        aria-label={`Graph of five locations: ${MAXCUT_NODES.join(', ')}. Edges mark delivery conflicts with weights. The optimal split puts ${MAXCUT_NODES.filter((_, i) => group[i] === 1).join(' and ')} in delivery group B and the rest in group A, separating conflicts of total weight ${MAXCUT_OPTIMUM.cutValue}.`}
        style={{ width: '100%', maxWidth: '460px', display: 'block' }}
      >
        {MAXCUT_EDGES.map((e) => {
          const a = pos[e.a];
          const b = pos[e.b];
          const cut = group[e.a] !== group[e.b];
          return (
            <g key={`${e.a}-${e.b}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={cut ? 'var(--experimental)' : 'var(--border-strong)'}
                strokeWidth={e.w}
                strokeDasharray={cut ? undefined : '5 4'}
              />
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 5}
                fill="var(--text-faint)"
                fontSize="11"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                w{e.w}
              </text>
            </g>
          );
        })}
        {pos.map((p, i) => (
          <g key={MAXCUT_NODES[i]}>
            {group[i] === 1 ? (
              <rect
                x={p.x - 13}
                y={p.y - 13}
                width={26}
                height={26}
                fill="var(--bg-raised)"
                stroke="var(--experimental)"
                strokeWidth={2}
              />
            ) : (
              <circle cx={p.x} cy={p.y} r={14} fill="var(--bg-raised)" stroke="var(--bronze)" strokeWidth={2} />
            )}
            <text
              x={p.x}
              y={p.y + 4}
              fill="var(--text)"
              fontSize="11"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {i}
            </text>
            <text
              x={p.x}
              y={p.y + (p.y > cy ? 34 : -24)}
              fill="var(--text-muted)"
              fontSize="12"
              textAnchor="middle"
            >
              {MAXCUT_NODES[i]} ({group[i] === 1 ? 'B' : 'A'})
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="hint">
        Circles = delivery group A, squares = group B (the brute-force optimum, bitstring{' '}
        <code>{MAXCUT_OPTIMUM.bitstrings[0]}</code>). Solid violet edges are conflicts the split
        separates; dashed edges stay within a group. Separated conflict weight:{' '}
        {MAXCUT_OPTIMUM.cutValue} of 13 total.
      </figcaption>
      <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
        <table>
          <caption>Edges — what each conflict means</caption>
          <thead>
            <tr>
              <th scope="col">Edge</th>
              <th scope="col" className="num">Weight</th>
              <th scope="col">Conflict</th>
            </tr>
          </thead>
          <tbody>
            {MAXCUT_EDGES.map((e) => (
              <tr key={`${e.a}-${e.b}`}>
                <td className="mono">
                  {MAXCUT_NODES[e.a]} — {MAXCUT_NODES[e.b]}
                </td>
                <td className="num">{e.w}</td>
                <td>{e.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function QuantumPage() {
  const { pastedQuantum } = usePlanner();
  const [published, setPublished] = useState<
    Partial<Record<QuantumExperimentId, QuantumResultData>>
  >({});

  // Real results published with the site (written by quantum/run_experiments.py).
  useEffect(() => {
    let cancelled = false;
    fetchPublishedResults().then((r) => {
      if (!cancelled) setPublished(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main id="main" className="page">
      <p className="kicker">Quantum Demo · Educational</p>
      <h1>
        An honest quantum experiment{' '}
        <span className="badge badge-experimental" style={{ verticalAlign: 'middle' }}>
          experimental
        </span>
      </h1>
      <p className="lede">
        The practical planner on this site uses classical optimization — at the sizes that matter
        for real coordinators, classical methods are exact and instant. This page is a small
        educational demonstration of how tiny versions of planning problems can be represented as
        quantum circuits and run on real hardware (Origin Wukong, 180-qubit class). It does not
        prove quantum advantage, and we do not claim any.
      </p>

      <WarningBanner kind="info">
        <strong>How to read this page:</strong> every measured result below is labeled with its
        source. Real runs arrive two ways: the <code>quantum/run_experiments.py</code> pipeline
        submits these exact circuits to Origin QCloud (simulator or Wukong hardware) and publishes
        the counts with the site, or output can be pasted in the admin panel at the bottom. Until
        either happens, the measured columns show <em>sample data</em> — illustrative numbers in
        the correct format, never a claim about real device behavior. Ideal results come from
        analytic/simulator expectations.
      </WarningBanner>

      <hr className="divider" />

      {QUANTUM_EXPERIMENTS.map((meta) => {
        const samples = SAMPLE_RESULTS[meta.id];
        // Precedence: locally pasted result > result published with the site > bundled sample.
        const measured = pastedQuantum[meta.id] ?? published[meta.id] ?? samples.hardware;
        return (
          <QuantumExperimentCard
            key={meta.id}
            meta={meta}
            ideal={samples.ideal}
            hardware={measured}
          >
            {meta.id === 'maxcut' && (
              <>
                <MaxCutGraph />
                <h4 style={{ margin: '1rem 0 0.3rem' }}>How this relates to resource allocation</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  In the classical planner, constraints like “max total delivery difficulty” force
                  tradeoffs about which locations to serve together. This toy instance is the same
                  kind of decision shrunk to 5 binary variables: split locations into two delivery
                  groups so that conflicting pairs land on different days. Best measured bitstrings
                  to look for: <code>{MAXCUT_OPTIMUM.bitstrings[0]}</code> and{' '}
                  <code>{MAXCUT_OPTIMUM.bitstrings[1]}</code> (the optimum and its mirror — swapping
                  group names gives the same split).
                </p>
              </>
            )}
          </QuantumExperimentCard>
        );
      })}

      <hr className="divider" />
      <PasteResultsPanel />

      <div className="note-box" role="note" style={{ marginTop: '2rem' }}>
        <strong>Position statement:</strong> the quantum section is an educational hardware
        experiment. It demonstrates problem encoding and the run workflow on near-term hardware. It
        does not claim quantum advantage, does not power the planner, and does not scale to
        real-sized problems today. The classical planner is the useful tool; this page is the honest
        peek under the hood of a different technology.
      </div>
    </main>
  );
}
