import { apiRequest } from "@/lib/api-client";

export interface PatientRecordListItemResponse {
  patientId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  dateOfBirth: string | null;
  latestAppointmentDate: string | null;
  totalAppointments: number;
}

export interface MedicalRecordResponse {
  recordId: string;
  appointmentId: string;
  diagnosis: string;
  clinicalNotes: string | null;
  followUpDate: string | null;
  appointmentStatus: string;
}

export interface PatientHistoryAppointmentResponse {
  appointmentId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  doctorId: string;
  doctorName: string;
  medicalRecord: MedicalRecordResponse | null;
}

export interface PatientRecordDetailResponse {
  patientId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  cccd: string | null;
  dateOfBirth: string | null;
  occupation: string | null;
  bloodType: string | null;
  medicalHistory: string | null;
  drugAllergies: string | null;
  insuranceNumber: string | null;
  appointments: PatientHistoryAppointmentResponse[];
}

export async function searchPatientRecords(query = "") {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();
  if (normalizedQuery) {
    params.set("query", normalizedQuery);
  }

  const response = await apiRequest<PatientRecordListItemResponse[]>(
    `/patient-records${params.size ? `?${params.toString()}` : ""}`,
    {},
    { authScope: "staff" },
  );

  return response.data ?? [];
}

export async function getPatientRecordDetail(patientId: string) {
  const response = await apiRequest<PatientRecordDetailResponse>(
    `/patient-records/${encodeURIComponent(patientId)}`,
    {},
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Patient record detail did not return data");
  }

  return response.data;
}
