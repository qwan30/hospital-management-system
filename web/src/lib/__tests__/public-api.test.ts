import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api-client";
import {
  createPublicAppointment,
  getDepartment,
  listDepartments,
  listDoctors,
  listDoctorSlots,
} from "@/lib/public-api";

vi.mock("@/lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("public-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists doctors through the public doctors endpoint", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "doctor-1",
          departmentId: "department-1",
          fullName: "Dr. Lan Tran",
          email: "lan.tran@example.com",
          specialty: "Cardiology",
          qualification: "MD",
          experienceYears: 12,
        },
      ],
    });

    await expect(listDoctors()).resolves.toEqual([
      expect.objectContaining({ id: "doctor-1", fullName: "Dr. Lan Tran" }),
    ]);
    expect(apiRequest).toHaveBeenCalledWith("/doctors");
  });

  it("falls back to an empty doctor list when the envelope has no data", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ success: true });

    await expect(listDoctors()).resolves.toEqual([]);
  });

  it("lists public departments through the backend department endpoint", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "department-1",
          name: "Cardiology",
          description: "Heart care",
          imageUrl: null,
          phone: "+84900000001",
        },
      ],
    });

    await expect(listDepartments()).resolves.toEqual([
      expect.objectContaining({ id: "department-1", name: "Cardiology" }),
    ]);
    expect(apiRequest).toHaveBeenCalledWith("/departments");
  });

  it("falls back to an empty department list when the envelope has no data", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ success: true });

    await expect(listDepartments()).resolves.toEqual([]);
  });

  it("loads department detail by id without guessing slug fields", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      data: {
        id: "department-1",
        name: "Cardiology",
        description: "Heart care",
        imageUrl: null,
        phone: "+84900000001",
        activeDoctorCount: 1,
        doctors: [
          {
            id: "doctor-1",
            fullName: "Dr. Lan Tran",
            specialty: "Cardiology",
            qualification: "MD",
            experienceYears: 12,
            avatarUrl: null,
          },
        ],
      },
    });

    await expect(getDepartment("department-1")).resolves.toMatchObject({
      name: "Cardiology",
      activeDoctorCount: 1,
    });
    expect(apiRequest).toHaveBeenCalledWith("/departments/department-1");
  });

  it("throws when department detail returns no data", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ success: true });

    await expect(getDepartment("department-1")).rejects.toThrow(
      "Department detail did not return data",
    );
  });

  it("looks up doctor slots using the backend date query contract", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "slot-1",
          doctorId: "doctor-1",
          slotDate: "2026-05-14",
          startTime: "09:00:00",
          endTime: "09:30:00",
          status: "AVAILABLE",
        },
      ],
    });

    await expect(listDoctorSlots("doctor-1", "2026-05-14")).resolves.toEqual([
      expect.objectContaining({ id: "slot-1", status: "AVAILABLE" }),
    ]);
    expect(apiRequest).toHaveBeenCalledWith("/doctors/doctor-1/slots?date=2026-05-14");
  });

  it("falls back to an empty slot list when the envelope has no data", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ success: true });

    await expect(listDoctorSlots("doctor-1", "2026-05-14")).resolves.toEqual([]);
  });

  it("creates public appointments through the real appointment endpoint", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      data: {
        id: "appointment-1",
        patientId: "patient-1",
        doctorId: "doctor-1",
        firstSlotId: "slot-1",
        confirmationCode: "HMS-12345678",
        status: "CONFIRMED",
        appointmentDate: "2026-05-14",
      },
    });

    const request = {
      doctorId: "doctor-1",
      firstSlotId: "slot-1",
      aiDurationMinutes: 30,
      patientFullName: "Nguyen Van A",
      patientCccd: "012345678901",
      patientEmail: "patient@example.com",
      patientPhone: "+84900000001",
      patientDateOfBirth: "1990-05-15",
      patientGender: "MALE" as const,
      patientAddress: {
        provinceOrCity: "Ho Chi Minh City",
        district: "District 1",
        streetAddress: "1 Nguyen Hue",
      },
      symptoms: "Fever",
    };

    await expect(createPublicAppointment(request)).resolves.toMatchObject({
      confirmationCode: "HMS-12345678",
    });
    expect(apiRequest).toHaveBeenCalledWith("/appointments", {
      method: "POST",
      body: JSON.stringify(request),
    });
  });

  it("throws when appointment creation returns no confirmation data", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ success: true });

    await expect(
      createPublicAppointment({
        doctorId: "doctor-1",
        firstSlotId: "slot-1",
        aiDurationMinutes: 30,
        patientFullName: "Nguyen Van A",
        patientCccd: "012345678901",
        patientEmail: "patient@example.com",
        patientPhone: "+84900000001",
        patientDateOfBirth: "1990-05-15",
        patientGender: "MALE",
        patientAddress: {
          provinceOrCity: "Ho Chi Minh City",
          district: "District 1",
          streetAddress: "1 Nguyen Hue",
        },
        symptoms: "Fever",
      }),
    ).rejects.toThrow("Appointment creation did not return confirmation data");
  });
});
