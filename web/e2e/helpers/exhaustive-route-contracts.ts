import type { Page } from "@playwright/test";
import { adminRoutes, portalRoutes, publicRoutes, staffRoutes } from "./routes";

export type RouteArea = "public" | "staff" | "portal" | "admin";
export type SeededRole =
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "ACCOUNTANT"
  | "PATIENT";

export interface ExhaustiveRouteContract {
  path: string;
  label: string;
  area: RouteArea;
  expectedText: RegExp;
  expectedApiRequests?: RegExp[];
  role?: SeededRole;
}

const publicRouteText = new Map<string, RegExp>([
  ["/", /Hospital Core/i],
  ["/departments", /Departments|Cardiology/i],
  ["/departments/cardiology", /Cardiology/i],
  ["/doctors", /Doctors|Medical Team/i],
  ["/news", /News|Updates/i],
  ["/booking", /Book|Appointment/i],
  ["/privacy", /Privacy/i],
  ["/terms", /Terms/i],
  ["/security", /Security/i],
  ["/session-expired", /Session/i],
  ["/forbidden", /Access denied|Forbidden/i],
]);

const staffRouteText = new Map<string, RegExp>([
  ["/staff/login", /Clinical Suite Access|Log in/i],
  ["/staff/dashboard", /Dashboard|Active Rounds|Laboratory Queue Trends/i],
  ["/staff/closures", /Special Closures|Closure Calendar/i],
  ["/staff/patients", /Patients|Patient/i],
  ["/staff/queue", /Mai Nguyen/i],
  ["/staff/schedule", /Schedule/i],
  ["/staff/booking", /Booking|Appointment/i],
  ["/staff/booking/review", /Review|Booking/i],
  ["/staff/booking/slots", /Slots|Availability/i],
  ["/staff/booking/success", /Success|Confirmed/i],
  ["/staff/booking/symptoms", /Symptoms|Triage/i],
  ["/staff/inventory", /Normal Saline 500ml/i],
  ["/staff/invoices", /Invoices|Billing/i],
  ["/staff/lab-results", /Lab Results|Diagnostics/i],
  ["/staff/lab-results/1", /Complete Blood Count|Lab Result/i],
  ["/staff/medical-records/1/edit", /Patient Record Entry/i],
  ["/staff/nurse-intake", /Daily Intake Schedule|Intake/i],
  ["/staff/doctor/1", /Dr\. Alistair Thorne|Interventional Cardiology/i],
  ["/staff/doctor/dashboard", /Doctor|Dashboard|Consultation/i],
  ["/staff/prescriptions/preview", /Prescription|Preview/i],
  ["/staff/pricing", /Pricing/i],
  ["/staff/revenue", /Revenue/i],
  ["/staff/slots", /Slots/i],
  ["/staff/support", /Support/i],
  ["/staff/vital-signs", /Vital Signs Recording/i],
]);

const portalRouteText = new Map<string, RegExp>([
  ["/portal/login", /Patient Portal|Sign in/i],
  ["/portal/overview", /Nguyen Thi Hoa/i],
  ["/portal/records", /Electronic Records|Records/i],
  ["/portal/appointments", /Appointments/i],
  ["/portal/appointments/2", /Appointment|Details/i],
  ["/portal/lab-results", /Lab Results/i],
  ["/portal/messages", /Messages/i],
  ["/portal/profile", /Profile/i],
  ["/portal/claim", /Claim|Verification/i],
  ["/portal/billing", /Billing/i],
  ["/portal/diagnostics", /Diagnostics/i],
  ["/portal/inventory", /Inventory/i],
  ["/portal/patients", /Patients|Patient/i],
  ["/portal/pharmacy", /Pharmacy/i],
  ["/portal/scheduling", /Patient Appointments|Summary Metrics/i],
  ["/portal/staff", /Staff/i],
  ["/portal/support", /Support/i],
  ["/portal/admit", /Admission And Booking|Visit Request/i],
]);

const adminRouteText = new Map<string, RegExp>([
  ["/admin/dashboard", /Admin Statistics|Dashboard/i],
  ["/admin/appointments", /Appointment Management|Appointments/i],
  ["/admin/audit-logs", /QUEUE_CALL_PATIENT/i],
  ["/admin/departments", /Departments/i],
  ["/admin/monitoring", /0 active alerts/i],
  ["/admin/news", /News/i],
  ["/admin/public-content", /Public Facing|Hero Landing/i],
  ["/admin/rooms", /Rooms/i],
  ["/admin/users", /Staff Directory/i],
  ["/admin/users/1", /Staff Directory|Sarah Jenkins|Marcus Vance/i],
]);

