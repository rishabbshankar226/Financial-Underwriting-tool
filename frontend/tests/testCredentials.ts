import { expect, type Page } from "@playwright/test";

export const TEST_API_ORIGIN = "http://127.0.0.1:8000";
export const TEST_API_TOKEN = "spreadline-playwright-only-credential-20261014";
export const TEST_OPERATOR_ID = "playwright_operator";

export async function connectWorkspace(page: Page): Promise<void> {
  await page.getByLabel("API token", { exact: true }).fill(TEST_API_TOKEN);
  await page.getByRole("button", { name: "Connect workspace", exact: true }).click();
  await expect(page.getByRole("button", { name: "Disconnect workspace", exact: true })).toBeVisible();
}

export type WorkspaceView = "spread" | "assumptions" | "details" | "memo" | "history" | "scenarios" | "review";
const viewNames: Record<WorkspaceView, string> = {
  spread: "spread",
  assumptions: "assumptions",
  details: "details",
  memo: "memo",
  history: "history",
  scenarios: "Scenarios",
  review: "Review",
};

/** Workspace navigation is centralized so view renames and tab semantics change in one place. */
export async function openView(page: Page, view: WorkspaceView): Promise<void> {
  await page.getByRole("button", { name: viewNames[view], exact: true }).click();
}
