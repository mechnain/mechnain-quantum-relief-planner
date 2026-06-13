# Quantum runner — Origin QCloud integration

This folder connects the app to real quantum runs on [Origin Quantum's cloud](https://qcloud.originqc.com.cn/)
(account: https://account.originqc.com.cn/). The web app itself stays static and key-free:
this script runs **on your machine**, submits the three demo circuits, and writes the measured
counts to `public/wukong-results.json`. The app loads that file at startup and shows the
results — labeled with the actual backend used — instead of the bundled sample data.

Your API key never touches the repository or the published site.

## Setup

```
pip install -r requirements.txt
```

Get your API key from the user center at https://account.originqc.com.cn/ and set it:

```powershell
$env:QPANDA3_API_KEY = "your-key"        # PowerShell
```
```bash
export QPANDA3_API_KEY=your-key          # bash
```

## Run

```bash
# Smoke test, no account needed (labeled "local simulator", never as hardware):
python run_experiments.py --backend local

# Origin cloud simulator (labeled as a simulator run):
python run_experiments.py --backend full_amplitude

# Real Origin Wukong hardware (queues; can take a while):
python run_experiments.py --backend origin_wukong

# One experiment at a time also works:
python run_experiments.py --backend origin_wukong --experiments maxcut --shots 1000
```

## Publish

```bash
git add public/wukong-results.json
git commit -m "Add Origin Wukong run results"
git push
```

The GitHub Pages workflow redeploys automatically and every visitor sees the real results.

## Optional: Origin's official QAOA optimizer (pyqpanda_alg)

Origin publishes an algorithm library, [`pyqpanda_alg`](https://github.com/OriginQ/pyqpanda-algorithm),
with a real QUBO→Ising→QAOA variational optimizer. When it is installed, the runner
uses it to **propose** MaxCut angle candidates. Those candidates are then re-scored in
our own transparent circuit before any are used, so a convention mismatch or a weak
variational result can never degrade the demo. Pass `--no-pyqpanda-alg` to skip it and
use only the deterministic grid search (the runner works the same either way).

An honest finding worth keeping: on this 5-node instance, `pyqpanda_alg`'s p=1
variational optimizer lands on a sub-optimal cut, while the exhaustive grid search
reliably finds the true optimum. That is the project's whole thesis in miniature — at
this scale the classical approach wins, and we show it rather than hide it. The runner
prints which engine produced the winning angles and records it in the result notes.

## Honesty rules (enforced by the script)

- The `backend` field in the JSON records what actually ran. Simulator runs are
  explicitly labeled "not hardware" — the app displays this verbatim.
- QAOA angles are chosen by grid search on a local simulator before submission;
  the notes field says so.
- The script prints the brute-force MaxCut optimum next to the measured top
  bitstrings, and records in the notes whether the run found the optimum —
  including when it didn't. A miss is an instructive result, not a failure to hide.
