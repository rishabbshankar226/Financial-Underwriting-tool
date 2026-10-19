import type { Page } from "@playwright/test";

/** Inspect the same module instance as the Vite workspace, without a production debug global. */
export async function readWorkspaceMemory(
  page: Page,
  key: string,
): Promise<string | null> {
  return page.evaluate(async (key) => {
    const modulePath = "/src/transport.ts";
    const { workspaceStorage } = await import(modulePath);
    return workspaceStorage()?.getItem(key) ?? null;
  }, key);
}

/** Seed recovery edge cases before connecting, when App reads its in-page selection. */
export async function writeWorkspaceMemory(
  page: Page,
  key: string,
  value: string,
): Promise<void> {
  await page.evaluate(
    async ({ key, value }) => {
      const modulePath = "/src/transport.ts";
      const { workspaceStorage } = await import(modulePath);
      const memory = workspaceStorage();
      if (!memory) throw new Error("Workspace memory is unavailable");
      memory.setItem(key, value);
    },
    { key, value },
  );
}

export async function browserWorkspaceValues(
  page: Page,
): Promise<{ local: [string, string][]; session: [string, string][] }> {
  return page.evaluate(() => ({
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage),
  }));
}
