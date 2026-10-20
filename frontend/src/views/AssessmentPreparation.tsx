import { DECISION_TRANSITION_MS } from "../decisionPreparation";

/** An indeterminate presentation sequence, never a claimed percentage of server work. */
export function AssessmentPreparation({ received }: { received: boolean }) {
  return (
    <section className="assessmentPreparation" role="status" aria-label="Assessment preparation" aria-live="polite" aria-atomic="true">
      <span className="preparationSpinner" aria-hidden="true" />
      <div className="preparationContent">
        <strong>Preparing your assessment</strong>
        <p>{received
          ? "Calculation received. Preparing your decision summary…"
          : "Waiting for the calculation service…"}</p>
        <div className="preparationTrack" aria-hidden="true">
          <span style={{ animationDuration: `${DECISION_TRANSITION_MS}ms` }} />
        </div>
        <small>Your recommendation and supporting figures will appear together.</small>
      </div>
    </section>
  );
}
