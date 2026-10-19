import type { FieldKind } from "../formContracts";

export type WorkbookField = {
  label: string;
  key: string;
  kind: FieldKind;
  helper: string;
  min?: string;
  max?: string;
};
export const TEMPLATE_VERSION = "1";
export const HEADER_ROW = 7;

export const borrowerFields: WorkbookField[] = [
  {
    label: "Borrower name",
    key: "borrower_name",
    kind: "text",
    helper: "Business name",
  },
  {
    label: "Geography",
    key: "geography",
    kind: "text",
    helper: "Postal code or geography; keep leading zeros",
  },
  {
    label: "Assessment date",
    key: "assessment_as_of",
    kind: "date",
    helper: "Calendar date, YYYY-MM-DD",
  },
];
export const financialFields: WorkbookField[] = [
  {
    label: "Period start",
    key: "period_start",
    kind: "date",
    helper: "First day of a complete fiscal year",
  },
  {
    label: "Period end",
    key: "period_end",
    kind: "date",
    helper: "Last day of the same fiscal year",
  },
  {
    label: "Revenue",
    key: "gross_receipts",
    kind: "money",
    helper: "USD dollars",
  },
  {
    label: "Cost of goods sold",
    key: "cogs",
    kind: "money",
    helper: "USD dollars",
  },
  {
    label: "Operating expense excl. D&A, interest and officer pay",
    key: "operating_expense_excl_dna_interest_comp",
    kind: "money",
    helper: "USD dollars; exclude D&A, interest and officer pay",
  },
  {
    label: "Officer compensation",
    key: "officer_compensation",
    kind: "money",
    helper: "USD dollars",
  },
  {
    label: "Depreciation",
    key: "depreciation",
    kind: "money",
    helper: "USD dollars",
  },
  {
    label: "Amortization",
    key: "amortization",
    kind: "money",
    helper: "USD dollars",
  },
  {
    label: "Interest expense",
    key: "interest_expense",
    kind: "money",
    helper: "USD dollars; zero or positive",
    min: "0",
  },
  {
    label: "Section 179 expense",
    key: "section_179",
    kind: "money",
    helper: "USD dollars",
  },
  {
    label: "K-1 distributions",
    key: "k1_distribution",
    kind: "money",
    helper: "USD dollars",
  },
];
export const debtFields: WorkbookField[] = [
  {
    label: "Loan amount",
    key: "proposed_loan.amount",
    kind: "money",
    helper: "USD dollars; zero or positive",
    min: "0",
  },
  {
    label: "Annual nominal rate",
    key: "proposed_loan.annual_rate",
    kind: "rate",
    helper: "Decimal fraction 0–1 or a percentage; 0.105 = 10.5%",
    min: "0",
    max: "1",
  },
  {
    label: "Term months",
    key: "proposed_loan.term_months",
    kind: "integer",
    helper: "Integer from 12 through 12,000",
    min: "12",
    max: "12000",
  },
  {
    label: "Existing annual principal payments",
    key: "existing_debt.cpltd_annual",
    kind: "money",
    helper: "USD dollars; zero or positive",
    min: "0",
  },
  {
    label: "Annual operating lease payments",
    key: "existing_debt.operating_lease_annual",
    kind: "money",
    helper: "USD dollars; zero or positive",
    min: "0",
  },
];
export const guarantorFields: WorkbookField[] = [
  { label: "Guarantor name", key: "name", kind: "text", helper: "Name" },
  {
    label: "Ownership",
    key: "ownership_percentage",
    kind: "rate",
    helper: "Decimal fraction 0–1 or a percentage; 1 = 100%",
    min: "0",
    max: "1",
  },
  {
    label: "Annual wages",
    key: "wages",
    kind: "money",
    helper: "USD dollars per year",
  },
  {
    label: "Annual interest and dividend income",
    key: "interest_dividend_income",
    kind: "money",
    helper: "USD dollars per year",
  },
  {
    label: "Annual mortgage principal and interest",
    key: "mortgage_pi_annual",
    kind: "money",
    helper: "USD dollars per year; zero or positive",
    min: "0",
  },
  {
    label: "Annual auto loan payments",
    key: "auto_loan_annual",
    kind: "money",
    helper: "USD dollars per year; zero or positive",
    min: "0",
  },
  {
    label: "Annual credit card minimum payments",
    key: "credit_card_min_annual",
    kind: "money",
    helper: "USD dollars per year; zero or positive",
    min: "0",
  },
];
export const capitalFields: WorkbookField[] = [
  {
    label: "Period start",
    key: "period_start",
    kind: "date",
    helper: "Match the latest financial year",
  },
  {
    label: "Period end",
    key: "period_end",
    kind: "date",
    helper: "Match the latest financial year",
  },
  {
    label: "Increase in accounts receivable",
    key: "ar_increase",
    kind: "money",
    helper: "USD dollars; a decrease is negative",
  },
  {
    label: "Increase in inventory",
    key: "inventory_increase",
    kind: "money",
    helper: "USD dollars; a decrease is negative",
  },
  {
    label: "Increase in accounts payable",
    key: "ap_increase",
    kind: "money",
    helper: "USD dollars; a decrease is negative",
  },
  {
    label: "Cash taxes paid",
    key: "cash_taxes_paid",
    kind: "money",
    helper: "USD dollars",
  },
];
export const workbookSheets = [
  { name: "Borrower", fields: borrowerFields, prefix: null, maximum: 1 },
  { name: "Financials", fields: financialFields, prefix: "Year", maximum: 10 },
  { name: "Debt and loan", fields: debtFields, prefix: null, maximum: 1 },
  {
    name: "Guarantors",
    fields: guarantorFields,
    prefix: "Guarantor",
    maximum: 100,
  },
  { name: "Working capital", fields: capitalFields, prefix: null, maximum: 1 },
] as const;
