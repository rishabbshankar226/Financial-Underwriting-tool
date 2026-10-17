import { formatDecimal, shiftDecimal } from "./decimal";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { annualFields, type Assessment, type Metric } from "./contracts";
import {
  assumptionField,
  fieldLabels as labels,
  periodLabel,
  spreadField,
  workingCapitalPeriod,
} from "./fieldCatalog";
import { legacyFactorText as factorText, legacyMoney as money } from "./format";
import type { EditableField } from "./workspace";
import { selectWorkspaceView } from "./workspaceSelectors";
import { useEditController } from "./useEditController";
import EditDialog from "./EditDialog";
import { metricText } from "./metricDisplay";
import { queryWorkspace } from "./workspaceDom";
import AssessmentSummary from "./AssessmentSummary";
import { Scenarios } from "./Scenarios";
import { Review } from "./Review";
import { prototypeDisclaimer } from "./prototypeDisclaimer";
import { useScenarioWorkspace } from "./useScenarioWorkspace";
import { writeComparisonLocator } from "./scenarioSelection";
import { BrandBar, CaseHeader } from "./views/WorkspaceHeader";
import { PrototypeNotice } from "./views/PrototypeNotice";
import { useAnalystWorkspace } from "./useAnalystWorkspace";
import { SaveCaseDialog, DiscardTrackingDialog } from "./CaseDialogs";
import {
  SavedCaseList,
  SavedContext,
  SavedHistory,
  RecordingDetails,
  RecoveryPanel,
} from "./SavedCases";
const disclaimer = prototypeDisclaimer;
function TraceDetail({
  metric,
  assessment,
}: {
  metric: Metric;
  assessment: Assessment;
}) {
  const row = assessment.calculation_trace.find(
    (r) => r.fact_id === metric.fact_id,
  );
  return row ? (
    <details>
      <summary>
        {metric.fact_id} · {metricText(metric)}
      </summary>
      <p>
        <strong>{row.definition_id}</strong>
      </p>
      <p className="expression">{row.expression}</p>
      <h3>Actual operands</h3>
      {row.operands.map((o, i) => (
        <div className="operand" key={i}>
          <code>{o.reference}</code>
          <span>
            {o.raw_value === null ? "Not applicable" : String(o.raw_value)}{" "}
            {o.unit}
          </span>
          <small>{o.reference_type}{o.reported_value !== null && ` · Reported component: ${formatDecimal(String(o.reported_value), 2)} ${o.unit}`}</small>
        </div>
      ))}
      <p>
        Raw result: {String(row.raw_value)} {row.unit}
      </p>
      {row.explanation && <p>{row.explanation}</p>}
    </details>
  ) : null;
}
export default function App() {
  const workspace = useAnalystWorkspace();
  const scenarios = useScenarioWorkspace(workspace);
  const { state, submit, demo, upload } = workspace;
  const [tab, setTab] = useState<
    "spread" | "assumptions" | "details" | "memo" | "history" | "scenarios" | "review"
  >("spread");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [saving, setSaving] = useState(false),
    [showCases, setShowCases] = useState(false),
    [discarding, setDiscarding] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const edits = useEditController(opener, workspace.edit);
  const view = selectWorkspaceView(state);
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
  function editButton(editable: EditableField, content: ReactNode, label?: string) {
    return (
      <button
        className="rowEdit"
        aria-label={label}
        disabled={!workspace.canEdit}
        onClick={(event) => edits.open(editable, event.currentTarget)}
      >
        {content}
      </button>
    );
  }
  function assumptionGroup(
    title: string,
    prefix: string,
    values: Record<string, string | number>,
    period?: string,
  ) {
    return (
      <div className="panel" key={prefix}>
        <h2>{title}</h2>
        {Object.entries(values).map(([key, value]) => {
          const editable = assumptionField(input!, accepted!.mode, prefix, key, value, period);
          return (
            <div className="assumption" key={key}>
              {editButton(editable, editable.label)}
              <strong>
                {editable.unit === "%"
                  ? `${money(shiftDecimal(String(value), 2))}%`
                  : editable.unit === "months"
                    ? `${value} months`
                    : `$${money(String(value))}`}
              </strong>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <main className="analystWorkspace">
      <BrandBar />
      <CaseHeader view={view} />
      <PrototypeNotice />
      <div className="uploadbar">
        <div className="actions">
          <button onClick={() => demo("dated")}>Dated Alpine demo</button>
          <button onClick={() => demo("legacy")}>Legacy Alpine demo</button>
          <button
            data-focus-fallback
            aria-expanded={showCases}
            onClick={() => setShowCases((value) => !value)}
          >
            Saved cases
          </button>
          <button
            className="primary"
            disabled={!workspace.canSave}
            onClick={(event) => {
              opener.current = event.currentTarget;
              setSaving(true);
            }}
          >
            Save case
          </button>
        </div>
        <label>
          Import synthetic JSON{" "}
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <span>{state.filename} · synthetic only</span>
        {accepted?.mode === "legacy" && (
          <span>
            Saving requires a separately imported dated assessment with explicit
            dates and units.
          </span>
        )}
      </div>
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
      {!ready && (
        <div className="pending" role="status">
          <strong>{view.pendingTitle}</strong>
          {state.draft && state.action === "evaluate" && (
            <p>
              Submitted draft: {state.draft.filename} · {state.draft.mode} ·{" "}
              {typeof state.draft.payload.borrower_name === "string"
                ? state.draft.payload.borrower_name
                : "Unnamed input"}
              {state.draft.edit &&
                ` · ${state.draft.edit.path}: ${state.draft.edit.prior} → ${state.draft.edit.next}`}
            </p>
          )}
          {accepted &&
            !state.saved &&
            (state.action === "evaluate" || !workspace.operation) && (
              <p>
                Previous accepted case: {accepted.input.borrower_name} ·{" "}
                {accepted.filename}. Its recommendation is inactive.
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
          {state.draft && state.action === "evaluate" && (
            <button onClick={() => void submit(state.draft!)}>
              Retry submitted draft
            </button>
          )}
          {accepted &&
            !state.saved &&
            (state.action === "evaluate" || !workspace.operation) && (
              <button
                onClick={() =>
                  void submit({
                    mode: accepted.mode,
                    payload: accepted.input,
                    filename: accepted.filename,
                  })
                }
              >
                Re-evaluate last accepted case
              </button>
            )}
          {state.saved && (
            <button
              onClick={() =>
                void workspace.openSaved({
                  caseId: state.saved!.view.snapshot.case_id,
                  revision: state.saved!.view.snapshot.revision,
                })
              }
            >
              View previous stored revision
            </button>
          )}
        </div>
      )}
      {ready && state.saved?.view.compatibility && tab !== "review" && (
        <section className="panel compatibility">
          <h2>Original stored assessment</h2>
          <p>{state.saved.view.compatibility}</p>
          <pre>{JSON.stringify(state.saved.view.snapshot, null, 2)}</pre>
        </section>
      )}
      {assessment && (
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
      )}
      {assessment && <AssessmentSummary assessment={assessment} />}
      <nav className="workspaceNav" aria-label="Workspace views">
        {(["spread", "assumptions", "details", "memo", "history", "scenarios", "review"] as const).map(
          (value) => (
            <button
              className={tab === value ? "active" : ""}
              aria-pressed={tab === value}
              aria-current={tab === value ? "page" : undefined}
              onClick={() => setTab(value)}
              key={value}
            >
              {value === "scenarios" ? "Scenarios" : value === "review" ? "Review" : value}
            </button>
          ),
        )}
      </nav>
      {tab === "scenarios" && <Scenarios model={scenarios}
        onSaveBaseline={(element) => { if (workspace.canSave) { opener.current = element; setSaving(true); } }}
        onOpenBaseline={(locator) => void workspace.openSaved(locator)}/>}
      {tab === "review" && <Review view={ready ? state.saved?.view ?? null : null}
        selection={state.saved?.selection ?? null} headRevision={state.saved?.headRevision ?? null}
        sourceScope={`${state.id}:${state.status}`} original={scenarios.original}
        pending={!!(workspace.operation || workspace.recoveryError || workspace.conflict || workspace.inFlight)}
        onOpenBaseline={(locator) => void workspace.openSaved(locator)}/>}
      {tab === "spread" && (
        <section className="grid">
          <div className="panel wide">
            <div className="panelTitle">
              <h2>Annual financial spread</h2>
              <span>
                {ready
                  ? workspace.canEdit
                    ? "Select a supplied input to edit · derived rows are read-only"
                    : "Original accepted inputs · editing unavailable for this selection"
                  : "Previous accepted inputs · editing unavailable"}
              </span>
            </div>
            {input ? (
              <div className="tableScroll">
                <table>
                  <thead>
                    <tr>
                      <th>Line item · USD</th>
                      {input.years.map((y, i) => (
                        <th key={i}>
                          <button
                            aria-pressed={index === i}
                            className={index === i ? "period active" : "period"}
                            onClick={() => setSelectedPeriod(i)}
                          >
                            {periodLabel(y, i)}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {annualFields.map((key) => (
                      <tr key={key}>
                        <th scope="row">{labels[key]}</th>
                        {input.years.map((y, i) => (
                          <td key={i} className="num">
                            {editButton(
                              spreadField(input, i, key),
                              `$${money(assessment?.historical_spread[i].reported_financials[key] ?? y[key])}`,
                              `Edit ${labels[key]} for ${periodLabel(y, i)}`,
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {assessment &&
                      (
                        [
                          "gross_profit",
                          "ordinary_business_income",
                          "ebitda",
                          "k1_distribution_ratio",
                        ] as const
                      ).map((key) => (
                        <tr className="derived" data-fact={key} key={key}>
                          <th scope="row">
                            {labels[key] ?? "K-1 distribution ratio"}{" "}
                            <small>Calculated</small>
                          </th>
                          {assessment.historical_spread.map((h, i) => (
                            <td key={i} className="num">
                              {metricText(h[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No accepted inputs yet.</p>
            )}
            {assessment && <p className="fine">Report amounts reconcile to income totals in cents. Editing opens the original unrounded input.</p>}
            {accepted?.mode === "legacy" && (
              <p className="fine">
                Legacy inputs have no verified dates or dated calculation trace.
                Supplied period order is retained.
              </p>
            )}
          </div>
          <div className="panel">
            <h2>Current coverage</h2>
            {decision ? (
              decision.factors.map((f) => (
                <div className="metric" data-state={f.passed === null ? "review" : f.passed ? "pass" : "fail"} key={f.name}>
                  <span>{labels[f.name] ?? f.name}</span>
                  <strong>{factorText(f)}</strong>
                  <small>
                    {f.name === "uca_positive"
                      ? `Must exceed $${money(String(f.threshold))}`
                      : `Policy: ${f.comparison_operator ?? "comparison unavailable"} ${String(f.threshold)}`}{" "}
                    ·{" "}
                    {f.passed === null
                      ? "Review required"
                      : f.passed
                        ? "Pass"
                        : "Below policy"}
                    {f.decline_threshold !== null &&
                      ` · decline below ${f.decline_threshold}x`}
                  </small>
                </div>
              ))
            ) : (
              <p>No current results. Resolve the selected input and retry.</p>
            )}
          </div>
        </section>
      )}
      {tab === "assumptions" && (
        <section>
          <p>
            {ready
              ? "Annual assumptions used by the backend. Select an amount to propose an edit."
              : "Previous accepted assumptions; no active recommendation."}
          </p>
          {input && (
            <div className="assumptionsGrid">
              {assumptionGroup(
                "Existing debt",
                "/existing_debt",
                input.existing_debt,
              )}
              {assumptionGroup(
                "Proposed fixed monthly loan",
                "/proposed_loan",
                {
                  amount: input.proposed_loan.amount,
                  annual_rate: input.proposed_loan.annual_rate,
                  term_months: input.proposed_loan.term_months,
                },
              )}
              {assumptionGroup(
                "Working capital",
                "/working_capital",
                {
                  ar_increase: input.working_capital.ar_increase,
                  inventory_increase: input.working_capital.inventory_increase,
                  ap_increase: input.working_capital.ap_increase,
                  cash_taxes_paid: input.working_capital.cash_taxes_paid,
                },
                workingCapitalPeriod(input),
              )}
              {input.guarantors.map((g, i) =>
                assumptionGroup(g.name, `/guarantors/${i}`, {
                  ownership_percentage: g.ownership_percentage,
                  wages: g.wages,
                  interest_dividend_income: g.interest_dividend_income,
                  mortgage_pi_annual: g.mortgage_pi_annual,
                  auto_loan_annual: g.auto_loan_annual,
                  credit_card_min_annual: g.credit_card_min_annual,
                }),
              )}
              {input.guarantors.length === 0 && (
                <div className="panel">
                  <h2>Business-only fallback</h2>
                  <p>
                    No guarantors supplied. The backend uses full business
                    EBITDA for global coverage.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}
      {tab === "details" && (
        <section className="panel">
          <h2>Calculation and policy details</h2>
          {ready && state.saved && <RecordingDetails view={state.saved.view} />}
          {assessment ? (
            <>
              <p>
                Policy version:{" "}
                <strong>{assessment.policy_snapshot.version}</strong>
              </p>
              <p>
                K-1 comparison periods:{" "}
                {assessment.k1_history_periods
                  .map((p, i) => periodLabel(p, i))
                  .join(" / ")}
              </p>
              <h3>Current facts</h3>
              {Object.values(assessment.current_facts).map((m) => (
                <TraceDetail
                  key={m.fact_id}
                  metric={m}
                  assessment={assessment}
                />
              ))}
              <h3>
                Selected historical period:{" "}
                {periodLabel(input!.years[index], index)}
              </h3>
              {(
                [
                  "gross_profit",
                  "ordinary_business_income",
                  "ebitda",
                  "k1_distribution_ratio",
                ] as const
              ).map((key) => (
                <TraceDetail
                  key={key}
                  metric={assessment.historical_spread[index][key]}
                  assessment={assessment}
                />
              ))}
              <h3>Guarantor contributions</h3>
              {assessment.guarantor_contributions.length ? (
                assessment.guarantor_contributions.map((g) => (
                  <div key={g.guarantor_index}>
                    <h4>{g.name}</h4>
                    {[g.business_ebitda, g.outside_income, g.personal_debt].map(
                      (m) => (
                        <TraceDetail
                          key={m.fact_id}
                          metric={m}
                          assessment={assessment}
                        />
                      ),
                    )}
                  </div>
                ))
              ) : (
                <p>Business-only fallback; no guarantor contributions.</p>
              )}
              <details>
                <summary>Complete policy snapshot</summary>
                <pre>{JSON.stringify(assessment.policy_snapshot, null, 2)}</pre>
              </details>
              <p className="fine">
                Calculation: {assessment.calculation_version} · serialization:{" "}
                {assessment.serialization_version}
                <br />
                Content fingerprint (not document authentication):{" "}
                <code>{assessment.fingerprint.value}</code>
              </p>
            </>
          ) : (
            <p>
              {ready
                ? "Legacy mode has decision factors but no dated spread or trace."
                : "No current assessment is available."}
            </p>
          )}
          {decision && (
            <div>
              <h3>Raw policy comparisons</h3>
              {decision.factors.map((f) => (
                <div className="operand" key={f.name}>
                  <strong>{labels[f.name]}</strong>
                  <span>
                    Raw: {String(f.raw_value)} {f.comparison_operator}{" "}
                    {String(f.threshold)} · decline floor{" "}
                    {f.decline_threshold ?? "not applicable"}
                  </span>
                  <small>{f.source}</small>
                </div>
              ))}
            </div>
          )}
        </section>
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
