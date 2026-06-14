import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientPortalProfilePage from "../page";
import {
  getPatientPortalProfile,
  updatePatientPortalProfile,
  type PatientPortalProfileResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    getPatientPortalProfile: vi.fn(),
    updatePatientPortalProfile: vi.fn(),
  };
});

const profile: PatientPortalProfileResponse = {
  patientId: "patient-123456789",
  fullName: "Linh Tran",
  email: "linh.tran@example.com",
  phone: "0900000000",
  dateOfBirth: "1992-04-10",
  occupation: "Teacher",
  bloodType: "O+",
  medicalHistory: "Asthma",
  drugAllergies: "Penicillin",
  insuranceNumber: "INS-100",
};

describe("PatientPortalProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPatientPortalProfile).mockResolvedValue(profile);
    vi.mocked(updatePatientPortalProfile).mockResolvedValue(profile);
  });

  it("loads the real patient profile without static fallback data", async () => {
    render(<PatientPortalProfilePage />);

    expect(screen.getByText(/loading patient profile/i)).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Linh Tran")).toBeInTheDocument();
    expect(screen.getByDisplayValue("linh.tran@example.com")).toBeInTheDocument();
    expect(screen.getByText("INS-100")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Alexander Vance")).not.toBeInTheDocument();
    expect(getPatientPortalProfile).toHaveBeenCalledOnce();
  });

  it("submits a profile update with the backend request shape", async () => {
    const updatedProfile = {
      ...profile,
      fullName: "Linh Nguyen",
      email: "linh.nguyen@example.com",
      occupation: null,
    };
    vi.mocked(updatePatientPortalProfile).mockResolvedValueOnce(updatedProfile);

    render(<PatientPortalProfilePage />);

    fireEvent.change(await screen.findByLabelText("Full Name"), {
      target: { value: " Linh Nguyen " },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: " Linh.Nguyen@Example.com " },
    });
    fireEvent.change(screen.getByLabelText("Occupation"), {
      target: { value: " " },
    });

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updatePatientPortalProfile).toHaveBeenCalledWith({
        fullName: "Linh Nguyen",
        email: "Linh.Nguyen@Example.com",
        phone: "0900000000",
        occupation: null,
        bloodType: "O+",
        medicalHistory: "Asthma",
        drugAllergies: "Penicillin",
        insuranceNumber: "INS-100",
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/profile saved/i);
    expect(screen.getByDisplayValue("linh.nguyen@example.com")).toBeInTheDocument();
  });

  it("blocks invalid required fields before calling the API", async () => {
    render(<PatientPortalProfilePage />);

    fireEvent.change(await screen.findByLabelText("Email Address"), {
      target: { value: "invalid-email" },
    });

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
    expect(updatePatientPortalProfile).not.toHaveBeenCalled();
  });

  it("shows load and save errors without static fallback", async () => {
    vi.mocked(getPatientPortalProfile).mockRejectedValueOnce(
      new Error("Patient profile access denied"),
    );

    const { unmount } = render(<PatientPortalProfilePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Patient profile access denied");
    expect(screen.queryByDisplayValue("Alexander Vance")).not.toBeInTheDocument();

    unmount();

    vi.mocked(getPatientPortalProfile).mockResolvedValueOnce(profile);
    vi.mocked(updatePatientPortalProfile).mockRejectedValueOnce(
      new Error("Email already in use"),
    );

    render(<PatientPortalProfilePage />);

    await screen.findByDisplayValue("Linh Tran");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email already in use");
  });
});
