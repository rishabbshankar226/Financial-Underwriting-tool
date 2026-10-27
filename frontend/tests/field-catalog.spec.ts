import { test, expect } from "./authenticatedTest";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { guardSavedCase, type StoredCase } from "../src/caseContracts";
import { makeEdit, readRecovery, saveRecovery } from "../src/caseRecovery";
import { annualFields, guardDatedInput, guardLegacyInput, type Input, type Mode } from "../src/contracts";
import { editableField, fieldLabels, periodLabel } from "../src/fieldCatalog";
import type { EditableField } from "../src/workspace";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../backend/fixtures/${name}`, import.meta.url), "utf8"));
const dated = guardDatedInput(fixture("alpine_dated_v2.json"));
const legacy = guardLegacyInput(fixture("alpine.json"));

// Verbatim construction from App.tsx at 52c593a, before the field catalog existed.
const oracleLabels: Record<string, string> = {
  gross_receipts: "Gross receipts", gross_profit: "Gross profit", cogs: "COGS",
  operating_expense_excl_dna_interest_comp: "Operating expenses", officer_compensation: "Officer compensation",
  depreciation: "Depreciation", amortization: "Amortization", interest_expense: "Interest expense",
  section_179: "Section 179", k1_distribution: "K-1 distributions", ordinary_business_income: "Ordinary business income",
  ebitda: "EBITDA", dscr: "Business DSCR", fccr: "FCCR", global_dscr: "Global DSCR", uca_positive: "UCA cash flow",
  k1_history: "K-1 distribution history", cpltd_annual: "Annual CPLTD", operating_lease_annual: "Annual operating leases",
  amount: "Proposed principal", annual_rate: "Annual nominal rate", term_months: "Loan term", ownership_percentage: "Ownership",
  wages: "Annual wages", interest_dividend_income: "Annual interest/dividend income", mortgage_pi_annual: "Annual mortgage P&I",
  auto_loan_annual: "Annual auto debt", credit_card_min_annual: "Annual card minimum", ar_increase: "AR increase",
  inventory_increase: "Inventory increase", ap_increase: "AP increase", cash_taxes_paid: "Cash taxes paid",
};
const oraclePeriod = (year: { period_start?: string; period_end?: string }, index: number) =>
  year.period_start && year.period_end ? `${year.period_start} – ${year.period_end}` : `Supplied period ${index + 1}`;
function oracleSpreadCell(input: Input, i: number, key: (typeof annualFields)[number]): EditableField {
  const y = input.years[i];
  return {
    path: `/years/${i}/${key}`, label: oracleLabels[key], value: y[key], unit: "USD",
    min: key === "interest_expense" ? "0" : undefined, period: oraclePeriod(y, i),
  };
}
function oracleAssumption(input: Input, mode: Mode, prefix: string, key: string, value: string | number,
  period?: string): EditableField {
  const percent = ["annual_rate", "ownership_percentage"].includes(key), integer = key === "term_months";
  const nonnegative = ["cpltd_annual", "operating_lease_annual", "amount", "annual_rate", "ownership_percentage",
    "mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual"].includes(key);
  return {
    path: `${prefix}/${key}`, label: oracleLabels[key] ?? key, value,
    unit: percent ? "%" : integer ? "months" : "USD",
    min: integer ? (mode === "dated" ? 12 : 1) : nonnegative ? 0 : undefined,
    max: key === "ownership_percentage" || (key === "annual_rate" && mode === "dated") ? 1 : undefined,
    integer,
    period: period ?? ("assessment_as_of" in input ? `Assumption as of ${input.assessment_as_of}` : "Legacy annual assumption"),
  };
}
function oracle(input: Input, mode: Mode, path: string): EditableField {
  const [group, a, b] = path.split("/").slice(1);
  const last = input.years.length - 1;
  if (group === "years") return oracleSpreadCell(input, Number(a), b as (typeof annualFields)[number]);
  if (group === "guarantors") {
    const guarantor = input.guarantors[Number(a)] as unknown as Record<string, string>;
    return oracleAssumption(input, mode, `/guarantors/${a}`, b, guarantor[b]);
  }
  if (group === "working_capital")
    return oracleAssumption(input, mode, "/working_capital", a,
      (input.working_capital as unknown as Record<string, string>)[a],
      `Working capital for ${oraclePeriod(input.years[last], last)}`);
  return oracleAssumption(input, mode, `/${group}`, a,
    (input[group as "existing_debt" | "proposed_loan"] as unknown as Record<string, string | number>)[a]);
}
function allPaths(input: Input): string[] {
  return [
    ...input.years.flatMap((_, i) => annualFields.map((key) => `/years/${i}/${key}`)),
    "/existing_debt/cpltd_annual", "/existing_debt/operating_lease_annual",
    "/proposed_loan/amount", "/proposed_loan/annual_rate", "/proposed_loan/term_months",
    ...input.guarantors.flatMap((_, i) => ["ownership_percentage", "wages", "interest_dividend_income",
      "mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual"].map((key) => `/guarantors/${i}/${key}`)),
    ...["ar_increase", "inventory_increase", "ap_increase", "cash_taxes_paid"].map((key) => `/working_capital/${key}`),
  ];
}

test("every catalog field serializes exactly as the original workspace built it", () => {
  for (const [input, mode] of [[dated, "dated"], [legacy, "legacy"]] as const) {
    for (const path of allPaths(input)) {
      const built = editableField(input, mode, path), expected = oracle(input, mode, path);
      expect(JSON.stringify(built), `${mode} ${path}`).toBe(JSON.stringify(expected));
      expect(Object.keys(built), `${mode} ${path}`).toEqual(Object.keys(expected));
    }
  }
});

test("pinned field shapes guard the oracle itself", () => {
  expect(JSON.stringify(editableField(dated, "dated", "/years/1/interest_expense"))).toBe(
    '{"path":"/years/1/interest_expense","label":"Interest expense","value":"62000","unit":"USD","min":"0","period":"2025-01-01 – 2025-12-31"}');
  expect(JSON.stringify(editableField(dated, "dated", "/proposed_loan/annual_rate"))).toBe(
    '{"path":"/proposed_loan/annual_rate","label":"Annual nominal rate","value":"0.105","unit":"%","min":0,"max":1,"integer":false,"period":"Assumption as of 2026-10-06"}');
  expect(JSON.stringify(editableField(legacy, "legacy", "/proposed_loan/term_months"))).toBe(
    '{"path":"/proposed_loan/term_months","label":"Loan term","value":120,"unit":"months","min":1,"integer":true,"period":"Legacy annual assumption"}');
  expect(JSON.stringify(editableField(dated, "dated", "/working_capital/ap_increase"))).toBe(
    '{"path":"/working_capital/ap_increase","label":"AP increase","value":"50000","unit":"USD","integer":false,"period":"Working capital for 2025-01-01 – 2025-12-31"}');
  expect(periodLabel({}, 2)).toBe("Supplied period 3");
  expect(fieldLabels.uca_positive).toBe("UCA cash flow");
  expect(() => editableField(dated, "dated", "/borrower_name")).toThrow();
});

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  };
}

let view: StoredCase;
test.beforeAll(async ({ request }) => {
  const response = await request.post("http://127.0.0.1:8000/cases", {
    headers: { "Idempotency-Key": randomUUID() },
    data: { input: fixture("alpine_dated_v2.json"), rationale: "Field catalog journal check" },
  });
  expect(response.status()).toBe(201);
  view = guardSavedCase(await response.json(), response.headers().etag);
});

test("catalog fields and original field shapes survive the exact-write journal unchanged", () => {
  const changed = (field: EditableField) =>
    field.integer ? Number(field.value) + 1 : field.unit === "%" ? (field.value === "0.5" ? "0.25" : "0.5") : "123456";
  for (const path of allPaths(dated)) {
    for (const field of [editableField(dated, "dated", path), oracle(dated, "dated", path)]) {
      const storage = memoryStorage();
      const operation = makeEdit(view, { path, prior: field.value, next: changed(field), rationale: "Journal check",
        at: "unverified local" }, field);
      saveRecovery(storage, operation);
      const restored = readRecovery(storage).operation;
      expect(restored?.kind === "edit" && restored.review, path).toEqual(JSON.parse(JSON.stringify(field)));
    }
  }
});
