import { test, expect } from "@playwright/test";

// Uses the saved customer session from auth setup
test.use({ storageState: "tests/e2e/.auth/user.json" });

test.describe("Profile page — authenticated customer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
  });

  test("loads the profile page without redirecting to login", async ({
    page,
  }) => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/profile/);
  });

  test("renders the user's avatar or placeholder image", async ({ page }) => {
    await expect(page.locator("img").first()).toBeVisible({ timeout: 8_000 });
  });

  test("renders the Edit profile button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /edit profile/i }),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("renders the bookings section heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /bookings/i }),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("opens the edit profile dialog when Edit profile is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /edit profile/i }).click();
    // Dialog should appear
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
  });

  test("edit profile dialog has a bio field", async ({ page }) => {
    await page.getByRole("button", { name: /edit profile/i }).click();
    await expect(page.locator("textarea")).toBeVisible({ timeout: 5_000 });
  });

  test("edit profile dialog can be closed", async ({ page }) => {
    await page.getByRole("button", { name: /edit profile/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Custom Dialog closes via X button — no native Escape handler
    await page.getByRole("button", { name: /close dialog/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3_000 });
  });
});
