import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { ApiClientError } from "../auth/hms-api";
import type { AppointmentDetail, ClinicalAppointment } from "./doctor-dashboard.types";
import { DoctorDashboardScreen } from "./doctor-dashboard-screen";

const apiFetchMock = vi.fn();
const logoutMock = vi.fn();

vi.mock("../auth/doctor-route-guard", () => ({
  DoctorRouteGuard: ({ children }: { readonly children: ReactNode }) => <>{children}</>
}));

vi.mock("../auth/auth-provider", () => ({
  useAuth: () => ({
    apiFetch: apiFetchMock,
    logout: logoutMock,
    session: {
      accessToken: "token",
      expiresAt: Date.now() + 60_000,
      fullName: "Dr. Sarah Chen",
      role: "DOCTOR",
      userId: "doctor-1"
    }
  })
}));

describe("DoctorDashboardScreen", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    logoutMock.mockReset();
  });

  it("loads schedule data and defaults the spotlight to the in-progress appointment", async () => {
    const schedule = [
      appointment({
        appointmentId: "appt-checked-in",
        confirmationCode: "HMS-CHECKED",
        patientFullName: "Patient Alpha",
        status: "CHECKED_IN"
      }),
      appointment({
        appointmentId: "appt-in-progress",
        confirmationCode: "HMS-PROGRESS",
        patientFullName: "Patient Beta",
        status: "IN_PROGRESS"
      })
    ] satisfies ClinicalAppointment[];

    apiFetchMock.mockImplementation(async (path: string) => {
      if (path === "/me/schedule?date=today") {
        return schedule;
      }

      if (path === "/appointments/appt-in-progress") {
        return detail({
          appointmentId: "appt-in-progress",
          confirmationCode: "HMS-PROGRESS",
          patientFullName: "Patient Beta",
          status: "IN_PROGRESS"
        });
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    render(<DoctorDashboardScreen />);

    expect(screen.getByText(/loading today.*doctor schedule/i)).toBeTruthy();

    await screen.findByRole("heading", { name: /doctor dashboard/i });
    expect(screen.getAllByText(/Patient Beta/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/HMS-PROGRESS/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /open medical record/i })).toBeTruthy();
    const assistantLink = await screen.findByRole("link", { name: /open assistant/i });
    expect(assistantLink.getAttribute("href")).toContain(
      "/patient-records-management?assistant=1"
    );
  });

  it("filters appointments by the search box", async () => {
    apiFetchMock.mockImplementation(async (path: string) => {
      if (path === "/me/schedule?date=today") {
        return [
          appointment({
            appointmentId: "appt-1",
            confirmationCode: "HMS-ALPHA",
            patientFullName: "Patient Alpha",
            status: "CHECKED_IN"
          }),
          appointment({
            appointmentId: "appt-2",
            confirmationCode: "HMS-BETA",
            patientFullName: "Patient Beta",
            status: "IN_PROGRESS"
          })
        ];
      }

      if (path === "/appointments/appt-2") {
        return detail({
          appointmentId: "appt-2",
          confirmationCode: "HMS-BETA",
          patientFullName: "Patient Beta",
          status: "IN_PROGRESS"
        });
      }

      if (path === "/appointments/appt-1") {
        return detail({
          appointmentId: "appt-1",
          confirmationCode: "HMS-ALPHA",
          patientFullName: "Patient Alpha",
          status: "CHECKED_IN"
        });
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    render(<DoctorDashboardScreen />);
    await waitFor(() => {
      expect(screen.getAllByText(/Patient Beta/).length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByRole("searchbox", { name: /search doctor appointments/i }), {
      target: { value: "Gamma" }
    });

    await screen.findByText(/No appointments match the current search/i);
  });

  it("starts a checked-in consultation and refreshes the selected detail", async () => {
    apiFetchMock.mockImplementation(async (path: string, options?: { readonly method?: string }) => {
      if (path === "/me/schedule?date=today") {
        return [
          appointment({
            appointmentId: "appt-1",
            confirmationCode: "HMS-CHECKED",
            patientFullName: "Patient Alpha",
            status: "CHECKED_IN"
          })
        ];
      }

      if (path === "/appointments/appt-1" && !options?.method) {
        return detail({
          appointmentId: "appt-1",
          confirmationCode: "HMS-CHECKED",
          patientFullName: "Patient Alpha",
          status: "IN_PROGRESS"
        });
      }

      if (path === "/appointments/appt-1/status" && options?.method === "PUT") {
        return {};
      }

      throw new Error(`Unexpected path: ${path}`);
    });

    render(<DoctorDashboardScreen />);

    await waitFor(() => {
      expect(screen.getAllByText(/Patient Alpha/).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getByRole("button", { name: /start consultation/i }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/appointments/appt-1/status",
        expect.objectContaining({
          body: { status: "IN_PROGRESS" },
          method: "PUT"
        })
      );
    });
  });

  it("renders the empty state when the doctor has no appointments today", async () => {
    apiFetchMock.mockResolvedValueOnce([]);

    render(<DoctorDashboardScreen />);

    expect(await screen.findByText(/No appointments scheduled today/i)).toBeTruthy();
  });

  it("renders the error state when the schedule request fails", async () => {
    apiFetchMock.mockRejectedValueOnce(
      new ApiClientError(500, "Doctor schedule is unavailable", "internal_error")
    );

    render(<DoctorDashboardScreen />);

    expect(await screen.findByText(/Unable to load the doctor dashboard/i)).toBeTruthy();
    expect(screen.getByText(/Doctor schedule is unavailable/i)).toBeTruthy();
  });
});

function appointment(overrides: Partial<ClinicalAppointment>): ClinicalAppointment {
  return {
    appointmentDate: "2030-01-12",
    appointmentId: "appt-default",
    checkedInAt: "2030-01-12T08:55:00",
    confirmationCode: "HMS-DEFAULT",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Chen",
    endTime: "09:30:00",
    patientCccd: "012345678901",
    patientFullName: "Patient Default",
    patientId: "patient-1",
    patientPhone: "0901234567",
    startTime: "09:00:00",
    status: "CHECKED_IN",
    ...overrides
  };
}

function detail(overrides: Partial<AppointmentDetail>): AppointmentDetail {
  return {
    aiDurationMinutes: 30,
    appointmentDate: "2030-01-12",
    appointmentId: "appt-default",
    checkedInAt: "2030-01-12T08:55:00",
    confirmationCode: "HMS-DEFAULT",
    doctorId: "doctor-1",
    doctorName: "Dr. Sarah Chen",
    endTime: "09:30:00",
    patientCccd: "012345678901",
    patientDateOfBirth: "1990-01-01",
    patientEmail: "patient@example.com",
    patientFullName: "Patient Default",
    patientGender: "FEMALE",
    patientId: "patient-1",
    patientPhone: "0901234567",
    startTime: "09:00:00",
    status: "CHECKED_IN",
    symptoms: "Persistent migraine symptoms.",
    ...overrides
  };
}
