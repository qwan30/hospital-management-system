"use client";

import { useMemo, useState, useEffect } from "react";
import {
  listPatientPortalAppointments,
  type PatientPortalAppointmentResponse,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";

type AppointmentTab = "upcoming" | "past";

function isUpcoming(appointment: PatientPortalAppointmentResponse) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(appointment.appointmentDate) >= today;
}

function formatDateParts(value: string) {
  const date = new Date(value);
  return {
    month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
    day: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date),
  };
}

function formatTimeRange(appointment: PatientPortalAppointmentResponse) {
  return `${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<PatientPortalAppointmentResponse[]>([]);
  const [activeTab, setActiveTab] = useState<AppointmentTab>("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    listPatientPortalAppointments()
      .then((result) => {
        if (isMounted) {
          setAppointments(result);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setAppointments([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load appointments.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const upcoming = appointments.filter(isUpcoming);
    return {
      upcomingCount: upcoming.length,
      totalCount: appointments.length,
      completedCount: appointments.filter((appointment) => appointment.status === "DONE").length,
    };
  }, [appointments]);

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        activeTab === "upcoming" ? isUpcoming(appointment) : !isUpcoming(appointment),
      ),
    [activeTab, appointments],
  );

  return (
    <main>
      <div className="mx-auto max-w-6xl p-8">
        <PageHeader 
          title="Patient Appointments"
          description="View your upcoming and past medical appointments."
          className="mb-8"
        />

        <div className="flex w-fit items-center gap-0 bg-[var(--hc-surface-soft)] p-1 rounded-[var(--radius-md)] mb-8">
          <button
            className={`px-8 py-2 text-xs font-bold rounded-[var(--radius-sm)] ${
              activeTab === "upcoming"
                ? "bg-white text-[var(--hc-blue-600)] shadow-[var(--shadow-sm)]"
                : "text-[var(--hc-text-secondary)] transition-colors hover:bg-white/50"
            }`}
            type="button"
            onClick={() => setActiveTab("upcoming")}
          >
            UPCOMING
          </button>
          <button
            className={`px-8 py-2 text-xs font-bold rounded-[var(--radius-sm)] ${
              activeTab === "past"
                ? "bg-white text-[var(--hc-blue-600)] shadow-[var(--shadow-sm)]"
                : "text-[var(--hc-text-secondary)] transition-colors hover:bg-white/50"
            }`}
            type="button"
            onClick={() => setActiveTab("past")}
          >
            PAST
          </button>
        </div>

        {error ? (
          <section className="mb-8 border border-[var(--hc-red-200)] bg-[var(--hc-red-50)] p-6 rounded-[var(--radius-md)]" role="alert">
            <p className="text-sm font-semibold text-[var(--hc-red-600)]">{error}</p>
          </section>
        ) : null}

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 space-y-4 lg:col-span-8">
            {isLoading ? (
              <DataPanel className="p-6" aria-busy="true">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
                  Loading patient appointments...
                </p>
              </DataPanel>
            ) : visibleAppointments.length > 0 ? (
              visibleAppointments.map((appointment) => (
                <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
              ))
            ) : (
              <DataPanel className="p-8 text-sm font-semibold text-[var(--hc-text-secondary)] text-center">
                {activeTab === "upcoming"
                  ? "No upcoming appointments are scheduled."
                  : "No past appointments are available."}
              </DataPanel>
            )}
          </div>

          <div className="col-span-12 space-y-8 lg:col-span-4">
            <DataPanel className="p-8">
              <h2 className="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--hc-text-placeholder)]">
                Summary Metrics
              </h2>
              <div className="space-y-8">
                <Metric value={summary.upcomingCount} label="Upcoming Visits" primary />
                <Metric value={summary.totalCount} label="Total Appointments" />
                <Metric value={summary.completedCount} label="Completed Visits" />
              </div>
            </DataPanel>

            <div className="bg-[var(--hc-blue-600)] rounded-[var(--radius-lg)] p-8 text-white">
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Unsupported Actions
              </h2>
              <p className="mb-6 text-xl font-medium leading-tight">
                Reschedule, cancel, and telehealth actions are not exposed by the current patient portal API.
              </p>
              <button
                className="w-full bg-white/10 rounded-[var(--radius-md)] py-4 text-xs font-bold uppercase tracking-widest text-white opacity-70"
                type="button"
                disabled
              >
                Actions Unavailable
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AppointmentCard({ appointment }: { appointment: PatientPortalAppointmentResponse }) {
  const date = formatDateParts(appointment.appointmentDate);

  return (
    <article className="hc-data-panel group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white shadow-[var(--shadow-card)] transition-all hover:border-[var(--hc-blue-200)] hover:shadow-[var(--shadow-card-hover)] md:flex-row md:items-center">
      <div className="flex items-start">
        <div className="flex min-w-[100px] flex-col items-center justify-center bg-[var(--hc-surface-soft)] p-6 border-r border-[var(--hc-border-soft)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            {date.month}
          </span>
          <span className="text-3xl font-bold leading-none text-[var(--hc-text)] mt-1">{date.day}</span>
        </div>
        <div className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="hc-badge bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] border border-[var(--hc-blue-100)]">
              {appointment.status}
            </span>
            <span className="text-xs font-medium text-[var(--hc-text-secondary)]">
              {formatTimeRange(appointment)}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--hc-text)]">{appointment.doctorName}</h2>
          <p className="text-sm font-medium text-[var(--hc-text-secondary)] mt-1">
            Confirmation {appointment.confirmationCode}
          </p>
        </div>
      </div>
      <div className="p-6 pt-0 md:pt-6 flex items-center gap-4">
        <button
          className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]"
          type="button"
          disabled
          title="Patient appointment changes are not supported by the current backend API"
        >
          Unsupported
        </button>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--hc-surface-soft)] group-hover:bg-[var(--hc-blue-50)] transition-colors">
          <HcIcon name="arrow_forward_ios" className="text-sm text-[var(--hc-text-placeholder)] group-hover:text-[var(--hc-blue-600)]" />
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  primary,
  value,
}: {
  label: string;
  primary?: boolean;
  value: number;
}) {
  return (
    <div>
      <span
        className={`text-5xl font-light tracking-tighter ${
          primary ? "text-[var(--hc-blue-600)]" : "text-[var(--hc-text)]"
        }`}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
        {label}
      </span>
    </div>
  );
}
