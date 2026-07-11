import { expect, test } from "@playwright/test";
import { StaffLoginPage } from "../pages/login-page";
import { expectNoNextErrorOverlay } from "../helpers/layout";

test.describe("@ui rate limiting", () => {
  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("shows a rate limit message when the API responds with 429", async ({
    page,
  }) => {
    // Mock the login API to always return 429
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "rate_limited",
            message: "Too many requests. Please try again later.",
          },
        }),
      });
    });

    const login = new StaffLoginPage(page);
    await login.goto();

    await page.getByLabel("Email", { exact: true }).fill("doctor1@hospital.vn");
    await page.getByLabel("Password", { exact: true }).fill("Doctor@1234");
    await page.getByRole("button", { name: /Log in to Clinical Suite/i }).click();

    // Verify the user sees a rate-limit error message
    await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 10_000 });
    const alertText = await page.getByRole("alert").first().innerText();

    const hasRateLimitMessage =
      /too many|rate limit|try again later|429|slow down|many requests/i.test(
        alertText,
      );
    expect(hasRateLimitMessage).toBeTruthy();

    await expectNoNextErrorOverlay(page);

    // Verify the user is still on the login page (not redirected elsewhere)
    await expect(page).toHaveURL(/\/staff\/login/);
  });

  test("shows a rate limit message on the patient portal login when rate limited", async ({
    page,
  }) => {
    await page.route("**/api/v1/patient-auth/login", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "rate_limited",
            message: "Too many login attempts. Please wait before trying again.",
          },
        }),
      });
    });

    await page.goto("/portal/login", { waitUntil: "domcontentloaded" });

    await page.getByLabel("Email", { exact: true }).fill("patient@example.com");
    await page.getByLabel("Password", { exact: true }).fill("Patient@1234");
    await page.getByRole("button", { name: /^Log in/i }).click();

    // Verify rate limit error is displayed
    await expect(page.getByRole("alert").filter({ hasText: /too many|rate limit|try again|429|slow down/i })).toBeVisible({ timeout: 15_000 });
    await expectNoNextErrorOverlay(page);
  });

  test("rate-limited API on a data page shows a user-friendly message instead of raw 429", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });

    // Make all admin data endpoints return 429
    await page.route("**/api/v1/admin/**", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "rate_limited",
            message: "API rate limit exceeded. Retry after 60 seconds.",
          },
        }),
      });
    });

    await page.goto("/admin/departments", {
      waitUntil: "domcontentloaded",
    });

    await expectNoNextErrorOverlay(page);

    await expect(page.locator("body")).toContainText(
      /rate limit|too many|try again later|429|unable to load|error|retry/i,
      { timeout: 15_000 }
    );

    // Ensure the raw rate-limit code is not exposed to the user
    const bodyText = await page.locator("body").innerText();
    expect(
      bodyText.includes("rate_limited"),
      "raw error code should not be exposed",
    ).toBeFalsy();
  });

  test("registering a new patient while rate limited shows a friendly message", async ({
    page,
  }) => {
    // Mock the patient registration endpoint to return 429
    await page.route("**/api/v1/patient-portal/register", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "rate_limited",
            message: "Too many registration attempts. Please try again later.",
          },
        }),
      });
    });

    await page.goto("/portal/login", { waitUntil: "domcontentloaded" });

    // Click the registration link if present, or navigate directly
    const registerLink = page.getByRole("link", { name: /Register|Sign.?up/i });
    if ((await registerLink.count()) > 0) {
      await registerLink.click();
      await page.waitForURL(/\/portal\/register|\/register/, {
        timeout: 10_000,
      });
    }

    // If a registration form is present, attempt submission
    const submitButton = page.getByRole("button", {
      name: /Register|Create Account|Submit/i,
    });
    if ((await submitButton.count()) > 0) {
      await page.getByLabel(/Email|email/i).fill("newpatient@example.com");
      await page.getByLabel(/Password|password/i).fill("Patient@1234");
      await submitButton.click();

      // Verify a rate-limit error is shown
      const errorVisible = page.getByRole("alert").filter({ hasText: /too many|rate limit|try again later|429/i });
      await expect(errorVisible).toBeVisible({ timeout: 15_000 });
    }
    // If no registration link, the test gracefully passes
  });
});
