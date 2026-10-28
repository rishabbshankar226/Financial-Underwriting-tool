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

async function screenSba(page: Page, naics: string): Promise<string> {
  await connect(page);
  await page.getByRole("button", { name: "SBA Screen", exact: true }).click();
  await page.getByLabel("Load sample case", { exact: true }).selectOption("sba-receipts");
  await page.getByLabel("NAICS code", { exact: true }).fill(naics);
  await page.getByRole("button", { name: "Evaluate SBA screen", exact: true }).click();
  const alert = page.getByRole("alert").filter({ hasText: /couldn't|rejected/ });
  await expect(alert).toBeVisible();
  return (await alert.innerText()).replace(/\s+/g, " ");
}

test("F-1: an SBA case that fails closed says what failed and that it is a known limit", async ({ page }) => {
  const message = await screenSba(page, "115310");
  expect(message).toContain("NAICS 115310 is unsupported: Source contains industry exceptions");
  expect(message).toContain("known limit of the prototype's pinned SBA size table");
  expect(message).not.toContain("highlighted fields");
});

test("F-1: other server reasons are shown as sent, without the known-limit sentence", async ({ page }) => {
  const message = await screenSba(page, "999999");
  expect(message).toContain("NAICS 999999");
  expect(message).not.toContain("known limit");
  expect(message).not.toContain("highlighted fields");
});

test("F-2: composer fields describe their format in plain words", async ({ page }) => {
  await openComposer(page);
  await expect(page.getByLabel("Gross receipts · Period 1", { exact: true })).toHaveAccessibleDescription(
    "Dollar amount, such as 500,000",
  );
  await expect(page.getByLabel("Annual nominal rate", { exact: true })).toHaveAccessibleDescription(
    "Decimal rate, such as 0.105 for 10.5% · minimum 0 · maximum 1",
  );
  await expect(page.getByLabel("Period start · Period 1", { exact: true })).toHaveAccessibleDescription(
    "Date as YYYY-MM-DD",
  );
  await expect(page.getByText("significant digits")).toHaveCount(0);
});

async function declinedExample(page: Page): Promise<void> {
  await connect(page);
  await page.getByRole("button", { name: "Try the example case", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("tab", { name: "Debt & Loan", exact: true }).click();
  await page.getByRole("button", { name: "Proposed principal", exact: true }).click();
  await page.getByLabel("New value").fill("5000000");
  await page.getByRole("button", { name: "Evaluate edit", exact: true }).click();
  await expect(page.getByRole("region", { name: "Illustrative decision", exact: true })).toContainText("DECLINE", {
    timeout: 30_000,
  });
}

test("F-3: memo reasons name the factor and show its formatted value and line", async ({ page }) => {
  await declinedExample(page);
  await page.getByRole("tab", { name: "Credit Memo", exact: true }).click();
  const memo = page.getByRole("tabpanel", { name: "Credit Memo" });
  const first = memo.getByRole("heading", { name: "Recorded reasons" }).locator("xpath=following-sibling::ul[1]/li[1]");
  await expect(first).toContainText("Business DSCR of 0.6777x is below the decline floor of 1.00x.");
  // The server's message is kept, unchanged, behind "Recorded message"; it never shows a 20-digit run.
  const recorded = first.locator("details.recordedMessage");
  await expect(recorded).not.toHaveAttribute("open");
  await expect(recorded).toContainText(/^Recorded messagedscr: 0\.6777\d{20,} is below the configured prototype decline floor 1$/);
  expect(await memo.innerText()).not.toMatch(/\d{20}/);
});

test("F-6: housing DTI says why it is missing and what is judged instead", async ({ page }) => {
  const result = await consumerResult(page);
  const housing = result.getByRole("article").filter({ has: page.getByRole("heading", { name: "Housing DTI" }) });
  await expect(housing).toContainText(
    "Not returned by this prototype's consumer decision. Only total (back-end) DTI is compared with the DTI policy lines; Inspect shows how housing DTI is worked out.",
  );
  await expect(housing.getByRole("button", { name: "Inspect Housing DTI", exact: true })).toBeVisible();
});

test("F-14: the brand bar names the workflow on screen", async ({ page }) => {
  await connect(page);
  const brand = page.locator(".workspaceType");
  await expect(brand).toContainText("Commercial underwriting");
  await page.getByRole("button", { name: "Consumer Decision", exact: true }).click();
  await expect(brand).toContainText("Consumer underwriting");
  await page.getByRole("button", { name: "SBA Screen", exact: true }).click();
  await expect(brand).toContainText("SBA screening");
  await page.getByRole("button", { name: "Commercial Assessment", exact: true }).click();
  await expect(brand).toContainText("Commercial underwriting");
});

test.describe("F-11", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("F-11: a pasted column is refused with the way to enter one; a single figure still pastes", async ({ page }) => {
    await openComposer(page);
    const gross = page.getByLabel("Gross receipts · Period 1", { exact: true });
    await page.evaluate(() => navigator.clipboard.writeText("3900000\n2570000\n607000\n"));
    await gross.click();
    await page.keyboard.press("ControlOrMeta+V");
    await expect(gross).toHaveValue("");
    await expect(gross).toHaveAttribute("aria-invalid", "true");
    await expect(gross).toHaveAccessibleDescription(
      /This field takes one value, and the paste had 3 lines\. Paste one figure at a time, or use Excel intake with the standard template to enter a whole column\./,
    );
    await page.evaluate(() => navigator.clipboard.writeText("$3,900,000"));
    await page.keyboard.press("ControlOrMeta+V");
    await expect(gross).toHaveValue("$3,900,000");
    await expect(gross).not.toHaveAttribute("aria-invalid");
  });
});

test.describe("F-4", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("F-4: the memo copies as text with its disclaimer and prints with the known gaps open", async ({ page }) => {
    await page.addInitScript(() => {
      // A browser's print fires beforeprint, captures the page, then fires afterprint.
      window.print = () => {
        window.dispatchEvent(new Event("beforeprint"));
        const scope = document.querySelector<HTMLDetailsElement>(
          '[aria-label="Model scope and policy limitations"] details',
        );
        (window as unknown as { printedScopeOpen: boolean | null }).printedScopeOpen = scope?.open ?? null;
        window.dispatchEvent(new Event("afterprint"));
      };
    });
    await connect(page);
    await page.getByRole("button", { name: "Try the example case", exact: true }).click();
    await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Credit Memo", exact: true }).click();
    const memo = page.getByRole("tabpanel", { name: "Credit Memo" });
    await memo.getByRole("button", { name: "Copy memo as text", exact: true }).click();
    await expect(memo.getByRole("status")).toHaveText("Copied the memo as text.");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain("Approve for prototype demonstration based on the accepted inputs.");
    expect(copied).toContain("Business DSCR: 3.1349x");
    expect(copied).toContain("Prototype demonstration only.");
    expect(copied).not.toContain("Copy memo as text");
    // The copy carries the model's scope and known gaps, and no bare "Recorded message" lines.
    expect(copied).toContain("The weighted-rule score is not a probability of default.");
    expect(copied).toContain("LTV, debt yield, IRR, and NPV are not implemented.");
    expect(copied).not.toContain("Recorded message");
    await memo.getByRole("button", { name: "Print memo", exact: true }).click();
    expect(await page.evaluate(() => (window as unknown as { printedScopeOpen: boolean | null }).printedScopeOpen)).toBe(true);
    await expect(page.getByRole("group").filter({ hasText: "Methodology scope" }).first()).not.toHaveAttribute("open");
  });
});

async function consumerResult(page: Page) {
  await connect(page);
  await page.getByRole("button", { name: "Consumer Decision", exact: true }).click();
  await page.getByLabel("Load sample case", { exact: true }).selectOption("consumer");
  await page.getByRole("button", { name: "Evaluate consumer", exact: true }).click();
  const result = page.getByRole("region", { name: "Consumer result", exact: true });
  await expect(result).toBeVisible();
  return result;
}

const rule = (result: ReturnType<Page["getByRole"]>, label: string) =>
  result.getByRole("listitem").filter({ hasText: label });

test("F-5: consumer rules show the policy line the server judged them against", async ({ page }) => {
  const result = await consumerResult(page);
  await expect(rule(result, "Total DTI · approval rule")).toContainText("Pass · 33.8% · policy below 50.0%");
  await expect(rule(result, "Total DTI · review rule")).toContainText("Pass · 33.8% · policy below 43.0%");
  await expect(rule(result, "Synthetic credit score")).toContainText("Pass · 720 · policy at least 620");
  await expect(rule(result, "Ability-to-repay documentation")).toContainText("Pass · complete");
  await expect(result.getByRole("article").filter({ hasText: "Total DTI" }).getByRole("strong")).toHaveText("33.8%");
});

test("F-5: a DTI just under a policy line never reads as the line", async ({ page }) => {
  // The server's four-place value is 0.4300; the raw value 0.42996 passes the 0.43 review rule.
  await page.route("**/consumer/decision", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    for (const factor of body.factors)
      if (String(factor.name).includes("dti")) Object.assign(factor, { value: "0.4300", raw_value: "0.42996" });
    await route.fulfill({ response, json: body });
  });
  const result = await consumerResult(page);
  await expect(rule(result, "Total DTI · review rule")).toContainText("Pass · 42.996% · policy below 43.0%");
  await expect(result.getByRole("article").filter({ hasText: "Total DTI" }).getByRole("strong")).toHaveText("42.996%");
});

test("F-8: leaving a field nobody typed in shows no error; a typed invalid value still errors on blur", async ({ page }) => {
  await openComposer(page);
  await page.getByLabel("Gross receipts · Period 1", { exact: true }).focus();
  await page.getByLabel("COGS · Period 1", { exact: true }).focus();
  await expect(page.getByRole("region", { name: "Validation summary", exact: true })).toHaveCount(0);
  await page.getByLabel("COGS · Period 1", { exact: true }).fill("12abc");
  await page.getByLabel("Gross receipts · Period 1", { exact: true }).focus();
  await expect(page.getByLabel("COGS · Period 1", { exact: true })).toHaveAttribute("aria-invalid", "true");
});

test("F-8: adding or removing a period or guarantor keeps focus on a field that exists", async ({ page }) => {
  await openComposer(page);
  await page.getByRole("button", { name: "Add financial period", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Period start · Period 2", { exact: true })).toBeFocused();
  await page.keyboard.type("2025-01-01");
  await expect(page.getByLabel("Period start · Period 2", { exact: true })).toHaveValue("2025-01-01");
  await page.getByRole("button", { name: "Remove period 2", exact: true }).click();
  await expect(page.getByLabel("Period start · Period 1", { exact: true })).toBeFocused();
  await page.getByText("Guarantors (0)", { exact: true }).click();
  await page.getByRole("button", { name: "Add guarantor", exact: true }).click();
  await expect(page.locator('[data-pointer^="/guarantors/0/"]').first()).toBeFocused();
  await page.getByRole("button", { name: "Remove guarantor 1", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add guarantor", exact: true })).toBeFocused();
});

test("F-28: the required working-capital fields are open in a new composer", async ({ page }) => {
  await openComposer(page);
  for (const label of ["Working capital period start", "AR increase", "Cash taxes paid"])
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
});

test("F-12: a saved edit in History & Audit names its field and shows exact values", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: "Try the example case", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Initial save");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("region", { name: "Saved revision context", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Debt & Loan", exact: true }).click();
  await page.getByRole("button", { name: "Proposed principal", exact: true }).click();
  await page.getByLabel("New value").fill("600000.10");
  await page.getByLabel("Rationale").fill("Cents-level change");
  await page.getByRole("button", { name: "Save revision", exact: true }).click();
  await expect(page.getByRole("region", { name: "Saved revision context", exact: true })).toContainText(/Revision 2/);
  await page.getByRole("tab", { name: "History & Audit", exact: true }).click();
  const event = page.getByRole("article", { name: "Selected recorded event", exact: true });
  await expect(event.getByRole("strong")).toHaveText("Proposed principal");
  await expect(event.getByRole("strong")).toHaveAttribute("title", "/proposed_loan/amount");
  await expect(event).toContainText(/\$500,000 → \$600,000\.10?(?!\d)/);
  await expect(event).toContainText("Cents-level change");
});

test("F-7: each error-summary link reaches its field on the first click", async ({ page }) => {
  await openComposer(page);
  await page.getByRole("button", { name: "Evaluate assessment", exact: true }).click();
  const summary = page.getByRole("region", { name: "Validation summary", exact: true });
  await expect(summary).toBeVisible();
  // Each field reached is given a value that is still invalid, so leaving it (the next link's mousedown) re-checks
  // it and keeps its error; the summary must not reorder under that click.
  for (const label of ["Gross receipts · Period 1", "AR increase", "Cash taxes paid", "COGS · Period 1"]) {
    await summary.getByRole("button", { name: new RegExp(`^${label}: `) }).click();
    await expect(page.getByLabel(label, { exact: true })).toBeFocused();
    await page.keyboard.type("12abc");
  }
});
