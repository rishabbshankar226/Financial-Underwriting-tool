import { useRef, useState } from "react";
import {
  annualFields,
  type Assessment,
  type Decision,
  type Input,
  type Metric,
} from "../contracts";
import {
  derivedSpreadFacts,
  factLabels,
  fieldLabels as labels,
  periodLabel,
  spreadField,
} from "../fieldCatalog";
import {
  formatMultiple,
  isDecimal,
  formatDecimal,
  formatRatioPercent,
  groupDecimal,
} from "../decimal";
import { factorValueText, moneyText } from "../format";
import { metricText } from "../metricDisplay";
import { EditButton, type OpenEditor } from "./EditButton";
import { useAnalysis } from "../useAnalysis";
import type { AnalysisLine } from "../analysisContracts";
import { TraceInspector } from "../TraceInspector";

export function SpreadView({
  ready,
  canEdit,
  input,
  legacy,
  assessment,
  decision,
  index,
  onSelectPeriod,
  onEdit,
}: {
  ready: boolean;
  canEdit: boolean;
  input: Input | undefined;
  legacy: boolean;
  assessment: Assessment | null;
  decision: Decision | null;
  index: number;
  onSelectPeriod: (index: number) => void;
  onEdit: OpenEditor;
}) {
  const [presentation, setPresentation] = useState("reported"),
    [factId, setFactId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const analysis = useAnalysis().state;
  const row = assessment?.calculation_trace.find(
    (trace) => trace.fact_id === factId,
  );
  const currentKey =
    assessment &&
    Object.entries(assessment.current_facts).find(
      ([, metric]) => metric.fact_id === factId,
    )?.[0];
  const factor = decision?.factors.find(
    (value) =>
      value.name === currentKey ||
      (value.name === "uca_positive" && currentKey === "uca_cash_flow"),
  );
  function inspect(metric: Metric, element: HTMLElement) {
    opener.current = element;
    setFactId(metric.fact_id);
  }
  function lineValue(
    key: string,
    period: number,
    raw: string,
    metric?: Metric,
  ) {
    if (presentation === "raw")
      return metric?.status === "not_applicable"
        ? "Unavailable"
        : isDecimal(metric?.raw_value ?? raw)
          ? groupDecimal(metric?.raw_value ?? raw)
          : String(metric?.raw_value ?? raw);
    if (presentation === "common" || presentation === "change") {
      if (analysis.status !== "ready") return "Analysis unavailable";
      const data = analysis.analysis.periods[period],
        values =
          presentation === "common" ? data.common_size : data.change_vs_prior;
      const value = values?.[key as AnalysisLine];
      return value?.status === "available" && isDecimal(value.raw_value)
        ? formatRatioPercent(value.raw_value, 2)
        : presentation === "change" && !data.prior_period
          ? "No prior period"
          : "Unavailable";
    }
    return metric ? metricText(metric) : `$${formatDecimal(raw, 2)}`;
  }
  return (
    <section className="grid">
      <div className="panel wide">
        <div className="panelTitle">
          <h2>Annual financial spread</h2>
          <span>
            {ready
              ? canEdit
                ? "Select a supplied input to edit · derived rows are read-only"
                : "Original accepted inputs · editing unavailable for this selection"
              : "Previous accepted inputs · editing unavailable"}
          </span>
        </div>
        <label className="spreadMode">
          Spread presentation
          <select
            aria-label="Spread presentation"
            value={presentation}
            onChange={(event) => setPresentation(event.target.value)}
          >
            <option value="raw">Accepted raw inputs</option>
            <option value="reported">Reported amounts (rounded half to even)</option>
            <option value="common">Common-size (%)</option>
            <option value="change">Year-over-year change</option>
          </select>
        </label>
        {presentation === "raw" && (
          <p className="fine">
            Exact accepted source inputs and server raw calculated facts. No
            digits are discarded.
          </p>
        )}
        {(presentation === "common" || presentation === "change") && (
          <p className="fine">
            Server analysis only. Unavailable or non-comparable prior values are
            shown explicitly; no change is calculated by the browser.
          </p>
        )}
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
                        onClick={() => onSelectPeriod(i)}
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
                        <EditButton
                          field={spreadField(input, i, key)}
                          canEdit={canEdit}
                          onEdit={onEdit}
                          label={`Edit ${labels[key]} for ${periodLabel(y, i)}`}
                        >
                          {lineValue(
                            key,
                            i,
                            presentation === "reported"
                              ? (assessment?.historical_spread[i]
                                  .reported_financials[key] ?? y[key])
                              : y[key],
                          )}
                        </EditButton>
                      </td>
                    ))}
                  </tr>
                ))}
                {assessment &&
                  derivedSpreadFacts.map((key) => (
                    <tr className="derived" data-fact={key} key={key}>
                      <th scope="row">
                        {labels[key] ?? "K-1 distribution ratio"}{" "}
                        <small>Calculated</small>
                      </th>
                      {assessment.historical_spread.map((h, i) => (
                        <td key={i} className="num">
                          <button
                            type="button"
                            className="traceLink"
                            aria-label={`Inspect ${labels[key] ?? "K-1 distribution ratio"} for ${periodLabel(h, i)}`}
                            onClick={(event) =>
                              inspect(h[key], event.currentTarget)
                            }
                          >
                            {lineValue(key, i, h[key].raw_value ?? "", h[key])}
                          </button>
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
        {assessment && (
          <p className="fine">
            Report amounts reconcile to income totals in cents. Editing opens
            the original unrounded input.
          </p>
        )}
        {legacy && (
          <p className="fine">
            Legacy inputs have no verified dates or dated calculation trace.
            Supplied period order is retained.
          </p>
        )}
      </div>
      <div className="contextPane">
        <CoveragePanel
          decision={decision}
          assessment={assessment}
          onInspect={inspect}
        />
        {row && (
          <TraceInspector
            data={{
              title:
                labels[row.fact_id.split(".").slice(-1)[0] ?? ""] ??
                factLabels[row.fact_id.split(".").slice(-1)[0] ?? ""] ??
                row.fact_id,
              trace: row,
              factor,
            }}
            onClose={() => {
              setFactId(null);
              opener.current?.focus();
            }}
          />
        )}
      </div>
    </section>
  );
}

function CoveragePanel({
  decision,
  assessment,
  onInspect,
}: {
  decision: Decision | null;
  assessment: Assessment | null;
  onInspect: (metric: Metric, element: HTMLElement) => void;
}) {
  return (
    <div className="panel">
      <h2>Current coverage</h2>
      {decision ? (
        decision.factors.map((f) => (
          <div
            className="metric"
            data-state={
              f.passed === null ? "review" : f.passed ? "pass" : "fail"
            }
            key={f.name}
          >
            <span>
              {assessment ? (
                <button
                  type="button"
                  className="traceLink"
                  onClick={(event) => {
                    const metric =
                      assessment.current_facts[
                        (f.name === "uca_positive"
                          ? "uca_cash_flow"
                          : f.name) as keyof Assessment["current_facts"]
                      ];
                    if (metric) onInspect(metric, event.currentTarget);
                  }}
                >
                  {labels[f.name] ?? f.name}
                </button>
              ) : (
                (labels[f.name] ?? f.name)
              )}
            </span>
            <strong>{factorValueText(f)}</strong>
            <small>
              {f.name === "uca_positive" && isDecimal(f.threshold)
                ? `Must exceed ${moneyText(f.threshold)}`
                : `Policy: ${f.comparison_operator ?? "comparison unavailable"} ${isDecimal(f.threshold) ? formatMultiple(f.threshold) : String(f.threshold)}`}{" "}
              ·{" "}
              {f.passed === null
                ? "Review required"
                : f.passed
                  ? "Pass"
                  : "Below policy"}
              {f.decline_threshold !== null &&
                ` · decline below ${formatMultiple(f.decline_threshold)}`}
            </small>
          </div>
        ))
      ) : (
        <p>No current results. Resolve the selected input and retry.</p>
      )}
      {assessment && (
        <details>
          <summary>Inspect current calculated facts</summary>
          {(
            [
              "proposed_monthly_payment",
              "proposed_annual_payment",
              "debt_service",
              "fixed_charge_service",
              "global_cash_flow",
              "global_debt_service",
              "uca_cash_flow",
            ] as const
          ).map((key) => (
            <button
              type="button"
              className="traceFact"
              key={key}
              onClick={(event) =>
                onInspect(assessment.current_facts[key], event.currentTarget)
              }
            >
              {factLabels[key]}
            </button>
          ))}
        </details>
      )}
    </div>
  );
}
