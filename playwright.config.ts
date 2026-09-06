import { defineConfig } from "@playwright/test";

/**
 * Smoke tests against a production build (`next start`).
 *
 * They expect a database: CI runs ingest/ci-seed.ts against a Postgres
 * service container first, so the suite can tell a working data layer from
 * one that answers "unavailable" to everything. Run without DATABASE_URL and
 * the topic assertions that depend on seeded rows will fail, which is the
 * point — that state used to pass.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    // This sandbox ships one Chromium build under PLAYWRIGHT_BROWSERS_PATH
    // that may not match the version @playwright/test wants to download.
    // PLAYWRIGHT_CHROMIUM_EXECUTABLE points the runner at whatever is there;
    // CI installs a matching browser and leaves this unset.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : undefined,
  },
  webServer: {
    command: "npm run start -- --port 3100",
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
