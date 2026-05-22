"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  createInvoice,
  listInvoices,
  recordInvoicePayment,
  type InvoiceResponse,
  type InvoiceStatus,
  voidInvoice,
} from "@/lib/operations-api";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

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
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadInvoices = useCallback(
    async (isMounted: () => boolean = () => true) => {
      if (isMounted()) setIsLoading(true);
      try {
        const nextInvoices = await listInvoices(statusFilter === "ALL" ? undefined : statusFilter);
        if (!isMounted()) return;
        setInvoices(nextInvoices);
        setError(null);
      } catch (caught) {
        if (!isMounted()) return;
        setError(errorMessage(caught, "Unable to load invoices."));
        setInvoices([]);
      } finally {
        if (isMounted()) setIsLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadInvoices(() => mounted));
    return () => { mounted = false; };
  }, [loadInvoices]);

  async function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMutationError(null);
    setSuccess(null);
    if (!appointmentId.trim()) { setMutationError("Appointment ID is required."); return; }
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
    if (!paymentInvoice) return;
    setMutationError(null);
    setSuccess(null);
    if (!paymentMethod.trim()) { setMutationError("Payment method is required."); return; }
    setIsMutating(true);
    try {
      const paid = await recordInvoicePayment(paymentInvoice.invoiceId, { paymentMethod: paymentMethod.trim() });
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
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) =>
      [inv.invoiceId, inv.patientFullName, inv.patientId, inv.doctorName, inv.departmentName, inv.status]
        .join(" ").toLowerCase().includes(q),
    );
  }, [invoices, query]);

  const totals = useMemo(() => invoiceTotals(invoices), [invoices]);
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const paged = filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="FINANCE"
        title="Financial Ledger"
        description="Centralized billing & invoice control."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadInvoices as () => void}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              type="button"
              className="hc-button-primary flex items-center gap-2"
              disabled={isMutating}
              onClick={() => { setIsCreateOpen(true); setMutationError(null); setSuccess(null); }}
            >
              <FileText className="w-4 h-4" /> Create Invoice
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Total Issued" value={formatCurrency(totals.totalIssued)} helper={`${invoices.length} invoices`} icon={DollarSign} tone="blue" />
        <KpiCard label="Pending Payment" value={formatCurrency(totals.unpaid)} helper={`${totals.unpaidCount} unpaid`} icon={CreditCard} tone="amber" />
        <KpiCard label="Paid In Full" value={formatCurrency(totals.paid)} helper={`${totals.paidCount} paid`} icon={Banknote} tone="teal" />
        <KpiCard label="Voided/Cancelled" value={formatCurrency(totals.cancelled)} helper={`${totals.cancelledCount} cancelled`} icon={XCircle} tone="red" />
      </section>

      {/* Filter Bar */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            aria-label="Search patients or invoices"
            className="hc-input w-full pl-10"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients or invoices…"
            type="search"
            value={query}
          />
        </div>
        <select
          aria-label="Filter invoices by status"
          className="hc-input min-w-[160px]"
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatusFilter)}
          value={statusFilter}
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </section>

      {/* Alerts */}
      {error && <div className="mt-4 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--hc-danger)]" role="alert">{error}</div>}
      {mutationError && <div className="mt-4 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--hc-danger)]" role="alert">{mutationError}</div>}
      {success && <div className="mt-4 border border-[var(--hc-primary)]/20 bg-[var(--hc-success-bg)] p-4 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--hc-success)]" role="status">{success}</div>}

      {/* Table */}
      <section className="mt-4 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" aria-busy="true">
            <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[var(--hc-primary)] rounded-full animate-spin" />
            <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading invoices…</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-400">No invoices match the current filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="hc-table w-full">
                <thead>
                  <tr>
                    <th className="hc-th">INVOICE ID</th>
                    <th className="hc-th">PATIENT</th>
                    <th className="hc-th">DATE ISSUED</th>
                    <th className="hc-th">AMOUNT</th>
                    <th className="hc-th">STATUS</th>
                    <th className="hc-th text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((invoice) => (
                    <tr key={invoice.invoiceId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="hc-td font-mono font-bold text-[var(--hc-primary)]">{invoice.invoiceId}</td>
                      <td className="hc-td">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E8F0FF] text-[var(--hc-primary)] text-[10px] font-bold">
                            {initials(invoice.patientFullName)}
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--hc-text)]">{invoice.patientFullName}</span>
                            <span className="block text-[10px] font-bold text-slate-400">ID: {invoice.patientId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hc-td text-sm text-slate-500">{formatDate(invoice.appointmentDate)}</td>
                      <td className="hc-td text-sm font-bold text-[var(--hc-text)]">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="hc-td">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${statusClass(invoice.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(invoice.status)}`} />
                          {statusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="hc-td text-right">
                        {invoice.status === "UNPAID" ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-[var(--radius-md)] bg-[var(--hc-success-bg)] text-[var(--hc-success)] hover:bg-[var(--hc-success)] hover:text-white transition-colors disabled:opacity-50"
                              disabled={isMutating}
                              onClick={() => { setPaymentInvoice(invoice); setPaymentMethod(""); setMutationError(null); setSuccess(null); }}
                            >
                              <Banknote className="w-3.5 h-3.5" /> Pay
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-[var(--radius-md)] bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
                              disabled={isMutating}
                              onClick={() => handleVoidInvoice(invoice)}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Void
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--hc-border-soft)] text-sm">
              <span className="text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredInvoices.length)} of {filteredInvoices.length}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} className={`min-w-[32px] h-8 rounded-[var(--radius-md)] text-sm font-medium ${page === p ? "bg-[var(--hc-primary)] text-white" : "hover:bg-slate-100"}`}>
                    {p}
                  </button>
                ))}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Audit Log + Sidebar */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8">
          <h3 className="text-sm font-bold text-[var(--hc-text)] mb-2">Financial Audit Log</h3>
          <p className="text-sm text-slate-500">Invoice audit events are not exposed by the current invoice API. Use the admin audit log flow for global audit history.</p>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-[var(--radius-xl)] p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Collection Target</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Collection target reporting belongs to the revenue reports slice.</p>
          </div>
          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Automated Billing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Batch billing controls are not exposed by the current backend API.</p>
          </div>
        </div>
      </div>

      {/* Create Invoice Dialog */}
      {isCreateOpen && (
        <Dialog title="Create Invoice" onClose={() => setIsCreateOpen(false)}>
          <form className="space-y-6" onSubmit={handleCreateInvoice}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Completed Appointment ID</label>
              <input aria-label="Completed Appointment ID" className="hc-input w-full" onChange={(e) => setAppointmentId(e.target.value)} value={appointmentId} />
            </div>
            <ModalActions cancelLabel="Cancel" confirmLabel={isMutating ? "Creating…" : "Create Invoice"} disabled={isMutating} onCancel={() => setIsCreateOpen(false)} />
          </form>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {paymentInvoice && (
        <Dialog title={`Record Payment — ${paymentInvoice.invoiceId}`} onClose={() => setPaymentInvoice(null)}>
          <form className="space-y-6" onSubmit={handleRecordPayment}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Payment Method</label>
              <input aria-label="Payment Method" className="hc-input w-full" onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod} />
            </div>
            <ModalActions cancelLabel="Cancel" confirmLabel={isMutating ? "Saving…" : "Record Payment"} disabled={isMutating} onCancel={() => setPaymentInvoice(null)} />
          </form>
        </Dialog>
      )}
    </main>
  );
}

/* ─── Dialog ─── */
function Dialog({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-lg bg-white rounded-[var(--radius-xl)] p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--hc-text)]">{title}</h3>
          <button aria-label="Close dialog" className="p-2 rounded-[var(--radius-md)] hover:bg-slate-100" onClick={onClose} type="button">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ cancelLabel, confirmLabel, disabled, onCancel }: { cancelLabel: string; confirmLabel: string; disabled: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3">
      <button type="button" disabled={disabled} onClick={onCancel} className="px-5 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors">
        {cancelLabel}
      </button>
      <button type="submit" disabled={disabled} className="hc-button-primary px-5 py-2.5 text-sm disabled:opacity-60">
        {confirmLabel}
      </button>
    </div>
  );
}

/* ─── Helpers ─── */
function invoiceTotals(invoices: InvoiceResponse[]) {
  return invoices.reduce(
    (t, inv) => {
      const a = Number(inv.totalAmount) || 0;
      return {
        totalIssued: t.totalIssued + a,
        unpaid: t.unpaid + (inv.status === "UNPAID" ? a : 0),
        unpaidCount: t.unpaidCount + (inv.status === "UNPAID" ? 1 : 0),
        paid: t.paid + (inv.status === "PAID" ? a : 0),
        paidCount: t.paidCount + (inv.status === "PAID" ? 1 : 0),
        cancelled: t.cancelled + (inv.status === "CANCELLED" ? a : 0),
        cancelledCount: t.cancelledCount + (inv.status === "CANCELLED" ? 1 : 0),
      };
    },
    { totalIssued: 0, unpaid: 0, unpaidCount: 0, paid: 0, paidCount: 0, cancelled: 0, cancelledCount: 0 },
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(date);
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function statusLabel(status: InvoiceStatus) {
  const map: Record<InvoiceStatus, string> = { PAID: "Paid", UNPAID: "Unpaid", CANCELLED: "Cancelled" };
  return map[status];
}

function statusClass(status: InvoiceStatus) {
  const map: Record<InvoiceStatus, string> = {
    PAID: "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
    UNPAID: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-slate-100 text-slate-500",
  };
  return map[status];
}

function statusDot(status: InvoiceStatus) {
  const map: Record<InvoiceStatus, string> = {
    PAID: "bg-[var(--hc-success)]",
    UNPAID: "bg-amber-500",
    CANCELLED: "bg-slate-400",
  };
  return map[status];
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}
