"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getPatientPortalOverview,
  listPatientPortalLabResults,
  type PatientPortalLabResultResponse,
  type PatientPortalOverviewResponse,
} from "@/lib/operations-api";

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
    <main className="p-8" data-testid="patient-portal-overview">
      <header className="mb-8 flex flex-col gap-2 border-b border-outline-variant/10 pb-4 lg:flex-row lg:items-baseline lg:justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-on-surface">
            Patient Portal Overview
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-outline">
            Welcome back, {overview?.patientFullName ?? "patient"}
          </p>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-outline">
          Live portal data
        </span>
      </header>

      {error ? (
        <section className="mb-8 border border-error-container bg-white p-6" role="alert">
          <p className="text-sm font-semibold text-error">{error}</p>
        </section>
      ) : null}

      <section className="mb-8 bg-surface-container-low p-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          Care Summary
        </p>
        <h2 className="max-w-4xl text-4xl font-light leading-tight">
          Your current portal record has {pluralize(metrics.upcomingAppointments, "upcoming appointment")} and{" "}
          {pluralize(metrics.labResults, "available lab result")}.
        </h2>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/portal/records"
            className="inline-flex h-12 items-center bg-primary-container px-6 font-semibold text-on-primary"
          >
            View Records
          </Link>
          <Link
            href="/portal/messages"
            className="inline-flex h-12 items-center bg-on-surface px-6 font-semibold text-surface"
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
            <h3 className="text-xl font-semibold text-on-surface">
              Recent Laboratory Reports
            </h3>
            <Link
              className="border-b-2 border-primary text-xs font-bold uppercase tracking-widest text-primary"
              href="/portal/lab-results"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {labResults.slice(0, 3).map((result) => (
              <div
                key={result.labResultId}
                className="flex items-center justify-between bg-surface-container-low p-6"
              >
                <div className="flex items-center gap-6">
                  <div className="h-12 w-1 bg-primary" />
                  <div>
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-outline">
                      {formatDate(result.collectedAt)}
                    </div>
                    <h4 className="font-semibold text-on-surface">{result.testName}</h4>
                    {result.resultSummary ? (
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {result.resultSummary}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold uppercase text-primary">
                    {result.status}
                  </div>
                </div>
              </div>
            ))}
            {labResults.length === 0 ? (
              <div className="bg-surface-container-low p-6 text-sm font-semibold text-on-surface-variant">
                No lab results are available yet.
              </div>
            ) : null}
          </div>
        </div>

        <aside className="bg-surface-container-highest p-6">
          <h3 className="mb-4 text-xl font-semibold text-on-surface">Upcoming Care</h3>
          {overview?.nextAppointment ? (
            <div>
              <div className="mb-4 text-[11px] font-bold uppercase tracking-widest text-primary">
                {formatDate(overview.nextAppointment.appointmentDate)} at{" "}
                {overview.nextAppointment.startTime}
              </div>
              <h4 className="mb-2 text-2xl font-light">
                {overview.nextAppointment.doctorName}
              </h4>
              <p className="mb-6 text-sm text-on-surface-variant">
                Status: {overview.nextAppointment.status}
              </p>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
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
      className={`flex h-48 flex-col justify-between p-6 ${
        primary ? "bg-primary-container text-on-primary" : "bg-surface-container-highest"
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <div>
        <div className="text-4xl font-light">{value}</div>
        <div className="text-[11px] font-semibold uppercase tracking-widest">{label}</div>
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
