import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { guardSavedCase, type StoredCase } from "../src/caseContracts";
import { guardPreview, guardComparison, guardComparisonPage, guardScenarioCommand, parseShock, scenarioText } from "../src/scenarioContracts";
import { previewScenarios, writeComparison, fetchComparison, fetchComparisons, MAX_RESPONSE } from "../src/scenarioApi";
import { makeComparison, makeCreate, saveRecovery, readRecovery, clearRecovery, RECOVERY_KEY } from "../src/caseRecovery";
const input = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated.json", import.meta.url), "utf8"));
const zero = { revenue_change: 0, cogs_change: 0, operating_expense_change: 0, proposed_rate_change_bps: 0 };
const commands = [
    ["zero", zero],
    ["revenue", { ...zero, revenue_change: -0.1 }],
    ["cogs", { ...zero, cogs_change: 0.1 }],
    ["opex", { ...zero, operating_expense_change: 0.1 }],
    ["combined", { ...zero, revenue_change: -0.1, cogs_change: 0.1, operating_expense_change: 0.1 }],
    ["rate", { ...zero, proposed_rate_change_bps: 200 }],
].map(([name, assumptions]) => ({ scenario_key: name, name, rationale: "Synthetic contract example", assumptions }));
let view: StoredCase, command: any, preview: any, record: any, etag: string, location: string;
test.beforeAll(async ({ request }) => {
    const created = await request.post("http://127.0.0.1:8000/cases", { headers: { "Idempotency-Key": randomUUID() }, data: { input, rationale: "Scenario contract baseline" } });
    expect(created.status()).toBe(201);
    view = guardSavedCase(await created.json(), created.headers().etag);
    command = { schema_version: "commercial-scenario-preview-v1", baseline_run_id: view.snapshot.run_id, scenarios: commands };
    const response = await request.post(`http://127.0.0.1:8000/cases/${view.snapshot.case_id}/revisions/1/scenarios/preview`, { data: command });
    expect(response.status()).toBe(200);
    preview = await response.json();
    const retained = await request.post(`http://127.0.0.1:8000/cases/${view.snapshot.case_id}/revisions/1/scenario-comparisons`, { headers: { "Idempotency-Key": randomUUID() }, data: { ...command, schema_version: "commercial-scenario-comparison-create-v1", expected_preview_fingerprint: preview.fingerprint.value } });
    expect(retained.status()).toBe(201);
    record = await retained.json();
    etag = retained.headers().etag;
    location = retained.headers().location;
});
test("real preview preserves the selected original baseline and known financial examples", () => {
    const result = guardPreview(preview, view, command);
    expect(result.baseline.assessment).toEqual(view.assessment);
    const expected = [[423000, 630000, 385000], [3000, 210000, -35000], [148000, 355000, 110000], [359000, 566000, 321000], [-336000, -129000, -374000], [423000, 630000, 385000]];
    result.scenarios.forEach((s, i) => {
        ["ordinary_business_income", "ebitda", "uca_cash_flow"].forEach((key, j) => expect(s.current_facts[key].raw_value).toBeCloseTo(expected[i][j], 7));
        expect(s.current_facts.k1_history.raw_value).toBe("stable");
    });
    expect(result.scenarios[5].current_facts.proposed_annual_payment.raw_value).toBeCloseTo(87825.70120380491, 7);
});
for (const [label, mutate] of [
    ["wrong run", (p: any) => p.baseline.run_id = randomUUID()],
    ["wrong payload hash", (p: any) => p.baseline.payload_hash = "a".repeat(64)],
    ["different policy", (p: any) => p.policy_snapshot.commercial_min_dscr += 0.1],
    ["changed original baseline", (p: any) => p.baseline.assessment.normalized_input.years[1].gross_receipts += 1],
    ["reordered command", (p: any) => p.scenarios.reverse()],
    ["changed rationale", (p: any) => p.scenarios[0].rationale = "Different review"],
    ["boolean shock", (p: any) => p.scenarios[0].assumptions.revenue_change = false],
    ["missing fact", (p: any) => delete p.scenarios[0].current_facts.dscr],
    ["changed comparison link", (p: any) => p.scenarios[0].comparisons[0].baseline_value += 1],
    ["wrong factor link", (p: any) => p.scenarios[0].factor_changes[0].projected_fact_id = "wrong"],
    ["unresolved trace", (p: any) => p.scenarios[0].calculation_trace.at(-1).operands[0].reference = "/missing"],
    ["non-finite fact", (p: any) => p.scenarios[0].current_facts.ebitda.raw_value = Infinity],
    ["unsupported live definition", (p: any) => p.scenario_definition_version = "future"],
    ["renamed retained trace", (p: any) => p.scenarios[0].calculation_trace.find((r: any) => r.fact_id === "baseline.years.0.ebitda").definition_id = "invented"],
    ["renamed projected trace", (p: any) => { const s = p.scenarios[0], old = s.current_facts.ebitda.fact_id; s.current_facts.ebitda.fact_id = "invented.ebitda"; s.calculation_trace.forEach((r: any) => { if (r.fact_id === old)
            r.fact_id = "invented.ebitda"; r.operands.forEach((o: any) => { if (o.reference === old)
            o.reference = "invented.ebitda"; }); }); s.comparisons.find((c: any) => c.metric === "ebitda").projected_fact_id = "invented.ebitda"; }],
    ["changed observed K-1 ratio difference", (p: any) => { const s = p.scenarios[0], fact = s.current_facts.k1_ratio_difference; fact.raw_value += 0.001; s.calculation_trace.find((r: any) => r.fact_id === fact.fact_id).raw_value = fact.raw_value; s.calculation_trace.forEach((r: any) => r.operands.forEach((o: any) => { if (o.reference === fact.fact_id)
            o.raw_value = fact.raw_value; })); s.comparisons.find((c: any) => c.metric === "k1_ratio_difference").projected_value = fact.raw_value; }],
    ["projection input and shock trace disagree", (p: any) => p.scenarios[0].projection_inputs.operating.gross_receipts += 1],
] as const)
    test(`live preview guard rejects ${label}`, () => {
        const copy = structuredClone(preview);
        mutate(copy);
        expect(() => guardPreview(copy, view, command)).toThrow();
    });
