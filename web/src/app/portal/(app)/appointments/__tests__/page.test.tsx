import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientAppointmentsPage from "../page";
import {
  listPatientPortalAppointments,
  type PatientPortalAppointmentResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    listPatientPortalAppointments: vi.fn(),
  };
});

const upcomingAppointment: PatientPortalAppointmentResponse = {
  appointmentId: "appointment-1",
  confirmationCode: "HMS-1001",
  appointmentDate: "2026-07-01",
  startTime: "09:00:00",
  endTime: "09:30:00",
  doctorName: "Dr. Lan Tran",
  status: "CONFIRMED",
};

const pastAppointment: PatientPortalAppointmentResponse = {
  appointmentId: "appointment-2",
  confirmationCode: "HMS-0900",
  appointmentDate: "2026-01-01",
  startTime: "10:00:00",
  endTime: "10:30:00",
  doctorName: "Dr. Minh Nguyen",
  status: "DONE",
};

describe("PatientAppointmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listPatientPortalAppointments).mockResolvedValue([
      upcomingAppointment,
      pastAppointment,
    ]);
  });

  it("loads real portal appointments without static fallback", async () => {
    render(<PatientAppointmentsPage />);

    expect(screen.getByText(/loading patient appointments/i)).toBeInTheDocument();
    expect(await screen.findByText("Dr. Lan Tran")).toBeInTheDocument();
    expect(screen.getByText("Confirmation HMS-1001")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Sarah Jenkins")).not.toBeInTheDocument();
    expect(listPatientPortalAppointments).toHaveBeenCalledOnce();
  });

  it("switches between upcoming and past appointments", async () => {
    render(<PatientAppointmentsPage />);

    expect(await screen.findByText("Dr. Lan Tran")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Minh Nguyen")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "PAST" }));

    expect(await screen.findByText("Dr. Minh Nguyen")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Lan Tran")).not.toBeInTheDocument();
  });

  it("shows honest empty and error states", async () => {
    vi.mocked(listPatientPortalAppointments).mockResolvedValueOnce([]);

    render(<PatientAppointmentsPage />);

    expect(await screen.findByText(/no upcoming appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/actions are not exposed by the current patient portal api/i)).toBeInTheDocument();
  });

  it("shows API errors without mock fallback", async () => {
    vi.mocked(listPatientPortalAppointments).mockRejectedValueOnce(
      new Error("Patient token expired"),
    );

    render(<PatientAppointmentsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Patient token expired");
    expect(screen.queryByText("Dr. Sarah Jenkins")).not.toBeInTheDocument();
  });
});
