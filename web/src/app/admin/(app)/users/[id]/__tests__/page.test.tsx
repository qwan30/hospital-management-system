import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminUserDetailEditPage from "../page";
import {
  activateAdminUser,
  deactivateAdminUser,
  getAdminUser,
  updateAdminUser,
  type AdminUserResponse,
} from "@/lib/operations-api";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "user-1" }),
}));

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    activateAdminUser: vi.fn(),
    deactivateAdminUser: vi.fn(),
    getAdminUser: vi.fn(),
    updateAdminUser: vi.fn(),
  };
});

const user: AdminUserResponse = {
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
};

describe("AdminUserDetailEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminUser).mockResolvedValue(user);
    vi.mocked(updateAdminUser).mockResolvedValue({ ...user, fullName: "Updated Doctor" });
    vi.mocked(deactivateAdminUser).mockResolvedValue({ ...user, active: false });
    vi.mocked(activateAdminUser).mockResolvedValue({ ...user, active: true });
  });

  it("loads a real admin user detail without static fallback rows", async () => {
    render(<AdminUserDetailEditPage />);

    expect(screen.getByText(/loading admin user/i)).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Linh Doctor")).toBeInTheDocument();
    expect(screen.getByText("Cardiology")).toBeInTheDocument();
    expect(screen.queryByText("Sarah Jenkins")).not.toBeInTheDocument();
    expect(getAdminUser).toHaveBeenCalledWith("user-1");
  });

  it("updates the selected user with the backend request shape", async () => {
    render(<AdminUserDetailEditPage />);

    fireEvent.change(await screen.findByLabelText("Full Name"), {
      target: { value: "Updated Doctor" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save user/i }));

    await waitFor(() => {
      expect(updateAdminUser).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          fullName: "Updated Doctor",
          email: "linh.doctor@example.com",
          password: null,
          role: "DOCTOR",
        }),
      );
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/updated/i);
  });

  it("toggles the selected user status by real ID", async () => {
    render(<AdminUserDetailEditPage />);

    await screen.findByDisplayValue("Linh Doctor");
    await userEvent.click(screen.getByRole("button", { name: /deactivate user/i }));

    await waitFor(() => {
      expect(deactivateAdminUser).toHaveBeenCalledWith("user-1");
    });
  });

  it("shows API errors without static fallback", async () => {
    vi.mocked(getAdminUser).mockRejectedValueOnce(new Error("User access denied"));

    render(<AdminUserDetailEditPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("User access denied");
    expect(screen.queryByText("Sarah Jenkins")).not.toBeInTheDocument();
  });
});
