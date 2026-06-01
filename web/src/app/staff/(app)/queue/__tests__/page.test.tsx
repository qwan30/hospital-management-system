import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QueueBoardPage from "../page";
import { ApiClientError } from "@/lib/api-client";
import {
  callQueuePatient,
  checkInAppointment,
  completeQueueVisit,
  getTodayAppointments,
  getTodayQueue,
  skipQueuePatient,
  type ClinicalAppointmentResponse,
} from "@/lib/clinical-api";

vi.mock("@/lib/clinical-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/clinical-api")>(
    "@/lib/clinical-api",
  );

  return {
    ...actual,
    callQueuePatient: vi.fn(),
    checkInAppointment: vi.fn(),
    completeQueueVisit: vi.fn(),
    getTodayAppointments: vi.fn(),
    getTodayQueue: vi.fn(),
    skipQueuePatient: vi.fn(),
  };
});

const waitingAppointment: ClinicalAppointmentResponse = {
  appointmentId: "appt-waiting",
  confirmationCode: "WAIT-001",
  status: "CONFIRMED",
  appointmentDate: "2026-05-13",
  startTime: "09:00",
  endTime: "09:30",
  checkedInAt: null,
  doctorId: "doc-1",
  doctorName: "Dr. Lan",
  patientId: "patient-1",
  patientFullName: "Nguyen Van A",
  patientPhone: "0900000001",
  patientCccd: "012345678901",
};

const readyAppointment: ClinicalAppointmentResponse = {
  ...waitingAppointment,
  appointmentId: "appt-ready",
  confirmationCode: "READY-001",
  status: "CHECKED_IN",
  checkedInAt: "2026-05-13T08:55:00",
  patientFullName: "Tran Thi B",
  patientPhone: "0900000002",
};

const completedAppointment: ClinicalAppointmentResponse = {
  ...waitingAppointment,
  appointmentId: "appt-done",
  confirmationCode: "DONE-001",
  status: "DONE",
  patientFullName: "Completed Patient",
};

const inProgressAppointment: ClinicalAppointmentResponse = {
  ...readyAppointment,
  appointmentId: "appt-progress",
  confirmationCode: "PROG-001",
  status: "IN_PROGRESS",
  patientFullName: "Pham In Room",
};

describe("QueueBoardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTodayAppointments).mockResolvedValue([waitingAppointment, completedAppointment]);
    vi.mocked(getTodayQueue).mockResolvedValue([readyAppointment]);
    vi.mocked(skipQueuePatient).mockResolvedValue({ ...readyAppointment, status: "CANCELLED" });
    vi.mocked(completeQueueVisit).mockResolvedValue({ ...inProgressAppointment, status: "DONE" });
  });

  it("loads and merges today's appointments and queue while hiding terminal appointments", async () => {
    render(<QueueBoardPage />);

    expect(screen.getByText(/loading today's nurse queue/i)).toBeInTheDocument();

    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();
    expect(screen.queryByText("Completed Patient")).not.toBeInTheDocument();
    expect(getTodayAppointments).toHaveBeenCalledTimes(1);
    expect(getTodayQueue).toHaveBeenCalledTimes(1);
  });

  it("renders an unauthorized queue state for backend 403 responses", async () => {
    vi.mocked(getTodayQueue).mockRejectedValueOnce(
      new ApiClientError("Forbidden", 403, "FORBIDDEN"),
    );

    render(<QueueBoardPage />);

    expect(await screen.findByTestId("queue-unauthorized")).toHaveTextContent(
      "not authorized",
    );
  });

  it("filters queue rows by patient and doctor text", async () => {
    render(<QueueBoardPage />);

    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("searchbox", { name: /filter queue/i }), "tran");
    await userEvent.click(screen.getByRole("button", { name: /ready/i }));

    expect(screen.getByText("Tran Thi B")).toBeInTheDocument();
    expect(screen.queryByText("Nguyen Van A")).not.toBeInTheDocument();
  });

  it("moves a checked-in appointment to the ready tab", async () => {
    vi.mocked(checkInAppointment).mockResolvedValueOnce({
      ...waitingAppointment,
      status: "CHECKED_IN",
      checkedInAt: "2026-05-13T09:01:00",
    });

    render(<QueueBoardPage />);

    await userEvent.click(
      await screen.findByRole("button", { name: /check in nguyen van a/i }),
    );

    await waitFor(() => expect(checkInAppointment).toHaveBeenCalledWith(
      "appt-waiting",
      expect.objectContaining({ checkedInAt: expect.any(String) }),
    ));
    expect(screen.getByRole("button", { name: /ready/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
  });

  it("shows row-level action errors without replacing the whole queue", async () => {
    vi.mocked(callQueuePatient).mockRejectedValueOnce(new Error("Call failed"));

    render(<QueueBoardPage />);

    await userEvent.click(await screen.findByRole("button", { name: /ready/i }));
    const readyRow = screen.getByText("Tran Thi B").closest("tr");
    expect(readyRow).not.toBeNull();

    await userEvent.click(
      within(readyRow as HTMLTableRowElement).getByRole("button", {
        name: /call tran thi b/i,
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Call failed");
    expect(screen.getByTestId("queue-board")).toBeInTheDocument();
  });

  it("requires confirmation before skipping or completing queue visits", async () => {
    vi.mocked(getTodayQueue).mockResolvedValueOnce([readyAppointment, inProgressAppointment]);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValue(true);

    render(<QueueBoardPage />);

    await userEvent.click(await screen.findByRole("button", { name: /ready/i }));
    await userEvent.click(screen.getByRole("button", { name: /skip tran thi b/i }));
    expect(skipQueuePatient).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /skip tran thi b/i }));
    await waitFor(() => expect(skipQueuePatient).toHaveBeenCalledWith("appt-ready"));

    await userEvent.click(screen.getByRole("button", { name: /in progress/i }));
    await userEvent.click(screen.getByRole("button", { name: /complete visit pham in room/i }));
    await waitFor(() => expect(completeQueueVisit).toHaveBeenCalledWith("appt-progress"));
    expect(confirmSpy).toHaveBeenCalledTimes(3);
  });
});
