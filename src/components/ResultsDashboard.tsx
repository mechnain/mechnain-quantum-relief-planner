import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PlanResult, ResultDiff } from '../types';
import { FAIRNESS_LABELS } from '../lib/planner';
import { AllocationTable } from './AllocationTable';
import { LocationResultCard } from './LocationResultCard';
import { FairnessScoreCard } from './FairnessScoreCard';
import { BarChart } from './BarChart';
import { WarningBanner } from './WarningBanner';
import { PlainTerms } from './PlainTerms';

interface Props {
  result: PlanResult;
  diff: ResultDiff | null;
}

function Delta({
  value,
  digits = 0,
  suffix = '',
  badWhenUp = false,
}: {
  value: number;
  digits?: number;
  suffix?: string;
  /** Set for metrics where an increase is undesirable (e.g., unmet need). */
  badWhenUp?: boolean;
}) {
  const text = `${value > 0 ? '+' : ''}${value.toFixed(digits)}${suffix}`;
  const good = badWhenUp ? value < 0 : value > 0;
  const cls = value === 0 ? 'delta-zero' : good ? 'delta-up' : 'delta-down';
  return <span className={cls}>{text}</span>;
}

export function ResultsDashboard({ result, diff }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const unit = result.unit;
  const sorted = [...result.locations].sort((a, b) => a.rank - b.rank);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setCopied('failed');
    }
  };

  const summaryText = [
    `${result.scenario.name} — allocation plan (Mechnain Quantum Relief Planner, prototype)`,
    `Rule: ${FAIRNESS_LABELS[result.scenario.fairness]} · Resource: ${result.resourceLabel} · Computed: ${new Date(result.computedAt).toLocaleString()}`,
    '',
    ...sorted.map(
      (r) =>
        `#${r.rank} ${r.location.name}: ${r.allocated} ${unit} (need ${r.demand}, coverage ${Math.round(r.coverage * 100)}%)${r.included ? '' : ' [excluded by constraints]'}`,
    ),
    '',
    result.summary,
  ].join('\n');

  return (
    <div>
      {/* Summary stats */}
      <div className="grid-4" role="group" aria-label="Summary statistics">
        <div className="stat">
          <span className="stat-label">Allocated</span>
          <span className="stat-value">
            {result.totalAllocated}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-faint)', fontWeight: 400 }}>
              {' '}/ {Math.floor(result.scenario.totalUnits)} {unit}
            </span>
          </span>
          <span className="stat-detail">
            {result.unitsLeftOver > 0 ? `${result.unitsLeftOver} ${unit} left in reserve` : 'all units assigned'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Overall coverage</span>
          <span className="stat-value">{Math.round(result.coveragePercent)}%</span>
          <span className="stat-detail">of {result.totalDemand} {unit} estimated total need</span>
        </div>
        <div className="stat">
          <span className="stat-label">Unmet need</span>
          <span className="stat-value" style={{ color: result.unmetNeed > 0 ? 'var(--warn)' : 'var(--ok)' }}>
            {result.unmetNeed}
          </span>
          <span className="stat-detail">{unit} not covered by this plan</span>
        </div>
        <div className="stat">
          <span className="stat-label">Locations served</span>
          <span className="stat-value">
            {result.locations.filter((r) => r.included && r.allocated > 0).length}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-faint)', fontWeight: 400 }}>
              {' '}/ {result.locations.length}
            </span>
          </span>
          <span className="stat-detail">
            {result.locations.filter((r) => r.included && r.unmet === 0).length} fully met
          </span>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.map((w) => (
        <WarningBanner key={w}>{w}</WarningBanner>
      ))}

      {/* Fairness indicators */}
      <h2>Fairness &amp; coverage indicators</h2>
      <PlainTerms label="Reading these scores">
        The <strong>fairness score</strong> asks “did everyone get a similar share of what they
        needed?” — 1.00 means perfectly even. <strong>Urgency coverage</strong> asks “did the most
        urgent places get looked after?” Neither is a grade for the plan; they just show what your
        chosen rule actually did, so you can decide if it feels right.
      </PlainTerms>
      <div className="grid-2">
        <FairnessScoreCard
          label="Fairness score (Jain index)"
          value={result.fairnessScore}
          description="1.00 means every served location reaches the same share of its estimated need. Lower values mean coverage is uneven."
        />
        <FairnessScoreCard
          label="Urgency coverage"
          value={result.urgencyCoverage}
          description="Share of estimated need at the highest-urgency locations that this plan covers."
        />
      </div>

      {/* Allocation table */}
      <h2>Recommended allocation</h2>
      <AllocationTable result={result} />

      {/* Charts */}
      <h2>Charts</h2>
      <div className="grid-2">
        <div className="card">
          <BarChart
            title={`Allocation (${unit})`}
            data={sorted.map((r) => ({
              label: r.location.name,
              value: r.allocated,
              valueText: `${r.allocated} ${unit}`,
            }))}
          />
        </div>
        <div className="card">
          <BarChart
            title="Need vs allocation"
            data={sorted.map((r) => ({
              label: r.location.name,
              value: r.allocated,
              reference: r.demand,
              valueText: `${r.allocated} of ${r.demand}`,
            }))}
          />
          <p className="hint">Gray bar = estimated need · bronze bar = allocated.</p>
        </div>
      </div>

      {/* Per-location cards */}
      <h2>Location details &amp; reasoning</h2>
      <div className="location-card-grid">
        {sorted.map((r) => (
          <LocationResultCard key={r.location.id} result={r} unit={unit} />
        ))}
      </div>

      {/* Summary */}
      <h2>Summary</h2>
      <div className="card card-accent">
        <p style={{ margin: 0 }}>{result.summary}</p>
      </div>
      <div className="note-box">
        The planner is a prototype decision-support tool. It is not a replacement for local
        knowledge, emergency professionals, or official response systems. Recommendations are
        generated with transparent classical optimization — see the{' '}
        <Link to="/methods">Methods page</Link> for every formula used.
      </div>

      {/* What changed */}
      <h2>What changed?</h2>
      {diff && diff.anyChange ? (
        <div className="card">
          <div className="grid-3" style={{ marginBottom: '1rem' }}>
            <div className="stat">
              <span className="stat-label">Fairness score</span>
              <span className="stat-value">
                <Delta value={diff.fairnessDelta} digits={2} />
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Unmet need</span>
              <span className="stat-value">
                <Delta value={diff.unmetDelta} suffix={` ${unit}`} badWhenUp />
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Overall coverage</span>
              <span className="stat-value">
                <Delta value={diff.coverageDelta} digits={1} suffix=" pts" />
              </span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <caption>Changes vs previous calculation</caption>
              <thead>
                <tr>
                  <th scope="col">Location</th>
                  <th scope="col" className="num">Before</th>
                  <th scope="col" className="num">Now</th>
                  <th scope="col" className="num">Change</th>
                  <th scope="col" className="num">Rank</th>
                </tr>
              </thead>
              <tbody>
                {diff.locationChanges.map((c) => (
                  <tr key={c.name}>
                    <th scope="row" style={{ background: 'transparent', color: 'var(--text)' }}>{c.name}</th>
                    <td className="num">{c.prevAllocated}</td>
                    <td className="num">{c.newAllocated}</td>
                    <td className="num">
                      <Delta value={c.delta} suffix={` ${unit}`} />
                    </td>
                    <td className="num">
                      {c.prevRank !== null && c.prevRank !== c.newRank
                        ? `#${c.prevRank} → #${c.newRank}`
                        : `#${c.newRank ?? '—'}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : diff ? (
        <WarningBanner kind="info">
          No change from the previous calculation — same allocations, fairness score, and ranking.
        </WarningBanner>
      ) : (
        <WarningBanner kind="info">
          This is the first calculation in this session. Edit inputs on the Planner page and
          recalculate to see a comparison here.
        </WarningBanner>
      )}

      {/* Export */}
      <h2>Export</h2>
      <div className="btn-row" aria-live="polite">
        <button type="button" className="btn" onClick={() => window.print()}>
          Export PDF (via print)
        </button>
        <button type="button" className="btn" onClick={() => copy('summary', summaryText)}>
          {copied === 'summary' ? 'Copied ✓' : 'Copy summary'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => copy('plan', JSON.stringify(result.scenario, null, 2))}
        >
          {copied === 'plan' ? 'Copied ✓' : 'Share plan (copy JSON)'}
        </button>
        <span className="badge badge-sample" style={{ alignSelf: 'center' }}>
          prototype features
        </span>
      </div>
      <p className="hint">
        “Export PDF” uses your browser’s print-to-PDF. “Share plan” copies the scenario as JSON so a
        colleague can paste it back later — shareable links are not implemented in this prototype.
        {copied === 'failed' && ' Clipboard access was blocked by the browser.'}
      </p>
    </div>
  );
}
