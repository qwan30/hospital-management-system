"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  listServicePricing,
  createServicePricing,
  updateServicePricing,
  listAdminDepartments,
  type ServicePricingResponse,
  type ServicePricingUpsertRequest,
  type AdminDepartmentResponse,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { Dialog } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CheckCircle2,
  DollarSign,
  Download,
  Edit3,
  FileText,
  Info,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

/* ─────────────────── Types ─────────────────── */

interface PricingFormState {
  departmentId: string;
  serviceName: string;
  amount: string;
  effectiveDate: string;
}

const emptyForm: PricingFormState = {
  departmentId: "",
  serviceName: "",
  amount: "",
  effectiveDate: new Date().toISOString().slice(0, 10),
};

type SortField = "departmentName" | "serviceName" | "amount" | "effectiveDate";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

/* ─────────────────── Component ─────────────────── */

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<ServicePricingResponse[]>([]);
  const [departments, setDepartments] = useState<AdminDepartmentResponse[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServicePricingResponse | null>(null);
  const [form, setForm] = useState<PricingFormState>(emptyForm);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("departmentName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const loadData = useCallback(async (isMounted: () => boolean = () => true) => {
    try {
      setIsLoading(true);
      const [pricingList, deptList] = await Promise.all([
        listServicePricing(),
        listAdminDepartments(),
      ]);
      if (isMounted()) {
        setPricing(pricingList);
        setDepartments(deptList);
        setError(null);
      }
    } catch (e) {
      if (isMounted()) setError(e instanceof Error ? e.message : "Failed to load pricing.");
    } finally {
      if (isMounted()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      loadData(() => mounted);
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [loadData]);

  /* ─── Derived ─── */
  const filtered = useMemo(() => {
    let result = pricing;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((p) =>
        p.serviceName.toLowerCase().includes(q) ||
        (p.departmentName ?? "").toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "departmentName") cmp = (a.departmentName ?? "").localeCompare(b.departmentName ?? "");
      else if (sortField === "serviceName") cmp = a.serviceName.localeCompare(b.serviceName);
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else if (sortField === "effectiveDate") cmp = a.effectiveDate.localeCompare(b.effectiveDate);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [pricing, query, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ─── KPI ─── */
  const totalCatalogValue = pricing.reduce((s, p) => s + p.amount, 0);
  const activeServices = pricing.length;

  function handleExportCSV() {
    const headers = ["Pricing ID", "Department", "Service", "Amount", "Effective Date"];
    const rows = filtered.map((item) => [
      item.pricingId,
      item.departmentName ?? "Global",
      item.serviceName,
      item.amount,
      item.effectiveDate,
    ]);
    downloadCsv(`service_pricing_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  }

  /* ─── Form ─── */
  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEdit(item: ServicePricingResponse) {
    setEditingItem(item);
    setForm({
      departmentId: item.departmentId ?? "",
      serviceName: item.serviceName,
      amount: String(item.amount),
      effectiveDate: item.effectiveDate,
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.serviceName.trim()) {
      setFormError("Service name is required.");
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const req: ServicePricingUpsertRequest = {
        departmentId: form.departmentId || null,
        serviceName: form.serviceName,
        amount: parseFloat(form.amount) || 0,
        effectiveDate: form.effectiveDate,
      };
      if (editingItem) {
        await updateServicePricing(editingItem.pricingId, req);
        setSuccess("Service pricing updated.");
      } else {
        await createServicePricing(req);
        setSuccess("Service pricing created.");
      }
      setIsFormOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  // Auto-dismiss success
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="FINANCIAL ADMINISTRATION"
        title="Service Catalog"
        description="Manage standard billing rates and service protocols for global billing."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-white hover:bg-slate-50 transition-colors disabled:opacity-60"
              disabled={filtered.length === 0}
              onClick={handleExportCSV}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button type="button" onClick={openCreate} className="hc-button-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        }
      />

      {/* Feedback */}
      {success && (
        <div className="mt-4 border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--hc-success)]">{success}</div>
      )}
      {error && (
        <div className="mt-4 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--hc-danger)]">{error}</div>
      )}

      {/* ─── Main Layout: Table + Sidebar ─── */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Left: Table */}
        <div>
          {/* Search */}
          <div className="mb-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              aria-label="Search pricing"
              placeholder="Search services or departments…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="hc-input w-full pl-10"
            />
          </div>

          {/* Table Card */}
          <section className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">Loading pricing…</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="hc-table w-full">
                    <thead>
                      <tr>
                        <SortHeader label="DEPARTMENT" field="departmentName" current={sortField} dir={sortDir} onSort={toggleSort} />
                        <th className="hc-th">SERVICE TYPE</th>
                        <SortHeader label="BASE PRICE" field="amount" current={sortField} dir={sortDir} onSort={toggleSort} />
                        <SortHeader label="EFFECTIVE DATE" field="effectiveDate" current={sortField} dir={sortDir} onSort={toggleSort} />
                        <th className="hc-th">STATUS</th>
                        <th className="hc-th text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr><td colSpan={6} className="hc-td text-center py-12 text-slate-400">No services found</td></tr>
                      ) : (
                        paged.map((p) => (
                          <tr key={p.pricingId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="hc-td font-medium text-[var(--hc-text)]">
                              {p.departmentName || "Global"}
                            </td>
                            <td className="hc-td text-sm uppercase tracking-wider text-slate-500 font-medium">
                              {p.serviceName}
                            </td>
                            <td className="hc-td font-semibold text-[var(--hc-text)] tabular-nums">
                              ${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="hc-td text-sm text-slate-500">
                              {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(p.effectiveDate))}
                            </td>
                            <td className="hc-td">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-[var(--hc-success-bg)] text-[var(--hc-success)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--hc-success)]" />
                                ACTIVE
                              </span>
                            </td>
                            <td className="hc-td text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button type="button" onClick={() => openEdit(p)} className="p-1.5 hover:bg-slate-100 rounded-[var(--radius-md)] transition-colors" title="Edit">
                                  <Edit3 className="w-4 h-4 text-slate-500" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Delete pricing unavailable"
                                  className="p-1.5 rounded-[var(--radius-md)] transition-colors opacity-50"
                                  disabled
                                  title="Delete is not exposed by the current pricing API."
                                >
                                  <Trash2 className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--hc-border-soft)] text-sm">
                  <span className="text-slate-500">
                    Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} services
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <button key={p} type="button" onClick={() => setPage(p)} className={`min-w-[32px] h-8 rounded-[var(--radius-md)] text-sm font-medium ${page === p ? "bg-[var(--hc-primary)] text-white" : "hover:bg-slate-100"}`}>
                        {p}
                      </button>
                    ))}
                    <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {/* Right: Sidebar KPIs */}
        <div className="space-y-4">
          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6 text-center">
            <div className="grid size-12 mx-auto place-items-center rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-primary)] mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">TOTAL CATALOG VALUE</p>
            <p className="text-3xl font-bold text-[var(--hc-text)] mt-1 tabular-nums">${totalCatalogValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}</p>
            <p className="text-xs text-[var(--hc-primary)] font-semibold mt-1">{activeServices} API pricing rules</p>
          </div>

          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6 text-center">
            <div className="grid size-12 mx-auto place-items-center rounded-full bg-[var(--hc-success-bg)] text-[var(--hc-success)] mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">ACTIVE SERVICES</p>
            <p className="text-3xl font-bold text-[var(--hc-text)] mt-1">{activeServices}</p>
            <p className="text-xs text-slate-500 mt-1">Derived from current API data</p>
          </div>

          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6">
            <div className="grid size-12 mx-auto place-items-center rounded-full bg-slate-100 text-slate-500 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">PRICING RULES</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--hc-primary)] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">Department ID is optional; the backend accepts global pricing when it is empty.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--hc-success)] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">Delete is not exposed by the current pricing API.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingItem ? "Edit Service Pricing" : "Add Service"} description="Configure billing rates for services.">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-3 rounded-[var(--radius-md)] text-sm text-[var(--hc-danger)]">{formError}</div>
          )}
          <div>
            <label className="hc-label">Department</label>
            <select className="hc-input w-full" value={form.departmentId} onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}>
              <option value="">Global (all departments)</option>
              {departments.filter((d) => d.active).map((d) => (
                <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="hc-label">Service Name *</label>
            <input type="text" className="hc-input w-full" value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))} placeholder="e.g. CONSULTATION" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="hc-label">Base Price</label>
              <input type="number" className="hc-input w-full" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} min="0" step="0.01" />
            </div>
            <div>
              <label className="hc-label">Effective Date</label>
              <input type="date" className="hc-input w-full" value={form.effectiveDate} onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--hc-border-soft)]">
            <button type="button" onClick={() => setIsFormOpen(false)} className="hc-button-ghost">Cancel</button>
            <button type="submit" disabled={isSaving} className="hc-button-primary">{isSaving ? "Saving…" : editingItem ? "Update Pricing" : "Create Service"}</button>
          </div>
        </form>
      </Dialog>
    </main>
  );
}

/* ─────────────────── SortHeader ─────────────────── */

function SortHeader({ label, field, current, dir, onSort }: { label: string; field: SortField; current: SortField; dir?: SortDir; onSort: (f: SortField) => void }) {
  void dir;
  return (
    <th className="hc-th cursor-pointer select-none group" onClick={() => onSort(field)}>
      <span className="flex items-center gap-1">
        {label}
        <ChevronsUpDown className={`w-3 h-3 transition-colors ${current === field ? "text-[var(--hc-primary)]" : "text-slate-300 group-hover:text-slate-500"}`} />
      </span>
    </th>
  );
}

function downloadCsv(fileName: string, rows: Array<Array<string | number>>) {
  const body = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const link = document.createElement("a");
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(body)}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
