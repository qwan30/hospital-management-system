import { expect, test } from "@playwright/test";
import { StaffLoginPage } from "../pages/login-page";
import { expectNoNextErrorOverlay } from "../helpers/layout";

test.describe("@ui network failure handling", () => {
  test.afterEach(async ({ page }) => {
    // Ensure routes are unregistered after each test to avoid leaking mocks
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("shows an error state when the API is unreachable during login", async ({
    page,
  }) => {
    // Intercept all API requests and abort them to simulate network failure
    await page.route("**/api/v1/**", (route) =>
      route.abort("connectionrefused"),
    );

    const login = new StaffLoginPage(page);
    await login.goto();

    // Attempt to log in
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("Password@1234");

    // The login button may or may not trigger an API call; if it does,
    // the page should handle the network error gracefully.
    // Wrap in try/catch because the page might navigate or show an error
    // before the click resolves, and Playwright may throw on navigation abort.
    const clickPromise = page
      .getByRole("button", { name: /Log in to Clinical Suite/i })
      .click()
      .catch(() => {});

    // Wait for either an error message or the page to settle
    await Promise.race([
      expect(page.getByRole("alert").first()).toBeVisible({ timeout: 10_000 }),
      page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {}),
    ]);
    await clickPromise;

    // Verify a user-facing error is shown rather than a raw crash
    const bodyText = await page.locator("body").innerText();
    const hasErrorMessage =
      /error|unreachable|connection|failed|offline|network|unavailable|something went wrong/i.test(
        bodyText,
      );
    expect(hasErrorMessage).toBeTruthy();

    // Verify no Next.js error overlay is displayed
    await expectNoNextErrorOverlay(page);
  });

  test("shows an error state when a data-fetching API is unreachable on a logged-in page", async ({
    page,
  }) => {
    // Inject mock session but make API unreachable
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });

    await page.route("**/api/v1/**", (route) =>
      route.abort("connectionrefused"),
    );

    const response = await page.goto("/admin/departments", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBeLessThan(400);

    // The page should gracefully handle the network failure
    await expectNoNextErrorOverlay(page);

    // Verify there is some user-facing error or empty/retry state.
    // The exact selector depends on the component's error state implementation.
    const bodyText = await page.locator("body").innerText();
    const hasRecoveryHint =
      /error|retry|try again|unable to load|failed to load|offline|network|unreachable|no data|couldn't load/i.test(
        bodyText,
      );
    expect(hasRecoveryHint).toBeTruthy();
  });

  test("shows an error state when a resource is not found (404) from the API", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "DOCTOR");
    });

    // Mock the schedule endpoint to return 404
    await page.route("**/api/v1/me/schedule", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Schedule not found",
          error: { code: "NOT_FOUND", message: "Schedule not found" },
        }),
      });
    });

    await page.goto("/staff/schedule", {
      waitUntil: "domcontentloaded",
    });

    await expectNoNextErrorOverlay(page);

    // Verify a user-facing error or empty state is shown, not a raw JSON dump
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain('"success":false');

    const hasScheduleMessage =
      /schedule|not.?found|unavailable|error|no appointments/i.test(bodyText);
    expect(hasScheduleMessage).toBeTruthy();
  });

  test("page fails gracefully when the backend returns a 500 server error", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });

    // Mock admin users endpoint to return 500
    await page.route("**/api/v1/admin/users", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Internal server error",
          error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
        }),
      });
    });

    await page.goto("/admin/users", {
      waitUntil: "domcontentloaded",
    });

    await expectNoNextErrorOverlay(page);

    // Verify the page shows a user-facing error, not a raw crash
    const bodyText = await page.locator("body").innerText();
    const hasErrorMessage =
      /error|try again|unable to load|failed|something went wrong|internal/i.test(
        bodyText,
      );
    expect(hasErrorMessage).toBeTruthy();

    // Ensure no raw backend error details leak to the user
    expect(bodyText).not.toContain("INTERNAL_ERROR");
  });
});
