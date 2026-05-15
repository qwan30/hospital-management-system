import { apiRequest } from "@/lib/api-client";
import type { ClinicalAppointmentStatus } from "@/lib/clinical-api";

export type PatientGender = "MALE" | "FEMALE" | "OTHER";

export interface AppointmentDetailResponse {
  appointmentId: string;
  confirmationCode: string;
  status: ClinicalAppointmentStatus;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  checkedInAt: string | null;
  aiDurationMinutes: number;
  symptoms: string | null;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientFullName: string;
  patientPhone: string;
  patientCccd: string;
  patientEmail: string;
  patientDateOfBirth: string;
  patientGender: PatientGender;
}

export interface VitalSignsPayload {
  bloodPressure?: string;
  temperature?: number;
  weight?: number;
  height?: number;
}

export interface PrescriptionItemPayload {
  medicineName: string;
  dosage: string;
  frequency?: string;
  durationDays?: number;
  instructions?: string;
  sortOrder?: number;
}

export interface MedicalRecordCreateRequest {
  appointmentId: string;
  diagnosis: string;
  clinicalNotes?: string;
  vitalSigns?: VitalSignsPayload;
  followUpDate?: string;
  prescriptionItems?: PrescriptionItemPayload[];
}

export interface MedicalRecordResponse {
  recordId: string;
  appointmentId: string;
  diagnosis: string;
  clinicalNotes: string | null;
  vitalSigns: VitalSignsPayload | null;
  followUpDate: string | null;
  prescriptionItems: PrescriptionItemPayload[];
  appointmentStatus: ClinicalAppointmentStatus;
}

export async function getAppointmentDetail(appointmentId: string) {
  const response = await apiRequest<AppointmentDetailResponse>(
    `/appointments/${appointmentId}`,
    {},
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Appointment detail was not returned");
  }

  return response.data;
}

export async function createMedicalRecord(request: MedicalRecordCreateRequest) {
  const response = await apiRequest<MedicalRecordResponse>(
    "/medical-records",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );

  if (!response.data) {
    throw new Error("Medical record was not returned");
  }

  return response.data;
}
