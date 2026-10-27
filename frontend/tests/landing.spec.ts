import { writeWorkspaceMemory } from "./workspaceMemory";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "./authenticatedTest";
import { LOCATOR_KEY, RECOVERY_KEY, makeCreate } from "../src/caseRecovery";
import {
  collectConsoleProblems,
  connectWorkspace,
  disconnect,
  expectNoOverflow,
  moreAction,
  moreActions,
  openCaseBrowser,
  openView,
  startActions,
  startScreenTitle,
  TEST_API_ORIGIN,
  workspaceTabLabels,
} from "./testCredentials";

const dated = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated.json", import.meta.url), "utf8"));
const upload = (name: string, value: unknown) => ({ name, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(value)) });

async function createCase(request: APIRequestContext, borrower = "Saved landing borrower") {
  const response = await request.post(`${TEST_API_ORIGIN}/cases`, {
    headers: { "Idempotency-Key": randomUUID() },
    data: { input: { ...dated, borrower_name: borrower }, rationale: "Synthetic landing case" },
  });
  expect(response.status()).toBe(201);
  return response.json();
}

async function startScreen(page: Page) {
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  const start = page.locator(".startScreen");
  await expect(start).toBeVisible();
  return start;
}

test("connecting shows the start screen and evaluates nothing until a choice is made", async ({ page }) => {
  const problems = collectConsoleProblems(page);
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(new URL(request.url()).pathname);
  });
  const start = await startScreen(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(startScreenTitle);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  for (const label of Object.values(startActions))
    await expect(start.getByRole("button", { name: label, exact: true })).toBeVisible();
  await expect(page.locator(".decision")).toHaveCount(0);
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(posts).toEqual([]);
  expect(problems).toEqual([]);
});

test("the example case evaluates Alpine as an unsaved dated draft", async ({ page }) => {
  const start = await startScreen(page);
  await start.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Alpine Fabrication");
  await expect(page.locator(".startScreen")).toHaveCount(0);
  const header = page.locator("header");
  await expect(header.getByText("Dated assessment", { exact: true })).toBeVisible();
  await expect(header.locator(".statusChip")).toHaveText("Draft — not saved");
  await expect(page.locator(".caseSource")).toContainText("alpine_dated_v2.json");
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled();
});

test("open saved case lists saved cases and opens the selected one", async ({ page, request }) => {
  const saved = await createCase(request);
  const start = await startScreen(page);
  const button = start.getByRole("button", { name: startActions.open, exact: true });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await openCaseBrowser(page);
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page
    .locator(".caseRow")
    .filter({ hasText: saved.case_id })
    .getByRole("button", { name: /^Open / })
    .click();
  await expect(page.locator(".savedContext")).toContainText(saved.case_id);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Saved landing borrower");
  await expect(page.locator("header .statusChip")).toHaveText("Saved · revision 1 · latest");
});

test("closing the saved-case list returns focus to the start screen action", async ({ page }) => {
  const start = await startScreen(page);
  await openCaseBrowser(page);
  await page.getByRole("button", { name: "Close saved cases", exact: true }).click();
  await expect(start.getByRole("button", { name: startActions.open, exact: true })).toBeFocused();
});

test("import case file opens the file chooser and evaluates the chosen file", async ({ page }) => {
  const start = await startScreen(page);
  await expect(page.locator("input[type=file]")).toHaveCount(1);
  const chooser = page.waitForEvent("filechooser");
  await start.getByRole("button", { name: startActions.import, exact: true }).click();
  await (await chooser).setFiles(upload("landing.json", { ...dated, borrower_name: "Imported landing borrower" }));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Imported landing borrower");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(page.locator(".caseSource")).toContainText("landing.json");
});

test("a remembered saved selection reopens the workspace without the start screen", async ({ page, request }) => {
  const saved = await createCase(request, "Remembered landing borrower");
  await page.goto("/");
  await writeWorkspaceMemory(page, LOCATOR_KEY, JSON.stringify({ version: "case-selection-v1", apiBase: TEST_API_ORIGIN, caseId: saved.case_id, revision: "latest" }));
  await connectWorkspace(page, { example: false });
  await expect(page.locator(".savedContext")).toContainText(saved.case_id);
  await expect(page.locator(".startScreen")).toHaveCount(0);
});

test("an unconfirmed saved write reopens the workspace with exact retry and no start screen", async ({ page }) => {
  // Node resolves the API base without the dev server's setting; the journal must name the browser's.
  const pending = JSON.stringify({ ...makeCreate(dated, "Pending landing creation"), apiBase: TEST_API_ORIGIN });
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/cases") posts++;
  });
  await page.goto("/");
  await writeWorkspaceMemory(page, RECOVERY_KEY, pending);
  await connectWorkspace(page, { example: false });
  await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toBeEnabled();
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await expect(page.locator(".startScreen")).toHaveCount(0);
  expect(posts).toBe(0);
});

