"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  PlayCircle,
  RefreshCw,
  SkipForward,
  UserCheck,
  Users,
} from "lucide-react";
import {
  assignQueueRoom,
  callQueuePatient,
  checkInAppointment,
  completeQueueVisit,
  getTodayAppointments,
  getTodayQueue,
  skipQueuePatient,
  startQueueConsultation,
  type ClinicalAppointmentResponse,
} from "@/lib/clinical-api";
import {
  calculateAverageWaitMinutes,
  calculatePhysicianLoads,
  calculateWaitMinutes,
  filterOptions,
  formatTime,
  formatWait,
  getErrorMessage,
  getQueueFilter,
  getQueueState,
  getWaitBadgeClass,
  maskIdentifier,
  mergeAppointments,
  removeRecordKey,
  toLocalIsoDateTime,
  toQueueError,
  type PhysicianLoad,
  type QueueError,
  type QueueFilter,
} from "@/lib/staff-queue";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

const DEFAULT_CONSULT_ROOM = "Consult Room 1";

type QueueAction = "call" | "assign-room" | "skip" | "start-consultation" | "complete";

export default function QueueBoardPage() {
  const [appointments, setAppointments] = useState<ClinicalAppointmentResponse[]>([]);
  const [activeFilter, setActiveFilter] = useState<QueueFilter>("waiting");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<QueueError | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    appointmentId: string;
    action: QueueAction;
  } | null>(null);
  const [now, setNow] = useState(() => new Date());

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [queueAppointments, todayAppointments] = await Promise.all([
        getTodayQueue(),
        getTodayAppointments(),
      ]);
      setAppointments(mergeAppointments(todayAppointments, queueAppointments));
    } catch (loadError) {
      setAppointments([]);
      setError(toQueueError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadQueue(); }, [loadQueue]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const displayableAppointments = useMemo(
    () => appointments.filter((a) => getQueueFilter(a)),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return displayableAppointments.filter((a) => {
      const matchesTab = getQueueFilter(a) === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        [a.patientFullName, a.patientPhone, a.patientCccd, a.confirmationCode, a.doctorName]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesTab && matchesQuery;
    });
  }, [activeFilter, displayableAppointments, query]);

  const summary = useMemo(() => ({
    activePatients: displayableAppointments.length,
    averageWaitMinutes: calculateAverageWaitMinutes(displayableAppointments, now),
    physicianLoads: calculatePhysicianLoads(displayableAppointments),
  }), [displayableAppointments, now]);

  const handleCheckIn = async (appointment: ClinicalAppointmentResponse) => {
    setCheckingInId(appointment.appointmentId);
    setRowErrors((c) => removeRecordKey(c, appointment.appointmentId));
    try {
      const updated = await checkInAppointment(appointment.appointmentId, {
        checkedInAt: toLocalIsoDateTime(new Date()),
      });
      setAppointments((c) =>
        mergeAppointments(c.map((a) => (a.appointmentId === updated.appointmentId ? updated : a)), [updated]),
      );
      setActiveFilter("ready");
    } catch (e) {
      setRowErrors((c) => ({ ...c, [appointment.appointmentId]: getErrorMessage(e) }));
    } finally {
      setCheckingInId(null);
    }
  };

  const handleQueueAction = async (
    appointment: ClinicalAppointmentResponse,
    action: QueueAction,
    execute: () => Promise<ClinicalAppointmentResponse>,
    nextFilter?: QueueFilter,
  ) => {
    setPendingAction({ appointmentId: appointment.appointmentId, action });
    setRowErrors((c) => removeRecordKey(c, appointment.appointmentId));
    try {
      const updated = await execute();
      setAppointments((c) => mergeAppointments(c, [updated]));
      if (nextFilter) setActiveFilter(nextFilter);
    } catch (e) {
      setRowErrors((c) => ({ ...c, [appointment.appointmentId]: getErrorMessage(e) }));
    } finally {
      setPendingAction(null);
    }
  };

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <main className="p-8 pb-20 max-w-[1400px] mx-auto" aria-busy="true">
        <PageHeader categoryLabel="QUEUE" title="Queue Board" description="Live nurse queue — today" />
        <div className="mt-8 p-12 text-center bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[var(--hc-primary)] rounded-full animate-spin" />
          <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading today&apos;s nurse queue…</p>
        </div>
      </main>
    );
  }

  /* ─── Error ─── */
  if (error) {
    const isAuthError = error.status === 401 || error.status === 403;
    return (
      <main className="p-8 pb-20 max-w-[1400px] mx-auto">
        <PageHeader categoryLabel="QUEUE" title="Queue Board" description="Live nurse queue — today" />
        <section
          className="mt-8 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-8 rounded-[var(--radius-xl)]"
          data-testid={isAuthError ? "queue-unauthorized" : "queue-load-error"}
          role="alert"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-danger)] mb-2">
            {isAuthError ? "Queue access unavailable" : "Queue load failed"}
          </p>
          <h2 className="text-xl font-bold text-[var(--hc-text)]">{error.message}</h2>
          <button
            className="mt-4 hc-button-primary flex items-center gap-2"
            type="button"
            onClick={loadQueue}
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </section>
      </main>
    );
  }

  /* ─── Main Render ─── */
  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto" data-testid="queue-board">
      <PageHeader
        categoryLabel="QUEUE"
        title="Queue Board"
        description="Live nurse queue — today"
        action={
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            type="button"
            onClick={loadQueue}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* KPI Row */}
      <section className="mt-8 hc-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <KpiCard label="Active Patients" value={String(summary.activePatients)} icon={Users} tone="blue" />
        <KpiCard label="Average Wait" value={`${summary.averageWaitMinutes}m`} icon={Clock} tone="teal" />
        <KpiCard label="Physician Coverage" value={String(summary.physicianLoads.length)} helper="Active physicians" icon={UserCheck} tone="purple" />
      </section>

      {/* Filter Bar */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center p-1 bg-slate-100 rounded-[var(--radius-md)]">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              aria-pressed={activeFilter === option.value}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-sm)] transition-colors ${
                activeFilter === option.value
                  ? "bg-[var(--hc-primary)] text-white shadow-sm"
                  : "text-slate-500 hover:bg-white/70"
              }`}
              type="button"
              onClick={() => setActiveFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            aria-label="Filter queue"
            className="hc-input w-full pl-10"
            placeholder="Filter queue…"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Table */}
      <section className="mt-4 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th className="hc-th">QUEUE #</th>
                <th className="hc-th">PATIENT</th>
                <th className="hc-th">DOCTOR</th>
                <th className="hc-th">CHECKED-IN AT</th>
                <th className="hc-th">WAIT DURATION</th>
                <th className="hc-th">STATE</th>
                <th className="hc-th text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <QueueRow
                    key={appointment.appointmentId}
                    appointment={appointment}
                    now={now}
                    isCheckingIn={checkingInId === appointment.appointmentId}
                    pendingAction={
                      pendingAction?.appointmentId === appointment.appointmentId
                        ? pendingAction.action
                        : null
                    }
                    rowError={rowErrors[appointment.appointmentId]}
                    onCheckIn={handleCheckIn}
                    onCall={(a) => handleQueueAction(a, "call", () => callQueuePatient(a.appointmentId))}
                    onAssignRoom={(a) => handleQueueAction(a, "assign-room", () => assignQueueRoom(a.appointmentId, { roomName: DEFAULT_CONSULT_ROOM }))}
                    onSkip={(a) => handleQueueAction(a, "skip", () => skipQueuePatient(a.appointmentId))}
                    onStartConsultation={(a) => handleQueueAction(a, "start-consultation", () => startQueueConsultation(a.appointmentId), "in_progress")}
                    onCompleteVisit={(a) => handleQueueAction(a, "complete", () => completeQueueVisit(a.appointmentId))}
                  />
                ))
              ) : (
                <tr>
                  <td className="hc-td text-center py-12 text-slate-400" colSpan={7} data-testid="queue-empty">
                    {displayableAppointments.length === 0
                      ? "No appointments are currently in the staff queue."
                      : "No appointments match this queue filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--hc-border-soft)] flex flex-wrap items-center justify-between text-sm text-slate-500">
          <span>Displaying {filteredAppointments.length} of {displayableAppointments.length} queue patients</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-[var(--hc-success)]" /> Within target</span>
            <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-amber-500" /> Review required</span>
            <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-[var(--hc-danger)]" /> SLA breach</span>
          </div>
        </div>
      </section>

      {/* Physician Allocation */}
      <PhysicianAllocation loads={summary.physicianLoads} />
    </main>
  );
}

/* ─── Queue Row ─── */
function QueueRow({
  appointment, isCheckingIn, pendingAction, now, rowError,
  onCheckIn, onCall, onAssignRoom, onSkip, onStartConsultation, onCompleteVisit,
}: {
  appointment: ClinicalAppointmentResponse;
  isCheckingIn: boolean;
  pendingAction: QueueAction | null;
  now: Date;
  rowError?: string;
  onCheckIn: (a: ClinicalAppointmentResponse) => void;
  onCall: (a: ClinicalAppointmentResponse) => void;
  onAssignRoom: (a: ClinicalAppointmentResponse) => void;
  onSkip: (a: ClinicalAppointmentResponse) => void;
  onStartConsultation: (a: ClinicalAppointmentResponse) => void;
  onCompleteVisit: (a: ClinicalAppointmentResponse) => void;
}) {
  const waitMinutes = calculateWaitMinutes(appointment, now);
  const state = getQueueState(appointment);
  const canCheckIn = appointment.status === "CONFIRMED" && !appointment.checkedInAt;
  const isActionPending = pendingAction !== null;
  const isReady = appointment.status === "CHECKED_IN";
  const isInProgress = appointment.status === "IN_PROGRESS";

  return (
    <>
      <tr className="hover:bg-slate-50/50 transition-colors" data-testid="queue-row">
        <td className="hc-td font-mono font-bold text-[var(--hc-primary)]">
          #{appointment.confirmationCode || appointment.appointmentId.slice(0, 8)}
        </td>
        <td className="hc-td">
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E8F0FF] text-[var(--hc-primary)] text-[10px] font-bold">
              {appointment.patientFullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <span className="font-semibold text-[var(--hc-text)]">{appointment.patientFullName}</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase">{maskIdentifier(appointment.patientCccd)}</span>
            </div>
          </div>
        </td>
        <td className="hc-td text-sm font-medium text-[var(--hc-text)]">{appointment.doctorName}</td>
        <td className="hc-td text-sm text-slate-500">{appointment.checkedInAt ? formatTime(appointment.checkedInAt) : "Pending"}</td>
        <td className="hc-td">
          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${getWaitBadgeClass(waitMinutes)}`}>
            {formatWait(waitMinutes)}
          </span>
        </td>
        <td className="hc-td">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <span className={`h-2 w-2 rounded-full ${state.dotClass}`} />
            {state.label}
          </span>
        </td>
        <td className="hc-td text-right">
          {canCheckIn && (
            <button
              aria-label={`Check in ${appointment.patientFullName}`}
              className="hc-button-primary text-xs px-3 py-2"
              type="button"
              onClick={() => onCheckIn(appointment)}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? "Checking in…" : "Check in"}
            </button>
          )}
          {isReady && (
            <div className="flex flex-wrap justify-end gap-1.5">
              <ActionBtn icon={<ChevronRight className="w-3.5 h-3.5" />} label="Call" aria={`Call ${appointment.patientFullName}`} disabled={isActionPending} pending={pendingAction === "call"} onClick={() => onCall(appointment)} />
              <ActionBtn icon={<UserCheck className="w-3.5 h-3.5" />} label="Room" aria={`Assign room ${appointment.patientFullName}`} disabled={isActionPending} pending={pendingAction === "assign-room"} onClick={() => onAssignRoom(appointment)} />
              <ActionBtn icon={<PlayCircle className="w-3.5 h-3.5" />} label="Start" aria={`Start consultation ${appointment.patientFullName}`} disabled={isActionPending} pending={pendingAction === "start-consultation"} onClick={() => onStartConsultation(appointment)} />
              <ActionBtn icon={<SkipForward className="w-3.5 h-3.5" />} label="Skip" aria={`Skip ${appointment.patientFullName}`} disabled={isActionPending} pending={pendingAction === "skip"} onClick={() => onSkip(appointment)} tone="muted" />
            </div>
          )}
          {isInProgress && (
            <ActionBtn icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Complete" aria={`Complete visit ${appointment.patientFullName}`} disabled={isActionPending} pending={pendingAction === "complete"} onClick={() => onCompleteVisit(appointment)} tone="success" />
          )}
        </td>
      </tr>
      {rowError && (
        <tr className="border-b border-[var(--hc-danger-bg)]">
          <td className="hc-td text-sm font-semibold text-[var(--hc-danger)] bg-[var(--hc-danger-bg)]" colSpan={7} role="alert">
            {rowError}
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Action Button ─── */
function ActionBtn({
  icon, label, aria, disabled, pending, onClick, tone = "primary",
}: {
  icon: ReactNode;
  label: string;
  aria: string;
  disabled: boolean;
  pending: boolean;
  onClick: () => void;
  tone?: "primary" | "muted" | "success";
}) {
  const base = "inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-[var(--radius-md)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const tones: Record<string, string> = {
    primary: "bg-slate-100 text-[var(--hc-text)] hover:bg-[var(--hc-primary)] hover:text-white",
    muted: "bg-slate-100 text-slate-500 hover:bg-slate-200",
    success: "bg-[var(--hc-success-bg)] text-[var(--hc-success)] hover:bg-[var(--hc-success)] hover:text-white",
  };

  return (
    <button
      aria-label={aria}
      className={`${base} ${tones[tone]}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {icon} {pending ? "Saving…" : label}
    </button>
  );
}

/* ─── Physician Allocation ─── */
function PhysicianAllocation({ loads }: { loads: PhysicianLoad[] }) {
  if (loads.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold text-[var(--hc-text)] mb-4">Physician Allocation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loads.slice(0, 3).map((load) => (
          <div
            key={load.doctorId}
            className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-[var(--hc-primary)] mb-1">
                  {load.inProgress > 0 ? "In room" : "On duty"}
                </p>
                <h3 className="text-lg font-bold text-[var(--hc-text)]">{load.doctorName}</h3>
              </div>
              <Activity className="w-5 h-5 text-slate-300" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="uppercase tracking-wider text-slate-400">Queue Load</span>
                <span className="font-bold text-[var(--hc-text)]">{load.total} Patients</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full">
                <div className="h-full bg-[var(--hc-primary)] rounded-full" style={{ width: `${Math.min(load.total * 12, 100)}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {load.waiting} waiting, {load.ready} ready, {load.inProgress} in progress.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Needed import for PhysicianAllocation ─── */
function Activity({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
