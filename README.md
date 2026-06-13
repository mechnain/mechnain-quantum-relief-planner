# Mechnain Quantum Relief Planner

**Live demo:** https://mechnain.github.io/mechnain-quantum-relief-planner/

A public-impact planning tool by **Mechnain Labs** for allocating limited resources — food boxes,
clothing kits, volunteers, shelter beds — fairly across locations or groups.

- **The planner is classical and practical.** Deterministic priority scoring, minimum guarantees,
  caps, constraint handling, largest-remainder rounding, and fairness metrics (Jain index,
  urgency coverage, unmet need). Everything runs in the browser; no server, no APIs, no AI.
- **The quantum section is an honest educational layer.** Three small experiments (randomness,
  GHZ correlation, 5-node MaxCut/QAOA) show how tiny planning problems map onto quantum hardware
  (Origin Wukong class). Sample data is clearly labeled; real device JSON can be pasted into the
  admin panel on the Quantum Demo page. No quantum advantage is claimed.

## Run

```
npm install
npm run dev      # development server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Structure

- `src/lib/planner.ts` — allocation engine, scoring, fairness metrics, validation, result diffing
- `src/data/sampleScenarios.ts` — one-click demo scenarios
- `src/data/quantumSamples.ts` — quantum experiment metadata, sample counts, pasted-JSON parser
- `src/state/PlannerContext.tsx` — app state with localStorage persistence
- `src/components/` — ScenarioForm, LocationInputCard, ResultsDashboard, AllocationTable,
  LocationResultCard, FairnessScoreCard, QuantumExperimentCard, QuantumCountsChart,
  CaseStudySection, MethodExplanation, WarningBanner, charts, nav, footer
- `src/pages/` — Landing, Planner, Results, Quantum Demo, Case Study, Methods, About

## Honesty notes (also shown in the app)

- The planner is a prototype decision-support tool. It is not a replacement for local knowledge,
  emergency professionals, or official response systems.
- Practical recommendations are generated using classical optimization logic.
- The quantum section is an educational hardware experiment. It does not claim quantum advantage.
- Sample results are clearly labeled unless real Origin Wukong results are pasted.
