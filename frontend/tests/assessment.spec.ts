import { test, expect } from "@playwright/test";

test("dated workspace shows all periods, server facts and policy trace", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(
    page.getByText("Dated assessment", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("table")).toContainText("2024-01-01");
  await expect(page.locator("table")).toContainText("2025-12-31");
  await expect(page.locator("table")).toContainText("Section 179");
  await expect(page.locator("table")).toContainText("Ordinary business income");
  await page
    .getByRole("button", { name: "2024-01-01 – 2024-12-31", exact: true })
    .click();
  await expect(
    page.getByText("Coverage period: 2025-01-01 – 2025-12-31", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "details", exact: true }).click();
  await expect(
    page.getByText("prototype-2026-10-03", { exact: true }),
  ).toBeVisible();
  await page
    .locator("details")
    .filter({ hasText: "dscr" })
    .first()
    .locator("summary")
    .click();
  await expect(page.locator("details[open]")).toContainText("operands");
});

test("malformed import invalidates the result and memo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.locator("input[type=file]").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{"),
  });
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await page.getByRole("button", { name: "memo", exact: true }).click();
  await expect(page.locator(".memo")).not.toContainText(
    "Approve for prototype",
  );
  await expect(
    page.getByRole("button", { name: "Re-evaluate last accepted case" }),
  ).toBeVisible();
});

test("failed edits remain drafts and retry records the edit once", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.route("**/commercial/assessment", (route) => route.abort());
  await page
    .getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    })
    .click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Synthetic lower revenue");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await page.getByRole("button", { name: "history", exact: true }).click();
  await expect(
    page.getByText("No applied edits this session.", { exact: true }),
  ).toBeVisible();
  await page.unroute("**/commercial/assessment");
  await page
    .getByRole("button", { name: "Retry submitted draft", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await expect(page.locator(".audit")).toHaveCount(1);
  await expect(page.locator(".audit")).toContainText("/years/1/gross_receipts");
});

import { readFileSync } from "node:fs";
const dated = JSON.parse(
  readFileSync(
    new URL("../../backend/fixtures/alpine_dated.json", import.meta.url),
    "utf8",
  ),
);
const uploadJson = (name: string, value: unknown) => ({
  name,
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(value)),
});

test("latest selection wins over an older delayed backend response", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  let release!: () => void;
  let entered!: () => void;
  const enteredPromise = new Promise<void>((resolve) => (entered = resolve));
  const releasePromise = new Promise<void>((resolve) => (release = resolve));
  const finished = new Promise<void>((resolve) => {
    page.route("**/commercial/assessment", async (route) => {
      if (route.request().postDataJSON().borrower_name === "Old selection") {
        const response = await route.fetch();
        entered();
        await releasePromise;
        await route.fulfill({ response }).catch(() => {});
        resolve();
      } else await route.continue();
    });
  });
  await page
    .locator("input[type=file]")
    .setInputFiles(
      uploadJson("old.json", { ...dated, borrower_name: "Old selection" }),
    );
  await enteredPromise;
  await page
    .locator("input[type=file]")
    .setInputFiles(
      uploadJson("new.json", { ...dated, borrower_name: "Latest selection" }),
    );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Latest selection",
  );
  release();
  await finished;
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Latest selection",
  );
});

test("older file read cannot overwrite a newer malformed selection", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const read = File.prototype.text;
    File.prototype.text = function () {
      if (this.name !== "delayed.json") return read.call(this);
      return new Promise<string>((resolve) => {
        (window as any).releaseFile = async () =>
          resolve(await read.call(this));
      });
    };
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page
    .locator("input[type=file]")
    .setInputFiles(uploadJson("delayed.json", dated));
  await page.locator("input[type=file]").setInputFiles({
    name: "malformed.json",
    mimeType: "application/json",
    buffer: Buffer.from("{"),
  });
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await page.evaluate(() => (window as any).releaseFile());
  await expect(page.locator(".uploadbar")).toContainText("malformed.json");
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
});

test("dialog validation, keyboard focus and cancellation preserve the accepted result", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const edit = page.getByRole("button", {
    name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
    exact: true,
  });
  await edit.click();
  await expect(page.getByLabel("New value")).toBeFocused();
  await page.getByLabel("New value").fill("1");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("rationale");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("New value")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(edit).toBeFocused();
  await page.getByRole("button", { name: "history", exact: true }).click();
  await expect(
    page.getByText("No applied edits this session.", { exact: true }),
  ).toBeVisible();
});

