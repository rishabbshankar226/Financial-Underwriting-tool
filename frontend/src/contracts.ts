/** Display contracts for the two existing commercial interfaces. Financial arithmetic stays in Python. */
export const annualFields = [
  "gross_receipts",
  "cogs",
  "operating_expense_excl_dna_interest_comp",
  "officer_compensation",
  "depreciation",
  "amortization",
  "interest_expense",
  "section_179",
  "k1_distribution",
] as const;
export type AnnualField = (typeof annualFields)[number];
export type Period = { period_start: string; period_end: string };
export type FinancialYear = Record<AnnualField, number> & Partial<Period>;
export type Guarantor = {
  name: string;
  ownership_percentage: number;
  wages: number;
  interest_dividend_income: number;
  mortgage_pi_annual: number;
  auto_loan_annual: number;
  credit_card_min_annual: number;
};
export type ImportedOverride = {
  field: string;
  prior_value?: unknown;
  new_value: unknown;
  rationale: string;
  source: string;
  actor: string;
  at: string;
};
export type LegacyRequest = {
  borrower_name: string;
  geography: string;
  years: FinancialYear[];
  existing_debt: { cpltd_annual: number; operating_lease_annual: number };
  proposed_loan: { amount: number; annual_rate: number; term_months: number };
  guarantors: Guarantor[];
  working_capital: {
    ar_increase: number;
    inventory_increase: number;
    ap_increase: number;
    cash_taxes_paid: number;
  };
  overrides?: ImportedOverride[];
};
export type DatedRequest = Omit<
  LegacyRequest,
  "years" | "proposed_loan" | "working_capital" | "overrides"
> & {
  schema_version: "commercial-assessment-v1";
  assessment_as_of: string;
  units: {
    currency: "USD";
    monetary_unit: "dollars";
    annual_rate_unit: "decimal_nominal";
  };
  years: (FinancialYear & Period)[];
  proposed_loan: LegacyRequest["proposed_loan"] & {
    rate_type: "fixed";
    repayment_type: "fully_amortizing";
    payment_frequency: "monthly";
  };
  working_capital: LegacyRequest["working_capital"] & Period;
};
export type Input = LegacyRequest | DatedRequest;
export type Mode = "dated" | "legacy";
export type Factor = {
  name: string;
  value: number | string | boolean;
  raw_value: number | string | boolean | null;
  weight: number;
  threshold: number | string | boolean | null;
  passed: boolean | null;
  source: string;
  comparison_operator: ">=" | ">" | "<" | "==" | null;
  decline_threshold: number | null;
  decline_triggered: boolean | null;
};
export type Decision = {
  vertical: "commercial";
  outcome: "approve" | "review" | "decline";
  score: number;
  factors: Factor[];
  reasons: {
    code: string;
    factor: string;
    message: string;
    value: number | string | boolean;
  }[];
  policy_version: string;
  disclaimer: string;
};
export type Metric = {
  fact_id: string;
  raw_value: number | string | null;
  unit: string;
  display_precision: number | null;
  status: "available" | "not_applicable";
  explanation: string | null;
};
export type Operand = {
  reference_type: "input" | "fact" | "policy";
  reference: string;
  raw_value: number | string | null;
  unit: string;
};
export type Trace = Metric & {
  definition_id: string;
  expression: string;
  operands: Operand[];
};
export const currentFactKeys = [
  "ordinary_business_income",
  "ebitda",
  "proposed_monthly_payment",
  "proposed_annual_payment",
  "debt_service",
  "fixed_charge_service",
  "global_business_ebitda",
  "global_outside_income",
  "global_personal_debt",
  "global_cash_flow",
  "global_debt_service",
  "dscr",
  "fccr",
  "global_dscr",
  "net_working_capital_increase",
  "uca_cash_flow",
  "k1_ratio_difference",
  "k1_history",
] as const;
export const policyNumbers = [
  "commercial_min_dscr",
  "commercial_min_fccr",
  "commercial_min_global_dscr",
  "commercial_decline_dscr",
  "commercial_decline_fccr",
  "commercial_decline_global_dscr",
  "commercial_min_uca_cash_flow",
  "consumer_review_dti",
  "consumer_decline_dti",
  "consumer_min_credit_score",
  "extraction_confidence_threshold",
  "k1_stability_band",
  "sba_global_dscr_floor_expansion",
  "sba_global_dscr_floor_acquisition",
] as const;
export type Policy = Record<(typeof policyNumbers)[number], number> & {
  version: string;
  consumer_required_atr_fields: string[];
  sba_sop_8_effective: string;
  sba_sop_8_1_effective: string;
};
export type Assessment = {
  schema_version: "commercial-assessment-v1";
  calculation_version: string;
  serialization_version: "assessment-json-v1";
  normalized_input: DatedRequest;
  selected_period: Period;
  assumptions_as_of: string;
  coverage_basis: "current_pro_forma";
  historical_spread: (Period & {
    financials: FinancialYear & Period;
    ordinary_business_income: Metric;
    ebitda: Metric;
    k1_distribution_ratio: Metric;
  })[];
  current_facts: Record<(typeof currentFactKeys)[number], Metric>;
  guarantor_contributions: {
    guarantor_index: number;
    name: string;
    business_ebitda: Metric;
    outside_income: Metric;
    personal_debt: Metric;
  }[];
  k1_history_periods: Period[];
  calculation_trace: Trace[];
  decision: Decision;
  policy_snapshot: Policy;
  fingerprint: {
    algorithm: "sha256";
    value: string;
    content: "normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version";
  };
  disclaimer: string;
};
export type Accepted =
  | { mode: "dated"; input: DatedRequest; result: Assessment; filename: string }
  | {
      mode: "legacy";
      input: LegacyRequest;
      result: Decision;
      filename: string;
    };

