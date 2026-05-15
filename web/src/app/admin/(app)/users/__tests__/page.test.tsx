import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUsersPage from "../page";
import {
  activateAdminUser,
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    activateAdminUser: vi.fn(),
    createAdminUser: vi.fn(),
    deactivateAdminUser: vi.fn(),
    listAdminUsers: vi.fn(),
    updateAdminUser: vi.fn(),
  };
});

const users: AdminUserResponse[] = [
  {
    userId: "user-1",
    email: "linh.doctor@example.com",
    fullName: "Linh Doctor",
    phone: "0900000000",
    role: "DOCTOR",
    departmentId: "department-1",
    departmentName: "Cardiology",
    specialty: "Cardiology",
    qualification: "MD",
    experienceYears: 8,
    active: true,
  },
  {
    userId: "user-2",
    email: "minh.admin@example.com",
    fullName: "Minh Admin",
    phone: null,
    role: "ADMIN",
    departmentId: null,
    departmentName: null,
    specialty: null,
    qualification: null,
    experienceYears: null,
    active: false,
  },
];

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminUsers).mockResolvedValue(users);
    vi.mocked(createAdminUser).mockResolvedValue(users[0]);
    vi.mocked(updateAdminUser).mockResolvedValue({ ...users[0], fullName: "Updated Doctor" });
    vi.mocked(activateAdminUser).mockResolvedValue({ ...users[1], active: true });
    vi.mocked(deactivateAdminUser).mockResolvedValue({ ...users[0], active: false });
  });

  it("loads real admin users without static fallback rows", async () => {
    render(<AdminUsersPage />);

    expect(screen.getByText(/loading staff users/i)).toBeInTheDocument();
    expect(await screen.findByText("Linh Doctor")).toBeInTheDocument();
    expect(screen.getByText("Minh Admin")).toBeInTheDocument();
    expect(screen.queryByText("Sarah Kingston")).not.toBeInTheDocument();
    expect(listAdminUsers).toHaveBeenCalledOnce();
  });

  it("filters users locally by search, role, and status", async () => {
    render(<AdminUsersPage />);

    await screen.findByText("Linh Doctor");
    fireEvent.change(screen.getByRole("searchbox", { name: /search users/i }), {
      target: { value: "minh" },
    });

    expect(screen.getByText("Minh Admin")).toBeInTheDocument();
    expect(screen.queryByText("Linh Doctor")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/filter users by role/i), {
      target: { value: "DOCTOR" },
    });

    expect(screen.getByText(/no staff users match/i)).toBeInTheDocument();
  });

  it("creates a user with the backend request shape", async () => {
    render(<AdminUsersPage />);

    await screen.findByText("Linh Doctor");
    await userEvent.click(screen.getByRole("button", { name: /add user/i }));
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "New Doctor" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new.doctor@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "DOCTOR" },
    });
    fireEvent.change(screen.getByLabelText("Experience Years"), {
      target: { value: "5" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save user/i }));

    await waitFor(() => {
      expect(createAdminUser).toHaveBeenCalledWith({
        email: "new.doctor@example.com",
        password: "password123",
        fullName: "New Doctor",
        phone: null,
        role: "DOCTOR",
        departmentId: null,
        specialty: null,
        qualification: null,
        experienceYears: 5,
        active: true,
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
    expect(listAdminUsers).toHaveBeenCalledTimes(2);
  });

  it("updates and toggles a real admin user", async () => {
    render(<AdminUsersPage />);

    await screen.findByText("Linh Doctor");
    await userEvent.click(screen.getAllByText("edit")[0].closest("button")!);
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Updated Doctor" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save user/i }));

    await waitFor(() => {
      expect(updateAdminUser).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          fullName: "Updated Doctor",
          password: null,
        }),
      );
    });

    await userEvent.click(screen.getByRole("button", { name: "Deactivate" }));

    await waitFor(() => {
      expect(deactivateAdminUser).toHaveBeenCalledWith("user-1");
    });
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminUsers).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminUsersPage />);

    expect(await screen.findByText(/no staff users match/i)).toBeInTheDocument();
    expect(screen.queryByText("Sarah Kingston")).not.toBeInTheDocument();

    unmount();
    vi.mocked(listAdminUsers).mockRejectedValueOnce(new Error("Admin access denied"));

    render(<AdminUsersPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Admin access denied");
  });
});
