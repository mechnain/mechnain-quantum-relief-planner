// Core domain types for the Mechnain Quantum Relief Planner.

export type ResourceType =
  | 'food-boxes'
  | 'clothing-kits'
  | 'school-supplies'
  | 'volunteers'
  | 'shelter-beds'
  | 'emergency-kits'
  | 'custom';

export interface ResourceMeta {
  label: string;
  unit: string;
  /** Rough planning ratio: estimated units needed per person affected. */
  unitsPerPerson: number;
  ratioNote: string;
}

export type FairnessPreference =
  | 'balanced'
  | 'urgency'
  | 'equal'
  | 'largest-need'
  | 'easier-delivery';

export interface LocationInput {
  id: string;
  name: string;
  peopleAffected: number;
  /** 1 (low) to 5 (critical) */
  urgency: number;
  /** 1 (easy) to 5 (very hard) */
  deliveryDifficulty: number;
  minNeeded: number;
  maxUseful: number;
  notes: string;
}

export interface Scenario {
  name: string;
  resourceType: ResourceType;
  customResourceLabel: string;
  totalUnits: number;
  fairness: FairnessPreference;
  maxStops: number | null;
  maxTotalDifficulty: number | null;
  locations: LocationInput[];
}

export interface LocationResult {
  location: LocationInput;
  /** Estimated demand in units, derived from people affected and min/max bounds. */
  demand: number;
  score: number;
  rank: number;
  allocated: number;
  /** allocated / demand, 0..1 (can exceed-clamp at 1 for display) */
  coverage: number;
  unmet: number;
  included: boolean;
  exclusionReason: string | null;
  explanation: string;
}

export interface PlanResult {
  scenario: Scenario;
  computedAt: string;
  unit: string;
  resourceLabel: string;
  locations: LocationResult[];
  totalDemand: number;
  totalAllocated: number;
  unitsLeftOver: number;
  unmetNeed: number;
  /** 0..100 */
  coveragePercent: number;
  /** Jain's fairness index over per-location coverage, 0..1 */
  fairnessScore: number;
  /** Share of high-urgency demand covered, 0..1 */
  urgencyCoverage: number;
  warnings: string[];
  summary: string;
}

export interface LocationDiff {
  name: string;
  prevAllocated: number;
  newAllocated: number;
  delta: number;
  prevRank: number | null;
  newRank: number | null;
}

export interface ResultDiff {
  locationChanges: LocationDiff[];
  fairnessDelta: number;
  unmetDelta: number;
  coverageDelta: number;
  anyChange: boolean;
}

// ---- Quantum demo types ----

export type QuantumExperimentId = 'randomness' | 'ghz' | 'maxcut';

export interface QuantumResultData {
  experiment: QuantumExperimentId;
  shots: number;
  backend: string;
  date: string;
  counts: Record<string, number>;
  idealCounts?: Record<string, number>;
  notes?: string;
  limitations?: string;
  /** True for bundled sample data; false for user-pasted hardware results. */
  isSample: boolean;
}
