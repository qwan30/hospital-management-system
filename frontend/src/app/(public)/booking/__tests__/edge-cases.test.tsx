import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicBookingPage from "../page";
import {
  createPublicAppointment,
  listDoctors,
  listDoctorSlots,
  type DoctorResponse,
  type DoctorSlotResponse,
} from "@/lib/public-api";

vi.mock("@/lib/public-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/public-api")>(
    "@/lib/public-api",
  );

  return {
    ...actual,
    createPublicAppointment: vi.fn(),
    listDoctorSlots: vi.fn(),
    listDoctors: vi.fn(),
  };
});

const doctor: DoctorResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  departmentId: "department-1",
  fullName: "Dr. Lan Tran",
  email: "lan.tran@example.com",
  specialty: "Cardiology",
  qualification: "MD",
  experienceYears: 12,
};

const slot: DoctorSlotResponse = {
  id: "22222222-2222-2222-2222-222222222222",
  doctorId: doctor.id,
  slotDate: "2026-05-14",
  startTime: "09:00:00",
  endTime: "09:30:00",
  status: "AVAILABLE",
};

async function completeRequiredForm() {
  await userEvent.selectOptions(await screen.findByLabelText(/doctor/i), doctor.id);
  await userEvent.click(await screen.findByRole("button", { name: "09:00 - 09:30" }));
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Nguyen Van A" } });
  fireEvent.change(screen.getByLabelText(/contact number/i), {
    target: { value: "+84900000001" },
  });
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: "patient@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/patient cccd/i), {
    target: { value: "012345678901" },
  });
  fireEvent.change(screen.getByLabelText(/date of birth/i), {
    target: { value: "1990-05-15" },
  });
  await userEvent.selectOptions(screen.getByLabelText(/gender/i), "MALE");
  fireEvent.change(screen.getByLabelText(/province or city/i), {
    target: { value: "Ho Chi Minh City" },
  });
  fireEvent.change(screen.getByLabelText(/district/i), { target: { value: "District 1" } });
  fireEvent.change(screen.getByLabelText(/street address/i), {
    target: { value: "1 Nguyen Hue" },
  });
  fireEvent.change(screen.getByLabelText(/primary symptom description/i), {
    target: { value: "Fever" },
  });
}

