import { expect, type APIRequestContext } from "@playwright/test";
import { apiURL } from "./backend";
import { adminRoutes, portalRoutes, publicRoutes, staffRoutes, type RouteCase } from "./routes";
import { staffPersonas } from "./personas";

interface ApiEnvelope<T> {
  data?: T;
}

interface DepartmentSummary {
  id: string;
  name: string;
}

interface AppointmentSummary {
  appointmentId: string;
  status?: string;
}

interface AppointmentDetailSummary extends AppointmentSummary {
  patientFullName?: string;
}

interface LabResultSummary {
  id?: string;
  labResultId?: string;
}

interface AdminUserSummary {
  userId: string;
  role?: string;
  active?: boolean;
}

const recordableAppointmentStatuses = new Set(["CHECKED_IN", "IN_PROGRESS", "DONE"]);

export async function resolveLiveSmokeRoutes(request: APIRequestContext): Promise<RouteCase[]> {
  const adminToken = await staffAccessToken(
    request,
    staffPersonas.admin.email,
    staffPersonas.admin.password,
  );

  const replacementsByLabel = new Map<string, string>([
    ["public department detail", await resolveCardiologyDepartmentPath(request)],
    ["staff lab result detail", await resolveLabResultPath(request, adminToken)],
    ["staff medical record edit", await resolveMedicalRecordPath(request, adminToken)],
    ["admin user detail", await resolveAdminUserPath(request, adminToken)],
  ]);

  return [...publicRoutes, ...staffRoutes, ...portalRoutes, ...adminRoutes].map((route) => ({
    ...route,
    path: replacementsByLabel.get(route.label) ?? route.path,
  }));
}

export async function staffAccessToken(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const response = await request.post(`${apiURL}/auth/login`, {
    data: { email, password },
  });
  expect(response.ok(), `staff login for ${email}`).toBe(true);
  const payload = await response.json() as ApiEnvelope<{ tokens: { accessToken: string } }>;
  expect(payload.data?.tokens.accessToken, `staff token for ${email}`).toBeTruthy();
  return payload.data!.tokens.accessToken;
}

export async function patientAccessToken(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const response = await request.post(`${apiURL}/patient-auth/login`, {
    data: { email, password },
  });
  expect(response.ok(), `patient login for ${email}`).toBe(true);
  const payload = await response.json() as ApiEnvelope<{ tokens: { accessToken: string } }>;
  expect(payload.data?.tokens.accessToken, `patient token for ${email}`).toBeTruthy();
  return payload.data!.tokens.accessToken;
}

async function apiGet<T>(
  request: APIRequestContext,
  path: string,
  token?: string,
) {
  const response = await request.get(`${apiURL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  expect(response.ok(), `GET ${path}`).toBe(true);
  const payload = await response.json() as ApiEnvelope<T>;
  return payload.data ?? ([] as T);
}

async function apiGetOptional<T>(
  request: APIRequestContext,
  path: string,
  token?: string,
) {
  const response = await request.get(`${apiURL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok()) {
    return null;
  }

  const payload = await response.json() as ApiEnvelope<T>;
  return payload.data ?? null;
}

async function resolveCardiologyDepartmentPath(request: APIRequestContext) {
  const departments = await apiGet<DepartmentSummary[]>(request, "/departments");
  const cardiology = departments.find((department) => normalize(department.name) === "cardiology");
  expect(cardiology, "release-demo Cardiology department").toBeTruthy();
  return `/departments/${cardiology!.id}`;
}

async function resolveLabResultPath(request: APIRequestContext, token: string) {
  const appointments = await apiGet<AppointmentSummary[]>(request, "/appointments?size=50", token);

  for (const appointment of appointments) {
    const labResults = await apiGet<LabResultSummary[]>(
      request,
      `/appointments/${appointment.appointmentId}/lab-results`,
      token,
    );
    const labResultId = labResults
      .map((result) => result.id ?? result.labResultId)
      .find(Boolean);
    if (labResultId) {
      return `/staff/lab-results/${labResultId}`;
    }
  }

  throw new Error("Release-demo seed did not expose a staff lab result.");
}

async function resolveMedicalRecordPath(request: APIRequestContext, token: string) {
  const appointments = await apiGet<AppointmentSummary[]>(request, "/appointments/today", token);
  const candidates = appointments.filter((item) =>
    item.appointmentId && recordableAppointmentStatuses.has(item.status ?? ""),
  );

  for (const candidate of candidates) {
    const detail = await apiGetOptional<AppointmentDetailSummary>(
      request,
      `/appointments/${candidate.appointmentId}`,
      token,
    );

    if (detail?.appointmentId && recordableAppointmentStatuses.has(detail.status ?? candidate.status ?? "")) {
      return `/staff/medical-records/${detail.appointmentId}/edit`;
    }
  }

  throw new Error("Release-demo seed did not expose a recordable appointment detail.");
}

async function resolveAdminUserPath(request: APIRequestContext, token: string) {
  const users = await apiGet<AdminUserSummary[]>(request, "/admin/users", token);
  const user = users.find((item) => item.userId && item.role !== "PATIENT" && item.active !== false);
  expect(user, "active release-demo staff/admin user").toBeTruthy();
  return `/admin/users/${user!.userId}`;
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
