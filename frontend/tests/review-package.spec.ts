import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { guardSavedCase, type StoredCase } from "../src/caseContracts";
import { guardComparison, type StoredComparison } from "../src/scenarioContracts";
import { captureReviewSource, serializeReviewPackage, MAX_EXPORT_BYTES } from "../src/reviewPackage";

const input = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated.json", import.meta.url), "utf8"));
let view: StoredCase, comparison: StoredComparison;
const clone = <T>(v: T): T => structuredClone(v);
async function bytes(source: ReturnType<typeof captureReviewSource>) {
  const result = await serializeReviewPackage(source.package);
  return Buffer.concat(result.chunks.map(chunk => Buffer.from(chunk)));
}
test.beforeAll(async ({ request }) => {
  const created = await request.post("http://127.0.0.1:8000/cases", { headers: { "Idempotency-Key": randomUUID() }, data: { input, rationale: "Synthetic export baseline" } });
  expect(created.status()).toBe(201);
  view = guardSavedCase(await created.json(), created.headers().etag);
  const path = `http://127.0.0.1:8000/cases/${view.snapshot.case_id}/revisions/1`;
  const command = { schema_version: "commercial-scenario-preview-v1", baseline_run_id: view.snapshot.run_id,
    scenarios: Array.from({ length: 10 }, (_, i) => ({ scenario_key: `s${i}`, name: `Scenario ${i}`, rationale: "Synthetic downside",
      assumptions: { revenue_change: i === 0 ? -0.1 : 0, cogs_change: 0, operating_expense_change: 0, proposed_rate_change_bps: 0 } })) };
  const preview = await request.post(`${path}/scenarios/preview`, { data: command });
  expect(preview.status()).toBe(200);
  const retained = await request.post(`${path}/scenario-comparisons`, { headers: { "Idempotency-Key": randomUUID() }, data: { ...command, schema_version: "commercial-scenario-comparison-create-v1", expected_preview_fingerprint: (await preview.json()).fingerprint.value } });
  expect(retained.status()).toBe(201);
  comparison = guardComparison(await retained.json(), retained.headers().etag);
});
test("download package reconciles the complete real original and raw pinned facts", async () => {
  const source = captureReviewSource(view, null);
  const parsed = JSON.parse((await bytes(source)).toString("utf8"));
  expect(Object.keys(parsed).sort()).toEqual(["case", "comparison", "disclaimer", "provenance", "schema_version", "scope", "serialization_version"]);
  expect(parsed.case).toEqual({ etag: view.etag, snapshot: view.snapshot });
  expect(parsed.comparison).toBeNull();
  expect(parsed.schema_version).toBe("spreadline-review-package-v1");
  expect(parsed.serialization_version).toBe("review-package-json-v1");
  expect(parsed.provenance).toEqual({ representation: "browser_parsed_json", actor_status: "prototype_unverified", integrity_status: "recorded_hashes_not_verified_by_export" });
  expect(parsed.case.snapshot.assessment.current_facts.ordinary_business_income.raw_value).toBe(423000);
  expect(parsed.case.snapshot.assessment.current_facts.ebitda.raw_value).toBe(630000);
  expect(parsed.case.snapshot.assessment.current_facts.uca_cash_flow.raw_value).toBe(385000);
  expect(source.filename).toBe(`spreadline-case-${view.snapshot.case_id}-r1-${view.snapshot.run_id}.json`);
});
test("matching retained batch keeps all ten ordered scenarios and observed history", async () => {
  const source = captureReviewSource(view, comparison);
  const parsed = JSON.parse((await bytes(source)).toString("utf8"));
  expect(parsed.comparison).toEqual({ etag: comparison.etag, record: comparison.record });
  expect(parsed.comparison.record.preview.scenarios.map((s: any) => s.scenario_key)).toEqual(Array.from({ length: 10 }, (_, i) => `s${i}`));
  const facts = parsed.comparison.record.preview.scenarios[0].current_facts;
  expect([facts.ordinary_business_income.raw_value, facts.ebitda.raw_value, facts.uca_cash_flow.raw_value]).toEqual([3000, 210000, -35000]);
  expect(facts.k1_history.raw_value).toBe("stable");
  expect(source.filename).toContain(`-comparison-${comparison.record.comparison_id}.json`);
});
for (const [name, mutate] of [
  ["case", (v: any) => { v.record.case_id = randomUUID(); v.record.preview.baseline.case_id = v.record.case_id; v.etag = `"scenario-comparison-json-v1:${v.record.case_id}:${v.record.comparison_id}:${v.record.payload_hash}"`; }],
  ["revision", (v: any) => { v.record.baseline_revision = 2; v.record.preview.baseline.revision = 2; }],
  ["run", (v: any) => { v.record.baseline_run_id = randomUUID(); v.record.preview.baseline.run_id = v.record.baseline_run_id; }],
  ["input hash", (v: any) => v.record.preview.baseline.input_hash = "a".repeat(64)],
  ["payload hash", (v: any) => v.record.preview.baseline.payload_hash = "b".repeat(64)],
  ["full evidence", (v: any) => v.record.preview.baseline.assessment.extra_evidence = "changed"],
  ["ETag", (v: any) => v.etag = '"wrong"'],
  ["live preview", (v: any) => { v.record = v.record.preview; }],
] as const) test(`rejects opted-in comparison with wrong ${name}`, () => {
  const changed = clone(comparison); mutate(changed);
  expect(() => captureReviewSource(view, changed)).toThrow();
});
test("frozen capture survives later mutations without changing evidence", async () => {
  const changed = clone(view), source = captureReviewSource(changed, null);
  changed.snapshot.event.rationale = "Changed after capture";
  (changed.snapshot.assessment.current_facts as any).ebitda.raw_value = 1;
  expect(JSON.parse((await bytes(source)).toString()).case.snapshot).toEqual(view.snapshot);
});
test("known storage with unsupported definitions exports only its parsed original", async () => {
  const changed = clone(view);
  changed.snapshot.assessment.calculation_version = "future-definition";
  const source = captureReviewSource(changed, null);
  expect(source.view.assessment).toBeNull();
  expect(JSON.parse((await bytes(source)).toString()).case.snapshot).toEqual(changed.snapshot);
});
test("unsupported comparison definition retains its matching original evidence", async () => {
  const changed = clone(comparison);
  changed.record.preview.scenario_definition_version = "future-definition";
  const source = captureReviewSource(view, changed);
  expect(source.comparison?.preview).toBeNull();
  expect(JSON.parse((await bytes(source)).toString()).comparison.record).toEqual(changed.record);
});
for (const [name, mutate] of [
  ["unknown storage", (v: any) => v.snapshot.storage_serialization_version = "future"],
  ["malformed known assessment", (v: any) => delete v.snapshot.assessment.current_facts.ebitda],
  ["non-finite", (v: any) => v.snapshot.extra = Infinity],
  ["undefined", (v: any) => v.snapshot.extra = undefined],
  ["cycle", (v: any) => v.snapshot.extra = v.snapshot],
  ["Date object", (v: any) => v.snapshot.extra = new Date()],
  ["sparse array", (v: any) => v.snapshot.extra = Array(2)],
  ["symbol", (v: any) => v.snapshot.extra = Symbol("invalid")],
] as const) test(`rejects invalid original ${name}`, () => {
  const changed = clone(view); mutate(changed);
  expect(() => captureReviewSource(changed, null)).toThrow();
});
test("deterministic UTF-16 ordering preserves strings, arrays, special keys and scalar meanings", async () => {
  const changed = clone(view);
  const extra = JSON.parse('{"2":"two","10":"ten","__proto__":{"safe":true},"constructor":"text","array":[0,false,null,-2.5],"text":"=SUM(A1)\\r\\n<script>🦉é</script>"}');
  changed.snapshot.assessment.extra = extra;
  const source = captureReviewSource(changed, null), original = (await bytes(source)).toString();
  const reordered = clone(changed);
  reordered.snapshot = Object.fromEntries(Object.entries(reordered.snapshot).reverse()) as any;
  expect((await bytes(captureReviewSource(reordered, null))).toString()).toBe(original);
  expect(JSON.parse(original).case.snapshot.assessment.extra).toEqual(extra);
  expect(original.indexOf('"10":')).toBeLessThan(original.indexOf('"2":'));
  expect(original.endsWith("\n") && !original.endsWith("\n\n")).toBe(true);
});
test("chunked string encoding keeps surrogate pairs, lone surrogates and escaped text", async () => {
  const value = { text: "a".repeat(4095) + "🦉" + "\ud800" + "\\\"\n" + "é".repeat(5000) };
  const result = await serializeReviewPackage(value);
  expect(Buffer.concat(result.chunks.map(v => Buffer.from(v))).toString()).toBe(JSON.stringify(value, null, 2) + "\n");
});
test("complete UTF-8 output exactly at 16 MiB succeeds, one byte over fails without a partial result", async () => {
  expect(MAX_EXPORT_BYTES).toBe(16777216);
  const overhead = Buffer.byteLength(JSON.stringify({ text: "" }, null, 2) + "\n");
  const text = "é".repeat(100) + "x".repeat(MAX_EXPORT_BYTES - overhead - 200);
  const result = await serializeReviewPackage({ text });
  expect(result.size).toBe(MAX_EXPORT_BYTES);
  expect(JSON.parse(Buffer.concat(result.chunks.map(v => Buffer.from(v))).toString()).text).toBe(text);
  await expect(serializeReviewPackage({ text: text + "x" })).rejects.toThrow(/16 MiB/);
});
test("serialization yields to cancellation and never returns an incomplete file", async () => {
  const controller = new AbortController();
  const pending = serializeReviewPackage({ text: "x".repeat(1000000) }, controller.signal);
  setTimeout(() => controller.abort(), 0);
  await expect(pending).rejects.toThrow(/cancel/i);
});
test("case and comparison source depth remain 64 and 100 including in a wrapper", async () => {
  const nested = (levels: number) => { let result: any = "leaf"; for (let i = 0; i < levels; i++) result = { child: result }; return result; };
  const original = clone(view), included = clone(comparison);
  (original.snapshot as any).extra = nested(62);
  (included.record as any).extra = nested(98);
  await expect(bytes(captureReviewSource(original, included))).resolves.toBeInstanceOf(Buffer);
  (original.snapshot as any).extra = nested(63);
  expect(() => captureReviewSource(original, null)).toThrow(/depth/);
  (included.record as any).extra = nested(99);
  expect(() => captureReviewSource(view, included)).toThrow(/depth/);
});
test("snapshot wrapper and optional comparison bytes count toward the complete cap", async () => {
  const original = clone(view);
  (original.snapshot as any).extra = "";
  const overhead = (await bytes(captureReviewSource(original, null))).length;
  (original.snapshot as any).extra = "x".repeat(MAX_EXPORT_BYTES - overhead);
  const output = await bytes(captureReviewSource(original, null));
  expect(output.length).toBe(MAX_EXPORT_BYTES);
  await expect(bytes(captureReviewSource(original, comparison))).rejects.toThrow();
  (original.snapshot as any).extra += "x";
  await expect(bytes(captureReviewSource(original, null))).rejects.toThrow(/16 MiB/);
});
test("JSON properties with getters or hidden values are rejected without executing them", () => {
  const original = clone(view); let called = false;
  Object.defineProperty(original.snapshot, "extra", { enumerable: true, get() { called = true; return "unsafe"; } });
  expect(() => captureReviewSource(original, null)).toThrow(); expect(called).toBe(false);
  const hidden = clone(view); Object.defineProperty(hidden.snapshot, "extra", { value: 1 });
  expect(() => captureReviewSource(hidden, null)).toThrow();
});
