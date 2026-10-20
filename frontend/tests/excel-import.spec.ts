import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { zipSync, unzipSync, strFromU8, strToU8 } from "fflate";
import { test, expect } from "./authenticatedTest";
import {
  connectWorkspace,
  collectConsoleProblems,
  expectNoOverflow,
  disconnect,
} from "./testCredentials";
import { parseWorkbook } from "../src/excel/workbookReader";
import { makeCreate, RECOVERY_KEY } from "../src/caseRecovery";
import { readWorkspaceMemory, writeWorkspaceMemory } from "./workspaceMemory";
const path = fileURLToPath(
  new URL(
    "../src/excel/templates/spreadline-alpine-example-v1.xlsx",
    import.meta.url,
  ),
);
const fixture = JSON.parse(
  readFileSync(
    new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url),
    "utf8",
  ),
);
async function open(page: import("@playwright/test").Page) {
  await page.goto("/");
  await connectWorkspace(page, { example: false });
  await page
    .getByRole("button", { name: "Import Excel workbook", exact: true })
    .click();
}
test("Excel upload stays local until explicit evaluation and sends the existing exact request", async ({
  page,
}) => {
  const problems = collectConsoleProblems(page),
    posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(new URL(r.url()).pathname);
  });
  await open(page);
  const download = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download filled Excel example", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "spreadline-alpine-example-v1.xlsx",
  );
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toBeVisible();
  await page.getByText("Financials", { exact: true }).last().click();
  await expect(
    page.getByLabel("Revenue · Year 2", { exact: true }),
  ).toHaveValue("4200000");
  expect(posts).toEqual([]);
  const sent = page.waitForRequest((r) =>
    r.url().endsWith("/commercial/assessment"),
  );
  await page
    .getByRole("button", { name: "Evaluate Excel inputs", exact: true })
    .click();
  expect((await sent).postDataJSON()).toEqual(fixture);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  expect(posts.filter((p) => p === "/cases")).toEqual([]);
  expect(problems).toEqual([]);
});
test("Excel review corrections preserve precision and source-mapped server errors", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toBeVisible();
  await page.getByText("Financials", { exact: true }).last().click();
  const revenue = page.getByLabel("Revenue · Year 2", { exact: true });
  await revenue.fill("4200000.000000000000000001");
  await page.route("**/commercial/assessment", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "Review original field",
        errors: {
          version: "field-errors-v1",
          truncated: false,
          items: [
            {
              pointer: "/years/1/gross_receipts",
              code: "review_input",
              message: "Check this source amount.",
              limit: "0",
            },
          ],
        },
      }),
    }),
  );
  await page
    .getByRole("button", { name: "Evaluate Excel inputs", exact: true })
    .click();
  await expect(revenue).toBeFocused();
  await expect(revenue).toHaveValue("4200000.000000000000000001");
  const summary = page.getByRole("region", {
    name: "Excel validation summary",
    exact: true,
  });
  await expect(summary).toContainText("Financials!C10");
  await expect(summary).toContainText("review_input");
  await revenue.fill("4300000");
  await expect(revenue).not.toHaveAttribute("aria-invalid", "true");
});
test("cancelling an Excel import preserves the previously accepted case", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Excel intake", exact: true }).click();
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cancel Excel import", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Alpine Fabrication",
  );
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
});
test("Excel review fits mobile and desktop and clears on disconnect", async ({
  page,
}, info) => {
  const problems = collectConsoleProblems(page);
  await open(page);
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toBeVisible();
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 950 });
    await expectNoOverflow(page);
    await page.screenshot({
      path: info.outputPath(`excel-review-${width}.png`),
      fullPage: true,
    });
  }
  await disconnect(page);
  await expect(
    page.getByRole("heading", { name: "Connect the workspace", exact: true }),
  ).toBeVisible();
  await connectWorkspace(page, { example: false });
  await page
    .getByRole("button", { name: "Import Excel workbook", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toHaveCount(0);
  expect(problems).toEqual([]);
});
test("a timed-out reader is terminated and an explicit cancel stops the next reader", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as unknown as {
      excelTerminated: number;
      Worker: unknown;
    };
    state.excelTerminated = 0;
    state.Worker = class {
      onmessage: unknown;
      onerror: unknown;
      onmessageerror: unknown;
      postMessage() {}
      terminate() {
        state.excelTerminated++;
      }
    };
  });
  await open(page);
  await page.clock.install();
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await expect(
    page.getByRole("button", { name: "Cancel reading workbook", exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(5100);
  await expect(page.getByRole("alert")).toContainText("five-second");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { excelTerminated: number }).excelTerminated,
      ),
    )
    .toBe(1);
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await page
    .getByRole("button", { name: "Cancel reading workbook", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { excelTerminated: number }).excelTerminated,
      ),
    )
    .toBe(2);
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await page
    .getByRole("button", { name: "Cancel reading workbook", exact: true })
    .waitFor();
  await disconnect(page);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { excelTerminated: number }).excelTerminated,
      ),
    )
    .toBe(3);
});
test("a later workbook wins even if a terminated reader delivers a late result", async ({
  page,
}) => {
  const review = await parseWorkbook(new Uint8Array(readFileSync(path)));
  await page.addInitScript((review) => {
    let count = 0;
    (window as unknown as { Worker: unknown }).Worker = class {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      onerror: unknown;
      onmessageerror: unknown;
      index = ++count;
      postMessage() {
        const current = {
          fields: review.fields.map((f) => ({
            ...f,
            value:
              f.pointer === "/borrower_name"
                ? this.index === 1
                  ? "First workbook"
                  : "Second workbook"
                : f.value,
          })),
        };
        setTimeout(
          () => this.onmessage?.({ data: { review: current } }),
          this.index === 1 ? 1000 : 20,
        );
      }
      terminate() {}
    };
  }, review);
  await open(page);
  await page.clock.install();
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await page
    .getByRole("button", { name: "Cancel reading workbook", exact: true })
    .waitFor();
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles({
    name: "replacement.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: readFileSync(path),
  });
  await page.clock.fastForward(50);
  await expect(
    page.getByLabel("Borrower name · Borrower", { exact: true }),
  ).toHaveValue("Second workbook");
  await page.clock.fastForward(1500);
  await expect(
    page.getByLabel("Borrower name · Borrower", { exact: true }),
  ).toHaveValue("Second workbook");
});
test("Excel intake preserves and blocks evaluation around an exact pending write", async ({
  page,
}) => {
  await page.goto("/");
  const pending = JSON.stringify({
    ...makeCreate(fixture, "Pending Excel regression"),
    apiBase: "http://127.0.0.1:8000",
  });
  await writeWorkspaceMemory(page, RECOVERY_KEY, pending);
  await connectWorkspace(page, { example: false });
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await page.getByRole("button", { name: "Excel intake", exact: true }).click();
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(path);
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Evaluate Excel inputs", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Resolve the saved-write" }),
  ).toBeVisible();
  expect(await readWorkspaceMemory(page, RECOVERY_KEY)).toBe(pending);
  expect(posts).toEqual([]);
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toBeEnabled();
});


