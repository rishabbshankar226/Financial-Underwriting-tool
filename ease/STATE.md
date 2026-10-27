# Ease-of-use run state

Read this first on resume. Plan: `~/.claude/plans/snoopy-leaping-cook.md`. Prompt: `~/Desktop/SPREADLINE_EASE_OF_USE_PROMPT.md` (Revision 1).

## Position

- **Phase:** 2 (fix). STOP A was answered; see below. **PAUSED 2026-10-27 at the owner's word (going offline).**

### STOP B reached (2026-10-27)

- Final full run green: `ease/logs/final`, recorded in `docs/VERIFICATION.md`.
- `ease/REPORT.md` written. The path check shows only the owner-picked files.
- The run waits for the owner: push the branch and open a pull request? Neither happens without a yes.

### Phase 3, latest (2026-10-27)

- Done:
  - `after` metrics: figures 78/78 equal; T3 wait 5.4 s → 0.2 s; no steps rise.
  - Same-machine T1 A/B: equal.
  - Ceilings are in the task specs.
  - `after` screenshots.
  - Page-level primary audit, which led to the N-14 refinement `f0a49a6` and queued row N-15.
  - Fresh-eyes walkthrough: all six tasks finished. E-4 `836ccce` and E-5 `589b8eb` fixed; seven rows queued.
- Running: `steps.sh final`.
- Then:
  - `python3 ease/tools/build_report.py "<final summary>"`;
  - add the dated entry at the top of `docs/VERIFICATION.md`;
  - commit, then STOP B.

### Phase 3 progress

- Step 1, `steps.sh after`: everything matched the baseline except standalone e2e, at **409 passed / 4 failed**. All four were in
  `workspace.spec.ts`:
  - three were a legacy case left on Overview, fixed in the product by `43e69f8` (a legacy case leaves Overview for Spread);
  - one still expected a blank draft rationale to be rejected (N-4), fixed in the spec by `e16947e`.
  The affected files now pass. A **final full `steps.sh` rerun is still owed** after the remaining Phase 3 changes (ceilings).
- Gate 55/4/19, backend 1501, host 40, Streamlit e2e 13 passed (+2 gated skips), audit clean, and the build dir reproduces.
- Step 2: `tasks.sh after` running.

### PHASE 2 COMPLETE (2026-10-27); now Phase 3

All rows are FIXED, REFUTED (E-2), QUEUED (N-8, E-3, N-6) or ACCEPTED (N-13). Latest fix: `ce65a1c` (N-14).

Phase 3 plan (prompt §9):
1. `bash ease/tools/steps.sh after`. Compare with `BASELINE.md`: gate 55/4/19, backend 1501, host 40, no new failures.
2. `bash ease/tools/tasks.sh after`, then `python3 ease/tools/terms.py after` (after editing TERMS to the after-judgement).
   Compare figures base vs after value for value, then set ceilings in the task specs.
3. Capture `EASE_CAPTURE=1 EASE_LABEL=after` on both hosts, saved to `ease/shots/after/`.
4. Fresh-eyes walkthrough agent (sees neither the register nor the diff).
5. `ease/REPORT.md`, a dated entry in `docs/VERIFICATION.md`, commit, STOP B.

### Progress (latest first), 2026-10-27

- **Fixed:** L-1, L-10, N-1, N-2, N-3, D-1, D-4, N-9, N-10, L-2, L-3, N-7, N-4, L-5, E-1, L-6, L-7, D-2, D-3.
- **Refuted:** E-2. **Queued:** N-8, E-3, N-6 (superseded by N-5). **No code:** N-13.
- **Remaining class A:** N-11, N-12, L-8, L-9, L-11. **Remaining class B (picked):** N-5, G-1 (T4 copy rows), L-4.
- **Then Phase 3.**
- **Revert-proof rule:** a locator miss is not a catch; order each test so its first failing line is a real assertion.

### Stale Streamlit component (found 2026-10-27, fixed in `ease/tools/rebuild.sh`)

