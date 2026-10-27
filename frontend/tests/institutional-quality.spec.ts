import { test, expect } from "./authenticatedTest";
import {
  connectWorkspace,
  openView,
  expectNoOverflow,
} from "./testCredentials";
import { datedSample } from "../src/sampleCases";

test("zero-denominator coverage is explicitly unavailable while preserving the server verdict", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const input = structuredClone(datedSample);
  input.proposed_loan.amount = "0";
  input.existing_debt.cpltd_annual = "0";
  input.years[1].interest_expense = "0";
  input.guarantors = [];
  await page.locator("input[type=file]").setInputFiles({
    name: "zero-service.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(input)),
  });
  await expect(page.locator(".decision strong")).toHaveText("REVIEW");
  await openView(page, "spread");
  await page
    .locator(".metric")
    .getByRole("button", { name: "Business DSCR", exact: true })
    .click();
  const inspector = page.getByRole("region", {
    name: "Calculation inspector",
    exact: true,
  });
  await expect(inspector.locator(".statusBadge")).toHaveText("Unavailable");
  await expect(inspector).toContainText("cannot pass a policy factor");
});

test("trace money uses cents for annual units and labels business service plainly", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  await openView(page, "spread");
  await page
    .getByText("Inspect current calculated facts", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Business debt service", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Calculation inspector", exact: true }),
  ).toContainText("$200,961.00");
});

test("visible typography uses only institutional weights and controls have 44px targets", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  const headings = await page
    .locator("h1,h2,h3,h4,strong")
    .evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).fontWeight),
    );
  expect(
    headings.every((weight) => ["400", "500", "600"].includes(weight)),
  ).toBe(true);
  const controls = await page.getByRole("button").evaluateAll((nodes) =>
    nodes
      .filter((node) => node.getBoundingClientRect().width > 0)
      .map((node) => ({
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
      })),
  );
  expect(
    controls.every((control) => control.width >= 44 && control.height >= 44),
  ).toBe(true);
});

test("case filters bind server queries and filtered empty states clear explicitly", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page.getByRole("button", { name: "Saved Cases", exact: true }).click();
  const response = page.waitForResponse(
    (value) =>
      value.url().includes("/cases?") &&
      new URL(value.url()).searchParams.get("q") ===
        "Unique-unmatched-filter-789321",
  );
  await page
    .getByLabel("Search saved cases", { exact: true })
    .fill("Unique-unmatched-filter-789321");
  await response;
  await expect(
    page.getByRole("region", { name: "Saved cases", exact: true }),
  ).toContainText("No saved cases match these filters.");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(
    page.getByLabel("Search saved cases", { exact: true }),
  ).toHaveValue("");
});

test("shock chips only fill inputs and the explicit preview preserves exact shocks", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page
    .getByLabel("Save rationale")
    .fill("Synthetic scenario quick-fill review");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when fetched",
  );
  await openView(page, "stress");
  let previews = 0,
    retained = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().endsWith("/scenarios/preview")
    )
      previews++;
    if (
      request.method() === "POST" &&
      request.url().endsWith("/scenario-comparisons")
    )
      retained++;
  });
  await page
    .getByRole("group", { name: "Scenario 1 quick-fill shocks", exact: true })
    .getByRole("button", { name: "+250 bps", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Scenario 1 quick-fill shocks", exact: true })
    .getByRole("button", { name: "Revenue −20%", exact: true })
    .click();
  await expect(
    page.getByLabel("Scenario 1 Proposed rate change (bps)", { exact: true }),
  ).toHaveValue("250");
  await page
    .getByLabel("Scenario 1 rationale", { exact: true })
    .fill("Test a combined revenue and rate shock");
  expect(previews).toBe(0);
  expect(retained).toBe(0);
  const sent = page.waitForRequest((request) =>
    request.url().endsWith("/scenarios/preview"),
  );
  await page
    .getByRole("button", { name: "Preview scenarios", exact: true })
    .click();
  const assumptions = (await sent).postDataJSON().scenarios[0].assumptions;
  expect(assumptions.proposed_rate_change_bps).toBe("250");
  expect(assumptions.revenue_change).toBe("-0.2");
  await expect(page.locator(".scenarioPreview")).toBeVisible();
  expect(retained).toBe(0);
});

