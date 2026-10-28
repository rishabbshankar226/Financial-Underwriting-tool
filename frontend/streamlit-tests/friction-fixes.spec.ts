import { test, expect } from "@playwright/test";
import { TEST_STREAMLIT_ACCESS_PASSWORD } from "../tests/testCredentials";

// Regression tests for the friction pass (docs/ux/FRICTION_PASS_2026-10.md) on the Streamlit host.

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("F-4: inside the Streamlit host the memo copies as text and prints with the known gaps open", async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {
      window.dispatchEvent(new Event("beforeprint"));
      // The workspace renders in a shadow root; find the known gaps wherever they are.
      const roots: (Document | ShadowRoot)[] = [document];
      for (const element of document.querySelectorAll("*")) if (element.shadowRoot) roots.push(element.shadowRoot);
      const scope = roots
        .map((root) => root.querySelector<HTMLDetailsElement>('[aria-label="Model scope and policy limitations"] details'))
        .find(Boolean);
      (window as unknown as { printedScopeOpen: boolean | null }).printedScopeOpen = scope?.open ?? null;
      window.dispatchEvent(new Event("afterprint"));
    };
  });
  await page.goto("/");
  await page.getByLabel("Access password", { exact: true }).fill(TEST_STREAMLIT_ACCESS_PASSWORD);
  await page.getByRole("button", { name: "Open workspace", exact: true }).click();
  await page.getByRole("button", { name: "Try the example case", exact: true }).click({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Save case", exact: true })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("tab", { name: "Credit Memo", exact: true }).click();
  const memo = page.getByRole("tabpanel", { name: "Credit Memo" });
  await memo.getByRole("button", { name: "Copy memo as text", exact: true }).click();
  await expect(memo.getByRole("status")).toHaveText("Copied the memo as text.");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Approve for prototype demonstration based on the accepted inputs.");
  expect(copied).toContain("The weighted-rule score is not a probability of default.");
  await memo.getByRole("button", { name: "Print memo", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { printedScopeOpen: boolean | null }).printedScopeOpen)).toBe(true);
});
