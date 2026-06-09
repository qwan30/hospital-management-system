import { expect, test } from "@playwright/test";

const confirmedAppointmentId = "11111111-1111-1111-1111-111111111111";
const checkedInAppointmentId = "22222222-2222-2222-2222-222222222222";

const confirmedAppointment = {
  appointmentId: confirmedAppointmentId,
  confirmationCode: "Q-1001",
  status: "CONFIRMED",
  appointmentDate: "2026-11-15",
  startTime: "09:00:00",
  endTime: "09:30:00",
  checkedInAt: null,
  doctorId: "33333333-3333-3333-3333-333333333333",
  doctorName: "Dr. Lan Tran",
  patientId: "44444444-4444-4444-4444-444444444444",
  patientFullName: "Mai Nguyen",
  patientPhone: "+84900000001",
  patientCccd: "012345678901",
};

const checkedInAppointment = {
  appointmentId: checkedInAppointmentId,
  confirmationCode: "Q-1002",
  status: "CHECKED_IN",
  appointmentDate: "2026-11-15",
  startTime: "09:30:00",
  endTime: "10:00:00",
  checkedInAt: "2026-11-15T09:28:00",
  doctorId: "55555555-5555-5555-5555-555555555555",
  doctorName: "Dr. Minh Pham",
  patientId: "66666666-6666-6666-6666-666666666666",
  patientFullName: "Bao Le",
  patientPhone: "+84900000002",
  patientCccd: "098765432109",
};

const completedAppointment = {
  ...checkedInAppointment,
  appointmentId: "77777777-7777-7777-7777-777777777777",
  confirmationCode: "Q-1003",
  status: "DONE",
  patientFullName: "Completed Patient",
};

test.describe("@ui staff queue board", () => {
  test("shows an unauthorized state without rendering static patient rows", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "NURSE");
    });

    await page.route("**/api/v1/queue/today", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Unauthorized",
          error: { code: "UNAUTHORIZED", message: "Unauthorized" },
        }),
      });
    });

    await page.route("**/api/v1/appointments/today", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Unauthorized",
          error: { code: "UNAUTHORIZED", message: "Unauthorized" },
        }),
      });
    });

    await page.goto("/staff/queue");

    await expect(page.getByTestId("queue-unauthorized")).toBeVisible();
    await expect(page.getByText("ELIAS, NATHANIEL")).toHaveCount(0);
  });

  test("renders live queue data and checks in a waiting appointment", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "NURSE");
    });

    await page.route("**/api/v1/queue/today", async (route) => {
      expect(route.request().headers().authorization).toBe("Bearer staff-token");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [checkedInAppointment],
        }),
      });
    });

    await page.route("**/api/v1/appointments/today", async (route) => {
      expect(route.request().headers().authorization).toBe("Bearer staff-token");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [confirmedAppointment, checkedInAppointment],
        }),
      });
    });

    await page.route(
      `**/api/v1/appointments/${confirmedAppointmentId}/checkin`,
      async (route) => {
        expect(route.request().headers().authorization).toBe("Bearer staff-token");
        const requestBody = route.request().postDataJSON() as {
          checkedInAt?: string;
        };

        expect(requestBody.checkedInAt).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
        );

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              ...confirmedAppointment,
              status: "CHECKED_IN",
              checkedInAt: requestBody.checkedInAt,
            },
          }),
        });
      },
    );

    await page.goto("/staff/queue");

    await expect(page.getByTestId("queue-board")).toBeVisible();
    await expect(page.getByText("Mai Nguyen", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Ready" }).click();
    await expect(page.getByText("Bao Le", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Waiting" }).click();
    await page.getByRole("button", { name: /Check in Mai Nguyen/i }).click();

    await expect(page.getByRole("button", { name: "Ready" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByText("Mai Nguyen", { exact: true })).toBeVisible();
    await expect(
      page.getByTestId("queue-row").filter({ hasText: "Mai Nguyen" }),
    ).toContainText("Ready");
  });

  test("supports queue call, room assignment, consultation, and completion actions", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "NURSE");
    });

    let callRequests = 0;
    let assignRequests = 0;
    let startRequests = 0;
    let completeRequests = 0;

    await page.route("**/api/v1/queue/today", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [checkedInAppointment],
        }),
      });
    });

    await page.route("**/api/v1/appointments/today", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [checkedInAppointment],
        }),
      });
    });

    await page.route(`**/api/v1/queue/${checkedInAppointmentId}/call`, async (route) => {
      callRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: checkedInAppointment }),
      });
    });

    await page.route(
      `**/api/v1/queue/${checkedInAppointmentId}/assign-room`,
      async (route) => {
        assignRequests += 1;
        expect(route.request().postDataJSON()).toEqual({ roomName: "Consult Room 1" });
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: checkedInAppointment }),
        });
      },
    );

    await page.route(
      `**/api/v1/queue/${checkedInAppointmentId}/start-consultation`,
      async (route) => {
        startRequests += 1;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { ...checkedInAppointment, status: "IN_PROGRESS" },
          }),
        });
      },
    );

    await page.route(
      `**/api/v1/queue/${checkedInAppointmentId}/complete`,
      async (route) => {
        completeRequests += 1;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: { ...checkedInAppointment, status: "DONE" },
          }),
        });
      },
    );

    await page.goto("/staff/queue");
    await page.getByRole("button", { name: "Ready" }).click();

    const row = page.getByTestId("queue-row").filter({ hasText: "Bao Le" });
    await row.getByRole("button", { name: /Call Bao Le/i }).click();
    await row.getByRole("button", { name: /Assign room Bao Le/i }).click();
    await row.getByRole("button", { name: /Start consultation Bao Le/i }).click();

    await expect(page.getByRole("button", { name: "In progress" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Accept the confirmation dialog triggered by the complete action
    page.once("dialog", (dialog) => dialog.accept());

    await page
      .getByTestId("queue-row")
      .filter({ hasText: "Bao Le" })
      .getByRole("button", { name: /Complete visit Bao Le/i })
      .click();

    expect(callRequests).toBe(1);
    expect(assignRequests).toBe(1);
    expect(startRequests).toBe(1);
    expect(completeRequests).toBe(1);
    await expect(page.getByText("Bao Le", { exact: true })).toHaveCount(0);
  });

  test("hides terminal appointments even when they have check-in timestamps", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "NURSE");
    });

    await page.route("**/api/v1/queue/today", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
    });

    await page.route("**/api/v1/appointments/today", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [completedAppointment],
        }),
      });
    });

    await page.goto("/staff/queue");

    await page.getByRole("button", { name: "Ready" }).click();
    await expect(page.getByText("Completed Patient", { exact: true })).toHaveCount(0);
    await expect(page.getByTestId("queue-empty")).toBeVisible();
  });
});
