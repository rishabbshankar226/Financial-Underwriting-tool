import { test, expect } from "./authenticatedTest";
import { TEST_API_TOKEN, startScreenTitle } from "./testCredentials";
import type { Page } from "@playwright/test";

// Regression tests for the friction pass (docs/ux/FRICTION_PASS_2026-10.md). Each test names its finding.

async function connect(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("API token", { exact: true }).fill(TEST_API_TOKEN);
  await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: startScreenTitle })).toBeVisible();
}

async function openComposer(page: Page): Promise<void> {
  await connect(page);
  await page.getByRole("button", { name: "Commercial Assessment", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Build a dated assessment" })).toBeVisible();
}

test("F-7: each error-summary link reaches its field on the first click", async ({ page }) => {
  await openComposer(page);
  await page.getByRole("button", { name: "Evaluate assessment", exact: true }).click();
  const summary = page.getByRole("region", { name: "Validation summary", exact: true });
  await expect(summary).toBeVisible();
  // Evaluation focuses the first invalid field; each click below blurs the field the last click reached.
  for (const label of ["Geography", "AR increase", "Cash taxes paid", "COGS · Period 1"]) {
    await summary.getByRole("button", { name: new RegExp(`^${label}: `) }).click();
    await expect(page.getByLabel(label, { exact: true })).toBeFocused();
  }
});
