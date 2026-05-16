import { test, expect } from "@playwright/test";

test.describe("Contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  // -------------------------------------------------------------------------
  // Structure
  // -------------------------------------------------------------------------
  test("loads with the main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /get in touch/i }),
    ).toBeVisible();
  });

  test("renders all three contact info cards", async ({ page }) => {
    await expect(page.getByText("Email us")).toBeVisible();
    await expect(page.getByText("Our office")).toBeVisible();
    await expect(page.getByText("Support hours")).toBeVisible();
  });

  test("renders the contact form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /send us a message/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/subject/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send message/i }),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  test("is reachable via the navbar Contact link", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Contact" })
      .click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(
      page.getByRole("heading", { name: /get in touch/i }),
    ).toBeVisible();
  });

  test("is reachable via the footer Contact us link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Contact us" }).click();
    await expect(page).toHaveURL(/\/contact/);
  });

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  test("shows validation errors when form is submitted empty", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/name must be at least 3/i)).toBeVisible();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
    await expect(page.getByText(/please select a subject/i)).toBeVisible();
    await expect(page.getByText(/message must be at least 10/i)).toBeVisible();
  });

  test("shows name error when name is too short", async ({ page }) => {
    await page.getByLabel(/your name/i).fill("Jo");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/name must be at least 3/i)).toBeVisible();
  });

  test("shows message error when message is too short", async ({ page }) => {
    await page.getByLabel(/message/i).fill("Too short");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/message must be at least 10/i)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Successful submission
  // -------------------------------------------------------------------------
  test("submits the form and shows success state", async ({ page }) => {
    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/email address/i).fill("jane@example.com");
    await page.selectOption("select#subject", "general");
    await page
      .getByLabel(/message/i)
      .fill(
        "This is a test message that is definitely long enough to pass validation.",
      );
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(
      page.getByRole("heading", { name: /message sent/i }),
    ).toBeVisible({
      timeout: 3_000,
    });
    await expect(
      page.getByRole("button", { name: /send another message/i }),
    ).toBeVisible();
  });

  test("resets to the form after clicking 'Send another message'", async ({
    page,
  }) => {
    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/email address/i).fill("jane@example.com");
    await page.selectOption("select#subject", "booking");
    await page
      .getByLabel(/message/i)
      .fill("This is a test message that is definitely long enough.");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(
      page.getByRole("heading", { name: /message sent/i }),
    ).toBeVisible({
      timeout: 3_000,
    });
    await page.getByRole("button", { name: /send another message/i }).click();
    await expect(
      page.getByRole("heading", { name: /send us a message/i }),
    ).toBeVisible();
  });
});