The Streamlit host serves `spreadline_workspace` **as installed in `.venv`** from `./streamlit_app/component`. It was installed once,
at setup, with the baseline bundle `index-KxsPhx50.js`. **Every Streamlit browser run in Phase 2 before this note tested the
baseline component**, not the rebuilt one. That includes "Streamlit 12/12" after N-7 and the Streamlit specs run alongside other
rows. N-10 is unaffected (`app.py` runs from source).
- `rebuild.sh` now reinstalls the component after every build (`uv pip install --reinstall-package spreadline-workspace --no-deps`), as CI installs after building.
- Phase 3 must rerun the full Streamlit suite against the current bundle. Treat no earlier Phase 2 Streamlit result as evidence.

### Resumed after the second pause (2026-10-27)

N-7 was reworked in the working tree, on top of WIP commit `a063238`:
- The tab is now chosen **when a fresh dated evaluation starts**, not when it completes. The failure detail showed completion
  overriding a tab the user had picked during the hold (`review-workspace.spec.ts:259`).
- Legacy cases keep the current tab (`scenarios-workspace.spec.ts:349`).
- Twenty spec insertions of `openView(page, "spread")` via `ease/tools/n7_specs.py`. `landing.spec.ts:143` now asserts Overview as
  the default, then selects Spread for its unchanged keyboard sequence.
- The CALCULATING timeouts in scenarios :106/:230/:415 and saved :968/:1019 came from a 35-minute run on a slow (likely sleeping)
  machine; they passed in the earlier full run.
- Next: confirm the 11-file run, then amend into the N-7 commit, run the revert proof, then the T3 rows.

### PAUSED AGAIN 2026-10-27 (owner going offline)

N-7 is committed as a **WIP commit that breaks 23 standalone specs** (listed below), on purpose so nothing is lost. On resume:
1. Rerun those 10 spec files to get error lines. That collection run was cut off by the pause, so scratchpad `n7-failures.txt` may
   be missing or partial.
2. Add `openView(page, "spread")` where each test touches Spread after a fresh dated evaluation. landing.spec:143's default
   tab expectation becomes Overview. Change expected values only; never loosen.
3. Amend into the N-7 commit (or follow up with `ease(N-7): specs follow the Overview default`). Then run the revert proof
   (`ease-fixes.spec.ts` "N-7") and both full suites.

The failing tests at the pause:
- analysis.spec.ts:341, :414
- assessment.spec.ts:4, :54, :173, :342
- institutional-quality.spec.ts:9, :38, :260, :335 (375px and 1280px)
- institutional-workspace.spec.ts:74, :103
- interface.spec.ts:4
- landing.spec.ts:143
- review-workspace.spec.ts:259
- saved-workspace.spec.ts:297, :427, :675, :764
- scenarios-workspace.spec.ts:340
- trace-accessibility.spec.ts:5 (375px and 1280px)

### Current position (resumed 2026-10-27)

- **Fixed and committed:** L-1, L-10, N-1, N-2, N-3, D-1, D-4, N-9, N-10 (verified), L-2, L-3. E-2 REFUTED (blur validation
  already exists at `EditDialog.tsx:110`). Step 0 below is resolved as a flake.
- **In progress: N-7 (uncommitted in the working tree):**
  - `App.tsx` effect: a fresh dated evaluation goes to the Overview tab.
  - `views/workspaceTabs.ts` comment, `docs/WORKSPACE.md` Views line, and the `ease-fixes.spec.ts` N-7 test.
  - The full standalone suite then gave **23 failures** (382 passed): specs that assume Spread is selected after a fresh dated
    evaluation. Streamlit is 12/12.
  - Fix each by adding `await openView(page, "spread")` before its Spread interaction (and landing.spec:143's expected default
    becomes Overview). Error detail is being collected in scratchpad `n7-failures.txt`.
  - Then: rebuild, commit N-7 with those spec updates, revert proof, full suite again.
