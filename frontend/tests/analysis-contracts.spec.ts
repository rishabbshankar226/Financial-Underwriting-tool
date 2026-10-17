import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test, expect } from "./authenticatedTest";
import { guardAssessment, type Assessment } from "../src/contracts";
import { AnalysisContractError, guardAnalysis, type CommercialAnalysis } from "../src/analysisContracts";
import { TEST_API_ORIGIN } from "./testCredentials";

const dated = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url), "utf8"));
let assessment: Assessment;
let stateless: CommercialAnalysis;
let saved: CommercialAnalysis;
let expected: { fingerprint: string; years: Assessment["normalized_input"]["years"] };

test.beforeAll(async ({ request }) => {
  assessment = guardAssessment(await (await request.post(`${TEST_API_ORIGIN}/commercial/assessment`, { data: dated })).json());
  stateless = await (await request.post(`${TEST_API_ORIGIN}/commercial/analysis`, { data: dated })).json();
  const created = await request.post(`${TEST_API_ORIGIN}/cases`, {
    headers: { "Idempotency-Key": randomUUID() },
    data: { input: dated, rationale: "Synthetic analysis contract" },
  });
  expect(created.status()).toBe(201);
  const caseId = (await created.json()).case_id;
  saved = await (await request.post(`${TEST_API_ORIGIN}/cases/${caseId}/revisions/1/analysis`, { data: {} })).json();
  expected = { fingerprint: assessment.fingerprint.value, years: assessment.normalized_input.years };
});

function rejection(body: unknown, expectation = expected): AnalysisContractError {
  try {
    guardAnalysis(body, expectation);
  } catch (error) {
    expect(error).toBeInstanceOf(AnalysisContractError);
    return error as AnalysisContractError;
  }
  throw new Error("Expected the analysis to be refused");
}

test("real stateless and saved-revision analyses meet the display contract", () => {
  const live = guardAnalysis(stateless, expected);
  expect(live.debt_capacity.binding_constraint).toBe("fccr");
  expect(live.debt_capacity.max_principal.reported_value).toBe("2352984.83");
  expect(live.explanation.outcome).toBe(assessment.decision.outcome);
  const retained = guardAnalysis(saved, expected);
  expect(retained.source).toBe("saved_revision");
  expect(retained.baseline?.revision).toBe(1);
});

test("an analysis of another assessment is a mismatch", () => {
  const body = structuredClone(stateless);
  body.assessment_fingerprint.value = "0".repeat(64);
  expect(rejection(body).kind).toBe("mismatch");
  expect(rejection(stateless, { ...expected, fingerprint: "f".repeat(64) }).kind).toBe("mismatch");
});

test("periods that differ from the assessment's years are a mismatch", () => {
  const shifted = structuredClone(stateless);
  shifted.periods[0].period_start = "2023-01-01";
  expect(rejection(shifted).kind).toBe("mismatch");
  const missing = structuredClone(stateless);
  missing.periods.pop();
  expect(rejection(missing).kind).toBe("mismatch");
  const reordered = structuredClone(stateless);
  reordered.periods[1].period_index = 0;
  expect(rejection(reordered).kind).toBe("mismatch");
  expect(rejection(stateless, { ...expected, years: expected.years.slice(1) }).kind).toBe("mismatch");
});

test("unknown analysis versions are unsupported rather than invalid", () => {
  for (const key of ["schema_version", "definition_version", "serialization_version"] as const) {
    const body = structuredClone(stateless) as unknown as Record<string, unknown>;
    body[key] = "future-version";
    expect(rejection(body).kind).toBe("unsupported");
  }
});

for (const [label, change] of [
  ["a persisted analysis", (b: any) => { b.persisted = true; }],
  ["a saved source without its baseline", (b: any) => { b.source = "saved_revision"; }],
  ["a stateless source with a baseline", (b: any) => { b.baseline = saved.baseline; }],
  ["a missing explanation", (b: any) => { delete b.explanation; }],
  ["an unknown outcome", (b: any) => { b.explanation.outcome = "maybe"; }],
  ["three outcome conditions", (b: any) => { b.explanation.conditions.pop(); }],
  ["an unknown factor status", (b: any) => { b.explanation.factors[0].status = "fine"; }],
  ["a malformed cushion metric", (b: any) => { b.explanation.factors[0].approval_cushion.reported_value = 1.88; }],
  ["a binding constraint outside its constraints", (b: any) => { b.debt_capacity.binding_constraint = "uca"; }],
  ["two capacity constraints", (b: any) => { b.debt_capacity.constraints.pop(); }],
  ["a non-boolean capacity flag", (b: any) => { b.debt_capacity.has_capacity = "yes"; }],
  ["five breakeven rows", (b: any) => { b.breakevens.rows.pop(); }],
  ["a non-decimal principal", (b: any) => { b.debt_capacity.max_principal.raw_value = "lots"; }],
  ["a metric that disagrees with its trace row", (b: any) => { b.debt_capacity.max_principal.reported_value = "2352984.84"; }],
  ["an available metric without a trace row", (b: any) => { b.calculation_trace = b.calculation_trace.filter((r: any) => r.fact_id !== "analysis.debt_capacity.max_principal"); }],
  ["a repeated trace row", (b: any) => { b.calculation_trace.push(b.calculation_trace[0]); }],
  ["a trace row outside the analysis namespace", (b: any) => { b.calculation_trace[0].fact_id = "current.dscr"; }],
  ["a common-size line missing", (b: any) => { delete b.periods[0].common_size.ebitda; }],
  ["a first period with a prior-period change", (b: any) => { b.periods[0].change_vs_prior = b.periods[1].change_vs_prior; }],
  ["an available schedule without rows", (b: any) => { b.amortization.annual_rows = []; }],
  ["more than twenty sensitivity cells", (b: any) => { b.sensitivity.cells.push(b.sensitivity.cells[0]); }],
  ["a sensitivity cell with an unknown outcome", (b: any) => { b.sensitivity.cells[0].outcome = "maybe"; }],
  ["a missing disclaimer", (b: any) => { b.disclaimer = ""; }],
] as const) {
  test(`rejects ${label}`, () => {
    const body = structuredClone(stateless);
    change(body);
    expect(rejection(body).kind).toBe("invalid");
  });
}
