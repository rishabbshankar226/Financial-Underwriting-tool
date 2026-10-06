import { useEffect, useReducer, useRef, useState } from "react";
import alpine from "../../backend/fixtures/alpine.json";
import datedAlpine from "../../backend/fixtures/alpine_dated.json";
import {
  annualFields,
  detectMode,
  guardLegacyInput,
  type Assessment,
  type DatedRequest,
  type Factor,
  type Period,
  type Input,
  type Metric,
} from "./contracts";
import { evaluate } from "./api";
import {
  applyEdit,
  initialWorkspace,
  transition,
  type Draft,
  type EditableField,
  type EditEvent,
} from "./workspace";
import EditDialog from "./EditDialog";
const disclaimer =
  "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.";
const labels: Record<string, string> = {
  gross_receipts: "Gross receipts",
  cogs: "COGS",
  operating_expense_excl_dna_interest_comp: "Operating expenses",
  officer_compensation: "Officer compensation",
  depreciation: "Depreciation",
  amortization: "Amortization",
  interest_expense: "Interest expense",
  section_179: "Section 179",
  k1_distribution: "K-1 distributions",
  ordinary_business_income: "Ordinary business income",
  ebitda: "EBITDA",
  dscr: "DSCR",
  fccr: "Simplified FCCR",
  global_dscr: "Global DSCR",
  uca_positive: "UCA cash flow",
  k1_history: "K-1 distribution history",
  cpltd_annual: "Annual CPLTD",
  operating_lease_annual: "Annual operating leases",
  amount: "Proposed principal",
  annual_rate: "Annual nominal rate",
  term_months: "Loan term",
  ownership_percentage: "Ownership",
  wages: "Annual wages",
  interest_dividend_income: "Annual interest/dividend income",
  mortgage_pi_annual: "Annual mortgage P&I",
  auto_loan_annual: "Annual auto debt",
  credit_card_min_annual: "Annual card minimum",
  ar_increase: "AR increase",
  inventory_increase: "Inventory increase",
  ap_increase: "AP increase",
  cash_taxes_paid: "Cash taxes paid",
};
const money = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const periodLabel = (year: Partial<Period>, index: number) =>
  year.period_start && year.period_end
    ? `${year.period_start} – ${year.period_end}`
    : `Supplied period ${index + 1}`;
