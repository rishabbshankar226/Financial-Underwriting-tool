import { isDecimal } from "./decimal";
import { annualFields, metric, type AnnualField, type Metric, type Period } from "./contracts";

/** Display contract for `commercial-analysis-v1`: views derived from one assessment, never a decision. The
 * guard checks structure, versions and identity; it recomputes nothing. */
export type CoverageName = "dscr" | "fccr" | "global_dscr";
export type Outcome = "approve" | "review" | "decline";
export type FactorStatus = "meets_approval" | "review_band" | "below_decline_floor" | "not_applicable";
export type AnalysisLine = AnnualField | "gross_profit" | "ordinary_business_income" | "ebitda";
export type LineMetrics = Record<AnalysisLine, Metric>;
export type PeriodAnalysis = Period & {
  period_index: number;
  common_size: LineMetrics;
  prior_period: Period | null;
  prior_period_adjacent: boolean | null;
  change_vs_prior: LineMetrics | null;
};
export type CapacityConstraint = { constraint: CoverageName; approval_minimum: string; max_annual_payment: Metric };
export type DebtCapacity = {
  basis: "latest_period_current_pro_forma";
  constraints: CapacityConstraint[];
  binding_constraint: CoverageName;
  max_annual_payment: Metric;
  max_monthly_payment: Metric;
  max_principal: Metric;
  requested_principal: Metric;
  principal_headroom: Metric;
  has_capacity: boolean;
};
export type CoverageBreakeven = {
  constraint: CoverageName;
  threshold_kind: "approval_minimum" | "decline_floor";
  threshold: string;
  ebitda_breakeven: Metric;
  ebitda_cushion: Metric;
  revenue_cushion: Metric;
};
export type Breakevens = {
  ownership_weight: Metric;
  rows: CoverageBreakeven[];
  binding_approval_constraint: CoverageName | null;
  binding_decline_constraint: CoverageName | null;
};
export type AmortizationYear = { loan_year: number; months: number; payments: string; interest: string; principal: string; ending_balance: string };
export type AmortizationMonth = { month: number; payment: string; interest: string; principal: string; ending_balance: string };
export type PaymentReconciliation = {
  annuity_monthly_payment: string;
  scheduled_monthly_payment: string;
  monthly_rounding_difference: string;
  coverage_annual_payment: string;
  first_loan_year_payments: string;
  first_loan_year_difference: string;
  explanation: string;
};
export type AmortizationSchedule = {
  status: "available" | "not_applicable";
  explanation: string | null;
  schedule_principal: string | null;
  principal_rounding_difference: string | null;
  scheduled_payment: string | null;
  final_payment: string | null;
  final_payment_adjustment: string | null;
  total_payments: string | null;
  total_interest: string | null;
  total_principal: string | null;
  payment_count: number | null;
  early_payoff: boolean | null;
  annual_rows: AmortizationYear[];
  monthly_rows: AmortizationMonth[];
  monthly_rows_truncated: boolean;
  reconciliation: PaymentReconciliation | null;
};
export type SensitivityCell = {
  revenue_change: string;
  proposed_rate_change_bps: string;
  status: "available" | "not_applicable";
  explanation: string | null;
  resulting_annual_rate: string | null;
  dscr: Metric;
  fccr: Metric;
  global_dscr: Metric;
  outcome: Outcome | null;
};
export type SensitivityGrid = {
  status: "available" | "not_applicable";
  explanation: string | null;
  scenario_definition_version: "commercial-scenario-definition-v2";
  coverage_basis: "stressed_latest_period_current_pro_forma";
  definition_ids: string[];
  revenue_changes: string[];
  rate_changes_bps: string[];
  cells: SensitivityCell[];
  held_fixed_assumptions: string[];
};
export type FactorExplanation = {
  name: string;
  label: string;
  status: FactorStatus;
  summary: string;
  comparison_operator: string | null;
  value: string | boolean;
  raw_value: string | boolean | null;
  threshold: string | boolean | null;
  decline_threshold: string | null;
  approval_cushion: Metric;
  decline_cushion: Metric;
  weight: string;
  score_contribution: string;
  blocks_approval: boolean;
  triggers_decline: boolean;
};
export type ConditionId = "coverage_meets_approval" | "uca_meets_approval" | "k1_history_stable" | "coverage_below_decline_floor";
export type MatchedRule = "approve_all_conditions" | "review_k1_history" | "decline_coverage_floor" | "review_otherwise";
export type DecisionExplanation = {
  outcome: Outcome;
  matched_rule: MatchedRule;
  headline: string;
  conditions: { condition_id: ConditionId; description: string; satisfied: boolean }[];
  rules: string[];
  factors: FactorExplanation[];
  score: { passed_weight: string; total_weight: string; raw_score: string; reported_score: string; note: string };
};
export type AnalysisBaseline = { case_id: string; revision: number; run_id: string; input_hash: string; payload_hash: string };
export type CommercialAnalysis = {
  schema_version: "commercial-analysis-v1";
  definition_version: "commercial-analysis-definition-v1";
  serialization_version: "analysis-json-v1";
  calculation_version: string;
  persisted: false;
  source: "stateless_request" | "saved_revision";
  assessment_fingerprint: { algorithm: "sha256"; value: string; content: string };
  policy_version: string;
  baseline: AnalysisBaseline | null;
  selected_period: Period;
  assumptions_as_of: string;
  periods: PeriodAnalysis[];
  debt_capacity: DebtCapacity;
  breakevens: Breakevens;
  amortization: AmortizationSchedule;
  sensitivity: SensitivityGrid;
  explanation: DecisionExplanation;
  calculation_trace: (Metric & { definition_id: string; expression: string; operands: unknown[] })[];
  disclaimer: string;
};

