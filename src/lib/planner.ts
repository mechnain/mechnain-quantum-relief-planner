// Deterministic classical allocation engine.
// Every number produced here is traceable to an input and a rule — no randomness, no AI.

import type {
  FairnessPreference,
  LocationInput,
  LocationResult,
  PlanResult,
  ResourceMeta,
  ResourceType,
  ResultDiff,
  Scenario,
} from '../types';

export const RESOURCE_META: Record<ResourceType, ResourceMeta> = {
  'food-boxes': {
    label: 'Food boxes',
    unit: 'boxes',
    unitsPerPerson: 1 / 3,
    ratioNote: 'planned as roughly 1 box per household of ~3 people',
  },
  'clothing-kits': {
    label: 'Winter clothing kits',
    unit: 'kits',
    unitsPerPerson: 1,
    ratioNote: 'planned as 1 kit per person',
  },
  'school-supplies': {
    label: 'School supply kits',
    unit: 'kits',
    unitsPerPerson: 1,
    ratioNote: 'planned as 1 kit per student',
  },
  volunteers: {
    label: 'Volunteer slots',
    unit: 'volunteers',
    unitsPerPerson: 1 / 25,
    ratioNote: 'planned as roughly 1 volunteer per 25 people served',
  },
  'shelter-beds': {
    label: 'Shelter beds',
    unit: 'beds',
    unitsPerPerson: 1,
    ratioNote: 'planned as 1 bed per person',
  },
  'emergency-kits': {
    label: 'Emergency kits',
    unit: 'kits',
    unitsPerPerson: 1 / 4,
    ratioNote: 'planned as roughly 1 kit per household of ~4 people',
  },
  custom: {
    label: 'Custom resource',
    unit: 'units',
    unitsPerPerson: 1,
    ratioNote: 'planned as 1 unit per person (custom resources use a 1:1 ratio)',
  },
};

export const FAIRNESS_LABELS: Record<FairnessPreference, string> = {
  balanced: 'Balanced',
  urgency: 'Prioritize urgency',
  equal: 'Prioritize equal distribution',
  'largest-need': 'Prioritize largest need',
  'easier-delivery': 'Prioritize easier delivery',
};

// Score weights per fairness preference (applied to normalized 0..1 inputs).
const SCORE_WEIGHTS: Record<FairnessPreference, { u: number; n: number; d: number }> = {
  balanced: { u: 0.45, n: 0.35, d: 0.2 },
  urgency: { u: 0.65, n: 0.25, d: 0.1 },
  equal: { u: 0.45, n: 0.35, d: 0.2 }, // used only to order leftover units
  'largest-need': { u: 0.3, n: 0.6, d: 0.1 },
  'easier-delivery': { u: 0.35, n: 0.25, d: 0.4 },
};

export function resourceUnit(s: Scenario): string {
  return s.resourceType === 'custom' && s.customResourceLabel.trim()
    ? s.customResourceLabel.trim().toLowerCase()
    : RESOURCE_META[s.resourceType].unit;
}

export function resourceLabel(s: Scenario): string {
  return s.resourceType === 'custom' && s.customResourceLabel.trim()
    ? s.customResourceLabel.trim()
    : RESOURCE_META[s.resourceType].label;
}

/** Estimated demand: people affected adjusted by resource ratio, clamped to [minNeeded, maxUseful]. */
export function estimateDemand(loc: LocationInput, resourceType: ResourceType): number {
  const ratio = RESOURCE_META[resourceType].unitsPerPerson;
  const fromPeople = Math.ceil(loc.peopleAffected * ratio);
  return Math.max(loc.minNeeded, Math.min(loc.maxUseful, Math.max(fromPeople, 0)));
}

function priorityScore(
  loc: LocationInput,
  demand: number,
  maxDemand: number,
  fairness: FairnessPreference,
): number {
  const w = SCORE_WEIGHTS[fairness];
  const u = loc.urgency / 5;
  const n = maxDemand > 0 ? demand / maxDemand : 0;
  const d = loc.deliveryDifficulty / 5;
  return w.u * u + w.n * n - w.d * d;
}

