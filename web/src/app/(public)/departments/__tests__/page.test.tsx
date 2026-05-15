import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicDepartmentsPage from "../page";
import { listDepartments, type DepartmentResponse } from "@/lib/public-api";

vi.mock("@/lib/public-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/public-api")>(
    "@/lib/public-api",
  );

  return {
    ...actual,
    listDepartments: vi.fn(),
  };
});

const cardiology: DepartmentResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Cardiology",
  description: "Heart and vascular care",
  imageUrl: null,
  phone: "+84900000001",
};

const neurology: DepartmentResponse = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Neurology",
  description: "Brain and nervous system care",
  imageUrl: null,
  phone: null,
};

describe("PublicDepartmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listDepartments).mockResolvedValue([cardiology, neurology]);
  });

  it("loads departments from the public API and links detail to real department ids", async () => {
    render(<PublicDepartmentsPage />);

    expect(screen.getByText(/loading departments from the hospital system/i)).toBeInTheDocument();
    expect(await screen.findByText("Cardiology")).toBeInTheDocument();
    expect(screen.getByText("Neurology")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /explore department/i })[0]).toHaveAttribute(
      "href",
      "/departments/11111111-1111-1111-1111-111111111111",
    );
    expect(screen.queryByText("Diagnostic Engineering")).not.toBeInTheDocument();
  });

  it("filters loaded departments without showing static fallback cards", async () => {
    render(<PublicDepartmentsPage />);

    expect(await screen.findByText("Cardiology")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox", { name: /search departments/i }), "brain");

    expect(screen.getByText("Neurology")).toBeInTheDocument();
    expect(screen.queryByText("Cardiology")).not.toBeInTheDocument();
    expect(screen.queryByText("Revenue Cycle")).not.toBeInTheDocument();
  });

  it("shows API errors and retries without mock departments", async () => {
    vi.mocked(listDepartments)
      .mockRejectedValueOnce(new Error("Department API unavailable"))
      .mockResolvedValueOnce([cardiology]);

    render(<PublicDepartmentsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Department API unavailable");
    expect(screen.queryByText("Diagnostic Engineering")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => expect(listDepartments).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Cardiology")).toBeInTheDocument();
  });

  it("shows an honest empty state when no departments are returned", async () => {
    vi.mocked(listDepartments).mockResolvedValueOnce([]);

    render(<PublicDepartmentsPage />);

    expect(await screen.findByText(/no departments found/i)).toBeInTheDocument();
    expect(screen.queryByText("Surgical Suite")).not.toBeInTheDocument();
  });
});
