import type { WorkspaceView } from "../workspaceSelectors";

export function BrandBar() {
  return (
    <div className="workspaceBrand">
      <div className="wordmark">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M2 5h13v4H2zm7 5h13v4H9zM2 15h13v4H2z" fill="currentColor" />
        </svg>
        <span>Spreadline</span>
      </div>
      <span className="workspaceType">
        COMMERCIAL UNDERWRITING <span>USD</span>
      </span>
    </div>
  );
}

export function CaseHeader({ view }: { view: WorkspaceView }) {
  return (
    <header>
      <div>
        <div className="eyebrow">SPREADLINE / CREDIT WORKSPACE</div>
        <h1>{view.title}</h1>
        <p>{view.subtitle}</p>
      </div>
      <DecisionCard view={view} />
    </header>
  );
}

/** `.decision strong` holds only the status word; specs and the Streamlit host read it. */
function DecisionCard({ view }: { view: WorkspaceView }) {
  return (
    <div
      className="decision"
      data-outcome={view.decision?.outcome ?? "unavailable"}
      aria-live="polite"
    >
      <span>Illustrative decision</span>
      <strong>{view.decisionWord}</strong>
      <small>{view.decisionNote}</small>
    </div>
  );
}
