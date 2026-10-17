import type { Accepted, Assessment, Decision, Input } from "./contracts";
import type { Workspace } from "./workspace";

/** Everything views read about the current selection, derived in one pure place. */
export type WorkspaceView = {
  ready: boolean;
  accepted: Accepted | null;
  input: Input | undefined;
  assessment: Assessment | null;
  decision: Decision | null;
  title: string;
  subtitle: string;
  decisionWord: string;
  decisionNote: string;
  pendingTitle: string;
};

export function selectWorkspaceView(state: Workspace): WorkspaceView {
  const ready = state.status === "ready",
    accepted = state.accepted,
    input = accepted?.input;
  const assessment = ready && accepted?.mode === "dated" ? accepted.result : null;
  const decision = ready && accepted ? (accepted.mode === "dated" ? accepted.result.decision : accepted.result) : null;
  const savedName = state.saved?.view.snapshot.normalized_input.borrower_name;
  const evaluating = state.status === "evaluating";
  return {
    ready,
    accepted,
    input,
    assessment,
    decision,
    title: ready ? (input?.borrower_name ?? (typeof savedName === "string" ? savedName : "Saved case")) : "Assessment workspace",
    subtitle: ready
      ? state.saved
        ? "Saved dated assessment"
        : accepted?.mode === "dated"
          ? "Dated assessment"
          : "Legacy · undated input"
      : evaluating
        ? state.action === "open"
          ? "Opening stored revision"
          : state.action === "write"
            ? "Waiting for accepted stored receipt"
            : "Evaluating selected draft"
        : "Selected input unavailable",
    decisionWord: decision
      ? decision.outcome.toUpperCase()
      : evaluating
        ? state.action === "open"
          ? "LOADING"
          : state.action === "write"
            ? "SAVING"
            : "CALCULATING"
        : "UNAVAILABLE",
    decisionNote: decision
      ? `${decision.policy_version} · illustrative score ${decision.score}`
      : "A current accepted calculation is required",
    pendingTitle: evaluating
      ? state.action === "open"
        ? "Loading original stored assessment"
        : state.action === "write"
          ? "Waiting for saved write confirmation"
          : "Evaluating draft"
      : "No current result",
  };
}
