import { test, expect, type Page } from "@playwright/test";
import { ALPINE_EXCEL, EASE_VIEWPORT, ScreenCapture, decisionReady } from "../tests/easeHarness";
import { startActions, startScreenTitle, unlockStreamlitHost } from "../tests/testCredentials";

// Ease-of-use screen capture and state probes for the Streamlit host. Screenshots are named by the
// inventory IDs in ease/data/screens.md. Runs only with EASE_CAPTURE=1; it is not a regression test.

test.skip(!process.env.EASE_CAPTURE, "Set EASE_CAPTURE=1 to capture ease-of-use screens.");
test.use({ viewport: EASE_VIEWPORT, actionTimeout: 10_000 });
test.describe.configure({ timeout: 240_000 });

const HOST = "streamlit";
const HOST_START = 30_000;

async function unlock(page: Page): Promise<void> {
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.getByRole("heading", { level: 1, name: startScreenTitle })).toBeVisible({ timeout: HOST_START });
}

async function tab(page: Page, name: string): Promise<void> {
  await page.getByRole("tab", { name, exact: true }).click();
  await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute("aria-selected", "true");
}

test("access, start and the workspace inside the Streamlit host", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await page.goto("/");
  await capture.attempt("S03", async () => {
    await expect(page.getByRole("button", { name: "Open workspace", exact: true })).toBeVisible({ timeout: HOST_START });
    await capture.shot("S03", "access");
    await page.getByLabel("Access password", { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: "Open workspace", exact: true }).click();
    await expect(page.getByText("The access password is not correct.", { exact: true })).toBeVisible();
    capture.probe("access.wrongPassword", "The access password is not correct.");
    await capture.shot("S03b", "access-wrong-password");
  });
  await capture.attempt("S15", async () => {
    await unlock(page);
    await capture.shot("S15", "start");
    capture.cover(["S05", "S06", "S10", "S12", "S14"], "S15-start");
  });
  await capture.attempt("S20", async () => {
    await page.getByRole("button", { name: startActions.example, exact: true }).click();
    await expect(page.getByRole("status", { name: "Assessment preparation", exact: true })).toBeVisible();
    await capture.shot("S19", "preparation");
    await decisionReady(page).waitFor({ timeout: HOST_START });
    await page
      .getByRole("region", { name: "Assessment overview", exact: true })
      .filter({ hasNotText: "Cushion pending" })
      .waitFor();
    await capture.shot("S20", "workspace-first-screen");
    await capture.shot("S29", "spread-full", { fullPage: true });
    capture.cover(["S16", "S17", "S21", "S22", "S23", "S28", "S30", "S76"], "S20-workspace-first-screen");
  });
  await capture.attempt("S11", async () => {
    await page.getByRole("button", { name: "More", exact: true }).click();
    await expect(page.getByRole("group", { name: "More actions", exact: true })).toBeVisible();
    await capture.shot("S11", "more-menu");
    await page.keyboard.press("Escape");
  });
  for (const [id, name] of [
    ["S32", "Overview"],
    ["S36", "Debt & Loan"],
    ["S38", "Global Cash Flow"],
    ["S40", "Stress Tests"],
    ["S47", "Credit Memo"],
    ["S48", "History & Audit"],
  ] as const)
    await capture.attempt(id, async () => {
      await tab(page, name);
      await capture.shot(id, name.toLowerCase().replace(/[^a-z]+/g, "-"), { fullPage: true });
    });
  await capture.attempt("S55", async () => {
    await page.getByRole("button", { name: "Save case", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await capture.shot("S55", "save-dialog");
    await page.getByLabel("Save rationale").fill("Capture baseline");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("region", { name: "Saved revision context", exact: true })).toBeVisible({ timeout: HOST_START });
    await capture.shot("S26", "saved-context");
    await tab(page, "History & Audit");
    await capture.shot("S49", "history-saved", { fullPage: true });
  });
  await capture.attempt("S57", async () => {
    await tab(page, "Debt & Loan");
    await page.getByRole("button", { name: "Proposed principal", exact: true }).click();
    await page.getByLabel("New value").fill("12abc");
    await capture.shot("S57", "edit-dialog-bad-amount");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
  });
  capture.save("workspace");
});

test("intake and the Consumer and SBA boundary on the Streamlit host", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await unlock(page);
  await capture.attempt("S67", async () => {
    await page.getByRole("button", { name: "Import Excel workbook", exact: true }).click();
    await capture.shot("S67", "excel-intake");
    await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(ALPINE_EXCEL);
    await expect(page.getByRole("heading", { name: "Review Excel inputs", exact: true })).toBeVisible();
    await capture.shot("S69", "excel-review", { fullPage: true });
    await page.getByRole("button", { name: "Cancel Excel import", exact: true }).click();
  });
  await capture.attempt("S72", async () => {
    await page.getByRole("button", { name: "Consumer Decision", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Consumer DTI review", exact: true })).toBeVisible();
    await capture.shot("S71", "consumer-on-streamlit");
    await page.getByLabel("Load sample case", { exact: true }).selectOption("consumer");
    await page.getByRole("button", { name: "Evaluate consumer", exact: true }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    capture.probe("consumer.streamlitSubmit", (await page.getByRole("alert").allInnerTexts()).join(" | "));
    await capture.shot("S72", "consumer-boundary");
    await page.getByRole("button", { name: "SBA Screen", exact: true }).click();
    await capture.shot("S74", "sba-on-streamlit");
  });
  for (const id of ["S01", "S02", "S04"]) capture.skip(id, "needs a misconfigured or failed host; not produced by the test launcher");
  capture.skip("S07", "bridge rejection states need a failing bridge; not produced on demand");
  for (const id of ["S08", "S09"]) capture.skip(id, "standalone host only (the Streamlit host has no token screen)");
  capture.skip("S73", "unreachable on the Streamlit host");
  capture.skip("S75", "unreachable on the Streamlit host");
  capture.save("intake");
});
