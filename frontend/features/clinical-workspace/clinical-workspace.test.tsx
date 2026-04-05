import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import {
  AiBookingScreen,
  MedicalRecordEditorScreen,
  NurseCheckinScreen
} from "./clinical-workspace";

const apiFetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null
  })
}));

vi.mock("../auth/auth-provider", () => ({
  useAuth: () => ({
    apiFetch: apiFetchMock,
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

describe("clinical workspace screens", () => {
  it("renders the AI booking flow", () => {
    render(<AiBookingScreen />);

    expect(
      screen.getByRole("heading", { name: /specialist selection/i })
    ).toBeTruthy();
    expect(screen.getByText(/patient information/i)).toBeTruthy();
  });

  it("renders the nurse check-in screen", () => {
    render(<NurseCheckinScreen />);

    expect(
      screen.getByRole("heading", {
        name: /nursing station a: patient check-in/i
      })
    ).toBeTruthy();
    expect(screen.getByText(/today's active queue/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: /nurse assistant/i })).toBeTruthy();
  });

  it("renders the medical record editor", () => {
    render(<MedicalRecordEditorScreen />);

    expect(
      screen.getByRole("heading", { name: /johnathan doe/i })
    ).toBeTruthy();
    expect(screen.getByText(/clinical notes/i)).toBeTruthy();
    expect(screen.getByText(/critical allergy/i)).toBeTruthy();
    expect(screen.getByRole("heading", { name: /clinical assistant/i })).toBeTruthy();
  });
});
