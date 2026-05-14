import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load .env so E2E credentials are available in the setup project
dotenv.config();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // ── 1. Auth setup ── run once, creates .auth/user.json + .auth/manager.json
    {
      name: "setup",
      testMatch: "**/setup/auth.setup.ts",
    },

    // ── 2. Unauthenticated tests ── smoke, auth forms, venues (no storageState)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/profile.spec.ts", "**/dashboard.spec.ts"],
    },

    // ── 3. Authenticated tests ── profile + dashboard (depend on setup)
    {
      name: "chromium-auth",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testMatch: ["**/profile.spec.ts", "**/dashboard.spec.ts"],
    },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
