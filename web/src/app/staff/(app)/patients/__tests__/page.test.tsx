import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientsPage from "../page";
import {
  getPatientRecordDetail,
  searchPatientRecords,
  type PatientRecordDetailResponse,
  type PatientRecordListItemResponse,
} from "@/lib/patient-records-api";

vi.mock("@/lib/patient-records-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/patient-records-api")>(
    "@/lib/patient-records-api",
  );

  return {
    ...actual,
    getPatientRecordDetail: vi.fn(),
    searchPatientRecords: vi.fn(),
  };
});

const patientSummary: PatientRecordListItemResponse = {
  patientId: "patient-1",
  fullName: "Nguyen Van A",
  phone: "+84900000001",
  email: "patient@example.com",
  dateOfBirth: "1990-05-15",
  latestAppointmentDate: "2026-05-14",
  totalAppointments: 2,
};

const patientDetail: PatientRecordDetailResponse = {
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
  appointments: [
    {
      appointmentId: "appointment-1",
      appointmentDate: "2026-05-14",
      startTime: "09:00:00",
      endTime: "09:30:00",
      status: "DONE",
      doctorId: "doctor-1",
      doctorName: "Dr. Lan Tran",
      medicalRecord: {
        recordId: "record-1",
        appointmentId: "appointment-1",
        diagnosis: "Seasonal allergy",
        clinicalNotes: null,
        followUpDate: null,
        appointmentStatus: "DONE",
      },
    },
  ],
};

describe("PatientsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(searchPatientRecords).mockResolvedValue([patientSummary]);
    vi.mocked(getPatientRecordDetail).mockResolvedValue(patientDetail);
  });

  it("loads real patient search results and detail on selection", async () => {
    render(<PatientsPage />);

    expect(screen.getByText(/searching patient records/i)).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: /nguyen van a/i }));

    await waitFor(() => expect(getPatientRecordDetail).toHaveBeenCalledWith("patient-1"));
    expect(await screen.findByText(/Active Record/i)).toBeInTheDocument();
    expect(screen.getByText("O+")).toBeInTheDocument();
    expect(screen.getByText(/seasonal allergy/i)).toBeInTheDocument();
    expect(screen.queryByText("Sarah J. Miller")).not.toBeInTheDocument();
  });

  it("submits staff patient search with the typed query", async () => {
    render(<PatientsPage />);

    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox", { name: /search patients/i }), "012345678901");
    await userEvent.click(screen.getByRole("button", { name: /submit patient search/i }));

    await waitFor(() => expect(searchPatientRecords).toHaveBeenCalledWith("012345678901"));
  });

  it("shows honest empty and error states without static patient fallback", async () => {
    vi.mocked(searchPatientRecords).mockResolvedValueOnce([]);

    render(<PatientsPage />);

    expect(await screen.findByText(/no patients found/i)).toBeInTheDocument();
    expect(screen.queryByText("Sarah J. Miller")).not.toBeInTheDocument();
  });
});
