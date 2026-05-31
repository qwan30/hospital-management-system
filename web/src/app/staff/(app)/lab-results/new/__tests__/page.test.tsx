import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewLabResultPage from "../page";
import {
  createLabResult,
  listAppointments,
  type AppointmentListResponse,
  type LabResultResponse,
} from "@/lib/clinical-api";
import { useStoredRole } from "@/lib/use-stored-role";

const pushMock = vi.fn();

vi.mock("@/lib/clinical-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/clinical-api")>(
    "@/lib/clinical-api",
  );

  return {
    ...actual,
    createLabResult: vi.fn(),
    listAppointments: vi.fn(),
  };
});

vi.mock("@/lib/use-stored-role", () => ({
  useStoredRole: vi.fn(() => "DOCTOR"),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: pushMock, replace: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/staff/lab-results/new"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

const appointment: AppointmentListResponse = {
  appointmentId: "appt-1",
  confirmationCode: "Q-1001",
  status: "DONE",
  appointmentDate: "2026-05-15",
  startTime: "09:00:00",
  endTime: "09:30:00",
  doctorId: "doctor-1",
  doctorName: "Dr. Sarah Jenkins",
  patientId: "patient-1",
  patientName: "Alexander Vance",
  patientPhone: "+84900000301",
  symptoms: null,
  createdAt: "2026-05-14T10:00:00Z",
};

const createdResult: LabResultResponse = {
  labResultId: "lr-new",
  appointmentId: "appt-1",
  testName: "Lipid Panel",
  resultValue: "Total cholesterol 185 mg/dL",
  referenceRange: "Desirable: <200 mg/dL",
  status: "COMPLETED",
  notes: "No immediate intervention required.",
  deleted: false,
  createdAt: "2026-05-15T10:00:00Z",
  resultSummary: "Total cholesterol 185 mg/dL",
  doctorComment: "No immediate intervention required.",
  attachmentUrl: null,
  collectedAt: "2026-05-15T10:00:00Z",
};

describe("NewLabResultPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useStoredRole).mockReturnValue("DOCTOR");
    vi.mocked(listAppointments).mockResolvedValue([appointment]);
    vi.mocked(createLabResult).mockResolvedValue(createdResult);
  });

  it("loads eligible appointments and records a lab result through the real API DTO", async () => {
    render(<NewLabResultPage />);

    await screen.findByRole("heading", { name: /Record Lab Result/i });

    await userEvent.selectOptions(screen.getByLabelText(/appointment/i), "appt-1");
    await userEvent.type(screen.getByLabelText(/test name/i), "Lipid Panel");
    await userEvent.type(screen.getByLabelText(/result value/i), "Total cholesterol 185 mg/dL");
    await userEvent.type(screen.getByLabelText(/reference range/i), "Desirable: <200 mg/dL");
    await userEvent.selectOptions(screen.getByLabelText(/status/i), "COMPLETED");
    await userEvent.type(screen.getByLabelText(/notes/i), "No immediate intervention required.");
    await userEvent.click(screen.getByRole("button", { name: /Save Lab Result/i }));

    await waitFor(() => {
      expect(createLabResult).toHaveBeenCalledWith({
        appointmentId: "appt-1",
        testName: "Lipid Panel",
        resultValue: "Total cholesterol 185 mg/dL",
        referenceRange: "Desirable: <200 mg/dL",
        status: "COMPLETED",
        notes: "No immediate intervention required.",
      });
    });
    expect(pushMock).toHaveBeenCalledWith("/staff/lab-results/lr-new");
  });

  it("blocks submit when required fields are missing", async () => {
    render(<NewLabResultPage />);

    await screen.findByRole("heading", { name: /Record Lab Result/i });
    await userEvent.click(screen.getByRole("button", { name: /Save Lab Result/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Appointment, test name, and result value are required.",
    );
    expect(createLabResult).not.toHaveBeenCalled();
  });

  it("keeps nurse users read-only on the create route", async () => {
    vi.mocked(useStoredRole).mockReturnValue("NURSE");

    render(<NewLabResultPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Lab result creation is limited to doctors and administrators.",
    );
    expect(screen.queryByRole("button", { name: /Save Lab Result/i })).not.toBeInTheDocument();
  });
});
