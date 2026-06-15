"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clipboard,
  Clock,
  RefreshCw,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import {
  getTodayAppointments,
  getTodayQueue,
  type ClinicalAppointmentResponse,
} from "@/lib/clinical-api";
import { getErrorMessage } from "@/lib/staff-queue";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

const INTAKE_STATUSES = ["CHECKED_IN", "IN_PROGRESS"];

export default function NurseIntakeBoardPage() {
  const [appointments, setAppointments] = useState<ClinicalAppointmentResponse[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [queueAppointments, todayAppointments] = await Promise.all([
        getTodayQueue(),
        getTodayAppointments(),
      ]);
      const nextAppointments = mergeAppointments(todayAppointments, queueAppointments)
        .filter((appointment) => INTAKE_STATUSES.includes(appointment.status));

      setAppointments(nextAppointments);
      setSelectedAppointmentId((current) =>
        current && nextAppointments.some((appointment) => appointment.appointmentId === current)
          ? current
          : nextAppointments[0]?.appointmentId ?? "",
      );
    } catch (loadError) {
      setAppointments([]);
      setSelectedAppointmentId("");
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadAppointments);
  }, [loadAppointments]);

  const selectedAppointment = useMemo(
    () =>
      appointments.find((appointment) => appointment.appointmentId === selectedAppointmentId)
      ?? null,
    [appointments, selectedAppointmentId],
  );

  const summary = useMemo(
    () => ({
      waiting: appointments.filter((appointment) => appointment.status === "CHECKED_IN").length,
      inProgress: appointments.filter((appointment) => appointment.status === "IN_PROGRESS").length,
      doctors: new Set(appointments.map((appointment) => appointment.doctorId)).size,
    }),
    [appointments],
  );

  return (
    <main className="mx-auto max-w-[1400px] p-8 pb-20">
      <PageHeader
        categoryLabel="NURSE STATION"
        title="Intake Board"
        description="Live checked-in patients from the queue and appointment APIs."
        action={
          <button
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-[var(--hc-surface)] px-4 py-2 text-sm font-bold text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)] disabled:opacity-60"
            type="button"
            onClick={loadAppointments}
            disabled={isLoading}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <KpiCard label="Waiting For Intake" value={String(summary.waiting)} helper="Checked-in patients" icon={Users} tone="blue" />
        <KpiCard label="In Consultation" value={String(summary.inProgress)} helper="Active handoffs" icon={Stethoscope} tone="teal" />
        <KpiCard label="Physicians Covered" value={String(summary.doctors)} helper="Today's queue" icon={UserCheck} tone="purple" />
      </section>

      {error ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-semibold text-[var(--hc-danger)]" role="alert">
          {error}
        </section>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] shadow-sm">
          <div className="border-b border-[var(--hc-border-soft)] px-6 py-4">
            <h2 className="text-sm font-bold text-[var(--hc-text)]">Today&apos;s Intake Queue</h2>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-xs font-bold uppercase tracking-widest text-[var(--hc-text-muted)]" aria-busy="true">
              Loading live intake patients...
            </div>
          ) : appointments.length > 0 ? (
            <div className="divide-y divide-[var(--hc-border-soft)]">
              {appointments.map((appointment) => (
                <button
                  className={`flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[var(--hc-primary-bg)] ${
                    selectedAppointmentId === appointment.appointmentId ? "bg-[var(--hc-primary-bg)]" : "bg-[var(--hc-surface)]"
                  }`}
                  key={appointment.appointmentId}
                  type="button"
                  onClick={() => setSelectedAppointmentId(appointment.appointmentId)}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--hc-surface-soft)] text-xs font-bold text-[var(--hc-primary)]">
                      {initials(appointment.patientFullName)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[var(--hc-text)]">
                        {appointment.patientFullName}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-[var(--hc-text-secondary)]">
                        {appointment.confirmationCode} | {appointment.doctorName}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--hc-surface-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
                    {appointment.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 p-8 text-sm font-semibold text-[var(--hc-text-secondary)]">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--hc-warning)]" aria-hidden="true" />
              No checked-in or in-progress patients are currently ready for nursing intake.
            </div>
          )}
        </section>

        <aside className="rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-bold text-[var(--hc-text)]">Selected Patient</h2>

          {selectedAppointment ? (
            <div className="space-y-5">
              <Info label="Patient" value={selectedAppointment.patientFullName} />
              <Info label="Doctor" value={selectedAppointment.doctorName} />
              <Info label="Appointment" value={selectedAppointment.confirmationCode} />
              <Info label="Time" value={`${selectedAppointment.startTime.slice(0, 5)} - ${selectedAppointment.endTime.slice(0, 5)}`} />
              <Info label="Status" value={selectedAppointment.status} />

              <Link
                className="hc-button-primary mt-6 flex h-12 w-full items-center justify-center gap-2 text-sm font-bold"
                href="/staff/vital-signs"
              >
                <Clipboard className="size-4" aria-hidden="true" />
                Open Vitals Recording
              </Link>
              <p className="flex items-center gap-2 text-xs font-semibold text-[var(--hc-text-secondary)]">
                <Clock className="size-4" aria-hidden="true" />
                Vitals are saved through the appointment vital-signs API.
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-[var(--hc-text-secondary)]">
              Select a queue patient to begin nursing intake.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

function mergeAppointments(...appointmentLists: ClinicalAppointmentResponse[][]) {
  return Array.from(
    appointmentLists.flat().reduce((byId, appointment) => {
      byId.set(appointment.appointmentId, appointment);
      return byId;
    }, new Map<string, ClinicalAppointmentResponse>()).values(),
  );
}

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">
        {label}
      </p>
      <p className="break-words text-sm font-bold text-[var(--hc-text)]">
        {value}
      </p>
    </div>
  );
}
