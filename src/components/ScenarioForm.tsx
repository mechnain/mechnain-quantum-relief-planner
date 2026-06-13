import { useRef, useState } from 'react';
import type { FairnessPreference, ResourceType, Scenario } from '../types';
import { FAIRNESS_LABELS, RESOURCE_META, resourceUnit, validateScenario } from '../lib/planner';
import { SAMPLE_SCENARIOS, emptyLocation } from '../data/sampleScenarios';
import { LocationInputCard } from './LocationInputCard';
import { WarningBanner } from './WarningBanner';

interface Props {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
  onSubmit: (s: Scenario) => void;
}

const FAIRNESS_HINTS: Record<FairnessPreference, string> = {
  balanced: 'Weighs urgency, need, and delivery difficulty evenly. A sensible default.',
  urgency: 'High-urgency locations pull a larger share of the remaining supply.',
  equal: 'Aims for even coverage of estimated need everywhere; leftovers go to higher urgency.',
  'largest-need': 'Locations with the most estimated need pull a larger share.',
  'easier-delivery': 'Penalizes hard-to-reach locations more; useful when logistics are the bottleneck.',
};

let locCounter = 100;

export function ScenarioForm({ scenario, onChange, onSubmit }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const unit = resourceUnit(scenario);
  const set = (patch: Partial<Scenario>) => onChange({ ...scenario, ...patch });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const problems = validateScenario(scenario);
    setErrors(problems);
    if (problems.length === 0) {
      onSubmit(scenario);
    } else {
      // Move focus to the error list so keyboard and screen-reader users land on it.
      setTimeout(() => errorRef.current?.focus(), 0);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend>Sample scenarios</legend>
        <p className="hint" style={{ marginTop: 0 }}>
          Load a realistic example with one click, then edit anything. All sample numbers are
          illustrative.
        </p>
        <div className="btn-row" style={{ margin: '0.5rem 0 0' }}>
          {SAMPLE_SCENARIOS.map((s) => (
            <button
              key={s.key}
              type="button"
              className="btn btn-small"
              onClick={() => {
                setErrors([]);
                onChange(structuredClone(s.scenario));
              }}
            >
              {s.buttonLabel}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Scenario</legend>
        <div className="field-row">
          <div className="field">
            <label htmlFor="scenario-name">Scenario name *</label>
            <input
              id="scenario-name"
              type="text"
              value={scenario.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="e.g., December coat drive"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="resource-type">Resource type *</label>
            <select
              id="resource-type"
              value={scenario.resourceType}
              onChange={(e) => set({ resourceType: e.target.value as ResourceType })}
            >
              {(Object.keys(RESOURCE_META) as ResourceType[]).map((k) => (
                <option key={k} value={k}>
                  {RESOURCE_META[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {scenario.resourceType === 'custom' && (
          <div className="field">
            <label htmlFor="custom-label">Custom resource name *</label>
            <input
              id="custom-label"
              type="text"
              value={scenario.customResourceLabel}
              onChange={(e) => set({ customResourceLabel: e.target.value })}
              placeholder="e.g., hygiene kits"
            />
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label htmlFor="total-units">Total available units ({unit}) *</label>
            <input
              id="total-units"
              type="number"
              min={1}
              value={scenario.totalUnits}
              onChange={(e) => set({ totalUnits: Number(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="fairness">Fairness preference *</label>
            <select
              id="fairness"
              value={scenario.fairness}
              onChange={(e) => set({ fairness: e.target.value as FairnessPreference })}
              aria-describedby="fairness-hint"
            >
              {(Object.keys(FAIRNESS_LABELS) as FairnessPreference[]).map((k) => (
                <option key={k} value={k}>
                  {FAIRNESS_LABELS[k]}
                </option>
              ))}
            </select>
            <p className="hint" id="fairness-hint">
              {FAIRNESS_HINTS[scenario.fairness]}
            </p>
          </div>
        </div>
        <p className="hint">
          Need is estimated from people affected ({RESOURCE_META[scenario.resourceType].ratioNote})
          and clamped between each location’s minimum and maximum. Details on the Methods page.
        </p>
      </fieldset>

      <fieldset>
        <legend>Optional constraints</legend>
        <div className="field-row">
          <div className="field">
            <label htmlFor="max-stops">Max stops</label>
            <input
              id="max-stops"
              type="number"
              min={1}
              value={scenario.maxStops ?? ''}
              onChange={(e) =>
                set({ maxStops: e.target.value === '' ? null : Number(e.target.value) })
              }
              placeholder="No limit"
            />
            <p className="hint">Only the highest-priority locations are served, up to this count.</p>
          </div>
          <div className="field">
            <label htmlFor="max-difficulty">Max total delivery difficulty</label>
            <input
              id="max-difficulty"
              type="number"
              min={1}
              value={scenario.maxTotalDifficulty ?? ''}
              onChange={(e) =>
                set({ maxTotalDifficulty: e.target.value === '' ? null : Number(e.target.value) })
              }
              placeholder="No limit"
            />
            <p className="hint">
              Sum of difficulty (1–5) across served locations stays under this budget — a rough
              capacity limit for one trip or one day.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Locations / groups ({scenario.locations.length})</legend>
        {scenario.locations.map((loc, i) => (
          <LocationInputCard
            key={loc.id}
            index={i}
            location={loc}
            unit={unit}
            canRemove={scenario.locations.length > 1}
            onChange={(next) =>
              set({ locations: scenario.locations.map((l) => (l.id === loc.id ? next : l)) })
            }
            onRemove={() => set({ locations: scenario.locations.filter((l) => l.id !== loc.id) })}
          />
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => set({ locations: [...scenario.locations, emptyLocation(`loc-${++locCounter}`)] })}
        >
          + Add location
        </button>
      </fieldset>

      {errors.length > 0 && (
        <div ref={errorRef} tabIndex={-1} aria-live="assertive">
          <WarningBanner kind="error">
            <strong>Fix these before calculating:</strong>
            <ul style={{ margin: '0.4rem 0 0' }}>
              {errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          </WarningBanner>
        </div>
      )}

      <div className="btn-row">
        <button type="submit" className="btn btn-primary">
          Calculate allocation
        </button>
      </div>
      <p className="hint">
        The calculation is deterministic: the same inputs always produce the same plan. Nothing is
        sent to a server — everything runs in your browser.
      </p>
    </form>
  );
}
