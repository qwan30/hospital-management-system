import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminScheduleTemplatesPage from "../page";
import {
  createAdminScheduleTemplate,
  listAdminScheduleTemplates,
  listAdminUsers,
  updateAdminScheduleTemplate,
  type AdminUserResponse,
  type DoctorScheduleTemplateResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createAdminScheduleTemplate: vi.fn(),
    listAdminScheduleTemplates: vi.fn(),
    listAdminUsers: vi.fn(),
    updateAdminScheduleTemplate: vi.fn(),
  };
});

const doctors: AdminUserResponse[] = [
  {
    userId: "doctor-1",
    email: "doctor@example.com",
    fullName: "Dr. Nguyen",
    phone: null,
    role: "DOCTOR",
    departmentId: "department-1",
    departmentName: "Cardiology",
    specialty: "Cardiology",
    qualification: null,
    experienceYears: 10,
    active: true,
  },
  {
    userId: "admin-1",
    email: "admin@example.com",
    fullName: "Admin User",
    phone: null,
    role: "ADMIN",
    departmentId: null,
    departmentName: null,
    specialty: null,
    qualification: null,
    experienceYears: null,
    active: true,
  },
];

const templates: DoctorScheduleTemplateResponse[] = [
  {
    templateId: "template-1",
    doctorId: "doctor-1",
    doctorName: "Dr. Nguyen",
    weekday: 1,
    startTime: "08:00",
    endTime: "12:00",
    slotDurationMinutes: 30,
    active: true,
  },
];

describe("AdminScheduleTemplatesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminUsers).mockResolvedValue(doctors);
    vi.mocked(listAdminScheduleTemplates).mockResolvedValue(templates);
    vi.mocked(createAdminScheduleTemplate).mockResolvedValue(templates[0]);
    vi.mocked(updateAdminScheduleTemplate).mockResolvedValue({ ...templates[0], weekday: 2 });
  });

  it("loads real schedule templates and doctors without static fallback rows", async () => {
    render(<AdminScheduleTemplatesPage />);

    expect(screen.getByText(/loading schedule templates/i)).toBeInTheDocument();
    expect(await screen.findByText("Dr. Nguyen")).toBeInTheDocument();
    expect(screen.getByText("Monday")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Static")).not.toBeInTheDocument();
    expect(listAdminScheduleTemplates).toHaveBeenCalledOnce();
    expect(listAdminUsers).toHaveBeenCalledOnce();
  });

  it("filters templates by doctor or weekday", async () => {
    render(<AdminScheduleTemplatesPage />);

    await screen.findByText("Dr. Nguyen");
    fireEvent.change(screen.getByRole("searchbox", { name: /search schedule templates/i }), {
      target: { value: "tuesday" },
    });

    expect(screen.getByText(/no schedule templates match/i)).toBeInTheDocument();
  });

  it("creates and updates templates with real doctor IDs", async () => {
    render(<AdminScheduleTemplatesPage />);

    await screen.findByText("Dr. Nguyen");
    await userEvent.click(screen.getByRole("button", { name: /add template/i }));
    fireEvent.change(screen.getByLabelText("Weekday"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Start Time"), {
      target: { value: "09:00" },
    });
    fireEvent.change(screen.getByLabelText("End Time"), {
      target: { value: "13:00" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save template/i }));

    await waitFor(() => {
      expect(createAdminScheduleTemplate).toHaveBeenCalledWith({
        doctorId: "doctor-1",
        weekday: 2,
        startTime: "09:00",
        endTime: "13:00",
        slotDurationMinutes: 30,
        active: true,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Weekday"), {
      target: { value: "2" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save template/i }));

    await waitFor(() => {
      expect(updateAdminScheduleTemplate).toHaveBeenCalledWith(
        "template-1",
        expect.objectContaining({ doctorId: "doctor-1", weekday: 2 }),
      );
    });
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminScheduleTemplates).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminScheduleTemplatesPage />);

    expect(await screen.findByText(/no schedule templates match/i)).toBeInTheDocument();

    unmount();
    vi.mocked(listAdminScheduleTemplates).mockRejectedValueOnce(new Error("Schedule access denied"));

    render(<AdminScheduleTemplatesPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Schedule access denied");
  });
});