test("unreadable recovery tracking stays visible on the start screen", async ({ page }) => {
  await page.goto("/");
  await writeWorkspaceMemory(page, RECOVERY_KEY, "{invalid");
  await connectWorkspace(page, { example: false });
  await expect(page.getByRole("heading", { name: "Saved write recovery unavailable" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop tracking this unconfirmed write…", exact: true })).toBeEnabled();
});

test("workspace views follow the ARIA tabs pattern with roving focus", async ({ page }) => {
  const problems = collectConsoleProblems(page);
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const tablist = page.getByRole("tablist", { name: "Workspace views", exact: true });
  const tabs = tablist.getByRole("tab");
  await expect(tabs).toHaveText(workspaceTabLabels);
  const spread = tablist.getByRole("tab", { name: "Spread", exact: true });
  // A fresh dated case opens on Overview (ease N-7); the roving sequence below starts from Spread.
  const opened = tablist.getByRole("tab", { name: "Overview", exact: true });
  await expect(opened).toHaveAttribute("aria-selected", "true");
  await expect(opened).toHaveAttribute("tabindex", "0");
  await expect(tablist.locator('[role="tab"][tabindex="-1"]')).toHaveCount(workspaceTabLabels.length - 1);
  await openView(page, "spread");
  await expect(spread).toHaveAttribute("aria-selected", "true");
  await expect(spread).toHaveAttribute("tabindex", "0");
  await expect(tablist.locator('[role="tab"][tabindex="-1"]')).toHaveCount(workspaceTabLabels.length - 1);
  const panel = page.getByRole("tabpanel");
  await expect(panel).toHaveCount(1);
  await expect(panel).toHaveAttribute("aria-labelledby", (await spread.getAttribute("id"))!);
  await expect(spread).toHaveAttribute("aria-controls", (await panel.getAttribute("id"))!);
  await expect(panel.locator("table")).toHaveCount(1);

  await spread.focus();
  await page.keyboard.press("ArrowRight");
  const overview = tablist.getByRole("tab", { name: "Overview", exact: true });
  await expect(overview).toBeFocused();
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect(spread).toHaveAttribute("tabindex", "-1");
  await expect(page.locator("table")).toHaveCount(0);
  await page.keyboard.press("End");
  const audit = tablist.getByRole("tab", { name: "History & Audit", exact: true });
  await expect(audit).toBeFocused();
  await expect(audit).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(spread).toBeFocused();
  await expect(spread).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(audit).toBeFocused();
  await page.keyboard.press("Home");
  await expect(spread).toBeFocused();

  await openView(page, "memo");
  await expect(page.locator(".memo")).toHaveCount(1);
  await expect(page.locator("table")).toHaveCount(0);
  await openView(page, "global");
  await expect(page.getByRole("tabpanel")).toContainText("Dana Alpine");
  await openView(page, "debt");
  await expect(page.locator(".assumption").filter({ hasText: "Annual nominal rate" })).toHaveCount(1);
  await expect(page.getByRole("tabpanel")).not.toContainText("Dana Alpine");
  expect(problems).toEqual([]);
});

test("the More menu is a dismissable disclosure holding examples, import, theme and disconnect", async ({ page }) => {
  const problems = collectConsoleProblems(page);
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const toggle = page.getByRole("button", { name: "More", exact: true });
  const menu = page.locator(".moreMenu");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  for (const label of Object.values(moreActions))
    await expect(menu.getByRole("button", { name: label, exact: true })).toBeVisible();
  await menu.getByRole("button", { name: moreActions.example, exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(menu).toHaveCount(0);

  await moreAction(page, "legacyExample");
  await expect(menu).toHaveCount(0);
  await expect(page.locator("header").getByText("Legacy · undated input", { exact: true })).toBeVisible();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await moreAction(page, "example");
  await expect(page.locator("header").getByText("Dated assessment", { exact: true })).toBeVisible();
  expect(problems).toEqual([]);
});

test("disconnect from the More menu returns to the access gate and clears financial views", async ({ page }) => {
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await disconnect(page);
  await expect(page.getByLabel("API token", { exact: true })).toHaveValue("");
  await expect(page.locator(".decision, .savedContext, .memo, .startScreen")).toHaveCount(0);
});

test("the slim prototype notice expands to the full disclaimer", async ({ page }) => {
  await startScreen(page);
  const notice = page.locator(".environmentWarning");
  const expand = notice.getByRole("button", { name: "Read full notice", exact: true });
  await expect(expand).toHaveAttribute("aria-expanded", "false");
  await expect(notice).not.toContainText("not legal or compliance advice");
  await expand.click();
  await expect(expand).toHaveAttribute("aria-expanded", "true");
  await expect(notice).toContainText("not legal or compliance advice");
});

test("start screen and workspace fit 390, 1280 and 1440 pixels with one h1 and main", async ({ page }, info) => {
  const problems = collectConsoleProblems(page);
  await startScreen(page);
  for (const width of [390, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoOverflow(page);
    await page.screenshot({ path: info.outputPath(`start-${width}.png`), fullPage: true });
  }
  await page.locator(".startScreen").getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  for (const width of [390, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const view of ["spread", "overview", "debt", "global", "stress", "memo", "audit"] as const) {
      await openView(page, view);
      await expectNoOverflow(page);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("table")).toHaveCount(view === "spread" ? 1 : 0);
    }
    await openView(page, "spread");
    await page.screenshot({ path: info.outputPath(`workspace-${width}.png`), fullPage: true });
  }
  expect(problems).toEqual([]);
});
