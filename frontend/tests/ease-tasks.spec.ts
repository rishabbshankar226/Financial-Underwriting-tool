import type { Page } from "@playwright/test";
import { test, expect } from "./authenticatedTest";
import {
  ALPINE_EXCEL,
  EASE_VIEWPORT,
  TaskMeter,
  decisionReady,
  preparationReceived,
  recordDecision,
  recordRatioTiles,
} from "./easeHarness";
import { TEST_API_TOKEN, startActions, startScreenTitle } from "./testCredentials";

// Ease-of-use tasks T1 to T6 on the standalone host, driven by accessible names only.
// Setup outside a task's measured path goes through the plain page; measured actions go through TaskMeter.

test.use({ viewport: EASE_VIEWPORT });
test.describe.configure({ mode: "serial" });

const BORROWER = "Alpine Fabrication";
let savedCaseId = "";

async function connect(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("API token", { exact: true }).fill(TEST_API_TOKEN);
  await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: startScreenTitle })).toBeVisible();
}

async function connectToExample(page: Page): Promise<void> {
  await connect(page);
  await page.getByRole("button", { name: startActions.example, exact: true }).click();
  await decisionReady(page).waitFor({ timeout: 30_000 });
}

test("T1 first run: connect screen to Alpine's decision and its reason", async ({ page }) => {
  const meter = new TaskMeter(page, "standalone", "T1");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Connect workspace", exact: true })).toBeVisible();
  await meter.firstScreen();
  await meter.fill(page.getByLabel("API token", { exact: true }), TEST_API_TOKEN);
  await meter.click(page.getByRole("button", { name: "Connect workspace", exact: true }));
  await meter.answer("start screen", [page.getByRole("heading", { level: 1, name: startScreenTitle })]);
  await meter.click(page.getByRole("button", { name: startActions.example, exact: true }));
  await meter.answer("decision and reason", [decisionReady(page)], { server: preparationReceived(page) });
  await recordDecision(meter, "T1");
  meter.save();
});

test("T2 read the credit: three ratios, their policy lines and the reason", async ({ page }) => {
  const meter = new TaskMeter(page, "standalone", "T2");
  await connectToExample(page);
  const tiles = page.getByRole("region", { name: "Assessment overview", exact: true });
  await tiles.filter({ hasNotText: "Cushion pending" }).waitFor();
  await meter.firstScreen();
  await recordDecision(meter, "T2");
  await recordRatioTiles(meter, "T2");
  // The task needs no action when everything is already on the first screen; record whether it is.
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
  const meter = new TaskMeter(page, "standalone", "T3");
  await connectToExample(page);
  await meter.firstScreen();
  await meter.click(page.getByRole("tab", { name: "Debt & Loan", exact: true }));
  await meter.click(page.getByRole("button", { name: "Proposed principal", exact: true }));
  await meter.fill(page.getByLabel("New value"), "600000");
  // At baseline an unsaved draft edit still demands a rationale before it is evaluated.
  await meter.fill(page.getByLabel("Rationale", { exact: true }), "Larger request for review");
  await meter.click(page.getByRole("button", { name: "Evaluate edit", exact: true }));
  await meter.answer("recalculated decision", [decisionReady(page)], { server: preparationReceived(page) });
  await recordDecision(meter, "T3.recalculated");
  await recordRatioTiles(meter, "T3.recalculated");
  await meter.click(page.getByRole("button", { name: "Save case", exact: true }));
  await meter.fill(page.getByLabel("Save rationale"), "Saved after the loan amount change");
  await meter.click(page.getByRole("button", { name: "Save accepted case", exact: true }));
  const context = page.getByRole("region", { name: "Saved revision context", exact: true });
  await meter.answer("saved", [context]);
  savedCaseId = /Case (\S+) ·/.exec(await context.innerText())?.[1] ?? "";
  expect(savedCaseId).not.toBe("");
  await meter.click(page.getByRole("tab", { name: "History & Audit", exact: true }));
  const revision = page.getByRole("button", { name: /^Open revision \d+$/ }).last();
  await meter.answer("revision in History & Audit", [revision]);
  meter.figure("T3.revision", (await revision.getAttribute("aria-label")) ?? (await revision.innerText()));
  meter.notes.revisionsListed = await page.getByRole("button", { name: /^Open revision \d+$/ }).count();
  meter.save();
});

test("T4 Excel intake: import the Alpine workbook to a decision", async ({ page }) => {
  const meter = new TaskMeter(page, "standalone", "T4");
  await connect(page);
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
  const meter = new TaskMeter(page, "standalone", "T5");
  await connect(page);
  await meter.firstScreen();
  await meter.click(page.getByRole("button", { name: startActions.open, exact: true }));
  await meter.answer("saved cases", [page.getByRole("region", { name: "Saved cases", exact: true })]);
  await meter.click(page.getByRole("button", { name: `Open ${BORROWER} case ${savedCaseId}`, exact: true }));
  await meter.answer("saved case", [decisionReady(page)]);
  await meter.click(page.getByRole("tab", { name: "Credit Memo", exact: true }));
  await meter.answer("credit memo", [page.getByRole("heading", { name: "Credit memo", exact: true })]);
  await recordDecision(meter, "T5");
  meter.figure(
    "T5.memo.recommendation",
    await page.getByText(/for prototype demonstration based on the accepted inputs/).first().innerText(),
  );
  meter.save();
});

test("T6 other products: Consumer DTI review, then SBA screen to incomplete eligibility", async ({ page }) => {
  const meter = new TaskMeter(page, "standalone", "T6");
  await connect(page);
  await meter.firstScreen();
  await meter.click(page.getByRole("button", { name: "Consumer Decision", exact: true }));
  await meter.answer("consumer screen", [page.getByRole("heading", { name: "Consumer DTI review", exact: true })]);
  await meter.choose(page.getByLabel("Load sample case", { exact: true }), "consumer");
  await meter.click(page.getByRole("button", { name: "Evaluate consumer", exact: true }));
  const consumer = page.getByRole("region", { name: "Consumer result", exact: true });
  await meter.answer("consumer outcome", [consumer]);
  meter.figure("T6.consumer.heading", await consumer.getByRole("heading").first().innerText());
  const totalDti = consumer
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Total DTI", exact: true }) });
  meter.figure("T6.consumer.totalDti", (await totalDti.innerText()).split("\n").map((line) => line.trim()).filter(Boolean)[1] ?? "");
  await meter.click(page.getByRole("button", { name: "SBA Screen", exact: true }));
  await meter.answer("SBA screen", [page.getByRole("heading", { name: "SBA eligibility screen", exact: true })]);
  await meter.choose(page.getByLabel("Load sample case", { exact: true }), "sba-receipts");
  await meter.click(page.getByRole("button", { name: "Evaluate SBA screen", exact: true }));
  const sba = page.getByRole("region", { name: "SBA result", exact: true });
  const incomplete = page.getByRole("heading", {
    name: "Incomplete Eligibility — Manual Underwriter Review Required",
    exact: true,
  });
  await meter.answer("SBA incomplete eligibility", [sba, incomplete]);
  meter.figure("T6.sba.heading", await incomplete.innerText());
  for (const prefix of ["Server outcome:", "Size screen:", "Coverage screen:"])
    meter.figure(`T6.sba.${prefix.replace(":", "")}`, await sba.getByText(prefix).first().innerText());
  meter.save();
});
