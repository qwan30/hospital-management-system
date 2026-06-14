import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DoctorDashboardPage from "../page";
import {
  listAppointments,
  updateAppointmentStatus,
  type AppointmentListResponse,
} from "@/lib/clinical-api";

vi.mock("@/lib/clinical-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/clinical-api")>(
    "@/lib/clinical-api",
  );

  return {
    ...actual,
    listAppointments: vi.fn(),
    updateAppointmentStatus: vi.fn(),
  };
});

const appointment: AppointmentListResponse = {
  appointmentId: "appointment-1",
  confirmationCode: "HMS-1001",
  status: "CHECKED_IN",
  appointmentDate: "2026-05-15",
  startTime: "09:00:00",
  endTime: "09:30:00",
  doctorId: "doctor-1",
  doctorName: "Dr. Lan Tran",
  patientId: "patient-1",
  patientName: "Nguyen Van A",
  patientPhone: "+84900000001",
  symptoms: "Fever",
  createdAt: "2026-05-15T01:00:00Z",
};

describe("DoctorDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAppointments).mockResolvedValue([appointment]);
    vi.mocked(updateAppointmentStatus).mockResolvedValue({
      appointmentId: appointment.appointmentId,
      confirmationCode: appointment.confirmationCode,
      status: "IN_PROGRESS",
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      checkedInAt: "2026-05-15T08:55:00",
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      patientId: appointment.patientId,
      patientFullName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientCccd: "012345678901",
    });
  });

  it("loads backend appointments and filters the rendered schedule", async () => {
    render(<DoctorDashboardPage />);

    expect(screen.getByText(/loading doctor appointment schedule/i)).toBeInTheDocument();
    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByText("HMS-1001")).toBeInTheDocument();
    expect(screen.queryByText("Elena Rodriguez")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: /search appointments/i }), {
      target: { value: "missing patient" },
    });

    expect(screen.getByText(/no appointments match this search/i)).toBeInTheDocument();
  });

  it("requests backend status/date filters", async () => {
    render(<DoctorDashboardPage />);

    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /appointment status/i }),
      "CHECKED_IN",
    );

    await waitFor(() =>
      expect(listAppointments).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "CHECKED_IN", page: 0, size: 100 }),
      ),
    );
  });

  it("updates appointment status with the real appointment id and refreshes", async () => {
    vi.mocked(listAppointments)
      .mockResolvedValueOnce([appointment])
      .mockResolvedValueOnce([{ ...appointment, status: "IN_PROGRESS" }]);

    render(<DoctorDashboardPage />);

    await userEvent.click(await screen.findByRole("button", { name: /start consultation/i }));

    await waitFor(() =>
      expect(updateAppointmentStatus).toHaveBeenCalledWith("appointment-1", "IN_PROGRESS"),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Nguyen Van A moved to consultation.",
    );
    expect(listAppointments).toHaveBeenCalledTimes(2);
  });

  it("shows honest empty and error states without static patient fallback", async () => {
    vi.mocked(listAppointments).mockResolvedValueOnce([]);

    render(<DoctorDashboardPage />);

    expect(await screen.findByText(/no appointments found/i)).toBeInTheDocument();
    expect(screen.queryByText("James T. Kendrick")).not.toBeInTheDocument();
  });
});
