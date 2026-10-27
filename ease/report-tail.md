
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
