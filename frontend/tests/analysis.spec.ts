import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { APIRequestContext, Page, Request } from "@playwright/test";
import { test, expect } from "./authenticatedTest";
import {
  analysisNotices,
  collectConsoleProblems,
  connectWorkspace,
  openCaseBrowser,
  openView,
  moreAction,
  TEST_API_ORIGIN,
} from "./testCredentials";

const example = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url), "utf8"));
const dated = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated.json", import.meta.url), "utf8"));
const upload = (name: string, value: unknown) => ({ name, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(value)) });
const isAnalysis = (request: Request) => new URL(request.url()).pathname.endsWith("/analysis");

async function serverAnalysis(request: APIRequestContext, input: unknown) {
  const response = await request.post(`${TEST_API_ORIGIN}/commercial/analysis`, { data: input });
  expect(response.status()).toBe(200);
  return response.json();
}

type FetchStats = { active: number; max: number; started: number; log: string[] };

/** Counts this page's concurrent analysis fetches (an abort releases its slot synchronously) and logs,
 * in page order, each cancelled analysis and each saved write handed to the network. */
async function instrumentAnalysisFetches(page: Page) {
  await page.addInitScript(() => {
    const original = window.fetch;
    const stats = { active: 0, max: 0, started: 0, log: [] as string[] };
    Object.assign(window, { __analysisFetches: stats });
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const path = new URL(url, location.href).pathname;
      if (init?.method === "POST" && (path === "/cases" || path.endsWith("/scenario-comparisons"))) stats.log.push("write sent");
      if (!path.endsWith("/analysis")) return original.call(this, input, init);
      stats.started++;
      stats.active++;
      stats.max = Math.max(stats.max, stats.active);
      let settled = false;
      const settle = (cancelled: boolean) => {
        if (settled) return;
        settled = true;
        stats.active--;
        if (cancelled) stats.log.push("analysis cancelled");
      };
      init?.signal?.addEventListener("abort", () => settle(true), { once: true });
      return original.call(this, input, init).finally(() => settle(false));
    };
  });
  return () => page.evaluate(() => (window as unknown as { __analysisFetches: FetchStats }).__analysisFetches);
}

test("a matching analysis explains the decision, fills the KPI cushions and builds the Overview", async ({ page, request }) => {
  const problems = collectConsoleProblems(page);
  const expected = await serverAnalysis(request, example);
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(page.locator(".decision")).toContainText(expected.explanation.headline);
  const tiles = page.getByRole("region", { name: "Assessment overview", exact: true });
  await expect(tiles.locator(".kpiTile > span:first-child")).toHaveText([
    "Business DSCR",
    "Global DSCR",
    "FCCR",
    "UCA cash flow",
    "EBITDA",
    "Annual debt service",
  ]);
  const dscr = tiles.locator(".kpiTile").filter({ hasText: "Business DSCR" });
  await expect(dscr).toContainText("3.13x");
  await expect(dscr).toContainText("1.25x");
  await expect(dscr).toContainText("+1.88x");
  await expect(dscr).toHaveAttribute("data-state", "pass");
  await expect(tiles.locator(".kpiTile").filter({ hasText: "UCA cash flow" })).toContainText("+$385,000");
  await expect(tiles.locator(".kpiTile").filter({ hasText: "EBITDA" })).toContainText("$630,000");
  await expect(tiles.locator(".kpiTile").filter({ hasText: "Annual debt service" })).toContainText("$200,961");

  await openView(page, "overview");
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText(expected.explanation.headline);
  for (const condition of expected.explanation.conditions) await expect(panel).toContainText(condition.description);
  const capacity = panel.getByRole("region", { name: "Debt capacity", exact: true });
  await expect(capacity).toContainText("FCCR");
  await expect(capacity).toContainText("$2,352,984.83");
  await expect(capacity).toContainText("$1,852,984.83");
  await expect(capacity).toContainText("8.57%");
  await expect(capacity).toContainText("9.64%");
  const revenue = panel.getByRole("img", { name: /^Gross receipts/ });
  await expect(revenue).toHaveAccessibleName(/\$3,900,000/);
  await expect(revenue).toHaveAccessibleName(/\$4,200,000/);
  await expect(panel.getByRole("img", { name: /^EBITDA/ })).toHaveAccessibleName(/\$630,000/);
  expect(problems).toEqual([]);
});

