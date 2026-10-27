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

test("N-3: the current workflow is not filled like the primary action", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  const save = page.getByRole("button", { name: "Save case", exact: true });
  await expect(save).toBeEnabled({ timeout: 30_000 });
  const current = page
    .getByRole("navigation", { name: "Underwriting workflows", exact: true })
    .getByRole("button", { name: "Commercial Assessment", exact: true });
  await expect(current).toHaveAttribute("aria-current", "page");
  const fill = (element: Element) => getComputedStyle(element).backgroundColor;
  expect(await current.evaluate(fill)).not.toBe(await save.evaluate(fill));
});

test("D-1: Edit complete draft is in More, not between the notice and the decision", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Edit complete draft", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(
    page.getByRole("group", { name: "More actions", exact: true }).getByRole("button", { name: "Edit complete draft", exact: true }),
  ).toBeVisible();
});

test("N-2: the example case is the first start option", async ({ page }) => {
  await connect(page);
  const start = page.getByRole("region", { name: startScreenTitle, exact: true });
  await expect(start.getByRole("button").first()).toHaveAccessibleName(startActions.example);
});
