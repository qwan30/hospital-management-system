import { expect, test } from "@playwright/test";
import { apiURL, isBackendHealthy } from "../helpers/backend";
import { resolveLiveSmokeRoutes, staffAccessToken } from "../helpers/live-routes";
import { staffPersonas } from "../helpers/personas";

const expectsReleaseSeed = process.env.HMS_EXPECT_RELEASE_DEMO_SEED === "true";

test.describe("@integrated @release live route detail contracts", () => {
  test.beforeEach(async ({ browserName, request }) => {
    test.skip(browserName !== "chromium", "Live route detail contracts run once on Chromium");
    test.skip(!expectsReleaseSeed, "Set HMS_EXPECT_RELEASE_DEMO_SEED=true for live route detail verification");
    test.skip(!(await isBackendHealthy(request)), `Backend is not healthy at ${apiURL}`);
  });

  test("resolves seeded detail routes without placeholder ids or raw backend errors", async ({
    page,
    request,
  }) => {
    const routes = await resolveLiveSmokeRoutes(request);
    const pathsByLabel = new Map(routes.map((route) => [route.label, route.path]));

    expect(pathsByLabel.get("public department detail")).toMatch(/^\/departments\/(?!cardiology$).+/);
    expect(pathsByLabel.get("staff lab result detail")).toMatch(/^\/staff\/lab-results\/(?!1$).+/);
    expect(pathsByLabel.get("staff medical record edit")).toMatch(/^\/staff\/medical-records\/(?!1\/edit$).+\/edit$/);
    expect(pathsByLabel.get("admin user detail")).toMatch(/^\/admin\/users\/(?!1$).+/);

    await page.goto(pathsByLabel.get("public department detail")!, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Cardiology|Doctors in this department/i, {
      timeout: 15_000,
    });
    await expect(page.locator("body")).not.toContainText(/Invalid request parameter|Department could not be loaded/i);

    const adminToken = await staffAccessToken(
      request,
      staffPersonas.admin.email,
      staffPersonas.admin.password,
    );
    await page.addInitScript((accessToken) => {
      window.sessionStorage.setItem("hms_staff_access_token", accessToken);
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    }, adminToken);

    await page.goto(pathsByLabel.get("staff lab result detail")!, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText(/Invalid request parameter|Lab result not found/i);

    await page.goto(pathsByLabel.get("staff medical record edit")!, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Patient Record Entry" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Invalid request parameter/i);

    await page.goto(pathsByLabel.get("admin user detail")!, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Staff Directory/i })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Invalid request parameter|Staff user not found/i);
  });
});
