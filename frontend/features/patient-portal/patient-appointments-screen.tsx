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

type PortalAppointment = {
  readonly appointmentId: string;
  readonly confirmationCode: string;
  readonly appointmentDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly doctorName: string;
  readonly status: string;
};

export function PatientAppointmentsScreen() {
  return (
    <PatientRouteGuard
      fallback={<PatientPortalRouteState title="Checking patient access" description="Restoring your session before loading appointments." />}
      forbiddenFallback={<PatientPortalRouteState title="Patient access required" description="This route is reserved for authenticated patient sessions." />}
    >
      <PatientAppointmentsContent />
    </PatientRouteGuard>
  );
}

function PatientAppointmentsContent() {
  const { apiFetch, logout } = useAuth();
  const [appointments, setAppointments] = useState<readonly PortalAppointment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void apiFetch<PortalAppointment[]>("/patient-portal/appointments", { scope: "patient" })
      .then(setAppointments)
      .catch((error) => setErrorMessage(toMessage(error)));
  }, [apiFetch]);

  return (
    <PatientPortalShell
      navItems={buildPatientPortalNav("/patient-portal/appointments")}
      subtitle="Patient appointments"
      title="My Appointments"
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
      <PatientPortalCard eyebrow="Visit history" title="Appointments">
        <div className={styles.appointmentList}>
          {appointments.map((appointment) => (
            <article key={appointment.appointmentId} className={styles.timelineItem}>
              <div>
                <div className={styles.primaryText}>{appointment.doctorName}</div>
                <div className={styles.meta}>
                  {appointment.appointmentDate} · {appointment.startTime} - {appointment.endTime}
                </div>
                <p className={styles.bodyText}>Confirmation {appointment.confirmationCode}</p>
              </div>
              <WorkspaceBadge tone={appointment.status === "DONE" ? "green" : "cyan"}>
                {appointment.status}
              </WorkspaceBadge>
            </article>
          ))}
        </div>
      </PatientPortalCard>
    </PatientPortalShell>
  );
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load appointments right now.";
}