/** `unsupported`: a version this build does not read; `mismatch`: the analysis belongs to another
 * assessment; `invalid`: anything else outside the contract. */
export class AnalysisContractError extends Error {
  constructor(
    message: string,
    readonly kind: "unsupported" | "mismatch" | "invalid",
  ) {
    super(message);
    this.name = "AnalysisContractError";
  }
}

type Obj = Record<string, unknown>;
export const coverageNames: readonly CoverageName[] = ["dscr", "fccr", "global_dscr"];
const lines: readonly AnalysisLine[] = [...annualFields, "gross_profit", "ordinary_business_income", "ebitda"];
const outcomes: readonly string[] = ["approve", "review", "decline"];
const statuses: readonly string[] = ["meets_approval", "review_band", "below_decline_floor", "not_applicable"];
const conditionIds: readonly string[] = ["coverage_meets_approval", "uca_meets_approval", "k1_history_stable", "coverage_below_decline_floor"];
const rules: readonly string[] = ["approve_all_conditions", "review_k1_history", "decline_coverage_floor", "review_otherwise"];
const factorNames: readonly string[] = ["dscr", "fccr", "global_dscr", "k1_history", "uca_positive"];

function fail(kind: AnalysisContractError["kind"], path: string): never {
  throw new AnalysisContractError(`Analysis outside the display contract: ${path}`, kind);
}
function ensure(ok: unknown, path: string): asserts ok {
  if (!ok) fail("invalid", path);
}
function object(value: unknown, path: string): Obj {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value), path);
  return value as Obj;
}
function list(value: unknown, path: string, min = 0, max = Infinity): unknown[] {
  ensure(Array.isArray(value) && value.length >= min && value.length <= max, path);
  return value as unknown[];
}
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const decimal = (value: unknown): value is string => typeof value === "string" && isDecimal(value);
const optionalDecimal = (value: unknown) => value === null || decimal(value);
const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const samePeriod = (a: Obj, b: Partial<Period>) => a.period_start === b.period_start && a.period_end === b.period_end;

