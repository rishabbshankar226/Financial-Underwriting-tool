import { test, expect, type Page } from "@playwright/test";
import {
  ALPINE_EXCEL,
  EASE_VIEWPORT,
  TaskMeter,
  decisionReady,
  preparationReceived,
  recordDecision,
  recordRatioTiles,
} from "../tests/easeHarness";
import { TEST_STREAMLIT_ACCESS_PASSWORD, startActions, startScreenTitle, unlockStreamlitHost } from "../tests/testCredentials";

// Ease-of-use tasks T1 to T5 on the Streamlit testing host, driven by accessible names only.
// The host has no Consumer or SBA routes, so T6 runs on the standalone host only.

test.use({ viewport: EASE_VIEWPORT });
test.describe.configure({ mode: "serial", timeout: 120_000 });

const BORROWER = "Alpine Fabrication";
const HOST_START = 30_000;
let savedCaseId = "";

async function unlock(page: Page): Promise<void> {
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.getByRole("heading", { level: 1, name: startScreenTitle })).toBeVisible({ timeout: HOST_START });
}

async function unlockToExample(page: Page): Promise<void> {
  await unlock(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await decisionReady(page).waitFor({ timeout: HOST_START });
}

test("T1 first run: access screen to Alpine's decision and its reason", async ({ page }) => {
  const meter = new TaskMeter(page, "streamlit", "T1");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open workspace", exact: true })).toBeVisible({ timeout: HOST_START });
  await meter.firstScreen();
  await meter.fill(page.getByLabel("Access password", { exact: true }), TEST_STREAMLIT_ACCESS_PASSWORD);
  await meter.click(page.getByRole("button", { name: "Open workspace", exact: true }));
  await meter.answer("start screen", [page.getByRole("heading", { level: 1, name: startScreenTitle })], {
    timeout: HOST_START,
  });
  await meter.click(page.getByRole("button", { name: startActions.example, exact: true }));
  await meter.answer("decision and reason", [decisionReady(page)], { server: preparationReceived(page) });
  await recordDecision(meter, "T1");
  meter.save();
});

test("T2 read the credit: three ratios, their policy lines and the reason", async ({ page }) => {
  const meter = new TaskMeter(page, "streamlit", "T2");
  await unlockToExample(page);
  const tiles = page.getByRole("region", { name: "Assessment overview", exact: true });
  await tiles.filter({ hasNotText: "Cushion pending" }).waitFor();
  await meter.firstScreen();
  await recordDecision(meter, "T2");
  await recordRatioTiles(meter, "T2");
  const bar = page.getByRole("region", { name: "Illustrative decision", exact: true });
  meter.notes.reasonInFirstViewport = await meter.inFirstViewport(bar.getByRole("paragraph").first());
  for (const label of ["Business DSCR", "Global DSCR", "FCCR"]) {
    const name = tiles.getByText(label, { exact: true });
    meter.notes[`${label} inFirstViewport`] = await meter.inFirstViewport(name);
    meter.notes[`${label} description`] = await name.evaluate(
      (element) => element.getAttribute("title") ?? element.getAttribute("aria-describedby") ?? "",
    );
  }
  for (const label of ["Business DSCR", "Global DSCR", "FCCR"])
    expect(meter.figures[`T2.${label}.policy`], `${label} policy line`).toMatch(/^Minimum /);
  meter.save();
});

test("T3 adjust and save: new loan amount, recalculated decision, saved revision in History", async ({ page }) => {
  const meter = new TaskMeter(page, "streamlit", "T3");
  await unlockToExample(page);
  await meter.firstScreen();
  await meter.click(page.getByRole("tab", { name: "Debt & Loan", exact: true }));
  await meter.click(page.getByRole("button", { name: "Proposed principal", exact: true }));
  await meter.fill(page.getByLabel("New value"), "600000");
  await meter.click(page.getByRole("button", { name: "Evaluate edit", exact: true }));
  await meter.answer("recalculated decision", [decisionReady(page)], { server: preparationReceived(page) });
  await recordDecision(meter, "T3.recalculated");
  await recordRatioTiles(meter, "T3.recalculated");
  await meter.click(page.getByRole("button", { name: "Save case", exact: true }));
  await meter.fill(page.getByLabel("Save rationale"), "Saved after the loan amount change");
  await meter.click(page.getByRole("button", { name: "Save", exact: true }));
  const context = page.getByRole("region", { name: "Saved revision context", exact: true });
  await meter.answer("saved", [context]);
  // The identifiers sit in a closed "Record details" disclosure, so read the text content.
  savedCaseId = /Case (\S+) ·/.exec((await context.textContent()) ?? "")?.[1] ?? "";
  expect(savedCaseId).not.toBe("");
  await meter.click(page.getByRole("tab", { name: "History & Audit", exact: true }));
  const revision = page.getByRole("button", { name: /^Open revision \d+$/ }).last();
  await meter.answer("revision in History & Audit", [revision]);
  meter.figure("T3.revision", (await revision.getAttribute("aria-label")) ?? (await revision.innerText()));
  meter.notes.revisionsListed = await page.getByRole("button", { name: /^Open revision \d+$/ }).count();
  meter.save();
});

test("T4 Excel intake: import the Alpine workbook to a decision", async ({ page }) => {
  const meter = new TaskMeter(page, "streamlit", "T4");
  await unlock(page);
  await meter.firstScreen();
  await meter.click(page.getByRole("button", { name: "Import Excel workbook", exact: true }));
  await meter.upload(page.getByLabel("Excel workbook", { exact: true }), ALPINE_EXCEL);
  await meter.answer("review inputs", [page.getByRole("heading", { name: "Review Excel inputs", exact: true })]);
  await meter.click(page.getByRole("button", { name: "Evaluate Excel inputs", exact: true }));
  await meter.answer("decision and reason", [decisionReady(page)], { server: preparationReceived(page) });
  await recordDecision(meter, "T4");
  meter.save();
});

test("T5 reopen to memo: open T3's saved case and reach the Credit Memo", async ({ page }) => {
  expect(savedCaseId, "T3 saves the case this task reopens").not.toBe("");
  const meter = new TaskMeter(page, "streamlit", "T5");
  await unlock(page);
  await meter.firstScreen();
  await meter.click(page.getByRole("button", { name: startActions.open, exact: true }));
  await meter.answer("saved cases", [page.getByRole("region", { name: "Saved cases", exact: true })]);
  await meter.click(page.getByRole("button", { name: `Open ${BORROWER} case ${savedCaseId}`, exact: true }));
  await meter.answer("saved case", [decisionReady(page)], { timeout: HOST_START });
  await meter.click(page.getByRole("tab", { name: "Credit Memo", exact: true }));
  await meter.answer("credit memo", [page.getByRole("heading", { name: "Credit memo", exact: true })]);
  await recordDecision(meter, "T5");
  meter.figure(
    "T5.memo.recommendation",
    await page.getByText(/for prototype demonstration based on the accepted inputs/).first().innerText(),
  );
  meter.save();
});
