import { test, expect } from "@playwright/test";

test.describe("Venue list page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the page heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /find your perfect stay/i }),
    ).toBeVisible();
  });

  test("renders the search input", async ({ page }) => {
    await expect(
      page.getByPlaceholder(/search venues/i),
    ).toBeVisible();
  });

  test("loads and renders at least one venue card", async ({ page }) => {
    // VenueCard renders as <Link href="/venue/..."> — no article or data-testid
    await expect(
      page.locator('a[href*="/venue/"]').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("venue cards contain a price with NOK", async ({ page }) => {
    // Wait for any text containing NOK to appear (formatted prices)
    await expect(page.getByText(/NOK/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("renders pagination controls when there are multiple pages", async ({
    page,
  }) => {
    // Pagination appears only if total venues > ITEMS_PER_PAGE (16)
    // The Noroff API has hundreds of venues, so pagination should always appear
    await expect(
      page.getByRole("button", { name: /next|chevron/i }).or(
        page.locator("nav[aria-label*='pagination' i]"),
      ).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Venue detail page", () => {
  test("navigating to a venue card opens the detail page", async ({ page }) => {
    await page.goto("/");

    // Wait for venue cards to render
    const firstVenueLink = page.locator("a").filter({ hasText: /NOK/ }).first();
    await firstVenueLink.waitFor({ timeout: 10_000 });
    await firstVenueLink.click();

    // URL should change to /venue/<id>
    await expect(page).toHaveURL(/\/venue\//);
  });

  test("venue detail page shows the back button", async ({ page }) => {
    await page.goto("/");
    const firstVenueLink = page.locator("a").filter({ hasText: /NOK/ }).first();
    await firstVenueLink.waitFor({ timeout: 10_000 });
    await firstVenueLink.click();

    await expect(
      page.getByRole("button", { name: /back/i }).or(
        page.locator("button").filter({ hasText: /back/i }),
      ).first(),
    ).toBeVisible({ timeout: 5_000 });
  });
});