export function guardAnalysis(value: unknown, expected: { fingerprint: string; years: Partial<Period>[] }): CommercialAnalysis {
  const a = object(value, "analysis");
  if (
    a.schema_version !== "commercial-analysis-v1" ||
    a.definition_version !== "commercial-analysis-definition-v1" ||
    a.serialization_version !== "analysis-json-v1"
  )
    fail("unsupported", "versions");
  const fingerprint = object(a.assessment_fingerprint, "fingerprint");
  if (fingerprint.value !== expected.fingerprint) fail("mismatch", "assessment fingerprint");
  const periods = list(a.periods, "periods", 1, 10);
  if (
    periods.length !== expected.years.length ||
    periods.some((p, i) => !samePeriod(object(p, "period"), expected.years[i]) || object(p, "period").period_index !== i) ||
    !samePeriod(object(a.selected_period, "selected period"), expected.years[expected.years.length - 1])
  )
    fail("mismatch", "periods");

  ensure(
    fingerprint.algorithm === "sha256" && typeof fingerprint.content === "string" &&
      text(a.calculation_version) && a.persisted === false && text(a.policy_version) &&
      date(a.assumptions_as_of) && text(a.disclaimer),
    "identity",
  );
  ensure(
    a.source === "stateless_request" ? a.baseline === null : a.source === "saved_revision" && baseline(a.baseline),
    "source and baseline",
  );

  // Every metric is checked as a Metric, at its own fact ID; traced ones must match their trace row.
  const placed: Metric[] = [];
  const place = (value: unknown, factId: string, traced = true): Metric => {
    let m: Metric;
    try {
      m = metric(value);
    } catch {
      fail("invalid", factId);
    }
    ensure(m.fact_id === factId, factId);
    if (traced) placed.push(m);
    return m;
  };
  const lineMetrics = (value: unknown, prefix: string) => {
    const o = object(value, prefix);
    ensure(Object.keys(o).length === lines.length, prefix);
    for (const line of lines) place(o[line], `${prefix}.${line}`);
  };
  periods.forEach((value, i) => {
    const p = object(value, "period");
    lineMetrics(p.common_size, `analysis.periods.${i}.common_size`);
    if (p.prior_period === null) ensure(p.prior_period_adjacent === null && p.change_vs_prior === null, "first period");
    else {
      const prior = object(p.prior_period, "prior period");
      ensure(i > 0 && samePeriod(prior, expected.years[i - 1]) && typeof p.prior_period_adjacent === "boolean", "prior period");
      lineMetrics(p.change_vs_prior, `analysis.periods.${i}.change_vs_prior`);
    }
  });

  const capacity = object(a.debt_capacity, "debt capacity");
  const constraints = list(capacity.constraints, "constraints", 3, 3).map((value) => object(value, "constraint"));
  ensure(
    capacity.basis === "latest_period_current_pro_forma" &&
      coverageNames.every((name) => constraints.filter((c) => c.constraint === name).length === 1) &&
      coverageNames.includes(capacity.binding_constraint as CoverageName) &&
      typeof capacity.has_capacity === "boolean",
    "debt capacity",
  );
  for (const c of constraints) {
    ensure(decimal(c.approval_minimum), "approval minimum");
    place(c.max_annual_payment, `analysis.debt_capacity.${String(c.constraint)}.max_annual_payment`);
  }
  for (const key of ["max_annual_payment", "max_monthly_payment", "max_principal", "requested_principal", "principal_headroom"])
    place(capacity[key], `analysis.debt_capacity.${key}`);

  const breakevens = object(a.breakevens, "breakevens");
  place(breakevens.ownership_weight, "analysis.breakevens.ownership_weight");
  const rows = list(breakevens.rows, "breakeven rows", 6, 6).map((value) => object(value, "breakeven"));
  for (const name of coverageNames)
    for (const kind of ["approval_minimum", "decline_floor"])
      ensure(rows.filter((r) => r.constraint === name && r.threshold_kind === kind).length === 1, "breakeven rows");
  for (const r of rows) {
    ensure(decimal(r.threshold), "breakeven threshold");
    for (const key of ["ebitda_breakeven", "ebitda_cushion", "revenue_cushion"])
      place(r[key], `analysis.breakevens.${String(r.constraint)}.${String(r.threshold_kind)}.${key}`);
  }
  for (const key of ["binding_approval_constraint", "binding_decline_constraint"])
    ensure(breakevens[key] === null || coverageNames.includes(breakevens[key] as CoverageName), key);

  schedule(object(a.amortization, "amortization"));
  grid(object(a.sensitivity, "sensitivity"), place);

  const explanation = object(a.explanation, "explanation");
  ensure(
    outcomes.includes(explanation.outcome as string) && rules.includes(explanation.matched_rule as string) &&
      text(explanation.headline) && list(explanation.rules, "rules", 1).every(text),
    "explanation",
  );
  const conditions = list(explanation.conditions, "conditions", 4, 4).map((value) => object(value, "condition"));
  ensure(
    conditionIds.every((id) => conditions.filter((c) => c.condition_id === id).length === 1) &&
      conditions.every((c) => text(c.description) && typeof c.satisfied === "boolean"),
    "conditions",
  );
  const factors = list(explanation.factors, "factors", 5, 5).map((value) => object(value, "factor"));
  ensure(factorNames.every((name) => factors.filter((f) => f.name === name).length === 1), "factor names");
  for (const f of factors) {
    ensure(
      text(f.label) && statuses.includes(f.status as string) && text(f.summary) &&
        (f.comparison_operator === null || typeof f.comparison_operator === "string") &&
        (typeof f.value === "string" || typeof f.value === "boolean") &&
        [f.raw_value, f.threshold].every((v) => v === null || typeof v === "string" || typeof v === "boolean") &&
        optionalDecimal(f.decline_threshold) && decimal(f.weight) && decimal(f.score_contribution) &&
        typeof f.blocks_approval === "boolean" && typeof f.triggers_decline === "boolean",
      "factor",
    );
    place(f.approval_cushion, `analysis.explanation.${String(f.name)}.approval_cushion`);
    place(f.decline_cushion, `analysis.explanation.${String(f.name)}.decline_cushion`);
  }
  const score = object(explanation.score, "score");
  ensure(
    ["passed_weight", "total_weight", "raw_score", "reported_score"].every((key) => decimal(score[key])) && text(score.note),
    "score",
  );

  const trace = new Map<string, Metric>();
  for (const value of list(a.calculation_trace, "trace", 1)) {
    const row = object(value, "trace row");
    let m: Metric;
    try {
      m = metric(row);
    } catch {
      fail("invalid", "trace row");
    }
    ensure(
      m.fact_id.startsWith("analysis.") && !trace.has(m.fact_id) && text(row.definition_id) && text(row.expression) &&
        list(row.operands, "operands").every((operand) => {
          const o = object(operand, "operand");
          return ["input", "fact", "policy"].includes(o.reference_type as string) && text(o.reference) && text(o.unit);
        }),
      "trace row",
    );
    trace.set(m.fact_id, m);
  }
  for (const m of placed) {
    const row = trace.get(m.fact_id);
    if (m.status === "available") ensure(row, `trace for ${m.fact_id}`);
    if (row)
      ensure(
        row.raw_value === m.raw_value && row.reported_value === m.reported_value && row.status === m.status && row.unit === m.unit,
        `trace for ${m.fact_id}`,
      );
  }
  return a as CommercialAnalysis;
}

