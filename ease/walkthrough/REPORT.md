# Fresh-eyes walkthrough (Phase 3, step 3)

2026-10-27, at `c815b2f` plus the uncommitted E-4 work. One general-purpose agent that had seen neither the register
nor the diff drove the standalone host (Vite dev server and the test backend, started with the Playwright config's own
commands) through the Playwright browser tools at 1440×900. It read no source, and was given the six tasks in plain words,
with no screen names. Its page snapshots and console logs are in `browser-trace/`. The only console error was a 404 for
`/favicon.ico`.

**Result: all six tasks finished.**

| Task | Finished | Where it hesitated (quoting the screen) |
| --- | --- | --- |
| T1 first run | yes | "Commercial Assessment" and "Commercial Decision" side by side with no main path; during the hold, Overview said "No current assessment is available. Resolve or choose a case to see its explanation.", which "briefly looked like a failure" |
| T2 read the credit | yes, no hesitation | All three ratios, their policy lines and the reason were on Overview |
| T3 adjust and save | yes | A click meant for the "Debt & Loan" tab opened "Import Excel workbook" (not reproduced, see below); the edit dialog showed "Enter a changed value or cancel." before anything was typed; "Rationale (optional)" vs "Save rationale"; the edit's own note does not appear in saved history (the save dialog says so) |
| T4 Excel intake | yes, no hesitation | — |
| T5 reopen to memo | yes | The memo says "Simplified FCCR" where Overview says "FCCR"; "Recorded reasons: No additional reasons returned." beside a clear Overview reason |
| T6 other products | yes | "Housing DTI: Unavailable from this endpoint" unexplained; a "500000.00" placeholder on monthly income; header still "Commercial underwriting" on the Consumer and SBA screens. It read the SBA result correctly: not settled, four unresolved requirements |

Its answers matched the server figures: APPROVE; Business DSCR 3.13x (minimum 1.25x, decline below 1.00x), Global DSCR
2.90x (1.25x / 1.00x), FCCR 2.80x (1.20x / 1.00x); APPROVE after 600,000 (2.90x / 2.72x / 2.61x); saved revision 1;
Consumer APPROVE with total DTI 33.75%; SBA "Incomplete Eligibility — Manual Underwriter Review Required".

Each stall became a register row:
- **E-4** (Overview during the hold) and **E-5** (premature "Enter a changed value") are fixed as class A.
- The others are QUEUED: N-16, L-13, L-14, N-17, L-15, L-16 and N-18.
- The "Debt & Loan" click that opened the Excel screen did not reproduce. The T3 task spec clicks that tab by name in 6 of 6
  runs per host, so it is recorded as N-17, QUEUED for observation.
