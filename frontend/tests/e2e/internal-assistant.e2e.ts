import { expect, test } from "@playwright/test";
import {
  mockClinicalAssistantApi,
  mockStaffAuth,
  signInAndOpen
} from "./support/internal-assistant-fixtures";

test.describe("Internal assistant v1", () => {
  test("doctor can work a selected-patient chart and send an assistant request", async ({ page }) => {
    await mockStaffAuth(page, {
      fullName: "Dr. Sarah Chen",
      role: "DOCTOR",
      userId: "doctor-1"
    });
    await mockClinicalAssistantApi(page);

    await signInAndOpen(
      page,
      "/patient-records-management?patientId=patient-1&appointmentId=appt-1&mode=hybrid",
      "doctor1@hospital.vn",
      "Doctor@1234"
    );

    await expect(page.getByRole("heading", { name: /clinical assistant/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Docs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Patient" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hybrid" })).toBeVisible();

    await page.getByLabel("Internal assistant message").fill("Summarize the selected chart");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(/use the chart context and the follow-up sop/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /follow-up-reminders#chunk-0/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ask about follow-up workflow/i })).toBeVisible();
  });

  test("admin stays docs-only on the clinical assistant workspace", async ({ page }) => {
    await mockStaffAuth(page, {
      fullName: "System Admin",
      role: "ADMIN",
      userId: "admin-1"
    });
    await mockClinicalAssistantApi(page, {
      answer: "Docs-only guidance for the current SOP.",
      citations: [
        {
          deepLink: "internal://knowledge/patient-portal-communications#chunk-0",
          excerpt: "Portal communication workflow",
          referenceId: "patient-portal-communications#chunk-0",
          sourceType: "KNOWLEDGE_DOC",
          title: "Patient Portal Communication SOP"
        }
      ],
      deepLinks: ["internal://knowledge/patient-portal-communications#chunk-0"],
      scope: "docs",
      suggestions: ["Open the portal SOP"]
    });

    await signInAndOpen(
      page,
      "/patient-records-management?patientId=patient-1&appointmentId=appt-1&mode=docs",
      "admin@hospital.vn",
      "Admin@1234"
    );

    await expect(page.getByRole("heading", { name: /clinical assistant/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Docs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Patient" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Hybrid" })).toHaveCount(0);

    await page.getByLabel("Internal assistant message").fill("Summarize the portal SOP");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(/docs-only guidance for the current sop/i)).toBeVisible();
    await expect(page.getByText(/patient portal communication sop/i)).toBeVisible();
  });

  test("nurse can switch queue context and send an assistant request", async ({ page }) => {
    await mockStaffAuth(page, {
      fullName: "Mia Torres",
      role: "NURSE",
      userId: "nurse-1"
    });
    await mockClinicalAssistantApi(page, {
      answer: "Use the selected queue context and document the handoff before room assignment.",
      citations: [
        {
          deepLink: "internal://knowledge/medical-record-completion#chunk-0",
          excerpt: "Handoff workflow for the selected queue item",
          referenceId: "medical-record-completion#chunk-0",
          sourceType: "KNOWLEDGE_DOC",
          title: "Medical Record Completion Policy"
        }
      ],
      deepLinks: ["internal://knowledge/medical-record-completion#chunk-0"],
      scope: "patient",
      suggestions: ["Ask about queue handoff"]
    });

    await signInAndOpen(page, "/nurse-checkin", "nurse@hospital.vn", "Nurse@1234");

    await expect(page.getByRole("heading", { name: /nursing station a: patient check-in/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /nurse assistant/i })).toBeVisible();

    await page.getByRole("button", { name: /jae hoon/i }).click();
    await expect(page.getByText(/selected patient/i)).toBeVisible();
    await expect(page.getByText(/switching patients starts a separate thread/i)).toBeVisible();

    await page.getByLabel("Internal assistant message").fill("What should I capture for the queue handoff?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(/use the selected queue context/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ask about queue handoff/i })).toBeVisible();
  });
});
