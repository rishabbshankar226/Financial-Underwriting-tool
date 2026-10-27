import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { openCaseBrowser, unlockStreamlitHost } from "../tests/testCredentials";

test("the installed Streamlit bundle downloads, imports, evaluates and saves the Excel example", async ({
  page,
}, info) => {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type()))
      problems.push(message.text());
  });
  await page.goto("/");
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await page
    .getByRole("button", { name: "Import Excel workbook", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download filled Excel example", exact: true })
    .click();
  const file = await download,
    local = info.outputPath(file.suggestedFilename());
  await file.saveAs(local);
  expect(readFileSync(local)).toEqual(
    readFileSync(
      new URL(
        "../src/excel/templates/spreadline-alpine-example-v1.xlsx",
        import.meta.url,
      ),
    ),
  );
  await page.getByLabel("Excel workbook", { exact: true }).setInputFiles(local);
  await expect(
    page.getByRole("heading", { name: "Review Excel inputs", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Evaluate Excel inputs", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page
    .getByLabel("Save rationale")
    .fill("Synthetic Excel import through the installed Streamlit bundle");
  await page
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when last refreshed",
  );
  const caseId = await page.locator(".savedContext code").first().innerText();
  await page.reload();
  await unlockStreamlitHost(page);
  await expect(page.locator(".startScreen")).toBeVisible({ timeout: 30_000 });
  await openCaseBrowser(page);
  await page
    .locator(".caseRow")
    .filter({ hasText: caseId })
    .getByRole("button", { name: /^Open / })
    .click();
  await expect(page.locator(".savedContext")).toContainText(caseId);
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  expect(problems).toEqual([]);
});