/**
 * Proportional apportionment with integer units, per-location caps, and
 * largest-remainder rounding. Deterministic. Returns integer allocations
 * summing to at most `total` (less only when all caps are hit).
 */
function proportionalCapped(total: number, weights: number[], caps: number[]): number[] {
  const n = weights.length;
  const out = new Array<number>(n).fill(0);
  let remaining = Math.max(0, Math.floor(total));

  for (let pass = 0; pass < 50 && remaining > 0; pass++) {
    const active = [];
    for (let i = 0; i < n; i++) {
      if (caps[i] - out[i] > 0 && weights[i] > 0) active.push(i);
    }
    if (active.length === 0) break;

    const wsum = active.reduce((s, i) => s + weights[i], 0);
    if (wsum <= 0) break;

    let used = 0;
    const remainders: { i: number; frac: number }[] = [];
    for (const i of active) {
      const exact = (remaining * weights[i]) / wsum;
      const room = caps[i] - out[i];
      const give = Math.min(Math.floor(exact), room);
      out[i] += give;
      used += give;
      if (give < room) remainders.push({ i, frac: exact - Math.floor(exact) });
    }
    remaining -= used;

    // Largest-remainder distribution of the leftover whole units.
    remainders.sort((a, b) => b.frac - a.frac || a.i - b.i);
    for (const r of remainders) {
      if (remaining <= 0) break;
      if (caps[r.i] - out[r.i] > 0) {
        out[r.i] += 1;
        remaining -= 1;
      }
    }
    if (used === 0 && remainders.length === 0) break;
  }
  return out;
}

