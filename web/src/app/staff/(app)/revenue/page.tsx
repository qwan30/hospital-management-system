"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDailyRevenueReport,
  getMonthlyRevenueReport,
  type DailyRevenueReportResponse,
  type MonthlyRevenueReportResponse,
  type RevenueDepartmentResponse,
} from "@/lib/operations-api";

import { HcIcon } from "@/components/ui/hc-icon";
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
      if (isMounted()) {
        setIsLoading(true);
      }
      try {
        if (mode === "daily") {
          const report = await getDailyRevenueReport(date);
          if (!isMounted()) {
            return;
          }
          setDailyReport(report);
          setMonthlyReport(null);
        } else {
          const report = await getMonthlyRevenueReport(month);
          if (!isMounted()) {
            return;
          }
          setMonthlyReport(report);
          setDailyReport(null);
        }
        setError(null);
      } catch (caught) {
        if (!isMounted()) {
          return;
        }
        setError(caught instanceof Error ? caught.message : "Unable to load revenue report.");
        setDailyReport(null);
        setMonthlyReport(null);
      } finally {
        if (isMounted()) {
          setIsLoading(false);
        }
      }
    },
    [date, mode, month],
  );

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadReport(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadReport]);

  const activeReport = mode === "daily" ? dailyReport : monthlyReport;
  const departmentBreakdown = dailyReport?.departmentBreakdown ?? [];
  const averageInvoiceValue =
    activeReport && activeReport.paidInvoiceCount > 0
      ? Number(activeReport.totalRevenue) / activeReport.paidInvoiceCount
      : 0;

  return (
    <main>
      <header className="flex justify-between items-center px-8 sticky top-0 z-50 h-16 w-full bg-[#fcf9f8] dark:bg-[#171717] border-b-0">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <HcIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40 text-sm" />
            <input
              className="bg-surface-container-low border-0 border-b-2 border-outline/20 focus:ring-0 text-[10px] font-semibold tracking-widest pl-10 w-64 h-10 transition-all"
              disabled
              placeholder="SEARCH UNSUPPORTED BY REPORT API"
              type="text"
            />
          </div>
          <div className="flex gap-4">
            <button className="text-primary-container font-['Public_Sans'] font-semibold uppercase text-[10px] px-2 h-10 border-b-2 border-primary-container" type="button">OVERVIEW</button>
            <button className="text-[#1c1b1b] dark:text-[#ffffff] font-['Public_Sans'] font-semibold uppercase text-[10px] px-2 h-10 border-b-2 border-transparent opacity-50" disabled type="button">ANALYTICS</button>
            <button className="text-[#1c1b1b] dark:text-[#ffffff] font-['Public_Sans'] font-semibold uppercase text-[10px] px-2 h-10 border-b-2 border-transparent opacity-50" disabled type="button">REPORTS</button>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l border-outline-variant/20 pl-6">
          <HcIcon name="account_circle" className="text-3xl text-primary" />
          <div className="text-[9px] leading-tight">
            <p className="font-bold uppercase tracking-tight">FINANCE</p>
            <p className="opacity-50 font-semibold uppercase">REVENUE READ</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="bg-on-surface text-surface text-[10px] px-2 py-0.5 font-black tracking-widest uppercase mb-4 inline-block">Finance Station</span>
            <h2 className="text-5xl font-light tracking-tighter text-on-surface">Revenue Monitor</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-surface-container-low p-1 h-12">
              <button
                className={`px-6 text-[10px] font-black tracking-widest ${mode === "daily" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface/40"}`}
                onClick={() => setMode("daily")}
                type="button"
              >
                DAILY
              </button>
              <button
                className={`px-6 text-[10px] font-black tracking-widest ${mode === "monthly" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface/40"}`}
                onClick={() => setMode("monthly")}
                type="button"
              >
                MONTHLY
              </button>
              <button className="px-6 text-[10px] font-black tracking-widest text-on-surface/40 opacity-50" disabled type="button">ANNUAL</button>
            </div>
            {mode === "daily" ? (
              <input aria-label="Revenue date" className="h-12 bg-surface-container-low px-4 text-xs font-bold" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
            ) : (
              <input aria-label="Revenue month" className="h-12 bg-surface-container-low px-4 text-xs font-bold" onChange={(event) => setMonth(event.target.value)} type="month" value={month} />
            )}
          </div>
        </div>

        {error ? (
          <div className="mb-8 border border-error/30 bg-error/10 p-4 text-sm font-medium text-error" role="alert">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mb-12 bg-surface-container-lowest p-8 text-sm font-medium text-on-surface-variant">
            Loading revenue report...
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-12 border-t-2 border-on-surface">
          <KpiCard label="Total Gross Revenue" value={formatCurrency(activeReport?.totalRevenue ?? 0)} note={mode.toUpperCase()} />
          <KpiCard label="Paid Invoices" value={String(activeReport?.paidInvoiceCount ?? 0)} note="Backend count" />
          <KpiCard label="Avg Treatment Value" value={formatCurrency(averageInvoiceValue)} note="Derived value" />
          <KpiCard label="Collection Rate" value="Unsupported" note="Not in revenue API" inverted />
        </div>

        <div className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-12">
              <h3 className="text-xs font-black tracking-[0.3em] uppercase">Revenue Breakdown</h3>
              <p className="text-[10px] font-bold opacity-60">{mode === "daily" ? date : month}</p>
            </div>
            <div className="h-64 flex items-end gap-2 border-b border-on-surface/10">
              {barValues(departmentBreakdown, activeReport?.totalRevenue ?? 0).map((height, index) => (
                <div className="flex-1 bg-primary opacity-80" key={`${height}-${index}`} style={{ height: `${height}%` }} />
              ))}
            </div>
            <p className="mt-4 text-[10px] font-bold opacity-50 uppercase tracking-widest">
              Monthly endpoint does not expose department breakdown.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container-highest p-8 flex-1">
              <h3 className="text-xs font-black tracking-[0.3em] uppercase mb-6">Report Scope</h3>
              <p className="text-xs font-semibold opacity-60 leading-relaxed">
                This screen renders only paid invoice revenue returned by the finance report API.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-8 border-l-4 border-primary-container">
              <h3 className="text-xs font-black tracking-[0.3em] uppercase mb-2">Unsupported</h3>
              <p className="text-xs font-semibold opacity-60 leading-relaxed">
                Claims, collection-rate, gateway latency, and annual reporting are not exposed by the current backend contract.
              </p>
            </div>
          </div>
        </div>

        <DepartmentTable departments={departmentBreakdown} mode={mode} />

        <div className="mt-12 flex justify-between items-center text-[10px] font-bold opacity-30 tracking-[0.2em] uppercase">
          <p>API: /reports/revenue/{mode === "daily" ? "daily" : "monthly"}</p>
          <p>Last Sync: current request</p>
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  note,
  inverted = false,
}: {
  label: string;
  value: string;
  note: string;
  inverted?: boolean;
}) {
  return (
    <div className={`${inverted ? "bg-primary-container text-surface" : "bg-surface-container-lowest"} p-8 border-r border-surface-container`}>
      <p className="text-[10px] font-black tracking-[0.2em] text-on-surface/50 mb-4 uppercase">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-light tracking-tighter tabular-nums">{value}</span>
        <span className="text-xs font-bold text-primary">{note}</span>
      </div>
    </div>
  );
}

function DepartmentTable({
  departments,
  mode,
}: {
  departments: RevenueDepartmentResponse[];
  mode: ReportMode;
}) {
  if (mode === "monthly") {
    return (
      <div className="bg-surface-container-lowest p-8 text-sm font-medium text-on-surface-variant">
        Department breakdown is only returned by the daily revenue endpoint.
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-8 text-sm font-medium text-on-surface-variant">
        No department revenue exists for the selected date.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest overflow-hidden">
      <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
        <h3 className="text-xs font-black tracking-[0.3em] uppercase">Department Performance Breakdown</h3>
        <button className="text-xs font-bold text-primary flex items-center gap-2 opacity-60" disabled type="button">
          EXPORT DATA <HcIcon name="download" className="text-sm" />
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low">
            <th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Department</th>
            <th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Paid Invoices</th>
            <th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Billed Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {departments.map((department) => (
            <tr className="hover:bg-surface-container-low/50 transition-colors" key={department.departmentName}>
              <td className="px-8 py-5 text-xs font-black">{department.departmentName}</td>
              <td className="px-8 py-5 text-xs tabular-nums">{department.invoiceCount}</td>
              <td className="px-8 py-5 text-xs font-semibold tabular-nums">{formatCurrency(department.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function barValues(departments: RevenueDepartmentResponse[], totalRevenue: number) {
  if (!departments.length || !totalRevenue) {
    return [8, 8, 8, 8];
  }

  return departments.map((department) => {
    const percentage = (Number(department.totalRevenue) / Number(totalRevenue)) * 100;
    return Math.max(8, Math.min(100, percentage));
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
