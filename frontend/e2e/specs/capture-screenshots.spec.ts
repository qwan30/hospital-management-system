import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  installExhaustiveApiMocks,
  seedRouteSession,
} from "../helpers/exhaustive-route-contracts";
import { installUiApiMocks } from "../helpers/ui-api-mocks";
import * as path from "path";
import * as fs from "fs";

const VISUAL_BASELINE_TIME = (() => {
  const now = new Date();
  // The booking page derives dates with toISOString(), so keep SSR and browser clocks on the same UTC day.
  now.setUTCHours(9, 6, 0, 0);
  return now;
})();
const CURRENT_WORKING_DIR = process.cwd();
const REPO_ROOT =
  path.basename(CURRENT_WORKING_DIR) === "frontend"
    ? path.resolve(CURRENT_WORKING_DIR, "..")
    : CURRENT_WORKING_DIR;
const SCREENSHOT_DIR = process.env.HMS_SCREENSHOT_DIR ?? path.join(REPO_ROOT, "docs", "screenshots");

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface ScreenshotCase {
  id: string;
  name: string;
  path: string;
  role?: "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PHARMACIST" | "ACCOUNTANT" | "PATIENT";
  action?: (page: Page) => Promise<void>;
}

const screenshotCases: ScreenshotCase[] = [
  { id: "01", name: "01-homepage.png", path: "/" },
  { id: "02", name: "02-departments.png", path: "/departments" },
  { id: "03", name: "03-doctors.png", path: "/doctors" },
  { id: "04", name: "04-booking.png", path: "/booking" },
  { id: "05", name: "05-news.png", path: "/news" },
  { id: "06", name: "06-staff-login.png", path: "/staff/login" },
  {
    id: "07",
    name: "07-staff-dashboard.png",
    path: "/staff/dashboard",
    role: "NURSE",
  },
  {
    id: "08",
    name: "08-queue-management.png",
    path: "/staff/queue",
    role: "NURSE",
  },
  {
    id: "09",
    name: "09-patient-records.png",
    path: "/staff/medical-records/11111111-1111-1111-1111-111111111111/edit",
    role: "DOCTOR",
  },
  {
    id: "10",
    name: "10-admin-dashboard.png",
    path: "/admin/dashboard",
    role: "ADMIN",
  },
  {
    id: "11",
    name: "11-admin-users.png",
    path: "/admin/users",
    role: "ADMIN",
  },
  {
    id: "12",
    name: "12-admin-audit-logs.png",
    path: "/admin/audit-logs",
    role: "ADMIN",
  },
  {
    id: "13",
    name: "13-pharmacy-inventory.png",
    path: "/staff/inventory",
    role: "PHARMACIST",
  },
  {
    id: "14",
    name: "14-pharmacy-dispense.png",
    path: "/staff/inventory",
    role: "PHARMACIST",
    action: async (page: Page) => {
      // Find the Dispense button and click it to open the dialog
      const button = page.getByRole("button", { name: "Dispense" }).first();
      await button.waitFor({ state: "visible", timeout: 5000 });
      await button.click();
      // Wait for the modal dialog to be visible
      const dialog = page.locator("h2:has-text('Dispense Medication'), [role='dialog']").first();
      await dialog.waitFor({ state: "visible", timeout: 5000 });
      // Add a small delay for modal animation to complete
      await page.waitForTimeout(500);
    },
  },
  {
    id: "15",
    name: "15-billing-invoice.png",
    path: "/staff/invoices",
    role: "ACCOUNTANT",
  },
  {
    id: "16",
    name: "16-revenue-report.png",
    path: "/staff/revenue",
    role: "ACCOUNTANT",
  },
  {
    id: "17",
    name: "17-doctor-ehr.png",
    path: "/staff/doctor/dashboard",
    role: "DOCTOR",
  },
  {
    id: "18",
    name: "18-patient-portal.png",
    path: "/portal/overview",
    role: "PATIENT",
  },
];

test.describe("HMS Screenshot Generator", () => {
  for (const sc of screenshotCases) {
    test(`Capture ${sc.name} for ${sc.path}`, async ({ page }) => {
      // Set time to be stable
      await page.clock.setFixedTime(VISUAL_BASELINE_TIME);
      
      // Install stabilizers (hiding dev overlays, etc.)
      await installVisualStabilizers(page);
      
      // Seed user session if a role is specified
      if (sc.role) {
        await seedRouteSession(page, sc.role);
      }
      
      // Install basic & exhaustive mocks
      await installExhaustiveApiMocks(page);
      await installUiApiMocks(page);
      
      // Inject extra clinical/billing data mocks for screenshots to look richer
      await installExtraMocks(page);
      
      // Set fixed desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });
      
      // Go to target page
      await page.goto(sc.path);
      
      // Wait for network idle or main content to load
      await page.waitForTimeout(1000);
      
      // Hide any development diagnostic elements
      await hideDevelopmentDiagnostics(page);
      
      // Run custom action if defined
      if (sc.action) {
        await sc.action(page);
      }
      
      // Capture screenshot
      const outputPath = path.join(SCREENSHOT_DIR, sc.name);
      await page.screenshot({
        path: outputPath,
        fullPage: false, // Desktop window screenshot
        animations: "disabled",
      });
      
      console.log(`Successfully captured and saved: ${sc.name}`);
    });
  }
});

