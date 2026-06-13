import type { QuantumResultData } from '../types';
import { BarChart } from './BarChart';

/** Chart + accessible table for one measurement-counts distribution. */
export function QuantumCountsChart({
  title,
  data,
  ideal,
}: {
  title: string;
  data: QuantumResultData;
  ideal?: QuantumResultData;
}) {
  const entries = Object.entries(data.counts).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 10);
  const total = entries.reduce((s, [, c]) => s + c, 0) || 1;
  const source = data.source ?? (data.isSample ? 'sample' : 'pasted');
  const sourceLabel =
    source === 'sample' ? 'sample data' : source === 'published' ? 'published run' : 'pasted result';

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span className={`badge ${data.isSample ? 'badge-sample' : 'badge-real'}`}>
          {sourceLabel}
        </span>
        <span className="badge">{data.backend}</span>
        <span className="badge">{data.shots} shots</span>
        <span className="badge">{data.date}</span>
      </div>
      <BarChart
        title={title}
        data={top.map(([bits, count]) => ({
          label: bits,
          value: count,
          reference: ideal?.counts[bits],
          valueText: `${count} (${((count / total) * 100).toFixed(1)}%)`,
          tone: 'violet' as const,
        }))}
      />
      <details style={{ marginTop: '0.75rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Full measurement counts table
        </summary>
        <div className="table-wrap" style={{ marginTop: '0.5rem' }}>
          <table>
            <caption>{title} — measurement counts</caption>
            <thead>
              <tr>
                <th scope="col">Bitstring</th>
                <th scope="col" className="num">Count</th>
                <th scope="col" className="num">Frequency</th>
                {ideal && <th scope="col" className="num">Ideal count</th>}
              </tr>
            </thead>
            <tbody>
              {entries.map(([bits, count]) => (
                <tr key={bits}>
                  <td className="mono">{bits}</td>
                  <td className="num">{count}</td>
                  <td className="num">{((count / total) * 100).toFixed(1)}%</td>
                  {ideal && <td className="num">{ideal.counts[bits] ?? 0}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {data.notes && (
        <p className="hint" style={{ marginTop: '0.6rem' }}>
          {data.notes}
        </p>
      )}
    </div>
  );
}
