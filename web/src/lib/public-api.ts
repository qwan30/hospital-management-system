import { apiRequest } from "@/lib/api-client";

export interface DoctorResponse {
  id: string;
  departmentId: string | null;
  fullName: string;
  email: string;
  specialty: string | null;
  qualification: string | null;
  experienceYears: number | null;
}

export interface DoctorSlotResponse {
  id: string;
  doctorId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  phone: string | null;
}

export interface DepartmentDoctorSummary {
  id: string;
  fullName: string;
  specialty: string | null;
  qualification: string | null;
  experienceYears: number | null;
  avatarUrl: string | null;
}

export interface DepartmentDetailResponse extends DepartmentResponse {
  activeDoctorCount: number;
  doctors: DepartmentDoctorSummary[];
}

export interface AppointmentCreateRequest {
  doctorId: string;
  firstSlotId: string;
  aiDurationMinutes: number;
  patientFullName: string;
  patientCccd: string;
  patientEmail: string;
  patientPhone: string;
  patientDateOfBirth: string;
  patientGender: "MALE" | "FEMALE" | "OTHER";
  patientAddress: {
    provinceOrCity: string;
    district: string;
    streetAddress: string;
  };
  symptoms?: string;
}

export interface AppointmentResponse {
  id: string;
  patientId: string;
  doctorId: string;
  firstSlotId: string;
  confirmationCode: string;
  status: string;
  appointmentDate: string;
}

export async function listDoctors() {
  const response = await apiRequest<DoctorResponse[]>("/doctors");
  return response.data ?? [];
}

export async function listDepartments() {
  const response = await apiRequest<DepartmentResponse[]>("/departments");
  return response.data ?? [];
}

export async function getDepartment(departmentId: string) {
  const response = await apiRequest<DepartmentDetailResponse>(
    `/departments/${encodeURIComponent(departmentId)}`,
  );

  if (!response.data) {
    throw new Error("Department detail did not return data");
  }

  return response.data;
}

export async function listDoctorSlots(doctorId: string, date: string) {
  const params = new URLSearchParams({ date });
  const response = await apiRequest<DoctorSlotResponse[]>(
    `/doctors/${doctorId}/slots?${params.toString()}`,
  );

  return response.data ?? [];
}

export async function createPublicAppointment(request: AppointmentCreateRequest) {
  const response = await apiRequest<AppointmentResponse>("/appointments", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.data) {
    throw new Error("Appointment creation did not return confirmation data");
  }

  return response.data;
}