test("original comparison has distinct outer persistence and inner preview identity", () => {
    const saved = guardComparison(record, etag);
    expect(saved.record.persisted).toBe(true);
    expect(saved.preview?.persisted).toBe(false);
    expect(saved.preview?.fingerprint.value).toBe(preview.fingerprint.value);
});
test("unsupported original definitions retain JSON while unknown storage fails closed", () => {
    const copy = structuredClone(record);
    copy.preview.scenario_definition_version = "future";
    expect(guardComparison(copy, etag).preview).toBeNull();
    expect(guardComparison(copy, etag).compatibility).toContain("future");
    copy.storage_serialization_version = "unknown";
    expect(() => guardComparison(copy, etag)).toThrow();
});
test("original inner baseline and ETag cannot point to a different record", () => {
    const copy = structuredClone(record);
    copy.preview.baseline.revision = 2;
    expect(() => guardComparison(copy, etag)).toThrow();
    expect(() => guardComparison(record, `W/${etag}`)).toThrow();
});
test("comparison summaries verify requested case, counts, distinct keys and cursor", async ({ request }) => {
    const r = await request.get(`http://127.0.0.1:8000/cases/${view.snapshot.case_id}/scenario-comparisons?limit=25`);
    const page = await r.json();
    expect(guardComparisonPage(page, view.snapshot.case_id).items[0].scenario_count).toBe(6);
    for (const mutate of [(p: any) => p.items[0].case_id = randomUUID(), (p: any) => p.items[0].scenario_count = 1, (p: any) => p.items[0].scenarios[1].scenario_key = p.items[0].scenarios[0].scenario_key, (p: any) => p.next_cursor = "a".repeat(513)]) {
        const copy = structuredClone(page);
        mutate(copy);
        expect(() => guardComparisonPage(copy, view.snapshot.case_id)).toThrow();
    }
});
for (const raw of ["", " ", "1,2", "NaN", "Infinity", "1e999", "--10"])
    test(`shock parser rejects ${JSON.stringify(raw)}`, () => expect(() => parseShock(raw, true)).toThrow());
