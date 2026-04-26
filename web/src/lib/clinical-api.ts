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

export interface AppointmentCheckInRequest {
  checkedInAt: string;
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
