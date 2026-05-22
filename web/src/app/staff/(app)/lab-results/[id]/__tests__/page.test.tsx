import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LabResultDetailPage from "../page";
import {
  getLabResult,
  deleteLabResult,
  type LabResultResponse,
} from "@/lib/clinical-api";

vi.mock("@/lib/clinical-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/clinical-api")>(
    "@/lib/clinical-api",
  );

  return {
    ...actual,
    getLabResult: vi.fn(),
    deleteLabResult: vi.fn(),
  };
});

vi.mock("@/lib/use-stored-role", () => ({
  useStoredRole: vi.fn(() => "DOCTOR"),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => "/staff/lab-results/lr-1"),
  useParams: vi.fn(() => ({ id: "lr-1" })),
}));

const mockResult: LabResultResponse = {
  labResultId: "lr-1",
  appointmentId: "appt-1",
  testName: "Complete Blood Count",
  status: "Reviewed",
  resultSummary: "Hemoglobin within normal range.",
  doctorComment: "Continue current treatment.",
  attachmentUrl: "https://example.test/cbc.pdf",
  collectedAt: "2026-05-15T08:00:00Z",
};

describe("LabResultDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLabResult).mockResolvedValue(mockResult);
  });

  it("shows loading state initially", async () => {
    render(<LabResultDetailPage />);
    expect(screen.getByText(/loading lab result/i)).toBeInTheDocument();
    await screen.findByText("Hemoglobin within normal range.");
  });

  it("renders lab result details after loading", async () => {
    render(<LabResultDetailPage />);

    expect((await screen.findAllByText("Complete Blood Count"))[0]).toBeInTheDocument();
    expect(screen.getByText("Hemoglobin within normal range.")).toBeInTheDocument();
    expect(screen.getByText(/Continue current treatment/i)).toBeInTheDocument();
    expect(getLabResult).toHaveBeenCalledWith("lr-1");
  });

  it("renders attachment link when attachmentUrl is present", async () => {
    render(<LabResultDetailPage />);

    expect(await screen.findByText("View Attachment")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /view attachment/i });
    expect(link).toHaveAttribute("href", "https://example.test/cbc.pdf");
  });

  it("shows delete button for DOCTOR role", async () => {
    render(<LabResultDetailPage />);

    expect(await screen.findByRole("button", { name: /delete result/i })).toBeInTheDocument();
  });

  it("shows error state when lab result is not found", async () => {
    vi.mocked(getLabResult).mockRejectedValue(new Error("Lab result not found"));

    render(<LabResultDetailPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Lab result not found");
  });

  it("renders result metadata panel", async () => {
    render(<LabResultDetailPage />);

    expect(await screen.findByText("Result Metadata")).toBeInTheDocument();
    expect(screen.getByText("lr-1")).toBeInTheDocument();
    expect(screen.getAllByText("Reviewed")[0]).toBeInTheDocument();
  });

  it("calls deleteLabResult on delete confirmation", async () => {
    vi.mocked(deleteLabResult).mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    // Mock window.location to prevent navigation error
    const locationSpy = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "/staff/lab-results",
    } as Location);
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, href: "" },
    });

    render(<LabResultDetailPage />);

    const deleteBtn = await screen.findByRole("button", { name: /delete result/i });
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteLabResult).toHaveBeenCalledWith("lr-1");
    });

    locationSpy.mockRestore();
  });
});
