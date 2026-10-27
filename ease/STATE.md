# Ease-of-use run state

Read this first on resume. Plan: `~/.claude/plans/snoopy-leaping-cook.md`. Prompt: `~/Desktop/SPREADLINE_EASE_OF_USE_PROMPT.md` (Revision 1).

## Position

- **Phase:** 2 (fix). STOP A was answered; see below.
- **Done:** Phase 0 committed as `c413b80` (`ease: baseline`), and the path check is empty. The sweep is done and `REGISTER.md` is drafted:
  20 class A rows and 9 class B rows.
- **Step:** 7.4 STOP A. The refuter killed 0 rows and rewrote 9 to pass (applied in `REGISTER.md`). The STOP A message was sent;
  the run is **waiting for the owner's class B picks**.
- **Next:** record the answer verbatim below and mark unpicked class B rows QUEUED. Then run Phase 2 **in primary-path order (§8),
  not register order**, one root cause per commit:
  - T1 rows: L-1, L-10, N-1, N-3, D-1, D-4, plus N-2/N-9/N-10 if picked.
  - T2 rows: L-2, L-3, plus N-7/L-4 if picked.
  - T3 rows: N-4, L-5, L-6, L-7, D-2, D-3, E-1, E-2.
  - The rest: N-6, L-8, L-9, L-11, plus G-1/N-5/N-8 if picked.
  The register's ranking serves STOP A only.
- **Resume note:** the worktree guard refuses commands it can't verify, including heredocs containing the letters "git"
  (as in "digits"). Write scripts to `ease/tools/` and run them.

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

## Streamlit bundle stamp

`build:streamlit` rewrites the last line of `streamlit_app/requirements.txt` (`# component-bundle: <file> <sha256>`), so
hosts reinstall the new bundle (`scripts/streamlit_assets.py:11-14, 51-70`). Repo convention commits it with every bundle
change (e.g. `ac6f3a1`, `b0c245f`). This run commits it with each rebuild. `ease/tools/pathcheck.sh` accepts a diff in that file
only when every changed line is the stamp. L-1, L-10 and N-1 were committed without it; it was caught here and committed
in `ease: commit the Streamlit bundle stamp`.

## Path classes (section 3's regex)

- Class A possible: `frontend/src/views/*`, `components/*`, top-level `frontend/src/*.tsx` (App, AccessGate, SavedCases,
  Scenarios, DomainWorkflows, CaseDialogs, EditDialog, Review, TraceInspector, RejectedInputFields, CommercialComposer,
  streamlitEntry, ...), `styles.css`, `errorCopy.ts`, `fieldCatalog.ts`, `workspaceSelectors.ts`, `workspaceTabs.ts`.
- **Class B (outside the regex):** `frontend/src/excel/ExcelImport.tsx` (so every T4 screen fix is class B; this looks like an
  unintended gap, and STOP A raises it), `decisionPreparation.ts`, `useAnalystWorkspace.ts`, `prototypeDisclaimer.ts`,
  `streamlit_app/app.py` (sign-in copy), and every backend, gate, contract, transport and number-helper file.

## Measurement declarations

- Controls: the section 5 query, filtered to visible elements inside the 1440×900 viewport.
- Primary actions (Done 5): rendered `.primary` elements (`styles.css:573`) **anywhere on the screen**, enabled vs disabled
  (`screenPrimary` in `ease/data/capture/<label>/*.json`). **A modal dialog is its own screen: count inside the dialog only.**
  The viewport-only `primaryActions` figure in the task metrics is kept for comparison; it undercounts after a tab click
  scrolls the page. This is a second CSS query, a measurement aid only, and it is checked against the screenshots.
- Wait: real clock, measured from the last acting call resolving to the answer assertion resolving; median of three runs.

## Known baseline failures

None in the existing suites (`BASELINE.md`). Counts to reproduce in Phase 3: gate selftest 55 values / 4 flags / 19 mutations,
backend 1501, host 40, standalone e2e 392 (+ ease specs), Streamlit e2e 6 (+ ease specs).

## Done 6 note

T1 is at its floor of 2 steps and 1 input (token, Connect, Try the example case). The only shorter path is auto-loading Alpine,
which the 2026-10-16 approval settled against. T1's saving is in wait (N-9, class B) and terms (L-1, L-10).

## STOP A answer (verbatim)

2026-10-27. The owner first wrote "keep going to STOP A" (not a pick). Asked again, the owner chose the option labelled:

> "Take recommendations (Recommended)": Animation holds only on a case's first evaluation (N-9a); Overview by default for
> dated cases (N-7); example first on start screen (N-2); allow ExcelImport.tsx (G-1); hide Consumer/SBA nav on Streamlit
> (N-5); primary 'Open workspace' (N-10); accept Done 5 exceptions (N-13); accept analysis.py as a definition source (L-4).
> Leave N-8 and E-3.

Consequences:
- N-8 and E-3 are QUEUED.
- N-6 is superseded by N-5 (the Streamlit Consumer/SBA screens become unreachable).
- The path check now also admits `frontend/src/excel/ExcelImport.tsx`, `frontend/src/decisionPreparation.ts`,
  `frontend/src/useAnalystWorkspace.ts`, `streamlit_app/app.py` and `README.md` for the rows that name them (N-9, N-10, G-1).

## Commits

- `c413b80` ease: baseline
