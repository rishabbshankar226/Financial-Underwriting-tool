import { useEffect, useRef, useState } from "react";
import { selectWorkspaceView } from "./workspaceSelectors";
import { useEditController } from "./useEditController";
import EditDialog from "./EditDialog";
import { queryWorkspace } from "./workspaceDom";
import { Scenarios } from "./Scenarios";
import { Review } from "./Review";
import { useScenarioWorkspace } from "./useScenarioWorkspace";
import { writeComparisonLocator } from "./scenarioSelection";
import { AnalysisProvider } from "./useAnalysis";
import { Tabs } from "./components/Tabs";
import { BrandBar, CaseHeader, MoreMenu, PrimaryActions } from "./views/WorkspaceHeader";
import { StartScreen } from "./views/StartScreen";
import { PrototypeNotice } from "./views/PrototypeNotice";
import { DecisionBar } from "./views/DecisionBar";
import { KpiTiles } from "./views/KpiTiles";
import { CompatibilityPanel, ContextStrip, WorkspaceStatus } from "./views/WorkspaceStatus";
import { workspaceTabs, type WorkspaceTab } from "./views/workspaceTabs";
import { SpreadView } from "./views/SpreadView";
import { OverviewView } from "./views/OverviewView";
import { DebtLoanView, GlobalCashFlowView } from "./views/AssumptionsView";
import { DetailsView } from "./views/DetailsView";
import { MemoView } from "./views/MemoView";
import { HistoryView } from "./views/HistoryView";
import { useAnalystWorkspace } from "./useAnalystWorkspace";
import { SaveCaseDialog, DiscardTrackingDialog } from "./CaseDialogs";
import { SavedCaseList, SavedContext, RecoveryPanel } from "./SavedCases";

/** Composition root: owns the workspace hooks, view and dialog state, and wires views to them. */
export default function App({ onDisconnect }: { onDisconnect?: () => void }) {
  const workspace = useAnalystWorkspace();
  const scenarios = useScenarioWorkspace(workspace);
  const { state, submit, demo, upload } = workspace;
  const [tab, setTab] = useState<WorkspaceTab>("spread");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [saving, setSaving] = useState(false),
    [showCases, setShowCases] = useState(false),
    [discarding, setDiscarding] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  // The one file input: the start screen and the More menu both open it.
  const fileInput = useRef<HTMLInputElement>(null);
  const edits = useEditController(opener, workspace.edit);
  const view = selectWorkspaceView(state, !!workspace.operation);
  const { ready, accepted, input, assessment, decision } = view;
  const index = input ? Math.min(selectedPeriod, input.years.length - 1) : 0;
  const idle = state.status === "idle";
  useEffect(() => {
    if (state.status === "evaluating") {
      edits.dismiss();
      setSaving(false);
    }
    if (state.status === "ready" && state.resetPeriod && state.accepted)
      setSelectedPeriod(state.accepted.input.years.length - 1);
    if (state.status === "ready" && state.saved?.view.compatibility)
      setTab("audit");
  }, [state.id, state.status, state.accepted, state.resetPeriod]);
  const openFile = () => fileInput.current?.click();
  const openSaved = (locator: Parameters<typeof workspace.openSaved>[0]) => void workspace.openSaved(locator);
  return (
    <AnalysisProvider subject={view.analysisSubject} paused={workspace.inFlight}>
      <main className="analystWorkspace">
        <BrandBar>
          {!idle && (
            <PrimaryActions
              showCases={showCases}
              canSave={workspace.canSave}
              onToggleCases={() => setShowCases((value) => !value)}
              onSave={(element) => {
                opener.current = element;
                setSaving(true);
              }}
            />
          )}
          <MoreMenu onExample={demo} onImport={openFile} onDisconnect={onDisconnect} />
        </BrandBar>
        {idle ? (
          <StartScreen
            showCases={showCases}
            onExample={() => demo("dated")}
            onToggleCases={() => setShowCases((value) => !value)}
            onImport={openFile}
          />
        ) : (
          <CaseHeader view={view} filename={state.filename} legacy={accepted?.mode === "legacy"} />
        )}
        <PrototypeNotice />
        {showCases && (
          <SavedCaseList
            onOpen={(locator) => {
              setShowCases(false);
              openSaved(locator);
            }}
            onClose={() => {
              setShowCases(false);
              queryWorkspace<HTMLButtonElement>("[data-focus-fallback]")?.focus();
            }}
          />
        )}
        <RecoveryPanel
          workspace={workspace}
          onOpenComparison={(view) => {
            const record = view.record;
            writeComparisonLocator(record.case_id, record.comparison_id);
            void workspace.openSaved({ caseId: record.case_id, revision: record.baseline_revision }).then(() => setTab("stress"));
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
        {!idle && (
          <>
            {state.saved && <SavedContext saved={state.saved} active={ready} onOpen={openSaved} />}
            <WorkspaceStatus state={state} view={view} onSubmit={(draft) => void submit(draft)} onOpen={openSaved} />
            <DecisionBar view={view} />
            {assessment && <KpiTiles assessment={assessment} />}
            {assessment && <ContextStrip assessment={assessment} />}
            {ready && state.saved?.view.compatibility && <CompatibilityPanel view={state.saved.view} />}
            <Tabs label="Workspace views" tabs={workspaceTabs} selected={tab} onSelect={setTab}>
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
              {tab === "overview" && <OverviewView view={view} />}
              {tab === "debt" && <DebtLoanView ready={ready} accepted={accepted} canEdit={workspace.canEdit} onEdit={edits.open} />}
              {tab === "global" && <GlobalCashFlowView ready={ready} accepted={accepted} canEdit={workspace.canEdit} onEdit={edits.open} />}
              {tab === "stress" && (
                <Scenarios
                  model={scenarios}
                  onSaveBaseline={(element) => {
                    if (workspace.canSave) {
                      opener.current = element;
                      setSaving(true);
                    }
                  }}
                  onOpenBaseline={openSaved}
                />
              )}
              {tab === "memo" && <MemoView decision={decision} />}
              {tab === "audit" && (
                <div className="historyAudit">
                  <HistoryView saved={state.saved} ready={ready} history={state.history} input={input} onOpen={openSaved} />
                  <DetailsView ready={ready} input={input} assessment={assessment} decision={decision} index={index} />
                  <Review
                    view={ready ? state.saved?.view ?? null : null}
                    selection={state.saved?.selection ?? null}
                    headRevision={state.saved?.headRevision ?? null}
                    sourceScope={`${state.id}:${state.status}`}
                    original={scenarios.original}
                    pending={!!(workspace.operation || workspace.recoveryError || workspace.conflict || workspace.inFlight)}
                    onOpenBaseline={openSaved}
                  />
                </div>
              )}
            </Tabs>
          </>
        )}
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
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
    </AnalysisProvider>
  );
}
