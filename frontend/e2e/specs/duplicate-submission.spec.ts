import { expect, test } from "@playwright/test";
import { expectNoNextErrorOverlay } from "../helpers/layout";

test.describe("@ui duplicate submission prevention", () => {
  let requestCount = 0;

  test.afterEach(async ({ page }) => {
    requestCount = 0;
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("submit button is disabled during form submission to prevent double booking", async ({
    page,
  }) => {
    // Inject staff session
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "RECEPTIONIST");
    });

    // Mock a slow API response for the booking endpoint so we can
    // observe the disabled state before the response resolves.
    let resolveBooking: ((body: string) => void) | null = null;
    const bookingPromise = new Promise<string>((resolve) => {
      resolveBooking = resolve;
    });

    await page.route("**/api/v1/appointments", async (route) => {
      requestCount += 1;
      const body = await bookingPromise;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body,
      });
    });

    // Mock supporting endpoints
    await page.route("**/api/v1/doctors", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "doctor-1",
              departmentId: "dept-cardio",
              fullName: "Dr. Sarah Jenkins",
              email: "sarah.jenkins@hospital-core.test",
              specialty: "Cardiology",
              qualification: "MD",
              experienceYears: 12,
            },
          ],
        }),
      });
    });

    await page.route("**/api/v1/doctors/doctor-1/slots*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "slot-1",
              doctorId: "doctor-1",
              slotDate: "2026-09-18",
              startTime: "09:00:00",
              endTime: "09:30:00",
              status: "AVAILABLE",
            },
          ],
        }),
      });
    });

    await page.goto("/booking", { waitUntil: "domcontentloaded" });

    // Fill out the booking form
    await page.locator("#booking-full-name").fill("Test Patient");
    await page.locator("#booking-phone").fill("+84987654321");
    await page.locator("#booking-email").fill("test.patient@example.com");
    await page.locator("#booking-cccd").fill("012345678901");
    await page.locator("#booking-dob").fill("1990-05-15");
    await page.locator("#booking-gender").selectOption("MALE");
    await page.locator("#booking-province").fill("Ho Chi Minh City");
    await page.locator("#booking-district").fill("District 1");
    await page.locator("#booking-street").fill("1 Nguyen Hue");
    await page.locator("#booking-symptoms").fill("General checkup");

    // Select a doctor and slot
    await page.locator("#booking-doctor").selectOption("doctor-1");
    await page.locator("#booking-date").fill("2026-09-18");
    await page.waitForTimeout(500);

    const slotButton = page.getByRole("button", {
      name: /09:00\s*-\s*09:30/,
    });
    if ((await slotButton.count()) > 0) {
      await slotButton.first().click();
    }

    // Click the submit button
    const submitButton = page.getByRole("button", {
      name: /Confirm Appointment|Book|Submit/i,
    });

    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // The button should be disabled while the request is in flight
    await expect(submitButton).toBeDisabled({ timeout: 5_000 });

    // Resolve the slow booking request
    resolveBooking!(
      JSON.stringify({
        success: true,
        data: { appointmentId: "new-appointment-1", status: "CONFIRMED" },
      }),
    );

    // Wait for the response to complete and the UI to update
    await page.waitForTimeout(1_000);
    await expectNoNextErrorOverlay(page);
  });

  test("double submission of the same form is blocked client-side", async ({
    page,
  }) => {
    // Inject staff session
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "RECEPTIONIST");
    });

    // Mock a slow booking endpoint, counting requests
    let resolveBooking: ((body: string) => void) | null = null;
    const bookingPromise = new Promise<string>((resolve) => {
      resolveBooking = resolve;
    });

    await page.route("**/api/v1/appointments", async (route) => {
      requestCount += 1;
      const body = await bookingPromise;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body,
      });
    });

    // Mock supporting endpoints
    await page.route("**/api/v1/doctors", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "doctor-1",
              departmentId: "dept-cardio",
              fullName: "Dr. Sarah Jenkins",
              specialty: "Cardiology",
              qualification: "MD",
              experienceYears: 12,
            },
          ],
        }),
      });
    });

    await page.route("**/api/v1/doctors/doctor-1/slots*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "slot-1",
              doctorId: "doctor-1",
              slotDate: "2026-09-18",
              startTime: "09:00:00",
              endTime: "09:30:00",
              status: "AVAILABLE",
            },
          ],
        }),
      });
    });

    await page.goto("/booking", { waitUntil: "domcontentloaded" });

    // Fill out the booking form
    await page.locator("#booking-full-name").fill("Test Patient Duplicate");
    await page.locator("#booking-phone").fill("+84987654322");
    await page.locator("#booking-email").fill("test.dup@example.com");
    await page.locator("#booking-cccd").fill("098765432109");
    await page.locator("#booking-dob").fill("1990-05-15");
    await page.locator("#booking-gender").selectOption("MALE");
    await page.locator("#booking-province").fill("Ho Chi Minh City");
    await page.locator("#booking-district").fill("District 1");
    await page.locator("#booking-street").fill("1 Nguyen Hue");
    await page.locator("#booking-symptoms").fill("Follow-up visit");

    // Select doctor and slot
    await page.locator("#booking-doctor").selectOption("doctor-1");
    await page.locator("#booking-date").fill("2026-09-18");
    await page.waitForTimeout(500);

    const slotButton = page.getByRole("button", {
      name: /09:00\s*-\s*09:30/,
    });
    if ((await slotButton.count()) > 0) {
      await slotButton.first().click();
    }

    const submitButton = page.getByRole("button", {
      name: /Confirm Appointment|Book|Submit/i,
    });
    await expect(submitButton).toBeVisible();

    // Click submit twice rapidly
    await submitButton.click();
    await page.waitForTimeout(200);
    await submitButton.click().catch(() => {
      // Click may fail if button becomes disabled — that's expected behavior
    });

    // Resolve the booking request
    resolveBooking!(
      JSON.stringify({
        success: true,
        data: { appointmentId: "new-appointment-2", status: "CONFIRMED" },
      }),
    );

    await page.waitForTimeout(1_000);

    // Verify that only one booking request was sent
    expect(requestCount).toBe(1);
    await expectNoNextErrorOverlay(page);
  });

  test("submit button on the public booking page is disabled while loading", async ({
    page,
  }) => {
    // Mock a slow response for public booking creation
    let resolveBooking: ((body: string) => void) | null = null;
    const bookingPromise = new Promise<string>((resolve) => {
      resolveBooking = resolve;
    });

    await page.route("**/api/v1/appointments", async (route) => {
      const body = await bookingPromise;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body,
      });
    });

    // Mock doctor and slots endpoints
    await page.route("**/api/v1/doctors", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "doctor-1",
              departmentId: "dept-cardio",
              fullName: "Dr. Sarah Jenkins",
              specialty: "Cardiology",
              qualification: "MD",
              experienceYears: 12,
            },
          ],
        }),
      });
    });

    await page.route("**/api/v1/doctors/doctor-1/slots*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "slot-1",
              doctorId: "doctor-1",
              slotDate: "2026-09-18",
              startTime: "09:00:00",
              endTime: "09:30:00",
              status: "AVAILABLE",
            },
          ],
        }),
      });
    });

    await page.goto("/booking", { waitUntil: "domcontentloaded" });

    // Fill out the booking form
    await page.locator("#booking-full-name").fill("Public Test User");
    await page.locator("#booking-phone").fill("+84987654323");
    await page.locator("#booking-email").fill("public.test@example.com");
    await page.locator("#booking-cccd").fill("112233445566");
    await page.locator("#booking-dob").fill("1985-03-20");
    await page.locator("#booking-gender").selectOption("FEMALE");
    await page.locator("#booking-province").fill("Hanoi");
    await page.locator("#booking-district").fill("Hoan Kiem");
    await page.locator("#booking-street").fill("2 Le Loi");
    await page.locator("#booking-symptoms").fill("Routine checkup");

    // Select a doctor and slot
    await page.locator("#booking-doctor").selectOption("doctor-1");
    await page.locator("#booking-date").fill("2026-09-18");
    await page.waitForTimeout(500);

    const slotButton = page.getByRole("button", {
      name: /09:00\s*-\s*09:30/,
    });
    if ((await slotButton.count()) > 0) {
      await slotButton.first().click();
    }

    const submitButton = page.getByRole("button", {
      name: /Confirm Appointment|Submitting/i,
    });
    await expect(submitButton).toBeVisible();

    // Click submit and verify the button becomes disabled
    await submitButton.click();
    await expect(submitButton).toBeDisabled({ timeout: 5_000 });

    // Release the booking request
    resolveBooking!(
      JSON.stringify({
        success: true,
        data: { appointmentId: "public-appt-1", status: "CONFIRMED" },
      }),
    );

    await page.waitForTimeout(1_000);
    await expectNoNextErrorOverlay(page);
  });
});