function baseline(value: unknown): boolean {
  const b = object(value, "baseline");
  return text(b.case_id) && Number.isSafeInteger(b.revision) && (b.revision as number) >= 1 &&
    text(b.run_id) && text(b.input_hash) && text(b.payload_hash);
}

function schedule(s: Obj): void {
  const amounts = ["schedule_principal", "principal_rounding_difference", "scheduled_payment", "final_payment",
    "final_payment_adjustment", "total_payments", "total_interest", "total_principal"];
  const annual = list(s.annual_rows, "annual rows", 0, 1000), monthly = list(s.monthly_rows, "monthly rows", 0, 360);
  ensure(typeof s.monthly_rows_truncated === "boolean", "schedule truncation");
  if (s.status === "not_applicable") {
    ensure(
      text(s.explanation) && amounts.every((key) => s[key] === null) && s.payment_count === null &&
        s.early_payoff === null && s.reconciliation === null && !annual.length && !monthly.length,
      "unavailable schedule",
    );
    return;
  }
  ensure(
    s.status === "available" && amounts.every((key) => decimal(s[key])) && Number.isSafeInteger(s.payment_count) &&
      typeof s.early_payoff === "boolean" && annual.length > 0 && monthly.length > 0,
    "available schedule",
  );
  for (const value of annual) {
    const row = object(value, "annual row");
    ensure(Number.isSafeInteger(row.loan_year) && Number.isSafeInteger(row.months) &&
      ["payments", "interest", "principal", "ending_balance"].every((key) => decimal(row[key])), "annual row");
  }
  for (const value of monthly) {
    const row = object(value, "monthly row");
    ensure(Number.isSafeInteger(row.month) &&
      ["payment", "interest", "principal", "ending_balance"].every((key) => decimal(row[key])), "monthly row");
  }
  const r = object(s.reconciliation, "reconciliation");
  ensure(["annuity_monthly_payment", "scheduled_monthly_payment", "monthly_rounding_difference", "coverage_annual_payment",
    "first_loan_year_payments", "first_loan_year_difference"].every((key) => decimal(r[key])) && text(r.explanation), "reconciliation");
}

function grid(g: Obj, place: (value: unknown, factId: string, traced?: boolean) => Metric): void {
  const revenue = list(g.revenue_changes, "revenue changes"), rates = list(g.rate_changes_bps, "rate changes");
  const cells = list(g.cells, "cells", 0, 20);
  ensure(
    (g.status === "available" || g.status === "not_applicable") &&
      g.scenario_definition_version === "commercial-scenario-definition-v2" &&
      g.coverage_basis === "stressed_latest_period_current_pro_forma" &&
      list(g.definition_ids, "definition ids").every(text) && list(g.held_fixed_assumptions, "held fixed").every(text) &&
      revenue.every(decimal) && rates.every(decimal) &&
      (g.status === "available" ? g.explanation === null && cells.length === revenue.length * rates.length : text(g.explanation) && !cells.length),
    "sensitivity grid",
  );
  cells.forEach((value, index) => {
    const cell = object(value, "cell");
    const row = Math.floor(index / rates.length), column = index % rates.length;
    ensure(
      cell.revenue_change === revenue[row] && cell.proposed_rate_change_bps === rates[column] &&
        (cell.status === "available"
          ? cell.explanation === null && decimal(cell.resulting_annual_rate) && outcomes.includes(cell.outcome as string)
          : cell.status === "not_applicable" && text(cell.explanation) && cell.outcome === null && optionalDecimal(cell.resulting_annual_rate)),
      "sensitivity cell",
    );
    // Cells carry no per-cell trace, so they are checked as metrics only.
    for (const key of ["dscr", "fccr", "global_dscr"]) place(cell[key], `analysis.sensitivity.${row}.${column}.${key}`, false);
  });
}
