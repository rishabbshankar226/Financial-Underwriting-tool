import { test, expect } from "@playwright/test";
import { TEST_STREAMLIT_ACCESS_PASSWORD } from "../tests/testCredentials";

// Regression tests for the ease-of-use register rows (ease/REGISTER.md) on the Streamlit host.

test("N-10: Open workspace is the access page's primary button", async ({ page }) => {
  await page.goto("/");
  const open = page.getByRole("button", { name: "Open workspace", exact: true });
  await expect(open).toBeVisible({ timeout: 30_000 });
  // Streamlit marks the button kind on its test id; the visible fill follows it.
  await expect(open).toHaveAttribute("data-testid", /stBaseButton-primaryFormSubmit/);
});

test("N-5: the Streamlit host does not offer Consumer or SBA workflows", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Access password", { exact: true }).fill(TEST_STREAMLIT_ACCESS_PASSWORD);
  await page.getByRole("button", { name: "Open workspace", exact: true }).click();
  const nav = page.getByRole("navigation", { name: "Underwriting workflows", exact: true });
  await expect(nav.getByRole("button", { name: "Commercial Assessment", exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(nav.getByRole("button", { name: "Consumer Decision", exact: true })).toHaveCount(0);
  await expect(nav.getByRole("button", { name: "SBA Screen", exact: true })).toHaveCount(0);
});
