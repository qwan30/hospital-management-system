"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Search,
  FileText,
  TrendingUp,
  Percent,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";

interface FinancialTransaction {
  id: string;
  patientName: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "Cash" | "Card" | "Bank Transfer";
  status: "Completed" | "Pending" | "Refunded";
  timestamp: string;
}

const MOCK_FIN_TRANSACTIONS: FinancialTransaction[] = [
  { id: "TXN-9021", patientName: "Elena Rodriguez", invoiceId: "INV-2026-003", amount: 150.00, paymentMethod: "Card", status: "Completed", timestamp: "14:10" },
  { id: "TXN-9022", patientName: "Sarah Connor", invoiceId: "INV-2026-004", amount: 320.50, paymentMethod: "Bank Transfer", status: "Completed", timestamp: "13:45" },
  { id: "TXN-9023", patientName: "Robert Downey", invoiceId: "INV-2026-005", amount: 45.00, paymentMethod: "Cash", status: "Completed", timestamp: "13:10" },
  { id: "TXN-9024", patientName: "David Miller", invoiceId: "INV-2026-006", amount: 85.00, paymentMethod: "Card", status: "Pending", timestamp: "12:55" },
  { id: "TXN-9025", patientName: "James Kendrick", invoiceId: "INV-2026-001", amount: 110.00, paymentMethod: "Card", status: "Refunded", timestamp: "10:30" },
];

export function AccountantDashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const filteredTxns = useMemo(() => {
    return MOCK_FIN_TRANSACTIONS.filter((t) => {
      const matchesSearch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || t.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPayment = paymentFilter === "All" || t.paymentMethod === paymentFilter;
      return matchesSearch && matchesPayment;
    });
  }, [searchQuery, paymentFilter]);

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="FINANCIAL OPERATIONS"
        title="Financial Ledger Dashboard"
        description="Verify daily patient collections, review unresolved invoices, verify clinical fee tariffs, and issue refunds."
        action={
          <div className="flex gap-2">
            <Link href="/staff/invoices" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[var(--hc-primary)] hover:bg-[var(--hc-blue-700)] text-white rounded-[var(--radius-md)] transition-all">
              <FileText className="w-4 h-4" /> View Invoice Registry
            </Link>
            <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-[var(--hc-surface)] hover:bg-[var(--hc-surface-soft)] transition-colors">
              <Download className="w-4 h-4 text-[var(--hc-text-muted)]" /> Export Ledger
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Daily Collections" value="$3,845.50" helper={<span className="text-[var(--hc-success)]">↑ 12% from yesterday</span>} icon={DollarSign} tone="teal" />
        <KpiCard label="Delinquent Invoices" value="08" helper={<span className="text-[var(--hc-danger)]">Requires follow-up calls</span>} icon={AlertCircle} tone="red" />
        <KpiCard label="Billing SLA Status" value="98.4%" helper="Target: 95% settlement rate" icon={Percent} tone="blue" />
        <KpiCard label="Refund Requests" value="01" helper={<span className="text-[var(--hc-warning)]">Awaiting supervisor signoff</span>} icon={Clock} tone="purple" />
      </section>

      {/* Accountant Quick Actions */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--hc-surface)] p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm">
          <h3 className="text-sm font-bold text-[var(--hc-text)] mb-3">Reconciliation Presets</h3>
          <div className="flex flex-col gap-2">
            <button type="button" className="flex items-center justify-between p-3 border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-all text-left">
              <div>
                <p className="text-xs font-bold text-[var(--hc-text)]">Generate Daily Bank Reconciliation</p>
                <p className="text-[10px] text-[var(--hc-text-muted)]">Crosscheck bank statement logs against system ledger payouts.</p>
              </div>
              <TrendingUp className="w-4 h-4 text-[var(--hc-primary)]" />
            </button>
            <button type="button" className="flex items-center justify-between p-3 border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-all text-left">
              <div>
                <p className="text-xs font-bold text-[var(--hc-text)]">Audit Pricing Tariff Exceptions</p>
                <p className="text-[10px] text-[var(--hc-text-muted)]">Review clinical waivers and patient discounts applied during checkout.</p>
              </div>
              <Percent className="w-4 h-4 text-[var(--hc-primary)]" />
            </button>
          </div>
        </div>

        <div className="bg-[var(--hc-surface)] p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--hc-text)] mb-2">Reconciliation Target Progress</h3>
            <div className="w-full bg-[var(--hc-surface-soft)] h-2.5 rounded-full mb-2">
              <div className="bg-[var(--hc-success)] h-2.5 rounded-full" style={{ width: "78%" }}></div>
            </div>
            <p className="text-xs text-[var(--hc-text-muted)] leading-relaxed">
              <strong>78%</strong> of today&apos;s invoice settlements have been successfully reconciled and locked into the financial ledger. Target: 100% before shift wrapup.
            </p>
          </div>
        </div>
      </section>

      {/* Financial Transactions Logs Table */}
      <section className="mt-8 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-[var(--hc-text)]">Daily Collections Ledger</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--hc-text-muted)]" />
              <input
                type="text"
                placeholder="Search Patient or Invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hc-input w-[240px] pl-9"
              />
            </div>
            <select
              aria-label="Filter payment method"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="hc-input text-xs"
            >
              <option value="All">All Payments</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th className="hc-th">TRANSACTION ID</th>
                <th className="hc-th">PATIENT</th>
                <th className="hc-th">INVOICE</th>
                <th className="hc-th">AMOUNT</th>
                <th className="hc-th">METHOD</th>
                <th className="hc-th">STATUS</th>
                <th className="hc-th text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length > 0 ? (
                filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-[var(--hc-surface-soft)]/50 transition-colors">
                    <td className="hc-td font-mono font-bold text-xs text-[var(--hc-text)]">{txn.id}</td>
                    <td className="hc-td font-semibold text-[var(--hc-text)]">{txn.patientName}</td>
                    <td className="hc-td text-sm text-[var(--hc-primary)] font-medium hover:underline">
                      <Link href={`/staff/invoices?search=${txn.invoiceId}`}>{txn.invoiceId}</Link>
                    </td>
                    <td className="hc-td text-sm font-mono font-bold text-[var(--hc-text)]">${txn.amount.toFixed(2)}</td>
                    <td className="hc-td text-sm text-[var(--hc-text-secondary)]">{txn.paymentMethod}</td>
                    <td className="hc-td"><StatusBadge label={txn.status} tone={txn.status === "Completed" ? "green" : txn.status === "Pending" ? "amber" : txn.status === "Refunded" ? "red" : "neutral"} /></td>
                    <td className="hc-td text-sm font-mono text-[var(--hc-text-muted)] text-right">{txn.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="hc-td text-center py-12 text-[var(--hc-text-muted)]">
                    No transactions found matching search query.
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
