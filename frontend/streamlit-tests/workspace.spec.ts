import { test, expect } from "@playwright/test";
import { openView } from "../tests/testCredentials";

test("packaged Streamlit workspace evaluates, edits, saves, reopens and previews a scenario", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type()))
      errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  await expect(page.locator(".hostingNotice")).toContainText(
    "Synthetic data only",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".hostingNotice").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("streamlit-spread-1440.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    })
    .click();
  await page.getByLabel("New value").fill("4200001");
  await page.getByLabel("Rationale").fill("Synthetic Streamlit edit");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Synthetic Streamlit baseline");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when fetched",
  );
  await page.reload();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when fetched",
    { timeout: 30_000 },
  );
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await openView(page, "scenarios");
  await page.getByLabel("Scenario 1 preset").selectOption("revenue");
  await page
    .getByLabel("Scenario 1 rationale")
    .fill("Synthetic downside review");
  await page
    .getByRole("button", { name: "Preview scenarios", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Read-only preview", exact: true }),
  ).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: info.outputPath(`streamlit-${width}.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

test("an acknowledged write with retained recovery tracking can be retried after reload exactly once", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const remove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key: string) {
      if (
        key === "spreadline.embedded.spreadline.pending-write.v1" &&
        !sessionStorage.getItem("spreadline.test.allow-clear")
      )
        return;
      return remove.call(this, key);
    };
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page
    .getByLabel("Save rationale")
    .fill("Synthetic recovery verification");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when fetched",
  );
  const original = await page.evaluate(() => ({
    operation: JSON.parse(
      sessionStorage.getItem(
        "spreadline.embedded.spreadline.pending-write.v1",
      )!,
    ).id,
    caseId: JSON.parse(
      sessionStorage.getItem(
        "spreadline.embedded.spreadline.case-selection.v1",
      )!,
    ).caseId,
  }));
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          sessionStorage.getItem(
            "spreadline.embedded.spreadline.pending-write.v1",
          )!,
        ).id,
    ),
  ).toBe(original.operation);
  await page.evaluate(() =>
    sessionStorage.setItem("spreadline.test.allow-clear", "true"),
  );
  await page
    .getByRole("button", { name: "Retry exact write", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(original.caseId);
  await expect(
    page.getByText("Recovered the original revision 1.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toHaveCount(0);
});

test("embedded dialogs keep keyboard focus and browser sessions keep separate drafts", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE", {
    timeout: 30_000,
  });
  const field = page.getByRole("button", {
    name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
    exact: true,
  });
  await field.click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(dialog.getByLabel("New value")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Evaluate edit", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(field).toBeFocused();
  await field.click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Synthetic isolated draft");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  const context = await browser.newContext();
  try {
    const other = await context.newPage();
    await other.goto("http://127.0.0.1:8501");
    await expect(other.locator(".decision strong")).toHaveText("APPROVE", {
      timeout: 30_000,
    });
    await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  } finally {
    await context.close();
  }
});
