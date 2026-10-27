import type { AnalysisSubject } from "./analysisApi";
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
  /** The exact mode texts "Dated assessment" or "Legacy · undated input" for a ready selection. */
  modeLabel: string | null;
  /** Saved state of the selection: draft, saved revision, historical revision or inactive. */
  statusChip: string | null;
  decisionWord: string;
  decisionNote: string;
  pendingTitle: string;
  /** The last accepted unsaved case while its recommendation is inactive; offered for re-evaluation. */
  previousAccepted: Accepted | null;
  /** The outcome replaced by a draft edit that is recalculating or failed; shown as inactive. */
  previous: Decision["outcome"] | null;
  /** What the background analysis explains, only for a ready dated assessment. */
  analysisSubject: AnalysisSubject | null;
};

function statusChip(state: Workspace, ready: boolean): string | null {
  const saved = state.saved;
  if (saved) {
    const revision = saved.view.snapshot.revision;
    if (!ready) return `Previous saved revision ${revision} (inactive)`;
    return saved.selection === "latest"
      ? `Saved · revision ${revision} · latest`
      : saved.selection === "receipt"
        ? `Saved · revision ${revision} · latest unconfirmed`
        : `Historical revision ${revision} (read-only)`;
  }
  return ready && state.accepted ? "Draft — not saved" : null;
}

function analysisSubject(state: Workspace, ready: boolean): AnalysisSubject | null {
  const accepted = state.accepted;
  if (!ready || accepted?.mode !== "dated") return null;
  const fingerprint = accepted.result.fingerprint.value,
    years = accepted.input.years;
  const snapshot = state.saved?.view.snapshot;
  return snapshot
    ? {
        key: `saved:${snapshot.case_id}:${snapshot.revision}:${fingerprint}`,
        fingerprint,
        years,
        source: { kind: "saved", caseId: snapshot.case_id, revision: snapshot.revision },
      }
    : { key: `stateless:${fingerprint}`, fingerprint, years, source: { kind: "stateless", input: accepted.input } };
}

export function selectWorkspaceView(state: Workspace, pendingWrite: boolean): WorkspaceView {
  const ready = state.status === "ready",
    accepted = state.accepted,
    input = accepted?.input;
  const assessment = ready && accepted?.mode === "dated" ? accepted.result : null;
  const decision = ready && accepted ? (accepted.mode === "dated" ? accepted.result.decision : accepted.result) : null;
  const savedName = state.saved?.view.snapshot.normalized_input.borrower_name;
  const evaluating = state.status === "evaluating";
  const previousDecision = accepted ? (accepted.mode === "dated" ? accepted.result.decision : accepted.result) : null;
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
    modeLabel: ready && accepted ? (accepted.mode === "dated" ? "Dated assessment" : "Legacy · undated input") : null,
    statusChip: statusChip(state, ready),
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
      : evaluating && state.action !== "open" && state.action !== "write"
        ? "The decision appears with its figures."
        : "A current accepted calculation is required",
    pendingTitle: evaluating
      ? state.action === "open"
        ? "Loading original stored assessment"
        : state.action === "write"
          ? "Waiting for saved write confirmation"
          : "Evaluating draft"
      : "No current result",
    previousAccepted:
      accepted && !state.saved && (state.action === "evaluate" || !pendingWrite) ? accepted : null,
    previous: !ready && state.draft?.edit && previousDecision ? previousDecision.outcome : null,
    analysisSubject: analysisSubject(state, ready),
  };
}
