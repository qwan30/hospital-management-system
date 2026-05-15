"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAppointments,
  updateAppointmentStatus,
  type AppointmentListResponse,
  type ClinicalAppointmentStatus,
} from "@/lib/clinical-api";
import { getErrorMessage } from "@/lib/staff-queue";

import { HcIcon } from "@/components/ui/hc-icon";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { Users, UserCheck, Activity, CheckCircle2 } from "lucide-react";

const STATUS_FILTERS: Array<"ALL" | ClinicalAppointmentStatus> = [
  "ALL",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
];

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeRange(appointment: AppointmentListResponse) {
  return `${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`;
}

function statusClass(status: ClinicalAppointmentStatus) {
  if (status === "IN_PROGRESS") {
    return "bg-[var(--hc-blue-500)] text-white";
  }
  if (status === "CHECKED_IN") {
    return "bg-[var(--hc-teal-100)] text-[var(--hc-teal-800)]";
  }
  if (status === "DONE") {
    return "bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)]";
  }
  if (status === "CANCELLED") {
    return "bg-[#FFF5F5] text-[var(--hc-danger)] border border-[var(--hc-danger-bg)]";
  }
  return "bg-[var(--hc-surface-soft)] text-[var(--hc-text)] border border-[var(--hc-border-soft)]";
}

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentListResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateInputValue(new Date()));
  const [statusFilter, setStatusFilter] = useState<"ALL" | ClinicalAppointmentStatus>("ALL");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listAppointments({
        date: selectedDate,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page: 0,
        size: 100,
      });
      setAppointments(result);
    } catch (loadError) {
      setAppointments([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return appointments;
    }

    return appointments.filter((appointment) =>
      [
        appointment.patientName,
        appointment.patientPhone,
        appointment.confirmationCode,
        appointment.doctorName,
        appointment.symptoms ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [appointments, query]);

  const summary = useMemo(
    () => ({
      total: appointments.length,
      checkedIn: appointments.filter((appointment) => appointment.status === "CHECKED_IN").length,
      inProgress: appointments.filter((appointment) => appointment.status === "IN_PROGRESS").length,
      done: appointments.filter((appointment) => appointment.status === "DONE").length,
    }),
    [appointments],
  );

  const handleStartConsultation = async (appointment: AppointmentListResponse) => {
    setUpdatingAppointmentId(appointment.appointmentId);
    setSuccessMessage(null);
    setRowErrors((current) => {
      const next = { ...current };
      delete next[appointment.appointmentId];
      return next;
    });

    try {
      const updatedAppointment = await updateAppointmentStatus(
        appointment.appointmentId,
        "IN_PROGRESS",
      );
      setSuccessMessage(`${updatedAppointment.patientFullName} moved to consultation.`);
      await loadAppointments();
    } catch (updateError) {
      setRowErrors((current) => ({
        ...current,
        [appointment.appointmentId]: getErrorMessage(updateError),
      }));
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  return (
    <div className="p-8 pb-20">
      <PageHeader
        title="Doctor Dashboard"
        description={`API backed appointment schedule for ${selectedDate}`}
      />

      <div className="hc-kpi-grid mb-[30px]">
        <KpiCard label="Appointments" value={summary.total.toString()} helper="Selected date" icon={Users} tone="blue" />
        <KpiCard label="Checked In" value={summary.checkedIn.toString()} helper="Ready for doctor" icon={UserCheck} tone="teal" />
        <KpiCard label="In Progress" value={summary.inProgress.toString()} helper="Active consults" icon={Activity} tone="purple" />
        <KpiCard label="Completed" value={summary.done.toString()} helper="Finished visits" icon={CheckCircle2} tone="blue" />
      </div>

      {successMessage ? (
        <div className="mb-4 border border-[var(--hc-success-bg)] bg-[#F0FDF4] p-4 text-[13px] font-medium text-[var(--hc-success)] rounded-[var(--radius-lg)]" role="status">
          {successMessage}
        </div>
      ) : null}

      <DataPanel
        filters={
          <>
            <div className="flex h-10 items-center rounded-md border border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] px-3 focus-within:border-[var(--hc-blue-500)] focus-within:ring-1 focus-within:ring-[var(--hc-blue-500)] w-64">
              <HcIcon name="search" className="mr-2 text-sm text-[var(--hc-text-secondary)]" />
              <input
                aria-label="Search appointments"
                className="w-full border-none bg-transparent text-[13px] placeholder-[var(--hc-text-secondary)] focus:outline-none focus:ring-0 text-[var(--hc-text)]"
                placeholder="Search by name, code, phone..."
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <input
              aria-label="Appointment date"
              className="h-10 rounded-md border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] px-3 text-[13px] font-medium focus:border-[var(--hc-blue-500)] focus:outline-none focus:ring-1 focus:ring-[var(--hc-blue-500)] text-[var(--hc-text)]"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
            <select
              aria-label="Appointment status"
              className="h-10 rounded-md border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] px-3 text-[13px] font-medium focus:border-[var(--hc-blue-500)] focus:outline-none focus:ring-1 focus:ring-[var(--hc-blue-500)] text-[var(--hc-text)] min-w-[140px]"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | ClinicalAppointmentStatus)
              }
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Status" : status}
                </option>
              ))}
            </select>
            <div className="flex-1" />
            <button
              className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-[var(--hc-surface)] px-4 text-[12px] font-bold uppercase tracking-widest text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)] disabled:opacity-60"
              type="button"
              onClick={loadAppointments}
              disabled={isLoading}
            >
              <HcIcon name="refresh" className="text-sm" />
              Refresh
            </button>
          </>
        }
      >
        {isLoading ? (
          <div className="p-12 text-center" aria-busy="true">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
              Loading doctor appointment schedule...
            </p>
          </div>
        ) : error ? (
          <div className="border-t border-[var(--hc-danger-bg)] bg-[#FFF5F5] p-12 text-center" role="alert">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--hc-danger)]">
              Appointment schedule unavailable
            </p>
            <h2 className="mt-3 text-2xl font-light text-[var(--hc-text)]">{error}</h2>
            <button
              className="mt-6 rounded-md bg-[var(--hc-blue-600)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[var(--hc-blue-700)] transition-colors"
              type="button"
              onClick={loadAppointments}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--hc-border)] bg-[var(--hc-surface-soft)]">
                  <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
                    Patient / Case ID
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
                    Time
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
                    Symptoms
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
                    Status
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
                    Doctor
                  </th>
                  <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hc-border-soft)]">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.appointmentId}
                      appointment={appointment}
                      rowError={rowErrors[appointment.appointmentId]}
                      isUpdating={updatingAppointmentId === appointment.appointmentId}
                      onStartConsultation={handleStartConsultation}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      className="p-10 text-center text-[13px] font-medium text-[var(--hc-text-secondary)]"
                      colSpan={6}
                    >
                      {appointments.length === 0
                        ? "No appointments found for this date and status."
                        : "No appointments match this search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>
    </div>
  );
}

