"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit2,
  Layers,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import {
  createServicePricing,
  listServicePricing,
  updateServicePricing,
  type ServicePricingResponse,
  type ServicePricingUpsertRequest,
} from "@/lib/operations-api";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

interface PricingFormState {
  departmentId: string;
  serviceName: string;
  amount: string;
  effectiveDate: string;
}

const emptyForm: PricingFormState = { departmentId: "", serviceName: "", amount: "", effectiveDate: "" };

export default function PricingManagementPage() {
  const [pricingRules, setPricingRules] = useState<ServicePricingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ServicePricingResponse | null>(null);
  const [form, setForm] = useState<PricingFormState>(emptyForm);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadPricing = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) setIsLoading(true);
    try {
      const nextRules = await listServicePricing();
      if (!isMounted()) return;
      setPricingRules(nextRules);
      setError(null);
    } catch (caught) {
      if (!isMounted()) return;
      setError(errorMessage(caught, "Unable to load service pricing."));
      setPricingRules([]);
    } finally {
      if (isMounted()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadPricing(() => mounted));
    return () => { mounted = false; };
  }, [loadPricing]);

  const totals = useMemo(() => {
    const catalogValue = pricingRules.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const activeServices = new Set(pricingRules.map((r) => r.serviceName)).size;
    return { catalogValue, activeServices };
  }, [pricingRules]);

  function openCreateForm() {
    setEditingRule(null); setForm(emptyForm); setFormError(null); setSuccess(null); setIsFormOpen(true);
  }

  function openEditForm(rule: ServicePricingResponse) {
    setEditingRule(rule);
    setForm({ departmentId: rule.departmentId ?? "", serviceName: rule.serviceName, amount: String(rule.amount), effectiveDate: rule.effectiveDate });
    setFormError(null); setSuccess(null); setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null); setSuccess(null);
    const request = toRequest(form);
    if (!request.serviceName || !request.effectiveDate || request.amount < 0 || Number.isNaN(request.amount)) {
      setFormError("Service name, non-negative amount, and effective date are required."); return;
    }
    setIsSaving(true);
    try {
      if (editingRule) {
        const updated = await updateServicePricing(editingRule.pricingId, request);
        setSuccess(updated ? `Pricing rule ${updated.serviceName} updated.` : "Pricing rule updated.");
      } else {
        const created = await createServicePricing(request);
        setSuccess(created ? `Pricing rule ${created.serviceName} created.` : "Pricing rule created.");
      }
      setEditingRule(null); setForm(emptyForm); setIsFormOpen(false);
      await loadPricing();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save pricing rule."));
    } finally {
      setIsSaving(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(pricingRules.length / PAGE_SIZE));
  const paged = pricingRules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="FINANCE"
        title="Pricing Catalog"
        description="Manage standard billing rates and service protocols for global billing."
        action={
          <button type="button" className="hc-button-primary flex items-center gap-2" onClick={openCreateForm}>
            <Plus className="w-4 h-4" /> Add Service
          </button>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <KpiCard label="Total Catalog Value" value={formatCurrency(totals.catalogValue)} helper={`${pricingRules.length} pricing rules`} icon={DollarSign} tone="blue" />
        <KpiCard label="Active Services" value={String(totals.activeServices)} helper="Unique service names" icon={Layers} tone="teal" />
        <KpiCard label="Last Refresh" value={isLoading ? "Loading…" : "Live"} helper="API-backed data" icon={RefreshCw} tone="purple" />
      </section>

      {/* Alerts */}
      {error && <div className="mt-4 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--hc-danger)]" role="alert">{error}</div>}
      {formError && <div className="mt-4 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--hc-danger)]" role="alert">{formError}</div>}
      {success && <div className="mt-4 border border-[var(--hc-primary)]/20 bg-[var(--hc-success-bg)] p-4 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--hc-success)]" role="status">{success}</div>}

      {/* Table */}
      <section className="mt-4 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" aria-busy="true">
            <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[var(--hc-primary)] rounded-full animate-spin" />
            <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading service pricing…</p>
          </div>
        ) : pricingRules.length === 0 ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-400">No pricing rules found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="hc-table w-full">
                <thead>
                  <tr>
                    <th className="hc-th">DEPARTMENT</th>
                    <th className="hc-th">SERVICE NAME</th>
                    <th className="hc-th">BASE PRICE</th>
                    <th className="hc-th">EFFECTIVE DATE</th>
                    <th className="hc-th">STATUS</th>
                    <th className="hc-th text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((rule) => (
                    <tr key={rule.pricingId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="hc-td">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#E8F0FF] text-[var(--hc-primary)]">
                          {rule.departmentName || "GLOBAL"}
                        </span>
                      </td>
                      <td className="hc-td font-semibold text-[var(--hc-text)]">{rule.serviceName}</td>
                      <td className="hc-td font-mono text-sm text-[var(--hc-text)]">{formatCurrency(rule.amount)}</td>
                      <td className="hc-td text-sm text-slate-500">{formatDate(rule.effectiveDate)}</td>
                      <td className="hc-td">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[var(--hc-success-bg)] text-[var(--hc-success)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--hc-success)]" /> Active
                        </span>
                      </td>
                      <td className="hc-td text-right">
                        <button
                          type="button"
                          aria-label={`Edit ${rule.serviceName}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-[var(--radius-md)] bg-slate-100 text-[var(--hc-text)] hover:bg-[var(--hc-primary)] hover:text-white transition-colors"
                          onClick={() => openEditForm(rule)}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--hc-border-soft)] text-sm">
              <span className="text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, pricingRules.length)} of {pricingRules.length}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} className={`min-w-[32px] h-8 rounded-[var(--radius-md)] text-sm font-medium ${page === p ? "bg-[var(--hc-primary)] text-white" : "hover:bg-slate-100"}`}>{p}</button>
                ))}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Form Dialog */}
      {isFormOpen && (
        <Dialog title={editingRule ? "Edit Service" : "Add Service"} onClose={() => { setEditingRule(null); setForm(emptyForm); setFormError(null); setIsFormOpen(false); }}>
          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <FormInput label="Department ID" value={form.departmentId} onChange={(v) => setForm({ ...form, departmentId: v })} />
            <FormInput label="Service Name" value={form.serviceName} onChange={(v) => setForm({ ...form, serviceName: v })} required />
            <FormInput label="Amount" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} required type="number" />
            <FormInput label="Effective Date" value={form.effectiveDate} onChange={(v) => setForm({ ...form, effectiveDate: v })} required type="date" />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="px-5 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button type="submit" disabled={isSaving} className="hc-button-primary px-5 py-2.5 text-sm disabled:opacity-60">{isSaving ? "Saving…" : "Save Service"}</button>
            </div>
          </form>
        </Dialog>
      )}
    </main>
  );
}

/* ─── Sub-components ─── */
function FormInput({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      <input aria-label={label} className="hc-input w-full" type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Dialog({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-lg bg-white rounded-[var(--radius-xl)] p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--hc-text)]">{title}</h3>
          <button aria-label="Close dialog" className="p-2 rounded-[var(--radius-md)] hover:bg-slate-100" onClick={onClose} type="button"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function toRequest(form: PricingFormState): ServicePricingUpsertRequest {
  return { departmentId: form.departmentId.trim() || null, serviceName: form.serviceName.trim(), amount: Number(form.amount), effectiveDate: form.effectiveDate };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(date);
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}
