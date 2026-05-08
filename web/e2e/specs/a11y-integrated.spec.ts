import { test } from "@playwright/test";
import { expectNoCriticalA11yViolations } from "../helpers/a11y";
import { staffRoutes, portalRoutes, adminRoutes } from "../helpers/routes";
import { StaffLoginPage, PortalLoginPage } from "../pages/login-page";
import { staffPersonas, patientPersona } from "../helpers/personas";

test.describe("@ui integrated accessibility audit", () => {
  test.describe("staff routes", () => {
    test("all staff routes have no serious accessibility violation", async ({ page }) => {
      test.setTimeout(120000);
      const login = new StaffLoginPage(page);
      await login.goto();
      await login.login(staffPersonas.admin.email, staffPersonas.admin.password);
      await page.waitForURL(/\/staff\/dashboard/);
      
      for (const route of staffRoutes) {
        if (route.path === "/staff/login") continue;
        
        await test.step(`checking ${route.path}`, async () => {
          await page.goto(route.path);
          await expectNoCriticalA11yViolations(page);
        });
      }
    });
  });

  test.describe("admin routes", () => {
    test("all admin routes have no serious accessibility violation", async ({ page }) => {
      test.setTimeout(120000);
      const login = new StaffLoginPage(page);
      await login.goto();
      await login.login(staffPersonas.admin.email, staffPersonas.admin.password);
      await page.waitForURL(/\/staff\/dashboard/);
      
      for (const route of adminRoutes) {
        await test.step(`checking ${route.path}`, async () => {
          await page.goto(route.path);
          await expectNoCriticalA11yViolations(page);
        });
      }
    });
  });

  test.describe("portal routes", () => {
    test("all portal routes have no serious accessibility violation", async ({ page }) => {
      test.setTimeout(120000);
      const login = new PortalLoginPage(page);
      await login.goto();
      await login.login(patientPersona.email, patientPersona.password);
      await page.waitForURL(/\/portal\/overview/);
      
      for (const route of portalRoutes) {
        if (route.path === "/portal/login" || route.path === "/portal/claim") continue;
        
        await test.step(`checking ${route.path}`, async () => {
          await page.goto(route.path);
          await expectNoCriticalA11yViolations(page);
        });
      }
    });
  });
});
