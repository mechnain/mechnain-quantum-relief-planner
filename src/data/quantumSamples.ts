// Bundled SAMPLE data for the quantum demo page.
// These are illustrative numbers in the shape real runs produce.
// The "hardware" samples are clearly labeled as sample data everywhere they appear,
// and are replaced only when real results are pasted in the admin panel.

import type { QuantumExperimentId, QuantumResultData } from '../types';

export interface QuantumExperimentMeta {
  id: QuantumExperimentId;
  title: string;
  tagline: string;
  qubits: number;
  explanation: string[];
  teaches: string[];
  limitations: string[];
}

export const QUANTUM_EXPERIMENTS: QuantumExperimentMeta[] = [
  {
    id: 'randomness',
    title: 'A — Quantum Randomness',
    tagline: 'Using measurement randomness as a transparent tie-breaker',
    qubits: 3,
    explanation: [
      'Three qubits are put into equal superposition with Hadamard gates and measured. Each of the 8 outcomes (000–111) should appear with equal probability — a physically random draw, not a pseudo-random one.',
      'In allocation work, a verifiably fair random draw is occasionally useful: breaking a tie between two equally-deserving locations, or ordering a waitlist without favoritism. This circuit is the smallest honest version of that idea.',
    ],
    teaches: [
      'Quantum measurement gives true physical randomness; a classical computer can only approximate it.',
      'On ideal hardware the 8 outcomes are uniform. Deviations on a real device reveal readout bias and noise.',
      'This is the only experiment here where quantum hardware does something a classical computer strictly cannot — and it is a very modest something.',
    ],
    limitations: [
      'A classical pseudo-random generator is indistinguishable in practice for this use case.',
      'This demonstrates fair sampling, not optimization. It does not make allocations better.',
    ],
  },
  {
    id: 'ghz',
    title: 'B — Bell/GHZ Correlation',
    tagline: 'Entanglement, and what hardware noise actually looks like',
    qubits: 3,
    explanation: [
      'A GHZ circuit entangles three qubits: ideally, every measurement returns 000 or 111, each about half the time. The qubits act as one correlated system — no mixture of independent coins can reproduce this.',
      'On real hardware, gate errors and decoherence leak probability into the other six outcomes. The size of that leakage is an honest, direct measurement of device quality.',
    ],
    teaches: [
      'Entanglement is the resource that makes quantum computing different from classical probability.',
      'The gap between the ideal distribution (only 000 and 111) and the measured one is hardware noise, quantified.',
      'Any serious near-term quantum claim must account for this noise floor. This is why our planner stays classical.',
    ],
    limitations: [
      'This experiment has no allocation use at all — it is included purely to show what real hardware noise looks like.',
      'Three qubits cannot demonstrate scaling behavior.',
    ],
  },
  {
    id: 'maxcut',
    title: 'C — MaxCut / QAOA Toy Allocation',
    tagline: 'A tiny allocation tradeoff encoded as a graph problem',
    qubits: 5,
    explanation: [
      'Five locations become five graph nodes. An edge connects two locations when serving them in the same delivery group is costly — shared route congestion, same-day volunteer conflicts, or overlapping need spikes. Edge weight = how bad the conflict is.',
      'Splitting the locations into two delivery groups (day 1 vs day 2) so the heaviest conflicts are separated is the MaxCut problem. Each bitstring is a split: bit i says which group location i joins.',
      'QAOA (depth p=1) prepares a quantum state that concentrates probability on high-value splits, then sampling reads candidates out. For 5 nodes the best split is trivially found classically by checking all 32 options — which is exactly the point: at this scale, classical wins, and the demo only shows the encoding and workflow.',
    ],
    teaches: [
      'Real allocation tradeoffs can be encoded as graph optimization (QUBO/Ising) problems that quantum hardware accepts.',
      'QAOA biases sampling toward good answers; it does not guarantee the best one, especially at low depth on noisy devices.',
      'Comparing the hardware histogram against the brute-force optimum makes the current gap between classical and quantum methods concrete and honest.',
    ],
    limitations: [
      'Five nodes is far below any practically useful problem size. The classical planner on the Planner page handles the real work.',
      'This demonstrates encoding and workflow only. It is not evidence of quantum advantage, and none is claimed.',
      'Hardware results vary run to run; a single histogram is an anecdote, not a benchmark.',
    ],
  },
];

