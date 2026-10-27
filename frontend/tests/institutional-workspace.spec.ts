import { test, expect } from "./authenticatedTest";
import {
  connectWorkspace,
  openView,
  collectConsoleProblems,
  expectNoOverflow,
} from "./testCredentials";

test("commercial sample preserves exact input strings and maps server errors to the field", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page
    .getByRole("button", { name: "Commercial Assessment", exact: true })
    .click();
  await page
    .getByLabel("Load sample case", { exact: true })
    .selectOption("dated");
  await expect(
    page.getByLabel("Gross receipts · Period 2", { exact: true }),
  ).toHaveValue("4200000");
  await page
    .getByLabel("Gross receipts · Period 2", { exact: true })
    .fill("4200000.000000000000000001");
  const sent = page.waitForRequest((request) =>
    request.url().endsWith("/commercial/assessment"),
  );
  await page
    .getByRole("button", { name: "Evaluate assessment", exact: true })
    .click();
  expect((await sent).postDataJSON().years[1].gross_receipts).toBe(
    "4200000.000000000000000001",
  );
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit complete draft", exact: true })
    .click();
  await page.route("**/commercial/assessment", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "unchanged detail",
        errors: {
          version: "field-errors-v1",
          truncated: false,
          items: [
            {
              pointer: "/years/1/gross_receipts",
              code: "too_small",
              message: "Review this reported amount.",
              limit: "0",
            },
          ],
        },
      }),
    }),
  );
  await page
    .getByRole("button", { name: "Evaluate assessment", exact: true })
    .click();
  const field = page.getByLabel("Gross receipts · Period 2", { exact: true });
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("region", { name: "Validation summary", exact: true }),
  ).toContainText("too_small");
  await field.fill("4300000");
  await expect(field).not.toHaveAttribute("aria-invalid", "true");
});

test("all four spread modes use server data and a keyboard trace exposes contextual operands", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  const modes = page.getByLabel("Spread presentation", { exact: true });
  await modes.selectOption("raw");
  await expect(page.getByRole("table")).toContainText("4,200,000");
  await modes.selectOption("common");
  await expect(page.getByRole("table")).toContainText("100.00%");
  await modes.selectOption("change");
  await expect(page.getByRole("table")).toContainText("7.69%");
  await modes.selectOption("reported");
  const trace = page.getByRole("button", {
    name: "Inspect Gross profit for 2025-01-01 – 2025-12-31",
    exact: true,
  });
  await trace.focus();
  await page.keyboard.press("Enter");
  const inspector = page.getByRole("region", {
    name: "Calculation inspector",
    exact: true,
  });
  await expect(inspector).toContainText("Gross profit = receipts − COGS");
  await expect(inspector).toContainText("Contextual reported operands");
  await expect(inspector).toContainText("largest signed rounding residual");
  await expect(inspector).toContainText("1,450,000.00");
});

test("analysis panels disclose model boundaries and expose server schedule and coverage grid", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  await openView(page, "debt");
  await page
    .getByText("Cent-rounded proposed-loan schedule", { exact: true })
    .click();
  await expect(
    page.getByRole("table", {
      name: "Server-calculated loan schedule",
      exact: true,
    }),
  ).toContainText("6,746.75");
  await expect(page.locator("main")).toContainText(
    "Capacity is policy arithmetic, not a credit approval.",
  );
  await openView(page, "stress");
  await page.getByText("Coverage grid", { exact: true }).click();
  await expect(
    page.getByRole("table", {
      name: "Revenue and rate coverage grid",
      exact: true,
    }),
  ).toContainText("Pass");
  await expect(page.locator("main")).toContainText(
    "LTV, debt yield, IRR, and NPV are not implemented",
  );
});

test("consumer sample evaluates DTI on the server and exposes an exact methodology", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page
    .getByRole("button", { name: "Consumer Decision", exact: true })
    .click();
  await page
    .getByLabel("Load sample case", { exact: true })
    .selectOption("consumer");
  const sent = page.waitForRequest((request) =>
    request.url().endsWith("/consumer/decision"),
  );
  await page
    .getByRole("button", { name: "Evaluate consumer", exact: true })
    .click();
  expect((await sent).postDataJSON().gross_monthly_income).toBe("8000");
  await expect(
    page.getByRole("region", { name: "Consumer result", exact: true }),
  ).toContainText("APPROVE");
  await page
    .getByRole("button", { name: "Inspect Total DTI", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Calculation inspector", exact: true }),
  ).toContainText("gross monthly income");
});

test("SBA sample never implies complete eligibility and shows pinned source evidence", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page.getByRole("button", { name: "SBA Screen", exact: true }).click();
  await page
    .getByLabel("Load sample case", { exact: true })
    .selectOption("sba-receipts");
  await page
    .getByRole("button", { name: "Evaluate SBA screen", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Incomplete Eligibility — Manual Underwriter Review Required",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "SBA result", exact: true }),
  ).toContainText("credit elsewhere");
  await expect(page.locator("main")).toContainText("850 supported");
  await expect(page.locator("main")).toContainText("128 refused");
});

test("an unconfigured case store shows a non-blocking stateless banner", async ({
  page,
}) => {
  await page.route("**/cases?*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        detail: { code: "storage_not_configured", message: "Not configured" },
      }),
    }),
  );
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page.getByRole("button", { name: "Saved Cases", exact: true }).click();
  await expect(
    page.getByText("Stateless Mode Active", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Consumer Decision", exact: true })
    .click();
  await page
    .getByLabel("Load sample case", { exact: true })
    .selectOption("consumer");
  await page
    .getByRole("button", { name: "Evaluate consumer", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Consumer result", exact: true }),
  ).toContainText("APPROVE");
});

for (const width of [375, 1280]) {
  test(`institutional workflows fit ${width}px with visible labels and a clean console`, async ({
    page,
  }) => {
    const problems = collectConsoleProblems(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await connectWorkspace(page);
    for (const view of ["spread", "debt", "stress", "audit"] as const) {
      await openView(page, view);
      await expectNoOverflow(page);
    }
    await page
      .getByRole("button", { name: "Consumer Decision", exact: true })
      .click();
    await page
      .getByLabel("Load sample case", { exact: true })
      .selectOption("consumer");
    await expectNoOverflow(page);
    await page.screenshot({
      path: `test-results/institutional-consumer-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "SBA Screen", exact: true }).click();
    await page
      .getByLabel("Load sample case", { exact: true })
      .selectOption("sba-receipts");
    await page
      .getByRole("button", { name: "Evaluate SBA screen", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "SBA result", exact: true }),
    ).toBeVisible();
    await expectNoOverflow(page);
    await page.screenshot({
      path: `test-results/institutional-sba-${width}.png`,
      fullPage: true,
    });
    expect(problems).toEqual([]);
  });
}
