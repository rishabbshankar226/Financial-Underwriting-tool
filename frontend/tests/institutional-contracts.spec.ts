import { readFileSync } from "node:fs";
import { test, expect } from "./authenticatedTest";
import { datedSample } from "../src/sampleCases";
import { structuralHints } from "../src/formContracts";
import { parseField, pointerParts } from "../src/formContracts";
import { guardConsumerDecision, guardSbaResult } from "../src/domainContracts";

test("the self-contained dated preset matches every original fixture token and type", () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url),
      "utf8",
    ),
  );
  expect(datedSample).toEqual(fixture);
  expect(typeof datedSample.proposed_loan.term_months).toBe("number");
  expect(typeof datedSample.proposed_loan.annual_rate).toBe("string");
});

test("form domains preserve decimal cents, reject booleans and nonfinite values, and retain integer types", () => {
  const money = { pointer: "/amount", label: "Amount", kind: "money" as const };
  expect(parseField(money, "10000000000000000.01")).toBe(
    "10000000000000000.01",
  );
  for (const value of [
    true,
    false,
    "NaN",
    "Infinity",
    "1e309",
    "1000000000000000000000000000001",
  ])
    expect(() => parseField(money, value)).toThrow();
  const months = {
    pointer: "/term_months",
    label: "Months",
    kind: "integer" as const,
    min: "12",
    max: "12000",
  };
  expect(parseField(months, "12000")).toBe(12000);
  for (const value of ["11", "12001", "12.5", "9007199254740993"])
    expect(() => parseField(months, value)).toThrow();
  const rate = {
    pointer: "/rate",
    label: "Rate",
    kind: "rate" as const,
    min: "0",
    max: "1",
  };
  expect(parseField(rate, "0.9999999999999999999999999999999999")).toBe(
    "0.9999999999999999999999999999999999",
  );
  expect(() =>
    parseField(rate, "1.000000000000000000000000000000001"),
  ).toThrow();
});

test("RFC 6901 decoding preserves escaped slash and tilde and refuses malformed escapes", () => {
  expect(pointerParts("/a~1b/~0tag")).toEqual(["a/b", "~tag"]);
  expect(pointerParts("/a~2b")).toEqual([]);
  expect(pointerParts("not-a-pointer")).toEqual([]);
});

test("structural hints distinguish complete years, overlap and working-capital mismatches", () => {
  const value = JSON.parse(JSON.stringify(datedSample));
  expect(structuralHints(value).every((hint) => hint.valid)).toBe(true);
  value.years[1].period_start = "2024-12-01";
  expect(structuralHints(value).map((hint) => hint.valid)).toEqual([
    false,
    false,
    false,
  ]);
  value.years[1].period_start = "2025-01-01";
  value.working_capital.period_end = "2024-12-31";
  expect(structuralHints(value).map((hint) => hint.valid)).toEqual([
    true,
    true,
    false,
  ]);
});

test("consumer result guards reject wrong verticals, duplicate factors and boolean DTI", async ({
  request,
}) => {
  const response = await request.post(
    "http://127.0.0.1:8000/consumer/decision",
    {
      data: {
        applicant_name: "Contract fixture",
        geography: "60601",
        gross_monthly_income: "8000",
        proposed_housing_pi: "1800",
        proposed_housing_tax_ins: "400",
        other_monthly_debt: "500",
        synthetic_credit_score: 720,
        atr_documentation: { income: true, assets: true, debts: true },
      },
    },
  );
  expect(response.ok()).toBe(true);
  const result = await response.json();
  expect(guardConsumerDecision(result).outcome).toBe("approve");
  for (const mutate of [
    (value: typeof result) => {
      value.vertical = "commercial";
    },
    (value: typeof result) => {
      value.factors[0].raw_value = true;
    },
    (value: typeof result) => {
      value.factors[1] = value.factors[0];
    },
    (value: typeof result) => {
      value.score = "NaN";
    },
    (value: typeof result) => {
      value.extra = "unsupported";
    },
  ]) {
    const changed = structuredClone(result);
    mutate(changed);
    expect(() => guardConsumerDecision(changed)).toThrow();
  }
});

test("SBA guards never accept claimed complete eligibility or a credit-elsewhere pass", async ({
  request,
}) => {
  const response = await request.post("http://127.0.0.1:8000/sba/evaluate", {
    data: {
      schema_version: "sba-screen-v2",
      borrower_name: "Contract fixture",
      assessment_as_of: "2026-10-14",
      naics: "541611",
      annual_receipts_millions: "24.5",
      requested_loan: "500000",
      global_dscr: "1.31",
      sop_version: "8.1",
      size_evidence: {
        basis: "receipts_three_completed_fiscal_year_average",
        period_start: "2023-01-01",
        period_end: "2025-12-31",
        affiliates: "included",
        source_reference: "Synthetic contract evidence",
      },
    },
  });
  expect(response.ok()).toBe(true);
  const result = await response.json();
  expect(guardSbaResult(result).eligibility_status).toBe("incomplete");
  for (const mutate of [
    (value: typeof result) => {
      value.eligibility_status = "complete";
    },
    (value: typeof result) => {
      value.credit_elsewhere.passes = true;
    },
    (value: typeof result) => {
      value.global_dscr = false;
    },
    (value: typeof result) => {
      value.size_standard_source.row = 1.5;
    },
    (value: typeof result) => {
      value.unresolved_requirements = [];
    },
  ]) {
    const changed = structuredClone(result);
    mutate(changed);
    expect(() => guardSbaResult(changed)).toThrow();
  }
});