export function computePlan(scenario: Scenario): PlanResult {
  const unit = resourceUnit(scenario);
  const label = resourceLabel(scenario);
  const warnings: string[] = [];
  const locs = scenario.locations;
  const total = Math.max(0, Math.floor(scenario.totalUnits));

  // Step 1–2: estimated demand per location.
  const demands = locs.map((l) => estimateDemand(l, scenario.resourceType));
  const maxDemand = Math.max(...demands, 1);

  // Step 3: priority scores and ranking (ties broken by urgency, then name).
  const scores = locs.map((l, i) => priorityScore(l, demands[i], maxDemand, scenario.fairness));
  const rankOrder = locs
    .map((_, i) => i)
    .sort(
      (a, b) =>
        scores[b] - scores[a] ||
        locs[b].urgency - locs[a].urgency ||
        locs[a].name.localeCompare(locs[b].name),
    );
  const ranks = new Array<number>(locs.length).fill(0);
  rankOrder.forEach((idx, pos) => (ranks[idx] = pos + 1));

  // Constraint filtering: max stops, then max total delivery difficulty,
  // both applied in priority order so the highest-priority locations are kept.
  const included = new Array<boolean>(locs.length).fill(true);
  const exclusionReason = new Array<string | null>(locs.length).fill(null);

  if (scenario.maxStops !== null && scenario.maxStops > 0 && scenario.maxStops < locs.length) {
    rankOrder.forEach((idx, pos) => {
      if (pos >= scenario.maxStops!) {
        included[idx] = false;
        exclusionReason[idx] = `Not selected: the plan is limited to ${scenario.maxStops} stops and ${locs[idx].name} ranked #${ranks[idx]} by priority.`;
      }
    });
    warnings.push(
      `The max-stops constraint (${scenario.maxStops}) excludes ${locs.length - scenario.maxStops} location(s) from this plan.`,
    );
  }

  if (scenario.maxTotalDifficulty !== null && scenario.maxTotalDifficulty > 0) {
    let budget = scenario.maxTotalDifficulty;
    let excludedByDifficulty = 0;
    for (const idx of rankOrder) {
      if (!included[idx]) continue;
      if (locs[idx].deliveryDifficulty <= budget) {
        budget -= locs[idx].deliveryDifficulty;
      } else {
        included[idx] = false;
        exclusionReason[idx] = `Not selected: adding ${locs[idx].name} (difficulty ${locs[idx].deliveryDifficulty}/5) would exceed the max total delivery difficulty of ${scenario.maxTotalDifficulty}.`;
        excludedByDifficulty++;
      }
    }
    if (excludedByDifficulty > 0) {
      warnings.push(
        `The delivery-difficulty budget (${scenario.maxTotalDifficulty}) excludes ${excludedByDifficulty} location(s). Consider raising it or planning a second trip.`,
      );
    }
  }

  const sel = locs.map((_, i) => i).filter((i) => included[i]);

  // Step 4: allocation.
  const alloc = new Array<number>(locs.length).fill(0);
  const sumMin = sel.reduce((s, i) => s + locs[i].minNeeded, 0);
  let insufficientForMinimums = false;

  if (sel.length > 0 && total > 0) {
    if (total >= sumMin) {
      // Satisfy all minimums first.
      sel.forEach((i) => (alloc[i] = Math.min(locs[i].minNeeded, demands[i] || locs[i].minNeeded, locs[i].maxUseful)));
      // Make sure minimums are exactly the floor (minNeeded may exceed demand estimate but never maxUseful after validation).
      sel.forEach((i) => (alloc[i] = Math.min(locs[i].minNeeded, locs[i].maxUseful)));
      let remaining = total - sel.reduce((s, i) => s + alloc[i], 0);

      const caps = sel.map((i) => Math.max(0, locs[i].maxUseful - alloc[i]));
      let weights: number[];
      if (scenario.fairness === 'equal') {
        // Distribute in proportion to estimated need so coverage stays even,
        // then leftovers fall to higher-urgency locations via largest remainder.
        weights = sel.map((i) => Math.max(demands[i], 1) + locs[i].urgency / 10);
      } else {
        // Priority-weighted proportional: normalize scores to 0..1, keep a floor
        // so no included location is starved, and scale by need.
        const sMin = Math.min(...sel.map((i) => scores[i]));
        const sMax = Math.max(...sel.map((i) => scores[i]));
        const range = sMax - sMin || 1;
        weights = sel.map(
          (i) => (0.25 + 0.75 * ((scores[i] - sMin) / range)) * Math.max(demands[i], 1),
        );
      }
      const extra = proportionalCapped(remaining, weights, caps);
      sel.forEach((i, k) => (alloc[i] += extra[k]));
    } else {
      // Not enough even for minimums: allocate proportionally to urgency-weighted minimum need.
      insufficientForMinimums = true;
      const weights = sel.map((i) => Math.max(locs[i].minNeeded, 1) * locs[i].urgency);
      const caps = sel.map((i) => Math.min(locs[i].minNeeded, locs[i].maxUseful));
      const shares = proportionalCapped(total, weights, caps);
      sel.forEach((i, k) => (alloc[i] = shares[k]));
      warnings.push(
        `Available supply (${total} ${unit}) cannot cover the combined minimum needs (${sumMin} ${unit}). Units were split in proportion to urgency-weighted minimum need. No location reaches its minimum reliably — consider sourcing more ${unit} or narrowing the plan.`,
      );
    }
  }

  // Step 5: metrics.
  const totalAllocated = alloc.reduce((s, a) => s + a, 0);
  const totalDemand = demands.reduce((s, d) => s + d, 0);
  const unmetNeed = locs.reduce((s, _l, i) => s + Math.max(0, demands[i] - alloc[i]), 0);
  const coveragePercent = totalDemand > 0 ? (totalAllocated / totalDemand) * 100 : 100;
  const unitsLeftOver = total - totalAllocated;

  const coverages = locs.map((_, i) => (demands[i] > 0 ? Math.min(1, alloc[i] / demands[i]) : 1));

  // Jain's fairness index over included locations' coverage ratios.
  const selCov = sel.map((i) => coverages[i]);
  let fairnessScore = 1;
  if (selCov.length > 0) {
    const sum = selCov.reduce((s, c) => s + c, 0);
    const sumSq = selCov.reduce((s, c) => s + c * c, 0);
    fairnessScore = sumSq > 0 ? (sum * sum) / (selCov.length * sumSq) : 0;
  }

  // Urgency coverage: how much of high-urgency demand (urgency >= 4) is covered.
  let urgentIdx = locs.map((_, i) => i).filter((i) => locs[i].urgency >= 4);
  if (urgentIdx.length === 0) urgentIdx = locs.map((_, i) => i).filter((i) => locs[i].urgency >= 3);
  if (urgentIdx.length === 0) urgentIdx = locs.map((_, i) => i);
  const urgentDemand = urgentIdx.reduce((s, i) => s + demands[i], 0);
  const urgentAlloc = urgentIdx.reduce((s, i) => s + Math.min(alloc[i], demands[i]), 0);
  const urgencyCoverage = urgentDemand > 0 ? urgentAlloc / urgentDemand : 1;

  // Warnings.
  if (totalDemand > 0 && total < totalDemand * 0.5) {
    warnings.push(
      `Supply is low: ${total} ${unit} against an estimated need of ${totalDemand} ${unit} (under 50% coverage). Expect significant unmet need at most locations.`,
    );
  }
  const zeroLocs = sel.filter((i) => alloc[i] === 0 && demands[i] > 0);
  if (zeroLocs.length > 0) {
    warnings.push(
      `${zeroLocs.map((i) => locs[i].name).join(', ')} received 0 ${unit} despite having need. Review the inputs or constraints.`,
    );
  }
  if (unitsLeftOver > 0) {
    warnings.push(
      `${unitsLeftOver} ${unit} remain unallocated because every selected location reached its maximum useful amount${sel.length < locs.length ? ' or was excluded by a constraint' : ''}. They can be held in reserve.`,
    );
  }

  // Step 6: plain-English explanations.
  const results: LocationResult[] = locs.map((l, i) => {
    const cov = coverages[i];
    let explanation: string;
    if (!included[i]) {
      explanation = exclusionReason[i] ?? 'Not selected by the active constraints.';
    } else if (alloc[i] === 0 && demands[i] === 0) {
      explanation = `${l.name} has no estimated need for this resource, so no ${unit} were assigned.`;
    } else {
      const parts: string[] = [];
      parts.push(
        `${l.name} ranked #${ranks[i]} of ${locs.length} by priority (urgency ${l.urgency}/5, estimated need ${demands[i]} ${unit}, delivery difficulty ${l.deliveryDifficulty}/5).`,
      );
      parts.push(
        `It receives ${alloc[i]} ${unit} — ${Math.round(cov * 100)}% of its estimated need.`,
      );
      if (insufficientForMinimums) {
        parts.push(
          `Supply could not cover combined minimums, so its share reflects urgency-weighted minimum need (minimum requested: ${l.minNeeded}).`,
        );
      } else if (alloc[i] >= l.maxUseful && l.maxUseful > 0) {
        parts.push(`It is capped at its maximum useful amount of ${l.maxUseful} ${unit}.`);
      } else if (l.minNeeded > 0 && alloc[i] >= l.minNeeded) {
        parts.push(`Its minimum of ${l.minNeeded} ${unit} was guaranteed first, then it shared in the remaining supply under the “${FAIRNESS_LABELS[scenario.fairness]}” rule.`);
      } else {
        parts.push(`Its share follows the “${FAIRNESS_LABELS[scenario.fairness]}” rule.`);
      }
      explanation = parts.join(' ');
    }
    return {
      location: l,
      demand: demands[i],
      score: scores[i],
      rank: ranks[i],
      allocated: alloc[i],
      coverage: cov,
      unmet: Math.max(0, demands[i] - alloc[i]),
      included: included[i],
      exclusionReason: exclusionReason[i],
      explanation,
    };
  });

  // Overall summary paragraph.
  const fullyMet = results.filter((r) => r.included && r.unmet === 0).length;
  const summarySentences: string[] = [];
  summarySentences.push(
    `This plan distributes ${totalAllocated} of ${total} available ${unit} (${label.toLowerCase()}) across ${sel.length} of ${locs.length} location(s) using the “${FAIRNESS_LABELS[scenario.fairness]}” rule.`,
  );
  summarySentences.push(
    `Overall coverage is ${Math.round(coveragePercent)}% of the estimated total need of ${totalDemand} ${unit}, leaving ${unmetNeed} ${unit} of unmet need.`,
  );
  summarySentences.push(
    `${fullyMet} location(s) are fully covered. The fairness score is ${fairnessScore.toFixed(2)} (1.00 means every location reaches the same share of its need) and ${Math.round(urgencyCoverage * 100)}% of high-urgency need is covered.`,
  );
  if (insufficientForMinimums) {
    summarySentences.push(
      'Supply is below combined minimum needs, so this plan is a rationing plan: it spreads scarce units by urgency rather than meeting any location fully.',
    );
  }
  summarySentences.push(
    'These numbers follow directly from your inputs and the selected fairness rule — review them with local knowledge before acting.',
  );

  return {
    scenario,
    computedAt: new Date().toISOString(),
    unit,
    resourceLabel: label,
    locations: results,
    totalDemand,
    totalAllocated,
    unitsLeftOver,
    unmetNeed,
    coveragePercent,
    fairnessScore,
    urgencyCoverage,
    warnings,
    summary: summarySentences.join(' '),
  };
}

