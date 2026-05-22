import { expect, test, type Page } from "@playwright/test";

async function seedStaffSession(page: Page, role = "ADMIN") {
  await page.addInitScript((selectedRole) => {
    window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
    window.sessionStorage.setItem("hms_staff_role", selectedRole);
  }, role);
}

async function seedPatientSession(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("hms_patient_access_token", "patient-token");
    window.sessionStorage.setItem("hms_patient_role", "PATIENT");
  });
}

test.describe("@ui live operations API screens", () => {
  test("renders inventory items, lots, movements, and alerts from API responses", async ({
    page,
  }) => {
    await seedStaffSession(page, "PHARMACIST");
    await page.route("**/api/v1/inventory/items", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              itemId: "item-1",
              sku: "MED-SAL-500",
              itemName: "Normal Saline 500ml",
              category: "Consumable",
              unit: "bag",
              reorderLevel: 40,
              quantityOnHand: 18,
              status: "LOW_STOCK",
              departmentName: "Internal Medicine",
              lastRestockedAt: "2026-04-20T08:00:00Z",
            },
          ],
        }),
      });
    });
    await page.route("**/api/v1/inventory/lots", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              lotId: "lot-1",
              itemId: "item-1",
              itemName: "Normal Saline 500ml",
              lotCode: "LOT-SAL-2401",
              supplierName: "MedSupply VN",
              quantityReceived: 40,
              quantityRemaining: 18,
              expiresOn: "2026-05-10",
            },
          ],
        }),
      });
    });
    await page.route("**/api/v1/inventory/movements", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              movementId: "movement-1",
              itemId: "item-1",
              itemName: "Normal Saline 500ml",
              movementType: "DISPENSE",
              quantityDelta: -6,
              note: "Ward usage",
              createdAt: "2026-04-26T08:00:00Z",
            },
          ],
        }),
      });
    });
    await page.route("**/api/v1/inventory/alerts", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              alertType: "LOW_STOCK",
              severity: "WARNING",
              itemId: "item-1",
              itemName: "Normal Saline 500ml",
              lotId: null,
              lotCode: null,
              quantityOnHand: 18,
              reorderLevel: 40,
              expiresOn: null,
              daysUntilExpiry: null,
              message: "Normal Saline 500ml is at or below reorder level",
            },
            {
              alertType: "EXPIRING_SOON",
              severity: "WARNING",
              itemId: "item-1",
              itemName: "Normal Saline 500ml",
              lotId: "lot-1",
              lotCode: "LOT-SAL-2401",
              quantityOnHand: 18,
              reorderLevel: 40,
              expiresOn: "2026-05-10",
              daysUntilExpiry: 14,
              message: "LOT-SAL-2401 expires on 2026-05-10",
            },
          ],
        }),
      });
    });

    await page.goto("/staff/inventory");

    await expect(page.getByTestId("inventory-workspace")).toBeVisible();
    await expect(page.getByRole("table").getByText("Normal Saline 500ml")).toBeVisible();
    await expect(page.getByText("LOT-SAL-2401")).toBeVisible();
    await expect(page.getByText("Ward usage")).toBeVisible();
    await expect(page.getByText("1 low-stock item")).toBeVisible();
    await expect(page.getByText("1 expiring lot")).toBeVisible();
  });

  test("renders monitoring snapshot and audit log rows from admin APIs", async ({
    page,
  }) => {
    await seedStaffSession(page, "ADMIN");
    await page.route("**/api/v1/admin/monitoring", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            generatedAt: "2026-04-26T09:00:00Z",
            uptimeSeconds: 3661,
            healthy: true,
            activeAlerts: 2,
            scheduleAlertCount: 1,
            inventoryAlertCount: 1,
            databaseStatus: "UP",
            queueStatus: "DEGRADED",
          },
        }),
      });
    });
    await page.route("**/api/v1/admin/audit-logs**", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              auditLogId: "audit-1",
              actorName: "System Admin",
              actorRole: "ADMIN",
              action: "QUEUE_CALL_PATIENT",
              entityType: "APPOINTMENT",
              entityId: "appointment-1",
              metadata: { room: "Consult 2" },
              createdAt: "2026-04-26T09:05:00Z",
            },
          ],
        }),
      });
    });
    await page.route("**/api/v1/inventory/alerts", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              alertType: "LOW_STOCK",
              severity: "WARNING",
              itemId: "item-1",
              itemName: "Normal Saline 500ml",
              lotId: null,
              lotCode: null,
              quantityOnHand: 18,
              reorderLevel: 40,
              expiresOn: null,
              daysUntilExpiry: null,
              message: "Normal Saline 500ml is at or below reorder level",
            },
          ],
        }),
      });
    });

    await page.goto("/admin/monitoring");
    await expect(page.getByTestId("monitoring-snapshot")).toContainText("DEGRADED");
    await expect(page.getByText("2 active alerts")).toBeVisible();
    await expect(page.getByTestId("monitoring-snapshot")).toContainText("Inventory Alerts");

    await page.goto("/admin/audit-logs");
    await expect(page.getByTestId("audit-log-table")).toContainText("QUEUE_CALL_PATIENT");
    await expect(page.getByText("System Admin")).toBeVisible();
  });

  test("renders patient overview data from patient portal APIs", async ({ page }) => {
    await seedPatientSession(page);
    await page.route("**/api/v1/patient-portal/overview", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            patientFullName: "Nguyen Thi Hoa",
            upcomingAppointmentCount: 1,
            unreadMessageCount: 1,
            labResultCount: 1,
          },
        }),
      });
    });
    await page.route("**/api/v1/patient-portal/lab-results", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              labResultId: "lab-1",
              testName: "Complete Blood Count",
              status: "Reviewed",
              resultSummary: "Mild eosinophilia consistent with allergic response.",
              doctorComment: "Continue allergy control plan.",
              attachmentUrl: "/demo-cbc.pdf",
              collectedAt: "2026-04-20T08:00:00Z",
            },
          ],
        }),
      });
    });

    await page.goto("/portal/overview");

    await expect(page.getByTestId("patient-portal-overview")).toContainText(
      "Nguyen Thi Hoa",
    );
    await expect(page.getByText("Complete Blood Count")).toBeVisible();
    await expect(page.getByText("1 unread message")).toBeVisible();
  });
});