test("shock units, Unicode trim and code-point limits match the command", () => {
    expect(parseShock("-10", true)).toBe(-0.1);
    expect(parseShock("12.5", false)).toBe(12.5);
    expect(parseShock("-100", true)).toBe(-1);
    expect(() => parseShock("-100.1", true)).toThrow();
    expect(scenarioText("\u0085 🦉 \u001f", 120)).toBe("🦉");
    expect(scenarioText("🦉".repeat(120), 120)).toHaveLength(240);
    expect(() => scenarioText("🦉".repeat(121), 120)).toThrow();
});
test("command guard requires all four finite shocks and unique ordered rows", () => {
    expect(guardScenarioCommand(command)).toEqual(command);
    const copy = structuredClone(command);
    delete copy.scenarios[0].assumptions.cogs_change;
    expect(() => guardScenarioCommand(copy)).toThrow();
    copy.scenarios[0].assumptions = { ...zero };
    copy.scenarios[1].scenario_key = copy.scenarios[0].scenario_key;
    expect(() => guardScenarioCommand(copy)).toThrow();
});
function memory(): Storage { const values = new Map<string, string>(); return { getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v); }, removeItem: k => { values.delete(k); }, clear: () => values.clear(), key: i => [...values.keys()][i] ?? null, get length() { return values.size; } }; }
test("comparison recovery shares the existing key and refuses replacing pending case writes", () => {
    const storage = memory(), op = makeComparison(guardPreview(preview, view, command));
    saveRecovery(storage, op);
    const restored = readRecovery(storage).operation!;
    expect(restored.kind).toBe("comparison");
    expect(restored.body).toBe(op.body);
    expect(restored.id).toBe(op.id);
    expect(() => saveRecovery(storage, makeCreate(input, "Another write"))).toThrow();
    clearRecovery(storage, op.id);
    saveRecovery(storage, makeCreate(input, "Original v1 case envelope"));
    expect(readRecovery(storage).operation?.version).toBe("case-write-v1");
});
test("changed comparison recovery baseline and wrong backend block transmission", () => {
    const storage = memory(), op = makeComparison(guardPreview(preview, view, command));
    saveRecovery(storage, op);
    const copy = JSON.parse(storage.getItem(RECOVERY_KEY)!);
    copy.baselineRunId = randomUUID();
    storage.setItem(RECOVERY_KEY, JSON.stringify(copy));
    expect(readRecovery(storage).operation).toBeNull();
    saveRecovery(memory(), op);
    expect(readRecovery(storage, "http://another-backend").operation).toBeNull();
});
test("exact comparison transport accepts original historical retries without a live preview", async () => {
    const op = makeComparison(guardPreview(preview, view, command)), sent: RequestInit[] = [];
    const transport = (async (_url, init) => { sent.push(init!); return new Response(JSON.stringify(record), { status: 201, headers: { ETag: etag, Location: location, "Idempotency-Replayed": "true" } }); }) as typeof fetch;
    const receipt = await writeComparison(op, new AbortController().signal, transport);
    await writeComparison(op, new AbortController().signal, transport);
    expect(receipt.replayed).toBe(true);
    expect(sent[0].body).toBe(sent[1].body);
    expect(sent[0].headers).toEqual(sent[1].headers);
    expect(sent[0].headers).not.toHaveProperty("If-Match");
    const future = structuredClone(record);
    future.preview.calculation_version = "future";
    const original = await writeComparison(op, new AbortController().signal, (async () => new Response(JSON.stringify(future), { status: 201, headers: { ETag: etag, Location: location, "Idempotency-Replayed": "true" } })) as typeof fetch);
    expect(original.view.preview).toBeNull();
});
for (const [label, headers] of [["missing replay", { ETag: () => etag, Location: () => location }], ["external location", { ETag: () => etag, Location: () => "https://untrusted.example/result", "Idempotency-Replayed": () => "false" }]] as const)
    test(`malformed retain ${label} preserves uncertain outcome`, async () => {
        const op = makeComparison(guardPreview(preview, view, command));
        const h = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, v()]));
        await expect(writeComparison(op, new AbortController().signal, (async () => new Response(JSON.stringify(record), { status: 201, headers: h })) as typeof fetch)).rejects.toMatchObject({ certain: false });
    });
