import { test, type Page } from "@playwright/test";
import { expectNoCriticalA11yViolations } from "../helpers/a11y";
import { staffRoutes, portalRoutes, adminRoutes } from "../helpers/routes";

const staffA11yRoutes = staffRoutes.filter((route) =>
  ["/staff/dashboard", "/staff/queue", "/staff/inventory", "/staff/support"].includes(
    route.path,
  ),
);

const adminA11yRoutes = adminRoutes.filter((route) =>
  ["/admin/audit-logs", "/admin/monitoring", "/admin/users"].includes(route.path),
);

const portalA11yRoutes = portalRoutes.filter((route) =>
  [
    "/portal/overview",
    "/portal/appointments",
    "/portal/lab-results",
    "/portal/messages",
    "/portal/profile",
  ].includes(route.path),
);

async function seedStaffSession(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("hms_staff_access_token", "ui-a11y-staff-token");
    window.sessionStorage.setItem("hms_staff_role", "ADMIN");
  });
}

async function seedPatientSession(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("hms_patient_access_token", "ui-a11y-patient-token");
    window.sessionStorage.setItem("hms_patient_role", "PATIENT");
  });
}

test.describe("@ui integrated accessibility audit", () => {
  test.describe("staff routes", () => {
    test("contract-backed staff routes have no serious accessibility violation", async ({ page }) => {
      test.setTimeout(120000);
      await seedStaffSession(page);
      
      for (const route of staffA11yRoutes) {
        await test.step(`checking ${route.path}`, async () => {
          await page.goto(route.path, { waitUntil: "domcontentloaded" });
          await expectNoCriticalA11yViolations(page);
        });
      }
    });
  });

  test.describe("admin routes", () => {
    test("contract-backed admin routes have no serious accessibility violation", async ({ page }) => {
      test.setTimeout(120000);
      await seedStaffSession(page);
      
      for (const route of adminA11yRoutes) {
        await test.step(`checking ${route.path}`, async () => {
          await page.goto(route.path, { waitUntil: "domcontentloaded" });
          await expectNoCriticalA11yViolations(page);
        });
      }
    });
  });

  test.describe("portal routes", () => {
    test("contract-backed portal routes have no serious accessibility violation", async ({ page }) => {
      test.setTimeout(120000);
      await seedPatientSession(page);
      
      for (const route of portalA11yRoutes) {
        await test.step(`checking ${route.path}`, async () => {
          await page.goto(route.path, { waitUntil: "domcontentloaded" });
          await expectNoCriticalA11yViolations(page);
        });
      }
    });
  });
});
