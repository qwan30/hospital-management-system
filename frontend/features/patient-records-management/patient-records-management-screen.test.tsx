import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { ApiClientError } from "../auth/hms-api";
import { PatientRecordsManagementScreen } from "./patient-records-management-screen";

const apiFetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "patientId") {
        return "patient-1";
      }

      if (key === "appointmentId") {
        return "appt-1";
      }

      if (key === "mode") {
        return "hybrid";
      }

      return null;
    }
  })
}));

vi.mock("../auth/auth-provider", () => ({
  useAuth: () => ({
    apiFetch: apiFetchMock,
    logout: vi.fn(),
    session: {
      accessToken: "token",
      expiresAt: Date.now() + 60_000,
      fullName: "Dr. Sarah Chen",
      role: "DOCTOR",
      scope: "staff",
      userId: "doctor-1"
    }
  })
}));

vi.mock("../auth/clinical-records-route-guard", () => ({
  ClinicalRecordsRouteGuard: ({ children }: { readonly children: ReactNode }) => <>{children}</>
}));

describe("PatientRecordsManagementScreen", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockImplementation(async (path: string) => {
      if (path === "/patient-records?query=Nguyen" || path === "/patient-records") {
        return [
          {
            dateOfBirth: "1990-01-01",
            email: "patient@example.com",
            fullName: "Nguyen Van A",
            latestAppointmentDate: "2030-01-10",
            patientId: "patient-1",
            phone: "0901234567",
            totalAppointments: 1
          }
        ];
      }

      if (path === "/patient-records/patient-1") {
        return {
          appointments: [
            {
              appointmentDate: "2030-01-10",
              appointmentId: "appt-1",
              doctorId: "doctor-1",
              doctorName: "Dr. Sarah Chen",
              endTime: "09:30:00",
              medicalRecord: {
                diagnosis: "Migraine with aura"
              },
              startTime: "09:00:00",
              status: "DONE"
            }
          ],
          bloodType: "O+",
          cccd: "012345678901",
          dateOfBirth: "1990-01-01",
          drugAllergies: "Penicillin",
          email: "patient@example.com",
          fullName: "Nguyen Van A",
          insuranceNumber: "BH-001",
          medicalHistory: "Asthma",
          occupation: "Engineer",
          patientId: "patient-1",
          phone: "0901234567"
        };
      }

      if (path === "/internal-assistant/messages") {
        return {
          answer: "Use the chart context and SOPs.",
          citations: [],
          deepLinks: [],
          suggestions: [],
          scope: "hybrid"
        };
      }

      throw new Error(`Unexpected path: ${path}`);
    });
  });

  it("renders the internal assistant with the selected patient context and sends requests", async () => {
    render(<PatientRecordsManagementScreen />);

    await screen.findAllByText(/nguyen van a/i);
    expect(screen.getByRole("heading", { name: /clinical assistant/i })).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/internal assistant message/i), {
      target: { value: "Summarize the selected chart" }
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/internal-assistant/messages",
        expect.objectContaining({
          body: expect.objectContaining({
            appointmentId: "appt-1",
            mode: "hybrid",
            patientId: "patient-1"
          }),
          method: "POST"
        })
      );
    });
  });

  it("surfaces backend failures from the records API", async () => {
    apiFetchMock.mockImplementationOnce(async (path: string) => {
      if (path === "/patient-records") {
        throw new ApiClientError(403, "Forbidden", "forbidden");
      }

      return [];
    });

    render(<PatientRecordsManagementScreen />);

    expect(await screen.findByText(/forbidden/i)).toBeTruthy();
  });
});
