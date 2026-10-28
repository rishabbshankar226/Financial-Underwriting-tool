import { test, expect, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { BASE, HOST, LABEL, Meter, RUN, TOKEN } from "./meter";

const ROOT = process.env.FRICTION_OUT ?? new URL("./out", import.meta.url).pathname;
test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });

const startHeading = (page: Page) => page.getByRole("heading", { level: 1, name: "Start a credit analysis" });
const decisionBar = (page: Page) => page.getByRole("region", { name: "Illustrative decision", exact: true });
const settledTiles = (page: Page) =>
  page.getByRole("region", { name: "Assessment overview", exact: true }).filter({ hasNotText: "Cushion pending" });
const decided = (page: Page) => [decisionBar(page).filter({ hasNotText: "CALCULATING" }), settledTiles(page)];

async function dump(page: Page, name: string) {
  if (RUN !== 1) return;
  const dir = `${ROOT}/explore/${LABEL}-${HOST}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${name}.yml`, await page.locator("body").ariaSnapshot());
  await page.screenshot({ path: `${dir}/${name}-full.jpg`, fullPage: true, quality: 50 });
}

/** Setup, not counted: reach the start screen. */
async function open(page: Page) {
  await page.goto(BASE);
  if (HOST === "standalone") {
    await page.getByLabel("API token", { exact: true }).fill(TOKEN);
    await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  }
  await startHeading(page).waitFor({ timeout: 60_000 });
}

async function example(page: Page) {
  await page.getByRole("button", { name: "Try the example case", exact: true }).click();
  for (const target of decided(page)) await target.waitFor({ timeout: 30_000 });
}

const tileValue = async (page: Page, label: string) =>
  (await settledTiles(page).getByText(label, { exact: true }).locator("xpath=..").innerText()).replace(/\s+/g, " ");

test("T1 first load to the first computed DSCR", async ({ page }) => {
  const m = new Meter(page, "T1");
  await page.goto(BASE);
  if (HOST === "standalone") {
    m.screen("Connect");
    await m.paste(page.getByLabel("API token", { exact: true }), TOKEN, "API token");
    await m.click(page.getByRole("button", { name: "Connect workspace", exact: true }), "Connect workspace");
  }
  await m.answer("start screen", [startHeading(page)], 60_000);
  m.screen("Start");
  await m.click(page.getByRole("button", { name: "Try the example case", exact: true }), "Try the example case");
  m.screen("Workspace");
  await m.answer("first DSCR", decided(page));
  m.notes.dscr = await tileValue(page, "Business DSCR");
  m.save();
});

test("T2 enter a two-year commercial spread and see EBITDA and DSCR", async ({ page }) => {
  await open(page);
  const m = new Meter(page, "T2");
  m.screen("Start");
  await m.click(page.getByRole("button", { name: "Commercial Assessment", exact: true }), "Commercial Assessment (nav)");
  m.screen("Composer");
  await m.click(page.getByLabel("Borrower name", { exact: true }), "Borrower name");
  const tabs: Record<string, number> = {};
  const enter = async (label: string, value: string, back = false) => {
    tabs[label] = await m.tabTo(label, back);
    await m.type(value);
  };
  await m.type("Alpine Fabrication");
  await enter("Geography", "60601");
  await enter("Assessment as of", "2026-10-06");
  const years = [
    ["2024-01-01", "2024-12-31", "3900000", "2570000", "607000", "175000", "90000", "10000", "58000", "0", "280000"],
    ["2025-01-01", "2025-12-31", "4200000", "2750000", "640000", "180000", "95000", "10000", "62000", "40000", "300000"],
  ];
  const fields = [
    "Period start", "Period end", "Gross receipts", "COGS", "Operating expenses", "Officer compensation",
    "Depreciation", "Amortization", "Interest expense", "Section 179", "K-1 distributions",
  ];
  for (const [p, values] of years.entries()) {
    const period = p + 1;
    if (period === 2) {
      tabs["Add financial period"] = await m.tabTo("Add financial period");
      await m.key("Enter", "Add financial period", true);
      // Focus after adding: the user must reach the new period's first field.
      m.notes.focusAfterAdd = await m.focused();
      tabs["Period start · Period 2 (back)"] = await m.tabTo("Period start · Period 2", true);
      await m.type(values[0]);
      for (const [i, field] of fields.entries()) if (i > 0) await enter(`${field} · Period ${period}`, values[i]);
    } else {
      for (const [i, field] of fields.entries()) await enter(`${field} · Period ${period}`, values[i]);
    }
  }
  await enter("Annual CPLTD", "58000");
  await enter("Annual operating lease", "24000");
  await enter("Requested principal", "500000");
  await enter("Annual nominal rate", "0.105");
  await enter("Loan term", "120");
  tabs["Working capital and cash taxes"] = await m.tabTo("Working capital and cash taxes");
  // Open the section only if it is closed (a user would not press Enter on an open one).
  const wcOpen = await page.locator("details", { has: page.locator("summary", { hasText: "Working capital and cash taxes" }) }).getAttribute("open");
  m.notes.workingCapitalOpenByDefault = wcOpen !== null;
  if (wcOpen === null) await m.key("Enter", "Working capital and cash taxes", true);
  const wc: [RegExp, string][] = [
    [/start/i, "2025-01-01"], [/end/i, "2025-12-31"], [/receivable|\bAR\b/i, "140000"],
    [/inventory/i, "60000"], [/payable|\bAP\b/i, "50000"], [/tax/i, "95000"],
  ];
  const wcLabels: string[] = [];
  for (let i = 0; i < 12 && wcLabels.length < 6; i++) {
    await m.key("Tab");
    const label = await m.focused();
    const match = wc.find(([pattern]) => pattern.test(label));
    if (match && !wcLabels.includes(label)) {
      wcLabels.push(label);
      await m.type(match[1]);
    }
  }
  m.notes.workingCapitalLabels = wcLabels;
  tabs["Evaluate assessment"] = await m.tabTo("Evaluate assessment");
  await m.key("Enter", "Evaluate assessment", true);
  m.notes.tabsPerField = tabs;
  m.notes.extraTabs = Object.values(tabs).reduce((s, n) => s + n, 0) - Object.keys(tabs).length;
  try {
    await m.answer("EBITDA and DSCR", decided(page));
    m.screen("Workspace");
    m.notes.ebitda = await tileValue(page, "EBITDA");
    m.notes.dscr = await tileValue(page, "Business DSCR");
  } catch (error) {
    m.status = `blocked: ${String(error).slice(0, 120)}`;
    await dump(page, "T2-blocked");
  }
  m.save();
});