type Obj = Record<string, unknown>;
function requireValue(ok: unknown, path: string): asserts ok {
  if (!ok) throw new Error(`Incomplete or invalid assessment: ${path}`);
}
function object(x: unknown, path: string): Obj {
  requireValue(x !== null && typeof x === "object" && !Array.isArray(x), path);
  return x as Obj;
}
function array(x: unknown, path: string): unknown[] {
  requireValue(Array.isArray(x), path);
  return x;
}
function str(x: unknown): x is string {
  return typeof x === "string" && x.length > 0;
}
function num(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}
function scalar(x: unknown): boolean {
  return num(x) || typeof x === "string" || typeof x === "boolean";
}
function date(x: unknown): x is string {
  return (
    typeof x === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(x) &&
    Number.isFinite(Date.parse(x)) &&
    new Date(x).toISOString().slice(0, 10) === x
  );
}
function period(x: unknown): Period {
  const p = object(x, "period");
  requireValue(
    date(p.period_start) &&
      date(p.period_end) &&
      p.period_start <= p.period_end,
    "period dates",
  );
  return p as Period;
}
const samePeriod = (a: Period, b: Period) =>
  a.period_start === b.period_start && a.period_end === b.period_end;
export function detectMode(payload: unknown): Mode {
  const p = object(payload, "request");
  if (!("schema_version" in p)) return "legacy";
  requireValue(
    p.schema_version === "commercial-assessment-v1",
    "unsupported schema_version",
  );
  return "dated";
}

export function guardDecision(value: unknown): Decision {
  const d = object(value, "decision");
  requireValue(
    d.vertical === "commercial" &&
      ["approve", "review", "decline"].includes(String(d.outcome)) &&
      num(d.score) &&
      str(d.policy_version) &&
      str(d.disclaimer),
    "decision identity",
  );
  const factors = array(d.factors, "factors");
  requireValue(factors.length === 5, "commercial factors");
  const names = ["dscr", "fccr", "global_dscr", "uca_positive", "k1_history"];
  for (const v of factors) {
    const f = object(v, "factor");
    requireValue(
      str(f.name) &&
        names.includes(f.name) &&
        scalar(f.value) &&
        (f.raw_value === null || scalar(f.raw_value)) &&
        num(f.weight) &&
        (f.threshold === null || scalar(f.threshold)) &&
        (f.passed === null || typeof f.passed === "boolean") &&
        str(f.source) &&
        [null, ">=", ">", "<", "=="].includes(
          f.comparison_operator as string | null,
        ) &&
        (f.decline_threshold === null || num(f.decline_threshold)) &&
        (f.decline_triggered === null ||
          typeof f.decline_triggered === "boolean"),
      "factor fields",
    );
  }
  requireValue(
    new Set(factors.map((f) => object(f, "factor").name)).size === 5,
    "unique factors",
  );
  for (const v of array(d.reasons, "reasons")) {
    const r = object(v, "reason");
    requireValue(
      str(r.code) && str(r.factor) && str(r.message) && scalar(r.value),
      "reason fields",
    );
  }
  return d as Decision;
}

