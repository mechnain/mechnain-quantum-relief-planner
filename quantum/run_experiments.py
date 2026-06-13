"""Run the Mechnain Quantum Relief Planner experiments on Origin Quantum's cloud.

Builds the exact three circuits shown on the app's Quantum Demo page
(A: 3-qubit randomness, B: 3-qubit GHZ, C: 5-node MaxCut QAOA p=1),
runs them on a chosen backend, and writes the measured counts into
../public/wukong-results.json in the schema the web app loads at startup.

Setup:
  1. Create an account at https://account.originqc.com.cn/ and copy your
     API key from the user center.
  2. pip install -r requirements.txt
  3. Set the key:   PowerShell:  $env:QPANDA3_API_KEY = "your-key"
                    bash:        export QPANDA3_API_KEY=your-key

Usage:
  python run_experiments.py --backend local                       # local simulator, no account needed
  python run_experiments.py --backend full_amplitude              # Origin cloud simulator
  python run_experiments.py --backend origin_wukong               # real Wukong hardware
  python run_experiments.py --backend origin_wukong --experiments maxcut --shots 1000

Honesty rules baked in:
  - The backend name written to the JSON is whatever was actually used.
    A simulator run is labeled as a simulator run, never as hardware.
  - QAOA angles are chosen by a coarse grid search on the LOCAL simulator,
    then the fixed-angle circuit is submitted. This is stated in the notes.
  - The script prints the brute-force MaxCut optimum next to the measured
    top bitstrings so you can see immediately whether the run found it.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from datetime import date
from itertools import product
from pathlib import Path

from pyqpanda3 import core

RESULTS_PATH = Path(__file__).resolve().parent.parent / "public" / "wukong-results.json"

# Must match MAXCUT_NODES / MAXCUT_EDGES in src/data/quantumSamples.ts.
MAXCUT_N = 5
MAXCUT_EDGES = [(0, 1, 3), (0, 2, 2), (1, 3, 2), (2, 3, 3), (2, 4, 1), (3, 4, 2)]

# Origin QCloud backends that are SIMULATORS (everything else listed by the service
# is a real QPU). Used so a hardware run is never mislabeled as a simulator, or vice versa.
CLOUD_SIMULATORS = {"full_amplitude", "partial_amplitude", "single_amplitude"}


def backend_description(backend_name: str, is_local: bool) -> str:
    """Honest, human-readable label for whatever actually ran. Never guesses."""
    if is_local:
        return "local simulator (pyqpanda3 CPUQVM — not hardware)"
    if backend_name in CLOUD_SIMULATORS:
        return f"Origin QCloud simulator: {backend_name} (not hardware)"
    if backend_name.upper().startswith("WK"):
        return f"Origin Wukong hardware ({backend_name})"
    return f"Origin QCloud hardware ({backend_name})"

SHARED_LIMITATION = (
    "Single run with no error mitigation; one histogram is an anecdote, not a benchmark. "
    "No quantum advantage is demonstrated or claimed."
)


# ---------------------------------------------------------------- circuits

def build_randomness() -> core.QProg:
    prog = core.QProg()
    for q in range(3):
        prog << core.H(q)
    prog << core.measure([0, 1, 2], [0, 1, 2])
    return prog


def build_ghz() -> core.QProg:
    prog = core.QProg()
    prog << core.H(0)
    prog << core.CNOT(0, 1)
    prog << core.CNOT(1, 2)
    prog << core.measure([0, 1, 2], [0, 1, 2])
    return prog


def build_maxcut_qaoa(gamma: float, beta: float) -> core.QProg:
    """QAOA depth p=1 for the weighted MaxCut instance above."""
    prog = core.QProg()
    for q in range(MAXCUT_N):
        prog << core.H(q)
    # Cost unitary: exp(-i * gamma * w * Z_i Z_j) per edge.
    for i, j, w in MAXCUT_EDGES:
        prog << core.CNOT(i, j)
        prog << core.RZ(j, 2.0 * gamma * w)
        prog << core.CNOT(i, j)
    # Mixer.
    for q in range(MAXCUT_N):
        prog << core.RX(q, 2.0 * beta)
    prog << core.measure(list(range(MAXCUT_N)), list(range(MAXCUT_N)))
    return prog


# ---------------------------------------------------------------- helpers

def cut_value(bits: str) -> int:
    """bits[i] is node i's group (leftmost char = node 0)."""
    return sum(w for i, j, w in MAXCUT_EDGES if bits[i] != bits[j])


def brute_force_optimum() -> tuple[list[str], int]:
    best, best_strings = -1, []
    for assignment in product("01", repeat=MAXCUT_N):
        s = "".join(assignment)
        v = cut_value(s)
        if v > best:
            best, best_strings = v, [s]
        elif v == best:
            best_strings.append(s)
    return best_strings, best


