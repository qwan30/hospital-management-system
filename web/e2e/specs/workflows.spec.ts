import { expect, test } from "@playwright/test";
import { BookingPage } from "../pages/booking-page";
import { installUiApiMocks } from "../helpers/ui-api-mocks";

test.describe("@ui critical workflow smoke", () => {
  test.beforeEach(async ({ page }) => {
    await installUiApiMocks(page);
  });

  test("public booking validates required intake fields", async ({ page }) => {
    const booking = new BookingPage(page);

    await booking.goto();
    await booking.submitEmpty();

    await booking.expectValidation();
    await expect(page).toHaveURL(/\/booking$/);
  });

  test("patient portal overview exposes core portal destinations", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_patient_access_token", "patient-token");
      window.sessionStorage.setItem("hms_patient_role", "PATIENT");
    });

    await page.goto("/portal/overview");

    for (const name of [
      /Electronic Records/i,
      /Appointments/i,
      /Pharmacy/i,
      /Lab Results/i,
      /Billing/i,
      /Messages/i,
      /Profile/i,
    ]) {
      await expect(page.getByRole("link", { name }).first()).toBeVisible();
    }
  });

  test("staff clinical pages expose expected clinical headings", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });

    const routes = [
      { path: "/staff/queue", heading: /Queue/i },
      { path: "/staff/nurse-intake", heading: /Intake/i },
      { path: "/staff/vital-signs", heading: /Vital/i },
      { path: "/staff/closures", heading: /Special Closures|Closure Calendar/i },
      { path: "/staff/doctor/dashboard", heading: /Dashboard|Consultation|Doctor/i },
      { path: "/staff/medical-records/1/edit", heading: /Patient Record Entry/i },
      { path: "/staff/prescriptions/preview", heading: /Prescription|Preview/i },
      { path: "/staff/lab-results/1", heading: /Complete Blood Count/i },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
    }
  });

  test("admin pages expose expected operations headings", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });

    const routes = [
      { path: "/admin/dashboard", heading: /Admin Statistics|Dashboard|Performance/i },
      { path: "/admin/users", heading: /Users|Personnel|Staff/i },
      { path: "/admin/departments", heading: /Departments/i },
      { path: "/admin/appointments", heading: /Appointment Management|Appointments/i },
      { path: "/admin/audit-logs", heading: /Audit Logs/i },
      { path: "/admin/monitoring", heading: /Monitoring|Operational Health/i },
      { path: "/admin/news", heading: /News/i },
      { path: "/admin/public-content", heading: /Public Content|Public Facing|Hero Landing/i },
      { path: "/admin/rooms", heading: /Rooms|Room/i },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
    }
  });
});
