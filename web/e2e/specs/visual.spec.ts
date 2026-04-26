import { expect, test } from "@playwright/test";
import { visualRoutes } from "../helpers/routes";

test.describe("@visual visual baselines", () => {
  for (const route of visualRoutes) {
    test(`${route.label} visual baseline`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route.path);
      await expect(page).toHaveScreenshot(`${route.label.replace(/\s+/g, "-")}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});
