import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DoctorSchedulePage from "../page";
import {
  getMySchedule,
  type ClinicalAppointmentResponse,
} from "@/lib/clinical-api";

vi.mock("@/lib/clinical-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/clinical-api")>(
    "@/lib/clinical-api",
  );

  return {
    ...actual,
    getMySchedule: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/staff/schedule"),
  useParams: vi.fn(() => ({})),
}));

const mockSchedule: ClinicalAppointmentResponse[] = [
  {
    appointmentId: "sched-1",
    confirmationCode: "SC-1001",
    status: "CONFIRMED",
    appointmentDate: "2026-05-18",
    startTime: "09:00:00",
    endTime: "09:30:00",
    checkedInAt: null,
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Jenkins",
    patientId: "patient-1",
    patientFullName: "Alexander Vance",
    patientPhone: "+84900000301",
    patientCccd: "012345678901",
  },
  {
    appointmentId: "sched-2",
    confirmationCode: "SC-1002",
    status: "PENDING",
    appointmentDate: "2026-05-18",
    startTime: "10:00:00",
    endTime: "10:30:00",
    checkedInAt: null,
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Jenkins",
    patientId: "patient-2",
    patientFullName: "Maria Chen",
    patientPhone: "+84900000302",
    patientCccd: "012345678902",
  },
];

describe("DoctorSchedulePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMySchedule).mockResolvedValue(mockSchedule);
  });

  it("shows loading state initially", () => {
    render(<DoctorSchedulePage />);
    expect(screen.getByText(/loading schedule/i)).toBeInTheDocument();
  });

  it("renders schedule heading and description", async () => {
    render(<DoctorSchedulePage />);

    expect(await screen.findByText("Alexander Vance")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /my schedule/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/contact administration for changes/i),
    ).toBeInTheDocument();
  });

  it("renders appointment rows after loading", async () => {
    render(<DoctorSchedulePage />);

    expect(await screen.findByText("Alexander Vance")).toBeInTheDocument();
    expect(screen.getByText("Maria Chen")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("renders DAY and WEEK toggle buttons", async () => {
    render(<DoctorSchedulePage />);

    await screen.findByText("Alexander Vance");

    expect(screen.getByRole("button", { name: /day/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /week/i })).toBeInTheDocument();
  });

  it("renders date input for day view", async () => {
    render(<DoctorSchedulePage />);

    await screen.findByText("Alexander Vance");

    expect(screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/)).toBeInTheDocument();
  });

  it("switches to week input when WEEK button is clicked", async () => {
    render(<DoctorSchedulePage />);

    await screen.findByText("Alexander Vance");

    await userEvent.click(screen.getByRole("button", { name: /week/i }));

    expect(screen.getByDisplayValue(/\d{4}-W\d{2}/)).toBeInTheDocument();
  });

  it("shows empty state when no appointments exist", async () => {
    vi.mocked(getMySchedule).mockResolvedValue([]);

    render(<DoctorSchedulePage />);

    expect(
      await screen.findByText(/no appointments scheduled/i),
    ).toBeInTheDocument();
  });

  it("shows error state on API failure", async () => {
    vi.mocked(getMySchedule).mockRejectedValue(new Error("Unable to load schedule."));

    render(<DoctorSchedulePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load schedule.");
  });

  it("calls getMySchedule with date param on initial load", async () => {
    render(<DoctorSchedulePage />);

    await screen.findByText("Alexander Vance");

    expect(getMySchedule).toHaveBeenCalledWith(
      expect.objectContaining({ date: expect.any(String) }),
    );
  });
});
