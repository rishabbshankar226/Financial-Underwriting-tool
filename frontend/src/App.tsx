import { useEffect, useRef, useState } from "react";
import { selectWorkspaceView } from "./workspaceSelectors";
import { useEditController } from "./useEditController";
import EditDialog from "./EditDialog";
import { queryWorkspace } from "./workspaceDom";
import AssessmentSummary from "./AssessmentSummary";
import { Scenarios } from "./Scenarios";
import { Review } from "./Review";
import { useScenarioWorkspace } from "./useScenarioWorkspace";
import { writeComparisonLocator } from "./scenarioSelection";
import { BrandBar, CaseHeader } from "./views/WorkspaceHeader";
import { PrototypeNotice } from "./views/PrototypeNotice";
import { Toolbar } from "./views/Toolbar";
import { CompatibilityPanel, ContextStrip, WorkspaceStatus } from "./views/WorkspaceStatus";
import { ViewTabs, type WorkspaceTab } from "./views/ViewTabs";
import { SpreadView } from "./views/SpreadView";
import { AssumptionsView } from "./views/AssumptionsView";
import { DetailsView } from "./views/DetailsView";
import { MemoView } from "./views/MemoView";
import { HistoryView } from "./views/HistoryView";
import { useAnalystWorkspace } from "./useAnalystWorkspace";
import { SaveCaseDialog, DiscardTrackingDialog } from "./CaseDialogs";
import { SavedCaseList, SavedContext, RecoveryPanel } from "./SavedCases";

/** Composition root: owns the workspace hooks, view and dialog state, and wires views to them. */
export default function App() {
  const workspace = useAnalystWorkspace();
  const scenarios = useScenarioWorkspace(workspace);
  const { state, submit, demo, upload } = workspace;
  const [tab, setTab] = useState<WorkspaceTab>("spread");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [saving, setSaving] = useState(false),
    [showCases, setShowCases] = useState(false),
    [discarding, setDiscarding] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const edits = useEditController(opener, workspace.edit);
  const view = selectWorkspaceView(state, !!workspace.operation);
  const { ready, accepted, input, assessment, decision } = view;
  const index = input ? Math.min(selectedPeriod, input.years.length - 1) : 0;
  useEffect(() => {
    if (state.status === "evaluating") {
      edits.dismiss();
      setSaving(false);
    }
    if (state.status === "ready" && state.resetPeriod && state.accepted)
      setSelectedPeriod(state.accepted.input.years.length - 1);
    if (state.status === "ready" && state.saved?.view.compatibility)
      setTab("history");
  }, [state.id, state.status, state.accepted, state.resetPeriod]);
  return (
    <main className="analystWorkspace">
      <BrandBar />
      <CaseHeader view={view} />
      <PrototypeNotice />
      <Toolbar
        filename={state.filename}
        legacy={accepted?.mode === "legacy"}
        showCases={showCases}
        canSave={workspace.canSave}
        onDemo={demo}
        onToggleCases={() => setShowCases((value) => !value)}
        onSave={(element) => {
          opener.current = element;
          setSaving(true);
        }}
        onUpload={(file) => void upload(file)}
      />
      {showCases && (
        <SavedCaseList
          onOpen={(locator) => {
            setShowCases(false);
            void workspace.openSaved(locator);
          }}
          onClose={() => {
            setShowCases(false);
            queryWorkspace<HTMLButtonElement>("[data-focus-fallback]")
              ?.focus();
          }}
        />
      )}
      <RecoveryPanel
        workspace={workspace}
        onOpenComparison={(view) => {
          const record = view.record;
          writeComparisonLocator(record.case_id, record.comparison_id);
          void workspace.openSaved({ caseId: record.case_id, revision: record.baseline_revision }).then(() => setTab("scenarios"));
          workspace.dismissComparisonAck();
        }}
        onDiscard={(element) => {
          opener.current = element;
          setDiscarding(true);
        }}
        onReview={(element) => {
          const review = workspace.reviewConflict();
          if (review) edits.review(review.field, review.proposal, element);
        }}
      />
      {state.saved && (
        <SavedContext
          saved={state.saved}
          active={ready}
          onOpen={(locator) => void workspace.openSaved(locator)}
        />
      )}
      <WorkspaceStatus
        state={state}
        view={view}
        onSubmit={(draft) => void submit(draft)}
        onOpen={(locator) => void workspace.openSaved(locator)}
      />
      {ready && state.saved?.view.compatibility && tab !== "review" && (
        <CompatibilityPanel view={state.saved.view} />
      )}
      {assessment && <ContextStrip assessment={assessment} />}
      {assessment && <AssessmentSummary assessment={assessment} />}
      <ViewTabs tab={tab} onSelect={setTab} />
      {tab === "scenarios" && <Scenarios model={scenarios}
        onSaveBaseline={(element) => { if (workspace.canSave) { opener.current = element; setSaving(true); } }}
        onOpenBaseline={(locator) => void workspace.openSaved(locator)}/>}
      {tab === "review" && <Review view={ready ? state.saved?.view ?? null : null}
        selection={state.saved?.selection ?? null} headRevision={state.saved?.headRevision ?? null}
        sourceScope={`${state.id}:${state.status}`} original={scenarios.original}
        pending={!!(workspace.operation || workspace.recoveryError || workspace.conflict || workspace.inFlight)}
        onOpenBaseline={(locator) => void workspace.openSaved(locator)}/>}
      {tab === "spread" && (
        <SpreadView
          ready={ready}
          canEdit={workspace.canEdit}
          input={input}
          legacy={accepted?.mode === "legacy"}
          assessment={assessment}
          decision={decision}
          index={index}
          onSelectPeriod={setSelectedPeriod}
          onEdit={edits.open}
        />
      )}
      {tab === "assumptions" && (
        <AssumptionsView
          ready={ready}
          accepted={accepted}
          canEdit={workspace.canEdit}
          onEdit={edits.open}
        />
      )}
      {tab === "details" && (
        <DetailsView
          ready={ready}
          saved={state.saved}
          input={input}
          assessment={assessment}
          decision={decision}
          index={index}
        />
      )}
      {tab === "memo" && <MemoView decision={decision} />}
      {tab === "history" && (
        <HistoryView
          saved={state.saved}
          ready={ready}
          history={state.history}
          input={input}
          onOpen={(locator) => void workspace.openSaved(locator)}
        />
      )}
      {edits.editing && (
        <EditDialog
          key={`${edits.editing.path}:${state.id}`}
          restoreFocus={opener.current}
          field={edits.editing}
          saved={!!state.saved}
          proposal={edits.proposal}
          onCancel={edits.cancel}
          onSubmit={edits.submit}
        />
      )}
      {saving && accepted?.mode === "dated" && (
        <SaveCaseDialog
          input={accepted.input}
          restoreFocus={opener.current}
          onSave={workspace.save}
          onCancel={() => setSaving(false)}
        />
      )}
      {discarding && (
        <DiscardTrackingDialog
          restoreFocus={opener.current}
          onDiscard={workspace.discardTracking}
          onCancel={() => setDiscarding(false)}
        />
      )}
      <footer>
        Spreadline · Synthetic analyst demonstration ·{" "}
        {state.saved
          ? `Saved revisions · recorded credential ${state.saved.view.snapshot.event.actor}`
          : "Unsaved session workspace"}
      </footer>
    </main>
  );
}
