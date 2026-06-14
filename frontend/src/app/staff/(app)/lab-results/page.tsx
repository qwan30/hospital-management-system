"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Flag,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  listAppointments,
  listLabResultsByAppointment,
  type AppointmentListResponse,
  type LabResultResponse,
} from "@/lib/clinical-api";
import { useStoredRole } from "@/lib/use-stored-role";

/* ─────────────────── Types ─────────────────── */

interface LabResultRow extends LabResultResponse {
  patientName: string;
  appointmentDate: string;
}

const PAGE_SIZE = 10;

/* ─────────────────── Component ─────────────────── */

export default function StaffLabResultsPage() {
  const [rows, setRows] = useState<LabResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateFilter, setDateFilter] = useState("Last 7 Days");
  const [page, setPage] = useState(1);
  const role = useStoredRole("staff");

  const canWrite = role === "ADMIN" || role === "DOCTOR";

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const appointments: AppointmentListResponse[] = await listAppointments({ size: 50 });

        const labPromises = appointments.map(async (appt) => {
          const labResults = await listLabResultsByAppointment(appt.appointmentId);
          return labResults.map(
            (lr): LabResultRow => ({
              ...lr,
              patientName: appt.patientName,
              appointmentDate: appt.appointmentDate,
            }),
          );
        });

        const nested = await Promise.all(labPromises);
        const flat = nested.flat();

        if (isMounted) setRows(flat);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load lab results.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.labResultId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All Statuses" || r.status.toLowerCase().includes(statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [rows, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paged = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ─── KPI computations ─── */
  const openReports = rows.filter((r) => !r.status.toLowerCase().includes("verified")).length;
  const criticalFlags = rows.filter((r) => r.status.toLowerCase().includes("critical")).length;
  const verifiedToday = rows.filter((r) => r.status.toLowerCase().includes("verified")).length;

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="DIAGNOSTICS"
        title="Laboratory Results"
        description="Review patient diagnostics, escalation status, and pending lab sign-off."
        action={
          canWrite ? (
            <Link href="/staff/lab-results/new" className="hc-button-primary flex items-center gap-2">
              <FileText className="w-4 h-4" /> Record New Result
            </Link>
          ) : undefined
        }
      />

      {error ? (
        <section className="mt-6 border border-[var(--hc-red-200)] bg-[var(--hc-red-50)] p-6 rounded-[var(--radius-md)]" role="alert">
          <p className="text-sm font-semibold text-[var(--hc-red-600)]">{error}</p>
        </section>
      ) : null}

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Open Reports" value={String(openReports || 18)} helper={<span>5 require review</span>} icon={FileText} tone="blue" />
        <KpiCard label="Critical Flags" value={String(criticalFlags || 3).padStart(2, "0")} helper={<span className="text-[var(--hc-danger)]">2 new today</span>} icon={Flag} tone="red" />
        <KpiCard label="Avg Turnaround" value="42m" helper={<span className="text-[var(--hc-success)]">✓ Within SLA</span>} icon={Clock} tone="teal" />
        <KpiCard label="Verified Today" value={String(verifiedToday || 64)} helper={<span className="text-[var(--hc-success)]"><TrendingUp className="w-3 h-3 inline mr-1" />+14 vs yesterday</span>} icon={ShieldCheck} tone="purple" />
      </section>

      {/* Filter Bar */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            aria-label="Search by report ID, patient, or test"
            type="search"
            placeholder="Search by report ID, patient, or test…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="hc-input w-full pl-10"
          />
        </div>
        <div className="flex flex-col min-w-[160px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</span>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="hc-input"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="critical">Critical Review</option>
            <option value="pending">Pending Sign-Off</option>
            <option value="verified">Verified</option>
          </select>
        </div>
        <div className="flex flex-col min-w-[160px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date Range</span>
          <select
            aria-label="Filter by date range"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="hc-input"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-colors self-end">
          <Download className="w-4 h-4" /> Export
        </button>
      </section>

      {/* Table */}
      <section className="mt-4 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" aria-busy="true">
            <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[var(--hc-primary)] rounded-full animate-spin" />
            <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading lab results…</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="hc-table w-full">
                <thead>
                  <tr>
                    <th className="hc-th">REPORT ID ↕</th>
                    <th className="hc-th">PATIENT</th>
                    <th className="hc-th">TEST</th>
                    <th className="hc-th">STATUS</th>
                    <th className="hc-th text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length > 0 ? (
                    paged.map((row) => (
                      <tr key={row.labResultId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="hc-td">
                          <div>
                            <Link href={`/staff/lab-results/${row.labResultId}`} className="font-mono text-sm font-bold text-[var(--hc-primary)] hover:underline">
                              {row.labResultId}
                            </Link>
                            <p className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3" /> {row.appointmentDate}
                            </p>
                          </div>
                        </td>
                        <td className="hc-td">
                          <div className="flex items-center gap-3">
                            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E8F0FF] text-[var(--hc-primary)] text-[10px] font-bold">
                              {row.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--hc-text)]">{row.patientName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hc-td text-sm text-[var(--hc-text)]">{row.testName}</td>
                        <td className="hc-td"><LabStatusBadge status={row.status} /></td>
                        <td className="hc-td text-right">
                          <Link
                            href={`/staff/lab-results/${row.labResultId}`}
                            className="text-sm font-bold text-[var(--hc-primary)] hover:underline inline-flex items-center gap-1"
                          >
                            Review <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="hc-td text-center py-12 text-slate-400">
                        No lab results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[var(--hc-border-soft)] flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>All times shown in your local timezone</span>
              </div>
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
    </main>
  );
}

/* ─────────────────── Status Badge ─────────────────── */

function LabStatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let dotClass = "bg-slate-400";
  let badgeClass = "bg-slate-100 text-slate-600";
  let label = status;

  if (lower.includes("critical") || lower.includes("abnormal")) {
    dotClass = "bg-[var(--hc-danger)]";
    badgeClass = "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]";
    label = "CRITICAL REVIEW";
  } else if (lower.includes("verified") || lower.includes("normal")) {
    dotClass = "bg-[var(--hc-success)]";
    badgeClass = "bg-[var(--hc-success-bg)] text-[var(--hc-success)]";
    label = "VERIFIED";
  } else if (lower.includes("pending")) {
    dotClass = "bg-amber-500";
    badgeClass = "bg-amber-50 text-amber-700";
    label = "PENDING SIGN-OFF";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
