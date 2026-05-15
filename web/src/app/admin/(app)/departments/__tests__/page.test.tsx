import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDepartmentsPage from "../page";
import {
  createAdminDepartment,
  deactivateAdminDepartment,
  listAdminDepartments,
  updateAdminDepartment,
  type AdminDepartmentResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createAdminDepartment: vi.fn(),
    deactivateAdminDepartment: vi.fn(),
    listAdminDepartments: vi.fn(),
    updateAdminDepartment: vi.fn(),
  };
});

const departments: AdminDepartmentResponse[] = [
  {
    departmentId: "department-1",
    name: "Cardiology",
    description: "Heart care",
    imageUrl: null,
    phone: "0900000000",
    active: true,
  },
  {
    departmentId: "department-2",
    name: "Neurology",
    description: "Brain care",
    imageUrl: null,
    phone: null,
    active: false,
  },
];

describe("AdminDepartmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminDepartments).mockResolvedValue(departments);
    vi.mocked(createAdminDepartment).mockResolvedValue(departments[0]);
    vi.mocked(updateAdminDepartment).mockResolvedValue({ ...departments[0], name: "Cardiology Updated" });
    vi.mocked(deactivateAdminDepartment).mockResolvedValue(null);
  });

  it("loads real departments without static fallback rows", async () => {
    render(<AdminDepartmentsPage />);

    expect(screen.getByText(/loading departments/i)).toBeInTheDocument();
    expect(await screen.findByText("Cardiology")).toBeInTheDocument();
    expect(screen.getByText("Neurology")).toBeInTheDocument();
    expect(screen.queryByText("Cardiology Center")).not.toBeInTheDocument();
    expect(listAdminDepartments).toHaveBeenCalledOnce();
  });

  it("filters departments locally by search text", async () => {
    render(<AdminDepartmentsPage />);

    await screen.findByText("Cardiology");
    fireEvent.change(screen.getByRole("searchbox", { name: /search departments/i }), {
      target: { value: "neuro" },
    });

    expect(screen.getByText("Neurology")).toBeInTheDocument();
    expect(screen.queryByText("Cardiology")).not.toBeInTheDocument();
  });

  it("creates and updates departments with the backend request shape", async () => {
    render(<AdminDepartmentsPage />);

    await screen.findByText("Cardiology");
    await userEvent.click(screen.getByRole("button", { name: /add department/i }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Radiology" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Imaging" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save department/i }));

    await waitFor(() => {
      expect(createAdminDepartment).toHaveBeenCalledWith({
        name: "Radiology",
        description: "Imaging",
        imageUrl: null,
        phone: null,
        active: true,
      });
    });

    await userEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Cardiology Updated" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save department/i }));

    await waitFor(() => {
      expect(updateAdminDepartment).toHaveBeenCalledWith(
        "department-1",
        expect.objectContaining({ name: "Cardiology Updated" }),
      );
    });
  });

  it("deactivates departments by real ID", async () => {
    render(<AdminDepartmentsPage />);

    await screen.findByText("Cardiology");
    await userEvent.click(screen.getAllByRole("button", { name: "Deactivate" })[0]);

    await waitFor(() => {
      expect(deactivateAdminDepartment).toHaveBeenCalledWith("department-1");
    });
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminDepartments).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminDepartmentsPage />);

    expect(await screen.findByText(/no departments match/i)).toBeInTheDocument();
    expect(screen.queryByText("Cardiology Center")).not.toBeInTheDocument();

    unmount();
    vi.mocked(listAdminDepartments).mockRejectedValueOnce(new Error("Department access denied"));

    render(<AdminDepartmentsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Department access denied");
  });
});
