# Ease-of-use pass: report

Branch `worktree-ease-of-use` (worktree `.claude/worktrees/ease-of-use`), from `origin/main` `2fbfdef`. Nothing is pushed or merged.
Prompt: `~/Desktop/SPREADLINE_EASE_OF_USE_PROMPT.md` (Revision 1). Run record: `ease/STATE.md`, `ease/REGISTER.md`, `ease/BASELINE.md`.

## What changed

Spreadline now reads more simply to someone opening it cold.

- **Start screen.** The example case comes first and is the one highlighted action.
- **Connect screen.** It speaks plain English instead of bearer tokens and HTTP codes.
- **Workspace.** It opens a new case on its explanation (Overview) instead of the spreadsheet of working. The decision sits higher, and the
  saved-record identifiers and the long calculation details are folded under the answer instead of ahead of it. Every
  figure and threshold the decision uses is still on screen without a click.
- **KPI labels.** Hover a ratio's name, or let a screen reader read it, to get its definition, taken from the server's own formulas.
- **Recalculation.** Changing a figure no longer replays the five-second animation, so T3's adjusted decision appears in about
  0.2 s instead of 5.4 s.
- **Rationale.** A draft edit no longer demands one, which the 2026-10-16 approval already specified.
- **Labels and messages.** Wording that read like system internals ("Latest when fetched", "Check replay", "Invalid saved-case
  response or command", raw error codes and JSON pointers) now reads plainly, and every distinct saved, recovery and
  revision state keeps its own label.
- **Server output unchanged.** No number changed: the 78 figures the task specs read are identical before and after.

## Before and after, T1 to T6

Median of three runs per host at 1440×900. Unexplained terms are judged by hand (`ease/tools/terms.py`). Primary actions
are counted in the viewport by the task metrics; the page-level count is below.

| Host | Task | Steps | Inputs | Wait (ms) | Unexplained terms | First-screen controls | Primary actions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| standalone | T1 | 2 → 2 | 1 → 1 | 5518 → 5707 | 16 → 8 | 2 → 2 | 1 → 1 |
| standalone | T2 | 0 → 0 | 0 → 0 | 0 → 0 | 14 → 8 | 11 → 10 | 1 → 1 |
| standalone | T3 | 6 → 6 | 3 → 2 | 5425 → 184 | 14 → 6 | 11 → 10 | 1 → 1 |
| standalone | T4 | 3 → 3 | 1 → 1 | 5392 → 5411 | 8 → 3 | 12 → 12 | 0 → 1 |
| standalone | T5 | 3 → 3 | 0 → 0 | 91 → 89 | 5 → 3 | 12 → 12 | 0 → 1 |
| standalone | T6 | 4 → 4 | 2 → 2 | 113 → 112 | 11 → 11 | 12 → 12 | 0 → 1 |
| streamlit | T1 | 2 → 2 | 1 → 1 | 6108 → 6614 | 11 → 8 | 5 → 5 | 0 → 0 |
| streamlit | T2 | 0 → 0 | 0 → 0 | 0 → 0 | 14 → 8 | 13 → 10 | 1 → 1 |
| streamlit | T3 | 6 → 6 | 3 → 2 | 5577 → 557 | 14 → 6 | 13 → 10 | 1 → 1 |
| streamlit | T4 | 3 → 3 | 1 → 1 | 5352 → 5331 | 8 → 3 | 14 → 12 | 0 → 1 |
| streamlit | T5 | 3 → 3 | 0 → 0 | 191 → 292 | 5 → 3 | 14 → 12 | 0 → 1 |

**Figures:** all 78 figures the task specs read (outcomes, reasons, the three ratios with their values, policy lines,
statuses and cushions before and after the T3 edit, the memo recommendation, consumer DTI and the SBA result) are
identical, value for value (`ease/tools/compare.py`).

**Wait.**
- T3's wait falls from 5.4 s to 0.2 s (standalone) and from 5.6 s to 0.6 s (Streamlit). Unsaved edits no longer replay the hold (N-9).
- T1 and T4 still show the five-second preparation by design (N-9 kept it for a new case).
- T1's apparent rise, from 5,518 to 5,707 ms standalone and 6,108 to 6,614 ms on Streamlit, was checked with a same-machine A/B
  (`ease/tools/ab.sh`). Base `frontend/src` gave 5,599 / 6,612 ms and HEAD gave 5,611 / 6,619 ms. The rise is the machine,
  not a fix.
- Streamlit T5 (191 to 292 ms) was not A/B'd, because its path depends on renamed save labels. It has no presentation hold,
  and its spread across runs (182 to 304 ms) covers the difference.

**Done 6:** no task takes more steps than at baseline. T1 is at its floor of 2 steps and 1 input: the only shorter path is
auto-loading the example, which the 2026-10-16 approval settled against.

**Done 5, one visually primary action per screen** (page-level audit, `ease/data/capture/after/*.json`):
- The start screen, the Excel intake and review, every error and recovery state, the edit and save dialogs, the scenario
  composer and the Consumer and SBA screens now have exactly one enabled primary action.
- Accepted exceptions (N-13, owner): saved-case, legacy and waiting screens, where nothing is pending.
- Still zero: a rejected JSON import (S70, row N-15, QUEUED because the fix adds a control).
- The Streamlit access page reads 0 to the `.primary` count because Streamlit styles its own primary button. The N-10 test
  checks Streamlit's primary kind directly.

## Fixed, queued and refuted rows

### Fixed (31)

| ID | Screen | Outcome, commit and test |
| --- | --- | --- |
| N-4 | Edit dialog | FIXED `91533d7`, with spec follow-ups `0826e95` and `e16947e`. Test `ease-fixes.spec.ts` N-4. Revert: Expected 0, Received 1 (the dialog stays open demanding a rationale); restored: 1 passed. A saved revision still requires one |
| L-1 | Connect (S08) | FIXED `2975d9f`. Wording row: lead, reconnect note, placeholder and help reworded in place; label and button unchanged; no spec asserted the old text |
| L-2 | KPI tiles (S20) | FIXED `1718782`. Test `ease-fixes.spec.ts` L-2. Revert (FIX=1718782): Expected /^EBITDA divided by annual debt service/, Received ""; restored: 1 passed |
| L-5 | Save dialog (S55) | FIXED `ad6b689`. Wording row (title "Save case", eyebrow dropped, plain fine print, button "Save"); 11 spec files updated (expected text only) |
| L-7 | Saved context, History (S26, S49) | FIXED `1602bbc`. Wording row: "Latest when last refreshed" and "Replay this revision (read-only)"; docs/WORKSPACE.md and 7 spec files updated (expected text only) |
| L-6 | Edit dialog (S57) | FIXED `62fdada`. Wording row (help "Dollar amount, such as 600,000" for USD; percent and months help plainer; eyebrow dropped); no spec asserted the old text |
| D-3 | History & Audit (S49) | FIXED `611a2d7` (rewritten scope: only Calculation details folds; Review package untouched). Test D-3. Revert: Expected hidden, Received visible; restored: 1 passed. Uses an aria-expanded button, not <details>, so specs that filter inner <details> keep their meaning |
| L-10 | Session status strip (S15, S20) | FIXED `eb1358a`. Wording row; no spec asserted the old text |
| N-1 | Start screen (S15) | FIXED `7cecdfb`. Test `ease-fixes.spec.ts` N-1. Revert: Expected pattern /\bprimary\b/, Received string "startOption"; restored: 1 passed |
| N-3 | Primary navigation (S15, S20) | FIXED `96625dd`. Test N-3. Revert: Expected not "rgb(13, 104, 69)" (same fill as Save case); restored: 1 passed |
| D-1 | Workspace first screen (S20) | FIXED `58aeaf3`. Test D-1. Revert: Expected 0, Received 1 top-level "Edit complete draft"; restored: 1 passed. `institutional-workspace.spec.ts` now opens More first; `docs/WORKSPACE.md` lists it under More |
| D-2 | Saved workspace (S26, S49) | FIXED `30b628e`. Test `ease-fixes.spec.ts` D-2. Revert: Expected true (tiles before the saved context), Received false; restored: 1 passed |
| D-4 | Preparation (S19) | FIXED `d828a96`. Test D-4. Revert: Expected 0, Received 1 "Submitted draft" panel during the hold; restored: 1 passed |
| E-1 | Save dialog | FIXED `4b1f490`. Test `ease-fixes.spec.ts` E-1. Revert: Expected "Enter a rationale for this save (up to 2,000 characters).", Received "Invalid saved-case response or command: nonblank rationale, at most 2,000 characters."; restored: 1 passed |
| L-3 | Current coverage, inspector | FIXED `85f0603`. Wording row: `field-catalog`, `institutional-quality`, `assessment` and `workspace` specs updated (expected text only); all pass |
| L-8 | Spread (S29) | FIXED `9724288`. Wording row: "Reported amounts (rounded half to even)"; sibling options in sentence case ("Year-over-year change"); no spec asserted the old text |
| L-9 | Saved write recovery (S58), discard dialog (S59) | FIXED `e4bf156`. Wording row: "Not confirmed by the server" and "Stop tracking this unconfirmed write…"; every recovery state keeps its own label; UUID and ETag were already folded; 4 spec files and docs/WORKSPACE.md updated (expected text only) |
| L-11 | Composer and scenario validation (S65, S43) | FIXED `b104c04`. Wording row: issues named by field; raw code and JSON pointer gone; "Limit N" kept; institutional-workspace.spec expects the plain message |
| N-11 | Error and recovery states (S24, S58, S59) | FIXED `454bef6`. Test `ease-fixes.spec.ts` N-11. Revert: Expected /\bprimary\b/, Received "" ("Retry submitted draft"); restored: 1 passed |
| N-12 | Stress Tests composer (S42, S43) | FIXED `87d58ac`. Test N-12. Revert: Expected /\bprimary\b/, Received "" ("Preview scenarios"); restored: 1 passed |
| L-12 | Excel intake (S67) | FIXED `fd875f7`. Wording row; "Use synthetic data only." unchanged; no spec asserted the old text |
| N-14 | Excel intake (S67, S68) | FIXED `ce65a1c`, refined in `f0a49a6` (primary only until a workbook is loaded). Test N-14. Revert of the refinement: Expected not /\bprimary\b/, Received "primary"; restored: 1 passed |
| E-4 | Overview during the hold | FIXED `836ccce`. Test `ease-fixes.spec.ts` E-4. Revert: Expected "The explanation appears here with the decision.", Received the old empty state then the revealed Overview; restored: 1 passed |
| E-5 | Edit dialog | FIXED `589b8eb`. Test E-5. Revert: Expected 0, Received 1 alert on an untouched value; restored: 1 passed |
| N-9 | Decision preparation | FIXED `31f3728`. Test `decision-preparation.spec.ts` "N-9: an unsaved edit shows its decline without the five-second sequence". Revert: Expected "DECLINE", Received "CALCULATING"; restored: 1 passed |
| N-7 | View tabs | FIXED `fa29e07`, with follow-ups `5abcd64` (Streamlit specs select Spread) and `43e69f8` (a fresh legacy case leaves Overview for Spread). Tests `ease-fixes.spec.ts` "N-7: a fresh dated case opens on Overview" (revert: Expected aria-selected "true", Received "false") and "N-7: a fresh legacy case leaves Overview for Spread" (revert: Expected "true", Received "false"). The tab is chosen when the evaluation starts |
| N-2 | Start screen | FIXED `9c504c2`. Test `ease-fixes.spec.ts` N-2. Revert: Expected "Try the example case", Received "Import Excel workbook"; restored: 1 passed |
| G-1 | Excel intake (S67–S69) | FIXED (owner took it): `frontend/src/excel/ExcelImport.tsx` admitted for this run; rows L-12 and N-14 shipped through it |
| N-5 | Primary navigation | FIXED `46490d4`. Test `streamlit-tests/ease-fixes.spec.ts` N-5. Revert (Streamlit, bundle rebuilt and reinstalled): Expected 0, Received 1 "Consumer Decision"; restored: 1 passed |
| N-10 | Access page (S03) | FIXED `e807b35` (committed as WIP; verified after the pause). Test `streamlit-tests/ease-fixes.spec.ts` N-10. Revert (FIX=e807b35): Expected /stBaseButton-primaryFormSubmit/, Received "stBaseButton-secondaryFormSubmit"; restored: 1 passed. Host pytest 40 passed |
| L-4 | Decision bar (S20) | FIXED `060bb45`. Test `ease-fixes.spec.ts` L-4. Revert: Expected /^The score is the weight share…/, Received ""; restored: 1 passed. Source `backend/app/analysis.py:133-136` (owner accepted) |

### Queued (11)

| ID | Screen | Outcome, commit and test |
| --- | --- | --- |
| N-6 | Consumer / SBA (S71, S72) | QUEUED (superseded by N-5, which the owner took) |
| N-15 | Rejected JSON import (S70) | QUEUED: the fix adds an element; recommend taking it, since a dead-end error is worse than one more button |
| N-16 | Primary navigation | QUEUED: recommend a one-line description under each, or renaming "Commercial Decision" to "Undated decision" |
| L-13 | Memo, coverage panel | QUEUED: owner decision on the name |
| L-14 | Memo, Review package | QUEUED: recommend "No reasons beyond the decision summary." |
| N-17 | Workspace tabs | QUEUED for observation |
| L-15 | Consumer DTI review | QUEUED (off the primary path) |
| L-16 | Brand bar | QUEUED (off the primary path) |
| N-18 | Saved history | QUEUED: recommend keeping; the dialog already warns |
| N-8 | Primary navigation | QUEUED (owner left it at STOP A) |
| E-3 | Edit dialog | QUEUED (owner left it at STOP A) |

### Refuted (1)

| ID | Screen | Outcome, commit and test |
| --- | --- | --- |
| E-2 | Edit dialog | REFUTED (Phase 2 check): the edit dialog already validates the value on blur (`EditDialog.tsx:110`, `onBlur={() => setError(validateValue(value))}`). The baseline probe filled the field and read alerts without ever leaving it, so its "live: (none)" evidence was wrong. No change made. |

### Accepted (1)

| ID | Screen | Outcome, commit and test |
| --- | --- | --- |
| N-13 | Saved case, legacy case, waiting (S26, S49, S51, S45, S53, S33L, S19) | ACCEPTED by the owner at STOP A: saved-case, legacy and waiting screens are exceptions to Done 5 (no code) |

Refuter pass (§7.3) on the 32 STOP A rows: **0 refuted outright, 9 rewritten to pass**. The most common reason was a fix
that risked blurring a distinct state, or moving a disclosure behind a click. E-2 was refuted later, in Phase 2, on
code evidence: blur validation already existed.

## Fresh-eyes walkthrough

One agent that had seen neither the register nor the diff drove the standalone host with the Playwright browser tools. It
**finished all six tasks** and read every answer correctly. Its two primary-path stalls were fixed (E-4, E-5); the rest are
queued. Full record: `ease/walkthrough/REPORT.md`.

## Path check and gate

- `bash ease/tools/pathcheck.sh` prints no violations. It lists only the files the owner picked by name at STOP A:
  `README.md` and `frontend/src/useAnalystWorkspace.ts` (N-9), `streamlit_app/app.py` (N-10) and
  `frontend/src/excel/ExcelImport.tsx` (G-1).
- `streamlit_app/requirements.txt` changes only in its generated bundle-stamp line, which `build:streamlit` rewrites and the
  repo commits with every bundle.
- No backend, gate, contract, transport or number-helper file changed.
- Final full run (`bash ease/tools/steps.sh final`, raw logs in `ease/logs/final/`): every step exited 0: pip check, ruff, mypy --strict, gate selftest (55 fixture values, 4 flags, 19 mutations killed), precision probe, backend pytest 1501 passed, npm audit 0 vulnerabilities, decimal tests 11/11, build, standalone e2e 416 passed (9 skipped: the gated capture specs), host pytest 40 passed, build:streamlit, assets check, component reinstall, build directory byte-identical, Streamlit e2e 13 passed (2 skipped: gated capture). Baseline was 392 and 6 browser tests; the additions are the ease task, fix and capture specs.

## Not measured, and why

- **Unexplained terms** are judged by hand from the screenshots (`ease/tools/terms.py` lists every term), not counted by a tool.
- **The walkthrough** used the standalone host only (the prompt asks for one way to see the app). The Streamlit host is
  covered by its task specs and screenshots.
- **Some inventory states were not captured**, because the test servers do not produce them on demand (S01, S02, S04, S07, S13,
  S27, S41, S60 to S64). See `notCaptured` in `ease/data/capture/*`.
- **Streamlit evidence during Phase 2.** Until the stale installed component was found (see `ease/STATE.md`), Phase 2's Streamlit
  browser runs served the baseline bundle. Every Streamlit result in Phase 3 uses the current bundle (`rebuild.sh` and `steps.sh`
  reinstall it).
- **Streamlit T5's wait** was not A/B-tested.

## Queued for the owner

Each row in the "Queued" table above carries its evidence and a recommendation. In short:
- Take N-15 (a primary "Choose another file" after a rejected JSON import) and L-14 ("No reasons beyond the decision summary.").
- Decide the FCCR name (L-13) and the "Commercial Assessment" / "Commercial Decision" naming (N-16).
- Keep N-8 and E-3 left as you chose.
