import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminRoomsPage from "../page";
import {
  createAdminRoom,
  deactivateAdminRoom,
  listAdminRooms,
  updateAdminRoom,
  updateAdminRoomStatus,
  type AdminRoomResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createAdminRoom: vi.fn(),
    deactivateAdminRoom: vi.fn(),
    listAdminRooms: vi.fn(),
    updateAdminRoom: vi.fn(),
    updateAdminRoomStatus: vi.fn(),
  };
});

const rooms: AdminRoomResponse[] = [
  {
    roomId: "room-1",
    name: "RM-101",
    departmentId: "department-1",
    departmentName: "Cardiology",
    status: "READY",
    active: true,
  },
  {
    roomId: "room-2",
    name: "RM-202",
    departmentId: "department-2",
    departmentName: "Neurology",
    status: "IN_USE",
    active: true,
  },
];

describe("AdminRoomsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminRooms).mockResolvedValue(rooms);
    vi.mocked(createAdminRoom).mockResolvedValue(rooms[0]);
    vi.mocked(updateAdminRoom).mockResolvedValue({ ...rooms[0], name: "RM-102" });
    vi.mocked(updateAdminRoomStatus).mockResolvedValue({ ...rooms[0], status: "MAINTENANCE" });
    vi.mocked(deactivateAdminRoom).mockResolvedValue(null);
  });

  it("loads real rooms without static fallback rows", async () => {
    render(<AdminRoomsPage />);

    expect(screen.getByText(/loading rooms/i)).toBeInTheDocument();
    expect(await screen.findAllByText("RM-101")).toHaveLength(2);
    expect(screen.getByText("RM-202")).toBeInTheDocument();
    expect(screen.queryByText("RM-402-A")).not.toBeInTheDocument();
    expect(screen.queryByText("Jonathan Doe")).not.toBeInTheDocument();
    expect(listAdminRooms).toHaveBeenCalledOnce();
  });

  it("filters rooms by status and department", async () => {
    render(<AdminRoomsPage />);

    await screen.findAllByText("RM-101");
    fireEvent.change(screen.getByLabelText(/filter rooms by status/i), {
      target: { value: "IN_USE" },
    });

    expect(screen.getAllByText("RM-202")).toHaveLength(2);
    expect(screen.queryByText("RM-101")).not.toBeInTheDocument();
  });

  it("creates and updates rooms with the backend request shape", async () => {
    render(<AdminRoomsPage />);

    await screen.findAllByText("RM-101");
    await userEvent.click(screen.getByRole("button", { name: /add room/i }));
    fireEvent.change(screen.getByLabelText("Room Name"), {
      target: { value: "RM-303" },
    });
    fireEvent.change(screen.getByLabelText("Department ID"), {
      target: { value: "department-3" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save room/i }));

    await waitFor(() => {
      expect(createAdminRoom).toHaveBeenCalledWith({
        name: "RM-303",
        departmentId: "department-3",
        status: "READY",
        active: true,
      });
    });

    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.change(screen.getByLabelText("Room Name"), {
      target: { value: "RM-102" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save room/i }));

    await waitFor(() => {
      expect(updateAdminRoom).toHaveBeenCalledWith(
        "room-1",
        expect.objectContaining({ name: "RM-102" }),
      );
    });
  });

  it("updates room status and deactivates by real room ID", async () => {
    render(<AdminRoomsPage />);

    await screen.findAllByText("RM-101");
    await userEvent.click(screen.getByRole("button", { name: "MAINTENANCE" }));

    await waitFor(() => {
      expect(updateAdminRoomStatus).toHaveBeenCalledWith("room-1", "MAINTENANCE");
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    await userEvent.click(screen.getByRole("button", { name: /deactivate room/i }));

    await waitFor(() => {
      expect(deactivateAdminRoom).toHaveBeenCalledWith("room-1");
    });
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("Confirm deactivation"));
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminRooms).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminRoomsPage />);

    expect(await screen.findByText(/no rooms match/i)).toBeInTheDocument();
    expect(screen.queryByText("RM-402-A")).not.toBeInTheDocument();

    unmount();
    vi.mocked(listAdminRooms).mockRejectedValueOnce(new Error("Room access denied"));

    render(<AdminRoomsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Room access denied");
  });
});
