"use client";

import { useDeferredValue, useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ClinicalRecordsRouteGuard } from "../auth/clinical-records-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import { InternalAssistantPanel } from "../internal-assistant/internal-assistant-panel";
import type { InternalAssistantMode } from "../internal-assistant/internal-assistant.types";
import {
  CalendarGlyph,
  ClipboardGlyph,
  HomeGlyph,
  SearchGlyph,
  WorkspaceAction,
  WorkspaceBadge,
  WorkspaceMetricCard,
  WorkspaceMetricGrid,
  WorkspacePageIntro,
  WorkspacePanel,
  WorkspaceShell,
  type WorkspaceNavItem
} from "../workspace-ui/workspace-ui";
import styles from "./patient-records-management-screen.module.css";

type PatientRecordListItem = {
  readonly patientId: string;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly dateOfBirth: string;
  readonly latestAppointmentDate: string | null;
  readonly totalAppointments: number;
};

type PatientHistoryAppointment = {
  readonly appointmentId: string;
  readonly appointmentDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly status: string;
  readonly doctorId: string;
  readonly doctorName: string;
  readonly medicalRecord: {
    readonly diagnosis: string | null;
  } | null;
};

type PatientRecordDetail = {
  readonly patientId: string;
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly cccd: string;
  readonly dateOfBirth: string;
  readonly occupation: string | null;
  readonly bloodType: string | null;
  readonly medicalHistory: string | null;
  readonly drugAllergies: string | null;
  readonly insuranceNumber: string | null;
  readonly appointments: readonly PatientHistoryAppointment[];
};

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Overview", href: "#overview", active: true, icon: <HomeGlyph /> },
  { label: "Search", href: "#search", icon: <SearchGlyph /> },
  { label: "Timeline", href: "#timeline", icon: <CalendarGlyph /> },
  { label: "Editor", href: "/medical-record-editor", icon: <ClipboardGlyph /> }
] as const;

export function PatientRecordsManagementScreen() {
  return (
    <ClinicalRecordsRouteGuard
      fallback={
        <RecordsState
          title="Checking records access"
          description="Restoring the secure session for patient record search."
        />
      }
      forbiddenFallback={
        <RecordsState
          title="Clinical access required"
          description="Only doctor, nurse, and admin accounts can access patient record management."
        />
      }
    >
      <PatientRecordsManagementContent />
    </ClinicalRecordsRouteGuard>
  );
}

