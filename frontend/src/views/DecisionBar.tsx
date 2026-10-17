import { useAnalysis, type AnalysisState } from "../useAnalysis";
import type { WorkspaceView } from "../workspaceSelectors";

/** The plain-English reason beside the outcome: the server's headline once its analysis matches. */
function reason(view: WorkspaceView, analysis: AnalysisState): string {
  if (!view.decision) return view.pendingTitle;
  if (view.accepted?.mode === "legacy")
    return "Legacy decision from its policy factors. A dated assessment adds the plain-language explanation.";
  switch (analysis.status) {
    case "ready":
      return analysis.analysis.explanation.headline;
    case "error":
      return analysis.message;
    case "waiting":
      return "The explanation loads after the saved write is confirmed.";
    default:
      return "Preparing the plain-language explanation…";
  }
}

/** `.decision strong` holds only the status word; specs and the Streamlit host read it. */
export function DecisionBar({ view }: { view: WorkspaceView }) {
  const { state } = useAnalysis();
  return (
    <section
      className="decision"
      data-outcome={view.decision?.outcome ?? "unavailable"}
      aria-label="Illustrative decision"
      aria-live="polite"
    >
      <div className="decisionStatus">
        <span>Illustrative decision</span>
        <strong>{view.decisionWord}</strong>
      </div>
      <div className="decisionReason">
        <p>{reason(view, state)}</p>
        <small>{view.decisionNote}</small>
        {view.previous && <small className="previousResult">Previous result: {view.previous.toUpperCase()} (inactive)</small>}
      </div>
    </section>
  );
}
