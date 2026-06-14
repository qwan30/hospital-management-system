"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  getMySchedule,
  type ClinicalAppointmentResponse,
} from "@/lib/clinical-api";

type ViewMode = "day" | "week";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentIsoWeek() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.ceil(
    (now.getTime() - jan1.getTime()) / 86_400_000,
  );
  const weekNum = Math.ceil((dayOfYear + jan1.getDay()) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function DoctorSchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedWeek, setSelectedWeek] = useState(currentIsoWeek);
  const [appointments, setAppointments] = useState<ClinicalAppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params =
        viewMode === "day"
          ? { date: selectedDate }
          : { week: selectedWeek };
      const data = await getMySchedule(params);
      setAppointments(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load schedule.",
      );
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, selectedDate, selectedWeek]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSchedule();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSchedule]);

  /* ─── Computed KPIs ─── */
  const totalAppointments = appointments.length;
  const checkedIn = appointments.filter((a) => a.status === "CHECKED_IN").length;
  const inProgress = appointments.filter((a) => a.status === "IN_PROGRESS").length;
  const completed = appointments.filter((a) => a.status === "DONE").length;

  const totalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const paged = appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="SCHEDULING"
        title="My Schedule"
        description="Contact administration for changes."
        action={
          <button
            type="button"
            onClick={loadSchedule}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Appointments" value={String(totalAppointments)} helper="Selected date" icon={Calendar} tone="blue" />
        <KpiCard label="Checked In" value={String(checkedIn)} helper="Ready for doctor" icon={Users} tone="teal" />
        <KpiCard label="In Progress" value={String(inProgress)} helper="Active consults" icon={Clock} tone="amber" />
        <KpiCard label="Completed" value={String(completed)} helper="Finished visits" icon={Calendar} tone="purple" />
      </section>

      {/* Filter Bar */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            aria-label="Search by name, code, phone"
            type="search"
            placeholder="Search by name, code, phone…"
            className="hc-input w-full pl-10"
          />
        </div>
        {viewMode === "day" ? (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="hc-input min-w-[160px]"
          />
        ) : (
          <input
            type="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="hc-input min-w-[160px]"
          />
        )}
        <select className="hc-input min-w-[140px]" aria-label="Filter by status">
          <option>All Status</option>
          <option>Confirmed</option>
          <option>Checked In</option>
          <option>In Progress</option>
          <option>Done</option>
          <option>Cancelled</option>
        </select>
        <div className="flex items-center p-1 bg-slate-100 rounded-[var(--radius-md)]">
          <button
            className={`px-5 py-2 text-xs font-bold rounded-[var(--radius-sm)] transition-colors ${
              viewMode === "day"
                ? "bg-white text-[var(--hc-primary)] shadow-sm"
                : "text-slate-500 hover:bg-white/50"
            }`}
            type="button"
            onClick={() => setViewMode("day")}
          >
            DAY
          </button>
          <button
            className={`px-5 py-2 text-xs font-bold rounded-[var(--radius-sm)] transition-colors ${
              viewMode === "week"
                ? "bg-white text-[var(--hc-primary)] shadow-sm"
                : "text-slate-500 hover:bg-white/50"
            }`}
            type="button"
            onClick={() => setViewMode("week")}
          >
            WEEK
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="mt-6 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-6 rounded-[var(--radius-xl)] flex items-center gap-6" role="alert">
          <div className="flex-shrink-0 w-16 h-16 bg-[var(--hc-danger-bg)] rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[var(--hc-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-danger)] mb-1">APPOINTMENT SCHEDULE UNAVAILABLE</p>
            <h3 className="text-lg font-bold text-[var(--hc-text)]">{error}</h3>
            <p className="mt-1 text-sm text-slate-500">We&apos;re having trouble retrieving the appointment schedule right now.</p>
          </div>
          <button type="button" onClick={loadSchedule} className="hc-button-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </section>
      )}

      {/* Table */}
      <section className="mt-4 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center" aria-busy="true">
            <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[var(--hc-primary)] rounded-full animate-spin" />
            <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading schedule…</p>
          </div>
        ) : appointments.length === 0 && !error ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-400">
            No appointments scheduled for this {viewMode === "day" ? "date" : "week"}.
          </div>
        ) : appointments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="hc-table w-full">
                <thead>
                  <tr>
                    <th className="hc-th">TIME</th>
                    <th className="hc-th">PATIENT</th>
                    <th className="hc-th">STATUS</th>
                    <th className="hc-th">DATE</th>
                    <th className="hc-th">DOCTOR</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((appt) => (
                    <tr key={appt.appointmentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="hc-td">
                        <span className="font-mono text-sm font-bold text-[var(--hc-primary)]">
                          {formatTime(appt.startTime)} to {formatTime(appt.endTime)}
                        </span>
                      </td>
                      <td className="hc-td">
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E8F0FF] text-[var(--hc-primary)] text-[10px] font-bold">
                            {appt.patientFullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium text-[var(--hc-text)]">{appt.patientFullName}</span>
                        </div>
                      </td>
                      <td className="hc-td"><ScheduleStatusBadge status={appt.status} /></td>
                      <td className="hc-td text-sm font-mono text-slate-500">{appt.appointmentDate}</td>
                      <td className="hc-td text-sm text-[var(--hc-text)]">{appt.doctorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--hc-border-soft)] text-sm">
              <span className="text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, appointments.length)} of {appointments.length}
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
        ) : null}
      </section>
    </main>
  );
}

function ScheduleStatusBadge({ status }: { status: string }) {
  const config: Record<string, { dot: string; bg: string }> = {
    CONFIRMED: { dot: "bg-[var(--hc-primary)]", bg: "bg-[#E8F0FF] text-[var(--hc-primary)]" },
    CHECKED_IN: { dot: "bg-[var(--hc-success)]", bg: "bg-[var(--hc-success-bg)] text-[var(--hc-success)]" },
    IN_PROGRESS: { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
    DONE: { dot: "bg-slate-400", bg: "bg-slate-100 text-slate-600" },
    CANCELLED: { dot: "bg-[var(--hc-danger)]", bg: "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]" },
    PENDING: { dot: "bg-slate-400", bg: "bg-slate-100 text-slate-500" },
  };

  const c = config[status] ?? config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.replace("_", " ")}
    </span>
  );
}