def run_local(prog: core.QProg, shots: int) -> dict[str, int]:
    qvm = core.CPUQVM()
    qvm.run(prog, shots)
    return dict(qvm.result().get_counts())


def detect_bit_order(run_fn, shots: int = 200) -> str:
    """Determine whether count keys put qubit 0 on the right ('little') or left ('big').

    Runs X on qubit 0 only and checks where the '1' lands. Detection uses the SAME
    backend the results come from (run_fn), because the simulator and a real chip can
    in principle report bits in different orders — this keeps MaxCut bitstrings correct.
    """
    prog = core.QProg()
    prog << core.X(0)
    prog << core.measure([0, 1, 2], [0, 1, 2])
    counts = run_fn(prog, shots)
    key = max(counts, key=counts.get).strip().zfill(3)
    if key[-1] == "1" and key.count("1") == 1:
        return "little"  # qubit 0 is the rightmost character
    if key[0] == "1" and key.count("1") == 1:
        return "big"  # qubit 0 is the leftmost character
    raise RuntimeError(f"Unexpected bit-order probe result: {counts}")


def normalize(counts: dict[str, int], n_qubits: int, bit_order: str) -> dict[str, int]:
    """Re-key counts so that the leftmost character is qubit/node 0 (the app's convention)."""
    out: dict[str, int] = {}
    for key, c in counts.items():
        k = key.strip().zfill(n_qubits)
        if bit_order == "little":
            k = k[::-1]
        out[k] = out.get(k, 0) + int(c)
    return out


def _score_angles(gamma: float, beta: float, shots: int, bit_order: str) -> float:
    """Expected cut of our own p=1 circuit at these angles, on the local simulator."""
    counts = normalize(run_local(build_maxcut_qaoa(gamma, beta), shots), MAXCUT_N, bit_order)
    total = sum(counts.values()) or 1
    return sum(cut_value(k) * c for k, c in counts.items()) / total


def pyqpanda_alg_candidates() -> list[tuple[float, float]]:
    """Ask Origin's official QAOA optimizer (pyqpanda_alg) for p=1 angle candidates.

    The library uses different gamma/beta conventions than our transparent builder,
    so we never trust its angles directly: we return them (and sign/order variants)
    as *candidates* that pick_qaoa_angles() re-scores in our own circuit. Returns []
    if the library is not installed.
    """
    try:
        import sympy as sp  # noqa: PLC0415
        from pyqpanda_alg.QAOA import qaoa  # noqa: PLC0415
    except Exception:
        return []

    x = sp.symbols(f"x0:{MAXCUT_N}")
    # Maximize cut == minimize negative cut; edge cut term = w*(xi + xj - 2 xi xj).
    objective = sp.expand(sum(-w * (x[i] + x[j] - 2 * x[i] * x[j]) for i, j, w in MAXCUT_EDGES))
    try:
        _, params, _ = qaoa.QAOA(objective).run(layer=1, shots=2000)
        g, b = float(params[0]), float(params[1])
    except Exception as e:
        print(f"  (pyqpanda_alg candidate generation skipped: {e})")
        return []
    # Convention is uncertain, so offer both orderings and mod-pi folds; the
    # re-scoring step keeps only whatever actually performs in our own circuit.
    raw = [(g, b), (b, g)]
    folded = [(gg % math.pi, bb % (math.pi / 2)) for gg, bb in raw]
    return raw + folded


def pick_qaoa_angles(
    shots: int, bit_order: str, use_pyqpanda_alg: bool
) -> tuple[float, float, float, str]:
    """Find (gamma, beta) maximizing our circuit's expected cut.

    Always runs a deterministic coarse grid search (proven, zero extra deps).
    When use_pyqpanda_alg is set, Origin's official optimizer additionally proposes
    candidates, which are re-scored in our own circuit. Returns the best of both,
    plus a label noting which engine produced the winning angles.
    """
    best = (-1.0, 0.0, 0.0, "grid search")
    steps = 12
    for gi in range(1, steps):
        for bi in range(1, steps):
            gamma = math.pi * gi / steps
            beta = math.pi / 2 * bi / steps
            expected = _score_angles(gamma, beta, shots, bit_order)
            if expected > best[0]:
                best = (expected, gamma, beta, "grid search")

    if use_pyqpanda_alg:
        candidates = pyqpanda_alg_candidates()
        if candidates:
            print(f"  pyqpanda_alg proposed {len(candidates)} angle candidate(s); re-scoring in our circuit…")
        for gamma, beta in candidates:
            expected = _score_angles(gamma, beta, shots, bit_order)
            if expected > best[0]:
                best = (expected, gamma, beta, "pyqpanda_alg optimizer")
    return best  # (expected_cut, gamma, beta, engine_label)


