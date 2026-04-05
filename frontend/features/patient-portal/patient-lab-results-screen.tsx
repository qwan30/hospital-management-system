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

type PortalLabResult = {
  readonly labResultId: string;
  readonly appointmentId: string | null;
  readonly testName: string;
  readonly status: string;
  readonly resultSummary: string | null;
  readonly doctorComment: string | null;
  readonly attachmentUrl: string | null;
  readonly collectedAt: string;
};

export function PatientLabResultsScreen() {
  return (
    <PatientRouteGuard
      fallback={<PatientPortalRouteState title="Checking patient access" description="Restoring your session before loading lab results." />}
      forbiddenFallback={<PatientPortalRouteState title="Patient access required" description="This route is reserved for authenticated patient sessions." />}
    >
      <PatientLabResultsContent />
    </PatientRouteGuard>
  );
}

function PatientLabResultsContent() {
  const { apiFetch, logout } = useAuth();
  const [results, setResults] = useState<readonly PortalLabResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void apiFetch<PortalLabResult[]>("/patient-portal/lab-results", { scope: "patient" })
      .then(setResults)
      .catch((error) => setErrorMessage(toMessage(error)));
  }, [apiFetch]);

  return (
    <PatientPortalShell
      navItems={buildPatientPortalNav("/patient-portal/lab-results")}
      subtitle="Patient lab results"
      title="My Lab Results"
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
      <PatientPortalCard eyebrow="Reviewed results" title="Lab results">
        <div className={styles.list}>
          {results.map((result) => (
            <article key={result.labResultId} className={styles.listCard}>
              <div className={styles.primaryText}>{result.testName}</div>
              <div className={styles.meta}>{new Date(result.collectedAt).toLocaleDateString("en-GB")}</div>
              <p className={styles.bodyText}>{result.resultSummary || "No summary provided."}</p>
              <WorkspaceBadge tone="green">{result.status}</WorkspaceBadge>
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

  return "Unable to load lab results right now.";
}
