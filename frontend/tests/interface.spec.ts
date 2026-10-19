import { test, expect } from "./authenticatedTest";
import { connectWorkspace } from "./testCredentials";

test("the assessment overview labels current coverage separately from the selected historical spread", async ({
  page,
}) => {
  await page.goto("/");
  await connectWorkspace(page);
  const overview = page.getByRole("region", { name: "Assessment overview" });
  await expect(overview).toContainText("$630,000");
  await expect(overview).toContainText("3.13x");
  await page
    .getByRole("button", { name: "2024-01-01 – 2024-12-31", exact: true })
    .click();
  await expect(overview).toContainText("3.13x");
  await expect(overview).toContainText("2025-12-31");
});