function metricText(m: Metric): string {
  if (m.status === "not_applicable") return "Not applicable";
  if (typeof m.raw_value !== "number") return String(m.raw_value);
  return `${m.raw_value.toLocaleString("en-US", { minimumFractionDigits: m.display_precision ?? 0, maximumFractionDigits: m.display_precision ?? 0 })} ${m.unit}`;
}
function factorText(f: Factor): string {
  const v = f.raw_value;
  if (v === null) return "Not applicable";
  if (typeof v !== "number") return String(v);
  return f.name === "uca_positive" ? `$${money(v)}` : `${v.toFixed(3)}x`;
}
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
          <small>{o.reference_type}</small>
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
  const [state, dispatch] = useReducer(transition, initialWorkspace);
  const [tab, setTab] = useState<
    "spread" | "assumptions" | "details" | "memo" | "history"
  >("spread");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [editing, setEditing] = useState<EditableField | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const sequence = useRef(0);
  const active = useRef<AbortController | null>(null);
  const ready = state.status === "ready",
    accepted = state.accepted,
    input = accepted?.input;
  const assessment =
    ready && accepted?.mode === "dated" ? accepted.result : null;
  const decision =
    ready && accepted
      ? accepted.mode === "dated"
        ? accepted.result.decision
        : accepted.result
      : null;
  const index = input ? Math.min(selectedPeriod, input.years.length - 1) : 0;
  function begin(filename: string, draft: Draft | null): number {
    const id = ++sequence.current;
    active.current?.abort();
    active.current = null;
    setEditing(null);
    dispatch({ type: "start", id, filename, draft });
    return id;
  }
  async function submit(draft: Draft, id = begin(draft.filename, draft)) {
    if (id !== sequence.current) return;
    dispatch({ type: "start", id, filename: draft.filename, draft });
    const controller = new AbortController();
    active.current = controller;
    try {
      const result = await evaluate(draft, controller.signal);
      if (id !== sequence.current || controller.signal.aborted) return;
      dispatch({ type: "success", id, accepted: result });
      if (draft.resetHistory) setSelectedPeriod(result.input.years.length - 1);
    } catch (err) {
      if (id === sequence.current && !controller.signal.aborted)
        dispatch({
          type: "failure",
          id,
          error: `Invalid fixture or unavailable backend: ${err instanceof Error ? err.message : String(err)}`,
        });
    }
  }
  function demo(mode: "dated" | "legacy") {
    void submit({
      mode,
      payload:
        mode === "dated"
          ? (datedAlpine as DatedRequest)
          : guardLegacyInput(alpine),
      filename: mode === "dated" ? "alpine_dated.json" : "alpine.json",
      resetHistory: true,
    });
  }
  useEffect(() => {
    demo("dated");
    return () => {
      sequence.current++;
      active.current?.abort();
    };
  }, []);
  async function upload(file: File | undefined) {
    if (!file) return;
    const id = begin(file.name, null);
    try {
      if (file.size > 1_000_000)
        throw new Error("Use a JSON file no larger than 1,000,000 bytes.");
      const rawJson = await file.text();
      if (id !== sequence.current) return;
      const payload: unknown = JSON.parse(rawJson);
      const mode = detectMode(payload);
      await submit(
        {
          mode,
          payload: payload as Input,
          filename: file.name,
          rawJson,
          resetHistory: true,
        },
        id,
      );
    } catch (err) {
      if (id === sequence.current)
        dispatch({
          type: "failure",
          id,
          error: `Invalid fixture: ${err instanceof Error ? err.message : String(err)}`,
        });
    }
  }
  function edit(editEvent: EditEvent) {
    if (!ready || !accepted) return;
    void submit({
      mode: accepted.mode,
      payload: applyEdit(accepted.input, editEvent),
      filename: accepted.filename,
      edit: editEvent,
    });
  }
  function field(
    path: string,
    label: string,
    value: number,
    unit: EditableField["unit"] = "USD",
    min?: number,
    max?: number,
    integer = false,
    period?: string,
  ) {
    return (
      <button
        className="rowEdit"
        disabled={!ready}
        onClick={(event) => {
          opener.current = event.currentTarget;
          setEditing({
            path,
            label,
            value,
            unit,
            min,
            max,
            integer,
            period:
              period ??
              (input && "assessment_as_of" in input
                ? `Assumption as of ${input.assessment_as_of}`
                : "Legacy annual assumption"),
          });
        }}
      >
        {label}
      </button>
    );
  }
  function assumptionGroup(
    title: string,
    prefix: string,
    values: Record<string, number>,
    period?: string,
  ) {
    return (
      <div className="panel" key={prefix}>
        <h2>{title}</h2>
        {Object.entries(values).map(([key, value]) => {
          const percent = ["annual_rate", "ownership_percentage"].includes(key),
            integer = key === "term_months";
          const nonnegative = [
            "cpltd_annual",
            "operating_lease_annual",
            "amount",
            "annual_rate",
            "ownership_percentage",
            "mortgage_pi_annual",
            "auto_loan_annual",
            "credit_card_min_annual",
          ].includes(key);
          return (
            <div className="assumption" key={key}>
              {field(
                `${prefix}/${key}`,
                labels[key] ?? key,
                value,
                percent ? "%" : integer ? "months" : "USD",
                integer
                  ? accepted?.mode === "dated"
                    ? 12
                    : 1
                  : nonnegative
                    ? 0
                    : undefined,
                key === "ownership_percentage" ||
                  (key === "annual_rate" && accepted?.mode === "dated")
                  ? 1
                  : undefined,
                integer,
                period,
              )}
              <strong>
                {percent
                  ? `${money(value * 100)}%`
                  : integer
                    ? `${value} months`
                    : `$${money(value)}`}
              </strong>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <main>
      <header>
        <div>
          <div className="eyebrow">SPREADLINE / CREDIT WORKSPACE</div>
          <h1>{ready ? input?.borrower_name : "Assessment workspace"}</h1>
          <p>
            {ready
              ? accepted?.mode === "dated"
                ? "Dated assessment"
                : "Legacy · undated input"
              : state.status === "evaluating"
                ? "Evaluating selected draft"
                : "Selected input unavailable"}
          </p>
        </div>
        <div className="decision" aria-live="polite">
          <span>Illustrative decision</span>
          <strong>
            {decision
              ? decision.outcome.toUpperCase()
              : state.status === "evaluating"
                ? "CALCULATING"
                : "UNAVAILABLE"}
          </strong>
          <small>
            {decision
              ? `${decision.policy_version} · illustrative score ${decision.score}`
              : "A current accepted calculation is required"}
          </small>
        </div>
      </header>
      <div className="warning">{disclaimer}</div>
      <div className="uploadbar">
        <div className="actions">
          <button onClick={() => demo("dated")}>Dated Alpine demo</button>
          <button onClick={() => demo("legacy")}>Legacy Alpine demo</button>
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
      </div>
      {!ready && (
        <div className="pending" role="status">
          <strong>
            {state.status === "evaluating"
              ? "Evaluating draft"
              : "No current result"}
          </strong>
          {state.draft && (
            <p>
              Submitted draft: {state.draft.filename} · {state.draft.mode} ·{" "}
              {typeof state.draft.payload.borrower_name === "string"
                ? state.draft.payload.borrower_name
                : "Unnamed input"}
              {state.draft.edit &&
                ` · ${state.draft.edit.path}: ${state.draft.edit.prior} → ${state.draft.edit.next}`}
            </p>
          )}
          {accepted && (
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
          {state.draft && (
            <button onClick={() => void submit(state.draft!)}>
              Retry submitted draft
            </button>
          )}
          {accepted && (
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
        </div>
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
      <nav aria-label="Workspace views">
        {(["spread", "assumptions", "details", "memo", "history"] as const).map(
          (value) => (
            <button
              className={tab === value ? "active" : ""}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              key={value}
            >
              {value}
            </button>
          ),
        )}
      </nav>
      {tab === "spread" && (
        <section className="grid">
          <div className="panel wide">
            <div className="panelTitle">
              <h2>Annual financial spread</h2>
              <span>
                {ready
                  ? "Select a supplied input to edit · derived rows are read-only"
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
                            <button
                              className="rowEdit"
                              aria-label={`Edit ${labels[key]} for ${periodLabel(y, i)}`}
                              disabled={!ready}
                              onClick={(event) => {
                                opener.current = event.currentTarget;
                                setEditing({
                                  path: `/years/${i}/${key}`,
                                  label: labels[key],
                                  value: y[key],
                                  unit: "USD",
                                  min:
                                    key === "interest_expense" ? 0 : undefined,
                                  period: periodLabel(y, i),
                                });
                              }}
                            >
                              ${money(y[key])}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                    {assessment &&
                      (
                        [
                          "ordinary_business_income",
                          "ebitda",
                          "k1_distribution_ratio",
                        ] as const
                      ).map((key) => (
                        <tr className="derived" key={key}>
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
                <div className="metric" key={f.name}>
                  <span>{labels[f.name] ?? f.name}</span>
                  <strong>{factorText(f)}</strong>
                  <small>
                    {f.name === "uca_positive"
                      ? `Must exceed $${money(Number(f.threshold))}`
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
                `Working capital for ${periodLabel(input.years[input.years.length - 1], input.years.length - 1)}`,
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
      {tab === "history" && (
        <section className="panel memo">
          <h2>Session edit history</h2>
          <p>
            Resets on reload. Actor: demonstration analyst; timestamps are local
            and unverified.
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
      )}
      {editing && (
        <EditDialog
          restoreFocus={opener.current}
          field={editing}
          onCancel={() => setEditing(null)}
          onSubmit={edit}
        />
      )}
      <footer>
        Spreadline · Synthetic analyst demonstration · Session-only workspace
      </footer>
    </main>
  );
}