test("an analysis for a different assessment fingerprint is refused", async ({ page, request }) => {
  const expected = await serverAnalysis(request, example);
  await page.route("**/commercial/analysis", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.assessment_fingerprint.value = "0".repeat(64);
    await route.fulfill({ response, json: body });
  });
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await openView(page, "overview");
  await expect(page.getByRole("tabpanel")).toContainText(analysisNotices.mismatch);
  await expect(page.locator(".decision")).not.toContainText(expected.explanation.headline);
  const dscr = page.getByRole("region", { name: "Assessment overview", exact: true }).locator(".kpiTile").filter({ hasText: "Business DSCR" });
  await expect(dscr).toContainText("3.13x");
  await expect(dscr).not.toContainText("+1.88x");
});

test("a late analysis for an earlier selection is ignored", async ({ page, request }) => {
  const later = await serverAnalysis(request, { ...dated, borrower_name: "Later selection" });
  let release!: () => void, entered!: () => void, finished!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  const started = new Promise<void>((resolve) => (entered = resolve));
  const completed = new Promise<void>((resolve) => (finished = resolve));
  let first = true;
  await page.route("**/commercial/analysis", async (route) => {
    if (!first) return route.continue();
    first = false;
    const response = await route.fetch();
    const body = await response.json();
    body.explanation.headline = "Obsolete analysis marker";
    entered();
    await held;
    await route.fulfill({ response, json: body }).catch(() => {});
    finished();
  });
  await page.goto("/");
  await connectWorkspace(page);
  await started;
  await page.locator("input[type=file]").setInputFiles(upload("later.json", { ...dated, borrower_name: "Later selection" }));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Later selection");
  await expect(page.locator(".decision")).toContainText(later.explanation.headline);
  release();
  await completed;
  await openView(page, "overview");
  await expect(page.getByRole("tabpanel")).toContainText(later.explanation.headline);
  await expect(page.locator("main")).not.toContainText("Obsolete analysis marker");
});

test("at most one analysis request is in flight while selections change", async ({ page }) => {
  const stats = await instrumentAnalysisFetches(page);
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/commercial/analysis", async (route) => {
    const response = await route.fetch();
    await held;
    await route.fulfill({ response }).catch(() => {});
  });
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect.poll(async () => (await stats()).started).toBe(1);
  let started = 1;
  for (const name of ["First switch", "Second switch"]) {
    await page.locator("input[type=file]").setInputFiles(upload(`${name}.json`, { ...dated, borrower_name: name }));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await expect(page.locator(".decision strong")).toHaveText("APPROVE");
    await expect.poll(async () => (await stats()).started).toBe(++started);
  }
  await moreAction(page, "legacyExample");
  await expect(page.locator("header").getByText("Legacy · undated input", { exact: true })).toBeVisible();
  await expect.poll(async () => (await stats()).active).toBe(0);
  await moreAction(page, "example");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect.poll(async () => (await stats()).started).toBe(++started);
  release();
  await expect.poll(async () => (await stats()).active).toBe(0);
  expect((await stats()).max).toBe(1);
});

test("a case save cancels the background analysis before the write and analyzes the new revision afterwards", async ({ page }) => {
  const stats = await instrumentAnalysisFetches(page);
  let releaseAnalysis!: () => void;
  const analysisHeld = new Promise<void>((resolve) => (releaseAnalysis = resolve));
  await page.route("**/commercial/analysis", async (route) => {
    const response = await route.fetch();
    await analysisHeld;
    await route.fulfill({ response }).catch(() => {});
  });
  let releaseWrite!: () => void, writeEntered!: () => void;
  const writeHeld = new Promise<void>((resolve) => (releaseWrite = resolve));
  const writeStarted = new Promise<void>((resolve) => (writeEntered = resolve));
  await page.route("**/cases", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const response = await route.fetch();
    writeEntered();
    await writeHeld;
    await route.fulfill({ response });
  });
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect.poll(async () => (await stats()).active).toBe(1);
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Synthetic analysis pause");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await writeStarted;
  let current = await stats();
  expect(current.active).toBe(0);
  expect(current.log).toEqual(["analysis cancelled", "write sent"]);
  await page.waitForTimeout(300);
  expect((await stats()).started).toBe(current.started);
  const savedAnalysis = page.waitForRequest(
    (request) => isAnalysis(request) && /^\/cases\/[^/]+\/revisions\/1\/analysis$/.test(new URL(request.url()).pathname),
  );
  releaseWrite();
  await expect(page.locator(".savedContext")).toContainText("Latest when fetched");
  expect((await savedAnalysis).postData()).toBe("{}");
  current = await stats();
  expect(current.max).toBe(1);
  releaseAnalysis();
});

