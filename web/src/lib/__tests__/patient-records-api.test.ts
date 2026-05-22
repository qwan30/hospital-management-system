import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api-client";
import { getPatientRecordDetail, searchPatientRecords } from "@/lib/patient-records-api";

vi.mock("@/lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("patient-records-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches patient records with staff auth scope and query parameter", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      data: [
        {
          patientId: "patient-1",
          fullName: "Nguyen Van A",
          phone: "+84900000001",
          email: "patient@example.com",
          dateOfBirth: "1990-05-15",
          latestAppointmentDate: "2026-05-14",
          totalAppointments: 2,
        },
      ],
    });

    await expect(searchPatientRecords(" Nguyen ")).resolves.toEqual([
      expect.objectContaining({ patientId: "patient-1", fullName: "Nguyen Van A" }),
    ]);
    expect(apiRequest).toHaveBeenCalledWith(
      "/patient-records?query=Nguyen",
      {},
      { authScope: "staff" },
    );
  });

  it("loads patient detail with staff auth scope", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      data: {
        patientId: "patient-1",
        fullName: "Nguyen Van A",
        phone: "+84900000001",
        email: "patient@example.com",
        cccd: "012345678901",
        dateOfBirth: "1990-05-15",
        occupation: null,
        bloodType: "O+",
        medicalHistory: "Hypertension",
        drugAllergies: "Penicillin",
        insuranceNumber: "INS-1",
        appointments: [],
      },
    });

    await expect(getPatientRecordDetail("patient-1")).resolves.toMatchObject({
      fullName: "Nguyen Van A",
      bloodType: "O+",
    });
    expect(apiRequest).toHaveBeenCalledWith(
      "/patient-records/patient-1",
      {},
      { authScope: "staff" },
    );
  });
});