test("clearing an earlier guarantor is blocked locally and can be corrected", async ({ page }) => {
  const parts = unzipSync(new Uint8Array(readFileSync(path)));
  let xml = strFromU8(parts["xl/worksheets/sheet4.xml"])
    .replace(/r="C(\d+)"/g, 'r="D$1"');
  for (let row = 7; row <= 14; row++) {
    const pattern = new RegExp(`<x:c r="B${row}"[^>]*>[\\s\\S]*?<\\/x:c>`);
    xml = xml.replace(pattern, (original) => {
      const first = row === 9 ? original.replace(">1<", ">0.5<") : original;
      const second = first.replace(`r="B${row}"`, `r="C${row}"`)
        .replace("Guarantor 1", "Guarantor 2").replace("Dana Alpine", "Robin Alpine");
      return first + second;
    });
  }
  parts["xl/worksheets/sheet4.xml"] = strToU8(xml);
  const problems = collectConsoleProblems(page), posts: string[] = [];
  await open(page);
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(new URL(request.url()).pathname);
  });
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles({
    name: "two-guarantors.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(zipSync(parts)),
  });
  await expect(page.getByRole("heading", { name: "Review Excel inputs", exact: true })).toBeVisible();
  await page.getByText("Guarantors", { exact: true }).last().click();
  const controls = page.locator('[data-pointer^="/guarantors/0/"]');
  const originals: string[] = [];
  for (const control of await controls.all()) {
    originals.push(await control.inputValue());
    await control.fill("");
  }
  await page.getByRole("button", { name: "Evaluate Excel inputs", exact: true }).click();
  const summary = page.getByRole("region", { name: "Excel validation summary", exact: true });
  await expect(summary).toContainText("Guarantors!B8");
  await expect(summary).toContainText("Keep populated guarantors together");
  await expect(page.getByLabel("Guarantor name · Guarantor 1", { exact: true })).toBeFocused();
  expect(posts).toEqual([]);
  for (let index = 0; index < originals.length; index++) await controls.nth(index).fill(originals[index]);
  const sent = page.waitForRequest((request) => request.url().endsWith("/commercial/assessment"));
  await page.getByRole("button", { name: "Evaluate Excel inputs", exact: true }).click();
  const payload = (await sent).postDataJSON();
  expect(payload.guarantors.map((g: { name: string }) => g.name)).toEqual(["Dana Alpine", "Robin Alpine"]);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  expect(problems).toEqual([]);
});

test("invalid native dates are rejected before review or evaluation", async ({ page }) => {
  const parts = unzipSync(new Uint8Array(readFileSync(path)));
  parts["xl/worksheets/sheet1.xml"] = strToU8(
    strFromU8(parts["xl/worksheets/sheet1.xml"]).replace(
      /<x:c r="B10"[^>]*>[\s\S]*?<\/x:c>/,
      '<x:c r="B10" s="10" t="d"><x:v>2026-02-30T00:00:00Z</x:v></x:c>',
    ),
  );
  const posts: string[] = [], problems = collectConsoleProblems(page);
  await open(page);
  page.on("request", (request) => { if (request.method() === "POST") posts.push(request.url()); });
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles({
    name: "invalid-date.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(zipSync(parts)),
  });
  await expect(page.getByRole("alert")).toContainText("Borrower!B10: use a valid calendar date");
  await expect(page.getByRole("heading", { name: "Review Excel inputs", exact: true })).toHaveCount(0);
  expect(posts).toEqual([]);
  expect(problems).toEqual([]);
});
