import type { Factor } from "./contracts";
import { compareDecimal, isDecimal } from "./decimal";

type Obj = Record<string, unknown>;
function ensure(value: unknown, label: string): asserts value {
  if (!value)
    throw new Error(
      `The ${label} response is incomplete or unsupported. It was not used.`,
    );
}
function object(value: unknown, label: string): Obj {
  ensure(value && typeof value === "object" && !Array.isArray(value), label);
  return value as Obj;
}
function keys(value: Obj, expected: string[], label: string) {
  ensure(
    Object.keys(value).length === expected.length &&
      expected.every((key) => Object.prototype.hasOwnProperty.call(value, key)),
    label,
  );
}
const text = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 20000;
const decimal = (value: unknown): value is string =>
  typeof value === "string" && isDecimal(value);
const scalar = (value: unknown) => typeof value === "boolean" || text(value);
const date = (value: unknown) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

export type ConsumerDecision = {
  vertical: "consumer";
  outcome: "approve" | "review" | "decline";
  score: string;
  factors: Factor[];
  reasons: {
    code: string;
    factor: string;
    message: string;
    value: string | boolean;
  }[];
  policy_version: string;
  disclaimer: string;
};
export function guardConsumerDecision(value: unknown): ConsumerDecision {
  const result = object(value, "consumer");
  keys(
    result,
    [
      "vertical",
      "outcome",
      "score",
      "factors",
      "reasons",
      "policy_version",
      "disclaimer",
    ],
    "consumer",
  );
  ensure(
    result.vertical === "consumer" &&
      ["approve", "review", "decline"].includes(String(result.outcome)) &&
      decimal(result.score) &&
      compareDecimal(result.score, "0") >= 0 &&
      compareDecimal(result.score, "1") <= 0 &&
      text(result.policy_version) &&
      text(result.disclaimer),
    "consumer",
  );
  const names = [
    "back_end_dti",
    "atr_documentation",
    "synthetic_credit_score",
    "back_end_dti_review",
  ];
  ensure(
    Array.isArray(result.factors) && result.factors.length === 4,
    "consumer factors",
  );
  const seen = new Set<string>();
  for (const raw of result.factors) {
    const factor = object(raw, "consumer factor");
    keys(
      factor,
      [
        "name",
        "value",
        "raw_value",
        "weight",
        "threshold",
        "passed",
        "source",
        "comparison_operator",
        "decline_threshold",
        "decline_triggered",
      ],
      "consumer factor",
    );
    ensure(
      typeof factor.name === "string" &&
        names.includes(factor.name) &&
        !seen.has(factor.name) &&
        scalar(factor.value) &&
        (factor.raw_value === null || scalar(factor.raw_value)) &&
        decimal(factor.weight) &&
        (factor.threshold === null || scalar(factor.threshold)) &&
        (factor.passed === null || typeof factor.passed === "boolean") &&
        text(factor.source) &&
        [null, ">=", ">", "<", "=="].includes(
          factor.comparison_operator as string | null,
        ) &&
        (factor.decline_threshold === null ||
          decimal(factor.decline_threshold)) &&
        (factor.decline_triggered === null ||
          typeof factor.decline_triggered === "boolean"),
      "consumer factor",
    );
    if (factor.name === "back_end_dti" || factor.name === "back_end_dti_review")
      ensure(
        decimal(factor.raw_value) &&
          decimal(factor.value) &&
          decimal(factor.threshold),
        "consumer DTI",
      );
    if (factor.name === "atr_documentation")
      ensure(
        typeof factor.value === "boolean" &&
          typeof factor.raw_value === "boolean" &&
          typeof factor.threshold === "boolean",
        "consumer documentation",
      );
    seen.add(factor.name);
  }
  ensure(
    Array.isArray(result.reasons) && result.reasons.length <= 20,
    "consumer reasons",
  );
  for (const raw of result.reasons) {
    const reason = object(raw, "consumer reason");
    keys(reason, ["code", "factor", "message", "value"], "consumer reason");
    ensure(
      text(reason.code) &&
        typeof reason.factor === "string" &&
        seen.has(reason.factor) &&
        text(reason.message) &&
        scalar(reason.value),
      "consumer reason",
    );
  }
  return result as unknown as ConsumerDecision;
}

