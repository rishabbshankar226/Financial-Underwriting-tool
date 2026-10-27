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

test("D-4: a first evaluation shows one pending panel and a plain note", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.getByRole("status", { name: "Assessment preparation", exact: true })).toBeVisible();
  // Counted at once, inside the hold: a retrying assertion would pass when the reveal removes the panel.
  expect(await page.getByText(/^Submitted draft:/).count()).toBe(0);
  await expect(page.getByRole("region", { name: "Illustrative decision", exact: true })).toContainText(
    "The decision appears with its figures.",
  );
});

test("L-2: each KPI tile label carries its server definition", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  const tiles = page.getByRole("region", { name: "Assessment overview", exact: true });
  await expect(tiles).toBeVisible({ timeout: 30_000 });
  for (const [label, starts] of [
    ["Business DSCR", "EBITDA divided by annual debt service"],
    ["Global DSCR", "Owner-weighted business EBITDA"],
    ["FCCR", "EBITDA divided by annual debt service plus annual operating leases"],
    ["UCA cash flow", "EBITDA minus cash taxes paid"],
    ["EBITDA", "Ordinary business income"],
    ["Annual debt service", "Existing interest plus annual CPLTD"],
  ])
    await expect(tiles.getByText(label, { exact: true })).toHaveAccessibleDescription(new RegExp(`^${starts}`));
});

test("N-7: a fresh dated case opens on Overview, its explanation", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await expect(page.getByRole("tab", { name: "Overview", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Why this decision", exact: true })).toBeVisible();
});

test("N-4: a draft edit needs no rationale; a saved revision still does", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("tab", { name: "Debt & Loan", exact: true }).click();
  await page.getByRole("button", { name: "Proposed principal", exact: true }).click();
  await page.getByLabel("New value").fill("600000");
  await expect(page.getByLabel(/^Rationale/)).toHaveValue("");
  await page.getByRole("button", { name: "Evaluate edit", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel(/^Rationale/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Saved for the N-4 check");
  await page.getByRole("dialog").getByRole("button").last().click();
  await expect(page.getByRole("region", { name: "Saved revision context", exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Proposed principal", exact: true }).click();
  await page.getByLabel("New value").fill("650000");
  await page.getByRole("button", { name: "Save revision", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
});

test("E-1: a blank save rationale gets a plain message", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button").last().click();
  await expect(dialog.getByRole("alert")).toHaveText("Enter a rationale for this save (up to 2,000 characters).");
});

test("D-2: the saved revision follows the figures and folds its identifiers", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Saved for the D-2 check");
  await page.getByRole("dialog").getByRole("button").last().click();
  const context = page.getByRole("region", { name: "Saved revision context", exact: true });
  await expect(context).toBeVisible({ timeout: 30_000 });
  const tiles = page.getByRole("region", { name: "Assessment overview", exact: true });
  const tilesFirst = await tiles.evaluate(
    (element, other) => !!(element.compareDocumentPosition(other as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
    await context.elementHandle(),
  );
  expect(tilesFirst).toBe(true);
  await expect(context.getByText(/^Case /)).toBeHidden();
  await context.getByText("Record details", { exact: true }).click();
  await expect(context.getByText(/^Case /)).toBeVisible();
});

test("D-3: calculation details are folded under History & Audit until asked for", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("tab", { name: "History & Audit", exact: true }).click();
  const details = page.getByRole("region", { name: "Calculation details", exact: true });
  await expect(details).toBeVisible();
  await expect(details.getByText(/^Policy version:/)).toBeHidden();
  const toggle = details.getByRole("button", { name: "Definitions, operands and policy snapshot", exact: true });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(details.getByText(/^Policy version:/)).toBeVisible();
});

test("N-2: the example case is the first start option", async ({ page }) => {
  await connect(page);
  const start = page.getByRole("region", { name: startScreenTitle, exact: true });
  await expect(start.getByRole("button").first()).toHaveAccessibleName(startActions.example);
});