- **Then the T3 rows:**
  - N-4: `EditDialog.tsx:80` passes `{ requireRationale: saved }`; the label reads "Rationale (optional)" for drafts; HistoryView shows
    "No rationale given" when empty.
  - L-5: Save dialog title "Save case", eyebrow dropped, plain fine print. The button becomes **"Save"**, not "Save case", to avoid
    a name clash with the brand-bar "Save case" (about 25 spec texts to update).
  - E-1: a blank-rationale check in `SaveCaseDialog` before the contract call.
  - L-6: edit help "Dollar amount, such as 600,000" for USD fields; eyebrow dropped.
  - L-7: "Latest when fetched" becomes "latest when last refreshed", and "Check replay" becomes "Replay this revision (read-only)"
    (about 18 spec texts plus `docs/WORKSPACE.md`).
  - D-2, D-3.
- **Rule learned:** never edit `frontend/src` while a Vite-backed browser suite runs (hot reload corrupts the run).

### Resume here (paused 2026-10-27)

1. **DONE on resume:** N-10 verified (see REGISTER). Original note: **N-10, unverified WIP commit.** `streamlit_app/app.py` has `type="primary"` on "Open workspace"; ruff and mypy pass.
   Run `npm --prefix frontend run test:e2e:streamlit -- streamlit-tests/ease-fixes.spec.ts` (with `PATH="$PWD/.venv/bin:$PATH"`).
   The test's `data-testid` pattern `stBaseButton-primaryFormSubmit` is **unverified** for Streamlit 1.66, so fix the locator
   if it fails on the id rather than the style. Then run `bash ease/tools/revert-proof.sh streamlit "N-10" streamlit-tests/ease-fixes.spec.ts streamlit_app/app.py`,
   run `python3 -m pytest -q streamlit_app/tests`, record the row FIXED, and amend the WIP commit message.
0. **RESOLVED on resume: it was a flake, not a regression.** `saved-workspace.spec.ts:154` passed alone, in its file (21/21) and in a stable-tree batch (71/72; the 1 failure there was a missed L-3 text update, fixed in `85f0603`). A second batch failure was caused by editing `frontend/src` while a Vite-backed suite ran: **never edit served source during a browser run.** Original note follows. **FIRST: a possible regression.** The batch `tests/decision-preparation.spec.ts tests/analysis.spec.ts tests/assessment.spec.ts
   tests/saved-workspace.spec.ts tests/ease-fixes.spec.ts` (run after N-9, at `31f3728`) gave **57 passed, 1 failed**:
   `tests/saved-workspace.spec.ts:154` "two contexts require explicit conflict review before a fresh saved edit". It passed in
   the baseline (392/392).
   - Rerun it alone.
   - If it fails, bisect over the Phase 2 commits with `git checkout <sha> -- frontend/src`. Prime suspects: **N-9**
     (`useAnalystWorkspace.ts`, which skips the hold whenever `draft.edit` is set, possibly also on saved-edit paths) and
     **D-4** (the pending panel hidden while preparing).
   - Not investigated before the pause.
2. (Superseded by step 0.) The batch above was the "unfinished check".
3. **Then continue Phase 2 in primary-path order:**
   - T2: L-2, L-3, N-7, L-4.
   - T3: N-4, L-5, L-6, L-7, D-2, D-3, E-1, E-2.
   - Rest: N-5, N-11, N-12, L-8, L-9, L-11, then G-1 (Excel/T4 copy rows to add first).
   - N-13 needs no code (accepted exceptions).
4. **Per-commit routine:** edit; `bash ease/tools/rebuild.sh`; stage the build dir **and** `streamlit_app/requirements.txt`; commit
   `ease(<ID>): …`; run `bash ease/tools/revert-proof.sh …` for behaviour rows; `bash ease/tools/pathcheck.sh`; run the reachable specs;
   then `python3 ease/tools/status.py <ID> 'FIXED …'`. Behaviour tests go in `frontend/tests/ease-fixes.spec.ts`.
5. **Phase 3** after that, per the prompt §9.
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
