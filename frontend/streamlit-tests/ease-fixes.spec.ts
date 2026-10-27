import { test, expect } from "@playwright/test";

// Regression tests for the ease-of-use register rows (ease/REGISTER.md) on the Streamlit host.

test("N-10: Open workspace is the access page's primary button", async ({ page }) => {
  await page.goto("/");
  const open = page.getByRole("button", { name: "Open workspace", exact: true });
  await expect(open).toBeVisible({ timeout: 30_000 });
  // Streamlit marks the button kind on its test id; the visible fill follows it.
  await expect(open).toHaveAttribute("data-testid", /stBaseButton-primaryFormSubmit/);
});
