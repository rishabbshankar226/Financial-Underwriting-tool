import { defineConfig } from "@playwright/test";
import { TEST_API_ORIGIN, TEST_API_TOKEN, TEST_OPERATOR_ID } from "./tests/testCredentials";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  // New evaluations include a five-second presentation transition.
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:5173",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
        }
      : {},
  },
  webServer: [
    {
      command: "python3 tests/start_backend.py",
      url: "http://127.0.0.1:8000/health",
      reuseExistingServer: false,
      env: {
        SPREADLINE_TEST_API_TOKEN: TEST_API_TOKEN,
        SPREADLINE_TEST_OPERATOR_ID: TEST_OPERATOR_ID,
      },
    },
    {
      command: "npm run dev -- --host 127.0.0.1",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      env: { VITE_API_URL: TEST_API_ORIGIN },
    },
  ],
});
