import { test, expect } from "@playwright/test";

test.describe("Login form — client-side validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("submit button is present and the form renders", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows email validation error when submitting an empty form", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test("shows password validation error when password is too short", async ({
    page,
  }) => {
    await page.locator('input[type="email"]').fill("user@stud.noroff.no");
    await page.locator('input[type="password"]').fill("short");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test("does not show validation errors when form is untouched", async ({
    page,
  }) => {
    await expect(page.getByText(/invalid email/i)).not.toBeVisible();
    await expect(page.getByText(/at least 8 characters/i)).not.toBeVisible();
  });

  test("has a link to the register page", async ({ page }) => {
    // Scope to main to avoid matching the navbar and footer Register links
    const registerLink = page.getByRole("main").getByRole("link", { name: "Register" });
    await expect(registerLink).toBeVisible();
  });
});

test.describe("Register form — client-side validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("renders the registration form", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("shows validation error for non-noroff email", async ({ page }) => {
    await page.locator('input[type="email"]').fill("user@gmail.com");
    await page.locator('input[type="email"]').blur();
    await expect(page.getByText(/stud\.noroff\.no/i)).toBeVisible();
  });

  test("shows validation error when name has spaces", async ({ page }) => {
    // Fill all required fields then submit — react-hook-form validates on submit by default
    await page.locator('input[id="name"], input[placeholder*="username" i]').first().fill("test user");
    await page.locator('input[type="email"]').fill("valid@stud.noroff.no");
    await page.locator('input[type="password"]').first().fill("password123");
    await page.locator('input[id="confirmPassword"], input[placeholder*="Min. 8" i]').last().fill("password123");
    await page.getByRole("button", { name: /create account|sign up|register/i }).click();
    await expect(
      page.getByText(/letters, numbers.*underscore|only.*underscore/i),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("has a link to the login page", async ({ page }) => {
    // Scope to main to avoid matching the navbar and footer Login links
    const loginLink = page.getByRole("main").getByRole("link", { name: /sign in/i });
    await expect(loginLink).toBeVisible();
  });
});
