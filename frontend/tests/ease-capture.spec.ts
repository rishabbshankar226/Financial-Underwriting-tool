import type { Page } from "@playwright/test";
import { test, expect } from "./authenticatedTest";
import { ALPINE_EXCEL, EASE_VIEWPORT, ScreenCapture, decisionReady } from "./easeHarness";
import { TEST_API_TOKEN, moreActions, startActions, startScreenTitle } from "./testCredentials";

// Ease-of-use screen capture and state probes for the standalone host. Screenshots are named by the
// inventory IDs in ease/data/screens.md. Runs only with EASE_CAPTURE=1; it is not a regression test.

test.skip(!process.env.EASE_CAPTURE, "Set EASE_CAPTURE=1 to capture ease-of-use screens.");
test.use({ viewport: EASE_VIEWPORT, actionTimeout: 10_000 });
test.describe.configure({ timeout: 300_000 });

const HOST = "standalone";

async function connect(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("API token", { exact: true }).fill(TEST_API_TOKEN);
  await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: startScreenTitle })).toBeVisible();
}

async function example(page: Page): Promise<void> {
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await decisionReady(page).waitFor({ timeout: 30_000 });
}

async function tab(page: Page, name: string): Promise<void> {
  await page.getByRole("tab", { name, exact: true }).click();
  await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute("aria-selected", "true");
}

async function alerts(page: Page): Promise<string> {
  const texts = await page.getByRole("alert").allInnerTexts();
  return texts.map((text) => text.trim()).filter(Boolean).join(" | ");
}

async function saveCase(page: Page, rationale: string): Promise<void> {
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill(rationale);
  await page.getByRole("button", { name: "Save accepted case", exact: true }).click();
  await expect(page.getByRole("region", { name: "Saved revision context", exact: true })).toBeVisible();
}

/** Opens one edit dialog per bad value and records what it says. A value the dialog accepts is
 * recorded as accepted and its evaluation is waited out before the next probe. */
async function probeEdit(capture: ScreenCapture, page: Page, button: string, key: string): Promise<void> {
  const dialog = page.getByRole("dialog");
  for (const [kind, value] of [
    ["letters", "12abc"],
    ["negative", "-1"],
    ["blank", ""],
  ] as const)
    await capture.attempt(`edit:${key}.${kind}`, async () => {
      try {
        await page.getByRole("button", { name: button, exact: true }).first().click();
        await expect(dialog).toBeVisible();
        await dialog.getByLabel("New value").fill(value);
        await dialog.getByLabel(/^Rationale/).fill("Probe");
        const live = await alerts(page);
        await dialog.getByRole("button", { name: /^(Evaluate edit|Save revision)$/ }).click();
        await page.waitForTimeout(150);
        const accepted = !(await dialog.isVisible());
        capture.probe(
          `edit.${key}.${kind}`,
          accepted ? "(accepted)" : `live: ${live || "(none)"} || submit: ${(await alerts(page)) || "(none)"}`,
        );
        if (accepted) await decisionReady(page).waitFor({ timeout: 30_000 });
      } finally {
        if (await dialog.isVisible()) await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
        if (await dialog.isVisible()) await page.keyboard.press("Escape");
      }
    });
}