# ---------------------------------------------------------------- backends

def load_env_file() -> None:
    """Load KEY=VALUE lines from quantum/.env.local into os.environ if present.

    This keeps the secret API key in a local, git-ignored file — it never needs
    to be typed on the command line, pasted into a chat, or committed.
    """
    env_path = Path(__file__).resolve().parent / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def get_cloud_backend(name: str):
    from pyqpanda3.qcloud import QCloudService

    load_env_file()
    api_key = os.environ.get("QPANDA3_API_KEY") or os.environ.get("ORIGINQC_API_KEY")
    if not api_key:
        sys.exit(
            "No API key found. Either create quantum/.env.local with a line\n"
            "  QPANDA3_API_KEY=your-key\n"
            "or set the QPANDA3_API_KEY environment variable. Get the key from your\n"
            "account at https://account.originqc.com.cn/ — never commit it."
        )
    service = QCloudService(api_key)
    try:
        print("Available backends:", service.backends())
    except Exception:
        pass
    return service.backend(name)


def run_cloud(backend, name: str, prog: core.QProg, shots: int, timeout_s: int) -> dict[str, int]:
    from pyqpanda3.qcloud import JobStatus, QCloudOptions

    kwargs = {}
    if name not in CLOUD_SIMULATORS:
        # Real QPU: enable error mitigation, qubit mapping, and circuit optimization.
        try:
            options = QCloudOptions()
            options.set_amend(True)
            options.set_mapping(True)
            options.set_optimization(True)
            kwargs["options"] = options
        except Exception:
            pass  # options API may differ between SDK versions; run without

    job = backend.run(prog, shots=shots, **kwargs)
    try:
        print(f"  job id: {job.job_id()}")
    except Exception:
        pass

    start = time.time()
    while True:
        status = job.status()
        print(f"  status: {status}  ({int(time.time() - start)}s)")
        if status == JobStatus.FINISHED:
            break
        if status == JobStatus.FAILED:
            raise RuntimeError(f"Cloud job failed: {job.result().error_message()}")
        if time.time() - start > timeout_s:
            raise TimeoutError(
                f"Job not finished after {timeout_s}s. It may still complete — "
                "check the QCloud console and re-run later if needed."
            )
        time.sleep(5)

    result = job.result()
    # QCloudResult.get_counts() returns empty on this SDK/backend; get_probs() is reliable.
    # Convert the probability distribution back to integer counts using the shot count.
    counts = {k: int(v) for k, v in result.get_counts().items()}
    if not counts:
        probs = result.get_probs()
        counts = {k: round(p * shots) for k, p in probs.items() if p > 0}
    if not counts:
        raise RuntimeError(
            "Job finished but returned no counts or probabilities. Raw payload: "
            + str(result.origin_data())[:300]
        )
    return counts