function PatientRecordsManagementContent() {
  const { apiFetch, logout, session } = useAuth();
  const searchParams = useSearchParams();
  const assistantPatientId = searchParams.get("patientId");
  const assistantAppointmentId = searchParams.get("appointmentId");
  const assistantMode = parseAssistantMode(searchParams.get("mode"));
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [patients, setPatients] = useState<readonly PatientRecordListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(assistantPatientId);
  const [detail, setDetail] = useState<PatientRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userName = session?.fullName ?? "Clinical reviewer";
  const assistantRole =
    session?.role === "ADMIN" ? "ADMIN" : session?.role === "NURSE" ? "NURSE" : "DOCTOR";
  const assistantSelectedAppointment =
    detail?.appointments.find((appointment) => appointment.appointmentId === assistantAppointmentId) ??
    detail?.appointments[0] ??
    null;
  const assistantPatientLabel = detail
    ? `${detail.fullName} - ${detail.cccd}`
    : assistantPatientId
      ? `Selected patient ${assistantPatientId}`
      : null;
  const assistantAppointmentLabel = assistantSelectedAppointment
    ? `${formatDate(assistantSelectedAppointment.appointmentDate)} - ${assistantSelectedAppointment.startTime} - ${assistantSelectedAppointment.doctorName}`
    : assistantAppointmentId
      ? `Selected appointment ${assistantAppointmentId}`
      : null;

  const loadPatients = useEffectEvent(async (searchValue: string) => {
    setLoading(true);

    try {
      const path = searchValue.trim()
        ? `/patient-records?query=${encodeURIComponent(searchValue.trim())}`
        : "/patient-records";
      const response = await apiFetch<PatientRecordListItem[]>(path);
      setPatients(response);
      setSelectedPatientId((current) =>
        current && response.some((patient) => patient.patientId === current)
          ? current
          : assistantPatientId && response.some((patient) => patient.patientId === assistantPatientId)
            ? assistantPatientId
          : response[0]?.patientId ?? null
      );
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(toMessage(error));
      setPatients([]);
      setSelectedPatientId(null);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void loadPatients(deferredQuery);
  }, [deferredQuery]);

  useEffect(() => {
    if (assistantPatientId) {
      setSelectedPatientId(assistantPatientId);
    }
  }, [assistantPatientId]);

  useEffect(() => {
    if (!selectedPatientId) {
      setDetail(null);
      return;
    }

    let active = true;
    setDetailLoading(true);

    void apiFetch<PatientRecordDetail>(`/patient-records/${selectedPatientId}`)
      .then((response) => {
        if (active) {
          setDetail(response);
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(toMessage(error));
        }
      })
      .finally(() => {
        if (active) {
          setDetailLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [apiFetch, selectedPatientId]);

  async function handleLogout() {
    await logout("staff");
    window.location.assign("/login");
  }

  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="Patient Records"
      meta="Clinical records search · History review · Internal portal"
      navItems={navItems}
      userName={userName}
      userRole="Clinical records"
      topbarLead={
        <div className={styles.searchBar}>
          <SearchGlyph />
          <input
            aria-label="Search patient records"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by patient name, phone, email, or CCCD"
            type="search"
            value={query}
          />
        </div>
      }
      topbarActions={
        <>
          <WorkspaceAction href="#assistant" tone="ghost">
            Jump to assistant
          </WorkspaceAction>
          <WorkspaceAction href="/medical-record-editor" tone="secondary">
            Open medical record editor
          </WorkspaceAction>
        </>
      }
      sidebarFooter={
        <WorkspaceAction
          onClick={() => {
            void handleLogout();
          }}
          tone="primary"
        >
          Sign out
        </WorkspaceAction>
      }
    >
      <WorkspacePageIntro
        eyebrow="Internal portal"
        title="Patient records management"
        summary="Search patients by operational identifiers, keep the selected chart context pinned, and review a compact appointment timeline without leaving the internal workspace."
        aside={
          <>
            <WorkspaceBadge tone="cyan">{patients.length} visible patients</WorkspaceBadge>
            <WorkspaceBadge tone="navy">
              {detail?.appointments.length ?? 0} chart entries
            </WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="cyan"
          label="Visible patients"
          value={patients.length.toString().padStart(2, "0")}
          description="Filtered live list returned by the patient records API."
        />
        <WorkspaceMetricCard
          accent="green"
          label="Appointments"
          value={(detail?.appointments.length ?? 0).toString().padStart(2, "0")}
          description="Historical appointments visible for the selected patient."
        />
        <WorkspaceMetricCard
          accent="amber"
          label="Blood type"
          value={detail?.bloodType ?? "--"}
          description="Quick clinical identifier surfaced in the record panel."
        />
        <WorkspaceMetricCard
          accent="slate"
          label="Insurance"
          value={detail?.insuranceNumber ? "On file" : "Missing"}
          description="Insurance reference available for downstream operations."
        />
      </WorkspaceMetricGrid>

      {errorMessage ? <div className={styles.notice}>{errorMessage}</div> : null}

      <div className={styles.grid} id="search">
        <WorkspacePanel eyebrow="Search results" title="Matched patients">
          {loading ? (
            <p className={styles.emptyCopy}>Loading patient results...</p>
          ) : (
            <div className={styles.patientList}>
              {patients.map((patient) => (
                <button
                  key={patient.patientId}
                  className={
                    patient.patientId === selectedPatientId
                      ? styles.patientCardActive
                      : styles.patientCard
                  }
                  onClick={() => setSelectedPatientId(patient.patientId)}
                  type="button"
                >
                  <div>
                    <div className={styles.patientName}>{patient.fullName}</div>
                    <div className={styles.patientMeta}>
                      {patient.phone} · {patient.email}
                    </div>
                  </div>
                  <WorkspaceBadge tone="slate">
                    {patient.totalAppointments} visits
                  </WorkspaceBadge>
                </button>
              ))}
              {patients.length === 0 ? (
                <p className={styles.emptyCopy}>No patients match the current records query.</p>
              ) : null}
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Selected chart" title="Patient profile snapshot">
          {detailLoading ? (
            <p className={styles.emptyCopy}>Loading selected chart...</p>
          ) : detail ? (
            <div className={styles.profileCard} id="overview">
              <div className={styles.patientName}>{detail.fullName}</div>
              <div className={styles.patientMeta}>
                {detail.phone} · {detail.email} · {detail.cccd}
              </div>
              <div className={styles.profileGrid}>
                <div className={styles.profileMetric}>
                  <span>Occupation</span>
                  <strong>{detail.occupation || "Not provided"}</strong>
                </div>
                <div className={styles.profileMetric}>
                  <span>Drug allergies</span>
                  <strong>{detail.drugAllergies || "No known allergies"}</strong>
                </div>
                <div className={styles.profileMetric}>
                  <span>Medical history</span>
                  <strong>{detail.medicalHistory || "No history captured"}</strong>
                </div>
                <div className={styles.profileMetric}>
                  <span>Insurance</span>
                  <strong>{detail.insuranceNumber || "Not provided"}</strong>
                </div>
              </div>
            </div>
          ) : (
            <p className={styles.emptyCopy}>Select a patient to inspect the full chart.</p>
          )}
        </WorkspacePanel>
      </div>

      <WorkspacePanel eyebrow="Appointment timeline" title="Recent record history">
        <div className={styles.timelineList} id="timeline">
          {(detail?.appointments ?? []).map((appointment) => (
            <article key={appointment.appointmentId} className={styles.timelineItem}>
              <div>
                <div className={styles.patientName}>
                  {formatDate(appointment.appointmentDate)} · {appointment.startTime}
                </div>
                <div className={styles.patientMeta}>
                  {appointment.doctorName} · {appointment.status}
                </div>
              </div>
              <div className={styles.timelineDiagnosis}>
                {appointment.medicalRecord?.diagnosis || "No diagnosis saved"}
              </div>
            </article>
          ))}
          {(detail?.appointments ?? []).length === 0 ? (
            <p className={styles.emptyCopy}>No appointment history is available for the selected patient.</p>
          ) : null}
        </div>
      </WorkspacePanel>

      <InternalAssistantPanel
        assistantId="assistant"
        appointmentId={assistantAppointmentId ?? assistantSelectedAppointment?.appointmentId ?? null}
        appointmentLabel={assistantAppointmentLabel}
        mode={assistantMode}
        patientId={selectedPatientId}
        patientLabel={assistantPatientLabel}
        role={assistantRole}
        summary="Ask about the current chart, visit history, lab results, or internal SOPs tied to this patient context."
        title="Clinical assistant"
      />
    </WorkspaceShell>
  );
}

function RecordsState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <div className={styles.stateEyebrow}>Patient records</div>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{description}</p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load patient records right now.";
}

function parseAssistantMode(value: string | null): InternalAssistantMode | undefined {
  if (value === "docs" || value === "patient" || value === "hybrid") {
    return value;
  }

  return undefined;
}
