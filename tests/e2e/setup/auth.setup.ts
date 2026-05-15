import { test as setup, expect } from "@playwright/test";

// Paths are relative to the project root (where playwright.config.ts lives)
const USER_FILE = "tests/e2e/.auth/user.json";
const MANAGER_FILE = "tests/e2e/.auth/manager.json";

// ---------------------------------------------------------------------------
// Save a logged-in session for a regular customer account
// ---------------------------------------------------------------------------
setup("authenticate as customer", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in .env to run authenticated tests",
    );
  }

  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for successful redirect away from login
  await expect(page).toHaveURL(/^(?!.*\/login).*$/, { timeout: 15_000 });

  // Save the full browser storage state (localStorage contains holidaze_auth)
  await page.context().storageState({ path: USER_FILE });
});

// ---------------------------------------------------------------------------
// Save a logged-in session for a venue manager account
// ---------------------------------------------------------------------------
setup("authenticate as venue manager", async ({ page }) => {
  const email = process.env.E2E_MANAGER_EMAIL;
  const password = process.env.E2E_MANAGER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_MANAGER_EMAIL and E2E_MANAGER_PASSWORD must be set in .env to run manager tests",
    );
  }

  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/^(?!.*\/login).*$/, { timeout: 15_000 });

  await page.context().storageState({ path: MANAGER_FILE });
});
