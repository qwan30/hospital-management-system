import { expect, test, type Page } from "@playwright/test";

// Helper to inject a staff session on a page
async function injectStaffSession(
  page: Page,
  role: string = "ADMIN",
  token: string = "staff-token",
) {
  await page.addInitScript(
    ({ accessToken, userRole }) => {
      window.sessionStorage.setItem("hms_staff_access_token", accessToken);
      window.sessionStorage.setItem("hms_staff_role", userRole);
    },
    { accessToken: token, userRole: role },
  );
}

test.describe("@ui concurrent sessions", () => {
  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("same user logged in across two browser contexts operates independently", async ({
    browser,
  }) => {
    // Create two isolated browser contexts simulating two browser windows
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Inject the same mock session into both pages
      await injectStaffSession(page1, "ADMIN", "shared-token");
      await injectStaffSession(page2, "ADMIN", "shared-token");

      // Mock API responses for both pages
      const mockAdminResponse = () =>
        JSON.stringify({
          success: true,
          data: [
            {
              userId: "user-1",
              fullName: "Admin User",
              email: "admin@hospital.vn",
              role: "ADMIN",
              active: true,
            },
          ],
        });

      // Page 1 route: admin/users
      await page1.route("**/api/v1/admin/users", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: mockAdminResponse(),
        });
      });

      // Page 2 route: admin/departments
      await page2.route("**/api/v1/admin/departments", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                departmentId: "dept-cardio",
                name: "Cardiology",
                description: "Cardiac care and intervention",
                active: true,
              },
            ],
          }),
        });
      });

      // Navigate both pages in parallel
      await Promise.all([
        page1.goto("/admin/users", { waitUntil: "domcontentloaded" }),
        page2.goto("/admin/departments", { waitUntil: "domcontentloaded" }),
      ]);

      // Page 1 should show user data
      await expect(page1.getByText("Admin User")).toBeVisible();

      // Page 2 should show department data
      await expect(page2.getByText("Cardiology")).toBeVisible();

      // Perform an action on page 1 that modifies local state
      await page1.goto("/admin/departments", {
        waitUntil: "domcontentloaded",
      });
      await expect(page1.getByText("Cardiology")).toBeVisible();

      // Verify page 2 is still on its own view and unaffected
      await expect(page2.getByText("Cardiology")).toBeVisible();
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test("each session uses its own auth token without cross-contamination", async ({
    browser,
  }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Each context has a distinct token
      await injectStaffSession(page1, "DOCTOR", "doctor-token-123");
      await injectStaffSession(page2, "NURSE", "nurse-token-456");

      // Track which token each page sends
      const page1Tokens: string[] = [];
      const page2Tokens: string[] = [];

      await page1.route("**/api/v1/**", async (route, request) => {
        page1Tokens.push(
          request.headers()["authorization"] ?? "(no auth header)",
        );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: null }),
        });
      });

      await page2.route("**/api/v1/**", async (route, request) => {
        page2Tokens.push(
          request.headers()["authorization"] ?? "(no auth header)",
        );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: null }),
        });
      });

      // Navigate both pages, triggering API calls
      await page1.goto("/staff/schedule", {
        waitUntil: "domcontentloaded",
      });
      await page2.goto("/staff/schedule", {
        waitUntil: "domcontentloaded",
      });

      // Page 1 should send doctor-token-123
      expect(page1Tokens.length).toBeGreaterThanOrEqual(1);
      for (const token of page1Tokens) {
        expect(token).toContain("doctor-token-123");
      }

      // Page 2 should send nurse-token-456
      expect(page2Tokens.length).toBeGreaterThanOrEqual(1);
      for (const token of page2Tokens) {
        expect(token).toContain("nurse-token-456");
      }

      // Ensure page 1's token never leaks to page 2's requests
      for (const token of page2Tokens) {
        expect(token).not.toContain("doctor-token-123");
      }
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test("navigating between pages within the same context preserves the session", async ({
    page,
  }) => {
    await injectStaffSession(page, "ADMIN", "persistent-token");

    const authHeaders: string[] = [];
    await page.route("**/api/v1/**", async (route, request) => {
      authHeaders.push(
        request.headers()["authorization"] ?? "(no auth header)",
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: null }),
      });
    });

    // Navigate to multiple pages in sequence
    await page.goto("/staff/dashboard", { waitUntil: "domcontentloaded" });
    await page.goto("/staff/queue", { waitUntil: "domcontentloaded" });
    await page.goto("/admin/users", { waitUntil: "domcontentloaded" });

    // All requests from the same context should carry the same auth header
    expect(authHeaders.length).toBeGreaterThanOrEqual(1);
    for (const header of authHeaders) {
      expect(header).toContain("persistent-token");
    }
  });

  test("log out from one tab does not break the other tab's existing data view", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    try {
      // Inject same session into both pages
      await injectStaffSession(page1, "ADMIN", "shared-session-token");
      await injectStaffSession(page2, "ADMIN", "shared-session-token");

      // Mock a listing endpoint for page2
      await page2.route("**/api/v1/admin/departments", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                departmentId: "dept-cardio",
                name: "Cardiology",
                active: true,
              },
            ],
          }),
        });
      });

      // Page 2 loads its data first
      await page2.goto("/admin/departments", {
        waitUntil: "domcontentloaded",
      });
      await expect(page2.getByText("Cardiology")).toBeVisible();

      // Page 1 logs out, which clears session storage
      await page1.goto("/auth/logout", { waitUntil: "domcontentloaded" });
      await page1.waitForURL(/\/staff\/login/);

      // Page 2 should retain its already-loaded data
      // (the data was fetched before logout, so it stays in the DOM)
      await expect(page2.getByText("Cardiology")).toBeVisible();

      // Navigate page 2 to a new page — without session, it should redirect to login
      await page2.goto("/admin/users", {
        waitUntil: "domcontentloaded",
      });
      await expect(page2).toHaveURL(/\/staff\/login/);
    } finally {
      await context.close();
    }
  });
});