for (const [code, certain] of [["preview_changed", true], ["storage_upgrade_required", true], ["baseline_replay_mismatch", true], ["operation_conflict", false], ["unknown", false]] as const)
    test(`comparison 409 ${code} has explicit recovery certainty`, async () => {
        const op = makeComparison(guardPreview(preview, view, command));
        await expect(writeComparison(op, new AbortController().signal, (async () => new Response(JSON.stringify({ detail: { code, message: "Synthetic error" } }), { status: 409 })) as typeof fetch)).rejects.toMatchObject({ certain });
    });
test("bounded transport measures actual bytes despite misleading Content-Length", async () => {
    const op = makeComparison(guardPreview(preview, view, command));
    const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(MAX_RESPONSE)); c.enqueue(new Uint8Array([32])); c.close(); } });
    await expect(writeComparison(op, new AbortController().signal, (async () => new Response(stream, { status: 201, headers: { "Content-Length": "1" } })) as typeof fetch)).rejects.toMatchObject({ certain: false });
});
test("original transport verifies the requested comparison ID", async () => {
    await expect(fetchComparison(view.snapshot.case_id, randomUUID(), new AbortController().signal, (async () => new Response(JSON.stringify(record), { headers: { ETag: etag } })) as typeof fetch)).rejects.toThrow();
});
test("the comparison transport accepts exactly 16 MiB and rejects larger preview, list and detail reads", async () => {
    const content = JSON.stringify({ items: [], next_cursor: null });
    const exact = content + " ".repeat(MAX_RESPONSE - new TextEncoder().encode(content).length);
    const page = await fetchComparisons(view.snapshot.case_id, null, new AbortController().signal, (async () => new Response(exact, { headers: { "Content-Length": "999999999" } })) as typeof fetch);
    expect(page.items).toEqual([]);
    function oversize() { return new Response(new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(MAX_RESPONSE)); c.enqueue(new Uint8Array([32])); c.close(); } }), { headers: { "Content-Length": "1" } }); }
    const transport = (async () => oversize()) as typeof fetch;
    await expect(previewScenarios(view, command, new AbortController().signal, transport)).rejects.toThrow("exceeds 16 MiB");
    await expect(fetchComparisons(view.snapshot.case_id, null, new AbortController().signal, transport)).rejects.toThrow("exceeds 16 MiB");
    await expect(fetchComparison(view.snapshot.case_id, record.comparison_id, new AbortController().signal, transport)).rejects.toThrow("exceeds 16 MiB");
});
test("typed original guards preserve JSON depth bounds and retained factor policy", () => {
    const future = structuredClone(record); future.preview.calculation_version = "future";
    let nested: any = {}; for (let i = 0; i < 101; i++) nested = { next: nested }; future.preview.extra = nested;
    expect(() => guardComparison(future, etag)).toThrow("JSON depth");
    const altered = structuredClone(preview), scenario = altered.scenarios[0], factor = scenario.decision.factors.find((f: any) => f.name === "dscr");
    factor.threshold += 0.1; scenario.factor_changes.find((f: any) => f.name === "dscr").projected.threshold = factor.threshold;
    scenario.comparisons.find((c: any) => c.metric === "dscr").policy_headroom.approval_threshold = factor.threshold;
    expect(() => guardPreview(altered, view, command)).toThrow("retained policy");
});
