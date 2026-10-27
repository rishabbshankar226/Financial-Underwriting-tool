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