test("connect screens", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await page.goto("/");
  await capture.attempt("S08", () => capture.shot("S08", "connect"));
  await capture.attempt("S09", async () => {
    await page.getByLabel("API token", { exact: true }).fill("x".repeat(40));
    await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    capture.probe("connect.wrongToken", await alerts(page));
    await capture.shot("S09", "connect-error");
  });
  await capture.attempt("S15", async () => {
    await page.getByLabel("API token", { exact: true }).fill(TEST_API_TOKEN);
    await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: startScreenTitle })).toBeVisible();
    await capture.shot("S15", "start");
    capture.cover(["S10", "S12", "S14"], "S15-start");
  });
  await capture.attempt("S54", async () => {
    await page.getByRole("button", { name: startActions.open, exact: true }).click();
    await expect(page.getByRole("region", { name: "Saved cases", exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
    capture.probe("savedCases.empty", await page.getByRole("region", { name: "Saved cases", exact: true }).innerText());
    await capture.shot("S54", "open-case-empty");
  });
  capture.save("connect");
});

test("workspace on the example: header, decision, tiles and every tab", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await capture.attempt("S19", async () => {
    await page.getByRole("button", { name: startActions.example, exact: true }).click();
    await expect(page.getByRole("status", { name: "Assessment preparation", exact: true })).toBeVisible();
    await capture.shot("S19", "preparation");
    await decisionReady(page).waitFor({ timeout: 30_000 });
  });
  await capture.attempt("S20", async () => {
    await page
      .getByRole("region", { name: "Assessment overview", exact: true })
      .filter({ hasNotText: "Cushion pending" })
      .waitFor();
    await capture.shot("S20", "workspace-first-screen");
    await capture.shot("S29", "spread-full", { fullPage: true });
    capture.cover(["S10", "S12", "S14", "S16", "S17", "S21", "S22", "S23", "S28", "S30", "S76"], "S20-workspace-first-screen");
  });
  await capture.attempt("S11", async () => {
    await page.getByRole("button", { name: "More", exact: true }).click();
    await expect(page.getByRole("group", { name: "More actions", exact: true })).toBeVisible();
    await capture.shot("S11", "more-menu");
    await page.keyboard.press("Escape");
  });
  await capture.attempt("S18", async () => {
    await page.getByRole("button", { name: "Read full notice", exact: true }).click();
    await capture.shot("S18", "prototype-notice-open");
    await page.getByRole("button", { name: "Read full notice", exact: true }).click();
  });
  await capture.attempt("S31", async () => {
    await page.getByRole("button", { name: "Business DSCR", exact: true }).first().click();
    const inspector = page.getByRole("region", { name: "Calculation inspector", exact: true });
    await expect(inspector).toBeVisible();
    await inspector.scrollIntoViewIfNeeded();
    await capture.shot("S31", "calculation-inspector");
    await page.getByRole("button", { name: "Close inspector", exact: true }).click();
  });
  await capture.attempt("S32", async () => {
    await tab(page, "Overview");
    await capture.shot("S32", "overview", { fullPage: true });
    await page.getByText("Policy breakevens", { exact: true }).click();
    await capture.shot("S34", "policy-breakevens", { fullPage: true });
  });
  await capture.attempt("S36", async () => {
    await tab(page, "Debt & Loan");
    await capture.shot("S36", "debt-loan", { fullPage: true });
    await page.getByText("Cent-rounded proposed-loan schedule", { exact: true }).click();
    await capture.shot("S37", "loan-schedule", { fullPage: true });
  });
  await capture.attempt("S38", async () => {
    await tab(page, "Global Cash Flow");
    await capture.shot("S38", "global-cash-flow", { fullPage: true });
  });
  await capture.attempt("S40", async () => {
    await tab(page, "Stress Tests");
    await capture.shot("S40", "stress-no-baseline", { fullPage: true });
    await page.getByText("Coverage grid", { exact: true }).click();
    await capture.shot("S39", "coverage-grid", { fullPage: true });
  });
  await capture.attempt("S47", async () => {
    await tab(page, "Credit Memo");
    await capture.shot("S47", "credit-memo", { fullPage: true });
  });
  await capture.attempt("S48", async () => {
    await tab(page, "History & Audit");
    await capture.shot("S48", "history-unsaved", { fullPage: true });
    capture.cover(["S50", "S52"], "S48-history-unsaved");
  });
  capture.save("workspace");
});

