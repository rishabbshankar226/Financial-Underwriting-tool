import { isEmbeddedWorkspace } from "./transport";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import {
  BrandBar,
  CaseHeader,
  MoreMenu,
  PrimaryActions,
} from "./views/WorkspaceHeader";
import { StartScreen } from "./views/StartScreen";
import { PrototypeNotice } from "./views/PrototypeNotice";
import { DecisionBar } from "./views/DecisionBar";
import { KpiTiles } from "./views/KpiTiles";
import {
  CompatibilityPanel,
  ContextStrip,
  WorkspaceStatus,
} from "./views/WorkspaceStatus";
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
import { SessionStatus } from "./components/SessionStatus";
import { CommercialComposer } from "./CommercialComposer";
import { ConsumerWorkflow, SbaWorkflow } from "./DomainWorkflows";
import type { Mode } from "./contracts";
import { AnalysisPanels, ModelScope } from "./views/AnalysisPanels";
import { RejectedInputFields } from "./RejectedInputFields";
import { applyEdit, type Draft } from "./workspace";
import { ExcelImport } from "./excel/ExcelImport";
import { AssessmentPreparation } from "./views/AssessmentPreparation";

/** Composition root: owns the workspace hooks, view and dialog state, and wires views to them. */
export default function App({ onDisconnect }: { onDisconnect?: () => void }) {
  const workspace = useAnalystWorkspace();
  const scenarios = useScenarioWorkspace(workspace);
  const { state, submit, demo, upload } = workspace;
  const [tab, setTab] = useState<WorkspaceTab>("spread");
  const [domain, setDomain] = useState<"commercial" | "consumer" | "sba">(
    "commercial",
  );
  const [composer, setComposer] = useState(false),
    [composerMode, setComposerMode] = useState<Mode>("dated");
  const [excel, setExcel] = useState(false);
  const excelNavigation = useRef<HTMLButtonElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [saving, setSaving] = useState(false),
    [showCases, setShowCases] = useState(false),
    [discarding, setDiscarding] = useState(false);
  // Completing an older evaluation may update the accepted case, but must not
  // close a different intake opened while that request was pending. A generation
  // also distinguishes leaving and reopening the same kind of form.
  const intakeGeneration = useRef(0);
  useLayoutEffect(() => {
    intakeGeneration.current++;
  }, [domain, composer, composerMode, excel, showCases]);
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
      // A fresh dated case opens on its explanation. A fresh legacy case has no Overview analysis, so it
      // leaves Overview for Spread and otherwise keeps the chosen view. The tab is chosen as the evaluation
      // starts, so a view picked while it runs is kept. Edits, saved opens and saves keep the current tab.
      if (state.action === "evaluate" && state.draft?.resetHistory) {
        if (state.draft.mode === "dated") setTab("overview");
        else setTab((current) => (current === "overview" ? "spread" : current));
      }
    }
    if (state.status === "ready" && state.resetPeriod && state.accepted)
      setSelectedPeriod(state.accepted.input.years.length - 1);
    if (state.status === "ready" && state.saved?.view.compatibility)
      setTab("audit");
  }, [state.id, state.status, state.accepted, state.resetPeriod]);
  const openFile = () => {
    setExcel(false);
    setDomain("commercial");
    setComposer(false);
    fileInput.current?.click();
  };
  const openSaved = (locator: Parameters<typeof workspace.openSaved>[0]) =>
    void workspace.openSaved(locator);
  const rejected = workspace.rejected;
  const rejectedCommand = rejected
    ? (JSON.parse(rejected.body) as {
        input?: Draft["payload"];
        new_value?: string | number;
        rationale: string;
      })
    : null;
  const correctionDraft: Draft | null =
    state.status !== "unavailable"
      ? null
      : (state.draft ??
        (state.action !== "write"
          ? null
          : rejected?.kind === "create" && rejectedCommand?.input
            ? {
                mode: "dated",
                payload: rejectedCommand.input,
                filename: "Rejected saved creation",
                resetHistory: true,
              }
            : rejected?.kind === "edit" &&
                accepted &&
                state.saved?.view.snapshot.case_id === rejected.caseId &&
                rejectedCommand?.new_value !== undefined
              ? {
                  mode: accepted.mode,
                  payload: applyEdit(accepted.input, {
                    path: rejected.review.path,
                    prior: rejected.review.value,
                    next: rejectedCommand.new_value,
                    rationale: rejectedCommand.rationale,
                    at: "unverified proposal",
                  }),
                  filename: "Rejected saved edit",
                }
              : null));
  const correctionErrors = state.draft
    ? workspace.fieldErrors
    : (workspace.writeError?.fieldErrors ?? []);
  const openExcel = () => {
    setExcel(true);
    setComposer(false);
    setDomain("commercial");
    setShowCases(false);
  };
  return (
    <AnalysisProvider
      subject={view.analysisSubject}
      paused={workspace.inFlight}
    >
      <main className="analystWorkspace">
        <BrandBar>
          {!idle && domain === "commercial" && !composer && !excel && (
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
          <MoreMenu
            onEditDraft={
              domain === "commercial" && !composer && !excel && !idle && accepted
                ? () => {
                    setComposerMode(accepted.mode);
                    setComposer(true);
                  }
                : undefined
            }
            onExample={(mode) => {
              setExcel(false);
              setDomain("commercial");
              setComposer(false);
              demo(mode);
            }}
            onImport={openFile}
            onDisconnect={onDisconnect}
          />
        </BrandBar>
        <SessionStatus actor={state.saved?.view.snapshot.event.actor} />
        <nav className="primaryNavigation" aria-label="Underwriting workflows">
          <button
            type="button"
            ref={excelNavigation}
            aria-current={excel ? "page" : undefined}
            onClick={openExcel}
          >
            Excel intake
          </button>
          <button
            type="button"
            aria-current={
              domain === "commercial" && composerMode === "dated" && !excel
                ? "page"
                : undefined
            }
            onClick={() => {
              setExcel(false);
              setDomain("commercial");
              setComposerMode("dated");
              setComposer(true);
              setShowCases(false);
            }}
          >
            Commercial Assessment
          </button>
          <button
            type="button"
            aria-current={
              domain === "commercial" && composerMode === "legacy" && !excel
                ? "page"
                : undefined
            }
            onClick={() => {
              setExcel(false);
              setDomain("commercial");
              setComposerMode("legacy");
              setComposer(true);
              setShowCases(false);
            }}
          >
            Undated decision
          </button>
          {/* The Streamlit host has no Consumer or SBA routes, so it does not offer them. */}
          {!isEmbeddedWorkspace() && (
            <>
            <button
              type="button"
              aria-current={domain === "consumer" ? "page" : undefined}
              onClick={() => {
                setExcel(false);
                setDomain("consumer");
                setShowCases(false);
              }}
            >
              Consumer Decision
            </button>
            <button
              type="button"
              aria-current={domain === "sba" ? "page" : undefined}
              onClick={() => {
                setExcel(false);
                setDomain("sba");
                setShowCases(false);
              }}
            >
              SBA Screen
            </button>
            </>
          )}
          <button
            type="button"
            aria-expanded={showCases}
            onClick={() => {
              setExcel(false);
              setDomain("commercial");
              setComposer(false);
              setShowCases(true);
            }}
          >
            Saved Cases
          </button>
        </nav>
        {domain === "commercial" && workspace.preparation && (
          <AssessmentPreparation key={workspace.preparation.id} received={workspace.preparation.received} />
        )}
        {domain === "consumer" ? (
          <ConsumerWorkflow />
        ) : domain === "sba" ? (
          <SbaWorkflow />
        ) : excel ? (
          <ExcelImport
            busy={state.status === "evaluating"}
            blocked={
              workspace.operation ||
              workspace.recoveryError ||
              workspace.conflict ||
              workspace.inFlight
                ? "Resolve the saved-write recovery banner before evaluating an imported case."
                : ""
            }
            serverErrors={workspace.fieldErrors}
            serverMessage={state.status === "unavailable" ? state.error : ""}
            onClose={() => {
              setExcel(false);
              excelNavigation.current?.focus();
            }}
            onEvaluate={async (draft) => {
              const generation = intakeGeneration.current;
              const result = await workspace.submitImport(draft);
              if (result && generation === intakeGeneration.current) {
                setExcel(false);
                setTab("spread");
              }
              return result;
            }}
          />
        ) : composer ? (
          <CommercialComposer
            key={composerMode}
            mode={composerMode}
            initial={
              accepted?.mode === composerMode ? accepted.input : undefined
            }
            serverErrors={workspace.fieldErrors}
            serverMessage={state.status === "unavailable" ? state.error : ""}
            busy={state.status === "evaluating"}
            onClose={() => setComposer(false)}
            onEvaluate={async (draft) => {
              const generation = intakeGeneration.current;
              const result = await submit(draft);
              if (result && generation === intakeGeneration.current) {
                setComposer(false);
                setTab("spread");
              }
              return result;
            }}
          />
        ) : idle ? (
          <StartScreen
            showCases={showCases}
            onExample={() => demo("dated")}
            onToggleCases={() => setShowCases((value) => !value)}
            onImport={openFile}
            onExcel={openExcel}
          />
        ) : (
          <CaseHeader
            view={view}
            filename={state.filename}
            legacy={accepted?.mode === "legacy"}
          />
        )}
        <PrototypeNotice />
        {showCases && domain === "commercial" && (
          <SavedCaseList
            onOpen={(locator) => {
              setShowCases(false);
              openSaved(locator);
            }}
            onClose={() => {
              setShowCases(false);
              queryWorkspace<HTMLButtonElement>(
                "[data-focus-fallback]",
              )?.focus();
            }}
          />
        )}
        <RecoveryPanel
          workspace={workspace}
          onOpenComparison={(view) => {
            const record = view.record;
            writeComparisonLocator(record.case_id, record.comparison_id);
            void workspace
              .openSaved({
                caseId: record.case_id,
                revision: record.baseline_revision,
              })
              .then(() => setTab("stress"));
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
        {!composer &&
          !excel &&
          correctionDraft &&
          correctionErrors.length > 0 && (
            <RejectedInputFields
              key={`${state.id}:${rejected?.id ?? "draft"}`}
              draft={correctionDraft}
              errors={correctionErrors}
              savedField={
                rejected?.kind === "edit" ? rejected.review.path : undefined
              }
              rationale={rejectedCommand?.rationale}
              onEvaluate={(draft) => void submit(draft)}
              onReviewSaved={async (next, rationale, element) => {
                const review = await workspace.reviewRejected(next, rationale);
                if (review)
                  edits.review(review.field, review.proposal, element);
              }}
            />
          )}
        {domain === "commercial" && !composer && !excel && !idle && (
          <>
            <WorkspaceStatus
              state={state}
              view={view}
              preparing={!!workspace.preparation}
              onImport={openFile}
              onSubmit={(draft) => void submit(draft)}
              onOpen={openSaved}
            />
            <DecisionBar view={view} />
            {assessment && <KpiTiles assessment={assessment} />}
            {assessment && <ContextStrip assessment={assessment} />}
            {/* The saved revision's record follows the answer and its figures, not ahead of them. */}
            {state.saved && (
              <SavedContext
                saved={state.saved}
                active={ready}
                onOpen={openSaved}
              />
            )}
            {assessment && <ModelScope />}
            {ready && state.saved?.view.compatibility && (
              <CompatibilityPanel view={state.saved.view} />
            )}
            <Tabs
              label="Workspace views"
              tabs={workspaceTabs}
              selected={tab}
              onSelect={setTab}
            >
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
              {tab === "overview" && (
                <>
                  <OverviewView view={view} />
                  <AnalysisPanels kind="breakevens" />
                </>
              )}
              {tab === "debt" && (
                <>
                  <DebtLoanView
                    ready={ready}
                    accepted={accepted}
                    canEdit={workspace.canEdit}
                    onEdit={edits.open}
                  />
                  <AnalysisPanels kind="schedule" />
                </>
              )}
              {tab === "global" && (
                <GlobalCashFlowView
                  ready={ready}
                  accepted={accepted}
                  canEdit={workspace.canEdit}
                  onEdit={edits.open}
                />
              )}
              {tab === "stress" && (
                <>
                  <AnalysisPanels kind="grid" />
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
                </>
              )}
              {tab === "memo" && <MemoView decision={decision} />}
              {tab === "audit" && (
                <div className="historyAudit">
                  <HistoryView
                    saved={state.saved}
                    ready={ready}
                    history={state.history}
                    input={input}
                    onOpen={openSaved}
                  />
                  <DetailsView
                    ready={ready}
                    input={input}
                    assessment={assessment}
                    decision={decision}
                    index={index}
                  />
                  <Review
                    view={ready ? (state.saved?.view ?? null) : null}
                    selection={state.saved?.selection ?? null}
                    headRevision={state.saved?.headRevision ?? null}
                    sourceScope={`${state.id}:${state.status}`}
                    original={scenarios.original}
                    pending={
                      !!(
                        workspace.operation ||
                        workspace.recoveryError ||
                        workspace.conflict ||
                        workspace.inFlight
                      )
                    }
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
