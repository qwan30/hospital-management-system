import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicDoctorsPage from "../page";
import { listDoctors, type DoctorResponse } from "@/lib/public-api";

vi.mock("@/lib/public-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/public-api")>(
    "@/lib/public-api",
  );

  return {
    ...actual,
    listDoctors: vi.fn(),
  };
});

const cardiologyDoctor: DoctorResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  departmentId: "department-1",
  fullName: "Dr. Lan Tran",
  email: "lan.tran@example.com",
  specialty: "Cardiology",
  qualification: "Interventional Cardiology",
  experienceYears: 12,
};

const neurologyDoctor: DoctorResponse = {
  id: "22222222-2222-2222-2222-222222222222",
  departmentId: "department-2",
  fullName: "Dr. Minh Le",
  email: "minh.le@example.com",
  specialty: "Neurology",
  qualification: "Neurology",
  experienceYears: 9,
};

describe("PublicDoctorsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listDoctors).mockResolvedValue([cardiologyDoctor, neurologyDoctor]);
  });

  it("loads doctors from the public API and links booking to the real doctor id", async () => {
    render(<PublicDoctorsPage />);

    expect(screen.getByText(/loading doctors from the hospital system/i)).toBeInTheDocument();

    expect(await screen.findByText("Dr. Lan Tran")).toBeInTheDocument();
    expect(screen.getByText("Dr. Minh Le")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /check slots/i })[0]).toHaveAttribute(
      "href",
      "/booking?doctorId=11111111-1111-1111-1111-111111111111",
    );
    expect(listDoctors).toHaveBeenCalledTimes(1);
  });

  it("filters loaded doctors by search text without hardcoded fallback rows", async () => {
    render(<PublicDoctorsPage />);

    expect(await screen.findByText("Dr. Lan Tran")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("searchbox", { name: /search doctors/i }), "minh");

    expect(screen.getByText("Dr. Minh Le")).toBeInTheDocument();
    expect(screen.queryByText("Dr. Lan Tran")).not.toBeInTheDocument();
    expect(screen.queryByText("Dr. Alexander Vance")).not.toBeInTheDocument();
  });

  it("shows an honest empty state when the API returns no doctors", async () => {
    vi.mocked(listDoctors).mockResolvedValueOnce([]);

    render(<PublicDoctorsPage />);

    expect(await screen.findByText(/no doctors found/i)).toBeInTheDocument();
    expect(screen.queryByText("Dr. Alexander Vance")).not.toBeInTheDocument();
  });

  it("shows API errors and retries without falling back to static doctors", async () => {
    vi.mocked(listDoctors)
      .mockRejectedValueOnce(new Error("Backend unavailable"))
      .mockResolvedValueOnce([cardiologyDoctor]);

    render(<PublicDoctorsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Backend unavailable");
    expect(screen.queryByText("Dr. Alexander Vance")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => expect(listDoctors).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Dr. Lan Tran")).toBeInTheDocument();
  });
});