test("edits: every Spread input with bad values", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await example(page);
  try {
    for (const field of [
      "Gross receipts",
      "COGS",
      "Operating expenses",
      "Officer compensation",
      "Depreciation",
      "Amortization",
      "Interest expense",
      "Section 179",
      "K-1 distributions",
    ]) {
      const cell = page.getByRole("button", { name: new RegExp(`^Edit ${field} for `) }).last();
      await capture.attempt(`edit:spread.${field}`, async () => {
        const name = (await cell.getAttribute("aria-label")) ?? (await cell.innerText());
        await probeEdit(capture, page, name, `spread.${field}`);
      });
    }
  } finally {
    capture.save("edits-spread");
  }
});

test("edits: every Debt & Loan and guarantor amount with bad values", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await example(page);
  try {
    await tab(page, "Debt & Loan");
    for (const field of [
      "Annual CPLTD",
      "Annual operating leases",
      "Proposed principal",
      "Annual nominal rate",
      "Loan term",
      "AR increase",
      "Inventory increase",
      "AP increase",
      "Cash taxes paid",
    ])
      await probeEdit(capture, page, field, `debt.${field}`);
    await tab(page, "Global Cash Flow");
    for (const field of [
      "Ownership",
      "Annual wages",
      "Annual interest/dividend income",
      "Annual mortgage P&I",
      "Annual auto debt",
      "Annual card minimum",
    ])
      await probeEdit(capture, page, field, `guarantor.${field}`);
  } finally {
    capture.save("edits-assumptions");
  }
});

test("edits: a draft edit without a rationale, then session history", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await example(page);
  await tab(page, "Debt & Loan");
  await capture.attempt("S57", async () => {
    await page.getByRole("button", { name: "Proposed principal", exact: true }).click();
    await page.getByLabel("New value").fill("600000");
    await page.getByRole("button", { name: "Evaluate edit", exact: true }).click();
    await page.waitForTimeout(150);
    capture.probe("edit.draft.noRationale", (await alerts(page)) || "(accepted without a rationale)");
    await capture.shot("S57", "edit-dialog-rationale");
    if (await page.getByRole("dialog").isVisible()) {
      await page.getByLabel(/^Rationale/).fill("Probe");
      await page.getByRole("button", { name: "Evaluate edit", exact: true }).click();
    }
    await decisionReady(page).waitFor({ timeout: 30_000 });
    await tab(page, "History & Audit");
    await capture.shot("S48b", "history-session-edit", { fullPage: true });
  });
  capture.save("edits-draft");
});

