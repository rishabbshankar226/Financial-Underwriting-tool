import { test, expect } from "./authenticatedTest";
import { TEST_API_TOKEN, startActions, startScreenTitle } from "./testCredentials";
import type { Page } from "@playwright/test";

// Regression tests for the ease-of-use register rows (ease/REGISTER.md). Each test names its row.

async function connect(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("API token", { exact: true }).fill(TEST_API_TOKEN);
  await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: startScreenTitle })).toBeVisible();
}

test("N-1: the example case is the start screen's one primary action", async ({ page }) => {
  await connect(page);
  const start = page.getByRole("region", { name: startScreenTitle, exact: true });
  await expect(start.getByRole("button", { name: startActions.example, exact: true })).toHaveClass(/\bprimary\b/);
  await expect(start.locator(".primary")).toHaveCount(1);
});