test("incomplete successful response is unavailable and never becomes a memo", async ({
  page,
}) => {
  await page.route("**/commercial/assessment", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    delete body.policy_snapshot;
    await route.fulfill({ response, json: body });
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await expect(page.getByRole("alert")).toContainText("policy");
  await page.getByRole("button", { name: "memo", exact: true }).click();
  await expect(page.locator(".memo")).toContainText("No current decision");
});

test("exact import byte limit is accepted and one byte over clears the result", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const raw = JSON.stringify(dated);
  const padded = Buffer.from(
    raw + " ".repeat(1_000_000 - Buffer.byteLength(raw)),
  );
  await page.locator("input[type=file]").setInputFiles({
    name: "limit.json",
    mimeType: "application/json",
    buffer: padded,
  });
  await expect(page.locator(".uploadbar")).toContainText("limit.json");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.locator("input[type=file]").setInputFiles({
    name: "oversize.json",
    mimeType: "application/json",
    buffer: Buffer.concat([padded, Buffer.from(" ")]),
  });
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await expect(page.getByRole("alert")).toContainText("1,000,000 bytes");
});

test("desktop and mobile workflow fits and has no application console errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (["warning", "error"].includes(msg.type())) errors.push(msg.text());
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "spread", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`spread-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: "details", exact: true }).click();
    await page
      .locator("details")
      .filter({ hasText: "current.dscr" })
      .first()
      .locator("summary")
      .click();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`details-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: "spread", exact: true }).click();
    await page
      .getByRole("button", {
        name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
        exact: true,
      })
      .click();
    await page.screenshot({
      path: testInfo.outputPath(`edit-${viewport.width}.png`),
      fullPage: true,
    });
    await page.keyboard.press("Escape");
  }
  await page.locator('input[type=file]').setInputFiles({ name:'rejected.json',mimeType:'application/json',buffer:Buffer.from('{') });
  await expect(page.locator('.decision strong')).toHaveText('UNAVAILABLE');
  for (const width of [390,1440]) {
    await page.setViewportSize({ width,height:1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path:testInfo.outputPath(`unavailable-${width}.png`),fullPage:true });
  }
  expect(errors).toEqual([]);
});

test("assumption rate and signed working-capital edits use their API units", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "assumptions", exact: true }).click();
  await page
    .getByRole("button", { name: "Annual nominal rate", exact: true })
    .click();
  await expect(page.getByLabel("New value")).toHaveValue("10.5");
  await page.getByLabel("New value").fill("12.5");
  await page.getByLabel("Rationale").fill("Synthetic rate change");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(
    page.locator(".assumption").filter({ hasText: "Annual nominal rate" }),
  ).toContainText("12.5%");
  await page.getByRole("button", { name: "AR increase", exact: true }).click();
  await page.getByLabel("New value").fill("-1000");
  await page.getByLabel("Rationale").fill("Synthetic AR release");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(
    page.locator(".assumption").filter({ hasText: "AR increase" }),
  ).toContainText("-1,000");
  await page.getByRole("button", { name: "history", exact: true }).click();
  await expect(page.locator(".audit")).toHaveCount(2);
  await expect(page.locator(".audit").first()).toContainText("0.105 → 0.125");
});

test("unavailable ratios and absent guarantors have explicit explanations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const input = structuredClone(dated);
  input.proposed_loan.amount = 0;
  input.existing_debt.cpltd_annual = 0;
  input.years[1].interest_expense = 0;
  input.guarantors = [];
  await page
    .locator("input[type=file]")
    .setInputFiles(uploadJson("no-debt.json", input));
  await expect(page.locator(".decision strong")).toHaveText("REVIEW");
  await expect(
    page.locator(".metric").filter({ hasText: /^DSCR/ }),
  ).toContainText("Not applicable");
  await page.getByRole("button", { name: "details", exact: true }).click();
  await page
    .locator("details")
    .filter({ hasText: "current.dscr" })
    .first()
    .locator("summary")
    .click();
  await expect(page.locator("details[open]")).toContainText("denominator");
  await expect(
    page.getByText("Business-only fallback; no guarantor contributions.", {
      exact: true,
    }),
  ).toBeVisible();
});