test("saving: dialog, saved context, saved history, stress tests and the review package", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await example(page);
  await capture.attempt("S55", async () => {
    await page.getByRole("button", { name: "Save case", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await capture.shot("S55", "save-dialog");
    await page.getByRole("button", { name: "Save accepted case", exact: true }).click();
    capture.probe("save.blankRationale", (await alerts(page)) || "(none)");
    await page.getByLabel("Save rationale").fill("Capture baseline");
    await page.getByRole("button", { name: "Save accepted case", exact: true }).click();
    await expect(page.getByRole("region", { name: "Saved revision context", exact: true })).toBeVisible();
    await capture.shot("S26", "saved-context");
    capture.cover(["S56"], "S26-saved-context");
  });
  await capture.attempt("S49", async () => {
    await tab(page, "History & Audit");
    await capture.shot("S49", "history-saved", { fullPage: true });
    await page.getByRole("button", { name: "Check replay", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: /Matched|Mismatch|Replay unavailable/ })).toBeVisible();
    await capture.shot("S51", "history-replay-review-package", { fullPage: true });
    capture.cover(["S50"], "S49-history-saved");
  });
  await capture.attempt("S42", async () => {
    await tab(page, "Stress Tests");
    await expect(page.getByRole("region", { name: "Scenario authoring", exact: true })).toBeVisible();
    await capture.shot("S42", "scenario-composer", { fullPage: true });
    await page.getByLabel("Scenario 1 name").fill("");
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
    const summary = page.getByRole("region", { name: "Scenario validation summary", exact: true });
    await expect(summary).toBeVisible();
    capture.probe("scenario.validation", await summary.innerText());
    await capture.shot("S43", "scenario-validation", { fullPage: true });
    await page.getByLabel("Scenario 1 preset").selectOption("revenue");
    await page.getByLabel("Scenario 1 name").fill("Revenue downside");
    await page.getByLabel("Scenario 1 rationale").fill("Capture");
    await page.getByRole("button", { name: "Preview scenarios", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Read-only preview", exact: true })).toBeVisible({ timeout: 30_000 });
    await capture.shot("S44", "scenario-preview", { fullPage: true });
    await page.getByRole("button", { name: "Save reviewed comparison", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Saved comparison", exact: true })).toBeVisible({ timeout: 30_000 });
    await capture.shot("S45", "saved-comparison", { fullPage: true });
    capture.cover(["S46"], "S45-saved-comparison");
  });
  await capture.attempt("S53", async () => {
    await page.getByRole("button", { name: "Open case", exact: true }).click();
    await expect(page.getByRole("region", { name: "Saved cases", exact: true })).toBeVisible();
    await capture.shot("S53", "open-case-list");
  });
  capture.save("saving");
});

test("failures: evaluation, analysis and a saved write that is not confirmed", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await capture.attempt("S24", async () => {
    await page.route("**/commercial/assessment", (route) => route.abort());
    await page.getByRole("button", { name: startActions.example, exact: true }).click();
    await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 30_000 });
    capture.probe("evaluation.networkFailure", await alerts(page));
    await capture.shot("S24", "evaluation-failed");
    await page.unroute("**/commercial/assessment");
    capture.cover(["S25"], "S24-evaluation-failed");
  });
  await capture.attempt("S35", async () => {
    await page.route("**/commercial/analysis", (route) => route.abort());
    await page.goto("/");
    await connect(page);
    await page.getByRole("button", { name: startActions.example, exact: true }).click();
    await page
      .getByRole("region", { name: "Illustrative decision", exact: true })
      .filter({ hasText: /APPROVE|REVIEW|DECLINE/ })
      .filter({ hasNotText: "CALCULATING" })
      .waitFor({ timeout: 30_000 });
    capture.probe("analysis.networkFailure.decisionBar", await page.getByRole("region", { name: "Illustrative decision", exact: true }).innerText());
    await capture.shot("S35", "analysis-failed");
    await tab(page, "Overview");
    capture.probe("analysis.networkFailure.overview", (await page.getByRole("status").allInnerTexts()).join(" | "));
    await capture.shot("S33", "overview-analysis-failed", { fullPage: true });
    await page.unroute("**/commercial/analysis");
  });
  await capture.attempt("S58", async () => {
    await page.goto("/");
    await connect(page);
    await example(page);
    await page.route("**/cases", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
    await page.getByRole("button", { name: "Save case", exact: true }).click();
    await page.getByLabel("Save rationale").fill("Capture failed save");
    await page.getByRole("button", { name: "Save accepted case", exact: true }).click();
    const recovery = page.getByRole("region", { name: "Saved write recovery", exact: true });
    await expect(recovery).toBeVisible({ timeout: 30_000 });
    capture.probe("save.networkFailure", await recovery.innerText());
    await capture.shot("S58", "saved-write-recovery", { fullPage: true });
    await page.getByRole("button", { name: "Review discarding tracking", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await capture.shot("S59", "discard-tracking-dialog");
    await page.getByRole("button", { name: "Keep tracking", exact: true }).click();
    await page.unroute("**/cases");
  });
  capture.save("failures");
});

test("intake: Excel, JSON import, legacy example and the commercial composer", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await capture.attempt("S67", async () => {
    await page.getByRole("button", { name: "Import Excel workbook", exact: true }).click();
    await expect(page.getByRole("region", { name: "Excel intake", exact: true })).toBeVisible();
    await capture.shot("S67", "excel-intake");
    await page.getByLabel("Excel workbook", { exact: true }).setInputFiles({
      name: "statements.xls",
      mimeType: "application/vnd.ms-excel",
      buffer: Buffer.from("not a workbook"),
    });
    await expect(page.getByRole("alert")).toBeVisible();
    capture.probe("excel.wrongType", await alerts(page));
    await capture.shot("S68", "excel-wrong-file");
    await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(ALPINE_EXCEL);
    await expect(page.getByRole("heading", { name: "Review Excel inputs", exact: true })).toBeVisible();
    await capture.shot("S69", "excel-review", { fullPage: true });
    await page.getByRole("button", { name: "Cancel Excel import", exact: true }).click();
  });
  await capture.attempt("S70", async () => {
    await page.goto("/");
    await connect(page);
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: startActions.import, exact: true }).click();
    await (await chooser).setFiles({ name: "case.json", mimeType: "application/json", buffer: Buffer.from("{not json") });
    await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 30_000 });
    capture.probe("json.invalid", await alerts(page));
    await capture.shot("S70", "json-import-invalid");
  });
  await capture.attempt("S33", async () => {
    await page.goto("/");
    await connect(page);
    await page.getByRole("button", { name: startActions.example, exact: true }).click();
    await decisionReady(page).waitFor({ timeout: 30_000 });
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.getByRole("button", { name: moreActions.legacyExample, exact: true }).click();
    await expect(page.getByText("Legacy · undated input", { exact: true })).toBeVisible({ timeout: 30_000 });
    await capture.shot("S33L", "legacy-workspace");
    await tab(page, "Overview");
    await capture.shot("S33", "overview-legacy", { fullPage: true });
  });
  await capture.attempt("S66", async () => {
    await page.getByRole("button", { name: "Commercial Assessment", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Build a dated assessment" })).toBeVisible();
    await capture.shot("S66", "commercial-composer");
    await page.getByRole("button", { name: "Evaluate assessment", exact: true }).click();
    const summary = page.getByRole("region", { name: "Validation summary", exact: true });
    await expect(summary).toBeVisible();
    capture.probe("composer.emptySubmit", await summary.innerText());
    await capture.shot("S65", "composer-validation", { fullPage: true });
  });
  capture.save("intake");
});

test("other products: Consumer DTI and SBA screens with their results and bad inputs", async ({ page }) => {
  const capture = new ScreenCapture(page, HOST);
  await connect(page);
  await capture.attempt("S71", async () => {
    await page.getByRole("button", { name: "Consumer Decision", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Consumer DTI review", exact: true })).toBeVisible();
    await capture.shot("S71", "consumer");
    await page.getByLabel("Gross monthly income").fill("abc");
    await page.getByRole("button", { name: "Evaluate consumer", exact: true }).click();
    capture.probe("consumer.badIncome", (await alerts(page)) || "(none)");
    await page.getByLabel("Load sample case", { exact: true }).selectOption("consumer");
    await page.getByRole("button", { name: "Evaluate consumer", exact: true }).click();
    await expect(page.getByRole("region", { name: "Consumer result", exact: true })).toBeVisible({ timeout: 30_000 });
    await capture.shot("S73", "consumer-result", { fullPage: true });
  });
  await capture.attempt("S74", async () => {
    await page.getByRole("button", { name: "SBA Screen", exact: true }).click();
    await expect(page.getByRole("heading", { name: "SBA eligibility screen", exact: true })).toBeVisible();
    await capture.shot("S74", "sba");
    await page.getByLabel("Load sample case", { exact: true }).selectOption("sba-receipts");
    await page.getByRole("button", { name: "Evaluate SBA screen", exact: true }).click();
    const result = page.getByRole("region", { name: "SBA result", exact: true });
    await expect(result).toBeVisible({ timeout: 30_000 });
    capture.probe("sba.incomplete", await result.innerText());
    await result.scrollIntoViewIfNeeded();
    await capture.shot("S75", "sba-result");
  });
  for (const id of ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S72"]) capture.skip(id, "Streamlit host only");
  for (const id of ["S13", "S27", "S41", "S60", "S61", "S62", "S63", "S64"])
    capture.skip(id, "needs a server state the standalone test backend does not produce on demand");
  capture.save("products");
});
