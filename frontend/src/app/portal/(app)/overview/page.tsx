"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getPatientPortalOverview,
  listPatientPortalLabResults,
  type PatientPortalLabResultResponse,
  type PatientPortalOverviewResponse,
} from "@/lib/operations-api";

import { HcIcon } from "@/components/ui/hc-icon";
import { Skeleton } from "@/components/ui/skeleton";
export default function PatientPortalOverviewPage() {
  const [overview, setOverview] = useState<PatientPortalOverviewResponse | null>(null);
  const [labResults, setLabResults] = useState<PatientPortalLabResultResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getPatientPortalOverview(), listPatientPortalLabResults()])
      .then(([nextOverview, nextLabResults]) => {
        if (isMounted) {
          setOverview(nextOverview);
          setLabResults(nextLabResults);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setOverview(null);
          setLabResults([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load portal.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(
    () => ({
      unreadMessages: overview?.unreadThreads ?? overview?.unreadMessageCount ?? 0,
      labResults: overview?.availableLabResults ?? overview?.labResultCount ?? labResults.length,
      upcomingAppointments:
        overview?.upcomingAppointments ?? overview?.upcomingAppointmentCount ?? 0,
    }),
    [labResults.length, overview],
  );

  return (
    <main className="p-8 max-w-[1400px] mx-auto" data-testid="patient-portal-overview">
      <header className="mb-8 flex flex-col gap-2 border-b border-[var(--hc-border-soft)] pb-4 lg:flex-row lg:items-baseline lg:justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-[var(--hc-text)]">
            Patient Portal Overview
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
            Welcome back, {overview?.patientFullName ?? "patient"}
          </p>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
          Live portal data
        </span>
      </header>

      {!overview && !error ? (
        <div className="space-y-6" aria-busy="true">
          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] p-8 rounded-[var(--radius-xl)] space-y-3">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-10 w-96 rounded" />
            <div className="flex gap-4 mt-6">
              <Skeleton className="h-12 w-36 rounded-[var(--radius-md)]" />
              <Skeleton className="h-12 w-24 rounded-[var(--radius-md)]" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-[var(--radius-xl)]" />
            ))}
          </div>
        </div>
      ) : error ? (
        <section className="mb-8 border border-[var(--hc-danger)] bg-[var(--hc-surface)] p-6 rounded-[var(--radius-lg)]" role="alert">
          <p className="text-sm font-semibold text-[var(--hc-danger)]">{error}</p>
        </section>
      ) : null}

      <section className="mb-8 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] p-8 rounded-[var(--radius-xl)] shadow-sm">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)]">
          Care Summary
        </p>
        <h2 className="max-w-4xl text-4xl font-light leading-tight text-[var(--hc-text)]">
          Your current portal record has {pluralize(metrics.upcomingAppointments, "upcoming appointment")} and{" "}
          {pluralize(metrics.labResults, "available lab result")}.
        </h2>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/portal/records"
            className="inline-flex h-12 items-center rounded-[var(--radius-md)] bg-[var(--hc-primary)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
          >
            View Records
          </Link>
          <Link
            href="/portal/messages"
            className="inline-flex h-12 items-center rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] px-6 font-semibold text-[var(--hc-text)] transition-colors hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)]"
          >
            Messages
          </Link>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PortalMetric
          href="/portal/messages"
          icon="mail"
          value={metrics.unreadMessages}
          label={pluralize(metrics.unreadMessages, "unread message")}
        />
        <PortalMetric
          href="/portal/lab-results"
          icon="biotech"
          value={metrics.labResults}
          label={pluralize(metrics.labResults, "lab result")}
        />
        <PortalMetric
          href="/portal/appointments"
          icon="calendar_month"
          value={metrics.upcomingAppointments}
          label={pluralize(metrics.upcomingAppointments, "pending consultation")}
          primary
        />
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[var(--hc-text)]">
              Recent Laboratory Reports
            </h3>
            <Link
              className="border-b-2 border-[var(--hc-primary)] text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)]"
              href="/portal/lab-results"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {labResults.slice(0, 3).map((result) => (
              <div
                key={result.labResultId}
                className="flex items-center justify-between bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] p-6 rounded-[var(--radius-lg)] shadow-sm"
              >
                <div className="flex items-center gap-6">
                  <div className="h-12 w-1 rounded-full bg-[var(--hc-primary)]" />
                  <div>
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
                      {formatDate(result.collectedAt)}
                    </div>
                    <h4 className="font-semibold text-[var(--hc-text)]">{result.testName}</h4>
                    {result.resultSummary ? (
                      <p className="mt-1 text-xs text-[var(--hc-text-secondary)]">
                        {result.resultSummary}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold uppercase text-[var(--hc-primary)]">
                    {result.status}
                  </div>
                </div>
              </div>
            ))}
            {labResults.length === 0 ? (
              <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-6 text-sm font-semibold text-[var(--hc-text-secondary)] shadow-sm">
                No lab results are available yet.
              </div>
            ) : null}
          </div>
        </div>

        <aside className="bg-[var(--hc-surface-soft)] border border-[var(--hc-border-soft)] p-6 rounded-[var(--radius-xl)]">
          <h3 className="mb-4 text-xl font-semibold text-[var(--hc-text)]">Upcoming Care</h3>
          {overview?.nextAppointment ? (
            <div>
              <div className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-primary)]">
                {formatDate(overview.nextAppointment.appointmentDate)} at{" "}
                {overview.nextAppointment.startTime}
              </div>
              <h4 className="mb-2 text-2xl font-light text-[var(--hc-text)]">
                {overview.nextAppointment.doctorName}
              </h4>
              <p className="mb-6 text-sm text-[var(--hc-text-secondary)]">
                Status: {overview.nextAppointment.status}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--hc-text-secondary)]">
              No upcoming appointment is scheduled.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}

function PortalMetric({
  href,
  icon,
  value,
  label,
  primary,
}: {
  href: string;
  icon: string;
  value: number;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-48 flex-col justify-between p-6 rounded-[var(--radius-xl)] shadow-sm border transition-colors ${
        primary
          ? "bg-[var(--hc-primary)] text-white border-transparent"
          : "bg-[var(--hc-surface)] text-[var(--hc-text)] border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)]"
      }`}
    >
      <HcIcon name={icon} className={primary ? "text-white" : "text-[var(--hc-text-secondary)]"} />
      <div>
        <div className="text-4xl font-light">{value}</div>
        <div className={`text-[11px] font-semibold uppercase tracking-widest ${primary ? "text-white/80" : "text-[var(--hc-text-placeholder)]"}`}>{label}</div>
      </div>
    </Link>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}
