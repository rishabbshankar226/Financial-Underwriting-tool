import { test, expect } from "@playwright/test";
import { enterWorkspace, moreAction, openCaseBrowser, openView, unlockStreamlitHost } from "../tests/testCredentials";

test("packaged Streamlit workspace evaluates, edits, saves, reopens and previews a scenario", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type()))
      errors.push(message.text());
  });
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await enterWorkspace(page, { timeout: 30_000 });
  await expect(page.getByRole("status", { name: "Assessment preparation" })).toBeVisible();
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  await expect(page.locator(".hostingNotice")).toContainText(
    "Synthetic data only",
  );
  // The analysis reaches the workspace through the bridge: its cushions fill the KPI tiles.
  await expect(
    page.locator(".kpiTile").filter({ hasText: "Business DSCR" }),
  ).toContainText("Cushion +1.88x");
  await openView(page, "spread");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".hostingNotice").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("streamlit-spread-1440.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    })
    .click();
  await page.getByLabel("New value").fill("4200001");
  await page.getByLabel("Rationale").fill("Synthetic Streamlit edit");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Synthetic Streamlit baseline");
  await page
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when last refreshed",
  );
  const savedCaseId = await (await page.locator(".savedContext code").first().textContent()) ?? "";
  await page.reload();
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(".savedContext")).toHaveCount(0);
  await openCaseBrowser(page);
  await page.locator(".caseRow").filter({ hasText: savedCaseId }).getByRole("button", { name: /^Open / }).click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when last refreshed",
    { timeout: 30_000 },
  );
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(page.getByRole("status", { name: "Assessment preparation" })).toHaveCount(0);
  await openView(page, "scenarios");
  await page.getByLabel("Scenario 1 preset").selectOption("revenue");
  await page
    .getByLabel("Scenario 1 rationale")
    .fill("Synthetic downside review");
  await page
    .getByRole("button", { name: "Preview scenarios", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Read-only preview", exact: true }),
  ).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: info.outputPath(`streamlit-${width}.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

test("embedded saves work with browser storage denied and reload requires an explicit server selection", async ({ page }) => {
  await page.addInitScript(() => {
    for (const key of ["localStorage", "sessionStorage"])
      Object.defineProperty(window, key, {
        configurable: true,
        get() { throw new DOMException("Storage disabled", "SecurityError"); },
      });
  });
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await enterWorkspace(page, { timeout: 30_000 });
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", { timeout: 30_000 });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Synthetic memory-only embedded save");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator(".savedContext")).toContainText("Latest when last refreshed");
  const caseId = await (await page.locator(".savedContext code").first().textContent()) ?? "";
  await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
  await page.reload();
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(".decision, .savedContext")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
  await openCaseBrowser(page);
  await page.locator(".caseRow").filter({ hasText: caseId }).getByRole("button", { name: /^Open / }).click();
  await expect(page.locator(".savedContext")).toContainText(caseId);
  await expect(page.locator(".savedContext")).toContainText("Revision 1");
  await openView(page, "history");
  await expect(page.locator(".revisionList .caseRow")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Open revision 1", exact: true })).toBeVisible();
});

test("an embedded acknowledged write with uncleared memory retries the same operation and returns its original revision", async ({ page }) => {
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await enterWorkspace(page, { timeout: 30_000 });
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", { timeout: 30_000 });

  // Fault only this page's pending journal deletion; keep the test control in a
  // JSHandle rather than adding a production global or touching browser storage.
  const tracking = await page.evaluateHandle(() => {
    const remove = Map.prototype.delete;
    const state = {
      allowClear: false,
      blockedClears: 0,
      blockedId: "",
      clearedId: "",
      restore() { Map.prototype.delete = remove; },
    };
    Map.prototype.delete = function (key: unknown) {
      if (typeof key === "string" && key.endsWith("spreadline.pending-write.v1")) {
        const operation = JSON.parse(String(this.get(key))) as { id: string };
        if (!state.allowClear) {
          state.blockedClears++;
          state.blockedId = operation.id;
          return false;
        }
        state.clearedId = operation.id;
      }
      return remove.call(this, key);
    };
    return state;
  });
  try {
    await page.getByRole("button", { name: "Save case", exact: true }).click();
    await page.getByLabel("Save rationale").fill("Synthetic acknowledged memory tracking recovery");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator(".savedContext")).toContainText("Latest when last refreshed");
    await expect(page.locator(".savedContext")).toContainText("Revision 1");
    const caseId = await (await page.locator(".savedContext code").first().textContent()) ?? "";
    const recovery = page.getByRole("region", { name: "Saved write recovery", exact: true });
    await expect(recovery.getByRole("button", { name: "Retry exact write", exact: true })).toBeEnabled();
    await expect(recovery).toContainText("could not clear");
    await recovery.getByText("Inspect pending payload", { exact: true }).click();
    const operationId = await recovery.locator("details > p > code").first().innerText();
    expect(operationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(await tracking.evaluate(state => state.blockedId)).toBe(operationId);
    expect(await tracking.evaluate(state => state.blockedClears)).toBeGreaterThan(0);

    await openView(page, "history");
    await expect(page.locator(".revisionList .caseRow")).toHaveCount(1);
    await expect(recovery.locator("details > p > code").first()).toHaveText(operationId);
    expect(await tracking.evaluate(state => state.clearedId)).toBe("");
    await tracking.evaluate(state => { state.allowClear = true; });
    await recovery.getByRole("button", { name: "Retry exact write", exact: true }).click();
    await expect(page.getByText("Recovered the original revision 1.", { exact: true })).toBeVisible();
    await expect(page.locator(".savedContext")).toContainText(caseId);
    await expect(page.locator(".savedContext")).toContainText("Revision 1");
    await expect(page.getByRole("button", { name: "Retry exact write", exact: true })).toHaveCount(0);
    expect(await tracking.evaluate(state => state.clearedId)).toBe(operationId);
    await page.getByRole("button", { name: "Refresh revisions", exact: true }).click();
    await expect(page.locator(".revisionList .caseRow")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Open revision 1", exact: true })).toBeVisible();
  } finally {
    await tracking.evaluate(state => state.restore());
    await tracking.dispose();
  }
});

test("embedded dialogs keep keyboard focus and browser sessions keep separate drafts", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await enterWorkspace(page, { timeout: 30_000 });
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  await openView(page, "spread");
  const field = page.getByRole("button", {
    name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
    exact: true,
  });
  await field.click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(dialog.getByLabel("New value")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Evaluate edit", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(field).toBeFocused();
  await field.click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Synthetic isolated draft");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  const context = await browser.newContext();
  try {
    const other = await context.newPage();
    await other.goto("http://127.0.0.1:8501");
    await unlockStreamlitHost(other);
    await expect(other.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
    await enterWorkspace(other, { timeout: 30_000 });
    await expect(other.locator(".decision strong")).toHaveText("APPROVE", {
      timeout: 30_000,
    });
    await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  } finally {
    await context.close();
  }
});

test("the embedded theme is page-only and leaves the Streamlit page untouched", async ({
  page,
}) => {
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await enterWorkspace(page, { timeout: 30_000 });
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
  await moreAction(page, "theme");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");
  // The theme toggle leaves the menu open; a click outside it, inside the shadow root, closes it.
  await expect(page.locator(".moreMenu")).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(page.locator(".moreMenu")).toHaveCount(0);
  expect(
    await page.evaluate(() => [
      Object.entries(localStorage).filter(([key]) => key.startsWith("spreadline.")),
      Object.entries(sessionStorage).filter(([key]) => key.startsWith("spreadline.")),
      document.documentElement.dataset.theme ?? null,
    ]),
  ).toEqual([[], [], null]);
  await page.reload();
  await unlockStreamlitHost(page);
  // An unsaved example leaves nothing to restore, so the reload returns to the start screen.
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await enterWorkspace(page, { timeout: 30_000 });
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
});
