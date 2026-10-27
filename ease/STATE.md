# Ease-of-use run state

Read this first on resume. Plan: `~/.claude/plans/snoopy-leaping-cook.md`. Prompt: `~/Desktop/SPREADLINE_EASE_OF_USE_PROMPT.md` (Revision 1).

## Position

- **Phase:** 0 (baseline)
- **Done:** steps 1–5. Checks are in `BASELINE.md`, all green on the existing suites. Inventory, primary path, and task metrics
  `base` (three runs per host, stable).
- **Step 6:** capture running (`EASE_CAPTURE=1 EASE_LABEL=base`).
- **Next:** check the capture output, judge unexplained terms, commit `ease: baseline`, then Phase 1 sweep.

## Measured animation share (for STOP A)

The server answers in 25–190 ms, and the decision appears at about 5,320 ms on every new evaluation (`DECISION_TRANSITION_MS` 5000).

- Standalone T1: wait 5,518 ms, of which the "decision and reason" segment is 5,332 ms (server 33 ms), so the hold is about 5.0 s, **~91%** of T1's wait.
- Streamlit T1: wait 6,108 ms, of which the segment is 5,319 ms (server 190 ms), so the hold is about 5.0 s, **~82%**.
- Standalone T3: wait 5,425 ms, of which the recalculation is 5,319 ms (server 25 ms), so **~92%**. Streamlit T3: 5,577 ms, recalculation 5,319 (server 79), so **~90%**.
- T4 is the same shape (5,316 / 5,324 ms segment). T5 and T6 have no hold (91–191 ms).

## Fixed facts

- Worktree: `.claude/worktrees/ease-of-use`, created with `EnterWorktree(name: "ease-of-use")`.
- Branch: **`worktree-ease-of-use`**. EnterWorktree names it this way. The prompt's fallback name
  `claude/ease-of-use` applies only when EnterWorktree is unavailable.
- `<base>` = **`2fbfdef90d4477b478593afb7766ca20469c171d`** = `origin/main` after `git fetch origin` (fetch succeeded).
  Its tree is identical to the owner's local `claude/render-deployment` @ `ac6f3a1`.
- Python: `.venv` is from `uv venv --python 3.12 --seed` (3.12.14). `--seed` is needed because both check scripts start with
  `python3 -m pip check`. `streamlit_app/requirements.txt` is also installed, as CI does.
- **Shell activation:** this worktree-isolated session refuses `source .venv/bin/activate`. Every Python-running
  command uses `PATH="$PWD/.venv/bin:$PATH"` instead; `ease/tools/steps.sh` exports it. The effect is the same.
- The guard also refuses `cd <dir> && git ...` and complex compound commands. Use `npm --prefix frontend`, and keep git calls plain.
- Node: default v22.23.3. CI's Streamlit job builds on Node 24 (`ci.yml:65`); nvm has v24.19.0. The baseline records
  whether `build:streamlit` on Node 22 reproduces the committed build dir (step `build-dir-diff`).
- Playwright 1.63.0 with Chromium installed.
- Ports 8000 / 5173 / 8501: check that they're free before every browser suite. Never run two browser suites at once.

## Path classes (section 3's regex)

- Class A possible: `frontend/src/views/*`, `components/*`, top-level `frontend/src/*.tsx` (App, AccessGate, SavedCases,
  Scenarios, DomainWorkflows, CaseDialogs, EditDialog, Review, TraceInspector, RejectedInputFields, CommercialComposer,
  streamlitEntry, ...), `styles.css`, `errorCopy.ts`, `fieldCatalog.ts`, `workspaceSelectors.ts`, `workspaceTabs.ts`.
- **Class B (outside the regex):** `frontend/src/excel/ExcelImport.tsx` (so every T4 screen fix is class B; this looks like an
  unintended gap, and STOP A raises it), `decisionPreparation.ts`, `useAnalystWorkspace.ts`, `prototypeDisclaimer.ts`,
  `streamlit_app/app.py` (sign-in copy), and every backend, gate, contract, transport and number-helper file.

## Measurement declarations

- Controls: the section 5 query, filtered to visible elements inside the 1440×900 viewport.
- Primary actions (Done 5): visible elements with class `.primary` (`styles.css:573`). This is a second CSS query, a measurement
  aid only, and it is checked against the screenshots.
- Wait: real clock, measured from the last acting call resolving to the answer assertion resolving; median of three runs.

## Known baseline failures

(filled from `ease/BASELINE.md` when step 3 finishes)

## Commits

(none yet)