// --- MaxCut toy instance shown in the experiment card ---
export const MAXCUT_NODES = ['Northside', 'Riverside', 'Eastgate', 'Southview', 'Hillcrest'];
export const MAXCUT_EDGES: { a: number; b: number; w: number; reason: string }[] = [
  { a: 0, b: 1, w: 3, reason: 'shared bridge route — congestion if same day' },
  { a: 0, b: 2, w: 2, reason: 'same volunteer team' },
  { a: 1, b: 3, w: 2, reason: 'single loading dock window' },
  { a: 2, b: 3, w: 3, reason: 'overlapping need spike' },
  { a: 2, b: 4, w: 1, reason: 'long rural detour if combined' },
  { a: 3, b: 4, w: 2, reason: 'same refrigerated truck' },
];
// Brute-force optimum for the instance above (and its complement): cut value 12 of 13 total
// weight (verified by quantum/run_experiments.py, which re-checks it on every run).
export const MAXCUT_OPTIMUM = { bitstrings: ['01101', '10010'], cutValue: 12 };

const SAMPLE_NOTE =
  'SAMPLE DATA — illustrative numbers in the correct format, shown so the page works before any real run is pasted. Not a real hardware result.';

export const SAMPLE_RESULTS: Record<QuantumExperimentId, { ideal: QuantumResultData; hardware: QuantumResultData }> = {
  randomness: {
    ideal: {
      experiment: 'randomness',
      shots: 1000,
      backend: 'ideal simulator (analytic)',
      date: '2026-05-01',
      counts: { '000': 125, '001': 125, '010': 125, '011': 125, '100': 125, '101': 125, '110': 125, '111': 125 },
      notes: 'Exact uniform distribution: each 3-bit outcome has probability 1/8.',
      isSample: true,
    },
    hardware: {
      experiment: 'randomness',
      shots: 1000,
      backend: 'sample data (no hardware run yet)',
      date: '2026-05-01',
      counts: { '000': 138, '001': 119, '010': 127, '011': 113, '100': 131, '101': 116, '110': 129, '111': 127 },
      notes: SAMPLE_NOTE,
      limitations: 'Readout bias typically skews a few outcomes by several percent on real devices.',
      isSample: true,
    },
  },
  ghz: {
    ideal: {
      experiment: 'ghz',
      shots: 1000,
      backend: 'ideal simulator (analytic)',
      date: '2026-05-01',
      counts: { '000': 500, '111': 500 },
      notes: 'Ideal GHZ state: only the two fully-correlated outcomes appear.',
      isSample: true,
    },
    hardware: {
      experiment: 'ghz',
      shots: 1000,
      backend: 'sample data (no hardware run yet)',
      date: '2026-05-01',
      counts: { '000': 441, '111': 428, '001': 28, '010': 22, '100': 31, '011': 17, '101': 14, '110': 19 },
      notes: SAMPLE_NOTE,
      limitations: 'The ~13% probability outside 000/111 illustrates typical NISQ gate and readout error.',
      isSample: true,
    },
  },
  maxcut: {
    ideal: {
      experiment: 'maxcut',
      shots: 1000,
      backend: 'ideal simulator (QAOA p=1)',
      date: '2026-05-01',
      counts: {
        '01101': 182, '10010': 176, '01100': 84, '10011': 81, '00100': 63,
        '11011': 58, '01110': 55, '10001': 52, '00101': 41, '11010': 39,
        '01000': 35, '10111': 33, others: 101,
      },
      notes:
        'Sample ideal QAOA (p=1) distribution: probability concentrates on the optimal cut 01101/10010 but does not reach 100% — low-depth QAOA biases sampling, it does not guarantee the optimum.',
      isSample: true,
    },
    hardware: {
      experiment: 'maxcut',
      shots: 1000,
      backend: 'sample data (no hardware run yet)',
      date: '2026-05-01',
      counts: {
        '01101': 117, '10010': 109, '01100': 78, '10011': 74, '00100': 66,
        '11011': 61, '01110': 58, '10001': 55, '00101': 49, '11010': 47,
        '01000': 44, '10111': 41, others: 201,
      },
      notes: SAMPLE_NOTE,
      limitations:
        'On real hardware the histogram flattens toward noise. The optimum often remains the modal outcome but with a much smaller margin — and sometimes it does not, which is itself an instructive result.',
      isSample: true,
    },
  },
};