export type SbaResult = {
  schema_version: "sba-screen-result-v2";
  borrower: string;
  assessment_as_of: string;
  sop_version: "8" | "8.1";
  size_eligible: boolean;
  size_reason: string;
  size_evidence: {
    basis: string;
    period_start: string;
    period_end: string;
    affiliates: string;
    source_reference: string;
  };
  size_standard_source: {
    effective_date: string;
    verified_through: string | null;
    url: string | null;
    sha256: string | null;
    row: number | null;
    synthetic_test_only: boolean;
  };
  policy_version: string;
  credit_elsewhere: {
    applied: boolean;
    passes: null;
    reason: string;
    excess_liquid_resources: string | null;
    resource_indicator_below_requested: boolean | null;
  };
  global_dscr: string;
  configured_global_dscr_floor: string;
  coverage_pass: boolean;
  outcome: "review_required" | "screen_failed";
  eligibility_status: "incomplete";
  unresolved_requirements: string[];
  disclaimer: string;
};
export function guardSbaResult(value: unknown): SbaResult {
  const result = object(value, "SBA");
  keys(
    result,
    [
      "schema_version",
      "borrower",
      "assessment_as_of",
      "sop_version",
      "size_eligible",
      "size_reason",
      "size_evidence",
      "size_standard_source",
      "policy_version",
      "credit_elsewhere",
      "global_dscr",
      "configured_global_dscr_floor",
      "coverage_pass",
      "outcome",
      "eligibility_status",
      "unresolved_requirements",
      "disclaimer",
    ],
    "SBA",
  );
  ensure(
    result.schema_version === "sba-screen-result-v2" &&
      text(result.borrower) &&
      date(result.assessment_as_of) &&
      ["8", "8.1"].includes(String(result.sop_version)) &&
      typeof result.size_eligible === "boolean" &&
      text(result.size_reason) &&
      text(result.policy_version) &&
      decimal(result.global_dscr) &&
      decimal(result.configured_global_dscr_floor) &&
      typeof result.coverage_pass === "boolean" &&
      ["review_required", "screen_failed"].includes(String(result.outcome)) &&
      result.eligibility_status === "incomplete" &&
      text(result.disclaimer),
    "SBA",
  );
  const evidence = object(result.size_evidence, "SBA evidence");
  keys(
    evidence,
    ["basis", "period_start", "period_end", "affiliates", "source_reference"],
    "SBA evidence",
  );
  ensure(
    [
      "receipts_three_completed_fiscal_year_average",
      "receipts_five_completed_fiscal_year_average",
      "employees_24_month_pay_period_average_ceiling",
    ].includes(String(evidence.basis)) &&
      date(evidence.period_start) &&
      date(evidence.period_end) &&
      ["included", "none"].includes(String(evidence.affiliates)) &&
      text(evidence.source_reference),
    "SBA evidence",
  );
  const source = object(result.size_standard_source, "SBA source");
  keys(
    source,
    [
      "effective_date",
      "verified_through",
      "url",
      "sha256",
      "row",
      "synthetic_test_only",
    ],
    "SBA source",
  );
  ensure(
    date(source.effective_date) &&
      (source.verified_through === null || date(source.verified_through)) &&
      (source.url === null || text(source.url)) &&
      (source.sha256 === null ||
        (typeof source.sha256 === "string" &&
          /^[a-f0-9]{64}$/.test(source.sha256))) &&
      (source.row === null ||
        (typeof source.row === "number" &&
          Number.isSafeInteger(source.row) &&
          source.row >= 1)) &&
      typeof source.synthetic_test_only === "boolean",
    "SBA source",
  );
  const credit = object(result.credit_elsewhere, "SBA credit elsewhere");
  keys(
    credit,
    [
      "applied",
      "passes",
      "reason",
      "excess_liquid_resources",
      "resource_indicator_below_requested",
    ],
    "SBA credit elsewhere",
  );
  ensure(
    typeof credit.applied === "boolean" &&
      credit.passes === null &&
      text(credit.reason) &&
      (credit.excess_liquid_resources === null ||
        decimal(credit.excess_liquid_resources)) &&
      (credit.resource_indicator_below_requested === null ||
        typeof credit.resource_indicator_below_requested === "boolean"),
    "SBA credit elsewhere",
  );
  const unresolved = [
    "lender_credit_elsewhere_determination",
    "industry_selection_and_affiliation_review",
    "alternative_size_standards_and_program_eligibility",
    "approved_lender_credit_policy",
  ];
  ensure(
    Array.isArray(result.unresolved_requirements) &&
      result.unresolved_requirements.length > 0 &&
      result.unresolved_requirements.every(
        (item) => typeof item === "string" && unresolved.includes(item),
      ) &&
      new Set(result.unresolved_requirements).size ===
        result.unresolved_requirements.length,
    "SBA unresolved requirements",
  );
  return result as unknown as SbaResult;
}
