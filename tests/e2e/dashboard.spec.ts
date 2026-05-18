import { test, expect } from "@playwright/test";

// Uses the saved venue manager session from auth setup
test.use({ storageState: "tests/e2e/.auth/manager.json" });

test.describe("Venue management — authenticated venue manager on Profile", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
  });

  test("loads the profile page without redirecting", async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/profile/);
  });

  test("renders the dashboard page heading", async ({ page }) => {
    // h1 reads "My Venues" — not "Dashboard"
    await expect(
      page.getByRole("heading", { name: /my venues/i }),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("renders the Add venue button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /add venue/i }),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("renders the stats summary area", async ({ page }) => {
    // Wait for the page to finish loading (heading appears after API fetch)
    await expect(
      page.getByRole("heading", { name: /my venues/i }),
    ).toBeVisible({ timeout: 10_000 });
    // Stats cards show "Venues listed" and "Total bookings"
    await expect(
      page.getByText(/venues listed|total bookings/i).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("opens the create venue dialog when Add venue is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add venue/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
  });

  test("create venue dialog has a venue name field", async ({ page }) => {
    await page.getByRole("button", { name: /add venue/i }).click();
    await expect(
      page.locator('input[id="name"]').or(
        page.getByPlaceholder(/venue name/i),
      ).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("create venue dialog can be closed", async ({ page }) => {
    await page.getByRole("button", { name: /add venue/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Custom Dialog closes via X button — no native Escape handler
    await page.getByRole("button", { name: /close dialog/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3_000 });
  });
});