async function installExtraMocks(page: Page) {
  // Mock appointments for Doctor Dashboard
  await page.route("**/api/v1/appointments?*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            appointmentId: "11111111-1111-1111-1111-111111111111",
            confirmationCode: "Q-1001",
            status: "IN_PROGRESS",
            appointmentDate: "2026-05-13",
            startTime: "09:00:00",
            endTime: "09:30:00",
            doctorId: "33333333-3333-3333-3333-333333333333",
            doctorName: "Dr. Lan Tran",
            patientId: "patient-1",
            patientName: "Mai Nguyen",
            patientPhone: "+84900000001",
            symptoms: "Persistent headache and mild dizziness for 3 days",
            createdAt: "2026-05-12T10:00:00Z",
          },
          {
            appointmentId: "22222222-2222-2222-2222-222222222222",
            confirmationCode: "Q-1002",
            status: "CHECKED_IN",
            appointmentDate: "2026-05-13",
            startTime: "09:30:00",
            endTime: "10:00:00",
            doctorId: "33333333-3333-3333-3333-333333333333",
            doctorName: "Dr. Lan Tran",
            patientId: "patient-2",
            patientName: "Alexander Vance",
            patientPhone: "+84900000101",
            symptoms: "Routine post-op cardiovascular check",
            createdAt: "2026-05-12T11:00:00Z",
          },
          {
            appointmentId: "33333333-3333-3333-3333-333333333333",
            confirmationCode: "Q-1003",
            status: "DONE",
            appointmentDate: "2026-05-13",
            startTime: "08:30:00",
            endTime: "09:00:00",
            doctorId: "33333333-3333-3333-3333-333333333333",
            doctorName: "Dr. Lan Tran",
            patientId: "patient-3",
            patientName: "Tran Quang",
            patientPhone: "+84900000201",
            symptoms: "Chest tightness evaluation",
            createdAt: "2026-05-12T09:00:00Z",
          }
        ]
      })
    });
  });

  // Mock list of invoices
  await page.route("**/api/v1/invoices**", async (route) => {
    if (route.request().method().toUpperCase() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              invoiceId: "INV-2026-0001",
              appointmentId: "11111111-1111-1111-1111-111111111111",
              patientId: "patient-1",
              patientFullName: "Mai Nguyen",
              doctorName: "Dr. Lan Tran",
              departmentName: "Cardiology",
              appointmentDate: "2026-05-13",
              totalAmount: 125.00,
              status: "PAID",
              paymentMethod: "CASH",
              paidAt: "2026-05-13T09:45:00Z"
            },
            {
              invoiceId: "INV-2026-0002",
              appointmentId: "22222222-2222-2222-2222-222222222222",
              patientId: "patient-2",
              patientFullName: "Alexander Vance",
              doctorName: "Dr. Lan Tran",
              departmentName: "Cardiology",
              appointmentDate: "2026-05-13",
              totalAmount: 250.00,
              status: "UNPAID",
              paymentMethod: null,
              paidAt: null
            }
          ]
        })
      });
    }
  });

  // Mock daily revenue report
  await page.route("**/api/v1/reports/revenue/daily?*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          date: "2026-05-13",
          totalRevenue: 2450.00,
          departmentBreakdown: [
            { departmentName: "Cardiology", totalRevenue: 1250.00 },
            { departmentName: "Internal Medicine", totalRevenue: 800.00 },
            { departmentName: "Neurology", totalRevenue: 400.00 }
          ]
        }
      })
    });
  });

  // Mock monthly revenue report
  await page.route("**/api/v1/reports/revenue/monthly?*", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          month: "2026-05",
          totalRevenue: 54200.00,
          departmentBreakdown: [
            { departmentName: "Cardiology", totalRevenue: 24000.00 },
            { departmentName: "Internal Medicine", totalRevenue: 18200.00 },
            { departmentName: "Neurology", totalRevenue: 12000.00 }
          ]
        }
      })
    });
  });

  // Mock inventory items
  await page.route("**/api/v1/inventory/items**", async (route) => {
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
          {
            itemId: "item-2",
            sku: "DRG-PARA-500",
            itemName: "Paracetamol 500mg",
            category: "Medication",
            unit: "tablet",
            reorderLevel: 100,
            quantityOnHand: 250,
            status: "OK",
            departmentName: "Pharmacy",
            lastRestockedAt: "2026-05-01T09:00:00Z",
          },
        ],
      }),
    });
  });

  // Mock inventory lots
  await page.route("**/api/v1/inventory/lots**", async (route) => {
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
            expiresOn: "2026-07-10",
          },
          {
            lotId: "lot-2",
            itemId: "item-2",
            itemName: "Paracetamol 500mg",
            lotCode: "LOT-PARA-2402",
            supplierName: "PharmaDist VN",
            quantityReceived: 500,
            quantityRemaining: 250,
            expiresOn: "2027-01-15",
          },
        ],
      }),
    });
  });

  // Mock inventory movements
  await page.route("**/api/v1/inventory/movements**", async (route) => {
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
            note: "Ward 3 usage",
            createdAt: "2026-05-13T08:00:00Z",
          },
        ],
      }),
    });
  });

  // Mock inventory alerts
  await page.route("**/api/v1/inventory/alerts**", async (route) => {
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

  // Mock patient portal overview
  await page.route("**/api/v1/patient-portal/overview**", async (route) => {
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
}

async function installVisualStabilizers(page: Page) {
  await page.addInitScript(() => {
    const hideElement = (element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.setProperty("display", "none", "important");
        element.style.setProperty("visibility", "hidden", "important");
        element.style.setProperty("opacity", "0", "important");
        element.style.setProperty("pointer-events", "none", "important");
      }
    };

    const shouldHideElement = (element: Element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      const label = element.getAttribute("aria-label") ?? "";
      const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
      const rect = element.getBoundingClientRect();
      const isLowerLeftBadge =
        rect.left < 180 &&
        window.innerHeight - rect.bottom < 90 &&
        rect.width <= 220 &&
        rect.height <= 120;

      return (
        element.tagName.toLowerCase() === "nextjs-portal" ||
        element.hasAttribute("data-nextjs-toast") ||
        element.hasAttribute("data-nextjs-dialog") ||
        element.hasAttribute("data-nextjs-dev-tools-button") ||
        label.includes("Next.js") ||
        label.includes("Dev Tools") ||
        (isLowerLeftBadge && /\bIssue\b/i.test(text))
      );
    };

    const stabilizeTree = (root: Document | ShadowRoot) => {
      const styleId = "hms-visual-stabilizers";
      const styleHost = root instanceof Document ? document.head : root;
      const existingStyle = root instanceof Document ? document.getElementById(styleId) : root.getElementById(styleId);

      if (styleHost && !existingStyle) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          nextjs-portal,
          [data-nextjs-toast],
          [data-nextjs-dialog],
          [data-nextjs-dev-tools-button],
          [data-nextjs-dev-overlay],
          [data-nextjs-route-announcer],
          button[aria-label*="Next.js"],
          button[aria-label*="Dev Tools"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          * {
            caret-color: transparent !important;
          }
        `;
        styleHost.appendChild(style);
      }

      for (const element of Array.from(root.querySelectorAll("*"))) {
        if (shouldHideElement(element)) {
          hideElement(element);
        }

        const shadowRoot = (element as HTMLElement).shadowRoot;
        if (shadowRoot) {
          stabilizeTree(shadowRoot);
        }
      }
    };

    const run = () => stabilizeTree(document);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }

    const observer = new MutationObserver(run);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
}

async function hideDevelopmentDiagnostics(page: Page) {
  await page.evaluate(() => {
    const hideElement = (element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.setProperty("display", "none", "important");
        element.style.setProperty("visibility", "hidden", "important");
        element.style.setProperty("opacity", "0", "important");
        element.style.setProperty("pointer-events", "none", "important");
      }
    };

    const visit = (root: Document | ShadowRoot) => {
      for (const element of Array.from(root.querySelectorAll("*"))) {
        const label = element.getAttribute("aria-label") ?? "";
        const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
        const rect = element.getBoundingClientRect();
        const isLowerLeftBadge =
          rect.left < 180 &&
          window.innerHeight - rect.bottom < 90 &&
          rect.width <= 220 &&
          rect.height <= 120;
        const isDevelopmentElement =
          element.tagName.toLowerCase() === "nextjs-portal" ||
          element.hasAttribute("data-nextjs-toast") ||
          element.hasAttribute("data-nextjs-dialog") ||
          element.hasAttribute("data-nextjs-dev-tools-button") ||
          label.includes("Next.js") ||
          label.includes("Dev Tools") ||
          (isLowerLeftBadge && /\bIssue\b/i.test(text));

        if (isDevelopmentElement) {
          hideElement(element);
        }

        const shadowRoot = (element as HTMLElement).shadowRoot;
        if (shadowRoot) {
          visit(shadowRoot);
        }
      }
    };

    visit(document);
  });
}