test("T3 why a deal was declined, to the factor behind its first reason code", async ({ page }) => {
  await open(page);
  await example(page);
  await page.getByRole("tab", { name: "Debt & Loan", exact: true }).click();
  await page.getByRole("button", { name: "Proposed principal", exact: true }).click();
  await page.getByLabel("New value").fill("5000000");
  await page.getByRole("button", { name: "Evaluate edit", exact: true }).click();
  await decisionBar(page).filter({ hasText: "DECLINE" }).waitFor({ timeout: 30_000 });
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  const m = new Meter(page, "T3");
  m.screen("Overview");
  m.notes.decision = (await decisionBar(page).innerText()).replace(/\s+/g, " ");
  await m.click(page.getByRole("tab", { name: "Credit Memo", exact: true }), "Credit Memo tab (where reason codes are listed)");
  m.screen("Credit Memo");
  const memo = page.getByRole("tabpanel", { name: "Credit Memo" });
  const firstReason = memo.getByRole("heading", { name: "Recorded reasons" }).locator("xpath=following-sibling::ul[1]/li[1]");
  m.notes.firstReason = await m.read(firstReason, "first recorded reason");
  m.notes.reasonNamesFactor = /^Business DSCR\b/.test(String(m.notes.firstReason));
  if (m.notes.reasonNamesFactor) {
    // The reason names its factor with value and line, so it is the factor detail; no further step.
    m.notes.factor = m.notes.firstReason;
    await dump(page, "T3-end");
    m.save();
    return;
  }
  await m.click(page.getByRole("tab", { name: "Overview", exact: true }), "Overview tab (factor detail)");
  const factor = page
    .getByRole("region", { name: "Why this decision" })
    .getByRole("listitem")
    .filter({ hasText: /^Business DSCR\s*Below/ })
    .first();
  m.notes.factor = (await m.read(factor, "Business DSCR policy factor")).replace(/\s+/g, " ");
  await dump(page, "T3-end");
  m.save();
});

test("T4 saved-revision edit with a rationale, found in History & Audit", async ({ page }) => {
  await open(page);
  await example(page);
  const m = new Meter(page, "T4");
  m.screen("Workspace");
  await m.click(page.getByRole("button", { name: "Save case", exact: true }), "Save case");
  m.screen("Save dialog");
  await m.click(page.getByLabel("Save rationale"), "Save rationale");
  await m.type("Initial save of the example");
  await m.click(page.getByRole("button", { name: "Save", exact: true }), "Save");
  await m.answer("saved", [page.getByRole("region", { name: "Saved revision context", exact: true })]);
  await m.click(page.getByRole("tab", { name: "Debt & Loan", exact: true }), "Debt & Loan tab");
  m.screen("Debt & Loan");
  await m.click(page.getByRole("button", { name: "Proposed principal", exact: true }), "Proposed principal");
  m.screen("Edit dialog");
  m.notes.focusInDialog = await m.focused();
  if (!(m.notes.focusInDialog as string).startsWith("New value")) await m.click(page.getByLabel("New value"), "New value");
  await m.key("ControlOrMeta+A");
  await m.type("600000");
  m.notes.tabsToRationale = await m.tabTo("Rationale");
  await m.type("Lower principal after review");
  await m.click(page.getByRole("button", { name: "Save revision", exact: true }), "Save revision");
  await m.answer("revision 2", [page.getByRole("region", { name: "Saved revision context", exact: true }).filter({ hasText: /Revision 2/ })]);
  m.notes.confirmation = await page.getByRole("status").allInnerTexts().catch(() => []);
  await m.click(page.getByRole("tab", { name: "History & Audit", exact: true }), "History & Audit tab");
  m.screen("History & Audit");
  await dump(page, "T4-history");
  const entry = page.getByText("Lower principal after review").first();
  m.notes.entry = await m.read(entry.locator("xpath=ancestor::li[1] | ancestor::article[1]").first(), "edit entry with rationale").catch(
    async () => m.read(entry, "edit rationale"),
  );
  m.save();
});

