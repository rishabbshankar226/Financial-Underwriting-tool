import { useId, useState } from "react";
import { formatDecimal } from "../decimal";
import type { Assessment, Decision, Input, Metric } from "../contracts";
import { derivedSpreadFacts, fieldLabels as labels, periodLabel } from "../fieldCatalog";
import { metricText } from "../metricDisplay";

/** Definitions, operands and policy comparisons behind the current result. Saved-run recording metadata is
 * shown with the revision history beside it. */
export function DetailsView({
  ready,
  input,
  assessment,
  decision,
  index,
}: {
  ready: boolean;
  input: Input | undefined;
  assessment: Assessment | null;
  decision: Decision | null;
  index: number;
}) {
  const heading = useId();
  const body = useId();
  // The working behind the result is folded by default; the answer and its thresholds stay above.
  const [open, setOpen] = useState(false);
  return (
    <section className="panel" aria-labelledby={heading}>
      <h2 id={heading}>Calculation details</h2>
      {!assessment && (
        <p>
          {ready
            ? "Legacy mode has decision factors but no dated spread or trace."
            : "No current assessment is available."}
        </p>
      )}
      {(assessment || decision) && (
        <button
          type="button"
          className="detailsToggle"
          aria-expanded={open}
          aria-controls={body}
          onClick={() => setOpen((value) => !value)}
        >
          Definitions, operands and policy snapshot
        </button>
      )}
      <div id={body} hidden={!open}>
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
          {derivedSpreadFacts.map((key) => (
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
      ) : null}
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
      </div>
    </section>
  );
}

/** One calculated fact with its definition, actual operands and raw result. */
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
