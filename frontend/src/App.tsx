import { useEffect, useRef, useState } from "react";
import { fieldLabels as labels } from "./fieldCatalog";
import { legacyFactorText as factorText } from "./format";
import { selectWorkspaceView } from "./workspaceSelectors";
import { useEditController } from "./useEditController";
import EditDialog from "./EditDialog";
import { queryWorkspace } from "./workspaceDom";
import AssessmentSummary from "./AssessmentSummary";
import { Scenarios } from "./Scenarios";
import { Review } from "./Review";
import { prototypeDisclaimer } from "./prototypeDisclaimer";
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
import { useAnalystWorkspace } from "./useAnalystWorkspace";
import { SaveCaseDialog, DiscardTrackingDialog } from "./CaseDialogs";
import {
  SavedCaseList,
  SavedContext,
  SavedHistory,
  RecoveryPanel,
} from "./SavedCases";
const disclaimer = prototypeDisclaimer;
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
      {tab === "memo" && (
        <section className="panel memo">
          <h2>Credit memo</h2>
          {decision ? (
            <>
              <h3>Recommendation</h3>
              <p>
                {decision.outcome[0].toUpperCase() + decision.outcome.slice(1)}{" "}
                for prototype demonstration based on the accepted inputs.
              </p>
              <h3>Primary factors considered</h3>
              <ul>
                {decision.factors.map((f) => (
                  <li key={f.name}>
                    {labels[f.name]}: {factorText(f)} —{" "}
                    {f.passed === null
                      ? "manual review required"
                      : f.passed
                        ? "meets configured policy"
                        : "does not meet configured policy"}
                  </li>
                ))}
              </ul>
              <h3>Recorded reasons</h3>
              {decision.reasons.length ? (
                <ul>
                  {decision.reasons.map((r, i) => (
                    <li key={i}>{r.message}</li>
                  ))}
                </ul>
              ) : (
                <p>No additional reasons returned.</p>
              )}
            </>
          ) : (
            <p>No current decision is available.</p>
          )}
          <p className="fine">{disclaimer}</p>
        </section>
      )}
      {tab === "history" &&
        (state.saved ? (
          <SavedHistory
            saved={state.saved}
            active={ready}
            onOpen={(locator) => void workspace.openSaved(locator)}
          />
        ) : (
          <section className="panel memo">
            <h2>Session edit history</h2>
            <p>
              Resets on reload. Actor: demonstration analyst; timestamps are
              local and unverified.
            </p>
            {state.history.length === 0 ? (
              <p>No applied edits this session.</p>
            ) : (
              state.history.map((e, i) => (
                <div className="audit" key={i}>
                  <strong>{e.path}</strong>
                  <span>
                    {e.prior} → {e.next}
                  </span>
                  <small>
                    {e.rationale} · {e.at}
                  </small>
                </div>
              ))
            )}
            {input && "overrides" in input && !!input.overrides?.length && (
              <>
                <h3>Unverified imported history</h3>
                {input.overrides.map((e, i) => (
                  <div className="audit imported" key={i}>
                    <strong>{e.field}</strong>
                    <span>
                      {String(e.prior_value)} → {String(e.new_value)}
                    </span>
                    <small>
                      {e.rationale} · supplied actor {e.actor} · {e.at}
                    </small>
                  </div>
                ))}
              </>
            )}
          </section>
        ))}
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
