import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { guardAssessment } from "../src/contracts";
import { applyEdit, initialWorkspace, transition } from "../src/workspace";

const dated = JSON.parse(
  readFileSync(
    new URL("../../backend/fixtures/alpine_dated.json", import.meta.url),
    "utf8",
  ),
);
let response: any;
test.beforeAll(async ({ request }) => {
  response = await (
    await request.post("http://127.0.0.1:8000/commercial/assessment", {
      data: dated,
    })
  ).json();
});
test("real assessment meets the display contract", () => {
  expect(guardAssessment(response).current_facts.ebitda.raw_value).toBe(630000);
});
for (const part of [
  "normalized_input",
  "current_facts",
  "policy_snapshot",
  "calculation_trace",
  "fingerprint",
]) {
  test(`rejects missing ${part}`, () => {
    const body = structuredClone(response);
    delete body[part];
    expect(() => guardAssessment(body)).toThrow();
  });
}
test("rejects inconsistent periods and unavailable fact status", () => {
  const body = structuredClone(response);
  body.selected_period.period_end = "2024-12-31";
  expect(() => guardAssessment(body)).toThrow();
  const bad = structuredClone(response);
  bad.current_facts.dscr.raw_value = null;
  expect(() => guardAssessment(bad)).toThrow();
});
test("only matching successful submissions change accepted input and history", () => {
  const accepted = {
    mode: "dated" as const,
    input: dated,
    result: guardAssessment(response),
    filename: "dated.json",
  };
  const ready = transition(initialWorkspace, {
    type: "success",
    id: 0,
    accepted,
  });
  const edit = {
    path: "/years/1/gross_receipts",
    prior: 4200000,
    next: 1,
    rationale: "Synthetic decline",
    at: "2026-10-06T00:00:00Z",
  };
  const draft = {
    mode: "dated" as const,
    payload: applyEdit(dated, edit),
    filename: "dated.json",
    edit,
  };
  const pending = transition(ready, {
    type: "start",
    id: 1,
    draft,
    filename: draft.filename,
  });
  expect(pending.accepted).toBe(accepted);
  expect(pending.status).toBe("evaluating");
  expect(pending.history).toEqual([]);
  expect(transition(pending, { type: "success", id: 0, accepted })).toBe(
    pending,
  );
  const failed = transition(pending, {
    type: "failure",
    id: 1,
    error: "Offline",
  });
  expect(failed.history).toEqual([]);
  expect(failed.draft?.payload.years[1].gross_receipts).toBe(1);
  const done = transition(failed, { type: "success", id: 1, accepted });
  expect(done.history).toEqual([edit]);
  expect(
    transition(done, { type: "success", id: 1, accepted }).history,
  ).toEqual([edit]);
});

import { detectMode, guardLegacyInput } from "../src/contracts";
import { validateEdit } from "../src/workspace";

test("declared unknown schemas cannot silently route to legacy", () => {
  expect(detectMode(dated)).toBe("dated");
  expect(detectMode({})).toBe("legacy");
  expect(() =>
    detectMode({ schema_version: "commercial-assessment-v2" }),
  ).toThrow("unsupported");
});
for (const [label, mutate] of [
  ["non-finite fact", (b: any) => (b.current_facts.dscr.raw_value = Infinity)],
  ["wrong version", (b: any) => (b.serialization_version = "unknown")],
  ["missing metric", (b: any) => delete b.current_facts.ebitda],
  ["missing operand", (b: any) => delete b.calculation_trace[0].operands],
  [
    "missing policy number",
    (b: any) => delete b.policy_snapshot.commercial_min_dscr,
  ],
  ["wrong fact type", (b: any) => (b.current_facts.dscr.raw_value = "3.1")],
] as const)
  test(`guard rejects ${label}`, () => {
    const b = structuredClone(response);
    mutate(b);
    expect(() => guardAssessment(b)).toThrow();
  });

