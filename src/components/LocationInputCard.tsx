import type { LocationInput } from '../types';

interface Props {
  index: number;
  location: LocationInput;
  unit: string;
  canRemove: boolean;
  onChange: (next: LocationInput) => void;
  onRemove: () => void;
}

function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function LocationInputCard({ index, location, unit, canRemove, onChange, onRemove }: Props) {
  const id = location.id;
  const set = (patch: Partial<LocationInput>) => onChange({ ...location, ...patch });

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>
          <span className="kicker" style={{ display: 'inline', marginRight: '0.5rem' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          {location.name.trim() || `Location ${index + 1}`}
        </h3>
        {canRemove && (
          <button type="button" className="btn btn-small btn-danger" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>

      <div className="field-row" style={{ marginTop: '0.9rem' }}>
        <div className="field">
          <label htmlFor={`${id}-name`}>Name *</label>
          <input
            id={`${id}-name`}
            type="text"
            value={location.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g., Northside Shelter"
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-people`}>People affected</label>
          <input
            id={`${id}-people`}
            type="number"
            min={0}
            value={location.peopleAffected}
            onChange={(e) => set({ peopleAffected: num(e.target.value) })}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${id}-urgency`}>Urgency (1 low – 5 critical)</label>
          <select
            id={`${id}-urgency`}
            value={location.urgency}
            onChange={(e) => set({ urgency: num(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v} — {['low', 'mild', 'moderate', 'high', 'critical'][v - 1]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-difficulty`}>Delivery difficulty (1 easy – 5 very hard)</label>
          <select
            id={`${id}-difficulty`}
            value={location.deliveryDifficulty}
            onChange={(e) => set({ deliveryDifficulty: num(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v} — {['easy', 'manageable', 'moderate', 'hard', 'very hard'][v - 1]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${id}-min`}>Minimum needed ({unit})</label>
          <input
            id={`${id}-min`}
            type="number"
            min={0}
            value={location.minNeeded}
            onChange={(e) => set({ minNeeded: num(e.target.value) })}
          />
          <p className="hint">Floor this location should get if supply allows.</p>
        </div>
        <div className="field">
          <label htmlFor={`${id}-max`}>Maximum useful ({unit})</label>
          <input
            id={`${id}-max`}
            type="number"
            min={1}
            value={location.maxUseful}
            onChange={(e) => set({ maxUseful: num(e.target.value) })}
          />
          <p className="hint">Ceiling — more than this would go unused.</p>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor={`${id}-notes`}>Notes</label>
        <input
          id={`${id}-notes`}
          type="text"
          value={location.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Context that matters for this location (optional)"
        />
      </div>
    </div>
  );
}