/** Legacy defaults/coercions are presentation normalization, after server acceptance. Never alter an imported raw body. */
export function guardLegacyInput(value: unknown): LegacyRequest {
  const p = object(value, "legacy input");
  requireValue(str(p.borrower_name) && str(p.geography), "borrower");
  const numeric = (x: unknown, fallback?: number) => {
    const v =
      x === undefined
        ? fallback
        : typeof x === "number"
          ? x
          : typeof x === "string" && x.trim()
            ? Number(x)
            : typeof x === "boolean"
              ? Number(x)
              : NaN;
    requireValue(num(v), "legacy numeric input");
    return v;
  };
  const years = array(p.years, "years").map((y) => {
    const o = object(y, "year");
    return Object.fromEntries(
      annualFields.map((k) => [
        k,
        numeric(
          o[k],
          ["section_179", "k1_distribution"].includes(k) ? 0 : undefined,
        ),
      ]),
    ) as unknown as FinancialYear;
  });
  requireValue(years.length, "years");
  const debt = object(p.existing_debt, "debt"),
    loan = object(p.proposed_loan, "loan"),
    wc = object(p.working_capital, "working capital");
  const guarantors = array(p.guarantors ?? [], "guarantors").map((v) => {
    const g = object(v, "guarantor");
    requireValue(g.name === undefined || str(g.name), "guarantor name");
    return {
      name: String(g.name ?? "Synthetic Guarantor"),
      ...Object.fromEntries(
        [
          "ownership_percentage",
          "wages",
          "interest_dividend_income",
          "mortgage_pi_annual",
          "auto_loan_annual",
          "credit_card_min_annual",
        ].map((k) => [k, numeric(g[k], k === "ownership_percentage" ? 1 : 0)]),
      ),
    } as Guarantor;
  });
  const overrides = array(p.overrides ?? [], "overrides").map((v) => {
    const a = object(v, "override");
    requireValue(
      str(a.field) &&
        str(a.rationale) &&
        str(a.source) &&
        (a.actor === undefined || str(a.actor)) &&
        (a.at === undefined || str(a.at)) &&
        "new_value" in a,
      "override fields",
    );
    return {
      ...a,
      actor: a.actor ?? "system",
      at: a.at ?? "Not supplied",
    } as ImportedOverride;
  });
  return {
    borrower_name: p.borrower_name as string,
    geography: p.geography as string,
    years,
    existing_debt: {
      cpltd_annual: numeric(debt.cpltd_annual),
      operating_lease_annual: numeric(debt.operating_lease_annual, 0),
    },
    proposed_loan: {
      amount: numeric(loan.amount),
      annual_rate: numeric(loan.annual_rate),
      term_months: numeric(loan.term_months),
    },
    guarantors,
    working_capital: Object.fromEntries(
      [
        "ar_increase",
        "inventory_increase",
        "ap_increase",
        "cash_taxes_paid",
      ].map((k) => [k, numeric(wc[k], 0)]),
    ) as LegacyRequest["working_capital"],
    overrides,
  };
}
export function guardDatedInput(value: unknown): DatedRequest {
  const p = object(value, "normalized input");
  requireValue(
    p.schema_version === "commercial-assessment-v1" &&
      date(p.assessment_as_of) &&
      str(p.borrower_name) &&
      str(p.geography),
    "dated identity",
  );
  const u = object(p.units, "units");
  requireValue(
    u.currency === "USD" &&
      u.monetary_unit === "dollars" &&
      u.annual_rate_unit === "decimal_nominal",
    "units",
  );
  const ys = array(p.years, "years");
  requireValue(ys.length >= 1 && ys.length <= 10, "year count");
  let end = "";
  for (const value of ys) {
    const y = object(value, "year"),
      pe = period(y);
    requireValue(
      pe.period_start > end && pe.period_end <= (p.assessment_as_of as string),
      "year order",
    );
    end = pe.period_end;
    for (const k of annualFields) requireValue(num(y[k]), `year ${k}`);
  }
  const check = (value: unknown, keys: string[]) => {
    const o = object(value, "assumption");
    for (const k of keys) requireValue(num(o[k]), k);
    return o;
  };
  check(p.existing_debt, ["cpltd_annual", "operating_lease_annual"]);
  const loan = check(p.proposed_loan, ["amount", "annual_rate", "term_months"]);
  requireValue(
    Number.isSafeInteger(loan.term_months) &&
      loan.rate_type === "fixed" &&
      loan.repayment_type === "fully_amortizing" &&
      loan.payment_frequency === "monthly",
    "loan convention",
  );
  const wc = check(p.working_capital, [
    "ar_increase",
    "inventory_increase",
    "ap_increase",
    "cash_taxes_paid",
  ]);
  requireValue(
    samePeriod(period(wc), period(ys[ys.length - 1])),
    "working capital period",
  );
  for (const v of array(p.guarantors, "guarantors")) {
    const g = check(v, [
      "ownership_percentage",
      "wages",
      "interest_dividend_income",
      "mortgage_pi_annual",
      "auto_loan_annual",
      "credit_card_min_annual",
    ]);
    requireValue(str(g.name), "guarantor name");
  }
  return p as DatedRequest;
}
export function metric(value: unknown): Metric {
  const m = object(value, "metric");
  requireValue(
    str(m.fact_id) &&
      str(m.unit) &&
      (m.display_precision === null ||
        (Number.isInteger(m.display_precision) &&
          Number(m.display_precision) >= 0 &&
          Number(m.display_precision) <= 20)) &&
      (m.explanation === null || str(m.explanation)),
    "metric fields",
  );
  requireValue(
    m.status === "available"
      ? num(m.raw_value) || str(m.raw_value)
      : m.status === "not_applicable" &&
          m.raw_value === null &&
          str(m.explanation),
    "metric status/value",
  );
  return m as Metric;
}
export function guardAssessment(value: unknown): Assessment {
  const a = object(value, "assessment");
  requireValue(
    a.schema_version === "commercial-assessment-v1" &&
      a.calculation_version === "commercial-calculation-v1" &&
      a.serialization_version === "assessment-json-v1" &&
      a.coverage_basis === "current_pro_forma" &&
      str(a.disclaimer),
    "versions",
  );
  const input = guardDatedInput(a.normalized_input);
  const latest = input.years[input.years.length - 1];
  requireValue(
    samePeriod(period(a.selected_period), latest) &&
      a.assumptions_as_of === input.assessment_as_of,
    "selected period",
  );
  const spread = array(a.historical_spread, "spread");
  requireValue(spread.length === input.years.length, "spread length");
  const metrics: Metric[] = [];
  spread.forEach((v, i) => {
    const h = object(v, "historical period");
    requireValue(
      samePeriod(period(h), input.years[i]) &&
        samePeriod(period(h.financials), input.years[i]),
      "historical period correspondence",
    );
    const f = object(h.financials, "historical financials");
    for (const k of annualFields)
      requireValue(f[k] === input.years[i][k], "historical inputs");
    for (const k of [
      "ordinary_business_income",
      "ebitda",
      "k1_distribution_ratio",
    ])
      metrics.push(metric(h[k]));
  });
  const facts = object(a.current_facts, "facts");
  for (const k of currentFactKeys) {
    const m = metric(facts[k]);
    const id = ["ordinary_business_income", "ebitda"].includes(k)
      ? `years.${input.years.length - 1}.${k}`
      : `current.${k}`;
    requireValue(m.fact_id === id, "fact identity");
    requireValue(
      k === "k1_history"
        ? m.status === "available" &&
            ["stable", "unstable", "insufficient_history"].includes(
              String(m.raw_value),
            )
        : m.raw_value === null || num(m.raw_value),
      "fact type",
    );
    metrics.push(m);
  }
  const gs = array(a.guarantor_contributions, "contributions");
  requireValue(gs.length === input.guarantors.length, "contributions length");
  gs.forEach((v, i) => {
    const g = object(v, "contribution");
    requireValue(
      g.guarantor_index === i && g.name === input.guarantors[i].name,
      "contribution identity",
    );
    for (const k of ["business_ebitda", "outside_income", "personal_debt"])
      metrics.push(metric(g[k]));
  });
  const hp = array(a.k1_history_periods, "history periods").map(period);
  requireValue(
    hp.length >= 1 &&
      hp.length <= 2 &&
      samePeriod(hp[hp.length - 1], latest) &&
      hp.every((p) => input.years.some((y) => samePeriod(p, y))),
    "history periods",
  );
  const policy = object(a.policy_snapshot, "policy");
  requireValue(
    str(policy.version) &&
      date(policy.sba_sop_8_effective) &&
      date(policy.sba_sop_8_1_effective),
    "policy identity",
  );
  for (const k of policyNumbers) requireValue(num(policy[k]), `policy ${k}`);
  requireValue(
    array(policy.consumer_required_atr_fields, "ATR fields").every(str),
    "ATR fields",
  );
  const d = guardDecision(a.decision);
  requireValue(d.policy_version === policy.version, "decision policy");
  const rows = array(a.calculation_trace, "trace");
  requireValue(rows.length > 0, "trace rows");
  const trace = new Map<string, Metric>();
  for (const v of rows) {
    const r = object(v, "trace row"),
      m = metric(r);
    requireValue(
      str(r.definition_id) && str(r.expression) && !trace.has(m.fact_id),
      "trace identity",
    );
    trace.set(m.fact_id, m);
    for (const value of array(r.operands, "operands")) {
      const o = object(value, "operand");
      requireValue(
        ["input", "fact", "policy"].includes(String(o.reference_type)) &&
          str(o.reference) &&
          str(o.unit) &&
          (o.raw_value === null ||
            num(o.raw_value) ||
            typeof o.raw_value === "string"),
        "operand fields",
      );
    }
  }
  for (const value of rows) {
    const row = object(value, "trace row");
    for (const value of array(row.operands, "operands")) {
      const operand = object(value, "operand");
      if (operand.reference_type === "fact") {
        const referenced = trace.get(String(operand.reference));
        requireValue(
          referenced &&
            referenced.raw_value === operand.raw_value &&
            referenced.unit === operand.unit,
          "referenced fact",
        );
      } else {
        const path = String(operand.reference).split("/").slice(1);
        let referenced: unknown =
          operand.reference_type === "policy"
            ? { policy_snapshot: policy }
            : input;
        for (const key of path) {
          requireValue(
            referenced !== null &&
              typeof referenced === "object" &&
              Object.prototype.hasOwnProperty.call(referenced, key),
            "operand input path",
          );
          referenced = (referenced as Obj)[key];
        }
        requireValue(referenced === operand.raw_value, "operand input value");
      }
    }
  }
  for (const m of metrics) {
    const t = trace.get(m.fact_id);
    requireValue(
      t &&
        t.raw_value === m.raw_value &&
        t.status === m.status &&
        t.unit === m.unit,
      "fact/trace correspondence",
    );
  }
  for (const f of d.factors) {
    const key = f.name === "uca_positive" ? "uca_cash_flow" : f.name;
    requireValue(
      f.raw_value === metric(facts[key]).raw_value,
      "factor/fact correspondence",
    );
  }
  const fp = object(a.fingerprint, "fingerprint");
  requireValue(
    fp.algorithm === "sha256" &&
      typeof fp.value === "string" &&
      /^[0-9a-f]{64}$/.test(fp.value) &&
      fp.content ===
        "normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version",
    "fingerprint",
  );
  return a as Assessment;
}
