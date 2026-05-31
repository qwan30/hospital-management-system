import { ApiClientError, apiRequest } from "@/lib/api-client";

export type ClinicalAppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

export interface ClinicalAppointmentResponse {
  appointmentId: string;
  confirmationCode: string;
  status: ClinicalAppointmentStatus;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkedInAt: string | null;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientFullName: string;
  patientPhone: string;
  patientCccd: string;
}

export interface AppointmentListResponse {
  appointmentId: string;
  confirmationCode: string;
  status: ClinicalAppointmentStatus;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  symptoms: string | null;
  createdAt: string;
}

export interface AppointmentCheckInRequest {
  checkedInAt: string;
}

export interface ListAppointmentsParams {
  status?: ClinicalAppointmentStatus;
  doctorId?: string;
  date?: string;
  page?: number;
  size?: number;
}

export interface QueueRoomAssignmentRequest {
  roomName: string;
}

export interface AppointmentVitalSignsRequest {
  bloodPressure?: string;
  temperature?: number;
  weight?: number;
  height?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface AppointmentVitalSignsResponse {
  id: string;
  appointmentId: string;
  bloodPressure: string | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  recordedAt: string;
}

export async function getTodayQueue() {
  const response = await apiRequest<ClinicalAppointmentResponse[]>(
    "/queue/today",
    {},
    { authScope: "staff" },
  );

  return response.data ?? [];
}

export async function getTodayAppointments() {
  const response = await apiRequest<ClinicalAppointmentResponse[]>(
    "/appointments/today",
    {},
    { authScope: "staff" },
  );

  return response.data ?? [];
}

export async function listAppointments(params: ListAppointmentsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.doctorId) {
    searchParams.set("doctorId", params.doctorId);
  }
  if (params.date) {
    searchParams.set("date", params.date);
  }
  searchParams.set("page", String(params.page ?? 0));
  searchParams.set("size", String(params.size ?? 100));

  const query = searchParams.toString();
  const response = await apiRequest<AppointmentListResponse[]>(
    `/appointments${query ? `?${query}` : ""}`,
    {},
    { authScope: "staff" },
  );

  return response.data ?? [];
}

export async function checkInAppointment(
  appointmentId: string,
  request: AppointmentCheckInRequest,
) {
  const response = await apiRequest<ClinicalAppointmentResponse>(
    `/appointments/${appointmentId}/checkin`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Check-in did not return an appointment");
  }

  return response.data;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: ClinicalAppointmentStatus,
) {
  const response = await apiRequest<ClinicalAppointmentResponse>(
    `/appointments/${appointmentId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
    { authScope: "staff" },
  );

  return requireAppointmentResponse(response.data, "Appointment status update");
}

export async function callQueuePatient(appointmentId: string) {
  return queueAction(appointmentId, "call");
}

export async function skipQueuePatient(appointmentId: string) {
  return queueAction(appointmentId, "skip");
}

export async function assignQueueRoom(
  appointmentId: string,
  request: QueueRoomAssignmentRequest,
) {
  const response = await apiRequest<ClinicalAppointmentResponse>(
    `/queue/${appointmentId}/assign-room`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );

  return requireAppointmentResponse(response.data, "Room assignment");
}

export async function startQueueConsultation(appointmentId: string) {
  return queueAction(appointmentId, "start-consultation");
}

export async function completeQueueVisit(appointmentId: string) {
  return queueAction(appointmentId, "complete");
}

export async function recordAppointmentVitalSigns(
  appointmentId: string,
  request: AppointmentVitalSignsRequest,
) {
  const response = await apiRequest<AppointmentVitalSignsResponse>(
    `/appointments/${appointmentId}/vital-signs`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Vital signs save did not return a record");
  }

  return response.data;
}

export async function getAppointmentVitalSigns(appointmentId: string) {
  const response = await apiRequest<AppointmentVitalSignsResponse>(
    `/appointments/${appointmentId}/vital-signs`,
    {},
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Vital signs lookup did not return a record");
  }

  return response.data;
}

export async function updateAppointmentVitalSigns(
  vitalSignId: string,
  request: AppointmentVitalSignsRequest,
) {
  const response = await apiRequest<AppointmentVitalSignsResponse>(
    `/vital-signs/${vitalSignId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Vital signs update did not return a record");
  }

  return response.data;
}

export async function saveAppointmentVitalSigns(
  appointmentId: string,
  request: AppointmentVitalSignsRequest,
) {
  try {
    const existing = await getAppointmentVitalSigns(appointmentId);
    return updateAppointmentVitalSigns(existing.id, request);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return recordAppointmentVitalSigns(appointmentId, request);
    }
    throw error;
  }
}

