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

/** The server's own definition of the illustrative score (backend/app/analysis.py:133-136, SCORE_NOTE),
 * shown on hover and read as the note's description. */
const scoreDefinition =
  "The score is the weight share of factors that meet policy. It is illustrative, never changes the outcome, and is not a probability of default.";

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
        <small title={view.decision ? scoreDefinition : undefined}>{view.decisionNote}</small>
        {view.previous && <small className="previousResult">Previous result: {view.previous.toUpperCase()} (inactive)</small>}
      </div>
    </section>
  );
}
