
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
- Final full run (`bash ease/tools/steps.sh final`, raw logs in `ease/logs/final/`): {FINAL}

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
- **Wait ceilings may flake in CI.** The task specs' wait ceilings are the after numbers plus 2.5 s, measured on this machine. T3's ceiling (under 3.1 s) guards the real regression, the five-second hold returning on an edit. The T1 and T4 ceilings (about 8 to 9 s) include the hold by design and could flake on slower CI runners; if they do, widen or drop those two wait ceilings.

## Queued for the owner

Each row in the "Queued" table above carries its evidence and a recommendation. In short:
- Take N-15 (a primary "Choose another file" after a rejected JSON import) and L-14 ("No reasons beyond the decision summary.").
- Decide the FCCR name (L-13) and the "Commercial Assessment" / "Commercial Decision" naming (N-16).
- Keep N-8 and E-3 left as you chose.
