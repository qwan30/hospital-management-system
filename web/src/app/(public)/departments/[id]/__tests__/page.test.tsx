import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DepartmentDetailPage from "../page";
import { getDepartment } from "@/lib/public-api";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "11111111-1111-1111-1111-111111111111" }),
}));

vi.mock("@/lib/public-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/public-api")>(
    "@/lib/public-api",
  );

  return {
    ...actual,
    getDepartment: vi.fn(),
  };
});

describe("DepartmentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDepartment).mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      name: "Cardiology",
      description: "Heart and vascular care",
      imageUrl: null,
      phone: "+84900000001",
      activeDoctorCount: 1,
      doctors: [
        {
          id: "doctor-1",
          fullName: "Dr. Lan Tran",
          specialty: "Cardiology",
          qualification: "MD",
          experienceYears: 12,
          avatarUrl: null,
        },
      ],
    });
  });

  it("loads department detail and doctors by backend department id", async () => {
    render(<DepartmentDetailPage />);

    expect(screen.getByText(/loading department from the hospital system/i)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Cardiology" })).toBeInTheDocument();
    expect(screen.getByText("Dr. Lan Tran")).toBeInTheDocument();
    expect(screen.getByText("+84900000001")).toBeInTheDocument();
    expect(getDepartment).toHaveBeenCalledWith("11111111-1111-1111-1111-111111111111");
  });

  it("shows an honest unsupported/error state instead of static slug data", async () => {
    vi.mocked(getDepartment)
      .mockRejectedValueOnce(new Error("Department not found"))
      .mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
        name: "Cardiology",
        description: "Heart and vascular care",
        imageUrl: null,
        phone: null,
        activeDoctorCount: 0,
        doctors: [],
      });

    render(<DepartmentDetailPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Department not found");
    expect(screen.queryByText("Dr. Elena Rodriguez")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => expect(getDepartment).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole("heading", { name: "Cardiology" })).toBeInTheDocument();
  });
});
