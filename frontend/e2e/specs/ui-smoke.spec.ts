import { expect, test } from "@playwright/test";
import { expectNoCriticalA11yViolations } from "../helpers/a11y";
import { collectConsoleProblems } from "../helpers/console";
import {
  exhaustiveRouteContracts,
  installExhaustiveApiMocks,
  seedRouteSession,
} from "../helpers/exhaustive-route-contracts";
import { expectNoNextErrorOverlay } from "../helpers/layout";
import { publicRoutes, smokeRoutes } from "../helpers/routes";

test.describe("@ui route smoke audit", () => {
  for (const route of smokeRoutes) {
    test(`${route.label} loads ${route.path}`, async ({ page }) => {
      const contract = exhaustiveRouteContracts.find((candidate) => candidate.path === route.path);
      const consoleProblems = collectConsoleProblems(page);
      await seedRouteSession(page, contract?.role);
      await installExhaustiveApiMocks(page);

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

      expect(response?.status(), `${route.path} response status`).toBeLessThan(400);
      await expect(page.locator("main").first()).toBeVisible({ timeout: 15_000 });
      await expectNoNextErrorOverlay(page);
      expect(consoleProblems, `${route.path} console problems`).toEqual([]);
    });
  }
});

test.describe("@ui public accessibility audit", () => {
  for (const route of publicRoutes) {
    test(`${route.label} has no serious accessibility violation`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expectNoCriticalA11yViolations(page);
    });
  }
});
