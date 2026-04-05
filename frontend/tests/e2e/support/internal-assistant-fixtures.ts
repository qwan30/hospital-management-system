import { expect, type Page, type Route } from "@playwright/test";

type StaffRole = "DOCTOR" | "NURSE" | "ACCOUNTANT" | "ADMIN";

type AssistantRoleConfig = {
  readonly fullName: string;
  readonly role: StaffRole;
  readonly userId: string;
};

type AssistantResponseConfig = {
  readonly answer: string;
  readonly citations: readonly {
    readonly deepLink?: string | null;
    readonly excerpt: string;
    readonly referenceId: string;
    readonly sourceType: string;
    readonly title: string;
  }[];
  readonly deepLinks: readonly string[];
  readonly scope: "docs" | "patient" | "hybrid" | "refused";
  readonly suggestions: readonly string[];
};

export function createJwtToken(claims: {
  readonly exp: number;
  readonly name: string;
  readonly role: StaffRole;
  readonly sub: string;
}) {
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlJson(claims);
  return `${header}.${payload}.playwright`;
}

export async function mockStaffAuth(page: Page, config: AssistantRoleConfig) {
  const token = createJwtToken({
    exp: Math.floor(Date.now() / 1000) + 3_600,
    name: config.fullName,
    role: config.role,
    sub: config.userId
  });

  await page.route("**/api/v1/auth/refresh", async (route) => {
    await fulfillApi(route, 401, {
      data: null,
      error: { code: "unauthorized", message: "Authentication required" },
      success: false
    });
  });

  await page.route("**/api/v1/auth/login", async (route) => {
    await fulfillApi(route, 200, {
      data: {
        fullName: config.fullName,
        role: config.role,
        tokens: {
          accessToken: token,
          expiresInSeconds: 3_600,
          refreshToken: null
        },
        userId: config.userId
      },
      success: true
    });
  });

  await page.route("**/api/v1/auth/logout", async (route) => {
    await fulfillApi(route, 200, {
      data: "ok",
      success: true
    });
  });
}

export async function mockClinicalAssistantApi(
  page: Page,
  assistantResponse: AssistantResponseConfig = defaultAssistantResponse()
) {
  await page.route("**/api/v1/patient-records**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/patient-records") && url.searchParams.has("query")) {
      await fulfillApi(route, 200, {
        data: [
          {
            dateOfBirth: "1990-01-01",
            email: "patient@example.com",
            fullName: "Nguyen Van A",
            latestAppointmentDate: "2030-01-10",
            patientId: "patient-1",
            phone: "0901234567",
            totalAppointments: 1
          }
        ],
        success: true
      });
      return;
    }

    if (url.pathname.endsWith("/patient-records")) {
      await fulfillApi(route, 200, {
        data: [
          {
            dateOfBirth: "1990-01-01",
            email: "patient@example.com",
            fullName: "Nguyen Van A",
            latestAppointmentDate: "2030-01-10",
            patientId: "patient-1",
            phone: "0901234567",
            totalAppointments: 1
          }
        ],
        success: true
      });
      return;
    }

    if (url.pathname.endsWith("/patient-records/patient-1")) {
      await fulfillApi(route, 200, {
        data: {
          appointments: [
            {
              appointmentDate: "2030-01-10",
              appointmentId: "appt-1",
              doctorId: "doctor-1",
              doctorName: "Dr. Sarah Chen",
              endTime: "09:30:00",
              medicalRecord: {
                diagnosis: "Migraine with aura"
              },
              startTime: "09:00:00",
              status: "DONE"
            }
          ],
          bloodType: "O+",
          cccd: "012345678901",
          dateOfBirth: "1990-01-01",
          drugAllergies: "Penicillin",
          email: "patient@example.com",
          fullName: "Nguyen Van A",
          insuranceNumber: "BH-001",
          medicalHistory: "Asthma",
          occupation: "Engineer",
          patientId: "patient-1",
          phone: "0901234567"
        },
        success: true
      });
      return;
    }

    await route.continue();
  });

  await page.route("**/api/v1/internal-assistant/messages", async (route) => {
    const request = route.request();
    const body = JSON.parse(request.postData() ?? "{}") as { readonly mode?: string };
    await fulfillApi(route, 200, {
      data: {
        answer: assistantResponse.answer,
        citations: assistantResponse.citations,
        deepLinks: assistantResponse.deepLinks,
        suggestions: assistantResponse.suggestions,
        scope: (body.mode ?? assistantResponse.scope) as AssistantResponseConfig["scope"]
      },
      success: true
    });
  });
}

export async function signInAndOpen(page: Page, redirectTarget: string, email: string, password: string) {
  await page.goto(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
  await expect(page.getByText(new RegExp(`continue to ${escapeRegExp(redirectTarget)}`, "i"))).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /continue to workspace/i }).click();
  await expect(page).toHaveURL(new RegExp(escapeRegExp(redirectTarget)));
}

function defaultAssistantResponse(): AssistantResponseConfig {
  return {
    answer: "Use the chart context and the follow-up SOP.",
    citations: [
      {
        deepLink: "/medical-record-editor?appointmentId=appt-1",
        excerpt: "Patient chart and recent visit detail",
        referenceId: "patient-context:appt-1",
        sourceType: "PATIENT_CONTEXT",
        title: "Selected chart note"
      },
      {
        deepLink: "internal://knowledge/follow-up-reminders#chunk-0",
        excerpt: "Follow-up reminders are triggered after the consultation closes.",
        referenceId: "follow-up-reminders#chunk-0",
        sourceType: "KNOWLEDGE_DOC",
        title: "Follow-up Reminder Workflow"
      }
    ],
    deepLinks: ["/medical-record-editor?appointmentId=appt-1"],
    scope: "hybrid",
    suggestions: ["Ask about follow-up workflow", "Open the medical record editor"]
  };
}

async function fulfillApi(route: Route, status: number, body: unknown) {
  await route.fulfill({
    body: JSON.stringify(body),
    contentType: "application/json",
    status
  });
}

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
