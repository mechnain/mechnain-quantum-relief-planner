import { Link } from 'react-router-dom';
import { usePlanner } from '../state/PlannerContext';
import { diffResults, FAIRNESS_LABELS } from '../lib/planner';
import { ResultsDashboard } from '../components/ResultsDashboard';

export function ResultsPage() {
  const { result, prevResult } = usePlanner();

  if (!result) {
    return (
      <main id="main" className="page page-narrow">
        <p className="kicker">Results</p>
        <h1>No plan calculated yet</h1>
        <p className="lede">
          Set up a scenario on the Planner page — or load a one-click sample — and the allocation
          dashboard will appear here.
        </p>
        <div className="btn-row">
          <Link to="/planner" className="btn btn-primary">
            Go to the Planner
          </Link>
        </div>
      </main>
    );
  }

  const diff = prevResult ? diffResults(prevResult, result) : null;

  return (
    <main id="main" className="page">
      <p className="kicker">Results · computed {new Date(result.computedAt).toLocaleString()}</p>
      <h1>{result.scenario.name}</h1>
      <p className="lede">
        {result.resourceLabel} · rule: {FAIRNESS_LABELS[result.scenario.fairness]} ·{' '}
        {result.locations.length} locations.{' '}
        <Link to="/planner">Edit inputs and recalculate</Link> to compare against this plan.
      </p>
      <hr className="divider" />
      <ResultsDashboard result={result} diff={diff} />
    </main>
  );
}
