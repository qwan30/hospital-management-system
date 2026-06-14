import { test } from "@playwright/test";
import { expectNoNextErrorOverlay, expectStableLayout } from "../helpers/layout";
import { responsiveRoutes } from "../helpers/routes";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

test.describe("@ui responsive layout audit", () => {
  for (const viewport of viewports) {
    for (const route of responsiveRoutes) {
      test(`${route.label} fits ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await expectNoNextErrorOverlay(page);
        await expectStableLayout(page);
      });
    }
  }
});
