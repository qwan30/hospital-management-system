import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicBookingPage from "../page";
import {
  createPublicAppointment,
  listDoctorSlots,
  listDoctors,
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
  await userEvent.selectOptions(await screen.findByLabelText("Doctor"), doctor.id);
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

describe("PublicBookingPage", () => {
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

  it("books an appointment with selected real doctor and slot ids", async () => {
    render(<PublicBookingPage />);

    await completeRequiredForm();
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    await waitFor(() => {
      expect(createPublicAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          doctorId: doctor.id,
          firstSlotId: slot.id,
          patientCccd: "012345678901",
          patientDateOfBirth: "1990-05-15",
          patientGender: "MALE",
        }),
      );
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("HMS-12345678");
    expect(createPublicAppointment).not.toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: "00000000-0000-0000-0000-000000000001",
      }),
    );
  });

  it("shows conflict errors without fake confirmation text", async () => {
    vi.mocked(createPublicAppointment).mockRejectedValueOnce(
      new Error("Requested slot window is already reserved"),
    );

    render(<PublicBookingPage />);

    await completeRequiredForm();
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Requested slot window is already reserved",
    );
    expect(screen.queryByText(/booking request received/i)).not.toBeInTheDocument();
  });

  it("preselects a requested doctor from the query string and loads slots", async () => {
    window.history.pushState({}, "", `/booking?doctorId=${doctor.id}`);

    render(<PublicBookingPage />);

    expect(await screen.findByText(/selected doctor:/i)).toHaveTextContent("Dr. Lan Tran");
    await waitFor(() => {
      expect(listDoctorSlots).toHaveBeenCalledWith(doctor.id, expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    });
  });

  it("ignores unknown requested doctor ids from the query string", async () => {
    window.history.pushState({}, "", "/booking?doctorId=missing-doctor");

    render(<PublicBookingPage />);

    expect(await screen.findByLabelText("Doctor")).toHaveValue("");
    expect(screen.getByText(/select a doctor to load real available slots/i)).toBeInTheDocument();
    expect(listDoctorSlots).not.toHaveBeenCalled();
  });

  it("shows doctor loading errors without static fallback doctors", async () => {
    vi.mocked(listDoctors).mockRejectedValueOnce(new Error("Doctors unavailable"));

    render(<PublicBookingPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Doctors unavailable");
    expect(screen.queryByText("Dr. Lan Tran")).not.toBeInTheDocument();
  });

  it("shows unknown doctor loading errors with the default copy", async () => {
    vi.mocked(listDoctors).mockRejectedValueOnce("network down");

    render(<PublicBookingPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load doctors.");
  });

  it("handles doctor clearing and empty slot responses", async () => {
    vi.mocked(listDoctorSlots).mockResolvedValueOnce([]);

    render(<PublicBookingPage />);

    await userEvent.selectOptions(await screen.findByLabelText("Doctor"), doctor.id);
    expect(await screen.findByText(/no available slots/i)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Doctor"), "");
    expect(screen.getByText(/select a doctor to load real available slots/i)).toBeInTheDocument();
  });

  it("shows slot loading errors and keeps the form usable", async () => {
    vi.mocked(listDoctorSlots).mockRejectedValueOnce(new Error("Slots unavailable"));

    render(<PublicBookingPage />);

    await userEvent.selectOptions(await screen.findByLabelText("Doctor"), doctor.id);

    expect(await screen.findByRole("alert")).toHaveTextContent("Slots unavailable");
    expect(screen.getByText(/no available slots/i)).toBeInTheDocument();
  });

  it("shows default slot loading errors for non-error rejections", async () => {
    vi.mocked(listDoctorSlots).mockRejectedValueOnce("network down");

    render(<PublicBookingPage />);

    await userEvent.selectOptions(await screen.findByLabelText("Doctor"), doctor.id);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load doctor slots.");
  });

  it("requires a selected doctor and slot before submitting", async () => {
    render(<PublicBookingPage />);

    await screen.findByLabelText("Doctor");
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Select a doctor and an available appointment slot before submitting.",
    );
    expect(createPublicAppointment).not.toHaveBeenCalled();
  });

  it("requires all patient, contact, address, and symptom fields", async () => {
    render(<PublicBookingPage />);

    await userEvent.selectOptions(await screen.findByLabelText("Doctor"), doctor.id);
    await userEvent.click(await screen.findByRole("button", { name: "09:00 - 09:30" }));
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Complete all required patient, contact, address, and symptom fields.",
    );
    expect(createPublicAppointment).not.toHaveBeenCalled();
  });

  it("validates CCCD format before creating an appointment", async () => {
    render(<PublicBookingPage />);

    await completeRequiredForm();
    fireEvent.change(screen.getByLabelText(/patient cccd/i), {
      target: { value: "123" },
    });
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Patient CCCD must be exactly 12 digits.",
    );
    expect(createPublicAppointment).not.toHaveBeenCalled();
  });

  it("uses default submit error copy for non-error failures", async () => {
    vi.mocked(createPublicAppointment).mockRejectedValueOnce("network down");

    render(<PublicBookingPage />);

    await completeRequiredForm();
    await userEvent.click(screen.getByRole("button", { name: /confirm appointment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to submit booking request.",
    );
    await waitFor(() => {
      expect(listDoctorSlots).toHaveBeenCalledTimes(2);
    });
  });
});