test("a malformed consumer response preserves the draft and cannot show an accepted result", async ({
  page,
}) => {
  await page.route("**/consumer/decision", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        vertical: "consumer",
        outcome: "approve",
        score: "1",
        factors: [],
        reasons: [],
        policy_version: "unsupported",
        disclaimer: "Example",
      }),
    }),
  );
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page
    .getByRole("button", { name: "Consumer Decision", exact: true })
    .click();
  await page
    .getByLabel("Load sample case", { exact: true })
    .selectOption("consumer");
  await page
    .getByRole("button", { name: "Evaluate consumer", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "incomplete or unsupported",
  );
  await expect(
    page.getByLabel("Gross monthly income", { exact: true }),
  ).toHaveValue("8000");
  await expect(
    page.getByRole("region", { name: "Consumer result", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Evaluate consumer", exact: true }),
  ).toBeEnabled();
});

test("a field-mapped imported rejection focuses a preserved correction without sending another request", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  let posts = 0;
  await page.route("**/commercial/assessment", (route) => {
    posts++;
    return route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "Compatibility detail",
        errors: {
          version: "field-errors-v1",
          truncated: false,
          items: [
            {
              pointer: "/years/1/gross_receipts",
              code: "too_small",
              message: "Review revenue evidence.",
              limit: "0",
            },
          ],
        },
      }),
    });
  });
  await page.locator("input[type=file]").setInputFiles({
    name: "located.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(datedSample)),
  });
  const correction = page.getByRole("region", {
    name: "Correct rejected inputs",
    exact: true,
  });
  const value = correction.getByLabel("Gross receipts (period 2)", {
    exact: true,
  });
  await expect(value).toBeFocused();
  await expect(value).toHaveValue("4200000");
  expect(posts).toBe(1);
  await value.fill("4300000");
  await expect(value).not.toHaveAttribute("aria-invalid", "true");
  await page.unroute("**/commercial/assessment");
  await correction
    .getByRole("button", { name: "Evaluate corrected draft", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
});

test("a field-mapped saved rejection keeps its proposal and requires fresh review before a new write", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page
    .getByLabel("Save rationale")
    .fill("Synthetic mapped rejection baseline");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when fetched",
  );
  let writes = 0;
  await page.route("**/cases/*/revisions", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    writes++;
    return route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "Original rejection detail",
        errors: {
          version: "field-errors-v1",
          truncated: false,
          items: [
            {
              pointer: "/years/1/gross_receipts",
              code: "invalid_value",
              message: "Review the source amount.",
              limit: null,
            },
          ],
        },
      }),
    });
  });
  await openView(page, "spread");
  await page
    .getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    })
    .click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Mapped saved rejection");
  await page
    .getByRole("button", { name: "Save revision", exact: true })
    .click();
  const correction = page.getByRole("region", {
    name: "Correct rejected inputs",
    exact: true,
  });
  await expect(
    correction.getByLabel("Gross receipts (period 2)", { exact: true }),
  ).toBeFocused();
  await correction
    .getByLabel("Gross receipts (period 2)", { exact: true })
    .fill("4300000");
  await correction
    .getByRole("button", { name: "Review corrected revision", exact: true })
    .click();
  await expect(page.getByLabel("Rationale", { exact: true })).toHaveValue(
    "Mapped saved rejection",
  );
  expect(writes).toBe(1);
  await page.unroute("**/cases/*/revisions");
  await page
    .getByRole("button", { name: "Save revision", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText("Revision 2");
});

for (const width of [375, 1280])
  test(`spread inspection and a cent schedule remain framed at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await connectWorkspace(page);
    await openView(page, "spread");
    await page
      .getByRole("button", {
        name: "Inspect Gross profit for 2025-01-01 – 2025-12-31",
        exact: true,
      })
      .click();
    await expectNoOverflow(page);
    await page.screenshot({
      path: `test-results/institutional-spread-${width}.png`,
      fullPage: true,
    });
    await openView(page, "debt");
    await page
      .getByText("Cent-rounded proposed-loan schedule", { exact: true })
      .click();
    await expect(
      page.getByRole("table", {
        name: "Server-calculated loan schedule",
        exact: true,
      }),
    ).toBeVisible();
    await expectNoOverflow(page);
    const sticky = await page
      .getByRole("table", {
        name: "Server-calculated loan schedule",
        exact: true,
      })
      .locator("thead th")
      .first()
      .evaluate((element) => getComputedStyle(element).position);
    expect(sticky).toBe("sticky");
  });
