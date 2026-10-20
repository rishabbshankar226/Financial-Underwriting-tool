import { test, expect } from "./authenticatedTest";
import {
  collectConsoleProblems, connectWorkspace, disconnect, expectNoOverflow,
  moreAction, openView, startActions,
} from "./testCredentials";

async function start(page: import("@playwright/test").Page) {
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
}

test("a fast result stays hidden for five seconds, with accessible responsive progress", async ({ page }, info) => {
  const problems = collectConsoleProblems(page);
  await start(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  const progress = page.getByRole("status", { name: "Assessment preparation" });
  await expect(progress).toContainText("Calculation received");
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeDisabled();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoOverflow(page);
    await page.screenshot({ path: info.outputPath(`preparing-${width}.png`), fullPage: true });
  }
  await page.clock.runFor(4999);
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await page.clock.runFor(1);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(progress).toHaveCount(0);
  await openView(page, "overview");
  await page.clock.runFor(6000);
  await expect(progress).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("a slow calculation stays pending beyond the transition and reveals without another delay", async ({ page }) => {
  await start(page);
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/commercial/assessment", async (route) => {
    const response = await route.fetch();
    await held;
    await route.fulfill({ response });
  });
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  const progress = page.getByRole("status", { name: "Assessment preparation" });
  await expect(progress).toContainText("Waiting for the calculation service");
  await page.clock.runFor(6000);
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  release();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(progress).toHaveCount(0);
});

test("failed calculations show errors immediately without waiting for the transition", async ({ page }) => {
  await start(page);
  await page.route("**/commercial/assessment", (route) => route.fulfill({ status: 503, json: { detail: "Unavailable" } }));
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("status", { name: "Assessment preparation" })).toHaveCount(0);
});

test("a newer request replaces the pending result and disconnect cancels preparation", async ({ page }) => {
  await start(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  const progress = page.getByRole("status", { name: "Assessment preparation" });
  await expect(progress).toContainText("Calculation received");
  await expect(page.locator(".preparationSpinner")).toHaveCSS("animation-name", "none");
  await page.clock.runFor(3000);
  await moreAction(page, "legacyExample");
  await expect(progress).toContainText("Calculation received");
  await page.clock.runFor(2000);
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await disconnect(page);
  await page.clock.runFor(6000);
  await expect(page.getByLabel("API token", { exact: true })).toBeVisible();
  await expect(page.locator(".decision")).toHaveCount(0);
  await expect(progress).toHaveCount(0);
});

test("an edit hides the old approval until its decline finishes the same five-second sequence", async ({ page }) => {
  await start(page);
  await moreAction(page, "legacyExample");
  const progress = page.getByRole("status", { name: "Assessment preparation" });
  await expect(progress).toContainText("Calculation received");
  await page.clock.runFor(5000);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Edit Gross receipts for Supplied period 2", exact: true }).click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Synthetic declining preparation check");
  await page.getByRole("button", { name: "Evaluate edit", exact: true }).click();
  await expect(progress).toContainText("Calculation received");
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await page.clock.runFor(4999);
  await expect(page.locator(".decision strong")).toHaveText("CALCULATING");
  await page.clock.runFor(1);
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await expect(progress).toHaveCount(0);
});
