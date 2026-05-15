"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createInvoice,
  listInvoices,
  recordInvoicePayment,
  type InvoiceResponse,
  type InvoiceStatus,
  voidInvoice,
} from "@/lib/operations-api";

import { HcIcon } from "@/components/ui/hc-icon";
type InvoiceStatusFilter = "ALL" | InvoiceStatus;

const statusOptions: { label: string; value: InvoiceStatusFilter }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Unpaid", value: "UNPAID" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const loadInvoices = useCallback(
    async (isMounted: () => boolean = () => true) => {
      if (isMounted()) {
        setIsLoading(true);
      }
      try {
        const nextInvoices = await listInvoices(statusFilter === "ALL" ? undefined : statusFilter);
        if (!isMounted()) {
          return;
        }
        setInvoices(nextInvoices);
        setError(null);
      } catch (caught) {
        if (!isMounted()) {
          return;
        }
        setError(errorMessage(caught, "Unable to load invoices."));
        setInvoices([]);
      } finally {
        if (isMounted()) {
          setIsLoading(false);
        }
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadInvoices(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadInvoices]);

  async function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMutationError(null);
    setSuccess(null);

    if (!appointmentId.trim()) {
      setMutationError("Appointment ID is required.");
      return;
    }

    setIsMutating(true);
    try {
      const created = await createInvoice({ appointmentId: appointmentId.trim() });
      setSuccess(created ? `Invoice ${created.invoiceId} created.` : "Invoice created.");
      setAppointmentId("");
      setIsCreateOpen(false);
      await loadInvoices();
    } catch (caught) {
      setMutationError(errorMessage(caught, "Unable to create invoice."));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleRecordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paymentInvoice) {
      return;
    }

    setMutationError(null);
    setSuccess(null);
    if (!paymentMethod.trim()) {
      setMutationError("Payment method is required.");
      return;
    }

    setIsMutating(true);
    try {
      const paid = await recordInvoicePayment(paymentInvoice.invoiceId, {
        paymentMethod: paymentMethod.trim(),
      });
      setSuccess(paid ? `Invoice ${paid.invoiceId} paid.` : "Payment captured.");
      setPaymentInvoice(null);
      setPaymentMethod("");
      await loadInvoices();
    } catch (caught) {
      setMutationError(errorMessage(caught, "Unable to record payment."));
    } finally {
      setIsMutating(false);
    }
  }

  async function handleVoidInvoice(invoice: InvoiceResponse) {
    setMutationError(null);
    setSuccess(null);
    setIsMutating(true);
    try {
      const voided = await voidInvoice(invoice.invoiceId);
      setSuccess(voided ? `Invoice ${voided.invoiceId} voided.` : "Invoice voided.");
      await loadInvoices();
    } catch (caught) {
      setMutationError(errorMessage(caught, "Unable to void invoice."));
    } finally {
      setIsMutating(false);
    }
  }

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      const haystack = [
        invoice.invoiceId,
        invoice.patientFullName,
        invoice.patientId,
        invoice.doctorName,
        invoice.departmentName,
        invoice.status,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [invoices, query]);

  const totals = useMemo(() => invoiceTotals(invoices), [invoices]);

  return (
    <main>
      <header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50 bg-[#fcf9f8] dark:bg-[#171717]">
        <div className="flex items-center flex-1">
          <div className="relative w-full max-w-md">
            <HcIcon name="search" className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" />
            <input
              aria-label="Search patients or invoices"
              className="w-full bg-transparent border-none focus:ring-0 pl-8 font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest placeholder:text-outline-variant"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH PATIENTS OR INVOICES..."
              type="search"
              value={query}
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:bg-[#f6f3f2] dark:hover:bg-[#262626] p-2 transition-all" disabled type="button">
            <HcIcon name="notifications" className="text-lg" />
          </button>
          <button className="hover:bg-[#f6f3f2] dark:hover:bg-[#262626] p-2 transition-all" disabled type="button">
            <HcIcon name="history" className="text-lg" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
            <span className="font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest">FINANCE</span>
            <HcIcon name="account_circle" className="text-3xl text-primary" />
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-light tracking-tight text-on-surface">Financial Ledger</h2>
            <p className="font-semibold uppercase text-[10px] tracking-[0.2em] text-primary mt-2">Centralized Billing &amp; Invoice Control</p>
          </div>
          <div className="flex gap-1">
            <button className="bg-surface-container-high text-on-surface px-6 py-3 font-semibold text-[10px] tracking-widest uppercase opacity-60" disabled type="button">Export CSV</button>
            <button
              className="bg-primary-container text-white px-6 py-3 font-semibold text-[10px] tracking-widest uppercase hover:bg-primary transition-colors flex items-center disabled:opacity-60"
              disabled={isMutating}
              onClick={() => {
                setIsCreateOpen(true);
                setMutationError(null);
                setSuccess(null);
              }}
              type="button"
            >
              <HcIcon name="receipt_long" className="mr-2 text-sm" />
              Create Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          <KpiCard label="Total Issued" value={formatCurrency(totals.totalIssued)} note={`${invoices.length} API invoices`} />
          <KpiCard label="Pending Payment" value={formatCurrency(totals.unpaid)} note={`${totals.unpaidCount} unpaid`} accent="text-tertiary" />
          <KpiCard label="Paid In Full" value={formatCurrency(totals.paid)} note={`${totals.paidCount} paid`} accent="text-green-600" />
          <KpiCard label="Voided/Canceled" value={formatCurrency(totals.cancelled)} note={`${totals.cancelledCount} cancelled`} accent="text-error" />
        </div>

        <div className="bg-surface-container-low p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <HcIcon name="filter_list" className="text-lg opacity-40" />
            <span className="font-semibold uppercase text-[10px] tracking-widest">Filter By:</span>
          </div>
          <div className="relative group">
            <select
              aria-label="Filter invoices by status"
              className="appearance-none bg-transparent border-b-2 border-outline-variant pr-8 py-1 font-semibold uppercase text-[10px] tracking-widest focus:border-primary focus:ring-0 cursor-pointer"
              onChange={(event) => setStatusFilter(event.target.value as InvoiceStatusFilter)}
              value={statusFilter}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <HcIcon name="expand_more" className="absolute right-0 top-1 text-sm pointer-events-none" />
          </div>
          <div className="relative group">
            <input
              aria-label="Date range filter"
              className="bg-transparent border-b-2 border-outline-variant pr-8 py-1 font-semibold uppercase text-[10px] tracking-widest focus:ring-0"
              disabled
              type="text"
              value="Date range unsupported by API"
            />
            <HcIcon name="calendar_today" className="absolute right-0 top-1 text-sm pointer-events-none" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <p className="font-semibold uppercase text-[10px] tracking-widest opacity-40">Showing {filteredInvoices.length} Results</p>
          </div>
        </div>

        {error ? (
          <div className="border border-error/30 bg-error/10 p-4 text-sm font-medium text-error" role="alert">
            {error}
          </div>
        ) : null}

        {mutationError ? (
          <div className="border border-error/30 bg-error/10 p-4 text-sm font-medium text-error" role="alert">
            {mutationError}
          </div>
        ) : null}

        {success ? (
          <div className="border border-primary/20 bg-primary-container/20 p-4 text-sm font-medium text-primary" role="status">
            {success}
          </div>
        ) : null}

        {isLoading ? (
          <div className="bg-surface-container-lowest p-8 text-sm font-medium text-on-surface-variant">
            Loading invoices...
          </div>
        ) : (
          <InvoiceTable
            invoices={filteredInvoices}
            isMutating={isMutating}
            onPay={(invoice) => {
              setPaymentInvoice(invoice);
              setPaymentMethod("");
              setMutationError(null);
              setSuccess(null);
            }}
            onVoid={handleVoidInvoice}
          />
        )}

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8">
            <h3 className="font-semibold uppercase text-[10px] tracking-[0.2em] mb-6">Financial Audit Log</h3>
            <p className="text-sm font-medium text-on-surface-variant">
              Invoice audit events are not exposed by the current invoice API. Use the admin audit log flow for global audit history.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-primary text-white p-8">
              <h3 className="font-bold uppercase text-[10px] tracking-[0.2em] mb-4 opacity-80">Collection Target</h3>
              <p className="text-[10px] font-semibold opacity-70 leading-relaxed uppercase tracking-widest">
                Collection target reporting belongs to the revenue reports slice.
              </p>
            </div>
            <div className="bg-surface-container-highest p-8">
              <h3 className="font-semibold uppercase text-[10px] tracking-[0.2em] mb-4">Automated Billing</h3>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant leading-normal">
                Batch billing controls are not exposed by the current backend API.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <Dialog title="Create Invoice" onClose={() => setIsCreateOpen(false)}>
          <form className="space-y-6" onSubmit={handleCreateInvoice}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Completed Appointment ID
              </label>
              <input
                aria-label="Completed Appointment ID"
                className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 py-3 px-4 font-medium"
                onChange={(event) => setAppointmentId(event.target.value)}
                value={appointmentId}
              />
            </div>
            <ModalActions
              cancelLabel="Cancel"
              confirmLabel={isMutating ? "Creating..." : "Create Invoice"}
              disabled={isMutating}
              onCancel={() => setIsCreateOpen(false)}
            />
          </form>
        </Dialog>
      ) : null}

      {paymentInvoice ? (
        <Dialog title={`Record Payment ${paymentInvoice.invoiceId}`} onClose={() => setPaymentInvoice(null)}>
          <form className="space-y-6" onSubmit={handleRecordPayment}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Payment Method
              </label>
              <input
                aria-label="Payment Method"
                className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 py-3 px-4 font-medium"
                onChange={(event) => setPaymentMethod(event.target.value)}
                value={paymentMethod}
              />
            </div>
            <ModalActions
              cancelLabel="Cancel"
              confirmLabel={isMutating ? "Saving..." : "Record Payment"}
              disabled={isMutating}
              onCancel={() => setPaymentInvoice(null)}
            />
          </form>
        </Dialog>
      ) : null}
    </main>
  );
}

