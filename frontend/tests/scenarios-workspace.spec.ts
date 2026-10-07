import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { RECOVERY_KEY } from "../src/caseRecovery";
const dated = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated.json", import.meta.url), "utf8"));
async function create(request: APIRequestContext, input = dated) {
    const result = await request.post("http://127.0.0.1:8000/cases", { headers: { "Idempotency-Key": randomUUID() }, data: { input, rationale: "Synthetic browser case" } });
    expect(result.status()).toBe(201);
    return await result.json();
}
async function retain(request: APIRequestContext, original: any, name: string) {
    const path = `http://127.0.0.1:8000/cases/${original.case_id}/revisions/${original.revision}`;
    const command = { schema_version: "commercial-scenario-preview-v1", baseline_run_id: original.run_id, scenarios: [{ scenario_key: "archive", name, rationale: "Synthetic archive review", assumptions: { revenue_change: 0, cogs_change: 0, operating_expense_change: 0, proposed_rate_change_bps: 0 } }] };
    const previewed = await request.post(`${path}/scenarios/preview`, { data: command });
    expect(previewed.status()).toBe(200);
    const result = await request.post(`${path}/scenario-comparisons`, { headers: { "Idempotency-Key": randomUUID() }, data: { ...command, schema_version: "commercial-scenario-comparison-create-v1", expected_preview_fingerprint: (await previewed.json()).fingerprint.value } });
    expect(result.status()).toBe(201);
    return { record: await result.json(), headers: result.headers() };
}
async function baseline(page: Page) {
    await page.goto("/");
    await expect(page.locator(".decision strong")).toHaveText("APPROVE");
    await page.getByRole("button", { name: "Save case", exact: true }).click();
    await page.getByLabel("Save rationale").fill("Synthetic scenario baseline");
    const saved = page.waitForResponse(r => new URL(r.url()).pathname === "/cases" && r.request().method() === "POST" && r.status() === 201);
    await page.getByRole("button", { name: "Save accepted case", exact: true }).click();
    const original = await (await saved).json();
    await expect(page.locator(".savedContext")).toContainText("Latest when fetched");
    await page.getByRole("button", { name: "Scenarios", exact: true }).click();
    return original;
}
async function preview(page: Page) {
    await page.getByLabel("Scenario 1 preset").selectOption("revenue");
    await page.getByLabel("Scenario 1 rationale").fill("Review revenue downside; other assumptions fixed");
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeEnabled();
}
test("preview and one retained batch preserve the original assessment and reopen without recalculation", async ({ page, request }) => {
    const original = await baseline(page);
    await preview(page);
    await expect(page.locator(".scenarioResult")).toContainText("3,000.00");
    await expect(page.locator(".scenarioResult")).toContainText("210,000.00");
    await expect(page.locator(".scenarioResult")).toContainText("stable");
    await expect(page.locator(".decision strong")).toHaveText("APPROVE");
    const saved = page.waitForResponse(r => r.url().endsWith("/scenario-comparisons") && r.request().method() === "POST" && r.status() === 201);
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    const record = await (await saved).json();
    await expect(page.locator(".comparisonContext")).toContainText(record.comparison_id);
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeDisabled();
    const latest = await (await request.get(`http://127.0.0.1:8000/cases/${original.case_id}`)).json();
    expect(latest).toEqual(original);
    await page.reload();
    await page.getByRole("button", { name: "Scenarios", exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText(record.comparison_id);
    expect((await (await request.get(`http://127.0.0.1:8000/cases/${original.case_id}/scenario-comparisons`)).json()).items).toHaveLength(1);
});
test("name or rationale changes invalidate a preview even when returned to equal text", async ({ page }) => {
    await baseline(page);
    await preview(page);
    const reason = "Review revenue downside; other assumptions fixed";
    await page.getByLabel("Scenario 1 rationale").fill("Changed reason");
    await page.getByLabel("Scenario 1 rationale").fill(reason);
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeEnabled();
});
test("a delayed preview cannot become current after the draft changes", async ({ page }) => {
    await baseline(page);
    let release!: () => void;
    const held = new Promise<void>(r => release = r);
    let entered!: () => void;
    const started = new Promise<void>(r => entered = r);
    await page.route("**/scenarios/preview", async (route) => { const response = await route.fetch(); entered(); await held; await route.fulfill({ response }).catch(() => { }); });
    await page.getByLabel("Scenario 1 rationale").fill("Initial downside");
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
    await started;
    await page.getByLabel("Scenario 1 name").fill("Newer draft");
    release();
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeDisabled();
    await expect(page.locator(".scenarioComposer")).toContainText("Preview required");
});
test("lost comparison receipt survives reload and blocks other saves until exact recovery", async ({ page, request }) => {
    const original = await baseline(page);
    await preview(page);
    let originalBody = "", originalKey = "";
    await page.route("**/scenario-comparisons", async (route) => { if (route.request().method() !== "POST")
        return route.continue(); originalBody = route.request().postData()!; originalKey = route.request().headers()["idempotency-key"]; await route.fetch(); await route.abort("failed"); });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toBeEnabled();
    await page.reload();
    let posts = 0;
    page.on("request", r => { if (r.method() === "POST" && r.url().endsWith("/scenario-comparisons"))
        posts++; });
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toBeEnabled();
    expect(posts).toBe(0);
    await expect(page.locator(".savedContext")).toContainText(original.run_id);
    await expect(page.getByRole("button", { name: "Edit Gross receipts for 2025-01-01 – 2025-12-31", exact: true })).toBeDisabled();
    await page.unroute("**/scenario-comparisons");
    let retryBody = "", retryKey = "";
    await page.route("**/scenario-comparisons", async (route) => { if (route.request().method() === "POST") {
        retryBody = route.request().postData()!;
        retryKey = route.request().headers()["idempotency-key"];
    } await route.continue(); });
    await page.getByRole("button", { name: "Retry exact write", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
    expect(retryBody).toBe(originalBody);
    expect(retryKey).toBe(originalKey);
    expect((await (await request.get(`http://127.0.0.1:8000/cases/${original.case_id}/scenario-comparisons`)).json()).items).toHaveLength(1);
    await page.getByRole("button", { name: "Scenarios", exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
});
test("comparison tracking preflight failure sends no save and preserves the baseline", async ({ page }) => {
    const original = await baseline(page);
    await preview(page);
    let saves = 0;
    page.on("request", r => { if (r.method() === "POST" && r.url().endsWith("/scenario-comparisons"))
        saves++; });
    await page.evaluate(key => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === key)
        throw new Error("Synthetic quota"); return original.call(this, k, v); }; }, RECOVERY_KEY);
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Nothing was sent");
    expect(saves).toBe(0);
    await expect(page.locator(".savedContext")).toContainText(original.run_id);
});
test("documented preview-changed and upgrade errors require explicit new review and never upgrade", async ({ page }) => {
    await baseline(page);
    await preview(page);
    let saves = 0;
    await page.route("**/scenario-comparisons", async (route) => { if (route.request().method() !== "POST")
        return route.continue(); saves++; await route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ detail: { code: "preview_changed", message: "Preview changed; review again" } }) }); });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeDisabled();
    expect(saves).toBe(1);
    await page.unroute("**/scenario-comparisons");
    await preview(page);
    await page.route("**/scenario-comparisons", async (route) => { if (route.request().method() !== "POST")
        return route.continue(); await route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ detail: { code: "storage_upgrade_required", message: "Comparison retention requires schema v2" } }) }); });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.locator(".scenarioComposer")).toContainText("copy upgrade");
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
});
test("scenario controls and original details work with keyboard and mobile layout", async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (["error", "warning"].includes(m.type()))
        errors.push(m.text()); });
    await baseline(page);
    await page.getByRole("button", { name: "Add scenario", exact: true }).click();
    await expect(page.getByLabel("Scenario 2 name")).toBeFocused();
    await page.getByRole("button", { name: "Remove scenario 2", exact: true }).click();
    await expect(page.getByRole("button", { name: "Add scenario", exact: true })).toBeFocused();
    await preview(page);
    for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.screenshot({ path: info.outputPath(`scenario-preview-${width}.png`), fullPage: true });
    }
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
    await page.screenshot({ path: info.outputPath("scenario-saved-390.png"), fullPage: true });
    expect(errors).toEqual([]);
});
test("a comparison acknowledgment after changing cases offers its original record without replacing the selection", async ({ page }) => {
    await baseline(page);
    await preview(page);
    let release!: () => void, entered!: () => void;
    const held = new Promise<void>(resolve => release = resolve), started = new Promise<void>(resolve => entered = resolve);
    await page.route("**/scenario-comparisons", async (route) => {
        if (route.request().method() !== "POST")
            return route.continue();
        const response = await route.fetch();
        entered();
        await held;
        await route.fulfill({ response });
    });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await started;
    await page.getByRole("button", { name: "Legacy Alpine demo", exact: true }).click();
    await expect(page.getByText("Legacy · undated input", { exact: true })).toBeVisible();
    release();
    await expect(page.getByRole("button", { name: "Open acknowledged comparison", exact: true })).toBeVisible();
    await expect(page.getByText("Legacy · undated input", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Open acknowledged comparison", exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
});
test("a historical revision stays the explicit baseline after the case head advances", async ({ page, request }) => {
    const original = await baseline(page);
    const saved = await request.get(`http://127.0.0.1:8000/cases/${original.case_id}`);
    const edited = await request.post(`http://127.0.0.1:8000/cases/${original.case_id}/revisions`, { headers: { "Idempotency-Key": randomUUID(), "If-Match": saved.headers().etag }, data: { field_path: "/proposed_loan/amount", new_value: 1200000, rationale: "Synthetic later revision" } });
    expect(edited.status()).toBe(201);
    await preview(page);
    const written = page.waitForResponse(r => r.request().method() === "POST" && r.url().endsWith("/scenario-comparisons"));
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    const record = await (await written).json();
    expect(record.baseline_revision).toBe(1);
    expect(record.baseline_run_id).toBe(original.run_id);
    await page.getByRole("button", { name: "Open baseline revision", exact: true }).click();
    await expect(page.locator(".savedContext")).toContainText("Historical revision 1");
    expect((await (await request.get(`http://127.0.0.1:8000/cases/${original.case_id}`)).json()).revision).toBe(2);
});
test("archive pages include all case baselines and original detail GET performs no new preview", async ({ page, request }) => {
    const original = await baseline(page);
    const records = [];
    for (let i = 1; i <= 26; i++)
        records.push((await retain(request, original, `Archive ${i}`)).record);
    await page.getByRole("button", { name: "Refresh comparisons", exact: true }).click();
    await expect(page.locator(".comparisonArchive .caseRow")).toHaveCount(25);
    await page.getByRole("button", { name: "Load more comparisons", exact: true }).click();
    await expect(page.locator(".comparisonArchive .caseRow")).toHaveCount(26);
    let previews = 0;
    page.on("request", r => { if (r.url().endsWith("/scenarios/preview"))
        previews++; });
    await page.getByRole("button", { name: `Open comparison ${records[0].comparison_id}`, exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText(records[0].comparison_id);
    expect(previews).toBe(0);
});
test("operation conflicts keep the key until explicit discard review and Escape preserves recovery", async ({ page }) => {
    await baseline(page);
    await preview(page);
    await page.route("**/scenario-comparisons", async (route) => {
        if (route.request().method() !== "POST")
            return route.continue();
        await route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ detail: { code: "operation_conflict", message: "Review operation conflict" } }) });
    });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toBeDisabled();
    const journal = await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY);
    await page.getByRole("button", { name: "Review discarding tracking", exact: true }).click();
    await page.getByRole("dialog").press("Escape");
    expect(await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY)).toBe(journal);
    await expect(page.getByRole("button", { name: "Review discarding tracking", exact: true })).toBeFocused();
    await page.getByRole("button", { name: "Review discarding tracking", exact: true }).click();
    await page.getByRole("button", { name: "Discard tracking", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
    expect(await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY)).toBeNull();
});
test("blank shocks block preview, fractional basis points convert once, and ten normalized rows retain one ordered batch", async ({ page }) => {
    await baseline(page);
    await page.getByLabel("Scenario 1 rationale").fill("Unicode review 😀");
    await page.getByLabel("Scenario 1 Revenue change (%)").fill("");
    let posts = 0, command: any;
    page.on("request", r => { if (r.url().endsWith("/scenarios/preview")) {
        posts++;
        command = r.postDataJSON();
    } });
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    expect(posts).toBe(0);
    await page.getByLabel("Scenario 1 Revenue change (%)").fill("-10");
    await page.getByLabel("Scenario 1 Proposed rate change (bps)").fill("200.5");
    await page.getByLabel("Scenario 1 name").fill("\u0085😀\u0085");
    for (let i = 2; i <= 10; i++) {
        await page.getByRole("button", { name: "Add scenario", exact: true }).click();
        await page.getByLabel(`Scenario ${i} rationale`).fill(`Review ${i}`);
    }
    await expect(page.getByRole("button", { name: "Add scenario", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeEnabled();
    expect(command.scenarios).toHaveLength(10);
    expect(command.scenarios[0].name).toBe("😀");
    expect(command.scenarios[0].assumptions.revenue_change).toBe(-0.1);
    expect(command.scenarios[0].assumptions.proposed_rate_change_bps).toBe(200.5);
    expect(new Set(command.scenarios.map((s: any) => s.scenario_key)).size).toBe(10);
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
    await expect(page.getByLabel("Reviewed scenario", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Reviewed scenario", { exact: true }).locator("option")).toHaveCount(10);
});
test("unsupported stored financial definitions remain original JSON without a typed projection", async ({ page, request }) => {
    const original = await baseline(page), stored = await retain(request, original, "Future definition example");
    const future = structuredClone(stored.record);
    future.preview.calculation_version = "future-financial-definition";
    await page.route(`**/scenario-comparisons/${future.comparison_id}`, async (route) => route.fulfill({ response: await route.fetch(), json: future }));
    await page.getByRole("button", { name: "Refresh comparisons", exact: true }).click();
    await page.getByRole("button", { name: `Open comparison ${future.comparison_id}`, exact: true }).click();
    await expect(page.locator(".originalComparison")).toContainText("future-financial-definition");
    await expect(page.locator(".originalComparison .scenarioResult")).toHaveCount(0);
    await page.getByText("Original comparison JSON", { exact: true }).click();
    await expect(page.locator(".originalComparisonJson")).toContainText('"persisted": true');
});
test("large originals render only opened trace and guarantor pages and bound JSON text pages", async ({ page, request }) => {
    const input = structuredClone(dated);
    input.borrower_name = "Synthetic paged comparison";
    input.guarantors = Array.from({ length: 60 }, (_, i) => ({ ...dated.guarantors[0], ownership_percentage: 0.01, name: `Guarantor ${i + 1} 😀` }));
    const original = await create(request, input), stored = await retain(request, original, "Paged projection");
    await page.goto("/");
    await page.getByRole("button", { name: "Saved cases", exact: true }).click();
    await page.getByRole("button", { name: `Open ${input.borrower_name} case ${original.case_id}`, exact: true }).click();
    await expect(page.locator(".savedContext")).toContainText(original.run_id);
    await page.getByRole("button", { name: "Scenarios", exact: true }).click();
    await page.getByRole("button", { name: `Open comparison ${stored.record.comparison_id}`, exact: true }).click();
    await expect(page.locator('[aria-label="trace"]')).toHaveCount(0);
    await page.getByText("Calculation trace", { exact: true }).click();
    await expect(page.locator('[aria-label="trace"] > details')).toHaveCount(50);
    await page.getByRole("button", { name: "Next trace page", exact: true }).click();
    await expect(page.locator('[aria-label="trace"]')).toContainText("Page 2");
    await page.getByText("Projected guarantor contributions", { exact: true }).click();
    await expect(page.locator('[aria-label="guarantors"] .scenarioFact')).toHaveCount(50);
    await page.getByRole("button", { name: "Next guarantors page", exact: true }).click();
    await expect(page.locator('[aria-label="guarantors"] .scenarioFact')).toHaveCount(10);
    await page.getByText("Original comparison JSON", { exact: true }).click();
    expect(await page.locator(".originalComparisonJson pre").evaluate(element => new TextEncoder().encode(element.textContent!).length)).toBeLessThanOrEqual(65536);
    await page.getByRole("button", { name: "Next JSON page", exact: true }).click();
    await expect(page.locator(".originalComparisonJson")).toContainText("page 2");
    await page.setViewportSize({ width: 390, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("unsaved dated authoring asks for a saved baseline and legacy cannot invoke saving", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".decision strong")).toHaveText("APPROVE");
    await page.getByRole("button", { name: "Scenarios", exact: true }).click();
    await page.getByRole("button", { name: "Save baseline case", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").press("Escape");
    await page.getByRole("button", { name: "Legacy Alpine demo", exact: true }).click();
    await expect(page.getByText("Legacy · undated input", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save baseline case", exact: true })).toBeDisabled();
});
test("opening an archived original consumes the active review and a saved batch needs an explicit new draft", async ({ page, request }) => {
    const original = await baseline(page), stored = await retain(request, original, "Original archive choice");
    await preview(page);
    await page.getByRole("button", { name: "Refresh comparisons", exact: true }).click();
    await page.getByRole("button", { name: `Open comparison ${stored.record.comparison_id}`, exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText(stored.record.comparison_id);
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Preview scenarios", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Start another comparison", exact: true }).click();
    await expect(page.getByLabel("Scenario 1 name")).toHaveValue("Scenario 1");
    await expect(page.getByRole("button", { name: "Preview scenarios", exact: true })).toBeEnabled();
    await preview(page); await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
    await expect(page.getByRole("button", { name: "Preview scenarios", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Start another comparison", exact: true }).click(); await preview(page);
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.locator(".comparisonArchive .caseRow")).toHaveCount(3);
});
test("recovering an earlier comparison preserves a newer draft and offers the acknowledged original", async ({ page }) => {
    await baseline(page); await preview(page);
    await page.route("**/scenario-comparisons", async route => {
        if (route.request().method() !== "POST") return route.continue();
        await route.fetch(); await route.abort("failed");
    });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Start another comparison", exact: true }).click();
    await page.getByLabel("Scenario 1 name").fill("Newer unsaved draft"); await page.getByLabel("Scenario 1 rationale").fill("Separate synthetic review");
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click(); await expect(page.locator(".scenarioResult")).toContainText("Newer unsaved draft");
    await page.unroute("**/scenario-comparisons"); await page.getByRole("button", { name: "Retry exact write", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open acknowledged comparison", exact: true })).toBeVisible();
    await expect(page.locator(".comparisonContext")).toHaveCount(0); await expect(page.locator(".scenarioResult")).toContainText("Newer unsaved draft");
    await expect(page.getByRole("button", { name: "Save reviewed comparison", exact: true })).toBeEnabled();
});
test("a malformed success keeps the original comparison key after commit and retry returns exactly one record", async ({ page, request }) => {
    const original = await baseline(page); await preview(page);
    await page.route("**/scenario-comparisons", async route => {
        if (route.request().method() !== "POST") return route.continue();
        const response = await route.fetch(); await route.fulfill({ response, headers: { ...response.headers(), location: "https://untrusted.example/receipt" } });
    });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toBeEnabled();
    const operation = JSON.parse((await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY))!);
    await page.unroute("**/scenario-comparisons");
    let body = "", key = ""; page.on("request", r => { if (r.method() === "POST" && r.url().endsWith("/scenario-comparisons")) { body = r.postData()!; key = r.headers()["idempotency-key"]; } });
    await page.getByRole("button", { name: "Retry exact write", exact: true }).click(); await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
    expect(body).toBe(operation.body); expect(key).toBe(operation.id);
    expect((await (await request.get(`http://127.0.0.1:8000/cases/${original.case_id}/scenario-comparisons`)).json()).items).toHaveLength(1);
});
test("503 exposes Retry-After, keeps exact tracking and never retries automatically", async ({ page }) => {
    await baseline(page); await preview(page); let posts = 0;
    await page.route("**/scenario-comparisons", async route => {
        if (route.request().method() !== "POST") return route.continue(); posts++;
        await route.fulfill({ status: 503, contentType: "application/json", headers: { "Retry-After": "3", "Access-Control-Expose-Headers": "Retry-After" }, body: JSON.stringify({ detail: { code: "storage_busy", message: "Synthetic busy database" } }) });
    });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("region", { name: "Saved write recovery", exact: true })).toContainText("Retry after 3");
    const operation = await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY);
    await page.getByRole("button", { name: "details", exact: true }).click(); await page.getByRole("button", { name: "Scenarios", exact: true }).click();
    expect(posts).toBe(1); expect(await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY)).toBe(operation);
    await page.unroute("**/scenario-comparisons"); await page.getByRole("button", { name: "Retry exact write", exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
});
test("an obsolete original detail cannot replace a newer archive selection and cursor cycles fail visibly", async ({ page, request }) => {
    const original = await baseline(page), first = await retain(request, original, "First original"), second = await retain(request, original, "Second original");
    await page.getByRole("button", { name: "Refresh comparisons", exact: true }).click();
    let release!: () => void, entered!: () => void;
    const held = new Promise<void>(resolve => release = resolve), started = new Promise<void>(resolve => entered = resolve);
    await page.route(`**/scenario-comparisons/${first.record.comparison_id}`, async route => { const response = await route.fetch(); entered(); await held; await route.fulfill({ response }).catch(() => {}); });
    await page.getByRole("button", { name: `Open comparison ${first.record.comparison_id}`, exact: true }).click(); await started;
    await page.getByRole("button", { name: `Open comparison ${second.record.comparison_id}`, exact: true }).click();
    await expect(page.locator(".comparisonContext")).toContainText(second.record.comparison_id); release(); await expect(page.locator(".comparisonContext")).toContainText(second.record.comparison_id);
    await page.route("**/scenario-comparisons?*", async route => { const response = await route.fetch({ url: `http://127.0.0.1:8000/cases/${original.case_id}/scenario-comparisons?limit=25` }), body = await response.json(); body.next_cursor = "cycle"; await route.fulfill({ response, json: body }); });
    await page.getByRole("button", { name: "Refresh comparisons", exact: true }).click(); await page.getByRole("button", { name: "Load more comparisons", exact: true }).click();
    await expect(page.locator(".comparisonArchive")).toContainText("repeated cursor");
    await page.unroute("**/scenario-comparisons?*"); await page.getByRole("button", { name: "Refresh comparisons", exact: true }).click();
    await expect(page.locator(".comparisonArchive [role=alert]")).toHaveCount(0); await expect(page.locator(".comparisonArchive .caseRow")).toHaveCount(2);
});
test("an unsupported baseline still exposes its case archive and original comparison JSON", async ({ page, request }) => {
    const input = structuredClone(dated); input.borrower_name = "Synthetic future baseline";
    const original = await create(request, input), stored = await retain(request, original, "Original supported comparison");
    await page.route(`**/cases/${original.case_id}`, async route => { const response = await route.fetch(), future = await response.json(); future.assessment.calculation_version = "future"; await route.fulfill({ response, json: future }); });
    await page.goto("/"); await page.getByRole("button", { name: "Saved cases", exact: true }).click();
    await page.getByRole("button", { name: `Open ${input.borrower_name} case ${original.case_id}`, exact: true }).click(); await expect(page.locator(".savedContext")).toContainText(original.run_id);
    await page.getByRole("button", { name: "Scenarios", exact: true }).click(); await expect(page.locator(".scenarioComposer")).toContainText("New preview is unavailable");
    await expect(page.getByRole("button", { name: "Preview scenarios", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: `Open comparison ${stored.record.comparison_id}`, exact: true }).click(); await expect(page.locator(".comparisonContext")).toContainText(stored.record.comparison_id);
    await page.getByText("Original comparison JSON", { exact: true }).click(); await expect(page.locator(".originalComparisonJson")).toContainText('"persisted": true');
});
