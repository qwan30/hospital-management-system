"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  DollarSign,
  FileText,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  getDailyRevenueReport,
  getMonthlyRevenueReport,
  type DailyRevenueReportResponse,
  type MonthlyRevenueReportResponse,
  type RevenueDepartmentResponse,
} from "@/lib/operations-api";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

type ReportMode = "daily" | "monthly";

export default function RevenueDashboardPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentMonth = useMemo(() => today.slice(0, 7), [today]);
  const [mode, setMode] = useState<ReportMode>("daily");
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(currentMonth);
  const [dailyReport, setDailyReport] = useState<DailyRevenueReportResponse | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyRevenueReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(
    async (isMounted: () => boolean = () => true) => {
      if (isMounted()) setIsLoading(true);
      try {
        if (mode === "daily") {
          const report = await getDailyRevenueReport(date);
          if (!isMounted()) return;
          setDailyReport(report);
          setMonthlyReport(null);
        } else {
          const report = await getMonthlyRevenueReport(month);
          if (!isMounted()) return;
          setMonthlyReport(report);
          setDailyReport(null);
        }
        setError(null);
      } catch (caught) {
        if (!isMounted()) return;
        setError(caught instanceof Error ? caught.message : "Unable to load revenue report.");
        setDailyReport(null);
        setMonthlyReport(null);
      } finally {
        if (isMounted()) setIsLoading(false);
      }
    },
    [date, mode, month],
  );

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadReport(() => mounted));
    return () => { mounted = false; };
  }, [loadReport]);

  const activeReport = mode === "daily" ? dailyReport : monthlyReport;
  const departmentBreakdown = dailyReport?.departmentBreakdown ?? [];
  const averageInvoiceValue =
    activeReport && activeReport.paidInvoiceCount > 0
      ? Number(activeReport.totalRevenue) / activeReport.paidInvoiceCount
      : 0;

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="FINANCE"
        title="Revenue Monitor"
        description="Paid invoice revenue and department breakdowns."
        action={
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 rounded-[var(--radius-md)] p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setMode("daily")}
                className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-xs font-bold transition-colors ${mode === "daily" ? "bg-white text-[var(--hc-primary)] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >DAILY</button>
              <button
                type="button"
                onClick={() => setMode("monthly")}
                className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-xs font-bold transition-colors ${mode === "monthly" ? "bg-white text-[var(--hc-primary)] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >MONTHLY</button>
            </div>

            {/* Date Picker */}
            {mode === "daily" ? (
              <input aria-label="Revenue date" className="hc-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            ) : (
              <input aria-label="Revenue month" className="hc-input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            )}

            <button type="button" onClick={loadReport as () => void} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-white hover:bg-slate-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Total Gross Revenue" value={formatCurrency(activeReport?.totalRevenue ?? 0)} helper={mode === "daily" ? date : month} icon={DollarSign} tone="blue" />
        <KpiCard label="Paid Invoices" value={String(activeReport?.paidInvoiceCount ?? 0)} helper="Backend count" icon={FileText} tone="teal" />
        <KpiCard label="Avg Treatment Value" value={formatCurrency(averageInvoiceValue)} helper="Derived value" icon={TrendingUp} tone="purple" />
        <KpiCard label="Collection Rate" value="N/A" helper="Not in revenue API" icon={BarChart3} tone="amber" />
      </section>

      {/* Error */}
      {error && <div className="mt-4 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--hc-danger)]" role="alert">{error}</div>}

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-12 text-center" aria-busy="true">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[var(--hc-primary)] rounded-full animate-spin" />
          <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading revenue report…</p>
        </div>
      )}

      {/* Chart + Sidebar */}
      {!isLoading && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Bar Chart */}
          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-[var(--hc-text)]">Revenue Breakdown</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{mode === "daily" ? date : month}</span>
            </div>
            <div className="h-56 flex items-end gap-2 border-b border-slate-100">
              {barValues(departmentBreakdown, activeReport?.totalRevenue ?? 0).map((height, i) => (
                <div
                  key={`${height}-${i}`}
                  className="flex-1 rounded-t-[var(--radius-sm)] bg-gradient-to-t from-[var(--hc-primary)] to-[var(--hc-blue-400)] transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Monthly endpoint does not expose department breakdown.</p>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-[var(--radius-xl)] p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Report Scope</h3>
              <p className="text-xs text-slate-400 leading-relaxed">This screen renders only paid invoice revenue returned by the finance report API.</p>
            </div>
            <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Unsupported Features</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Claims, collection-rate, gateway latency, and annual reporting are not exposed by the current backend contract.</p>
            </div>
          </div>
        </div>
      )}

      {/* Department Table */}
      {!isLoading && (
        <section className="mt-6 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          {mode === "monthly" ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-400">Department breakdown is only returned by the daily revenue endpoint.</div>
          ) : departmentBreakdown.length === 0 ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-400">No department revenue exists for the selected date.</div>
          ) : (
            <>
              <div className="px-6 py-4 flex justify-between items-center border-b border-[var(--hc-border-soft)]">
                <h3 className="text-sm font-bold text-[var(--hc-text)] flex items-center gap-2"><Building2 className="w-4 h-4 text-[var(--hc-primary)]" /> Department Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="hc-table w-full">
                  <thead>
                    <tr>
                      <th className="hc-th">DEPARTMENT</th>
                      <th className="hc-th">PAID INVOICES</th>
                      <th className="hc-th">BILLED AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentBreakdown.map((dept) => (
                      <tr key={dept.departmentName} className="hover:bg-slate-50/50 transition-colors">
                        <td className="hc-td font-semibold text-[var(--hc-text)]">{dept.departmentName}</td>
                        <td className="hc-td text-sm tabular-nums text-slate-600">{dept.invoiceCount}</td>
                        <td className="hc-td text-sm font-semibold tabular-nums text-[var(--hc-text)]">{formatCurrency(dept.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        <span>API: /reports/revenue/{mode === "daily" ? "daily" : "monthly"}</span>
        <span>Last Sync: current request</span>
      </div>
    </main>
  );
}

/* ─── Helpers ─── */
function barValues(departments: RevenueDepartmentResponse[], totalRevenue: number) {
  if (!departments.length || !totalRevenue) return [8, 8, 8, 8];
  return departments.map((d) => {
    const pct = (Number(d.totalRevenue) / Number(totalRevenue)) * 100;
    return Math.max(8, Math.min(100, pct));
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);
}
