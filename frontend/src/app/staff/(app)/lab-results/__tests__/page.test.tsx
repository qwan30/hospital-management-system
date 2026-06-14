import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StaffLabResultsPage from "../page";
import {
  listAppointments,
  listLabResultsByAppointment,
  type AppointmentListResponse,
  type LabResultResponse,
} from "@/lib/clinical-api";

vi.mock("@/lib/clinical-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/clinical-api")>(
    "@/lib/clinical-api",
  );

  return {
    ...actual,
    listAppointments: vi.fn(),
    listLabResultsByAppointment: vi.fn(),
  };
});

vi.mock("@/lib/use-stored-role", () => ({
  useStoredRole: vi.fn(() => "ADMIN"),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/staff/lab-results"),
  useParams: vi.fn(() => ({})),
}));

const mockAppointment: AppointmentListResponse = {
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

const mockLabResult: LabResultResponse = {
  labResultId: "lr-1",
  appointmentId: "appt-1",
  testName: "Complete Blood Count",
  status: "Reviewed",
  resultSummary: "Hemoglobin within normal range.",
  doctorComment: "Continue current treatment.",
  attachmentUrl: null,
  collectedAt: "2026-05-15T08:00:00Z",
};

describe("StaffLabResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAppointments).mockResolvedValue([mockAppointment]);
    vi.mocked(listLabResultsByAppointment).mockResolvedValue([mockLabResult]);
  });

  it("shows loading state initially", async () => {
    render(<StaffLabResultsPage />);
    expect(screen.getByText(/loading lab results/i)).toBeInTheDocument();
    await screen.findByText("Complete Blood Count");
  });

  it("renders lab result rows after loading", async () => {
    render(<StaffLabResultsPage />);

    expect(await screen.findByText("Complete Blood Count")).toBeInTheDocument();
    expect(screen.getByText("Alexander Vance")).toBeInTheDocument();
    expect(screen.getByText("Reviewed")).toBeInTheDocument();
    expect(listAppointments).toHaveBeenCalledWith({ size: 50 });
    expect(listLabResultsByAppointment).toHaveBeenCalledWith("appt-1");
  });

  it("renders 'Record New Result' button for ADMIN/DOCTOR roles", async () => {
    render(<StaffLabResultsPage />);

    expect(await screen.findByText("Record New Result")).toBeInTheDocument();
  });

  it("shows empty state when no lab results exist", async () => {
    vi.mocked(listLabResultsByAppointment).mockResolvedValue([]);

    render(<StaffLabResultsPage />);

    expect(
      await screen.findByText(/no lab results found/i),
    ).toBeInTheDocument();
  });

  it("shows error state on API failure", async () => {
    vi.mocked(listAppointments).mockRejectedValue(
      new Error("Network error"),
    );

    render(<StaffLabResultsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Network error");
  });

  it("renders review links for each lab result", async () => {
    render(<StaffLabResultsPage />);

    const reviewLink = await screen.findByRole("link", { name: /review/i });
    expect(reviewLink).toHaveAttribute("href", "/staff/lab-results/lr-1");
  });
});
