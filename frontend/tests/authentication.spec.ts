import { test, expect, type Page, type Request } from "@playwright/test";
import { guardPendingWrite, RECOVERY_KEY } from "../src/caseRecovery";
import { connectWorkspace, disconnect, moreAction, TEST_API_ORIGIN, TEST_API_TOKEN } from "./testCredentials";

function apiRequest(request: Request): boolean {
  return new URL(request.url()).origin === TEST_API_ORIGIN;
}

async function assertCredentialIsMemoryOnly(page: Page): Promise<void> {
  const persisted = await page.evaluate(() => ({
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage),
  }));
  expect(JSON.stringify(persisted)).not.toContain(TEST_API_TOKEN);
  expect(page.url()).not.toContain(TEST_API_TOKEN);
}

test("anonymous entry sends no financial or storage requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (apiRequest(request)) requests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByLabel("API token", { exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(requests).toEqual([]);
  await expect(page.locator(".decision, .savedContext, .memo")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toHaveCount(0);
});

test("a rejected token keeps the financial application closed and permits correction", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (apiRequest(request)) requests.push(new URL(request.url()).pathname); });
  await page.goto("/");
  await page.getByLabel("API token", { exact: true }).fill("synthetic-rejected-credential-with-32-characters");
  await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(/token|credential|authentication/i);
  await expect(page.getByRole("button", { name: "Connect workspace", exact: true })).toBeEnabled();
  await expect(page.locator(".decision, .savedContext, .memo")).toHaveCount(0);
  expect(requests).toEqual(["/openapi.json"]);
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
});

test("manual entry authorizes only API calls and a reload requires re-entry", async ({ page }) => {
  const requests: Request[] = [];
  page.on("request", request => requests.push(request));
  await page.goto("/");
  const input = page.getByLabel("API token", { exact: true });
  await expect(input).toHaveAttribute("type", "password");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.waitForLoadState("networkidle");
  await assertCredentialIsMemoryOnly(page);
  const authenticated = requests.filter(apiRequest);
  expect(authenticated.length).toBeGreaterThanOrEqual(2);
  for (const request of authenticated) {
    expect(request.headers().authorization).toBe(`Bearer ${TEST_API_TOKEN}`);
    expect(request.url()).not.toContain(TEST_API_TOKEN);
  }
  for (const request of requests.filter(request => !apiRequest(request))) {
    expect(request.headers().authorization).toBeUndefined();
  }
  expect((await page.request.get(`${TEST_API_ORIGIN}/openapi.json`)).status()).toBe(401);
  const beforeReload = requests.filter(apiRequest).length;
  await page.reload();
  await expect(input).toHaveValue("");
  await page.waitForLoadState("networkidle");
  expect(requests.filter(apiRequest)).toHaveLength(beforeReload);
  await expect(page.locator(".decision, .savedContext, .memo")).toHaveCount(0);
  await assertCredentialIsMemoryOnly(page);
});

test("disconnect removes financial views and a delayed response cannot restore them", async ({ page }) => {
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  let release!: () => void, entered!: () => void, finished!: () => void;
  const held = new Promise<void>(resolve => release = resolve);
  const started = new Promise<void>(resolve => entered = resolve);
  const completed = new Promise<void>(resolve => finished = resolve);
  await page.route("**/commercial/assessment", async route => {
    const response = await route.fetch();
    entered();
    await held;
    await route.fulfill({ response }).catch(() => {});
    finished();
  });
  await moreAction(page, "example");
  await started;
  await disconnect(page);
  await expect(page.getByLabel("API token", { exact: true })).toHaveValue("");
  await expect(page.locator(".decision, .savedContext, .memo")).toHaveCount(0);
  release();
  await completed;
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "Connect workspace", exact: true })).toBeEnabled();
  await expect(page.locator(".decision, .savedContext, .memo")).toHaveCount(0);
  await assertCredentialIsMemoryOnly(page);
});

test("disconnect preserves a pending command and key until an explicit authenticated retry", async ({ page }) => {
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  let body = "", key = "", caseId = "", writes = 0;
  page.on("request", request => {
    if (apiRequest(request) && request.method() === "POST" && new URL(request.url()).pathname === "/cases") writes++;
  });
  let release!: () => void, entered!: () => void, finished!: () => void;
  const held = new Promise<void>(resolve => release = resolve);
  const committed = new Promise<void>(resolve => entered = resolve);
  const completed = new Promise<void>(resolve => finished = resolve);
  await page.route("**/cases", async route => {
    if (route.request().method() !== "POST") return route.continue();
    body = route.request().postData()!;
    key = route.request().headers()["idempotency-key"];
    const response = await route.fetch();
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== "object" || !("case_id" in receipt) || typeof receipt.case_id !== "string") {
      throw new Error("Expected a committed case receipt");
    }
    caseId = receipt.case_id;
    entered();
    await held;
    await route.fulfill({ response }).catch(() => {});
    finished();
  });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Synthetic disconnect after commit");
  await page.getByRole("button", { name: "Save accepted case", exact: true }).click();
  await committed;
  const journal = await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY);
  expect(journal).not.toBeNull();
  if (!journal) throw new Error("Pending write must be journaled before transport");
  const operation = guardPendingWrite(JSON.parse(journal), TEST_API_ORIGIN);
  expect(operation.body).toBe(body);
  expect(operation.id).toBe(key);
  await disconnect(page);
  await expect(page.getByLabel("API token", { exact: true })).toHaveValue("");
  await expect(page.locator(".decision, .savedContext, .memo")).toHaveCount(0);
  release();
  await completed;
  expect(await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY)).toBe(journal);
  await page.unroute("**/cases");
  await connectWorkspace(page);
  await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toBeEnabled();
  await page.waitForLoadState("networkidle");
  expect(writes).toBe(1);
  expect(await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY)).toBe(journal);
  await assertCredentialIsMemoryOnly(page);
  const retry = page.waitForRequest(request => apiRequest(request) && request.method() === "POST" && new URL(request.url()).pathname === "/cases");
  const replayed = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/cases");
  await page.getByRole("button", { name: "Retry exact write", exact: true }).click();
  const sent = await retry;
  expect(sent.postData()).toBe(body);
  expect(sent.headers()["idempotency-key"]).toBe(key);
  expect(sent.headers().authorization).toBe(`Bearer ${TEST_API_TOKEN}`);
  expect((await replayed).headers()["idempotency-replayed"]).toBe("true");
  await expect(page.locator(".savedContext")).toContainText(caseId);
  expect(writes).toBe(2);
  expect(await page.evaluate(key => sessionStorage.getItem(key), RECOVERY_KEY)).toBeNull();
});
