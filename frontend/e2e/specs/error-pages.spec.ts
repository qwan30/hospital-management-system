import { expect, test } from "@playwright/test";
import { expectNoNextErrorOverlay } from "../helpers/layout";
import { collectConsoleProblems } from "../helpers/console";
import { installUiApiMocks } from "../helpers/ui-api-mocks";

test.describe("@ui error pages", () => {
  test("navigating to a non-existent route shows a not-found page without a Next.js error overlay", async ({
    page,
  }) => {
    const consoleProblems = collectConsoleProblems(page);

    const response = await page.goto("/non-existent-page-xyz", {
      waitUntil: "domcontentloaded",
    });

    // The server should respond with 404 status
    expect(response?.status()).toBe(404);

    // Verify no Next.js runtime error overlay is visible
    await expectNoNextErrorOverlay(page);

    // Verify the page content mentions not-found in a user-friendly way
    // (the page should render a 404 layout, not a raw error)
    const bodyText = await page.locator("body").innerText();
    const hasNotFoundHint =
      /not.?found|404|page.?not|doesn.?t exist|couldn.?t find/i.test(bodyText);
    expect(hasNotFoundHint).toBeTruthy();
    const filteredConsoleProblems = consoleProblems.filter(
      (msg) => !msg.includes("404 (Not Found)"),
    );
    expect(filteredConsoleProblems, "no unexpected console errors for 404 page").toEqual([]);
  });

  test("public route with an invalid department id shows a user-friendly message", async ({
    page,
  }) => {
    const consoleProblems = collectConsoleProblems(page);
    await installUiApiMocks(page);

    const response = await page.goto("/departments/non-existent-department-id", {
      waitUntil: "domcontentloaded",
    });

    // Should load without a server error (the app handles the not-found case)
    expect(response?.status()).toBeLessThan(400);

    // Verify no Next.js runtime error overlay
    await expectNoNextErrorOverlay(page);

    // Verify the page shows a user-friendly message, not a raw backend error
    const bodyText = await page.locator("body").innerText();
    const hasUserFriendlyMessage =
      /not.?found|department|unavailable|couldn.?t find|doesn.?t exist|sorry|no data/i.test(
        bodyText,
      );
    expect(hasUserFriendlyMessage).toBeTruthy();

    // Ensure no raw JSON, stack trace, or backend error snippets are exposed
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText).not.toContain("Stack trace");
    expect(bodyText).not.toContain("at ");

    expect(consoleProblems, "no console errors for invalid department route").toEqual([]);
  });

  test("/forbidden page renders Access Denied content with navigation links", async ({
    page,
  }) => {
    await page.goto("/forbidden", { waitUntil: "domcontentloaded" });

    // Verify the core "Access Denied" heading is visible
    await expect(
      page.getByRole("heading", { name: /Access Denied/i }),
    ).toBeVisible();

    // Verify the explanatory message is present
    await expect(
      page.getByText(/not authorized|contact your system administrator/i),
    ).toBeVisible();

    // Verify the action links are rendered
    await expect(
      page.getByRole("link", { name: /Staff Login/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Patient Login/i }),
    ).toBeVisible();

    // Verify the footer links exist
    await expect(
      page.getByRole("link", { name: /Back to Home/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Contact Administrator/i }),
    ).toBeVisible();
  });

  test("navigating to /session-expired shows session expiry information", async ({
    page,
  }) => {
    await page.goto("/session-expired", { waitUntil: "domcontentloaded" });
    await expectNoNextErrorOverlay(page);

    // Verify the page communicates session expiration
    const bodyText = await page.locator("body").innerText();
    const hasSessionMessage =
      /session.?expir|log.?in again|session.?end|timed.?out/i.test(bodyText);
    expect(hasSessionMessage).toBeTruthy();

    // Verify a login link is available to re-authenticate
    await expect(
      page.getByRole("link", { name: /Log in|Login|Sign in/i }).first(),
    ).toBeVisible();
  });

  test("private route with missing session storage redirects to login", async ({
    page,
  }) => {
    // Clear any existing session and do NOT inject tokens
    await page.context().clearCookies();
    await page.addInitScript(() => {
      window.sessionStorage.clear();
    });

    await page.goto("/staff/dashboard", {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    // Should redirect to staff login
    await expect(page).toHaveURL(/\/staff\/login/);
  });
});
