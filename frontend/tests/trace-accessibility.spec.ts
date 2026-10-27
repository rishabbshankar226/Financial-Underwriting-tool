import { test, expect } from "./authenticatedTest";
import { connectWorkspace, collectConsoleProblems, openView } from "./testCredentials";

for (const width of [375, 1280]) {
  test(`keyboard trace opens in view and returns focus at ${width}px`, async ({
    page,
  }, info) => {
    const problems = collectConsoleProblems(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await connectWorkspace(page);
    await openView(page, "spread");
    const opener = page.getByRole("button", {
      name: "Inspect Gross profit for 2025-01-01 – 2025-12-31",
      exact: true,
    });
    await opener.focus();
    await page.keyboard.press("Enter");
    const inspector = page.getByRole("region", {
      name: "Calculation inspector",
      exact: true,
    });
    const heading = inspector.getByRole("heading", {
      name: "Gross profit",
      exact: true,
    });
    await expect(heading).toBeFocused();
    await page.screenshot({
      path: info.outputPath(`trace-focus-${width}.png`),
    });
    await expect(heading).toBeInViewport({ ratio: 1 });
    const otherPeriod = page.getByRole("button", {
      name: "Inspect Gross profit for 2024-01-01 – 2024-12-31",
      exact: true,
    });
    await otherPeriod.focus();
    await page.keyboard.press("Enter");
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport({ ratio: 1 });
    await expect(inspector).toContainText("$1,330,000.00");
    await page.keyboard.press("Tab");
    await expect(
      inspector.getByRole("button", { name: "Close inspector", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(otherPeriod).toBeFocused();
    await page.screenshot({
      path: info.outputPath(`trace-return-${width}.png`),
    });
    await expect(otherPeriod).toBeInViewport({ ratio: 1 });
    expect(problems).toEqual([]);
  });

  test(`consumer inspector returns keyboard focus to its opener at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await connectWorkspace(page, { example: false });
    await page
      .getByRole("button", { name: "Consumer Decision", exact: true })
      .click();
    await page
      .getByLabel("Load sample case", { exact: true })
      .selectOption("consumer");
    await page
      .getByRole("button", { name: "Evaluate consumer", exact: true })
      .click();
    for (const name of ["Total DTI", "Housing DTI"]) {
      const opener = page.getByRole("button", {
        name: `Inspect ${name}`,
        exact: true,
      });
      await opener.focus();
      await page.keyboard.press("Enter");
      const inspector = page.getByRole("region", {
        name: "Calculation inspector",
        exact: true,
      });
      const heading = inspector.getByRole("heading", { name, exact: true });
      await expect(heading).toBeFocused();
      await expect(heading).toBeInViewport({ ratio: 1 });
      await page.keyboard.press("Tab");
      await expect(
        inspector.getByRole("button", { name: "Close inspector", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(opener).toBeFocused();
      await expect(opener).toBeInViewport({ ratio: 1 });
    }
  });
}
