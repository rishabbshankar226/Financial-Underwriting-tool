import { expect, type Page } from "@playwright/test";

export const TEST_API_ORIGIN = "http://127.0.0.1:8000";
export const TEST_API_TOKEN = "spreadline-playwright-only-credential-20261014";
export const TEST_OPERATOR_ID = "playwright_operator";

// Workspace copy that specs act on lives here, so a rename touches only this file.
export const startScreenTitle = "Start a credit analysis";
export const startActions = {
  example: "Try the example case",
  open: "Open saved case",
  import: "Import case file (JSON)",
} as const;
export const moreActions = {
  example: "Load example case",
  legacyExample: "Load legacy example case",
  import: "Import case file (JSON)",
  theme: "Dark theme",
  disconnect: "Disconnect workspace",
} as const;
export type MoreAction = keyof typeof moreActions;
export const analysisNotices = {
  unavailable: "Analysis unavailable on this server",
  mismatch: "The analysis did not match this assessment",
  unsupported: "This analysis version is not supported",
} as const;

/** Waits for the workspace or the start screen. From the start screen it chooses the example case without
 * waiting for the result, so a spec can hold that response. */
export async function enterWorkspace(page: Page, options: { example?: boolean; timeout?: number } = {}): Promise<void> {
  const start = page.locator(".startScreen");
  await expect(start.or(page.locator(".decision"))).toBeVisible({ timeout: options.timeout });
  if (options.example !== false && (await start.isVisible()))
    await start.getByRole("button", { name: startActions.example, exact: true }).click();
}

/** Connects with the test credential, then enters the workspace as `enterWorkspace` does. */
export async function connectWorkspace(page: Page, options: { example?: boolean } = {}): Promise<void> {
  await page.getByLabel("API token", { exact: true }).fill(TEST_API_TOKEN);
  await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  await enterWorkspace(page, options);
}

export type WorkspaceView =
  | "spread"
  | "overview"
  | "assumptions"
  | "debt"
  | "global"
  | "scenarios"
  | "stress"
  | "memo"
  | "details"
  | "history"
  | "review"
  | "audit";
// Earlier view names map onto the tab that now holds their content.
const viewTabs: Record<WorkspaceView, string> = {
  spread: "Spread",
  overview: "Overview",
  assumptions: "Debt & Loan",
  debt: "Debt & Loan",
  global: "Global Cash Flow",
  scenarios: "Stress Tests",
  stress: "Stress Tests",
  memo: "Credit Memo",
  details: "History & Audit",
  history: "History & Audit",
  review: "History & Audit",
  audit: "History & Audit",
};
export const workspaceTabLabels = [
  "Spread",
  "Overview",
  "Debt & Loan",
  "Global Cash Flow",
  "Stress Tests",
  "Credit Memo",
  "History & Audit",
];

/** Workspace navigation is centralized so view renames and tab semantics change in one place. */
export async function openView(page: Page, view: WorkspaceView): Promise<void> {
  const tab = page.getByRole("tab", { name: viewTabs[view], exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

/** Opens the More menu when it is closed, then activates one of its items. */
export async function moreAction(page: Page, action: MoreAction): Promise<void> {
  const toggle = page.getByRole("button", { name: "More", exact: true });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await page.locator(".moreMenu").getByRole("button", { name: moreActions[action], exact: true }).click();
}

export async function disconnect(page: Page): Promise<void> {
  await moreAction(page, "disconnect");
}

/** Shows the saved-case list from the workspace header or the start screen. */
export async function openCaseBrowser(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: /^Open (saved )?case$/ });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await expect(page.getByRole("region", { name: "Saved cases", exact: true })).toBeVisible();
}

export async function expectNoOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

/** Page errors plus console warnings and errors, including React development warnings. */
export function collectConsoleProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) problems.push(message.text());
  });
  return problems;
}
