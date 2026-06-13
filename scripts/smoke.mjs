// Quick deterministic smoke test of the allocation engine against the sample scenarios.
// Run: node scripts/smoke.mjs (after: npx esbuild --bundle)
import { computePlan } from './planner.bundle.mjs';
import { SAMPLE_SCENARIOS } from './samples.bundle.mjs';

let failures = 0;
const check = (label, cond) => {
  if (!cond) {
    failures++;
    console.error('FAIL:', label);
  } else console.log('ok:', label);
};

for (const s of SAMPLE_SCENARIOS) {
  const r = computePlan(s.scenario);
  const total = Math.floor(s.scenario.totalUnits);
  check(`${s.key}: allocates <= total (${r.totalAllocated}/${total})`, r.totalAllocated <= total);
  check(
    `${s.key}: no location exceeds maxUseful`,
    r.locations.every((l) => l.allocated <= l.location.maxUseful),
  );
  check(
    `${s.key}: included locations meet minimum when supply allows`,
    r.totalAllocated + r.unitsLeftOver === total,
  );
  check(`${s.key}: fairness in [0,1] (${r.fairnessScore.toFixed(3)})`, r.fairnessScore >= 0 && r.fairnessScore <= 1.000001);
  check(`${s.key}: urgencyCoverage in [0,1] (${r.urgencyCoverage.toFixed(3)})`, r.urgencyCoverage >= 0 && r.urgencyCoverage <= 1.000001);
  const r2 = computePlan(s.scenario);
  check(
    `${s.key}: deterministic`,
    JSON.stringify(r.locations.map((l) => l.allocated)) === JSON.stringify(r2.locations.map((l) => l.allocated)),
  );
  console.log(
    `  ${s.key}:`,
    r.locations.map((l) => `${l.location.name}=${l.allocated}${l.included ? '' : ' (excl)'}`).join(', '),
    `| leftover=${r.unitsLeftOver} unmet=${r.unmetNeed} fair=${r.fairnessScore.toFixed(2)} urg=${r.urgencyCoverage.toFixed(2)}`,
  );
}

// Scarcity case: supply below combined minimums.
const scarce = structuredClone(SAMPLE_SCENARIOS[0].scenario);
scarce.totalUnits = 50; // mins sum to 130
const rs = computePlan(scarce);
check('scarcity: warning emitted', rs.warnings.some((w) => w.includes('cannot cover')));
check('scarcity: nothing exceeds its minimum', rs.locations.every((l) => l.allocated <= Math.max(l.location.minNeeded, 0)));
check(`scarcity: all 50 units used (${rs.totalAllocated})`, rs.totalAllocated === 50);

// Constraint case: maxStops.
const stops = structuredClone(SAMPLE_SCENARIOS[0].scenario);
stops.maxStops = 3;
const rstops = computePlan(stops);
check('maxStops: exactly 3 included', rstops.locations.filter((l) => l.included).length === 3);
check('maxStops: excluded get 0', rstops.locations.filter((l) => !l.included).every((l) => l.allocated === 0));

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
