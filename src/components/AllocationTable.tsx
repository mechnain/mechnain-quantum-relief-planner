import type { PlanResult } from '../types';

export function AllocationTable({ result }: { result: PlanResult }) {
  const sorted = [...result.locations].sort((a, b) => a.rank - b.rank);
  return (
    <div className="table-wrap">
      <table>
        <caption>Recommended allocation — {result.scenario.name}</caption>
        <thead>
          <tr>
            <th scope="col" className="num">Rank</th>
            <th scope="col">Location / group</th>
            <th scope="col" className="num">Urgency</th>
            <th scope="col" className="num">Est. need</th>
            <th scope="col" className="num">Allocated</th>
            <th scope="col" className="num">Coverage</th>
            <th scope="col" className="num">Unmet</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.location.id}>
              <td className="num">#{r.rank}</td>
              <th scope="row" style={{ background: 'transparent', color: 'var(--text)' }}>
                {r.location.name}
              </th>
              <td className="num">{r.location.urgency}/5</td>
              <td className="num">{r.demand}</td>
              <td className="num">
                <strong>{r.allocated}</strong>
              </td>
              <td className="num">{r.included ? `${Math.round(r.coverage * 100)}%` : '—'}</td>
              <td className="num">{r.unmet}</td>
              <td>
                {!r.included ? (
                  <span className="badge">excluded</span>
                ) : r.unmet === 0 ? (
                  <span className="badge badge-real">fully met</span>
                ) : r.allocated >= r.location.minNeeded && r.location.minNeeded > 0 ? (
                  <span className="badge badge-bronze">min met</span>
                ) : (
                  <span className="badge badge-sample">short</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <th scope="row">Total</th>
            <td />
            <td className="num">{result.totalDemand}</td>
            <td className="num">
              <strong>{result.totalAllocated}</strong>
            </td>
            <td className="num">{Math.round(result.coveragePercent)}%</td>
            <td className="num">{result.unmetNeed}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
