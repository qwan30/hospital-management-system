import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RevenueDashboardPage from "../page";
import {
  getDailyRevenueReport,
  getMonthlyRevenueReport,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    getDailyRevenueReport: vi.fn(),
    getMonthlyRevenueReport: vi.fn(),
  };
});

const dailyReport = {
  date: "2026-05-01",
  totalRevenue: 1000,
  paidInvoiceCount: 4,
  departmentBreakdown: [
    { departmentName: "Cardiology", totalRevenue: 700, invoiceCount: 3 },
    { departmentName: "Neurology", totalRevenue: 300, invoiceCount: 1 },
  ],
};

const monthlyReport = {
  month: "2026-05",
  totalRevenue: 4000,
  paidInvoiceCount: 10,
};

describe("RevenueDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDailyRevenueReport).mockResolvedValue(dailyReport);
    vi.mocked(getMonthlyRevenueReport).mockResolvedValue(monthlyReport);
  });

  it("loads the daily revenue report without static fallback data", async () => {
    render(<RevenueDashboardPage />);

    expect(screen.getByText(/loading revenue report/i)).toBeInTheDocument();
    expect(await screen.findByText("Cardiology")).toBeInTheDocument();
    expect(screen.getByText("Neurology")).toBeInTheDocument();
    expect(screen.getByText("$1,000")).toBeInTheDocument();
    expect(screen.queryByText("CARDIOLOGY_UNIT")).not.toBeInTheDocument();
    expect(getDailyRevenueReport).toHaveBeenCalledOnce();
  });

  it("loads monthly revenue when the mode changes", async () => {
    render(<RevenueDashboardPage />);

    await screen.findByText("Cardiology");
    await userEvent.click(screen.getByRole("button", { name: "MONTHLY" }));

    await waitFor(() => {
      expect(getMonthlyRevenueReport).toHaveBeenCalledOnce();
    });
    expect(await screen.findByText("$4,000")).toBeInTheDocument();
    expect(screen.getByText(/department breakdown is only returned/i)).toBeInTheDocument();
  });

  it("reloads when the selected daily date changes", async () => {
    render(<RevenueDashboardPage />);

    await screen.findByText("Cardiology");
    fireEvent.change(screen.getByLabelText(/revenue date/i), {
      target: { value: "2026-05-01" },
    });

    await waitFor(() => {
      expect(getDailyRevenueReport).toHaveBeenLastCalledWith("2026-05-01");
    });
  });

  it("shows empty and error states honestly", async () => {
    vi.mocked(getDailyRevenueReport).mockResolvedValueOnce({
      ...dailyReport,
      totalRevenue: 0,
      paidInvoiceCount: 0,
      departmentBreakdown: [],
    });

    const { unmount } = render(<RevenueDashboardPage />);

    expect(await screen.findByText(/no department revenue exists/i)).toBeInTheDocument();
    expect(screen.queryByText("CARDIOLOGY_UNIT")).not.toBeInTheDocument();

    unmount();

    vi.mocked(getDailyRevenueReport).mockRejectedValueOnce(new Error("Revenue access denied"));

    render(<RevenueDashboardPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Revenue access denied");
  });
});
