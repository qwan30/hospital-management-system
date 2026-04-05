import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ApiClientError } from "../auth/hms-api";
import { InternalAssistantPanel } from "./internal-assistant-panel";
import type { PrincipalRole } from "../auth/auth.types";

const apiFetchMock = vi.fn();

const authState = {
  apiFetch: apiFetchMock,
  session: {
    accessToken: "token",
    expiresAt: Date.now() + 60_000,
    fullName: "Dr. Sarah Chen",
    role: "DOCTOR" as PrincipalRole,
    scope: "staff" as const,
    userId: "doctor-1"
  }
};

vi.mock("../auth/auth-provider", () => ({
  useAuth: () => authState
}));

describe("InternalAssistantPanel", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    authState.session.role = "DOCTOR";
  });

  it("sends the assistant request and renders citations, session, and feedback placeholders", async () => {
    apiFetchMock.mockResolvedValueOnce({
      answer: "Use the lab result summary and current note.",
      citations: [
        {
          deepLink: "/patient-portal/lab-results",
          excerpt: "Recent lab result summary",
          sourceType: "patient",
          title: "Lab results"
        }
      ],
      deepLinks: ["/patient-portal/lab-results"],
      messageId: "message-123",
      sessionId: "session-123",
      suggestions: ["Show the latest chart note"],
      scope: "hybrid"
    });

    render(
      <InternalAssistantPanel
        appointmentId="appt-1"
        appointmentLabel="12 Mar 2026 09:00"
        patientId="patient-1"
        patientLabel="Nguyen Van A"
        role="DOCTOR"
        summary="Use the internal assistant to combine chart data and SOPs."
        title="Clinical assistant"
      />
    );

    fireEvent.change(screen.getByLabelText(/internal assistant message/i), {
      target: { value: "Summarize the patient context" }
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith(
        "/internal-assistant/messages",
        expect.objectContaining({
          body: expect.objectContaining({
            appointmentId: "appt-1",
            message: "Summarize the patient context",
            mode: "hybrid",
            patientId: "patient-1"
          }),
          method: "POST"
        })
      );
    });

    expect(screen.getAllByText(/use the lab result summary and current note/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getByText(/lab results/i)).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /\/patient-portal\/lab-results/i }).length).toBe(2);
    expect(screen.getByRole("button", { name: /show the latest chart note/i })).toBeTruthy();
    expect(screen.getByText(/backend session id: session-123/i)).toBeTruthy();
    expect(screen.getByText(/message id: message-123/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Helpful$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Not helpful$/i })).toBeTruthy();
  });

  it("locks admin access to docs-only mode", () => {
    render(
      <InternalAssistantPanel
        role="ADMIN"
        summary="Docs only assistant."
        title="Admin assistant"
      />
    );

    expect(screen.getByRole("button", { name: /docs/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /patient/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /hybrid/i })).toBeNull();
  });

  it("shows patient modes for nurse selected context", () => {
    authState.session.role = "NURSE";

    render(
      <InternalAssistantPanel
        appointmentId="appt-2"
        appointmentLabel="14 Mar 2026 10:30"
        patientId="patient-2"
        patientLabel="Jae Hoon"
        role="NURSE"
        summary="Use the internal assistant for the selected nurse queue patient."
        title="Nurse assistant"
      />
    );

    expect(screen.getByText(/selected patient thread/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /docs/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /patient/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /hybrid/i })).toBeTruthy();
  });

  it("warns when the patient context switches", () => {
    const { rerender } = render(
      <InternalAssistantPanel
        appointmentId="appt-1"
        appointmentLabel="12 Mar 2026 09:00"
        patientId="patient-1"
        patientLabel="Nguyen Van A"
        role="DOCTOR"
        summary="Use the internal assistant to combine chart data and SOPs."
        title="Clinical assistant"
      />
    );

    rerender(
      <InternalAssistantPanel
        appointmentId="appt-2"
        appointmentLabel="14 Mar 2026 10:30"
        patientId="patient-2"
        patientLabel="Jae Hoon"
        role="DOCTOR"
        summary="Use the internal assistant to combine chart data and SOPs."
        title="Clinical assistant"
      />
    );

    expect(screen.getByText(/context switched/i)).toBeTruthy();
  });

  it("surfaces API errors without clearing the form", async () => {
    apiFetchMock.mockRejectedValueOnce(
      new ApiClientError(403, "You cannot access this patient", "forbidden")
    );

    render(
      <InternalAssistantPanel
        appointmentId="appt-1"
        patientId="patient-1"
        patientLabel="Nguyen Van A"
        role="DOCTOR"
        summary="Use the internal assistant to combine chart data and SOPs."
        title="Clinical assistant"
      />
    );

    fireEvent.change(screen.getByLabelText(/internal assistant message/i), {
      target: { value: "Check the chart" }
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText(/you cannot access this patient/i)).toBeTruthy();
    expect((screen.getByLabelText(/internal assistant message/i) as HTMLTextAreaElement).value).toBe(
      "Check the chart"
    );
  });
});