function InvoiceTable({
  invoices,
  isMutating,
  onPay,
  onVoid,
}: {
  invoices: InvoiceResponse[];
  isMutating: boolean;
  onPay: (invoice: InvoiceResponse) => void;
  onVoid: (invoice: InvoiceResponse) => void;
}) {
  if (invoices.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-8 text-sm font-medium text-on-surface-variant">
        No invoices match the current filters.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-container-high">
          <tr>
            <HeaderCell>Invoice ID</HeaderCell>
            <HeaderCell>Patient Details</HeaderCell>
            <HeaderCell>Date Issued</HeaderCell>
            <HeaderCell>Total Amount</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell alignRight>Actions</HeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low">
          {invoices.map((invoice) => (
            <tr className="hover:bg-surface-container transition-colors group" key={invoice.invoiceId}>
              <td className="px-6 py-5 font-mono text-[11px] font-bold text-primary">{invoice.invoiceId}</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">
                    {initials(invoice.patientFullName)}
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider">{invoice.patientFullName}</p>
                    <p className="text-[10px] opacity-60">ID: {invoice.patientId}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 font-semibold text-[11px] opacity-70 uppercase tracking-tighter">{formatDate(invoice.appointmentDate)}</td>
              <td className="px-6 py-5 font-bold text-xs">{formatCurrency(invoice.totalAmount)}</td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 font-bold text-[9px] uppercase tracking-widest ${statusClass(invoice.status)}`}>
                  {statusLabel(invoice.status)}
                </span>
              </td>
              <td className="px-6 py-5 text-right">
                {invoice.status === "UNPAID" ? (
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-3 py-2 bg-primary-container text-white text-[9px] font-bold uppercase tracking-widest disabled:opacity-60"
                      disabled={isMutating}
                      onClick={() => onPay(invoice)}
                      type="button"
                    >
                      Pay
                    </button>
                    <button
                      className="px-3 py-2 border border-outline text-[9px] font-bold uppercase tracking-widest disabled:opacity-60"
                      disabled={isMutating}
                      onClick={() => onVoid(invoice)}
                      type="button"
                    >
                      Void
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-widest opacity-50">No action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between">
        <p className="font-semibold uppercase text-[10px] tracking-widest">{invoices.length} API-backed items</p>
        <p className="font-semibold uppercase text-[10px] tracking-widest">Pagination is not exposed by the current invoice API</p>
      </div>
    </div>
  );
}

function Dialog({
  children,
  title,
  onClose,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-lg bg-surface-container-lowest p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-widest">{title}</h3>
          <button aria-label="Close dialog" className="p-2 hover:bg-surface-container-low" onClick={onClose} type="button">
            <HcIcon name="close" className="text-lg" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  cancelLabel,
  confirmLabel,
  disabled,
  onCancel,
}: {
  cancelLabel: string;
  confirmLabel: string;
  disabled: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high"
        disabled={disabled}
        onClick={onCancel}
        type="button"
      >
        {cancelLabel}
      </button>
      <button
        className="bg-primary-container text-white px-6 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        {confirmLabel}
      </button>
    </div>
  );
}

function HeaderCell({ children, alignRight = false }: { children: string; alignRight?: boolean }) {
  return (
    <th className={`px-6 py-4 font-semibold uppercase text-[10px] tracking-[0.2em] border-b border-surface ${alignRight ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function KpiCard({
  label,
  value,
  note,
  accent = "text-primary",
}: {
  label: string;
  value: string;
  note: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface-container-highest p-6 border-r border-surface">
      <p className="font-semibold uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-2">{label}</p>
      <p className="text-3xl font-light tracking-tighter">{value}</p>
      <p className={`text-[10px] font-bold mt-1 uppercase ${accent}`}>{note}</p>
    </div>
  );
}

function invoiceTotals(invoices: InvoiceResponse[]) {
  return invoices.reduce(
    (totals, invoice) => {
      const amount = Number(invoice.totalAmount) || 0;
      return {
        totalIssued: totals.totalIssued + amount,
        unpaid: totals.unpaid + (invoice.status === "UNPAID" ? amount : 0),
        unpaidCount: totals.unpaidCount + (invoice.status === "UNPAID" ? 1 : 0),
        paid: totals.paid + (invoice.status === "PAID" ? amount : 0),
        paidCount: totals.paidCount + (invoice.status === "PAID" ? 1 : 0),
        cancelled: totals.cancelled + (invoice.status === "CANCELLED" ? amount : 0),
        cancelledCount: totals.cancelledCount + (invoice.status === "CANCELLED" ? 1 : 0),
      };
    },
    {
      totalIssued: 0,
      unpaid: 0,
      unpaidCount: 0,
      paid: 0,
      paidCount: 0,
      cancelled: 0,
      cancelledCount: 0,
    },
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function statusLabel(status: InvoiceStatus) {
  switch (status) {
    case "PAID":
      return "Paid";
    case "UNPAID":
      return "Unpaid";
    case "CANCELLED":
      return "Cancelled";
  }
}

function statusClass(status: InvoiceStatus) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "UNPAID":
      return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
    case "CANCELLED":
      return "bg-surface-variant text-on-surface-variant";
  }
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}
