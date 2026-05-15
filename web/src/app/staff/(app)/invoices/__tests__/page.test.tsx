import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InvoicesPage from "../page";
import {
  createInvoice,
  listInvoices,
  recordInvoicePayment,
  type InvoiceResponse,
  voidInvoice,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createInvoice: vi.fn(),
    listInvoices: vi.fn(),
    recordInvoicePayment: vi.fn(),
    voidInvoice: vi.fn(),
  };
});

const invoices: InvoiceResponse[] = [
  {
    invoiceId: "invoice-1",
    appointmentId: "appointment-1",
    patientId: "patient-1",
    patientFullName: "Linh Tran",
    doctorName: "Dr. Lan Nguyen",
    departmentName: "Cardiology",
    appointmentDate: "2026-05-01",
    totalAmount: 125,
    status: "UNPAID",
    paymentMethod: null,
    paidAt: null,
  },
  {
    invoiceId: "invoice-2",
    appointmentId: "appointment-2",
    patientId: "patient-2",
    patientFullName: "Minh Pham",
    doctorName: "Dr. An Ho",
    departmentName: "Neurology",
    appointmentDate: "2026-05-02",
    totalAmount: 300,
    status: "PAID",
    paymentMethod: "CARD",
    paidAt: "2026-05-02T10:00:00Z",
  },
];

describe("InvoicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listInvoices).mockResolvedValue(invoices);
    vi.mocked(createInvoice).mockResolvedValue(invoices[0]);
    vi.mocked(recordInvoicePayment).mockResolvedValue({ ...invoices[0], status: "PAID" });
    vi.mocked(voidInvoice).mockResolvedValue({ ...invoices[0], status: "CANCELLED" });
  });

  it("loads real invoices without static fallback rows", async () => {
    render(<InvoicesPage />);

    expect(screen.getByText(/loading invoices/i)).toBeInTheDocument();
    expect(await screen.findByText("Linh Tran")).toBeInTheDocument();
    expect(screen.getByText("Minh Pham")).toBeInTheDocument();
    expect(screen.getByText("$425.00")).toBeInTheDocument();
    expect(screen.queryByText("ELARA HAMILTON")).not.toBeInTheDocument();
    expect(listInvoices).toHaveBeenCalledWith(undefined);
  });

  it("filters visible invoices by search text", async () => {
    render(<InvoicesPage />);

    await screen.findByText("Linh Tran");
    fireEvent.change(screen.getByRole("searchbox", { name: /search patients or invoices/i }), {
      target: { value: "minh" },
    });

    expect(screen.getByText("Minh Pham")).toBeInTheDocument();
    expect(screen.queryByText("Linh Tran")).not.toBeInTheDocument();
  });

  it("reloads invoices with a backend status filter", async () => {
    vi.mocked(listInvoices)
      .mockResolvedValueOnce(invoices)
      .mockResolvedValueOnce([invoices[1]]);

    render(<InvoicesPage />);

    await screen.findByText("Linh Tran");
    await userEvent.selectOptions(screen.getByLabelText(/filter invoices by status/i), "PAID");

    await waitFor(() => {
      expect(listInvoices).toHaveBeenLastCalledWith("PAID");
    });
    expect(await screen.findByText("Minh Pham")).toBeInTheDocument();
  });

  it("creates an invoice with a real completed appointment ID", async () => {
    render(<InvoicesPage />);

    await screen.findByText("Linh Tran");
    await userEvent.click(screen.getByRole("button", { name: /create invoice/i }));
    fireEvent.change(screen.getByLabelText(/completed appointment id/i), {
      target: { value: "appointment-100" },
    });
    const createButtons = screen.getAllByRole("button", { name: /^create invoice$/i });
    await userEvent.click(createButtons[createButtons.length - 1]);

    await waitFor(() => {
      expect(createInvoice).toHaveBeenCalledWith({ appointmentId: "appointment-100" });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/invoice invoice-1 created/i);
    expect(listInvoices).toHaveBeenCalledTimes(2);
  });

  it("records payment and voids unpaid invoices with real invoice IDs", async () => {
    render(<InvoicesPage />);

    await screen.findByText("Linh Tran");
    await userEvent.click(screen.getAllByRole("button", { name: "Pay" })[0]);
    fireEvent.change(screen.getByLabelText(/payment method/i), {
      target: { value: "CASH" },
    });
    await userEvent.click(screen.getByRole("button", { name: /record payment/i }));

    await waitFor(() => {
      expect(recordInvoicePayment).toHaveBeenCalledWith("invoice-1", { paymentMethod: "CASH" });
    });

    await userEvent.click(screen.getAllByRole("button", { name: "Void" })[0]);

    await waitFor(() => {
      expect(voidInvoice).toHaveBeenCalledWith("invoice-1");
    });
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listInvoices).mockResolvedValueOnce([]);

    const { unmount } = render(<InvoicesPage />);

    expect(await screen.findByText(/no invoices match/i)).toBeInTheDocument();
    expect(screen.queryByText("ELARA HAMILTON")).not.toBeInTheDocument();

    unmount();

    vi.mocked(listInvoices).mockRejectedValueOnce(new Error("Invoice access denied"));

    render(<InvoicesPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Invoice access denied");
    expect(screen.queryByText("ELARA HAMILTON")).not.toBeInTheDocument();
  });
});
