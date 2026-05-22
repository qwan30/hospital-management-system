import { expect, test, type Page } from "@playwright/test";
import { collectConsoleProblems } from "../helpers/console";
import { expectNoNextErrorOverlay } from "../helpers/layout";
import {
  exhaustiveRouteContracts,
  installExhaustiveApiMocks,
  seedRouteSession,
} from "../helpers/exhaustive-route-contracts";

test.describe("@ui exhaustive route contracts", () => {
  for (const route of exhaustiveRouteContracts) {
    test(`${route.area}: ${route.label} renders route-specific content at ${route.path}`, async ({
      page,
    }) => {
      const consoleProblems = collectConsoleProblems(page);
      const apiRequests = collectApiRequests(page);
      await seedRouteSession(page, route.role);
      await installExhaustiveApiMocks(page);

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

      expect(response?.status(), `${route.path} response status`).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(route.expectedText);
      await expectRouteApiRequests(route, apiRequests);
      await expectNoNextErrorOverlay(page);
      expect(consoleProblems, `${route.path} console problems`).toEqual([]);
    });
  }

  test("side-effect logout route clears session and returns to staff login", async ({ page }) => {
    await seedRouteSession(page, "ADMIN");
    await installExhaustiveApiMocks(page);

    await page.goto("/auth/logout", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/staff\/login$/, { timeout: 15000 });
    await expect(page.locator("body")).toContainText(/Clinical Suite Access|Log in/i);
    await expect(
      page.evaluate(() => window.sessionStorage.getItem("hms_staff_access_token")),
    ).resolves.toBeNull();
  });
});

test.describe("@ui exhaustive route guard denials", () => {
  test("unauthenticated staff routes redirect to staff login", async ({ page }) => {
    await installExhaustiveApiMocks(page);

    await page.goto("/staff/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/staff\/login$/, { timeout: 15000 });
  });

  test("unauthenticated admin routes redirect to staff login", async ({ page }) => {
    await installExhaustiveApiMocks(page);

    await page.goto("/admin/users", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/staff\/login$/, { timeout: 15000 });
  });

  test("unauthenticated portal routes redirect to portal login", async ({ page }) => {
    await installExhaustiveApiMocks(page);

    await page.goto("/portal/overview", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/portal\/login$/, { timeout: 15000 });
  });

  test("staff roles outside a route policy land on forbidden", async ({ page }) => {
    await seedRouteSession(page, "ACCOUNTANT");
    await installExhaustiveApiMocks(page);

    await page.goto("/staff/queue", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/forbidden$/, { timeout: 15000 });
    await expect(page.locator("body")).toContainText(/Access denied|Forbidden/i);
  });

  test("patient portal session is not accepted as staff authentication", async ({ page }) => {
    await seedRouteSession(page, "PATIENT");
    await installExhaustiveApiMocks(page);

    await page.goto("/staff/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/staff\/login$/, { timeout: 15000 });
  });
});

type ObservedApiRequest = {
  url: string;
  authorization?: string;
};

function collectApiRequests(page: Page) {
  const requests: ObservedApiRequest[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) {
      requests.push({
        url: request.url(),
        authorization: request.headers().authorization,
      });
    }
  });
  return requests;
}

async function expectRouteApiRequests(
  route: (typeof exhaustiveRouteContracts)[number],
  requests: ObservedApiRequest[],
) {
  if (!route.expectedApiRequests?.length) {
    return;
  }

  await expect
    .poll(
      () =>
        route.expectedApiRequests?.filter((expected) =>
          requests.some((request) => expected.test(request.url)),
        ).length ?? 0,
      { message: `${route.path} expected API requests` },
    )
    .toBe(route.expectedApiRequests.length);

  const expectedAuthorization = expectedAuthorizationForArea(route.area);
  if (!expectedAuthorization) {
    return;
  }

  for (const expected of route.expectedApiRequests) {
    const observed = requests.find((request) => expected.test(request.url));
    expect(observed?.authorization, `${route.path} ${expected} authorization`).toBe(
      expectedAuthorization,
    );
  }
}

function expectedAuthorizationForArea(area: (typeof exhaustiveRouteContracts)[number]["area"]) {
  if (area === "portal") {
    return "Bearer exhaustive-patient-token";
  }

  if (area === "staff" || area === "admin") {
    return "Bearer exhaustive-staff-token";
  }

  return undefined;
}