describe("Booking Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/booking");
    vi.mocked(listDoctors).mockResolvedValue([doctor]);
    vi.mocked(listDoctorSlots).mockResolvedValue([slot]);
    vi.mocked(createPublicAppointment).mockResolvedValue({
      id: "appointment-1",
      patientId: "patient-1",
      doctorId: doctor.id,
      firstSlotId: slot.id,
      confirmationCode: "HMS-12345678",
      status: "CONFIRMED",
      appointmentDate: "2026-05-14",
    });
  });

  it("prevents double submission while request is in flight", async () => {
    // Arrange: make the API resolve slowly so we can click twice
    let resolveAppointment!: (value: unknown) => void;
    const slowPromise = new Promise((resolve) => {
      resolveAppointment = resolve;
    });
    vi.mocked(createPublicAppointment).mockReset();
    vi.mocked(createPublicAppointment).mockReturnValueOnce(
      slowPromise as ReturnType<typeof createPublicAppointment>,
    );

    render(<PublicBookingPage />);

    await completeRequiredForm();

    const submitButton = screen.getByRole("button", { name: /confirm appointment/i });
    expect(submitButton).not.toBeDisabled();

    // Act: click twice in rapid succession
    await userEvent.click(submitButton);

    // The button text changes to "Submitting Booking..." while in flight
    const submittingButton = await screen.findByRole("button", { name: /submitting booking/i });
    expect(submittingButton).toBeDisabled();

    // Attempt a second click — the button is already disabled
    await userEvent.click(submittingButton);

    // Now resolve the pending request
    resolveAppointment({
      id: "appointment-1",
      patientId: "patient-1",
      doctorId: doctor.id,
      firstSlotId: slot.id,
      confirmationCode: "HMS-12345678",
      status: "CONFIRMED",
      appointmentDate: "2026-05-14",
    });

    // Assert: the API was called exactly once, not twice
    await waitFor(() => {
      expect(createPublicAppointment).toHaveBeenCalledTimes(1);
    });
  });

  it("renders XSS attempts in symptoms as text, not HTML", async () => {
    // Malicious payload
    const xssPayload = "<script>alert('xss')</script>";

    render(<PublicBookingPage />);

    await completeRequiredForm();

    // Overwrite the symptom field with the XSS payload
    const symptomInput = screen.getByLabelText(/primary symptom description/i);
    fireEvent.change(symptomInput, { target: { value: xssPayload } });

    // Submit
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    // Verify the payload was sent as plain text, not executed
    await waitFor(() => {
      expect(createPublicAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          symptoms: xssPayload,
        }),
      );
    });

    // Verify the text is visible as content in the textarea
    expect(screen.getByLabelText(/primary symptom description/i)).toHaveValue(xssPayload);

    // If XSS executed, document.body would contain no text matching
    // the literal script tag (React escapes it by default). Verify no script element was injected.
    expect(document.querySelector("script")).toBeNull();
  });

  it("handles very long patient name without breaking layout", async () => {
    const longName = "A".repeat(500);

    render(<PublicBookingPage />);

    // Select doctor and slot
    await userEvent.selectOptions(await screen.findByLabelText(/doctor/i), doctor.id);
    await userEvent.click(await screen.findByRole("button", { name: "09:00 - 09:30" }));

    // Fill in all required fields with the long name
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: longName } });
    fireEvent.change(screen.getByLabelText(/contact number/i), {
      target: { value: "+84900000001" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "patient@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/patient cccd/i), {
      target: { value: "012345678901" },
    });
    fireEvent.change(screen.getByLabelText(/date of birth/i), {
      target: { value: "1990-05-15" },
    });
    await userEvent.selectOptions(screen.getByLabelText(/gender/i), "MALE");
    fireEvent.change(screen.getByLabelText(/province or city/i), {
      target: { value: "Ho Chi Minh City" },
    });
    fireEvent.change(screen.getByLabelText(/district/i), { target: { value: "District 1" } });
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: "1 Nguyen Hue" },
    });
    fireEvent.change(screen.getByLabelText(/primary symptom description/i), {
      target: { value: "Fever" },
    });

    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    // Verify the page did not crash and the submission went through
    await waitFor(() => {
      expect(createPublicAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          patientFullName: longName,
        }),
      );
    });

    // Verify the full name is rendered in the input without breaking the UI
    expect(screen.getByLabelText(/full name/i)).toHaveValue(longName);
    expect(screen.queryByRole("alert")).not.toBeNull();
  });

  it("shows all inline validation errors when submitting empty form", async () => {
    render(<PublicBookingPage />);

    // Wait for the component to finish loading doctors
    await screen.findByLabelText(/doctor/i);

    // Click submit without selecting doctor, slot, or filling any patient details
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    // Inline errors are displayed
    expect(screen.getByText("Please select a doctor.")).toBeInTheDocument();
    expect(screen.getByText("Please select an available appointment slot.")).toBeInTheDocument();

    // Now select a doctor but not a slot
    await userEvent.selectOptions(screen.getByLabelText(/doctor/i), doctor.id);
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    expect(screen.getByText("Please select an available appointment slot.")).toBeInTheDocument();

    // Now select a slot but leave all patient fields empty
    await userEvent.click(await screen.findByRole("button", { name: "09:00 - 09:30" }));
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Contact phone number is required.")).toBeInTheDocument();
    expect(screen.getByText("Email address is required.")).toBeInTheDocument();
    expect(screen.getByText("Patient CCCD is required.")).toBeInTheDocument();
    expect(screen.getByText("Date of birth is required.")).toBeInTheDocument();
    expect(screen.getByText("Please select gender.")).toBeInTheDocument();
    expect(screen.getByText("Primary symptom description is required.")).toBeInTheDocument();

    // Verify the submit function was never called
    expect(createPublicAppointment).not.toHaveBeenCalled();
  });

  it("handles network disconnection gracefully", async () => {
    vi.mocked(createPublicAppointment).mockReset();
    vi.mocked(createPublicAppointment).mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );

    render(<PublicBookingPage />);

    await completeRequiredForm();
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    // Verify an error state is shown — not a blank page or crash
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to fetch",
    );

    // The error tone should be "error" (red/danger styling)
    expect(screen.getByRole("alert")).toHaveTextContent("Error");
    expect(screen.queryByText(/success/i)).not.toBeInTheDocument();

    // The form should remain usable (button is re-enabled after failure)
    expect(screen.getByRole("button", { name: /confirm appointment/i })).not.toBeDisabled();
  });

  it("handles very long symptom description gracefully", async () => {
    const longText = "Patient reports ".repeat(100); // ~1600 characters

    render(<PublicBookingPage />);

    await completeRequiredForm();

    // Type a very long symptom description - page should not crash
    const symptomInput = screen.getByLabelText(/primary symptom description/i);
    fireEvent.change(symptomInput, { target: { value: longText } });
    expect(symptomInput).toHaveValue(longText);

    // Form should still be submittable (page didn't crash)
    expect(screen.getByRole("button", { name: /confirm appointment/i })).toBeInTheDocument();
  });

  it("handles rapid doctor selection changes without stale slot data", async () => {
    const doctor2: DoctorResponse = {
      id: "33333333-3333-3333-3333-333333333333",
      departmentId: "department-2",
      fullName: "Dr. Tran Van B",
      email: "tran.vanb@example.com",
      specialty: "Neurology",
      qualification: "MD",
      experienceYears: 8,
    };

    vi.mocked(listDoctors).mockResolvedValue([doctor, doctor2]);

    render(<PublicBookingPage />);

    // Wait for doctors to load
    await screen.findByText(/Dr. Lan Tran/i);

    // Rapidly switch doctors - page should not crash
    await userEvent.selectOptions(screen.getByLabelText(/doctor/i), doctor2.id);
    await userEvent.selectOptions(screen.getByLabelText(/doctor/i), doctor.id);

    // Page should still be functional
    expect(screen.getByLabelText(/doctor/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm appointment/i })).toBeInTheDocument();
  });
});
