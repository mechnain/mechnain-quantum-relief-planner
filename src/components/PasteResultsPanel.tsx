import { useState } from 'react';
import { usePlanner } from '../state/PlannerContext';
import { parsePastedResult, PASTE_TEMPLATE } from '../data/quantumSamples';
import { WarningBanner } from './WarningBanner';

/** Admin/dev panel: paste real Origin Wukong JSON results to replace the sample data. */
export function PasteResultsPanel() {
  const { pastedQuantum, setPastedQuantumResult, clearPastedQuantum } = usePlanner();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const pastedCount = Object.keys(pastedQuantum).length;

  const handleApply = () => {
    setError(null);
    setOk(null);
    try {
      const parsed = parsePastedResult(text);
      setPastedQuantumResult(parsed);
      setOk(
        `Applied: "${parsed.experiment}" — ${parsed.shots} shots on ${parsed.backend}. The experiment card above now shows this result, stored in your browser's local storage.`,
      );
      setText('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not parse the pasted JSON.');
    }
  };

  return (
    <section className="card card-experimental" aria-labelledby="paste-panel-title">
      <h3 id="paste-panel-title" style={{ marginTop: 0 }}>
        Paste Wukong results <span className="badge badge-experimental">admin / dev</span>
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        When a real run completes on Origin Wukong, paste its JSON here. The matching experiment
        card switches from sample data to the pasted result (stored locally, never uploaded). Format:
      </p>
      <pre
        className="mono"
        style={{
          background: 'var(--bg-inset)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '0.8rem 1rem',
          overflowX: 'auto',
          fontSize: '0.8rem',
        }}
      >
        {PASTE_TEMPLATE}
      </pre>
      <div className="field">
        <label htmlFor="paste-json">Result JSON</label>
        <textarea
          id="paste-json"
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{"experiment": "maxcut", "shots": 1000, "backend": "Origin Wukong", "counts": { ... }}'
          spellCheck={false}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
        />
      </div>
      <div className="btn-row" style={{ margin: '0.5rem 0' }}>
        <button type="button" className="btn btn-primary btn-small" onClick={handleApply} disabled={!text.trim()}>
          Apply pasted result
        </button>
        {pastedCount > 0 && (
          <button type="button" className="btn btn-small btn-danger" onClick={clearPastedQuantum}>
            Clear pasted results ({pastedCount}) — revert to samples
          </button>
        )}
      </div>
      <div aria-live="polite">
        {error && <WarningBanner kind="error">{error}</WarningBanner>}
        {ok && <WarningBanner kind="info">{ok}</WarningBanner>}
      </div>
      <p className="hint">
        Honesty rule: only paste genuine device output. Pasted results are labeled “pasted result”
        with whatever backend name you provide — never fabricate hardware metadata.
      </p>
    </section>
  );
}
