import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["line"]],
  outputDir: "./test-results",
  use: { viewport: { width: 1440, height: 900 } },
});
