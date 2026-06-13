# Mechnain Quantum Relief Planner

> Fair resource allocation for small organizations — classical and reliable, with an honest, educational quantum demonstration on real hardware.

**By [Mechnain Labs](https://mechnainlabs.com)** · An independent engineering lab.

- **Live tool:** https://mechnain.github.io/mechnain-quantum-relief-planner/
- **Source code:** https://github.com/mechnain/mechnain-quantum-relief-planner
- **Status:** Working prototype · public-impact decision-support tool

---

## Table of contents

1. [What it is](#what-it-is)
2. [The problem it solves](#the-problem-it-solves)
3. [Two layers, never confused](#two-layers-never-confused)
4. [The planner (classical engine)](#the-planner-classical-engine)
5. [Fairness rules](#fairness-rules)
6. [What the results show](#what-the-results-show)
7. [The quantum demonstration](#the-quantum-demonstration)
8. [Real Origin Wukong integration](#real-origin-wukong-integration)
9. [Honesty principles](#honesty-principles)
10. [Pages](#pages)
11. [Accessibility](#accessibility)
12. [Technology](#technology)
13. [Run it yourself](#run-it-yourself)
14. [Project structure](#project-structure)
15. [What it is not](#what-it-is-not)

---

## What it is

The Mechnain Quantum Relief Planner is a browser-based tool that helps small organizations split a
limited supply of a resource — food boxes, winter clothing kits, school supplies, volunteers,
shelter beds, emergency kits — across several locations or groups in a way that is **fair,
transparent, and defensible.**

You enter what you have and who needs it, choose a fairness rule, and the tool produces a clear
allocation plan with a plain-English reason for every number. Everything runs in your browser. There
is no account, no server, no external API, and no AI in the loop — the recommendations are ordinary,
inspectable mathematics.

A separate, clearly-labelled section demonstrates how a *tiny* version of the same kind of problem
can be encoded and run on a real quantum computer (Origin Wukong). It is a teaching exhibit, not a
performance claim.

---

## The problem it solves

Small organizations face the same hard question every week:

> *"We have X units and more places that need them than X can cover. How do we split it — and how
> do we explain that split to everyone affected?"*

Today that decision usually lives in a spreadsheet and a gut feeling. The result is:

- **Inconsistent** from week to week and person to person.
- **Hard to justify** to a board, donor, or the affected community.
- **Unmeasured** — "fair" is asserted, not quantified.
- **Error-prone** at the edges, where minimum guarantees, caps, and rounding interact.
- **Unrecorded** — there is no trace of *why* a given split was chosen.

This tool turns **what you have + who needs it + a fairness rule you choose** into a repeatable,
explainable, metric-backed plan in seconds, with an exportable record. It does not decide who
deserves help, set policy, or replace human judgement — it makes the human decision visible and
accountable.

---

## Two layers, never confused

| Layer | What it is | Role |
|-------|------------|------|
| **The planner** | Deterministic classical optimization | The useful product. Exact and instant at real-world sizes. |
| **The quantum demo** | A tiny QAOA/MaxCut experiment on real hardware | An honest educational exhibit. Claims no advantage. |

The planner never needs the quantum layer. The quantum layer never touches the planner. The order is
always: **classical planner first, quantum experiment second.**

---

## The planner (classical engine)

For each location the engine works through a transparent, deterministic procedure:

1. **Estimate need** — convert people affected into units using a per-resource ratio, then clamp
   between the location's minimum and maximum. Your min/max always override the estimate.
2. **Score priority** — combine normalized urgency, need, and delivery difficulty, weighted
   according to the chosen fairness rule.
3. **Allocate** — if supply covers all minimums, guarantee them first, then distribute the remainder
   by priority-weighted proportional shares with **largest-remainder rounding** (whole units that
   always sum exactly), capped at each location's maximum. If supply can't cover the minimums, the
   tool switches to explicit rationing by urgency-weighted minimum need — and says so.
4. **Apply constraints** — optional limits on the number of stops or total delivery difficulty filter
   to the highest-priority locations, with every exclusion explained.
5. **Measure** — compute coverage, unmet need, a fairness score, and urgency coverage.
6. **Explain** — generate a plain-English rationale for every location and an overall summary.

The same inputs always produce the same plan. At the sizes this tool handles (dozens of locations),
these methods are **exact and run in milliseconds** — there is no performance problem here for
quantum computing to solve, and the tool says so plainly.

---

## Fairness rules

Fairness is a *choice*, not a fact. The tool applies the rule you pick, transparently:

| Rule | Behaviour |
|------|-----------|
| **Balanced** | Weighs urgency, need, and delivery difficulty evenly. A sensible default. |
| **Prioritize urgency** | High-urgency locations pull a larger share of the remaining supply. |
| **Prioritize equal distribution** | Aims for even coverage of estimated need everywhere. |
| **Prioritize largest need** | Locations with the most estimated need pull a larger share. |
| **Prioritize easier delivery** | Penalizes hard-to-reach locations; useful when logistics bind. |

---

## What the results show

- **Recommended allocation table** — rank, urgency, estimated need, allocated units, coverage %, unmet need, and status per location.
- **Summary statistics** — total allocated, coverage, unmet need, locations served / fully met.
- **Fairness score** (Jain's index) — 1.00 means every served location reached the same share of its need.
- **Urgency coverage** — how much of the high-urgency need the plan covers.
- **Charts** — allocation, and need-vs-allocation, both with screen-reader data tables.
- **Per-location cards** — a plain-English reason for every allocation.
- **Warnings** — low supply, excluded locations, leftover reserve.
- **"What changed?"** — when you edit and recalculate, a diff against the previous plan.
- **Export** — print-to-PDF, copy summary, and copy the scenario as JSON to share.

One-click sample scenarios load realistic examples: a food bank, a winter clothing drive, school
supplies, and a volunteer deployment.

---

## The quantum demonstration

A clearly-badged educational section with three small experiments:

| Experiment | Qubits | What it teaches |
|------------|:------:|-----------------|
| **A — Quantum randomness** | 3 | A truly random, un-riggable draw — a fair tie-breaker. |
| **B — Bell / GHZ correlation** | 3 | Entanglement, and what real hardware noise looks like, quantified. |
| **C — MaxCut / QAOA toy allocation** | 5 | A real allocation tradeoff encoded as a graph optimization problem. |

Experiment C is the bridge: five locations become graph nodes, delivery conflicts become weighted
edges, and the goal is to split them into two delivery groups so the worst clashes land on different
days. It is shrunk to 5 binary variables so it fits honest near-term hardware. The brute-force
optimum (checking all 32 options) is always computed classically and shown next to the measured
result — so you can see immediately whether the chip found it.

Each card shows an ideal distribution, the measured distribution, a measurement-counts table, a
chart, what it teaches, and its limitations.

---

## Real Origin Wukong integration

The web app is static and key-free. Real quantum runs are produced by a local Python pipeline
(`quantum/run_experiments.py`) that uses Origin's `pyqpanda3` SDK to submit the three circuits to
[Origin Quantum's cloud](https://qcloud.originqc.com.cn/) and writes the measured counts to
`public/wukong-results.json`, which the live site loads at startup.

- **Backends supported:** local simulator, Origin cloud simulator (`full_amplitude`), and the real
  **Origin Wukong hardware (`WK_C180`, 180-qubit class)**.
- **Official algorithm library:** when [`pyqpanda_alg`](https://github.com/OriginQ/pyqpanda-algorithm)
  is installed, Origin's QUBO→QAOA optimizer proposes MaxCut angles, which are re-scored in our own
  transparent circuit before use (so a convention mismatch or weak variational result can never
  degrade the demo).
- **Result precedence in the app:** a result pasted into the admin panel > a result published with
  the site > bundled sample data. Each panel is labelled with the exact backend that produced it.
- **Key safety:** the API key lives only on your machine in a git-ignored `.env.local` file. It is
  never committed, never shown, and never embedded in any website's code — a static site would expose
  it to every visitor.

A genuine, instructive finding from the build: on the 5-node instance, Origin's variational QAOA at
depth p=1 lands on a *sub-optimal* cut, while an exhaustive classical angle search reliably finds the
true optimum — the project's whole thesis in miniature, shown rather than hidden.

---

## Honesty principles

These are baked into the copy and the code:

- The planner is a **prototype decision-support tool** — not a replacement for local knowledge,
  emergency professionals, or official response systems.
- Practical recommendations are generated using **classical optimization logic**.
- The quantum section is an **educational hardware experiment**. It does **not** claim quantum
  advantage, because at this scale there is none.
- **Sample data is clearly labelled** unless real Origin results are published or pasted; a simulator
  run is never presented as hardware, and device metadata is never fabricated.
- Fairness scores measure the *consequences of a chosen rule*, never declare a plan "objectively
  fair."

---

## Pages

**Home · Planner · Results · Quantum Demo · Case Study · Methods · About** — plus a visible
"Start Planning" button throughout.

- **Home** — the mission, what you can plan, and the two-layer framing.
- **Planner** — the full input form with one-click sample scenarios.
- **Results** — the allocation dashboard with metrics, charts, reasoning, and "what changed?".
- **Quantum Demo** — the three experiments, the MaxCut graph, and the "Paste Wukong Results" admin panel.
- **Case Study** — a 16-section honest write-up of the build.
- **Methods** — every formula, in plain words first and exact notation second.
- **About** — who Mechnain Labs is, and what it is not.

---

## Accessibility

Built toward **WCAG 2.1 AA**: keyboard-operable, high contrast, scalable text, semantic HTML and ARIA
labels, screen-reader data tables for every chart (no information by colour alone), inline text-based
validation messages, and respect for `prefers-reduced-motion`. Plain language throughout.

---

## Technology

- **React + TypeScript**, built with **Vite**.
- The allocation engine, fairness metrics, sample data, and quantum helpers are dependency-free pure
  TypeScript modules, separated from the UI.
- State persists in browser **local storage**. No backend, no accounts, no external APIs, no AI services.
- Self-hosted fonts (Manrope, Cormorant Garamond, IBM Plex Mono) — no runtime CDN dependency.
- Quantum pipeline: **Python + pyqpanda3** (+ optional pyqpanda_alg), run locally.
- Deployed via **GitHub Actions → GitHub Pages**.

---

## Run it yourself

```bash
# Web app
npm install
npm run dev        # development server
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build

# Quantum runs (optional, needs an Origin Quantum account)
cd quantum
pip install -r requirements.txt
cp .env.example .env.local          # paste your API key into .env.local (git-ignored)
python run_experiments.py --backend local           # local simulator, no account needed
python run_experiments.py --backend full_amplitude  # Origin cloud simulator
python run_experiments.py --backend WK_C180         # real Origin Wukong hardware
```

After a real run, commit and push `public/wukong-results.json` — the GitHub Pages workflow redeploys
and the live site shows the genuine results.

---

## Project structure

```
src/
  lib/planner.ts            allocation engine, scoring, fairness metrics, validation, diffing
  data/sampleScenarios.ts   one-click demo scenarios
  data/quantumSamples.ts    quantum experiment metadata, sample counts, pasted-JSON parser
  state/PlannerContext.tsx  app state with localStorage persistence
  components/               ScenarioForm, LocationInputCard, ResultsDashboard, AllocationTable,
                            LocationResultCard, FairnessScoreCard, QuantumExperimentCard,
                            QuantumCountsChart, CaseStudySection, MethodExplanation, PlainTerms,
                            WarningBanner, BarChart, NavBar, Footer
  pages/                    Landing, Planner, Results, Quantum, CaseStudy, Methods, About
quantum/
  run_experiments.py        Origin QCloud pipeline (local sim / cloud sim / Wukong hardware)
  requirements.txt          pyqpanda3 (+ optional pyqpanda_alg)
  .env.example              template for the local, git-ignored API key
public/
  wukong-results.json       published real-run results loaded by the app
```

---

## What it is not

- Not a substitute for local expertise, emergency professionals, or official response systems.
- Not a certified engineering service; Mechnain Labs builds working prototypes, labelled as such.
- Not "quantum-powered." The quantum layer is educational and does not run the planner.
- Not a claim of disaster-readiness or guaranteed outcomes for real people.

---

*Built by Mechnain Labs — practical prototypes, mechanical systems, robotics, data-driven tools, and
public-impact technology. Honest about what works today, and what doesn't yet.*
