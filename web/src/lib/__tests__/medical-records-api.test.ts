import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api-client";
import {
  createMedicalRecord,
  getAppointmentDetail,
  type AppointmentDetailResponse,
  type MedicalRecordResponse,
} from "../medical-records-api";

vi.mock("@/lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("medical-records-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads appointment context with staff auth", async () => {
    const appointment: AppointmentDetailResponse = {
      appointmentId: "appointment-1",
      confirmationCode: "HMS-1001",
      status: "IN_PROGRESS",
      appointmentDate: "2026-05-15",
      startTime: "09:00:00",
      endTime: "09:30:00",
      checkedInAt: "2026-05-15T08:55:00",
      aiDurationMinutes: 30,
      symptoms: "Fever",
      doctorId: "doctor-1",
      doctorName: "Dr. Lan Tran",
      patientId: "patient-1",
      patientFullName: "Nguyen Van A",
      patientPhone: "+84900000001",
      patientCccd: "012345678901",
      patientEmail: "patient@example.com",
      patientDateOfBirth: "1990-05-15",
      patientGender: "MALE",
    };
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: appointment });

    await expect(getAppointmentDetail("appointment-1")).resolves.toEqual(appointment);
    expect(apiRequest).toHaveBeenCalledWith(
      "/appointments/appointment-1",
      {},
      { authScope: "staff" },
    );
  });

  it("creates medical record through the real endpoint", async () => {
    const record: MedicalRecordResponse = {
      recordId: "record-1",
      appointmentId: "appointment-1",
      diagnosis: "Seasonal allergy",
      clinicalNotes: "Improving",
      vitalSigns: { bloodPressure: "120/80", temperature: 37.2 },
      followUpDate: "2026-05-30",
      prescriptionItems: [],
      appointmentStatus: "DONE",
    };
    const request = {
      appointmentId: "appointment-1",
      diagnosis: "Seasonal allergy",
      clinicalNotes: "Improving",
    };
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: record });

    await expect(createMedicalRecord(request)).resolves.toEqual(record);
    expect(apiRequest).toHaveBeenCalledWith(
      "/medical-records",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      { authScope: "staff" },
    );
  });
});
