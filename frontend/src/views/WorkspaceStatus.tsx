import { PagedJson } from "../components/PagedJson";
import type { Assessment } from "../contracts";
import type { StoredCase } from "../caseContracts";
import type { Locator } from "../caseRecovery";
import { periodLabel } from "../fieldCatalog";
import type { Draft, Workspace } from "../workspace";
import type { WorkspaceView } from "../workspaceSelectors";

/** Pending, failure and retry state for the current selection. */
export function WorkspaceStatus({
  state,
  view,
  onSubmit,
  onOpen,
}: {
  state: Workspace;
  view: WorkspaceView;
  onSubmit: (draft: Draft) => void;
  onOpen: (locator: Locator) => void;
}) {
  const { draft, saved } = state,
    previous = view.previousAccepted;
  return (
    <>
      {!view.ready && (
        <div className="pending" role="status">
          <strong>{view.pendingTitle}</strong>
          {draft && state.action === "evaluate" && (
            <p>
              Submitted draft: {draft.filename} · {draft.mode} ·{" "}
              {typeof draft.payload.borrower_name === "string"
                ? draft.payload.borrower_name
                : "Unnamed input"}
              {draft.edit &&
                ` · ${draft.edit.path}: ${draft.edit.prior} → ${draft.edit.next}`}
            </p>
          )}
          {previous && (
            <p>
              Previous accepted case: {previous.input.borrower_name} ·{" "}
              {previous.filename}. Its recommendation is inactive.
            </p>
          )}
        </div>
      )}
      {state.error && (
        <div className="warning" role="alert">
          {state.error}
        </div>
      )}
      {state.status === "unavailable" && (
        <div className="actions">
          {draft && state.action === "evaluate" && (
            <button onClick={() => onSubmit(draft)}>
              Retry submitted draft
            </button>
          )}
          {previous && (
            <button
              onClick={() =>
                onSubmit({
                  mode: previous.mode,
                  payload: previous.input,
                  filename: previous.filename,
                })
              }
            >
              Re-evaluate last accepted case
            </button>
          )}
          {saved && (
            <button
              onClick={() =>
                onOpen({
                  caseId: saved.view.snapshot.case_id,
                  revision: saved.view.snapshot.revision,
                })
              }
            >
              View previous stored revision
            </button>
          )}
        </div>
      )}
    </>
  );
}

/** A stored record this build can show but not recalculate, paged so a large original never floods the view. */
export function CompatibilityPanel({ view }: { view: StoredCase }) {
  return (
    <section className="panel compatibility">
      <h2>Original stored assessment</h2>
      <p>{view.compatibility}</p>
      <PagedJson value={view.snapshot} className="compatibilityJson" title="Original stored JSON" noun="record" />
    </section>
  );
}

export function ContextStrip({ assessment }: { assessment: Assessment }) {
  return (
    <div className="context">
      <span>
        Assessment as of: {assessment.assumptions_as_of} · USD · dollars ·
        nominal annual rate
      </span>
      <span>
        Coverage period: {periodLabel(assessment.selected_period, 0)}
      </span>
      <span>
        Current pro forma coverage · fixed rate · fully amortizing · monthly
        payments
      </span>
    </div>
  );
}
