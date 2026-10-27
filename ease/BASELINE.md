# Baseline (Phase 0)

Run 2026-10-27 at `<base>` `2fbfdef` in `.claude/worktrees/ease-of-use`, with Python 3.12.14 (uv venv), Node v22.23.3
and Playwright 1.63.0 Chromium. Command: `bash ease/tools/steps.sh base`. It runs every line of
`scripts/run_all_checks.sh`, then of `scripts/run_streamlit_checks.sh`, continuing past a failure. Raw logs are in
`ease/logs/base/`, which is gitignored.

## Check results

| # | Step | Exit | Result |
| --- | --- | --- | --- |
| 01 | `pip check` | 0 | No broken requirements |
| 02 | `ruff` backend and gate | 0 | All checks passed |
| 03 | `mypy --strict` backend and gate | 0 | No issues in 36 source files |
| 04 | gate `--selftest` | 0 | **SELFTEST PASS: 55 fixture values and 4 flags pinned correctly, all 19 mutations killed.** |
| 05 | `docs/precision_probe.py` | 0 | Completed |
| 06 | backend `pytest -q` | 0 | **1501 passed** |
| 07 | `npm audit --audit-level=high` | 0 | Found 0 vulnerabilities |
| 08 | `test:decimal` | 0 | 11 of 11 pass |
| 09 | `npm run build` | 0 | Built |
| 10 | standalone e2e (`CI=1`) | 0 | **392 passed** (13.7 min); collected before the ease specs existed |
| 11 | `pip check` | 0 | No broken requirements |
| 12 | `ruff` host | 0 | All checks passed |
| 13 | `mypy --strict` host | 0 | No issues in 4 source files |
| 14 | host `pytest -q` | 0 | **40 passed** |
| 15 | `build:streamlit` (Node 22) | 0 | Built |
| 16 | `streamlit_assets.py check` | 0 | Assets match their source, manifest and requirements stamp |
| 17 | `git diff --exit-code` on the build dir | 0 | **Byte-identical on Node 22**, so CI's Node 24 isn't needed for rebuilds |
| 18 | Streamlit e2e | 1 | **6 existing tests passed.** The 1 failure and 4 not-run are the new `ease-tasks.spec.ts`, written while the run was going. It was a harness bug (`\b` word boundaries in a text filter that matches concatenated text content), fixed before the measured runs. The two `ease-capture` tests were skipped (gated). |

**Known baseline failures in the existing suites: none.** Phase 3 must reproduce: gate selftest 55/4/19, backend
1501 passed, host 40 passed, standalone e2e 392 passed plus the ease task specs, and Streamlit e2e 6 passed plus the ease task specs.

## Task metrics

See `ease/data/metrics-base.json` (median of three runs per host) and `ease/data/figures-base.json`. Counting
rules are in `frontend/tests/easeHarness.ts`:

- **steps:** each click, acting key press or submit. Choosing a file counts as one step and one input.
- **inputs:** each field filled or option chosen.
- **wait:** the sum, over the task's waits, of the real-clock time from the acting call resolving to the answer being
  visible. `serverMs` is when "Calculation received" appeared, which is the response before the presentation hold.
- **controls:** the section 5 query, visible inside 1440×900, on the task's first screen.
- **primaryActions:** the visible `.primary` elements on that screen. This is a declared measurement aid for Done 5.
- **unexplainedTerms:** judged by hand from the screenshots.
