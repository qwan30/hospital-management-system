"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  listInventoryItems,
  listInventoryAlerts,
  createInventoryItem,
  updateInventoryItem,
  type InventoryItemResponse,
  type InventoryAlertResponse,
  type InventoryItemCreateRequest,
  type InventoryItemUpdateRequest,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Dialog } from "@/components/ui/dialog";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Package,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";

/* ─────────────────── Types ─────────────────── */

interface ItemFormState {
  sku: string;
  itemName: string;
  category: string;
  unit: string;
  reorderLevel: string;
  quantityOnHand: string;
  departmentId: string;
}

const emptyForm: ItemFormState = {
  sku: "",
  itemName: "",
  category: "",
  unit: "",
  reorderLevel: "0",
  quantityOnHand: "0",
  departmentId: "",
};

type SortField = "itemName" | "category" | "quantityOnHand" | "reorderLevel" | "status";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const categories = ["All Categories", "PPE", "Med Supplies", "Pharmaceuticals", "Equipment", "Lab Supplies"];
const statusOptions = ["All Status", "In Stock", "Low Stock", "Critical", "Reorder"];

/* ─────────────────── Component ─────────────────── */

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItemResponse[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlertResponse[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemResponse | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("itemName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* ─── Data Loading ─── */
  const loadData = useCallback(async (isMounted: () => boolean = () => true) => {
    try {
      setIsLoading(true);
      const [itemList, alertList] = await Promise.all([
        listInventoryItems(),
        listInventoryAlerts(),
      ]);
      if (isMounted()) {
        setItems(itemList);
        setAlerts(alertList);
        setError(null);
      }
    } catch (e) {
      if (isMounted()) setError(e instanceof Error ? e.message : "Failed to load inventory.");
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

  /* ─── Derived data ─── */
  function getItemStatus(item: InventoryItemResponse): string {
    const alert = alerts.find((a) => a.itemId === item.itemId);
    if (alert?.severity === "CRITICAL") return "Critical";
    if (item.quantityOnHand <= item.reorderLevel * 0.5) return "Critical";
    if (item.quantityOnHand <= item.reorderLevel) return "Reorder";
    if (item.quantityOnHand <= item.reorderLevel * 1.5) return "Low Stock";
    return "In Stock";
  }

  const filtered = useMemo(() => {
    let result = items;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((i) =>
        i.itemName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "All Categories") {
      result = result.filter((i) => i.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (statusFilter !== "All Status") {
      result = result.filter((i) => getItemStatus(i) === statusFilter);
    }
    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "itemName") cmp = a.itemName.localeCompare(b.itemName);
      else if (sortField === "category") cmp = a.category.localeCompare(b.category);
      else if (sortField === "quantityOnHand") cmp = a.quantityOnHand - b.quantityOnHand;
      else if (sortField === "reorderLevel") cmp = a.reorderLevel - b.reorderLevel;
      else if (sortField === "status") cmp = getItemStatus(a).localeCompare(getItemStatus(b));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, categoryFilter, statusFilter, sortField, sortDir, alerts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ─── KPI derived stats ─── */
  const totalItems = items.reduce((acc, i) => acc + i.quantityOnHand, 0);
  const lowStockCount = alerts.filter((a) => a.alertType === "LOW_STOCK").length;
  const expiringCount = alerts.filter((a) => a.alertType === "EXPIRING_SOON" || a.alertType === "EXPIRED").length;

  /* ─── Form ─── */
  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEdit(item: InventoryItemResponse) {
    setEditingItem(item);
    setForm({
      sku: item.sku,
      itemName: item.itemName,
      category: item.category,
      unit: item.unit,
      reorderLevel: String(item.reorderLevel),
      quantityOnHand: String(item.quantityOnHand),
      departmentId: "",
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.itemName.trim() || !form.sku.trim()) {
      setFormError("SKU and Item Name are required.");
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingItem) {
        const req: InventoryItemUpdateRequest = {
          itemName: form.itemName,
          category: form.category || null,
          unit: form.unit || null,
          reorderLevel: parseInt(form.reorderLevel) || null,
          departmentId: form.departmentId || null,
        };
        await updateInventoryItem(editingItem.itemId, req);
        setSuccess("Item updated.");
      } else {
        const req: InventoryItemCreateRequest = {
          sku: form.sku,
          itemName: form.itemName,
          category: form.category,
          unit: form.unit,
          reorderLevel: parseInt(form.reorderLevel) || 0,
          quantityOnHand: parseInt(form.quantityOnHand) || 0,
          departmentId: form.departmentId || null,
        };
        await createInventoryItem(req);
        setSuccess("Item created.");
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

  // Dismiss success
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  /* ─── Status badge ─── */
  function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
      "In Stock": "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
      "Low Stock": "bg-[#FFF3E0] text-[var(--hc-warning)]",
      Critical: "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]",
      Reorder: "bg-purple-50 text-purple-600",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${colors[status] ?? "bg-slate-100 text-slate-600"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === "In Stock" ? "bg-[var(--hc-success)]" : status === "Low Stock" ? "bg-[var(--hc-warning)]" : status === "Critical" ? "bg-[var(--hc-danger)]" : "bg-purple-600"}`} />
        {status}
      </span>
    );
  }

  /* ─── Stock level bar ─── */
  function StockBar({ quantity, reorder }: { quantity: number; reorder: number }) {
    const max = Math.max(reorder * 3, quantity, 1);
    const pct = Math.min(100, (quantity / max) * 100);
    const color = quantity <= reorder * 0.5 ? "bg-[var(--hc-danger)]" : quantity <= reorder ? "bg-[var(--hc-warning)]" : "bg-[var(--hc-success)]";
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[var(--hc-text)] tabular-nums">{quantity.toLocaleString()}</span>
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="SUPPLY MANAGEMENT"
        title="Inventory Workspace"
        description="Track stock levels, manage reorder thresholds, and monitor supply alerts."
        action={
          <button type="button" onClick={openCreate} className="hc-button-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        }
      />

      {/* Success / Error */}
      {success && (
        <div className="mt-4 border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--hc-success)]">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-4 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--hc-danger)]">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Total Items" value={totalItems.toLocaleString()} helper={`+${items.length} SKUs tracked`} icon={Package} tone="blue" />
        <KpiCard label="Low Stock Items" value={lowStockCount} helper={lowStockCount > 0 ? "Needs attention" : "All adequate"} icon={AlertTriangle} tone={lowStockCount > 0 ? "amber" : "green"} />
        <KpiCard label="Pending Orders" value="N/A" helper="Est. value: N/A" icon={ShoppingCart} tone="green" />
        <KpiCard label="Expiring Soon" value={expiringCount} helper="Within 30 days" icon={Clock} tone={expiringCount > 0 ? "red" : "teal"} />
      </section>

      {/* Filter Bar */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search by item name or SKU…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="hc-input w-full pl-10"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="hc-input min-w-[160px]">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="hc-input min-w-[140px]">
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" /> Advanced Filter
        </button>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </section>

      {/* Table */}
      <section className="mt-4 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading inventory…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="hc-table w-full">
                <thead>
                  <tr>
                    <SortHeader label="ITEM / SKU" field="itemName" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="CATEGORY" field="category" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="STOCK LEVEL" field="quantityOnHand" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="REORDER THRESHOLD" field="reorderLevel" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <th className="hc-th">LOCATION</th>
                    <SortHeader label="STATUS" field="status" current={sortField} dir={sortDir} onSort={toggleSort} />
                    <th className="hc-th">LAST UPDATED</th>
                    <th className="hc-th text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={8} className="hc-td text-center py-12 text-slate-400">No items found</td></tr>
                  ) : (
                    paged.map((item) => {
                      const status = getItemStatus(item);
                      return (
                        <tr key={item.itemId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="hc-td">
                            <div>
                              <p className="font-semibold text-[var(--hc-text)]">{item.itemName}</p>
                              <p className="text-xs text-slate-400">{item.sku}</p>
                            </div>
                          </td>
                          <td className="hc-td text-sm">{item.category}</td>
                          <td className="hc-td">
                            <StockBar quantity={item.quantityOnHand} reorder={item.reorderLevel} />
                          </td>
                          <td className="hc-td text-sm tabular-nums">{item.reorderLevel.toLocaleString()}</td>
                          <td className="hc-td text-sm">{item.departmentName || "N/A"}</td>
                          <td className="hc-td"><StatusBadge status={status} /></td>
                          <td className="hc-td text-sm text-slate-500">
                            {item.lastRestockedAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(item.lastRestockedAt)) : "N/A"}
                          </td>
                          <td className="hc-td text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" className="p-1.5 hover:bg-slate-100 rounded-[var(--radius-md)] transition-colors" title="View">
                                <Eye className="w-4 h-4 text-slate-500" />
                              </button>
                              <button type="button" onClick={() => openEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-[var(--radius-md)] transition-colors" title="Edit">
                                <MoreVertical className="w-4 h-4 text-slate-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--hc-border-soft)] text-sm">
              <span className="text-slate-500">
                Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} items
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
                {totalPages > 5 && <span className="px-1 text-slate-400">…</span>}
                {totalPages > 5 && (
                  <button type="button" onClick={() => setPage(totalPages)} className={`min-w-[32px] h-8 rounded-[var(--radius-md)] text-sm font-medium ${page === totalPages ? "bg-[var(--hc-primary)] text-white" : "hover:bg-slate-100"}`}>
                    {totalPages}
                  </button>
                )}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Create / Edit Dialog ── */}
      <Dialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingItem ? "Edit Item" : "Add Inventory Item"} description="Manage stock details and reorder thresholds.">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-3 rounded-[var(--radius-md)] text-sm text-[var(--hc-danger)]">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="hc-label">SKU *</label>
              <input type="text" className="hc-input w-full" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} disabled={!!editingItem} />
            </div>
            <div>
              <label className="hc-label">Item Name *</label>
              <input type="text" className="hc-input w-full" value={form.itemName} onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="hc-label">Category</label>
              <input type="text" className="hc-input w-full" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. PPE, Med Supplies" />
            </div>
            <div>
              <label className="hc-label">Unit</label>
              <input type="text" className="hc-input w-full" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="e.g. Box, Piece" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="hc-label">Reorder Level</label>
              <input type="number" className="hc-input w-full" value={form.reorderLevel} onChange={(e) => setForm((f) => ({ ...f, reorderLevel: e.target.value }))} min="0" />
            </div>
            {!editingItem && (
              <div>
                <label className="hc-label">Initial Quantity</label>
                <input type="number" className="hc-input w-full" value={form.quantityOnHand} onChange={(e) => setForm((f) => ({ ...f, quantityOnHand: e.target.value }))} min="0" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--hc-border-soft)]">
            <button type="button" onClick={() => setIsFormOpen(false)} className="hc-button-ghost">Cancel</button>
            <button type="submit" disabled={isSaving} className="hc-button-primary">{isSaving ? "Saving…" : editingItem ? "Update Item" : "Create Item"}</button>
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