test("T5 consumer front-end and back-end DTI against policy", async ({ page }) => {
  test.skip(HOST === "streamlit", "Consumer is not offered on the Streamlit host (N-5)");
  await open(page);
  const m = new Meter(page, "T5");
  m.screen("Start");
  await m.click(page.getByRole("button", { name: "Consumer Decision", exact: true }), "Consumer Decision (nav)");
  m.screen("Consumer");
  await m.choose(page.getByLabel("Load sample case", { exact: true }), "consumer", "Load sample case");
  await m.click(page.getByRole("button", { name: "Evaluate consumer", exact: true }), "Evaluate consumer");
  const result = page.getByRole("region", { name: "Consumer result", exact: true });
  await m.answer("consumer result", [result]);
  const text = (await m.read(result, "Consumer result")).replace(/\s+/g, " ");
  m.notes.result = text;
  m.notes.backEndPolicyLineShown = /43(\.0+)?%|50(\.0+)?%/.test(text);
  m.notes.frontEndShown = /Housing DTI \(?[\d.]+%/.test(text);
  if (!m.notes.frontEndShown) m.status = "partly blocked: front-end (housing) DTI is not returned, so it cannot be read";
  await dump(page, "T5-end");
  m.save();
});

test("T6 SBA case that fails closed: what failed and why", async ({ page }) => {
  test.skip(HOST === "streamlit", "SBA is not offered on the Streamlit host (N-5)");
  await open(page);
  const m = new Meter(page, "T6");
  m.screen("Start");
  await m.click(page.getByRole("button", { name: "SBA Screen", exact: true }), "SBA Screen (nav)");
  m.screen("SBA");
  await m.choose(page.getByLabel("Load sample case", { exact: true }), "sba-receipts", "Load sample case");
  await m.click(page.getByLabel("NAICS code", { exact: true }), "NAICS code");
  await m.key("ControlOrMeta+A");
  await m.type("115310");
  await m.click(page.getByRole("button", { name: "Evaluate SBA screen", exact: true }), "Evaluate SBA screen");
  const outcome = page.getByRole("alert").or(page.getByRole("region", { name: "SBA result", exact: true }));
  await m.answer("SBA outcome", [outcome]);
  await page.waitForTimeout(300);
  const messages = (await page.getByRole("alert").allInnerTexts()).map((t) => t.replace(/\s+/g, " "));
  m.notes.messages = messages;
  m.notes.namesTheCause = messages.some((t) => /115310|exception|NAICS/i.test(t));
  if (!m.notes.namesTheCause) m.status = "blocked: the screen never says what failed (unsupported NAICS row)";
  await dump(page, "T6-end");
  m.save();
});

test("T7 get a summary of a finished deal out of the app", async ({ page }) => {
  await open(page);
  await example(page);
  const m = new Meter(page, "T7");
  m.screen("Workspace");
  await m.click(page.getByRole("tab", { name: "Credit Memo", exact: true }), "Credit Memo tab");
  m.screen("Credit Memo");
  const panel = page.getByRole("tabpanel", { name: "Credit Memo" });
  m.notes.inAppOutActions = await panel.getByRole("button", { name: /print|copy|export|download/i }).count();
  m.notes.anyOutActionOnPage = await page.getByRole("button", { name: /print|copy|export|download|csv/i }).allInnerTexts();
  const copy = panel.getByRole("button", { name: "Copy memo as text", exact: true });
  if (await copy.count()) {
    await m.click(copy, "Copy memo as text");
    await m.answer("copied", [panel.getByRole("status").filter({ hasText: "Copied" })]);
    m.notes.copied = (await page.evaluate(() => navigator.clipboard.readText())).slice(0, 160);
  } else {
    // The only remaining route is the browser's own print command; counted as one keystroke, not pressed.
    m.keystrokes += 1;
  }
  await page.emulateMedia({ media: "print" });
  if (RUN === 1) await page.screenshot({ path: `${ROOT}/shots/${LABEL}/${HOST}/T7-print-preview.jpg`, fullPage: true, quality: 50 });
  await page.emulateMedia({ media: "screen" });
  if (m.notes.inAppOutActions === 0) m.status = "completed only via the browser's print command; no in-app print, copy or export";
  m.save();
});

test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus) await dump(page, `${info.title.slice(0, 2)}-failure`);
});

expect.configure({ timeout: 15_000 });