test("a comparison save pauses analysis of the unchanged selection and resumes it after the receipt", async ({ page, request }) => {
  const created = await request.post(`${TEST_API_ORIGIN}/cases`, {
    headers: { "Idempotency-Key": randomUUID() },
    data: { input: { ...dated, borrower_name: "Paused analysis borrower" }, rationale: "Synthetic comparison pause" },
  });
  expect(created.status()).toBe(201);
  const saved = await created.json();
  const expected = await (await request.post(`${TEST_API_ORIGIN}/cases/${saved.case_id}/revisions/1/analysis`, { data: {} })).json();
  const stats = await instrumentAnalysisFetches(page);
  let first = true;
  let releaseFirst!: () => void;
  const firstHeld = new Promise<void>((resolve) => (releaseFirst = resolve));
  await page.route(`**/cases/${saved.case_id}/revisions/1/analysis`, async (route) => {
    if (!first) return route.continue();
    first = false;
    const response = await route.fetch();
    await firstHeld;
    await route.fulfill({ response }).catch(() => {});
  });
  let releaseWrite!: () => void, writeEntered!: () => void;
  const writeHeld = new Promise<void>((resolve) => (releaseWrite = resolve));
  const writeStarted = new Promise<void>((resolve) => (writeEntered = resolve));
  await page.route("**/scenario-comparisons", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const response = await route.fetch();
    writeEntered();
    await writeHeld;
    await route.fulfill({ response });
  });
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await openCaseBrowser(page);
  await page.locator(".caseRow").filter({ hasText: saved.case_id }).getByRole("button", { name: /^Open / }).click();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect.poll(async () => (await stats()).active).toBe(1);
  await openView(page, "stress");
  await page.getByLabel("Scenario 1 preset").selectOption("revenue");
  await page.getByLabel("Scenario 1 rationale").fill("Synthetic paused downside");
  await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
  await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
  await writeStarted;
  const during = await stats();
  expect(during.active).toBe(0);
  expect(during.log).toEqual(["analysis cancelled", "write sent"]);
  await page.waitForTimeout(300);
  expect((await stats()).started).toBe(during.started);
  releaseWrite();
  await expect(page.locator(".comparisonContext")).toContainText("Saved comparison");
  await expect.poll(async () => (await stats()).started).toBe(during.started + 1);
  await expect(page.locator(".decision")).toContainText(expected.explanation.headline);
  releaseFirst();
  expect((await stats()).max).toBe(1);
});

test("saved revisions are analyzed by the retained-policy route without stateless calls", async ({ page, request }) => {
  const created = await request.post(`${TEST_API_ORIGIN}/cases`, {
    headers: { "Idempotency-Key": randomUUID() },
    data: { input: { ...dated, borrower_name: "Saved analysis borrower" }, rationale: "Synthetic analysis case" },
  });
  expect(created.status()).toBe(201);
  const saved = await created.json();
  const expected = await (await request.post(`${TEST_API_ORIGIN}/cases/${saved.case_id}/revisions/1/analysis`, { data: {} })).json();
  expect(expected.source).toBe("saved_revision");
  const paths: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") paths.push(new URL(r.url()).pathname);
  });
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await openCaseBrowser(page);
  await page.locator(".caseRow").filter({ hasText: saved.case_id }).getByRole("button", { name: /^Open / }).click();
  await expect(page.locator(".savedContext")).toContainText(saved.case_id);
  await expect(page.locator(".decision")).toContainText(expected.explanation.headline);
  expect(paths).toEqual([`/cases/${saved.case_id}/revisions/1/analysis`]);
});

test("a server without analysis routes shows the unavailable fallback and keeps the assessment", async ({ page }) => {
  const problems = collectConsoleProblems(page);
  await page.route("**/commercial/analysis", (route) =>
    route.fulfill({ status: 404, headers: { "Access-Control-Allow-Origin": "*" }, json: { detail: "Not Found" } }),
  );
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await openView(page, "overview");
  await expect(page.getByRole("tabpanel")).toContainText(analysisNotices.unavailable);
  await expect(page.getByRole("alert")).toHaveCount(0);
  const tiles = page.getByRole("region", { name: "Assessment overview", exact: true });
  await expect(tiles.locator(".kpiTile").filter({ hasText: "Business DSCR" })).toContainText("3.13x");
  await expect(page.locator(".decision")).toContainText(analysisNotices.unavailable);
  expect(problems.filter((problem) => !problem.includes("404"))).toEqual([]);
});

test("an analysis with an unknown version is reported as unsupported", async ({ page }) => {
  await page.route("**/commercial/analysis", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.schema_version = "commercial-analysis-v9";
    await route.fulfill({ response, json: body });
  });
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await openView(page, "overview");
  await expect(page.getByRole("tabpanel")).toContainText(analysisNotices.unsupported);
});

