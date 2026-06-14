import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MedicalRecordEditorPage from "../page";
import {
  createMedicalRecord,
  getAppointmentDetail,
  type AppointmentDetailResponse,
} from "@/lib/medical-records-api";

const testAppointmentId = "11111111-1111-1111-1111-111111111111";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: testAppointmentId }),
}));

vi.mock("@/lib/medical-records-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/medical-records-api")>(
    "@/lib/medical-records-api",
  );

  return {
    ...actual,
    createMedicalRecord: vi.fn(),
    getAppointmentDetail: vi.fn(),
  };
});

const appointment: AppointmentDetailResponse = {
  appointmentId: testAppointmentId,
  confirmationCode: "HMS-1001",
  status: "IN_PROGRESS",
  appointmentDate: "2026-05-15",
  startTime: "09:00:00",
  endTime: "09:30:00",
  checkedInAt: "2026-05-15T08:55:00",
  aiDurationMinutes: 30,
  symptoms: "Fever",
  doctorId: "doctor-1",
  doctorName: "Dr. Lan Tran",
  patientId: "patient-1",
  patientFullName: "Nguyen Van A",
  patientPhone: "+84900000001",
  patientCccd: "012345678901",
  patientEmail: "patient@example.com",
  patientDateOfBirth: "1990-05-15",
  patientGender: "MALE",
};

describe("MedicalRecordEditorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAppointmentDetail).mockResolvedValue(appointment);
    vi.mocked(createMedicalRecord).mockResolvedValue({
      recordId: "record-1",
      appointmentId: testAppointmentId,
      diagnosis: "Seasonal allergy",
      clinicalNotes: "Improving",
      vitalSigns: { bloodPressure: "120/80", temperature: 37.2 },
      followUpDate: "2026-05-30",
      prescriptionItems: [],
      appointmentStatus: "DONE",
    });
  });

  it("loads real appointment and patient context without static fallback", async () => {
    render(<MedicalRecordEditorPage />);

    expect(screen.getByText(/loading appointment context/i)).toBeInTheDocument();
    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByText(/Case File:\s*HMS-1001/i)).toBeInTheDocument();
    expect(screen.queryByText("Kerrigan, Sarah")).not.toBeInTheDocument();
    expect(getAppointmentDetail).toHaveBeenCalledWith(testAppointmentId);
  });

  it("blocks submit until diagnosis is present", async () => {
    render(<MedicalRecordEditorPage />);

    await screen.findByText("Nguyen Van A");
    await userEvent.click(screen.getByRole("button", { name: /commit record/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Diagnosis is required");
    expect(createMedicalRecord).not.toHaveBeenCalled();
  });

  it("submits a real medical record payload for the route appointment id", async () => {
    render(<MedicalRecordEditorPage />);

    fireEvent.change(await screen.findByLabelText(/primary diagnosis/i), {
      target: { value: "Seasonal allergy" },
    });
    fireEvent.change(screen.getByLabelText(/clinical observation/i), {
      target: { value: "Improving after treatment" },
    });
    fireEvent.change(screen.getByPlaceholderText("120/80"), {
      target: { value: "120/80" },
    });
    fireEvent.change(screen.getByPlaceholderText("37.2"), {
      target: { value: "37.2" },
    });
    fireEvent.change(screen.getByLabelText("Medicine 1"), {
      target: { value: "Cetirizine" },
    });
    fireEvent.change(screen.getByLabelText("Dosage 1"), {
      target: { value: "10mg" },
    });
    await userEvent.click(screen.getByRole("button", { name: /commit record/i }));

    await waitFor(() =>
      expect(createMedicalRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: testAppointmentId,
          diagnosis: "Seasonal allergy",
          clinicalNotes: "Improving after treatment",
          vitalSigns: expect.objectContaining({
            bloodPressure: "120/80",
            temperature: 37.2,
          }),
          prescriptionItems: [
            expect.objectContaining({
              medicineName: "Cetirizine",
              dosage: "10mg",
              sortOrder: 0,
            }),
          ],
        }),
      ),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Medical record saved. Appointment status is now DONE.",
    );
  });

  it("shows backend duplicate or invalid-status errors honestly", async () => {
    vi.mocked(createMedicalRecord).mockRejectedValueOnce(
      new Error("Medical record already exists for this appointment"),
    );

    render(<MedicalRecordEditorPage />);

    fireEvent.change(await screen.findByLabelText(/primary diagnosis/i), {
      target: { value: "Seasonal allergy" },
    });
    await userEvent.click(screen.getByRole("button", { name: /commit record/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Medical record already exists for this appointment",
    );
  });

  it("disables save for unsupported appointment statuses", async () => {
    vi.mocked(getAppointmentDetail).mockResolvedValueOnce({
      ...appointment,
      status: "CONFIRMED",
    });

    render(<MedicalRecordEditorPage />);

    expect(await screen.findByText(/record creation blocked/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /commit record/i })).toBeDisabled();
  });

  it("shows a professional route error when appointment context is invalid", async () => {
    vi.mocked(getAppointmentDetail).mockRejectedValueOnce(new Error("Invalid request parameter"));

    render(<MedicalRecordEditorPage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Appointment context unavailable");
    expect(alert).not.toHaveTextContent("Invalid request parameter");
    expect(screen.getByRole("link", { name: /back to patient records/i })).toHaveAttribute(
      "href",
      "/staff/patients",
    );
  });
});
