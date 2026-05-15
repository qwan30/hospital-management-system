import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminSlotsPage from "../page";
import {
  blockAdminSlot,
  deleteAdminSlot,
  generateAdminSlots,
  listAdminSlots,
  listAdminUsers,
  type AdminSlotResponse,
  type AdminUserResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    blockAdminSlot: vi.fn(),
    deleteAdminSlot: vi.fn(),
    generateAdminSlots: vi.fn(),
    listAdminSlots: vi.fn(),
    listAdminUsers: vi.fn(),
  };
});

const users: AdminUserResponse[] = [
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
];

const slots: AdminSlotResponse[] = [
  {
    id: "slot-1",
    doctorId: "doctor-1",
    doctorName: "Dr. Nguyen",
    slotDate: "2026-05-20",
    startTime: "08:00",
    endTime: "08:30",
    status: "AVAILABLE",
  },
  {
    id: "slot-2",
    doctorId: "doctor-1",
    doctorName: "Dr. Nguyen",
    slotDate: "2026-05-20",
    startTime: "08:30",
    endTime: "09:00",
    status: "BOOKED",
  },
];

describe("AdminSlotsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminSlots).mockResolvedValue(slots);
    vi.mocked(listAdminUsers).mockResolvedValue(users);
    vi.mocked(generateAdminSlots).mockResolvedValue({
      slotsCreated: 2,
      slotsSkipped: 1,
      summary: "Slot generation complete",
    });
    vi.mocked(blockAdminSlot).mockResolvedValue({ ...slots[0], status: "BLOCKED" });
    vi.mocked(deleteAdminSlot).mockResolvedValue(null);
  });

  it("loads real slots and doctors without static fallback rows", async () => {
    render(<AdminSlotsPage />);

    expect(screen.getByText(/loading time slots/i)).toBeInTheDocument();
    expect(await screen.findAllByText("Dr. Nguyen")).not.toHaveLength(0);
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Static")).not.toBeInTheDocument();
    expect(listAdminSlots).toHaveBeenCalledOnce();
    expect(listAdminUsers).toHaveBeenCalledOnce();
  });

  it("filters slots by status and search text", async () => {
    render(<AdminSlotsPage />);

    await screen.findByText("08:00");
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "BOOKED" },
    });

    expect(screen.getByText("08:30")).toBeInTheDocument();
    expect(screen.queryByText("08:00")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: /search time slots/i }), {
      target: { value: "missing" },
    });

    expect(screen.getByText(/no time slots match/i)).toBeInTheDocument();
  });

  it("generates slots with nullable doctor ID and real dates", async () => {
    render(<AdminSlotsPage />);

    await screen.findByText("08:00");
    fireEvent.change(screen.getByLabelText("Doctor"), {
      target: { value: "doctor-1" },
    });
    fireEvent.change(screen.getByLabelText("From Date"), {
      target: { value: "2026-05-20" },
    });
    fireEvent.change(screen.getByLabelText("To Date"), {
      target: { value: "2026-05-21" },
    });
    await userEvent.click(screen.getByRole("button", { name: /generate slots/i }));

    await waitFor(() => {
      expect(generateAdminSlots).toHaveBeenCalledWith({
        doctorId: "doctor-1",
        fromDate: "2026-05-20",
        toDate: "2026-05-21",
      });
    });
  });

  it("blocks and deletes only supported real slots", async () => {
    render(<AdminSlotsPage />);

    await screen.findByText("08:00");
    await userEvent.click(screen.getAllByRole("button", { name: "Block" })[0]);

    await waitFor(() => {
      expect(blockAdminSlot).toHaveBeenCalledWith("slot-1");
    });

    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => {
      expect(deleteAdminSlot).toHaveBeenCalledWith("slot-1");
    });

    expect(screen.getAllByRole("button", { name: "Block" })[1]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Delete" })[1]).toBeDisabled();
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminSlots).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminSlotsPage />);

    expect(await screen.findByText(/no time slots match/i)).toBeInTheDocument();

    unmount();
    vi.mocked(listAdminSlots).mockRejectedValueOnce(new Error("Slot access denied"));

    render(<AdminSlotsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Slot access denied");
  });
});
