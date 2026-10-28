# UI/UX friction pass, 2026-10

Branch `ux/friction-pass` from `main` `3451de3`, 2026-10-28. Not pushed. The control prompt is
`~/Desktop/SPREADLINE_UX_FRICTION_PROMPT.md`. The goal was to make Spreadline easier to use without changing a
number it computes, and to measure every change on seven fixed tasks.

**Result:**
- Standalone guesses fell from 12 to 5, and the Streamlit host's from 10 to 5.
- T6 went from blocked to completed. T7 went from "only the browser's print command" to an in-app action.
- T2 lost 13 keystrokes, and T3 lost a click.
- Two number-display bugs that broke the "never round across a policy line" rule were found and fixed (C-1, and
  F-5's DTI case).
- No computation, threshold, backend file or gate file changed.

## Scope set before measuring

Three facts in the prompt were stale. The owner answered the scope questions on 2026-10-28.

| Prompt fact | Found | Evidence | Decision |
| --- | --- | --- | --- |
| Python 3.11 | 3.12 everywhere | `.github/workflows/ci.yml:15`, `.python-version`, `pyproject.toml` | Used the existing `backend/.venv` (3.12.14) |
| The SBA size table ships empty and fails closed | The official 2023-03-17 workbook ships with 978 verified rows. SBA fails closed per case (unsupported exception rows, unknown NAICS, missing evidence, dates out of range) | `backend/data/`, `backend/app/sba.py:105-165` | T6 = an SBA case that fails closed per case (NAICS 115310) |
| Every edit records a required rationale | Saved-revision edits do. Unsaved draft edits need none (owner approval 2026-10-16, N-4) and are not in the audit trail | `backend/app/cases.py:684-689`, `docs/ANALYST_USABILITY_APPROVAL.md:62-67` | Boundary 2 governs saved revisions. T4 = save, make a saved-revision edit, find it in History & Audit |
| The gate selftest pins 18 values, 2 flags, 7 mutations | Now 55 / 4 / 19 | `gate/reference_calculator.py --selftest` | None |
| (not in the prompt) | The public Render demo is the Streamlit host in public mode, which hides Consumer and SBA | `render.yaml`, `README.md:10-16` | Both hosts measured; T5 and T6 on standalone only |

The prior ease-of-use pass (PR #25, `ease/REGISTER.md`) had shipped 35 fixes the same day. No row here
repeats one of them.

## 1. Measured

How the tasks were measured:
- The harness is [friction-harness/](friction-harness/README.md): Playwright at 1440x900, one scripted minimal
  path per task, three runs per host.
- Counts were identical across runs, except T4's scroll count on standalone, which varies with layout timing.
- Wait is the median.
- "Before" is `main` `3451de3`. "After" is `d45d65e`, the last finding commit. The Phase 5 follow-ups change no
  path; see the Phase 5 notes below.

**The guess rule:** before a step, the control it uses is either:
- off-screen with no visible cue that it is there (a long form running past the fold is a cue; view tabs below
  the tiles and notices are not);
- inside a closed menu, tab or disclosure with no cue; or
- visible, but its label doesn't tell a first-time user it does what the task needs.

Guesses were judged by hand from per-step screenshots.

### Standalone (Vite + FastAPI)

| Task | Status before → after | Screens | Clicks | Keystrokes | Scrolls | Wait ms | Guesses |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 first load to first DSCR | completed → completed | 3 → 3 | 2 → 2 | 1 → 1 | 0 → 0 | 5,329 → 5,350 | 0 → 0 |
| T2 two-year spread to EBITDA and DSCR | completed → completed | 3 → 3 | 2 → 2 | **295 → 282** | 0 → 0 | 5,305 → 5,325 | **3 → 1** |
| T3 decline to the factor behind its first reason | completed → completed | 2 → 2 | **2 → 1** | 0 → 0 | 2 → 2 | 0 → 0 | **2 → 1** |
| T4 saved edit with rationale, found in History | completed → completed | 5 → 5 | 7 → 7 | 63 → 63 | 2 → 2 | 100 → 101 | **3 → 2** |
| T5 consumer DTI against policy | partly blocked → partly blocked | 2 → 2 | 4 → 4 | 0 → 0 | 2 → 2 | 24 → 25 | **1 → 0** |
| T6 SBA case that fails closed | **blocked → completed** | 2 → 2 | 5 → 5 | 7 → 7 | 2 → 2 | 76 → 76 | **1 → 0** |
| T7 summary out of the app | **browser print only → in-app copy or print** | 2 → 2 | 1 → 2 | 1 → 0 | 1 → 1 | 0 → 24 | **2 → 1** |
| **Total** | 1 blocked, 1 partly → 0 blocked, 1 partly | | 23 → 23 | 367 → 353 | 9 → 9 | | **12 → 5** |

### Streamlit host (public demo mode)

| Task | Status before → after | Screens | Clicks | Keystrokes | Scrolls | Wait ms | Guesses |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | completed → completed | 2 → 2 | 1 → 1 | 0 → 0 | 0 → 0 | 5,656 → 5,626 | 0 → 0 |
| T2 | completed → completed | 3 → 3 | 2 → 2 | **295 → 282** | 0 → 0 | 5,303 → 5,303 | **3 → 1** |
| T3 | completed → completed | 2 → 2 | **2 → 1** | 0 → 0 | **3 → 1** | 0 → 0 | **2 → 1** |
| T4 | completed → completed | 5 → 5 | 7 → 7 | 63 → 63 | 3 → 3 | 255 → 254 | **3 → 2** |
| T5, T6 | not offered on this host (N-5, by design) | | | | | | |
| T7 | browser print only → in-app | 2 → 2 | 1 → 2 | 1 → 0 | 1 → 1 | 0 → 24 | **2 → 1** |

What changed per task, and what did not:
- **T1:** already at its settled two-step floor. Its 5-second wait is the approved first-evaluation hold.
- **T2:**
  - Focus now lands on the new period: 12 Shift+Tab presses saved (F-8).
  - The working-capital section opens by default: one Enter saved, one guess removed (F-28). Extra Tabs fell
    from 16 to 4.
  - The remaining guess is the composer's entry point. The nav button "Commercial Assessment" is the only way in
    (F-15, backlog).
- **T3:**
  - The memo's first reason now reads "Business DSCR of 0.6777x is below the decline floor of 1.00x." It used to
    read "dscr: 0.6777035…" (96 digits). So the reason is the factor detail, and the Overview step is no longer
    needed (F-3).
  - A user who knew "dscr" meant Business DSCR could have saved that click before. The gain is the guess removed.
  - The remaining guess: the view tabs sit below the fold (F-13, backlog).
- **T4:** History now names "Proposed principal" with exact values (F-12). The two tab guesses remain (F-13).
- **T5:**
  - Each DTI rule shows its policy line (F-5).
  - Front-end (housing) DTI is still not returned by the API. The owner declined the decision-engine change it
    would need, so T5 stays partly blocked. F-6 now says why on screen.
- **T6:** the screen now says "NAICS 115310 is unsupported: Source contains industry exceptions…", that this is a
  known limit of the prototype's pinned SBA table, and what to do next (F-1).
- **T7:**
  - "Copy memo as text" replaces the browser's print chord: one click for one keystroke, so steps hold at 2.
  - The 24 ms is the wait for the "Copied" confirmation.
  - The remaining guess is the Credit Memo tab below the fold (F-13).

Gate 4 held: no task has more steps or more guesses than its baseline.

## 2. Shipped findings

Every check is in `frontend/tests/friction-fixes.spec.ts`, unless the row says otherwise. "Revert" quotes the test
failing on the pre-fix file.

| ID | Score | Tasks | Commit(s) | What changed | Check |
| --- | --- | --- | --- | --- | --- |
| C-1 | correctness (boundary 3) | T1-T4 | `a91c17a`, `080d594` | `multipleText` capped places at 4, so a DSCR of 1.24996 read **"1.2500x"** beside the 1.25x minimum it misses. Places now grow until the shown value compares with every line as the exact value does, else the exact string shows. Also covers the UCA tile and factor (cents when whole dollars would land on "$0"), the memo's four-place factors, and cushions ("-0.00001x", "($0.40)"). `format.ts` only; `decimal.ts` untouched | `format.spec.ts` "C-1" and the cushion test. Revert: Expected "1.24996x", Received "1.2500x" |
| F-7 | 6 | T2, T5, T6 | `792f928` | Error-summary links lost the first click after a field had focus: blur moved that field's error to the end of the list, so the button remounted mid-click. Errors are now updated in place | F-7. Revert: Geography expected focused, received inactive |
| F-1 | 3 | T6 | `27966cc` | A 422 whose detail is a sentence showed "Review the highlighted fields" with nothing highlighted. The server's reason is now shown. An unsupported NAICS row also says it is a known limit and gives the next step | F-1 x2. Revert: received "The server rejected these inputs…" |
| F-2 | 2 | T2, T5 | `718a655` | Shared field help reads "Dollar amount, such as 500,000", "Decimal rate, such as 0.105 for 10.5%" and "Date as YYYY-MM-DD", instead of "USD decimal · up to 34 significant digits" | F-2 (wording) |
| F-3 | 2 | T7, T3 | `211960f` | Memo reasons lead with the factor label, its formatted value and the line it missed. The server message stays verbatim under a closed "Recorded message" | F-3. Revert: received the 96-digit "dscr:" string. T3 clicks 2 → 1 |
| F-4 | 2 | T7 | `ea98b27`, `27a677c` | Credit Memo gains "Copy memo as text" (memo, disclaimer, then the model scope and known gaps) and "Print memo" (existing print CSS). While the memo is shown, any print opens the known gaps (`beforeprint`/`afterprint`). Approved 2026-10-16 as "copy as text" and "a print-ready memo" | F-4 on standalone and `streamlit-tests/friction-fixes.spec.ts` F-4. T7 status |
| F-5 | 2 | T5 | `9d43b59` | Consumer rule rows show the returned policy line ("Pass · 33.8% · policy below 50.0%"). DTI is formatted from `raw_value` with policy-line disambiguation: a raw 0.42996 used to show **"Pass · 43.0000%"** on the 43% review rule, and now shows "42.996%" | F-5 x2. Revert: "Pass · 33.7500%" and "Pass · 43.0000%" |
| F-8 | 2 | T2 | `5790d68` | Adding a period or guarantor focuses its first field; removing one focuses a neighbour. Blur now checks only fields typed in, so leaving an untouched field no longer inserts the summary under the pointer (as E-5 did for the edit dialog). Evaluate still checks every field | F-8 x2. Revert: focus inactive, and a summary shown for an untouched field. T2 −12 keystrokes |
| F-28 | 2 | T2 | `b419cad` | The required "Working capital and cash taxes" section opens by default | F-28. T2 −1 keystroke, −1 guess |
| F-12 | 2 | T4 | `1b1c59e` | History events name the field ("Proposed principal") with `describeFieldPath`, and show before and after exactly in the field's unit ("$500,000 → $600,000.1", "10.5% → 12.5%"). The pointer stays as a title. Two specs were updated (expected text only) | F-12. Revert: shows "/proposed_loan/amount" |
| F-11 | 2 | T2 | `5b8eee2`, `bac34ea` | A multi-line paste into a money, rate or whole-number field is refused with "This field takes one value, and the paste had 3 lines. Paste one figure at a time, or use Excel intake…". Text fields paste normally. Nothing is auto-filled | F-11 |
| F-14 | 2 | T5, T6 | `8ddb67a` | The brand subtitle follows the workflow ("Consumer underwriting", "SBA screening") | F-14 (wording) |
| F-6 | 1 | T5 | `d45d65e` | Housing DTI says it is not returned by this prototype's decision, and that only total (back-end) DTI is judged against the DTI lines. The inspect button stays | F-6 (wording) |

**Phase 5 review.**
- **Fresh reviewer:** given only the diff and the boundaries. It found one boundary-3 edge (the memo's UCA fell
  back to 30 rounded places), the cushion rounding that C-1 had left, print restoring the known gaps too early on
  browsers where print doesn't block, the paste refusal reaching text and rationale fields, and several notes.
- **Second reviewer:** attacked that report. It downgraded three claims (the copy losing the PD line, the housing
  copy, and the 422 text) and added two: the rationale paste, and the Streamlit host having no copy or print test.
- **Fixed:** everything rated must-fix or should-fix, in `080d594`, `27a677c` and `bac34ea`.
- **ux-audit (VectorLab):**
  - No page-level horizontal overflow at 375 or 1280 on any changed screen. The copy is verb-first and
    blameless. No modal or motion was added.
  - The screenshot showed each "Recorded message" as an empty bordered box, which failed gate 10. It was
    restyled in `27a677c` and re-checked at `bac34ea`, where it shows as a small inline disclosure.
  - No `.ux-profile.md` exists, so catalog defaults applied.

**Number safety:**
- No file under `backend/`, `gate/`, `decimal.ts` or `caseContracts.ts` changed.
- The gate selftest still pins 55 values and 4 flags and kills 19 mutations, and backend pytest still passes 1,501.
- No new dependency, and no network call except the existing API.

## 3. Dropped or rescored, with the evidence

| ID | Outcome | Evidence |
| --- | --- | --- |
| F-18 connect screen lacks a lead | Dropped | L-1 rewrote that lead on purpose. The next screen says what Spreadline does and "Use synthetic data only" (`AccessGate.tsx:40-50`, `StartScreen.tsx:51-54`) |
| F-9 Enter submits the empty composer | Rescored 2 → 1, backlog | Enter already jumps to the next invalid field (`GuidedForm.tsx:49-53`), and Enter-to-submit is the expert path on a prefilled composer (`App.tsx:309-311`) |
| F-13 view tabs below the fold | Rescored to 1, backlog | One scroll per session, since tabs keep the scroll. The order is the owner's D-1/D-2 decision (`App.tsx:422`), and an L-sized change would reopen it |
| F-15 no hand-entry start card | Rescored to 1, backlog | The nav already sits on the start screen, and a fifth card would repeat N-8's duplicate |
| F-3 memo reasons | Rescored 4 → 2 | The decision bar and Overview already name the failing factors. The real cost was the 96-digit string in a printed memo |
| F-2 help text | Rescored 3 → 2 | SBA's own fields keep their own help, so T6 isn't touched |
| F-7 as first diagnosed ("details stays closed") | Diagnosis replaced | `focusPointer` already opens closed details. The real cause was the summary reordering on blur |
| F-11 auto-fill a pasted column | Plan replaced | A P&L column carries subtotal rows, so filling in order would shift every later value silently |
| F-21 unformatted server sentence | Dropped to 0 | Not on T3's path, and it is backend wording (owner's call) |
| F-22 Saved-run review formats | Label only, backlog | The four-place values match the memo, and the panel is stored evidence |
| An MCP session landing on "SBA Screen" after Enter | Not reproduced | A clean Playwright run lands on the start screen with Enter and with click (like the prior N-17) |

## 4. Backlog, scored

| ID | Score | Item |
| --- | --- | --- |
| F-9 | 1 | Hold the error banner on an implicit Enter submit in an empty composer |
| F-10 | 1 (M) | The composer draft is lost when switching workflows, though the composer says "Drafts remain in page memory". It needs a rule for when a kept draft and an opened case disagree |
| F-13 | 1 (L) | View tabs below the fold at 1440x900 and 1280x800 (tablist top 1,018 px) |
| F-15 | 1 | Hand-entry discoverability: rename the nav item rather than adding a card |
| F-16 | 1 | The saved-edit confirmation says where the edit is recorded, worded by event kind |
| F-22 | 1 | "DSCR" to "Business DSCR" in the Saved-run review |
| F-25 | 1 (M) | The annual rate is a decimal in the composer (maximum 1) but "Percentage, such as 10.5" in the edit dialog |
| F-27 | 1 | A hand-entered case opens on Spread (`App.tsx:322`), while the example opens on Overview (N-7) |
| F-26 | 0.33 | The revision list shows no field, so finding an edit means opening each revision. It needs `field_path` in the backend listing (owner's call) |
| F-19 | 0.33 | A field filter in History (same backend need) |
| F-21 | 0 | The server explanation "385000.00" is unformatted (backend wording) |
| Review notes | note | Policy lines are shown at fixed places: safe for today's policy, and the KPI tiles already do this. The blur-typed record is keyed by index. 422 details are shown verbatim. A repeat copy doesn't re-announce its status. "1 months" |

**Owner calls outside this pass:**
1. **Front-end DTI.** Returning it means changing `decide_consumer` (boundary 1). Declined on 2026-10-28.
2. **CSV export.** Approved on 2026-10-16 and not built (M).
3. **Consumer and SBA screens.** The 2026-10-16 record lists them as not authorized
   (`docs/ANALYST_USABILITY_APPROVAL.md:91`). The owner approved F-1, F-5, F-6 and F-14 on them at Gate 2.

## 5. Commands

The environment was Python 3.12.14 from `backend/.venv`, run with `PATH="$PWD/backend/.venv/bin:$PATH"`
(`build:streamlit` calls `python3`), Node 22.23.3, and Playwright 1.63.0 Chromium.

**Every commit ran these, copied from `ci.yml`:**

```sh
python gate/reference_calculator.py --selftest
python docs/precision_probe.py
(cd backend && python -m pytest -q)
(cd frontend && npm run test:decimal && npm run build)
npm --prefix frontend run build:streamlit
python scripts/streamlit_assets.py check
uv pip install --python backend/.venv/bin/python --reinstall-package spreadline-workspace --no-deps ./streamlit_app/component
(cd frontend && CI=1 npx playwright test <specs that assert changed text, plus the finding's test>)
(cd frontend && CI=1 npx playwright test --config playwright.streamlit.config.ts <Streamlit specs, when touched>)
```

**Revert proofs:** each finding's test was run once against the pre-fix file (`git show HEAD:<file>`), and then
the fix was restored.

**Phase 5 and final runs:**

```sh
bash scripts/run_all_checks.sh        # pip check, ruff, mypy --strict, selftest, probe, pytest, npm audit, test:decimal, build, e2e
bash scripts/run_streamlit_checks.sh  # pip check, ruff, mypy --strict, host pytest, build:streamlit, assets check, Streamlit e2e
```

**Final run at `bac34ea` (output tails):**

```text
scripts/run_all_checks.sh
  No broken requirements found.
  ruff: All checks passed!
  mypy --strict: Success: no issues found in 36 source files
  SELFTEST PASS: 55 fixture values and 4 flags pinned correctly, all 19 mutations killed.
  pytest: 1501 passed in 22.64s
  npm audit --audit-level=high: found 0 vulnerabilities
  test:decimal: # pass 11, # fail 0
  build: built in 117ms
  e2e: 433 passed (15.2m), 9 skipped (gated capture specs)
  exit 0
scripts/run_streamlit_checks.sh
  No broken requirements found.
  ruff: All checks passed!
  mypy --strict: Success: no issues found in 4 source files
  host pytest: 45 passed in 3.19s
  build:streamlit: built in 95ms; Streamlit component assets match their source, manifest and requirements stamp.
  git diff --exit-code on the build dir: clean
  Streamlit e2e: 14 passed (1.9m), 2 skipped (gated)
  exit 0
```

**Re-measure at `bac34ea`:** the counts and statuses for every task on both hosts equal the `d45d65e` after run
(`friction-harness/data/final`), so the Phase 5 follow-ups changed no path.

**Measurement:** `docs/ux/friction-harness/run-measure.sh <label>`, then `compare.py`.

## What this pass doesn't do

- It doesn't change any calculation, threshold, policy, decision rule or reason code. No file in `backend/` or
  `gate/` changed.
- It doesn't add real data sources: no bureau, bank, OCR or live SBA data. The SBA table is the pinned
  2023-03-17 workbook.
- It doesn't calibrate the score. The weighted-rule score is still illustrative and not a probability of default.
- It doesn't return front-end (housing) DTI, so T5 stays partly blocked.
- It doesn't add a CSV export, a downloadable memo file or a PDF library.
- It doesn't change the start screen, navigation or first-screen order that the owner settled in the prior pass
  (F-13 and F-15 are in the backlog).
- It doesn't make unsaved drafts survive a reload or a switch between workflows (F-10 is in the backlog).
- It isn't pushed or merged.