# ---------------------------------------------------------------- main

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--backend",
        default="local",
        help="local | full_amplitude (cloud simulator) | origin_wukong (real hardware) | any name service.backends() lists",
    )
    parser.add_argument("--shots", type=int, default=1000)
    parser.add_argument(
        "--experiments",
        nargs="+",
        default=["randomness", "ghz", "maxcut"],
        choices=["randomness", "ghz", "maxcut"],
    )
    parser.add_argument("--timeout", type=int, default=1800, help="cloud job timeout in seconds")
    parser.add_argument("--out", default=str(RESULTS_PATH), help="output JSON path (merged)")
    parser.add_argument(
        "--no-pyqpanda-alg",
        action="store_true",
        help="Skip Origin's official pyqpanda_alg QAOA optimizer for angle proposals "
        "(by default it is used when installed, with grid search as fallback).",
    )
    args = parser.parse_args()

    is_local = args.backend == "local"
    backend = None
    if not is_local:
        backend = get_cloud_backend(args.backend)
    backend_label = backend_description(args.backend, is_local)
    print(f"Backend: {backend_label}")

    # Raw execution against the chosen backend (before bit-order normalization).
    def raw_run(prog: core.QProg, shots: int) -> dict[str, int]:
        if is_local:
            return run_local(prog, shots)
        return run_cloud(backend, args.backend, prog, shots, args.timeout)

    # Bit ordering is a QCloud SDK formatting convention shared across its backends, so
    # for cloud runs we probe it on the fast cloud simulator (full_amplitude) rather than
    # spending real-hardware queue time on a probe job. Local runs probe the local QVM.
    if is_local:
        bit_order = detect_bit_order(run_local)
    elif args.backend in CLOUD_SIMULATORS:
        bit_order = detect_bit_order(raw_run)
    else:
        sim = get_cloud_backend("full_amplitude")
        bit_order = detect_bit_order(
            lambda prog, shots: run_cloud(sim, "full_amplitude", prog, shots, args.timeout)
        )
    print(f"Bit order convention in counts: qubit 0 is on the {'right' if bit_order == 'little' else 'left'}")

    def execute(prog: core.QProg, n_qubits: int) -> dict[str, int]:
        return normalize(raw_run(prog, args.shots), n_qubits, bit_order)

    results: list[dict] = []
    out_path = Path(args.out)

    def flush() -> None:
        """Merge the results so far into the output file. Called after each experiment so a
        slow or interrupted hardware run still saves whatever has already completed."""
        existing: dict[str, dict] = {}
        if out_path.exists():
            try:
                for entry in json.loads(out_path.read_text(encoding="utf-8")):
                    existing[entry["experiment"]] = entry
            except (json.JSONDecodeError, KeyError, TypeError):
                print(f"warning: could not parse existing {out_path}; it will be overwritten")
        for entry in results:
            existing[entry["experiment"]] = entry
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(list(existing.values()), indent=2), encoding="utf-8")
        print(f"  saved -> {out_path}")

    today = date.today().isoformat()

    if "randomness" in args.experiments:
        print("\n[A] Quantum randomness (3 qubits, H + measure)")
        counts = execute(build_randomness(), 3)
        ideal = {format(i, "03b"): args.shots // 8 for i in range(8)}
        results.append(
            {
                "experiment": "randomness",
                "shots": args.shots,
                "backend": backend_label,
                "date": today,
                "counts": counts,
                "idealCounts": ideal,
                "notes": "Three Hadamard gates + measurement. Ideal distribution is uniform over the 8 outcomes.",
                "limitations": SHARED_LIMITATION,
            }
        )
        print("  counts:", dict(sorted(counts.items())))
        flush()

    if "ghz" in args.experiments:
        print("\n[B] GHZ correlation (3 qubits)")
        counts = execute(build_ghz(), 3)
        results.append(
            {
                "experiment": "ghz",
                "shots": args.shots,
                "backend": backend_label,
                "date": today,
                "counts": counts,
                "idealCounts": {"000": args.shots // 2, "111": args.shots // 2},
                "notes": "GHZ circuit (H, CNOT, CNOT). Ideally only 000 and 111 appear; everything else is device noise.",
                "limitations": SHARED_LIMITATION,
            }
        )
        leak = sum(c for k, c in counts.items() if k not in ("000", "111")) / max(1, sum(counts.values()))
        print(f"  counts: {dict(sorted(counts.items()))}\n  probability outside 000/111: {leak:.1%}")
        flush()

    if "maxcut" in args.experiments:
        print("\n[C] MaxCut QAOA p=1 (5 nodes) — picking angles on the local simulator…")
        expected, gamma, beta, engine = pick_qaoa_angles(2000, bit_order, not args.no_pyqpanda_alg)
        opt_strings, opt_value = brute_force_optimum()
        print(f"  chosen gamma={gamma:.3f}, beta={beta:.3f} via {engine} (local expected cut {expected:.2f})")
        print(f"  brute-force optimum: {opt_strings} with cut value {opt_value}")

        prog = build_maxcut_qaoa(gamma, beta)
        counts = execute(prog, MAXCUT_N)
        ideal = normalize(run_local(prog, args.shots), MAXCUT_N, bit_order)

        if not counts:
            raise RuntimeError("MaxCut run returned no measurement counts; aborting before writing results.")
        top = sorted(counts.items(), key=lambda kv: -kv[1])[:5]
        print("  top measured bitstrings (bit i = node i):")
        for k, c in top:
            mark = "  <-- OPTIMAL" if k in opt_strings else ""
            print(f"    {k}: {c}  (cut value {cut_value(k)}){mark}")
        matched = top[0][0] in opt_strings

        results.append(
            {
                "experiment": "maxcut",
                "shots": args.shots,
                "backend": backend_label,
                "date": today,
                "counts": counts,
                "idealCounts": ideal,
                "notes": (
                    f"QAOA p=1 with gamma={gamma:.3f}, beta={beta:.3f}, chosen by {engine} (re-scored on a local "
                    f"simulator). Brute-force optimum: {' / '.join(opt_strings)} (cut value {opt_value}). "
                    f"The most-sampled measured bitstring {'matched' if matched else 'did NOT match'} the optimum. "
                    "At this size the classical method is exact and instant; this run demonstrates encoding and workflow only."
                ),
                "limitations": SHARED_LIMITATION,
            }
        )
        flush()

    print(f"\nDone. Results in {out_path}.")
    print("Commit and push this file to publish the results on the live site, "
          "or paste an entry into the app's admin panel.")


if __name__ == "__main__":
    main()