async function queueAction(appointmentId: string, action: string) {
  const response = await apiRequest<ClinicalAppointmentResponse>(
    `/queue/${appointmentId}/${action}`,
    { method: "POST" },
    { authScope: "staff" },
  );

  return requireAppointmentResponse(response.data, "Queue action");
}

function requireAppointmentResponse(
  appointment: ClinicalAppointmentResponse | undefined,
  actionName: string,
) {
  if (!appointment) {
    throw new Error(`${actionName} did not return an appointment`);
  }

  return appointment;
}

/* ------------------------------------------------------------------ */
/*  Lab Results                                                        */
/* ------------------------------------------------------------------ */

export interface LabResultResponse {
  id?: string;
  labResultId: string;
  appointmentId: string;
  testName: string;
  resultValue?: string | null;
  referenceRange?: string | null;
  status: string;
  notes?: string | null;
  deleted?: boolean;
  createdAt?: string;
  resultSummary: string | null;
  doctorComment: string | null;
  attachmentUrl: string | null;
  collectedAt: string;
}

type LabResultApiResponse = Partial<Omit<LabResultResponse, "labResultId">> & {
  labResultId?: string;
  id?: string;
  appointmentId: string;
  testName: string;
};

export interface LabResultCreateRequest {
  appointmentId: string;
  testName: string;
  resultValue: string;
  referenceRange?: string | null;
  status?: string | null;
  notes?: string | null;
}

export async function listLabResultsByAppointment(appointmentId: string) {
  const response = await apiRequest<LabResultApiResponse[]>(
    `/appointments/${appointmentId}/lab-results`,
    {},
    { authScope: "staff" },
  );

  return (response.data ?? []).map(normalizeLabResult);
}

export async function getLabResult(resultId: string) {
  const response = await apiRequest<LabResultApiResponse>(
    `/lab-results/${resultId}`,
    {},
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Lab result not found");
  }

  return normalizeLabResult(response.data);
}

export async function createLabResult(request: LabResultCreateRequest) {
  const response = await apiRequest<LabResultApiResponse>(
    "/lab-results",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Lab result creation did not return a result");
  }

  return normalizeLabResult(response.data);
}

function normalizeLabResult(result: LabResultApiResponse): LabResultResponse {
  const resultValue = result.resultValue ?? result.resultSummary ?? null;
  const notes = result.notes ?? result.doctorComment ?? null;
  const createdAt = result.createdAt ?? result.collectedAt ?? "";

  return {
    ...result,
    labResultId: result.labResultId ?? result.id ?? "",
    status: result.status ?? "PENDING",
    resultValue,
    referenceRange: result.referenceRange ?? null,
    notes,
    resultSummary: result.resultSummary ?? resultValue,
    doctorComment: result.doctorComment ?? notes,
    attachmentUrl: result.attachmentUrl ?? null,
    collectedAt: result.collectedAt ?? createdAt,
    createdAt,
  };
}

export async function deleteLabResult(resultId: string) {
  await apiRequest<void>(
    `/lab-results/${resultId}`,
    { method: "DELETE" },
    { authScope: "staff" },
  );
}

/* ------------------------------------------------------------------ */
/*  Doctor Schedule                                                    */
/* ------------------------------------------------------------------ */

export interface ScheduleParams {
  date?: string;
  week?: string;
}

export async function getMySchedule(params: ScheduleParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.date) {
    searchParams.set("date", params.date);
  }
  if (params.week) {
    searchParams.set("week", params.week);
  }

  const query = searchParams.toString();
  const response = await apiRequest<ClinicalAppointmentResponse[]>(
    `/me/schedule${query ? `?${query}` : ""}`,
    {},
    { authScope: "staff" },
  );

  return response.data ?? [];
}
