import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminSpecialClosuresPage from "../page";
import {
  createAdminSpecialClosure,
  listAdminRooms,
  listAdminSpecialClosures,
  listAdminUsers,
  updateAdminSpecialClosure,
  type AdminRoomResponse,
  type AdminUserResponse,
  type SpecialClosureResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createAdminSpecialClosure: vi.fn(),
    listAdminRooms: vi.fn(),
    listAdminSpecialClosures: vi.fn(),
    listAdminUsers: vi.fn(),
    updateAdminSpecialClosure: vi.fn(),
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

const rooms: AdminRoomResponse[] = [
  {
    roomId: "room-1",
    name: "RM-101",
    departmentId: "department-1",
    departmentName: "Cardiology",
    status: "READY",
    active: true,
  },
];

const closures: SpecialClosureResponse[] = [
  {
    closureId: "closure-1",
    title: "Doctor Leave",
    closureDate: "2026-05-20",
    doctorId: "doctor-1",
    doctorName: "Dr. Nguyen",
    roomId: null,
    roomName: null,
    reason: "Annual leave",
    active: true,
  },
];

describe("AdminSpecialClosuresPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminUsers).mockResolvedValue(users);
    vi.mocked(listAdminRooms).mockResolvedValue(rooms);
    vi.mocked(listAdminSpecialClosures).mockResolvedValue(closures);
    vi.mocked(createAdminSpecialClosure).mockResolvedValue(closures[0]);
    vi.mocked(updateAdminSpecialClosure).mockResolvedValue({ ...closures[0], title: "Doctor Leave Updated" });
  });

  it("loads real closures, doctors, and rooms without static fallback rows", async () => {
    render(<AdminSpecialClosuresPage />);

    expect(screen.getByText(/loading special closures/i)).toBeInTheDocument();
    expect(await screen.findByText("Doctor Leave")).toBeInTheDocument();
    expect(screen.getByText("Dr. Nguyen")).toBeInTheDocument();
    expect(screen.queryByText("Static Closure")).not.toBeInTheDocument();
    expect(listAdminSpecialClosures).toHaveBeenCalledOnce();
    expect(listAdminUsers).toHaveBeenCalledOnce();
    expect(listAdminRooms).toHaveBeenCalledOnce();
  });

  it("filters closures by search text", async () => {
    render(<AdminSpecialClosuresPage />);

    await screen.findByText("Doctor Leave");
    fireEvent.change(screen.getByRole("searchbox", { name: /search special closures/i }), {
      target: { value: "maintenance" },
    });

    expect(screen.getByText(/no special closures match/i)).toBeInTheDocument();
  });

  it("creates and updates closures with nullable real IDs", async () => {
    render(<AdminSpecialClosuresPage />);

    await screen.findByText("Doctor Leave");
    await userEvent.click(screen.getByRole("button", { name: /add closure/i }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Room Maintenance" },
    });
    fireEvent.change(screen.getByLabelText("Closure Date"), {
      target: { value: "2026-05-21" },
    });
    fireEvent.change(screen.getByLabelText("Room"), {
      target: { value: "room-1" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save closure/i }));

    await waitFor(() => {
      expect(createAdminSpecialClosure).toHaveBeenCalledWith({
        title: "Room Maintenance",
        closureDate: "2026-05-21",
        doctorId: null,
        roomId: "room-1",
        reason: null,
        active: true,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Doctor Leave Updated" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save closure/i }));

    await waitFor(() => {
      expect(updateAdminSpecialClosure).toHaveBeenCalledWith(
        "closure-1",
        expect.objectContaining({ title: "Doctor Leave Updated", doctorId: "doctor-1" }),
      );
    });
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminSpecialClosures).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminSpecialClosuresPage />);

    expect(await screen.findByText(/no special closures match/i)).toBeInTheDocument();

    unmount();
    vi.mocked(listAdminSpecialClosures).mockRejectedValueOnce(new Error("Closure access denied"));

    render(<AdminSpecialClosuresPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Closure access denied");
  });
});
