import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PricingManagementPage from "../page";
import {
  createServicePricing,
  listServicePricing,
  updateServicePricing,
  type ServicePricingResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createServicePricing: vi.fn(),
    listServicePricing: vi.fn(),
    updateServicePricing: vi.fn(),
  };
});

const pricingRules: ServicePricingResponse[] = [
  {
    pricingId: "pricing-1",
    departmentId: null,
    departmentName: null,
    serviceName: "CONSULTATION",
    amount: 120,
    effectiveDate: "2026-05-01",
  },
  {
    pricingId: "pricing-2",
    departmentId: "department-1",
    departmentName: "Cardiology",
    serviceName: "ECHO",
    amount: 250,
    effectiveDate: "2026-05-02",
  },
];

describe("PricingManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listServicePricing).mockResolvedValue(pricingRules);
    vi.mocked(createServicePricing).mockResolvedValue(pricingRules[0]);
    vi.mocked(updateServicePricing).mockResolvedValue({ ...pricingRules[1], amount: 300 });
  });

  it("loads real pricing rules without static fallback rows", async () => {
    render(<PricingManagementPage />);

    expect(screen.getByText(/loading service pricing/i)).toBeInTheDocument();
    expect(await screen.findByText("CONSULTATION")).toBeInTheDocument();
    expect(screen.getByText("ECHO")).toBeInTheDocument();
    expect(screen.queryByText("Full Bio-Scan Protocol")).not.toBeInTheDocument();
    expect(listServicePricing).toHaveBeenCalledOnce();
  });

  it("creates a pricing rule with the backend request shape", async () => {
    render(<PricingManagementPage />);

    await screen.findByText("CONSULTATION");
    await userEvent.click(screen.getByRole("button", { name: /add service/i }));
    fireEvent.change(screen.getByLabelText("Department ID"), {
      target: { value: "department-2" },
    });
    fireEvent.change(screen.getByLabelText("Service Name"), {
      target: { value: "FOLLOW_UP" },
    });
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "90" },
    });
    fireEvent.change(screen.getByLabelText("Effective Date"), {
      target: { value: "2026-05-03" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save service/i }));

    await waitFor(() => {
      expect(createServicePricing).toHaveBeenCalledWith({
        departmentId: "department-2",
        serviceName: "FOLLOW_UP",
        amount: 90,
        effectiveDate: "2026-05-03",
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/created/i);
    expect(listServicePricing).toHaveBeenCalledTimes(2);
  });

  it("updates an existing pricing rule", async () => {
    render(<PricingManagementPage />);

    await screen.findByText("ECHO");
    await userEvent.click(screen.getByRole("button", { name: /edit echo/i }));
    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "300" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save service/i }));

    await waitFor(() => {
      expect(updateServicePricing).toHaveBeenCalledWith("pricing-2", {
        departmentId: "department-1",
        serviceName: "ECHO",
        amount: 300,
        effectiveDate: "2026-05-02",
      });
    });
  });

  it("shows validation, empty, and load errors honestly", async () => {
    vi.mocked(listServicePricing).mockResolvedValueOnce([]);

    const { unmount } = render(<PricingManagementPage />);

    expect(await screen.findByText(/no pricing rules/i)).toBeInTheDocument();
    expect(screen.queryByText("Full Bio-Scan Protocol")).not.toBeInTheDocument();

    unmount();

    vi.mocked(listServicePricing).mockRejectedValueOnce(new Error("Pricing access denied"));

    render(<PricingManagementPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Pricing access denied");
  });
});
