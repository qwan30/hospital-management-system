"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ClipboardList,
  AlertCircle,
  Truck,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";

interface DrugItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  minLevel: number;
  expiringLots: number;
  status: "Normal" | "Low Stock" | "Critical";
}

const MOCK_INVENTORY_ALERTS: DrugItem[] = [
  { id: "MED-001", name: "Amoxicillin 500mg", category: "Antibiotics", stockLevel: 15, minLevel: 50, expiringLots: 2, status: "Critical" },
  { id: "MED-002", name: "Paracetamol 500mg", category: "Analgesics", stockLevel: 1500, minLevel: 200, expiringLots: 0, status: "Normal" },
  { id: "MED-003", name: "Ibuprofen 400mg", category: "Analgesics", stockLevel: 42, minLevel: 100, expiringLots: 1, status: "Low Stock" },
  { id: "MED-004", name: "Insulin Glargine 100 U/mL", category: "Antidiabetics", stockLevel: 8, minLevel: 10, expiringLots: 3, status: "Low Stock" },
  { id: "MED-005", name: "Metformin 850mg", category: "Antidiabetics", stockLevel: 800, minLevel: 300, expiringLots: 0, status: "Normal" },
];

export function PharmacistDashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredItems = useMemo(() => {
    return MOCK_INVENTORY_ALERTS.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  function getStatusBadge(status: DrugItem["status"]) {
    const classes = {
      Normal: "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
      "Low Stock": "bg-[var(--hc-warning-bg)] text-[var(--hc-warning)]",
      Critical: "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${classes[status]}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="PHARMACY OPERATIONS"
        title="Pharmacy & Inventory Dashboard"
        description="Verify drug inventory stock, check about-to-expire lots, track prescription dispensing queues, and log inventory movements."
        action={
          <div className="flex gap-2">
            <Link href="/staff/inventory" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[var(--hc-primary)] hover:bg-[var(--hc-blue-700)] text-white rounded-[var(--radius-md)] transition-all">
              <Package className="w-4 h-4" /> View Inventory List
            </Link>
            <Link href="/staff/prescriptions" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-[var(--hc-surface)] hover:bg-[var(--hc-surface-soft)] transition-colors">
              <ClipboardList className="w-4 h-4 text-[var(--hc-text-muted)]" /> Prescriptions Queue
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Dispensed Today" value="54" helper={<span className="text-[var(--hc-success)]">↑ 8 from previous shift</span>} icon={CheckCircle} tone="teal" />
        <KpiCard label="Low Stock Items" value="03" helper={<span className="text-[var(--hc-warning)]">Requires stock order</span>} icon={AlertTriangle} tone="purple" />
        <KpiCard label="Critical Shortages" value="01" helper={<span className="text-[var(--hc-danger)]">Amoxicillin critical</span>} icon={AlertCircle} tone="red" />
        <KpiCard label="Expiring Lots (30d)" value="06" helper="Across 4 drug categories" icon={Clock} tone="blue" />
      </section>

      {/* Quick Alerts and Activities */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--hc-surface)] p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm">
          <h3 className="text-sm font-bold text-[var(--hc-text)] mb-3">Pharmacist Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/staff/inventory?action=movement" className="flex items-center gap-3 p-4 border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-all">
              <Truck className="w-5 h-5 text-[var(--hc-primary)]" />
              <div>
                <p className="text-sm font-bold text-[var(--hc-text)]">Stock Inbound</p>
                <p className="text-xs text-[var(--hc-text-muted)]">Log shipment deliveries</p>
              </div>
            </Link>
            <Link href="/staff/prescriptions" className="flex items-center gap-3 p-4 border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-all">
              <Layers className="w-5 h-5 text-[var(--hc-primary)]" />
              <div>
                <p className="text-sm font-bold text-[var(--hc-text)]">Dispense Drugs</p>
                <p className="text-xs text-[var(--hc-text-muted)]">Verify & complete orders</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-[var(--hc-surface)] p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--hc-text)] mb-2">Drug Expiration Warning</h3>
            <p className="text-xs text-[var(--hc-text-muted)] leading-relaxed mb-3">
              Review and isolate lots expiring within the next 30 days. Transfer nearing-expiry items to outpatient units first.
            </p>
            <div className="p-3 bg-[var(--hc-amber-bg)] border border-[var(--hc-amber-100)] rounded-[var(--radius-md)] text-xs text-[var(--hc-amber-700)] flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Notice: Insulin lot #IN-9812 expires in 12 days. Current stock: 8 vials.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stock Alerts Table */}
      <section className="mt-8 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-[var(--hc-text)]">Stock Levels & Expiration Monitor</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--hc-text-muted)]" />
              <input
                type="text"
                placeholder="Search drug name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hc-input w-[240px] pl-9"
              />
            </div>
            <select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hc-input text-xs"
            >
              <option value="All">All Levels</option>
              <option value="Normal">Normal</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th className="hc-th">DRUG ID</th>
                <th className="hc-th">DRUG NAME</th>
                <th className="hc-th">CATEGORY</th>
                <th className="hc-th">STOCK LEVEL</th>
                <th className="hc-th">MINIMUM SAFE</th>
                <th className="hc-th">STATUS</th>
                <th className="hc-th text-right">EXPIRING LOTS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--hc-surface-soft)]/50 transition-colors">
                    <td className="hc-td font-mono font-bold text-xs text-[var(--hc-text-muted)]">{item.id}</td>
                    <td className="hc-td font-semibold text-[var(--hc-text)]">{item.name}</td>
                    <td className="hc-td text-sm text-[var(--hc-text-muted)]">{item.category}</td>
                    <td className="hc-td text-sm font-mono font-bold text-[var(--hc-text)]">{item.stockLevel}</td>
                    <td className="hc-td text-sm font-mono text-[var(--hc-text-muted)]">{item.minLevel}</td>
                    <td className="hc-td"><StatusBadge label={item.status} tone={item.status === "Normal" ? "green" : item.status === "Low Stock" ? "amber" : item.status === "Critical" ? "red" : "neutral"} /></td>
                    <td className="hc-td text-sm font-semibold text-right text-[var(--hc-amber-600)]">{item.expiringLots > 0 ? `${item.expiringLots} lots` : "0"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="hc-td text-center py-12 text-[var(--hc-text-muted)]">
                    No matching stock items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
