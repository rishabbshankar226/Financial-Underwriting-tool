import { annualFields, type AnnualField, type Input, type Mode, type Period } from "./contracts";
import type { EditableField } from "./workspace";

/** Field labels, units and bounds in one place. Built fields must stay byte-compatible with the
 * exact-write journal, so key order and which keys are present follow the original workspace. */
export const fieldLabels: Record<string, string> = {
  gross_receipts: "Gross receipts",
  gross_profit: "Gross profit",
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

/** Current-fact labels shared by assessment and stress views. */
export const factLabels: Record<string, string> = {
  ordinary_business_income: "Ordinary business income",
  ebitda: "EBITDA",
  proposed_monthly_payment: "Proposed monthly payment",
  proposed_annual_payment: "Proposed annual payment",
  debt_service: "Business debt service",
  fixed_charge_service: "Fixed charge service",
  global_business_ebitda: "Owned business EBITDA",
  global_outside_income: "Outside income",
  global_personal_debt: "Personal debt",
  global_cash_flow: "Global cash flow",
  global_debt_service: "Global debt service",
  dscr: "DSCR",
  fccr: "Simplified FCCR",
  global_dscr: "Global DSCR",
  net_working_capital_increase: "Working capital increase",
  uca_cash_flow: "UCA cash flow",
  k1_ratio_difference: "Observed K-1 ratio difference",
  k1_history: "Observed K-1 history",
  uca_positive: "UCA cash flow",
};

export const assumptionFields = {
  existing_debt: ["cpltd_annual", "operating_lease_annual"],
  proposed_loan: ["amount", "annual_rate", "term_months"],
  guarantors: [
    "ownership_percentage",
    "wages",
    "interest_dividend_income",
    "mortgage_pi_annual",
    "auto_loan_annual",
    "credit_card_min_annual",
  ],
  working_capital: ["ar_increase", "inventory_increase", "ap_increase", "cash_taxes_paid"],
} as const;

const percentFields: readonly string[] = ["annual_rate", "ownership_percentage"];
const nonnegativeFields: readonly string[] = [
  "cpltd_annual",
  "operating_lease_annual",
  "amount",
  "annual_rate",
  "ownership_percentage",
  "mortgage_pi_annual",
  "auto_loan_annual",
  "credit_card_min_annual",
];

/** Calculated historical rows, in the order the spread and details views show them. */
export const derivedSpreadFacts = ["gross_profit", "ordinary_business_income", "ebitda", "k1_distribution_ratio"] as const;

export const periodLabel = (year: Partial<Period>, index: number) =>
  year.period_start && year.period_end
    ? `${year.period_start} – ${year.period_end}`
    : `Supplied period ${index + 1}`;

export function assumptionPeriod(input: Input): string {
  return "assessment_as_of" in input ? `Assumption as of ${input.assessment_as_of}` : "Legacy annual assumption";
}

export function workingCapitalPeriod(input: Input): string {
  const last = input.years.length - 1;
  return `Working capital for ${periodLabel(input.years[last], last)}`;
}

/** A supplied annual spread value. */
export function spreadField(input: Input, index: number, key: AnnualField): EditableField {
  const year = input.years[index];
  return {
    path: `/years/${index}/${key}`,
    label: fieldLabels[key],
    value: year[key],
    unit: "USD",
    min: key === "interest_expense" ? "0" : undefined,
    period: periodLabel(year, index),
  };
}

/** An annual assumption: debt, loan terms, guarantor amounts or working capital. */
export function assumptionField(
  input: Input,
  mode: Mode,
  prefix: string,
  key: string,
  value: string | number,
  period?: string,
): EditableField {
  const percent = percentFields.includes(key),
    integer = key === "term_months";
  return {
    path: `${prefix}/${key}`,
    label: fieldLabels[key] ?? key,
    value,
    unit: percent ? "%" : integer ? "months" : "USD",
    min: integer ? (mode === "dated" ? 12 : 1) : nonnegativeFields.includes(key) ? 0 : undefined,
    max: key === "ownership_percentage" || (key === "annual_rate" && mode === "dated") ? 1 : undefined,
    integer,
    period: period ?? assumptionPeriod(input),
  };
}

/** The editable field at an allowlisted input path. */
export function editableField(input: Input, mode: Mode, path: string): EditableField {
  const [group, first, second, ...rest] = path.split("/").slice(1);
  const index = Number(first);
  if (group === "years" && rest.length === 0 && (annualFields as readonly string[]).includes(second)
      && Number.isInteger(index) && index >= 0 && index < input.years.length)
    return spreadField(input, index, second as AnnualField);
  if (group === "guarantors" && rest.length === 0 && (assumptionFields.guarantors as readonly string[]).includes(second)
      && Number.isInteger(index) && index >= 0 && index < input.guarantors.length) {
    const guarantor = input.guarantors[index] as unknown as Record<string, string>;
    return assumptionField(input, mode, `/guarantors/${index}`, second, guarantor[second]);
  }
  if ((group === "existing_debt" || group === "proposed_loan" || group === "working_capital")
      && second === undefined && (assumptionFields[group] as readonly string[]).includes(first)) {
    const values = input[group] as unknown as Record<string, string | number>;
    return assumptionField(input, mode, `/${group}`, first, values[first],
      group === "working_capital" ? workingCapitalPeriod(input) : undefined);
  }
  throw new Error(`Unsupported editable input path: ${path}`);
}