function AppointmentRow({
  appointment,
  isUpdating,
  rowError,
  onStartConsultation,
}: {
  appointment: AppointmentListResponse;
  isUpdating: boolean;
  rowError?: string;
  onStartConsultation: (appointment: AppointmentListResponse) => void;
}) {
  const canStartConsultation = appointment.status === "CHECKED_IN";

  return (
    <>
      <tr className="group transition-colors hover:bg-[var(--hc-blue-50)]">
        <td className="p-4">
          <div className="text-[13px] font-bold text-[var(--hc-text)]">{appointment.patientName}</div>
          <div className="font-mono text-[11px] text-[var(--hc-text-secondary)]">
            {appointment.confirmationCode || appointment.appointmentId.slice(0, 8)}
          </div>
        </td>
        <td className="p-4 font-mono text-[13px] text-[var(--hc-text)]">{formatTimeRange(appointment)}</td>
        <td className="max-w-xs p-4 text-[13px] text-[var(--hc-text-secondary)]">
          {appointment.symptoms || "No symptoms recorded"}
        </td>
        <td className="p-4">
          <span
            className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${statusClass(
              appointment.status,
            )}`}
          >
            {appointment.status.replace("_", " ")}
          </span>
        </td>
        <td className="p-4 text-[13px] font-medium text-[var(--hc-text)]">{appointment.doctorName}</td>
        <td className="p-4">
          {canStartConsultation ? (
            <button
              className="rounded-md bg-[var(--hc-blue-600)] px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[var(--hc-blue-700)] disabled:opacity-60"
              type="button"
              onClick={() => onStartConsultation(appointment)}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving" : "Start Consultation"}
            </button>
          ) : (
            <button
              className="rounded-md border border-[var(--hc-border)] bg-[var(--hc-surface-soft)] px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] opacity-60"
              type="button"
              disabled
              title="Only checked-in appointments can move to consultation through this flow"
            >
              Unsupported
            </button>
          )}
        </td>
      </tr>
      {rowError ? (
        <tr className="bg-[#FFF5F5]">
          <td className="p-4 text-[13px] font-medium text-[var(--hc-danger)]" colSpan={6} role="alert">
            {rowError}
          </td>
        </tr>
      ) : null}
    </>
  );
}
