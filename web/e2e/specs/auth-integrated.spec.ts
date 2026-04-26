import { expect, test } from "@playwright/test";
import { apiURL, isBackendHealthy } from "../helpers/backend";
import { patientPersona, staffPersonas } from "../helpers/personas";
import { BookingPage } from "../pages/booking-page";
import { PortalLoginPage, StaffLoginPage } from "../pages/login-page";

test.describe("@integrated auth and API flows", () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!(await isBackendHealthy(request)), `Backend is not healthy at ${apiURL}`);
  });

  test("staff valid login calls /api/v1/auth/login and opens dashboard", async ({ page }) => {
    const login = new StaffLoginPage(page);

    await login.goto();

    const authResponse = page.waitForResponse((response) =>
      response.url().includes("/api/v1/auth/login"),
    );
    await login.login(staffPersonas.admin.email, staffPersonas.admin.password);

    expect((await authResponse).ok()).toBe(true);
    await expect(page).toHaveURL(/\/staff\/dashboard$/);
  });

  test("staff invalid login stays on login and shows an error", async ({ page }) => {
    const login = new StaffLoginPage(page);

    await login.goto();

    const authResponse = page.waitForResponse((response) =>
      response.url().includes("/api/v1/auth/login"),
    );
    await login.login("wrong@hospital.vn", "wrongpass");

    expect((await authResponse).status()).toBeGreaterThanOrEqual(400);
    await expect(page).toHaveURL(/\/staff\/login$/);
    await login.expectError();
  });

  test("patient login calls /api/v1/patient-auth/login", async ({ page }) => {
    const login = new PortalLoginPage(page);

    await login.goto();

    const authResponse = page.waitForResponse((response) =>
      response.url().includes("/api/v1/patient-auth/login"),
    );
    await login.login(patientPersona.email, patientPersona.password);

    const response = await authResponse;
    expect(response.status()).toBeLessThan(500);

    if (response.ok()) {
      await expect(page).toHaveURL(/\/portal\/overview$/);
    } else {
      await expect(page).toHaveURL(/\/portal\/login$/);
      await login.expectError();
    }
  });

  test("patient claim calls /api/v1/patient-auth/claim", async ({ page }) => {
    await page.goto("/portal/claim");
    await page.getByLabel(/Patient Full Name/i).fill(patientPersona.fullName);
    await page.getByLabel(/Citizen ID/i).fill(patientPersona.citizenId);
    await page.getByLabel(/Date of Birth/i).fill(patientPersona.dateOfBirth);
    await page.getByLabel(/Registered Email/i).fill(patientPersona.email);
    await page.getByLabel(/^Password$/i).fill(patientPersona.password);

    const claimResponse = page.waitForResponse((response) =>
      response.url().includes("/api/v1/patient-auth/claim"),
    );
    await page.getByRole("button", { name: /Request Verification Code/i }).click();

    expect((await claimResponse).status()).toBeLessThan(500);
    await expect(page.getByRole("alert").filter({ hasText: /./ }).first()).toBeVisible();
  });

  test("logout calls staff auth logout endpoint", async ({ page }) => {
    const logoutResponse = page.waitForResponse((response) =>
      response.url().includes("/api/v1/auth/logout"),
    );

    await page.goto("/auth/logout");

    expect((await logoutResponse).ok()).toBe(true);
    await expect(page).toHaveURL(/\/staff\/login$/);
  });

  test("public booking submits an appointment request after valid intake", async ({ page }) => {
    const booking = new BookingPage(page);

    await booking.goto();
    await booking.fillValidIntake();

    const appointmentRequest = page.waitForRequest((request) =>
      request.url().includes("/api/v1/appointments"),
    );
    await booking.submit();

    await appointmentRequest;
    await expect(page.getByRole("alert").filter({ hasText: /./ }).first()).toBeVisible();
  });
});
