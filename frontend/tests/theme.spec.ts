import { browserWorkspaceValues } from "./workspaceMemory";
import { connectWorkspace, disconnect, moreAction, moreActions } from "./testCredentials";
import { test, expect } from "./authenticatedTest";

const darkCanvas = "rgb(11, 13, 16)";
const lightCanvas = "rgb(243, 246, 244)";

test("light is the default and a dark choice lasts only in the current page", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(lightCanvas);
  await connectWorkspace(page);
  await page.getByRole("button", { name: "More", exact: true }).click();
  const toggle = page.locator(".moreMenu").getByRole("button", { name: moreActions.theme, exact: true });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await toggle.click();
  // The theme is a toggle, so the menu stays open to show its new state.
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(darkCanvas);
  expect(await browserWorkspaceValues(page)).toEqual({ local: [], session: [] });
  await disconnect(page);
  await connectWorkspace(page);
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
  await connectWorkspace(page);
  await moreAction(page, "theme");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");
  await moreAction(page, "theme");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
  expect(await browserWorkspaceValues(page)).toEqual({ local: [], session: [] });
  expect(problems).toEqual([]);
});

test("unreadable preference storage keeps the light default and an in-page toggle", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
  await connectWorkspace(page);
  await moreAction(page, "theme");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");
});

test("a legacy browser theme value is ignored by the page-only preference", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("spreadline.theme.v1", "dark"));
  await page.goto("/");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
});
