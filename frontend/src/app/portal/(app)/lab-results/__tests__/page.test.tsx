import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientLabResultsPage from "../page";
import {
  listPatientPortalLabResults,
  type PatientPortalLabResultResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    listPatientPortalLabResults: vi.fn(),
  };
});

const labResult: PatientPortalLabResultResponse = {
  labResultId: "lab-1",
  appointmentId: "appointment-1",
  testName: "Complete Blood Count",
  status: "FINAL",
  resultSummary: "Within expected range",
  doctorComment: "Continue current care plan",
  attachmentUrl: "/files/cbc.pdf",
  collectedAt: "2026-05-15T09:00:00Z",
};

describe("PatientLabResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listPatientPortalLabResults).mockResolvedValue([labResult]);
  });

  it("loads real lab results and attachment links without static fallback", async () => {
    render(<PatientLabResultsPage />);

    expect(screen.getByText(/loading patient lab results/i)).toBeInTheDocument();
    expect(await screen.findByText("Complete Blood Count")).toBeInTheDocument();
    expect(screen.getByText("Within expected range")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view attachment/i })).toHaveAttribute(
      "href",
      "/files/cbc.pdf",
    );
    expect(screen.queryByText("Glucose, Serum")).not.toBeInTheDocument();
  });

  it("shows an honest empty state", async () => {
    vi.mocked(listPatientPortalLabResults).mockResolvedValueOnce([]);

    render(<PatientLabResultsPage />);

    expect(await screen.findByText(/no lab results are available/i)).toBeInTheDocument();
    expect(screen.queryByText("Creatinine, Serum")).not.toBeInTheDocument();
  });

  it("shows API errors without mock fallback", async () => {
    vi.mocked(listPatientPortalLabResults).mockRejectedValueOnce(
      new Error("Patient lab access denied"),
    );

    render(<PatientLabResultsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Patient lab access denied");
    expect(screen.queryByText("Glucose, Serum")).not.toBeInTheDocument();
  });
});
