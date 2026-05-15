import { apiRequest } from "@/lib/api-client";

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
