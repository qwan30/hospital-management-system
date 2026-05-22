import { expect, test } from "@playwright/test";
import { visualRoutes } from "../helpers/routes";
import {
  installExhaustiveApiMocks,
  seedRouteSession,
  type SeededRole,
} from "../helpers/exhaustive-route-contracts";

const VISUAL_BASELINE_TIME = new Date("2026-05-13T09:06:00+07:00");

test.describe("@visual visual baselines", () => {
  for (const route of visualRoutes) {
    test(`${route.label} visual baseline`, async ({ page }) => {
      await page.clock.setFixedTime(VISUAL_BASELINE_TIME);
      await seedRouteSession(page, roleForVisualRoute(route.path));
      await installExhaustiveApiMocks(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route.path);
      await expect(page).toHaveScreenshot(`${route.label.replace(/\s+/g, "-")}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

function roleForVisualRoute(path: string): SeededRole | undefined {
  if (path.startsWith("/admin")) {
    return "ADMIN";
  }

  if (path === "/staff/schedule") {
    return "DOCTOR";
  }

  if (path.startsWith("/staff")) {
    return "ADMIN";
  }

  if (path.startsWith("/portal")) {
    return "PATIENT";
  }

  return undefined;
}
