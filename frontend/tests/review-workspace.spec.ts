import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { LOCATOR_KEY, RECOVERY_KEY, makeCreate } from "../src/caseRecovery";
import { COMPARISON_LOCATOR_KEY } from "../src/scenarioSelection";
import { apiBase } from "../src/api";
const input = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated.json", import.meta.url), "utf8"));
async function create(request: APIRequestContext) {
  const r = await request.post("http://127.0.0.1:8000/cases", { headers: { "Idempotency-Key": randomUUID() }, data: { input, rationale: "Synthetic review case" } });
  expect(r.status()).toBe(201);
  return { snapshot: await r.json(), etag: r.headers().etag };
}
async function retain(request: APIRequestContext, s: any) {
  const path = `http://127.0.0.1:8000/cases/${s.case_id}/revisions/${s.revision}`;
  const command = { schema_version: "commercial-scenario-preview-v1", baseline_run_id: s.run_id, scenarios: [{ scenario_key: "revenue", name: "Revenue −10%", rationale: "Synthetic downside", assumptions: { revenue_change: -0.1, cogs_change: 0, operating_expense_change: 0, proposed_rate_change_bps: 0 } }] };
  const p = await request.post(`${path}/scenarios/preview`, { data: command }); expect(p.status()).toBe(200);
  const r = await request.post(`${path}/scenario-comparisons`, { headers: { "Idempotency-Key": randomUUID() }, data: { ...command, schema_version: "commercial-scenario-comparison-create-v1", expected_preview_fingerprint: (await p.json()).fingerprint.value } }); expect(r.status()).toBe(201);
  return { record: await r.json(), etag: r.headers().etag };
}
async function open(page: Page, s: any, record?: any, pending = false) {
  await page.addInitScript(({ s, record, key, comparisonKey, base }) => {
    sessionStorage.setItem(key, JSON.stringify({ version: "case-selection-v1", apiBase: base, caseId: s.case_id, revision: s.revision }));
    if (record) sessionStorage.setItem(comparisonKey, JSON.stringify({ version: "comparison-selection-v1", apiBase: base, caseId: s.case_id, comparisonId: record.comparison_id }));
  }, { s, record, key: LOCATOR_KEY, comparisonKey: COMPARISON_LOCATOR_KEY, base: apiBase });
  await page.goto("/");
  if (pending) {
    await page.getByRole("button", { name: "Saved cases", exact: true }).click();
    await page.getByRole("button", { name: `Open ${s.normalized_input.borrower_name} case ${s.case_id}`, exact: true }).click();
  }
  await expect(page.locator(".savedContext")).toContainText(s.run_id);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Saved-run review", exact: true })).toBeVisible();
}
async function download(page: Page) {
  const received = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON review package", exact: true }).click();
  const file = await received, stream = (await file.createReadStream())!;
  const chunks: Buffer[] = []; for await (const part of stream) chunks.push(Buffer.from(part));
  return { text: Buffer.concat(chunks).toString("utf8"), name: file.suggestedFilename() };
}
test("Review explains the saved-original requirement for unsaved dated input", async ({ page }) => {
  await page.goto("/"); await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.locator(".reviewWorkspace")).toContainText("Save or open a dated commercial revision");
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeDisabled();
});
test("actual browser download contains the selected original and an identifier-only filename", async ({ page, request }) => {
  const original = await create(request); await open(page, original.snapshot);
  const result = await download(page), parsed = JSON.parse(result.text);
  expect(parsed.case).toEqual(original);
  expect(parsed.comparison).toBeNull();
  expect(result.name).toBe(`spreadline-case-${original.snapshot.case_id}-r1-${original.snapshot.run_id}.json`);
  await expect(page.getByRole("link", { name: "Download prepared JSON", exact: true })).toBeVisible();
  await expect(page.locator(".reviewWorkspace")).toContainText("Recorded hashes are carried unchanged");
});
test("retained comparison is unchecked until explicitly included and all evidence matches", async ({ page, request }) => {
  const original = await create(request), saved = await retain(request, original.snapshot);
  await open(page, original.snapshot, saved.record);
  const choice = page.getByLabel("Include this retained comparison");
  await expect(choice).toBeEnabled(); await expect(choice).not.toBeChecked();
  expect(JSON.parse((await download(page)).text).comparison).toBeNull();
  await choice.check();
  const file = await download(page);
  expect(JSON.parse(file.text).comparison).toEqual(saved);
  expect(file.name).toContain(`-comparison-${saved.record.comparison_id}.json`);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
});
test("later server edit preserves earlier revision bytes and does not refetch for export", async ({ page, request }) => {
  const original = await create(request); await open(page, original.snapshot);
  const before = await download(page);
  const edited = await request.post(`http://127.0.0.1:8000/cases/${original.snapshot.case_id}/revisions`, { headers: { "Idempotency-Key": randomUUID(), "If-Match": original.etag }, data: { field_path: "/years/1/gross_receipts", new_value: 1, rationale: "Later synthetic revision" } }); expect(edited.status()).toBe(201);
  let requests = 0; page.on("request", r => { if (new URL(r.url()).port === "8000") requests++; });
  const after = await download(page);
  expect(after).toEqual(before);
  expect(requests).toBe(0);
});
test("same-case comparison on another revision requires explicit baseline navigation", async ({ page, request }) => {
  const original = await create(request), saved = await retain(request, original.snapshot);
  const edited = await request.post(`http://127.0.0.1:8000/cases/${original.snapshot.case_id}/revisions`, { headers: { "Idempotency-Key": randomUUID(), "If-Match": original.etag }, data: { field_path: "/years/1/gross_receipts", new_value: 4000000, rationale: "Different synthetic baseline" } }); expect(edited.status()).toBe(201);
  const newer = await edited.json(); await open(page, newer, saved.record);
  await expect(page.getByLabel("Include this retained comparison")).toBeDisabled();
  await expect(page.locator(".reviewWorkspace")).toContainText("different original baseline");
  expect(JSON.parse((await download(page)).text).case.snapshot).toEqual(newer);
  await page.getByRole("button", { name: "Open comparison baseline revision", exact: true }).click();
  await expect(page.locator(".savedContext")).toContainText(original.snapshot.run_id);
  await expect(page.getByLabel("Include this retained comparison")).toBeEnabled();
  await expect(page.getByLabel("Include this retained comparison")).not.toBeChecked();
});
test("known storage with unsupported financial definitions exports the original without typed conclusions", async ({ page, request }) => {
  const original = await create(request); original.snapshot.assessment.calculation_version = "future-definition";
  await page.route(`**/cases/${original.snapshot.case_id}/revisions/1`, route => route.fulfill({ status: 200, contentType: "application/json", headers: { ETag: original.etag, "Access-Control-Allow-Origin": "http://127.0.0.1:5173", "Access-Control-Expose-Headers": "ETag" }, body: JSON.stringify(original.snapshot) }));
  await open(page, original.snapshot);
  await expect(page.locator(".reviewWorkspace")).toContainText("Original JSON only");
  expect(JSON.parse((await download(page)).text).case).toEqual(original);
  await expect(page.locator(".reviewMetrics")).toHaveCount(0);
});
test("pending recovery remains byte-identical while a current original is exported", async ({ page, request }) => {
  const original = await create(request), pending = JSON.stringify(makeCreate(input, "Pending synthetic other case"));
  await page.addInitScript(({ key, pending }) => sessionStorage.setItem(key, pending), { key: RECOVERY_KEY, pending });
  let posts = 0; page.on("request", r => { if (r.method() === "POST") posts++; });
  await open(page, original.snapshot, undefined, true);
  await expect(page.locator(".reviewWorkspace")).toContainText("Pending work is excluded");
  const parsed = JSON.parse((await download(page)).text);
  expect(parsed.case).toEqual(original);
  expect(await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY)).toBe(pending);
  expect(posts).toBe(0);
});
test("keyboard and mobile review/download remain readable with a clean console", async ({ page, request }, info) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (["warning", "error"].includes(m.type())) errors.push(m.text()); });
  const original = await create(request), saved = await retain(request, original.snapshot);
  await page.setViewportSize({ width: 390, height: 844 }); await open(page, original.snapshot, saved.record);
  const choice = page.getByLabel("Include this retained comparison"); await expect(choice).toBeEnabled(); await choice.focus(); await page.keyboard.press("Space"); await expect(choice).toBeChecked();
  await download(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("review-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 }); await page.screenshot({ path: info.outputPath("review-desktop.png"), fullPage: true });
  expect(errors).toEqual([]);
});
test("failed read with a stale saved object disables export until an original is ready again", async ({ page, request }) => {
  const original = await create(request); await open(page, original.snapshot);
  await download(page);
  await page.route(`**/cases/${original.snapshot.case_id}`, route => route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ detail: { code: "case_not_found", message: "Synthetic unavailable original" } }) }));
  await page.getByRole("button", { name: "Open latest", exact: true }).click();
  await expect(page.locator(".savedContext")).toContainText("inactive");
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Download prepared JSON", exact: true })).toHaveCount(0);
});
test("legacy input has no saved-original JSON export", async ({ page }) => {
  await page.goto("/"); await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Legacy Alpine demo", exact: true }).click();
  await expect(page.locator("header")).toContainText("Legacy");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeDisabled();
});
async function delayedWorker(page: Page) {
  await page.addInitScript(() => {
    const Native = Worker, setter = Object.getOwnPropertyDescriptor(Native.prototype, "onmessage")!.set!;
    class Delayed extends Native {
      set onmessage(callback: any) { setter.call(this, (event: any) => { (window as any).__releaseReview = () => callback(event); }); }
      terminate() { /* Deliberately ignore cancellation to test obsolete completion. */ }
    }
    window.Worker = Delayed;
  });
}
for (const action of ["close", "inclusion", "new selection"] as const) test(`late completion cannot download after ${action}`, async ({ page, request }) => {
  await delayedWorker(page);
  const original = await create(request), saved = await retain(request, original.snapshot);
  await open(page, original.snapshot, saved.record);
  await expect(page.getByLabel("Include this retained comparison")).toBeEnabled();
  let downloads = 0; page.on("download", () => downloads++);
  await page.getByRole("button", { name: "Download JSON review package", exact: true }).click();
  await expect.poll(() => page.evaluate(() => typeof (window as any).__releaseReview)).toBe("function");
  if (action === "close") await page.getByRole("button", { name: "spread", exact: true }).click();
  else if (action === "inclusion") await page.getByLabel("Include this retained comparison").check();
  else { await page.getByRole("button", { name: "Dated Alpine demo", exact: true }).click(); await expect(page.locator(".savedContext")).toHaveCount(0); }
  await page.evaluate(() => (window as any).__releaseReview());
  await expect(page.getByRole("link", { name: "Download prepared JSON", exact: true })).toHaveCount(0);
  expect(downloads).toBe(0);
});
test("superseded and closed downloads release their object URLs", async ({ page, request }) => {
  await page.addInitScript(() => {
    const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
    (window as any).__reviewUrls = { created: [] as string[], revoked: [] as string[] };
    URL.createObjectURL = value => { const url = create(value); (window as any).__reviewUrls.created.push(url); return url; };
    URL.revokeObjectURL = value => { (window as any).__reviewUrls.revoked.push(value); revoke(value); };
  });
  const original = await create(request); await open(page, original.snapshot);
  await download(page); await download(page);
  let result = await page.evaluate(() => (window as any).__reviewUrls);
  expect(result.created).toHaveLength(2); expect(result.revoked).toEqual([result.created[0]]);
  await page.getByRole("button", { name: "spread", exact: true }).click();
  result = await page.evaluate(() => (window as any).__reviewUrls);
  expect(result.revoked).toEqual(result.created);
});
test("worker validation failure keeps opted-in evidence visible and offers no partial file", async ({ page, request }) => {
  await page.addInitScript(() => {
    const send = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (value: any, ...args: any[]) {
      if (value.comparison) value.comparison.record.preview.baseline.payload_hash = "a".repeat(64);
      return send.call(this, value, ...args as []);
    };
  });
  const original = await create(request), saved = await retain(request, original.snapshot);
  await open(page, original.snapshot, saved.record);
  await page.getByLabel("Include this retained comparison").check();
  let downloads = 0; page.on("download", () => downloads++);
  await page.getByRole("button", { name: "Download JSON review package", exact: true }).click();
  await expect(page.locator(".reviewExport").getByRole("alert")).toContainText("must match");
  await expect(page.getByLabel("Include this retained comparison")).toBeChecked();
  await expect(page.getByRole("link", { name: "Download prepared JSON", exact: true })).toHaveCount(0);
  expect(downloads).toBe(0);
});
test("oversized known original stays selected and produces neither a truncated file nor a giant review DOM", async ({ page, request }, info) => {
  const original = await create(request);
  original.snapshot.assessment.calculation_version = "future-definition";
  original.snapshot.assessment.extra = "é".repeat(9000000);
  await page.route(`**/cases/${original.snapshot.case_id}/revisions/1`, route => route.fulfill({ status: 200, contentType: "application/json", headers: { ETag: original.etag, "Access-Control-Allow-Origin": "http://127.0.0.1:5173", "Access-Control-Expose-Headers": "ETag" }, body: JSON.stringify(original.snapshot) }));
  await open(page, original.snapshot);
  expect(await page.locator("main").evaluate(element => element.textContent!.length)).toBeLessThan(80000);
  await page.evaluate(() => {
    (window as any).__reviewPerformance = { frames: 0, longTasks: [] as number[], stopped: false };
    const sample = (window as any).__reviewPerformance;
    new PerformanceObserver(list => { for (const entry of list.getEntries()) sample.longTasks.push(entry.duration); }).observe({ type: "longtask", buffered: false });
    const frame = () => { if (!sample.stopped) { sample.frames++; requestAnimationFrame(frame); } }; requestAnimationFrame(frame);
  });
  let downloads = 0; page.on("download", () => downloads++);
  await page.getByRole("button", { name: "Download JSON review package", exact: true }).click();
  await expect(page.locator(".reviewExport").getByRole("alert")).toContainText("exceeds 16 MiB");
  await expect(page.locator(".savedContext")).toContainText(original.snapshot.run_id);
  expect(downloads).toBe(0);
  const performance = await page.evaluate(() => { const v = (window as any).__reviewPerformance; v.stopped = true; return { frames: v.frames, longTasksMs: v.longTasks }; });
  expect(performance.frames).toBeGreaterThan(1);
  await info.attach("review-large-preparation-performance", { body: JSON.stringify(performance), contentType: "application/json" });
});
test("malformed worker completion fails visibly without an exception or download", async ({ page, request }) => {
  await page.addInitScript(() => {
    const Native = Worker, setter = Object.getOwnPropertyDescriptor(Native.prototype, "onmessage")!.set!;
    class Malformed extends Native {
      set onmessage(callback: any) { setter.call(this, () => callback({ data: null })); }
    }
    window.Worker = Malformed;
  });
  const original = await create(request); await open(page, original.snapshot);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  let downloads = 0; page.on("download", () => downloads++);
  await page.getByRole("button", { name: "Download JSON review package", exact: true }).click();
  await expect(page.locator(".reviewExport").getByRole("alert")).toContainText("invalid file");
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeEnabled();
  expect(errors).toEqual([]); expect(downloads).toBe(0);
});
test("preparation stays disabled for repeated clicks until the one active worker finishes", async ({ page, request }) => {
  await delayedWorker(page);
  await page.addInitScript(() => {
    const Native = Worker; (window as any).__workersCreated = 0;
    window.Worker = class extends Native { constructor(url: string | URL, options?: WorkerOptions) { super(url, options); (window as any).__workersCreated++; } };
  });
  const original = await create(request); await open(page, original.snapshot);
  const button = page.getByRole("button", { name: "Download JSON review package", exact: true });
  await button.click(); await expect(button).toBeDisabled();
  await button.dispatchEvent("click");
  expect(await page.evaluate(() => (window as any).__workersCreated)).toBe(1);
  await expect.poll(() => page.evaluate(() => typeof (window as any).__releaseReview)).toBe("function");
  const received = page.waitForEvent("download"); await page.evaluate(() => (window as any).__releaseReview()); await received;
  await expect(button).toBeEnabled();
});
test("pending original reads cannot expose a stale export", async ({ page, request }) => {
  const original = await create(request); await open(page, original.snapshot);
  let release!: () => void, entered!: () => void;
  const held = new Promise<void>(r => release = r), started = new Promise<void>(r => entered = r);
  await page.route(`**/cases/${original.snapshot.case_id}`, async route => { const response = await route.fetch(); entered(); await held; await route.fulfill({ response }); });
  await page.getByRole("button", { name: "Open latest", exact: true }).click(); await started;
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeDisabled();
  await expect(page.locator(".reviewMetrics")).toHaveCount(0);
  release();
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeEnabled();
});
test("initial evaluation has no export source", async ({ page }) => {
  let release!: () => void, entered!: () => void;
  const held = new Promise<void>(r => release = r), started = new Promise<void>(r => entered = r);
  await page.route("**/commercial/assessment", async route => { const response = await route.fetch(); entered(); await held; await route.fulfill({ response }); });
  await page.goto("/"); await started;
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeDisabled();
  await expect(page.locator(".reviewMetrics")).toHaveCount(0);
  release(); await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(page.getByRole("button", { name: "Download JSON review package", exact: true })).toBeDisabled();
});