/** Parse pasted JSON into a QuantumResultData; throws with a readable message on bad input. */
export function parsePastedResult(json: string): QuantumResultData {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error('Not valid JSON. Check for trailing commas or unquoted keys.');
  }
  const obj = raw as Record<string, unknown>;
  const experiment = obj.experiment;
  if (experiment !== 'randomness' && experiment !== 'ghz' && experiment !== 'maxcut') {
    throw new Error('"experiment" must be one of: "randomness", "ghz", "maxcut".');
  }
  const counts = obj.counts;
  if (!counts || typeof counts !== 'object' || Array.isArray(counts)) {
    throw new Error('"counts" must be an object mapping bitstrings to integers, e.g. {"000": 512}.');
  }
  for (const [k, v] of Object.entries(counts as Record<string, unknown>)) {
    if (typeof v !== 'number' || v < 0 || !Number.isFinite(v)) {
      throw new Error(`counts["${k}"] must be a non-negative number.`);
    }
  }
  const shots =
    typeof obj.shots === 'number'
      ? obj.shots
      : Object.values(counts as Record<string, number>).reduce((s, c) => s + c, 0);
  return {
    experiment,
    shots,
    backend: typeof obj.backend === 'string' && obj.backend ? obj.backend : 'unspecified backend',
    date: typeof obj.date === 'string' && obj.date ? obj.date : new Date().toISOString().slice(0, 10),
    counts: counts as Record<string, number>,
    idealCounts:
      obj.idealCounts && typeof obj.idealCounts === 'object' && !Array.isArray(obj.idealCounts)
        ? (obj.idealCounts as Record<string, number>)
        : undefined,
    notes: typeof obj.notes === 'string' ? obj.notes : undefined,
    limitations: typeof obj.limitations === 'string' ? obj.limitations : undefined,
    isSample: false,
    source: 'pasted',
  };
}

/**
 * Load real results published with the site (public/wukong-results.json,
 * written by quantum/run_experiments.py). Returns {} when the file is absent.
 */
export async function fetchPublishedResults(): Promise<
  Partial<Record<QuantumExperimentId, QuantumResultData>>
> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}wukong-results.json`, {
      cache: 'no-cache',
    });
    if (!res.ok) return {};
    const raw = await res.json();
    if (!Array.isArray(raw)) return {};
    const out: Partial<Record<QuantumExperimentId, QuantumResultData>> = {};
    for (const entry of raw) {
      try {
        const parsed = parsePastedResult(JSON.stringify(entry));
        parsed.source = 'published';
        out[parsed.experiment] = parsed;
      } catch {
        // Skip malformed entries; never guess at quantum data.
      }
    }
    return out;
  } catch {
    return {};
  }
}

export const PASTE_TEMPLATE = `{
  "experiment": "maxcut",
  "shots": 1000,
  "backend": "Origin Wukong (origin_wukong)",
  "date": "2026-06-12",
  "counts": { "01100": 117, "10011": 104, "00100": 61 },
  "idealCounts": { "01100": 182, "10011": 176 },
  "notes": "QAOA p=1, 5-node MaxCut instance",
  "limitations": "Single run; no error mitigation."
}`;
