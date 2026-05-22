import { expect, test, type APIRequestContext } from "@playwright/test";
import { apiURL, isBackendHealthy } from "../helpers/backend";
import { releasePatientPersona, staffPersonas } from "../helpers/personas";

const expectsReleaseSeed = process.env.HMS_EXPECT_RELEASE_DEMO_SEED === "true";

test.describe("@integrated @release synthetic UAT seed data", () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!expectsReleaseSeed, "Set HMS_EXPECT_RELEASE_DEMO_SEED=true for release-demo seed verification");
    test.skip(!(await isBackendHealthy(request)), `Backend is not healthy at ${apiURL}`);
    await expect
      .poll(() => isReleaseSeedReady(request), {
        message: "release-demo seed markers should be queryable",
        timeout: 60_000,
      })
      .toBe(true);
  });

  test("public and staff operations expose release-demo records", async ({ request }) => {
    const adminToken = await staffToken(request, staffPersonas.admin.email, staffPersonas.admin.password);
    const pharmacistToken = await staffToken(request, staffPersonas.pharmacist.email, staffPersonas.pharmacist.password);
    const accountantToken = await staffToken(request, staffPersonas.accountant.email, staffPersonas.accountant.password);

    const departments = await apiGet(request, "/departments");
    expect(JSON.stringify(departments)).toContain("Emergency Medicine");

    const doctors = await apiGet(request, "/doctors");
    expect(JSON.stringify(doctors)).toContain("Dr. Le Minh Khoa");

    const rooms = await apiGet(request, "/admin/rooms", adminToken);
    expect(JSON.stringify(rooms)).toContain("ER-OBS-01");

    const schedules = await apiGet(request, "/admin/schedule-templates", adminToken);
    expect(JSON.stringify(schedules)).toContain("doctor");

    const inventory = await apiGet(request, "/inventory/items", pharmacistToken);
    expect(JSON.stringify(inventory)).toContain("UAT-MED-AML-005");

    const invoices = await apiGet(request, "/invoices", accountantToken);
    const invoicePayload = JSON.stringify(invoices);
    expect(invoicePayload).toContain("Nguyen Thi Hoa");
    expect(invoicePayload).toContain("Pham Nhu Portal");
    expect(invoicePayload).toContain("PAID");
    expect(invoicePayload).toContain("UNPAID");

    const auditLogs = await apiGet(request, "/admin/audit-logs?entityType=RELEASE_DEMO&limit=100", adminToken);
    expect(JSON.stringify(auditLogs)).toContain("RELEASE_DEMO");
  });

  test("queue and patient portal have seeded cross-role data", async ({ request }) => {
    const receptionistToken = await staffToken(request, staffPersonas.receptionist.email, staffPersonas.receptionist.password);
    const patientToken = await patientTokenFor(request, releasePatientPersona.email, releasePatientPersona.password);

    const queue = await apiGet(request, "/queue/today", receptionistToken);
    expect(JSON.stringify(queue)).toContain("HMS-UAT-QUEUE");

    const portalOverview = await apiGet(request, "/patient-portal/overview", patientToken);
    expect(JSON.stringify(portalOverview)).toContain(releasePatientPersona.fullName);

    const portalMessages = await apiGet(request, "/patient-portal/messages", patientToken);
    expect(JSON.stringify(portalMessages)).toContain("Release UAT care-team follow-up");
  });
});

async function staffToken(request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${apiURL}/auth/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBe(true);
  const payload = await response.json();
  return payload.data.tokens.accessToken as string;
}

async function patientTokenFor(request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${apiURL}/patient-auth/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBe(true);
  const payload = await response.json();
  return payload.data.tokens.accessToken as string;
}

async function isReleaseSeedReady(request: APIRequestContext) {
  const doctors = await request.get(`${apiURL}/doctors`);
  if (!doctors.ok()) {
    return false;
  }
  const doctorsBody = await doctors.text();
  if (!doctorsBody.includes("doctor3@hospital.vn")) {
    return false;
  }

  const patientLogin = await request.post(`${apiURL}/patient-auth/login`, {
    data: { email: releasePatientPersona.email, password: releasePatientPersona.password },
  });
  return patientLogin.ok();
}

async function apiGet(request: APIRequestContext, path: string, token?: string) {
  const response = await request.get(`${apiURL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  expect(response.ok()).toBe(true);
  return response.json();
}