test("percent edits convert once and validation uses field contract", () => {
  const rate = {
    path: "/proposed_loan/annual_rate",
    label: "Rate",
    period: "Current",
    value: 0.105,
    unit: "%" as const,
    min: 0,
    max: 1,
  };
  expect(validateEdit(rate, "12.5", "Synthetic rate")).toBe(0.125);
  expect(() => validateEdit(rate, "101", "Synthetic rate")).toThrow("range");
  expect(() =>
    validateEdit(
      { ...rate, unit: "months", integer: true, min: 12 },
      "12.5",
      "test",
    ),
  ).toThrow("whole");
  expect(() =>
    validateEdit({ ...rate, unit: "USD", min: 0 }, "-1", "test"),
  ).toThrow("range");
  expect(
    validateEdit({ ...rate, unit: "USD", min: undefined }, "-1", "test"),
  ).toBe(-1);
  expect(() => validateEdit(rate, "10.5", "test")).toThrow("changed");
});

test("legacy omitted defaults are filled only for presentation", () => {
  const legacy = structuredClone(dated);
  delete legacy.schema_version;
  delete legacy.guarantors;
  delete legacy.years[0].section_179;
  const normalized = guardLegacyInput(legacy);
  expect(normalized.guarantors).toEqual([]);
  expect(normalized.years[0].section_179).toBe(0);
  expect(legacy.years[0].section_179).toBeUndefined();
});

test("trace references must resolve without inventing missing operands", () => {
  const body = structuredClone(response);
  body.calculation_trace = body.calculation_trace.filter(
    (r: any) => r.fact_id !== "years.0.gross_profit",
  );
  expect(() => guardAssessment(body)).toThrow();
  const corrupt = structuredClone(response);
  corrupt.calculation_trace[0].operands[0].reference = "/years/0/missing_input";
  expect(() => guardAssessment(corrupt)).toThrow();
});

import { evaluate } from "../src/api";
test("API errors handle non-JSON bodies and preserve raw imported bytes", async () => {
  const raw = JSON.stringify(dated) + "  ";
  const controller = new AbortController();
  let sent = "";
  let endpoint = "";
  const accepted = await evaluate(
    { mode: "dated", payload: dated, filename: "raw.json", rawJson: raw },
    controller.signal,
    async (url, init) => {
      endpoint = String(url);
      sent = String(init?.body);
      return new Response(JSON.stringify(response));
    },
  );
  expect(endpoint).toContain("/commercial/assessment");
  expect(sent).toBe(raw);
  expect(accepted.mode).toBe("dated");
  await expect(
    evaluate(
      { mode: "dated", payload: dated, filename: "raw.json" },
      controller.signal,
      async () => new Response("Offline", { status: 503 }),
    ),
  ).rejects.toThrow("unreadable");
});

test("a replaced selection ignores stale failures and clears history only on acceptance", () => {
  const accepted = {
    mode: "dated" as const,
    input: dated,
    result: guardAssessment(response),
    filename: "dated.json",
  };
  const event = {
    path: "/years/1/gross_receipts",
    prior: 4200000,
    next: 1,
    rationale: "test",
    at: "test",
  };
  const previous = {
    ...initialWorkspace,
    accepted,
    status: "ready" as const,
    history: [event],
  };
  const pending = transition(previous, {
    type: "start",
    id: 1,
    filename: "replacement.json",
    draft: {
      mode: "dated",
      payload: dated,
      filename: "replacement.json",
      resetHistory: true,
    },
  });
  expect(transition(pending, { type: "failure", id: 0, error: "old" })).toBe(
    pending,
  );
  expect(pending.history).toEqual([event]);
  expect(
    transition(pending, { type: "failure", id: 1, error: "rejected" }).history,
  ).toEqual([event]);
  expect(
    transition(pending, { type: "success", id: 1, accepted }).history,
  ).toEqual([]);
});
