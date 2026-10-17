import { connectWorkspace } from "./testCredentials";
import { test, expect } from "./authenticatedTest";

const darkCanvas = "rgb(11, 13, 16)";
const lightCanvas = "rgb(243, 246, 244)";

test("light is the default and a dark choice persists across reloads", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(lightCanvas);
  await connectWorkspace(page);
  const toggle = page.getByRole("button", { name: "Dark theme", exact: true });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(darkCanvas);
  // The theme is the only durable browser value; the API credential stays in page memory.
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual([["spreadline.theme.v1", "dark"]]);

  await page.reload();
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");
  await connectWorkspace(page);
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("spreadline.theme.v1"))).toBe("light");
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
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "dark");
});

test("a stored value other than dark selects light", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("spreadline.theme.v1", "midnight"));
  await page.goto("/");
  await expect(page.locator(".themeRoot")).toHaveAttribute("data-theme", "light");
});