test("legacy decisions send no analysis request", async ({ page }) => {
  const stats = await instrumentAnalysisFetches(page);
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await moreAction(page, "legacyExample");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await openView(page, "overview");
  await expect(page.getByRole("tabpanel")).toContainText("Legacy");
  expect((await stats()).started).toBe(0);
});

test("a recalculating draft edit keeps its previous outcome visible as inactive", async ({ page }) => {
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  let release!: () => void, entered!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  const started = new Promise<void>((resolve) => (entered = resolve));
  await page.route("**/commercial/assessment", async (route) => {
    const response = await route.fetch();
    entered();
    await held;
    await route.fulfill({ response }).catch(() => {});
  });
  await openView(page, "spread");
  await page.getByRole("button", { name: "Edit Gross receipts for 2025-01-01 – 2025-12-31", exact: true }).click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Synthetic recalculation");
  await page.getByRole("button", { name: "Evaluate edit", exact: true }).click();
  await started;
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await expect(page.locator(".decision")).toContainText("Previous result: APPROVE (inactive)");
  await expect(page.getByRole("region", { name: "Assessment overview", exact: true })).toHaveCount(0);
  release();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await expect(page.locator(".decision")).not.toContainText("Previous result");
});

test("a newly imported case shows no previous outcome while it evaluates", async ({ page }) => {
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  let release!: () => void, entered!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  const started = new Promise<void>((resolve) => (entered = resolve));
  await page.route("**/commercial/assessment", async (route) => {
    const response = await route.fetch();
    entered();
    await held;
    await route.fulfill({ response }).catch(() => {});
  });
  await page.locator("input[type=file]").setInputFiles(upload("fresh.json", { ...dated, borrower_name: "Fresh selection" }));
  await started;
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await expect(page.locator(".decision")).not.toContainText("Previous result");
  release();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
});

test("a failed analysis is retried only on request and then explains the decision", async ({ page, request }) => {
  const expected = await serverAnalysis(request, example);
  let calls = 0;
  await page.route("**/commercial/analysis", async (route) => {
    calls++;
    if (calls === 1)
      return route.fulfill({
        status: 503,
        headers: { "Access-Control-Allow-Origin": "*" },
        json: { detail: { code: "storage_busy", message: "Synthetic busy analysis" } },
      });
    return route.continue();
  });
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await openView(page, "overview");
  await expect(page.getByRole("tabpanel")).toContainText("Synthetic busy analysis");
  await page.waitForTimeout(300);
  expect(calls).toBe(1);
  await page.getByRole("button", { name: "Retry analysis", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(expected.explanation.headline);
  await expect(page.locator(".decision")).toContainText(expected.explanation.headline);
  expect(calls).toBe(2);
});

test("a request larger than the coverage minimums support reads as a shortfall, and near-floor ratios keep their places", async ({ page, request }) => {
  const oversized = { ...dated, borrower_name: "Oversized request", proposed_loan: { ...dated.proposed_loan, amount: 3000000 } };
  const expected = await serverAnalysis(request, oversized);
  expect(expected.debt_capacity.has_capacity).toBe(true);
  expect(expected.debt_capacity.principal_headroom.reported_value).toBe("-647015.17");
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page.locator("input[type=file]").setInputFiles(upload("oversized.json", oversized));
  await expect(page.locator(".decision strong")).toHaveText("REVIEW");
  await expect(page.locator(".decision")).toContainText(expected.explanation.headline);
  const tiles = page.getByRole("region", { name: "Assessment overview", exact: true });
  const service = tiles.locator(".kpiTile").filter({ hasText: "Annual debt service" });
  await expect(service).toHaveAttribute("data-state", "fail");
  await expect(service).not.toContainText("Within capacity");
  await expect(service).toContainText("$647,015");
  await expect(service).not.toContainText("($647,015)");
  // FCCR is 1.0004 against a 1.00x decline floor: it must not read as equal to the floor.
  await expect(tiles.locator(".kpiTile").filter({ has: page.locator(".kpiLabel", { hasText: /^FCCR$/ }) })).toContainText("1.0004x");
  await openView(page, "spread");
  await expect(page.locator(".metric").filter({ hasText: "Simplified FCCR" })).toContainText("1.0004x");
  await openView(page, "overview");
  const capacity = page.getByRole("tabpanel").getByRole("region", { name: "Debt capacity", exact: true });
  await expect(capacity).toContainText("$647,015.17");
  await expect(capacity).not.toContainText("fits within");
  await expect(capacity).not.toContainText("($647,015.17)");
});
