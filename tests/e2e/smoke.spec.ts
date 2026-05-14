import { test, expect } from "@playwright/test";

test.describe("Smoke tests — page structure and navigation", () => {
  test("home page loads with the correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/holidaze/i);
  });

  test("navbar is visible on the home page", async ({ page }) => {
    await page.goto("/");
    // Scope to the header banner — page has 2 nav elements (desktop + mobile)
    await expect(page.getByRole("banner").getByRole("navigation")).toBeVisible();
  });

  test("footer is visible on the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("login page renders email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("register page renders a form with email and password fields", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // Register has two password inputs (password + confirmPassword) — use first()
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("clicking a login link in the navbar navigates to /login", async ({
    page,
  }) => {
    await page.goto("/");
    // Scope to the header to avoid matching the footer Login link
    const loginLink = page.getByRole("banner").getByRole("link", { name: "Login" });
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("back-to-top button is present in the footer", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("footer button[aria-label='Back to top']");
    await expect(btn).toBeVisible();
  });
});

test.describe("Protected route redirects — unauthenticated", () => {
  test("visiting /profile redirects to /login when not logged in", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });

  test("visiting /dashboard redirects to /login when not logged in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
