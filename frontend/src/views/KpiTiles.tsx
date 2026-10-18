import type { CommercialAnalysis, DebtCapacity, FactorStatus } from "../analysisContracts";
import type { Assessment, Factor, Metric } from "../contracts";
import { formatMultiple } from "../decimal";
import { compareDecimal, isDecimal } from "../decimal";
import { metricValueText, moneyMagnitudeText, moneyText, multipleText, ratioPercentText, signedMetricText } from "../format";
import { useAnalysis } from "../useAnalysis";

export const factorStatusText: Record<FactorStatus, string> = {
  meets_approval: "Meets approval",
  review_band: "Review band",
  below_decline_floor: "Below decline floor",
  not_applicable: "Not applicable",
};
/** EBITDA against the binding constraint's breakeven, worded from that constraint's server status. */
const breakevenText: Record<FactorStatus, string> = {
  meets_approval: "Above approval breakeven",
  review_band: "Below approval breakeven",
  below_decline_floor: "Below decline breakeven",
  not_applicable: "Not applicable",
};
const tileState: Record<FactorStatus, string> = {
  meets_approval: "pass",
  review_band: "review",
  below_decline_floor: "fail",
  not_applicable: "na",
};
export const constraintLabels = { dscr: "DSCR", fccr: "FCCR", global_dscr: "global DSCR" } as const;

/** Whether the requested principal fits: the sign of the server's headroom decides it. `has_capacity` only
 * says the binding minimum leaves some room for new payments at all. */
export type CapacityFit = "fits" | "over" | "none";
export function capacityFit(capacity: DebtCapacity): CapacityFit {
  if (!capacity.has_capacity) return "none";
  const headroom = capacity.principal_headroom.raw_value;
  return isDecimal(headroom) && compareDecimal(headroom, "0") >= 0 ? "fits" : "over";
}
const capacityStatus: Record<CapacityFit, string> = {
  fits: "Within capacity",
  over: "Over capacity",
  none: "No capacity",
};

/** The server's factor status; before the analysis arrives, the decision's own pass and floor flags. */
function factorStatus(name: string, assessment: Assessment, analysis: CommercialAnalysis | null): FactorStatus {
  const explained = analysis?.explanation.factors.find((f) => f.name === name);
  if (explained) return explained.status;
  const factor = assessment.decision.factors.find((f) => f.name === name) as Factor;
  return factor.passed === null ? "not_applicable" : factor.passed ? "meets_approval" : factor.decline_triggered ? "below_decline_floor" : "review_band";
}

type Tile = { label: string; value: string; state: string; status: string | null; lines: string[]; cushion: string };

function cushionFor(analysis: CommercialAnalysis | null, name: string, kind: "multiple" | "money", pending: string): string {
  const factor = analysis?.explanation.factors.find((f) => f.name === name);
  if (!factor) return pending;
  // The approval cushion is the value minus the approval minimum; negative means the minimum is missed.
  return factor.approval_cushion.status === "available" ? `Cushion ${signedMetricText(factor.approval_cushion, kind)}` : "No cushion: not applicable";
}

function ratioTile(label: string, name: "dscr" | "fccr" | "global_dscr", metric: Metric, minimum: string, floor: string,
  assessment: Assessment, analysis: CommercialAnalysis | null, pending: string): Tile {
  const status = factorStatus(name, assessment, analysis);
  return {
    label,
    value: metric.status === "available" && isDecimal(metric.raw_value) ? multipleText(metric.raw_value, [minimum, floor]) : "Not applicable",
    state: tileState[status],
    status: factorStatusText[status],
    lines: [`Minimum ${formatMultiple(minimum)}, decline below ${formatMultiple(floor)}`],
    cushion: cushionFor(analysis, name, "multiple", pending),
  };
}

/** Coverage and cash-flow figures for the latest period, each with its policy line, status and cushion. */
export function KpiTiles({ assessment }: { assessment: Assessment }) {
  const { state } = useAnalysis();
  const analysis = state.status === "ready" ? state.analysis : null;
  const pending = state.status === "error" ? "Cushion unavailable" : "Cushion pending";
  const facts = assessment.current_facts,
    policy = assessment.policy_snapshot;
  const uca = factorStatus("uca_positive", assessment, analysis);
  const capacity = analysis?.debt_capacity;
  const fit = capacity ? capacityFit(capacity) : null;
  const binding = analysis?.breakevens.binding_approval_constraint;
  const breakeven = binding ? analysis?.breakevens.rows.find((r) => r.constraint === binding && r.threshold_kind === "approval_minimum") : undefined;
  const bindingStatus = binding ? factorStatus(binding, assessment, analysis) : null;
  const tiles: Tile[] = [
    ratioTile("Business DSCR", "dscr", facts.dscr, policy.commercial_min_dscr, policy.commercial_decline_dscr, assessment, analysis, pending),
    ratioTile("Global DSCR", "global_dscr", facts.global_dscr, policy.commercial_min_global_dscr, policy.commercial_decline_global_dscr, assessment, analysis, pending),
    ratioTile("FCCR", "fccr", facts.fccr, policy.commercial_min_fccr, policy.commercial_decline_fccr, assessment, analysis, pending),
    {
      label: "UCA cash flow",
      value: metricValueText(facts.uca_cash_flow, "money"),
      state: tileState[uca],
      status: factorStatusText[uca],
      lines: [`Must exceed ${moneyText(policy.commercial_min_uca_cash_flow)}`],
      cushion: cushionFor(analysis, "uca_positive", "money", pending),
    },
    {
      label: "EBITDA",
      value: metricValueText(facts.ebitda, "money"),
      state: bindingStatus ? tileState[bindingStatus] : "info",
      status: bindingStatus ? breakevenText[bindingStatus] : null,
      lines: [
        `Year ended ${assessment.selected_period.period_end}`,
        ...(breakeven && binding ? [`Approval breakeven ${metricValueText(breakeven.ebitda_breakeven, "money")} (${constraintLabels[binding]})`] : []),
      ],
      cushion:
        breakeven?.ebitda_cushion.status === "available"
          ? `Cushion ${ratioPercentText(breakeven.ebitda_cushion)} of EBITDA`
          : analysis
            ? "No cushion: not applicable"
            : pending,
    },
    {
      label: "Annual debt service",
      value: metricValueText(facts.debt_service, "money"),
      state: fit ? (fit === "fits" ? "pass" : "fail") : "info",
      status: fit ? capacityStatus[fit] : null,
      lines: [
        `Includes proposed ${metricValueText(facts.proposed_annual_payment, "money")} a year`,
        ...(capacity ? [`New payments up to ${metricValueText(capacity.max_annual_payment, "money")} a year (${constraintLabels[capacity.binding_constraint]})`] : []),
      ],
      cushion: capacity
        ? fit === "fits"
          ? `Principal headroom ${metricValueText(capacity.principal_headroom, "money")}`
          : `Principal shortfall ${moneyMagnitudeText(capacity.principal_headroom.raw_value ?? "0")}`
        : pending,
    },
  ];
  return (
    <section className="kpiTiles" aria-label="Assessment overview">
      {tiles.map((tile) => (
        <div className="kpiTile" data-state={tile.state} key={tile.label}>
          <span className="kpiLabel">{tile.label}</span>
          <strong>{tile.value}</strong>
          {tile.status && <span className="kpiStatus">{tile.status}</span>}
          {tile.lines.map((line) => (
            <small key={line}>{line}</small>
          ))}
          <small className="kpiCushion">{tile.cushion}</small>
        </div>
      ))}
    </section>
  );
}
