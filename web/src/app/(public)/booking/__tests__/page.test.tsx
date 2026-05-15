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
});