/** Compare two results (matched by location name) for the “What changed?” panel. */
export function diffResults(prev: PlanResult, current: PlanResult): ResultDiff {
  const prevByName = new Map(prev.locations.map((r) => [r.location.name, r]));
  const locationChanges = current.locations.map((r) => {
    const p = prevByName.get(r.location.name);
    return {
      name: r.location.name,
      prevAllocated: p ? p.allocated : 0,
      newAllocated: r.allocated,
      delta: r.allocated - (p ? p.allocated : 0),
      prevRank: p ? p.rank : null,
      newRank: r.rank,
    };
  });
  const fairnessDelta = current.fairnessScore - prev.fairnessScore;
  const unmetDelta = current.unmetNeed - prev.unmetNeed;
  const coverageDelta = current.coveragePercent - prev.coveragePercent;
  const anyChange =
    locationChanges.some((c) => c.delta !== 0 || c.prevRank !== c.newRank) ||
    Math.abs(fairnessDelta) > 1e-9 ||
    unmetDelta !== 0;
  return { locationChanges, fairnessDelta, unmetDelta, coverageDelta, anyChange };
}

/** Validation: returns a list of human-readable problems; empty list = valid. */
export function validateScenario(s: Scenario): string[] {
  const errors: string[] = [];
  if (!s.name.trim()) errors.push('Give the scenario a name.');
  if (!Number.isFinite(s.totalUnits) || s.totalUnits <= 0)
    errors.push('Total available units must be a positive number.');
  if (s.resourceType === 'custom' && !s.customResourceLabel.trim())
    errors.push('Name your custom resource (e.g., “hygiene kits”).');
  if (s.locations.length < 1) errors.push('Add at least one location or group.');
  if (s.maxStops !== null && s.maxStops < 1)
    errors.push('Max stops must be at least 1 (or leave it blank).');
  if (s.maxTotalDifficulty !== null && s.maxTotalDifficulty < 1)
    errors.push('Max total delivery difficulty must be at least 1 (or leave it blank).');
  s.locations.forEach((l, i) => {
    const label = l.name.trim() || `Location ${i + 1}`;
    if (!l.name.trim()) errors.push(`Location ${i + 1}: name is required.`);
    if (!Number.isFinite(l.peopleAffected) || l.peopleAffected < 0)
      errors.push(`${label}: people affected must be 0 or more.`);
    if (l.urgency < 1 || l.urgency > 5) errors.push(`${label}: urgency must be between 1 and 5.`);
    if (l.deliveryDifficulty < 1 || l.deliveryDifficulty > 5)
      errors.push(`${label}: delivery difficulty must be between 1 and 5.`);
    if (!Number.isFinite(l.minNeeded) || l.minNeeded < 0)
      errors.push(`${label}: minimum needed must be 0 or more.`);
    if (!Number.isFinite(l.maxUseful) || l.maxUseful < 1)
      errors.push(`${label}: maximum useful units must be at least 1.`);
    if (l.maxUseful < l.minNeeded)
      errors.push(`${label}: maximum useful (${l.maxUseful}) is below minimum needed (${l.minNeeded}).`);
  });
  const names = s.locations.map((l) => l.name.trim().toLowerCase()).filter(Boolean);
  if (new Set(names).size !== names.length)
    errors.push('Two locations have the same name — make names unique so results are clear.');
  return errors;
}
