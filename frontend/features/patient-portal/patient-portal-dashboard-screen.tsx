"use client";

import { useEffect, useState } from "react";
import { PatientRouteGuard } from "../auth/patient-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import { WorkspaceAction, WorkspaceBadge } from "../workspace-ui/workspace-ui";
import { buildPatientPortalNav } from "./patient-portal-nav";
import { PatientPortalCard, PatientPortalShell } from "../patient-portal-ui/patient-portal-ui";
import { PatientPortalRouteState } from "./patient-portal-route-state";
import styles from "./patient-portal-screen.module.css";

type PortalOverview = {
  readonly patientFullName: string;
  readonly upcomingAppointments: number;
  readonly unreadThreads: number;
  readonly availableLabResults: number;
  readonly nextAppointment: {
    readonly appointmentId: string;
    readonly confirmationCode: string;
    readonly appointmentDate: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly doctorName: string;
    readonly status: string;
  } | null;
};

export function PatientPortalDashboardScreen() {
  return (
    <PatientRouteGuard
      fallback={
        <PatientPortalRouteState
          title="Checking patient access"
          description="Restoring your patient session before loading the portal."
        />
      }
      forbiddenFallback={
        <PatientPortalRouteState
          title="Patient access required"
          description="This route is reserved for authenticated patient sessions."
        />
      }
    >
      <PatientPortalDashboardContent />
    </PatientRouteGuard>
  );
}

function PatientPortalDashboardContent() {
  const { apiFetch, logout } = useAuth();
  const [overview, setOverview] = useState<PortalOverview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void apiFetch<PortalOverview>("/patient-portal/overview", { scope: "patient" })
      .then((response) => {
        setOverview(response);
        setErrorMessage(null);
      })
      .catch((error) => {
        setErrorMessage(toMessage(error));
      });
  }, [apiFetch]);

  return (
    <PatientPortalShell
      navItems={buildPatientPortalNav("/patient-portal")}
      subtitle="Patient dashboard"
      title={overview?.patientFullName || "Patient portal"}
      topbarAction={
        <WorkspaceAction
          onClick={() => {
            void logout("patient").then(() => {
              window.location.assign("/patient-login");
            });
          }}
          tone="secondary"
        >
          Sign out
        </WorkspaceAction>
      }
    >
      {errorMessage ? <div className={styles.notice}>{errorMessage}</div> : null}

      <div className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <div className={styles.metricLabel}>Upcoming appointments</div>
          <div className={styles.metricValue}>{overview?.upcomingAppointments ?? 0}</div>
        </article>
        <article className={styles.metricCard}>
          <div className={styles.metricLabel}>Unread messages</div>
          <div className={styles.metricValue}>{overview?.unreadThreads ?? 0}</div>
        </article>
        <article className={styles.metricCard}>
          <div className={styles.metricLabel}>Lab results</div>
          <div className={styles.metricValue}>{overview?.availableLabResults ?? 0}</div>
        </article>
      </div>

      <div className={styles.grid}>
        <PatientPortalCard eyebrow="Next visit" title="Upcoming appointment">
          {overview?.nextAppointment ? (
            <div className={styles.listCard}>
              <div className={styles.primaryText}>{overview.nextAppointment.doctorName}</div>
              <div className={styles.meta}>
                {overview.nextAppointment.appointmentDate} · {overview.nextAppointment.startTime}
              </div>
              <p className={styles.bodyText}>
                Confirmation {overview.nextAppointment.confirmationCode} · Status {overview.nextAppointment.status}
              </p>
            </div>
          ) : (
            <p className={styles.bodyText}>No upcoming appointments are currently scheduled.</p>
          )}
        </PatientPortalCard>

        <PatientPortalCard eyebrow="Quick links" title="Patient portal areas">
          <div className={styles.list}>
            <div className={styles.listCard}>
              <div className={styles.primaryText}>Appointments</div>
              <p className={styles.bodyText}>Review future visits and prior completed consultations.</p>
            </div>
            <div className={styles.listCard}>
              <div className={styles.primaryText}>Lab results</div>
              <p className={styles.bodyText}>Check reviewed lab summaries and linked attachments.</p>
            </div>
            <div className={styles.listCard}>
              <div className={styles.primaryText}>Messages</div>
              <p className={styles.bodyText}>View recent care-team threads and message history.</p>
            </div>
          </div>
        </PatientPortalCard>
      </div>
    </PatientPortalShell>
  );
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load the patient portal right now.";
}