const apiRequestsByPath = new Map<string, RegExp[]>([
  [
    "/staff/queue",
    [/\/api\/v1\/queue\/today(?:\?|$)/, /\/api\/v1\/appointments\/today(?:\?|$)/],
  ],
  [
    "/staff/inventory",
    [
      /\/api\/v1\/inventory\/items(?:\?|$)/,
      /\/api\/v1\/inventory\/lots(?:\?|$)/,
      /\/api\/v1\/inventory\/movements(?:\?|$)/,
      /\/api\/v1\/inventory\/alerts(?:\?|$)/,
    ],
  ],
  [
    "/portal/overview",
    [
      /\/api\/v1\/patient-portal\/overview(?:\?|$)/,
      /\/api\/v1\/patient-portal\/lab-results(?:\?|$)/,
    ],
  ],
  ["/admin/audit-logs", [/\/api\/v1\/admin\/audit-logs(?:\?|$)/]],
  ["/admin/monitoring", [/\/api\/v1\/admin\/monitoring(?:\?|$)/]],
]);

function buildContracts(
  area: RouteArea,
  routes: { path: string; label: string }[],
  textByPath: Map<string, RegExp>,
  role?: SeededRole,
  roleByPath: Partial<Record<string, SeededRole | undefined>> = {},
) {
  return routes.map((route) => ({
    ...route,
    area,
    role: Object.hasOwn(roleByPath, route.path) ? roleByPath[route.path] : role,
    expectedText: textByPath.get(route.path) ?? new RegExp(route.label, "i"),
    expectedApiRequests: apiRequestsByPath.get(route.path),
  }));
}

export const exhaustiveRouteContracts: ExhaustiveRouteContract[] = [
  ...buildContracts("public", publicRoutes, publicRouteText),
  ...buildContracts("staff", staffRoutes, staffRouteText, "ADMIN", {
    "/staff/login": undefined,
    "/staff/schedule": "DOCTOR",
  }),
  ...buildContracts("portal", portalRoutes, portalRouteText, "PATIENT"),
  ...buildContracts("admin", adminRoutes, adminRouteText, "ADMIN"),
];

export async function seedRouteSession(page: Page, role?: SeededRole) {
  if (!role) {
    return;
  }

  if (role === "PATIENT") {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_patient_access_token", "exhaustive-patient-token");
      window.sessionStorage.setItem("hms_patient_role", "PATIENT");
    });
    return;
  }

  await page.addInitScript((selectedRole) => {
    window.sessionStorage.setItem("hms_staff_access_token", "exhaustive-staff-token");
    window.sessionStorage.setItem("hms_staff_role", selectedRole);
  }, role);
}

export async function installExhaustiveApiMocks(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

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
            createdAt: "2026-05-13T08:00:00Z",
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

  await page.route("**/api/v1/admin/monitoring", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          generatedAt: "2026-05-13T08:00:00Z",
          uptimeSeconds: 3600,
          healthy: true,
          activeAlerts: 0,
          scheduleAlertCount: 0,
          inventoryAlertCount: 0,
          databaseStatus: "UP",
          queueStatus: "UP",
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
            createdAt: "2026-05-13T08:00:00Z",
          },
        ],
      }),
    });
  });

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

  await page.route("**/api/v1/queue/today", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
      }),
    });
  });

  await page.route("**/api/v1/appointments/today", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            appointmentId: "11111111-1111-1111-1111-111111111111",
            confirmationCode: "Q-1001",
            status: "CONFIRMED",
            appointmentDate: "2026-05-13",
            startTime: "09:00:00",
            endTime: "09:30:00",
            checkedInAt: null,
            doctorId: "33333333-3333-3333-3333-333333333333",
            doctorName: "Dr. Lan Tran",
            patientId: "44444444-4444-4444-4444-444444444444",
            patientFullName: "Mai Nguyen",
            patientPhone: "+84900000001",
            patientCccd: "012345678901",
          },
        ],
      }),
    });
  });

  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: null }),
    });
  });
}
