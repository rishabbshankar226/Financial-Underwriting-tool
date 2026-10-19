import { useId, type ReactNode } from "react";
import type { CommercialAnalysis, MatchedRule } from "../analysisContracts";
import type { Assessment, Metric } from "../contracts";
import { formatMultiple } from "../decimal";
import { periodLabel } from "../fieldCatalog";
import { fieldValueText, metricValueText, moneyMagnitudeText, moneyText, ratioPercentText, signedMetricText, WITH_CENTS } from "../format";
import { useAnalysis, type AnalysisState } from "../useAnalysis";
import type { WorkspaceView } from "../workspaceSelectors";
import { capacityFit, constraintLabels, factorStatusText as statusText } from "./KpiTiles";
import { TrendChart } from "./TrendChart";

const ruleOrder: readonly MatchedRule[] = ["approve_all_conditions", "review_k1_history", "decline_coverage_floor", "review_otherwise"];
const coverageTitle = { dscr: "Business DSCR", fccr: "FCCR", global_dscr: "Global DSCR" } as const;

function Panel({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className={`panel ${className ?? ""}`} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

function AnalysisPending({ state, retry }: { state: AnalysisState; retry?: () => void }) {
  if (state.status === "error")
    return (
      <div className="analysisNotice" role="status">
        <p>{state.message}</p>
        {retry && state.kind === "failed" && (
          <button type="button" onClick={retry}>
            Retry analysis
          </button>
        )}
      </div>
    );
  return (
    <p className="analysisNotice" role="status">
      {state.status === "waiting" ? "The analysis resumes after the saved write is confirmed." : "Preparing the analysis…"}
    </p>
  );
}

function cushion(metric: Metric, kind: "multiple" | "money"): string {
  return metric.status === "available" ? signedMetricText(metric, kind) : "not applicable";
}

function Explanation({ analysis }: { analysis: CommercialAnalysis }) {
  const { explanation } = analysis;
  const rule = explanation.rules[ruleOrder.indexOf(explanation.matched_rule)];
  return (
    <>
      <p className="overviewHeadline">{explanation.headline}</p>
      {rule && <p>Rule applied: {rule}</p>}
      <h3>Outcome conditions</h3>
      <ul className="conditionList">
        {explanation.conditions.map((condition) => (
          <li key={condition.condition_id} data-satisfied={condition.satisfied}>
            <span>{condition.description}</span>
            <strong>{condition.satisfied ? "Yes" : "No"}</strong>
          </li>
        ))}
      </ul>
      <h3>Policy factors</h3>
      <ul className="factorList">
        {explanation.factors.map((factor) => {
          const kind = factor.name === "uca_positive" ? "money" : "multiple";
          return (
            <li key={factor.name} data-status={factor.status}>
              <div>
                <strong>{factor.label}</strong>
                <span className="factorStatus">{statusText[factor.status]}</span>
              </div>
              <p>{factor.summary}</p>
              {factor.name !== "k1_history" && (
                <small>
                  Approval cushion {cushion(factor.approval_cushion, kind)}
                  {factor.name !== "uca_positive" && `, decline cushion ${cushion(factor.decline_cushion, kind)}`}
                </small>
              )}
            </li>
          );
        })}
      </ul>
      <p className="fine">
        Illustrative score {explanation.score.reported_score}. {explanation.score.note}
      </p>
    </>
  );
}

function Capacity({ analysis, assessment }: { analysis: CommercialAnalysis; assessment: Assessment }) {
  const capacity = analysis.debt_capacity,
    loan = assessment.normalized_input.proposed_loan;
  const breakeven = (kind: "approval_minimum" | "decline_floor") => {
    const binding = kind === "approval_minimum" ? analysis.breakevens.binding_approval_constraint : analysis.breakevens.binding_decline_constraint;
    const row = binding && analysis.breakevens.rows.find((r) => r.constraint === binding && r.threshold_kind === kind);
    return row && binding ? { binding, row } : null;
  };
  const approval = breakeven("approval_minimum"),
    decline = breakeven("decline_floor");
  const fit = capacityFit(capacity);
  return (
    <>
      <p>
        {fit === "fits"
          ? "The requested principal fits within the illustrative coverage minimums."
          : fit === "over"
            ? "The requested principal is larger than the illustrative coverage minimums support."
            : "Existing obligations leave no room for new payments at the illustrative coverage minimums."}{" "}
        {coverageTitle[capacity.binding_constraint]} binds first.
      </p>
      <dl className="capacityFacts">
        <div>
          <dt>Binding constraint</dt>
          <dd>{coverageTitle[capacity.binding_constraint]}</dd>
        </div>
        <div>
          <dt>
            Maximum principal at {fieldValueText(loan.annual_rate, "%")} for {fieldValueText(loan.term_months, "months")}
          </dt>
          <dd>{metricValueText(capacity.max_principal, "money", WITH_CENTS)}</dd>
        </div>
        <div>
          <dt>Requested principal</dt>
          <dd>{metricValueText(capacity.requested_principal, "money", WITH_CENTS)}</dd>
        </div>
        <div>
          <dt>{fit === "fits" ? "Principal headroom" : "Principal shortfall"}</dt>
          <dd>
            {fit === "fits"
              ? metricValueText(capacity.principal_headroom, "money", WITH_CENTS)
              : moneyMagnitudeText(capacity.principal_headroom.raw_value ?? "0", WITH_CENTS)}
          </dd>
        </div>
        <div>
          <dt>Largest new payment</dt>
          <dd>
            {metricValueText(capacity.max_annual_payment, "money", WITH_CENTS)} a year ({metricValueText(capacity.max_monthly_payment, "money", WITH_CENTS)} a month)
          </dd>
        </div>
        {approval && (
          <div>
            <dt>Revenue cushion to the {constraintLabels[approval.binding]} approval minimum</dt>
            <dd>{ratioPercentText(approval.row.revenue_cushion, 2)}</dd>
          </div>
        )}
        {decline && (
          <div>
            <dt>Revenue cushion to the {constraintLabels[decline.binding]} decline floor</dt>
            <dd>{ratioPercentText(decline.row.revenue_cushion, 2)}</dd>
          </div>
        )}
      </dl>
      <h3>New annual payment allowed by each minimum</h3>
      <ul className="constraintList">
        {capacity.constraints.map((constraint) => (
          <li key={constraint.constraint} data-binding={constraint.constraint === capacity.binding_constraint}>
            <span>
              {coverageTitle[constraint.constraint]} at {formatMultiple(constraint.approval_minimum)}
              {constraint.constraint === capacity.binding_constraint && " (binding)"}
            </span>
            <strong>{metricValueText(constraint.max_annual_payment, "money", WITH_CENTS)}</strong>
          </li>
        ))}
      </ul>
      <p className="fine">Policy arithmetic at the approval minimums, holding every other input fixed. It is not a credit approval.</p>
    </>
  );
}

function Trends({ assessment }: { assessment: Assessment }) {
  const periods = assessment.historical_spread;
  const point = (index: number, value: string | null, text: string) => ({
    label: periodLabel(periods[index], index),
    short: periods[index].period_end,
    value,
    text,
  });
  return (
    <div className="trendGrid">
      <TrendChart
        title="Gross receipts"
        points={periods.map((p, i) => point(i, p.financials.gross_receipts, moneyText(p.financials.gross_receipts)))}
      />
      <TrendChart
        title="EBITDA"
        points={periods.map((p, i) => point(i, p.ebitda.status === "available" ? p.ebitda.raw_value : null, metricValueText(p.ebitda, "money")))}
      />
    </div>
  );
}

/** The decision's reasons, the loan size the policy minimums allow, and how the business has trended. */
export function OverviewView({ view }: { view: WorkspaceView }) {
  const { state, retry } = useAnalysis();
  const { assessment } = view;
  if (view.ready && view.accepted?.mode === "legacy")
    return (
      <Panel title="Overview">
        <p>Legacy decisions have policy factor results only. The explanation, debt capacity and trends need a dated assessment.</p>
      </Panel>
    );
  if (!assessment)
    return (
      <Panel title="Overview">
        <p>No current assessment is available. Resolve or choose a case to see its explanation.</p>
      </Panel>
    );
  const analysis = state.status === "ready" ? state.analysis : null;
  return (
    <div className="overviewGrid">
      <Panel title="Why this decision" className="overviewExplanation">
        {analysis ? <Explanation analysis={analysis} /> : <AnalysisPending state={state} retry={retry} />}
      </Panel>
      <Panel title="Debt capacity" className="overviewCapacity">
        {analysis ? <Capacity analysis={analysis} assessment={assessment} /> : <AnalysisPending state={state} />}
      </Panel>
      <Panel title="Trends" className="overviewTrends">
        <Trends assessment={assessment} />
      </Panel>
    </div>
  );
}
