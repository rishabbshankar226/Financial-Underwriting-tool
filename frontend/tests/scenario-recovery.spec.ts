import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { guardPreview, type ScenarioPreview } from "../src/scenarioContracts";
import { makeComparison, makeCreate, RECOVERY_KEY } from "../src/caseRecovery";
import { SavedWriteController } from "../src/useSavedWrite";
const input = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated.json", import.meta.url), "utf8"));
let preview: ScenarioPreview, record: unknown, headers: Record<string, string>;
test.beforeAll(async ({ request }) => {
    const created = await request.post("http://127.0.0.1:8000/cases", { headers: { "Idempotency-Key": randomUUID() }, data: { input, rationale: "Recovery contract baseline" } });
    const baseline = await created.json(), path = `http://127.0.0.1:8000/cases/${baseline.case_id}/revisions/1`;
    const command = { schema_version: "commercial-scenario-preview-v1", baseline_run_id: baseline.run_id, scenarios: [{ scenario_key: "recovery", name: "Recovery example", rationale: "Synthetic recovery exercise", assumptions: { revenue_change: 0, cogs_change: 0, operating_expense_change: 0, proposed_rate_change_bps: 0 } }] };
    preview = guardPreview(await (await request.post(`${path}/scenarios/preview`, { data: command })).json());
    const saved = await request.post(`${path}/scenario-comparisons`, { headers: { "Idempotency-Key": randomUUID() }, data: { ...command, schema_version: "commercial-scenario-comparison-create-v1", expected_preview_fingerprint: preview.fingerprint.value } });
    expect(saved.status()).toBe(201);
    record = await saved.json();
    headers = { ETag: saved.headers().etag, Location: saved.headers().location, "Idempotency-Replayed": "false" };
});
class StorageFixture implements Storage {
    values = new Map<string, string>();
    failClear = false;
    failReadBack = false;
    get length() { return this.values.size; }
    key(index: number) { return [...this.values.keys()][index] ?? null; }
    clear() { this.values.clear(); }
    getItem(key: string) { const value = this.values.get(key) ?? null; return this.failReadBack && value ? "corrupted" : value; }
    setItem(key: string, value: string) { this.values.set(key, value); }
    removeItem(key: string) { if (this.failClear)
        throw new Error("Synthetic clear failure"); this.values.delete(key); }
}
function receipt() { return new Response(JSON.stringify(record), { status: 201, headers }); }
test("the shared controller reserves synchronously and prevents a second comparison or case write", async () => {
    const storage = new StorageFixture(), sent: RequestInit[] = [];
    let release!: (value: Response) => void;
    const transport = (async (_url: unknown, init: RequestInit) => { sent.push(init); return await new Promise<Response>(resolve => { release = resolve; }); }) as typeof fetch;
    const controller = new SavedWriteController(storage, transport), operation = makeComparison(preview);
    const pending = controller.start(operation);
    expect(controller.snapshot().inFlight).toBe(true);
    expect(() => controller.start(makeComparison(preview))).toThrow();
    expect(() => controller.start(makeCreate(input, "Second write"))).toThrow();
    expect(() => controller.retry()).toThrow();
    expect(sent).toHaveLength(1);
    expect(JSON.parse(storage.getItem(RECOVERY_KEY)!)).toEqual(operation);
    release(receipt());
    expect((await pending).kind).toBe("comparison");
    expect(controller.snapshot().operation).toBeNull();
    expect(storage.getItem(RECOVERY_KEY)).toBeNull();
});
test("a failed journal clear blocks new writes and exact retry uses the original command and UUID", async () => {
    const storage = new StorageFixture(), sent: RequestInit[] = [];
    const controller = new SavedWriteController(storage, (async (_url: unknown, init: RequestInit) => { sent.push(init); return receipt(); }) as typeof fetch);
    const operation = makeComparison(preview);
    storage.failClear = true;
    expect((await controller.start(operation)).kind).toBe("comparison");
    expect(controller.snapshot().operation).toEqual(operation);
    expect(controller.snapshot().recoveryError).toContain("could not clear");
    expect(() => controller.start(makeCreate(input, "Blocked by comparison"))).toThrow();
    storage.failClear = false;
    await controller.retry();
    expect(sent[0].body).toBe(sent[1].body);
    expect(sent[0].headers).toEqual(sent[1].headers);
    expect(controller.snapshot().operation).toBeNull();
});
test("closing the writer keeps recovery even if the transport ignores abort and later returns a receipt", async () => {
    const storage = new StorageFixture();
    let release!: (value: Response) => void;
    const controller = new SavedWriteController(storage, (async () => await new Promise<Response>(resolve => { release = resolve; })) as typeof fetch);
    const operation = makeComparison(preview), pending = controller.start(operation);
    controller.abort();
    release(receipt());
    await expect(pending).rejects.toMatchObject({ certain: false });
    expect(controller.snapshot().operation).toEqual(operation);
    expect(JSON.parse(storage.getItem(RECOVERY_KEY)!)).toEqual(operation);
});
test("invalid recovery and failed readback prevent transport before a new save", () => {
    let posts = 0;
    const storage = new StorageFixture();
    storage.setItem(RECOVERY_KEY, "invalid");
    const controller = new SavedWriteController(storage, (async () => { posts++; return receipt(); }) as typeof fetch);
    expect(() => controller.start(makeComparison(preview))).toThrow();
    expect(controller.snapshot().recoveryError).toBeTruthy();
    expect(posts).toBe(0);
    storage.clear();
    const fresh = new SavedWriteController(storage, (async () => { posts++; return receipt(); }) as typeof fetch);
    storage.failReadBack = true;
    expect(() => fresh.start(makeComparison(preview))).toThrow("Nothing was sent");
    expect(fresh.snapshot().recoveryError).toBeTruthy();
    expect(posts).toBe(0);
});
test("a pending case-write-v1 record occupies the same slot and keeps its exact body", () => {
    const storage = new StorageFixture(), operation = makeCreate(input, "Original old envelope");
    storage.setItem(RECOVERY_KEY, JSON.stringify(operation));
    const controller = new SavedWriteController(storage);
    expect(controller.snapshot().operation).toEqual(operation);
    expect(() => controller.start(makeComparison(preview))).toThrow();
    expect(controller.snapshot().operation?.body).toBe(operation.body);
});
test("only documented certain comparison failures clear tracking; an operation conflict requires review", async () => {
    const storage = new StorageFixture();
    const definite = new SavedWriteController(storage, (async () => new Response(JSON.stringify({ detail: { code: "baseline_unsupported", message: "Known pre-commit rejection" } }), { status: 409 })) as typeof fetch);
    await expect(definite.start(makeComparison(preview))).rejects.toMatchObject({ certain: true });
    expect(storage.getItem(RECOVERY_KEY)).toBeNull();
    const conflict = new SavedWriteController(storage, (async () => new Response(JSON.stringify({ detail: { code: "operation_conflict", message: "Review operation receipt" } }), { status: 409 })) as typeof fetch);
    const operation = makeComparison(preview);
    await expect(conflict.start(operation)).rejects.toMatchObject({ certain: false });
    expect(() => conflict.retry()).toThrow();
    expect(conflict.snapshot().operation).toEqual(operation);
    conflict.discard();
    expect(storage.getItem(RECOVERY_KEY)).toBeNull();
});
