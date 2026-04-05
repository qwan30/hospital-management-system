"use client";

import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode
} from "react";
import { DoctorRouteGuard } from "../auth/doctor-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import type { InternalAssistantMode } from "../internal-assistant/internal-assistant.types";
import type {
  AppointmentDetail,
  AppointmentStatus,
  ClinicalAppointment,
  DashboardMetric
} from "./doctor-dashboard.types";
import {
  CalendarGlyph,
  ClipboardGlyph,
  HomeGlyph,
  LogoutGlyph,
  SearchGlyph,
  SparkGlyph,
  WorkspaceAction,
  WorkspaceBadge,
  WorkspaceMetricCard,
  WorkspaceMetricGrid,
  WorkspacePageIntro,
  WorkspacePanel,
  WorkspaceShell,
  type WorkspaceBadgeTone,
  type WorkspaceNavItem
} from "../workspace-ui";
import styles from "./doctor-dashboard-screen.module.css";

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Overview", href: "#overview", active: true, icon: <HomeGlyph /> },
  { label: "Schedule", href: "#schedule", icon: <CalendarGlyph /> },
  { label: "Queue", href: "#queue", icon: <ClipboardGlyph />, badge: "Live" },
  { label: "Medical record", href: "/medical-record-editor", icon: <SparkGlyph /> },
  { label: "Sign out", href: "/login", icon: <LogoutGlyph /> }
] as const;

export function DoctorDashboardScreen() {
  return (
    <DoctorRouteGuard
      fallback={
        <DashboardState
          title="Checking your doctor session"
          description="Restoring the in-memory access token from the refresh cookie."
        />
      }
      forbiddenFallback={
        <DashboardState
          title="Doctor access required"
          description="This vertical slice is currently wired only for doctor accounts."
        />
      }
    >
      <DoctorDashboardContent />
    </DoctorRouteGuard>
  );
}

export function DoctorDashboardContent() {
  const { apiFetch, logout, session } = useAuth();
  const [appointments, setAppointments] = useState<readonly ClinicalAppointment[]>([]);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredAppointments = filterAppointments(appointments, deferredSearchQuery);
  const queueAppointments = filteredAppointments.filter(
    (appointment) =>
      appointment.status === "CHECKED_IN" || appointment.status === "IN_PROGRESS"
  );
  const metrics = buildMetrics(appointments);
  const userName = session?.fullName ?? "Doctor";
  const assistantHref = detail
    ? buildAssistantHref(detail.patientId, detail.appointmentId, "hybrid")
    : null;

  const loadSchedule = useEffectEvent(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setAppointmentsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await apiFetch<ClinicalAppointment[]>("/me/schedule?date=today");
      setAppointments(response);
      setAppointmentsError(null);
    } catch (error) {
      setAppointmentsError(toMessage(error));
    } finally {
      if (mode === "initial") {
        setAppointmentsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  });

  useEffect(() => {
    void loadSchedule("initial");
  }, []);

  useEffect(() => {
    setSelectedAppointmentId((currentSelection) => {
      if (
        currentSelection &&
        appointments.some((item) => item.appointmentId === currentSelection)
      ) {
        return currentSelection;
      }

      return pickDefaultAppointment(appointments)?.appointmentId ?? null;
    });
  }, [appointments]);

  useEffect(() => {
    if (!selectedAppointmentId) {
      setDetail(null);
      setDetailError(null);
      return;
    }

    let active = true;
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    void apiFetch<AppointmentDetail>(`/appointments/${selectedAppointmentId}`)
      .then((response) => {
        if (active) {
          setDetail(response);
        }
      })
      .catch((error) => {
        if (active) {
          setDetailError(toMessage(error));
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
  }, [apiFetch, selectedAppointmentId]);

  useEffect(() => {
    let intervalId: number | null = null;

    const stopPolling = () => {
      if (intervalId != null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startPolling = () => {
      stopPolling();
      if (document.visibilityState !== "visible") {
        return;
      }

      intervalId = window.setInterval(() => {
        void loadSchedule("refresh");
      }, 30_000);
    };

    const handleVisibilityChange = () => {
      startPolling();
      if (document.visibilityState === "visible") {
        void loadSchedule("refresh");
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  async function handleStartConsultation(appointmentId: string) {
    setActionPending(true);
    setActionError(null);

    try {
      await apiFetch(`/appointments/${appointmentId}/status`, {
        body: { status: "IN_PROGRESS" },
        method: "PUT"
      });
      await loadSchedule("refresh");

      const refreshedDetail = await apiFetch<AppointmentDetail>(`/appointments/${appointmentId}`);
      setSelectedAppointmentId(appointmentId);
      setDetail(refreshedDetail);
      setDetailError(null);
    } catch (error) {
      setActionError(toMessage(error));
    } finally {
      setActionPending(false);
    }
  }

  async function handleLogout() {
    await logout();
    window.location.assign("/login");
  }

  if (appointmentsLoading) {
    return (
      <DoctorDashboardFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadSchedule("refresh");
        }}
        onSearchChange={setSearchQuery}
        refreshing={isRefreshing}
        searchQuery={searchQuery}
        userName={userName}
      >
        <DashboardState
          title="Loading today's doctor schedule"
          description="Pulling appointments, queue state, and your active patient focus from the HMS API."
        />
      </DoctorDashboardFrame>
    );
  }

  if (appointmentsError && appointments.length === 0) {
    return (
      <DoctorDashboardFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadSchedule("refresh");
        }}
        onSearchChange={setSearchQuery}
        refreshing={isRefreshing}
        searchQuery={searchQuery}
        userName={userName}
      >
        <DashboardState
          title="Unable to load the doctor dashboard"
          description={appointmentsError}
        />
      </DoctorDashboardFrame>
    );
  }

  return (
    <DoctorDashboardFrame
      onLogout={handleLogout}
      onRefresh={() => {
        void loadSchedule("refresh");
      }}
      onSearchChange={setSearchQuery}
      refreshing={isRefreshing}
      searchQuery={searchQuery}
      userName={userName}
    >
      <WorkspacePageIntro
        eyebrow="Doctor workflow"
        title="Doctor Dashboard"
        summary="Today's dashboard is backed by the live doctor schedule. Select a patient, start consultations from checked-in appointments, and jump straight into the medical record editor once a consultation is in progress."
        aside={
          <>
            <WorkspaceBadge tone="green">
              {isRefreshing ? "Refreshing..." : "Live schedule"}
            </WorkspaceBadge>
            <WorkspaceBadge tone="navy">
              {filteredAppointments.length} of {appointments.length} visible
            </WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        {metrics.map((metric) => (
          <WorkspaceMetricCard
            key={metric.label}
            accent={metricAccent(metric.accent)}
            label={metric.label}
            value={metric.value}
            description={metricDescription(metric.label)}
          />
        ))}
      </WorkspaceMetricGrid>

      {appointmentsError ? (
        <InlineAlert
          title="Latest refresh warning"
          description={appointmentsError}
          tone="amber"
        />
      ) : null}

      {appointments.length === 0 ? (
        <DashboardState
          title="No appointments scheduled today"
          description="The doctor schedule endpoint returned an empty list for today."
        />
      ) : (
        <>
          <section className={styles.primaryGrid}>
            <WorkspacePanel
              eyebrow="Patient spotlight"
              title={
                detail
                  ? detail.patientFullName
                  : detailLoading
                    ? "Loading patient detail"
                    : "Select an appointment"
              }
              aside={
                detail ? (
                  <WorkspaceBadge tone={statusTone(detail.status)}>
                    {formatStatus(detail.status)}
                  </WorkspaceBadge>
                ) : null
              }
            >
              <PatientSpotlight
                actionError={actionError}
                actionPending={actionPending}
                assistantHref={assistantHref}
                detail={detail}
                detailError={detailError}
                detailLoading={detailLoading}
                onRefresh={() => {
                  if (selectedAppointmentId) {
                    void loadSchedule("refresh");
                  }
                }}
                onStartConsultation={handleStartConsultation}
              />
            </WorkspacePanel>

            <WorkspacePanel
              eyebrow="Live appointments"
              title="Today's schedule"
              aside={
                <a className={styles.panelLink} href="#queue">
                  Jump to action queue
                </a>
              }
            >
              <div className={styles.scheduleList} id="schedule">
                {filteredAppointments.map((appointment) => (
                  <button
                    key={appointment.appointmentId}
                    className={
                      appointment.appointmentId === selectedAppointmentId
                        ? styles.scheduleButtonActive
                        : styles.scheduleButton
                    }
                    onClick={() => setSelectedAppointmentId(appointment.appointmentId)}
                    type="button"
                  >
                    <div className={styles.scheduleTime}>{appointment.startTime.slice(0, 5)}</div>
                    <div className={styles.scheduleInfo}>
                      <div className={styles.schedulePatient}>{appointment.patientFullName}</div>
                      <div className={styles.scheduleDetail}>
                        {appointment.confirmationCode} · {formatStatus(appointment.status)}
                      </div>
                    </div>
                    <WorkspaceBadge tone={statusTone(appointment.status)}>
                      {formatStatus(appointment.status)}
                    </WorkspaceBadge>
                  </button>
                ))}

                {filteredAppointments.length === 0 ? (
                  <div className={styles.queueEmpty}>
                    No appointments match the current search. Clear the search input to see the full day.
                  </div>
                ) : null}
              </div>
            </WorkspacePanel>
          </section>

          <WorkspacePanel eyebrow="Doctor actions" title="Active patient queue">
            <div className={styles.tableWrap} id="queue">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Confirmation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queueAppointments.map((appointment) => (
                    <tr key={appointment.appointmentId}>
                      <td>{appointment.startTime.slice(0, 5)}</td>
                      <td>{appointment.patientFullName}</td>
                      <td>
                        <WorkspaceBadge tone={statusTone(appointment.status)}>
                          {formatStatus(appointment.status)}
                        </WorkspaceBadge>
                      </td>
                      <td>{appointment.confirmationCode}</td>
                      <td>
                        {appointment.status === "CHECKED_IN" ? (
                          <WorkspaceAction
                            disabled={actionPending}
                            onClick={() => {
                              void handleStartConsultation(appointment.appointmentId);
                            }}
                            tone="primary"
                          >
                            Start consultation
                          </WorkspaceAction>
                        ) : (
                          <WorkspaceAction
                            href={`/medical-record-editor?appointmentId=${appointment.appointmentId}`}
                            tone="secondary"
                          >
                            Open medical record
                          </WorkspaceAction>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {queueAppointments.length === 0 ? (
                <div className={styles.queueEmpty}>
                  No checked-in or in-progress appointments match the current search.
                </div>
              ) : null}
            </div>
          </WorkspacePanel>
        </>
      )}
    </DoctorDashboardFrame>
  );
}

function DoctorDashboardFrame({
  children,
  onLogout,
  onRefresh,
  onSearchChange,
  refreshing,
  searchQuery,
  userName
}: {
  readonly children: ReactNode;
  readonly onLogout: () => void | Promise<void>;
  readonly onRefresh: () => void;
  readonly onSearchChange: (value: string) => void;
  readonly refreshing: boolean;
  readonly searchQuery: string;
  readonly userName: string;
}) {
  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="Doctor Dashboard"
      meta="Live schedule · Clinical queue · Patient detail"
      navItems={navItems}
      userName={userName}
      userRole="Doctor session"
      topbarLead={
        <label className={styles.searchField}>
          <SearchGlyph className={styles.searchIcon} />
          <input
            aria-label="Search doctor appointments"
            className={styles.searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search patient, phone, CCCD, or confirmation code"
            type="search"
            value={searchQuery}
          />
        </label>
      }
      topbarActions={
        <>
          <WorkspaceAction onClick={onRefresh} tone="secondary">
            {refreshing ? "Refreshing..." : "Refresh"}
          </WorkspaceAction>
          <WorkspaceAction onClick={() => void onLogout()} tone="ghost">
            Log out
          </WorkspaceAction>
        </>
      }
      sidebarFooter={
        <WorkspaceAction onClick={() => void onLogout()} tone="danger">
          Sign out
        </WorkspaceAction>
      }
    >
      {children}
    </WorkspaceShell>
  );
}

function PatientSpotlight({
  detail,
  detailLoading,
  detailError,
  actionPending,
  actionError,
  assistantHref,
  onStartConsultation,
  onRefresh
}: {
  readonly detail: AppointmentDetail | null;
  readonly detailLoading: boolean;
  readonly detailError: string | null;
  readonly actionPending: boolean;
  readonly actionError: string | null;
  readonly assistantHref: string | null;
  readonly onStartConsultation: (appointmentId: string) => Promise<void>;
  readonly onRefresh: () => void;
}) {
  if (detailLoading) {
    return (
      <div className={styles.stateBody}>
        <p className={styles.stateText}>
          Pulling the doctor-owned appointment detail contract for the selected patient.
        </p>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className={styles.stateBody}>
        <p className={styles.stateText}>{detailError}</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.stateBody}>
        <p className={styles.stateText}>
          Choose a patient from today's schedule to load their detail contract.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.spotlight}>
      <div className={styles.heroRow}>
        <div className={styles.avatar} aria-hidden="true">
          {toInitials(detail.patientFullName)}
        </div>
        <div className={styles.heroBody}>
          <div className={styles.heroMeta}>
            {formatGender(detail.patientGender)} · {formatDate(detail.patientDateOfBirth)} · Appointment{" "}
            {detail.appointmentId.slice(0, 8)}
          </div>
          <p className={styles.summary}>
            {detail.symptoms?.trim()
              ? detail.symptoms
              : "No symptom summary was stored for this appointment."}
          </p>
        </div>
      </div>

      <div className={styles.factGrid}>
        <FactCard label="Confirmation" value={detail.confirmationCode} />
        <FactCard label="AI duration" value={`${detail.aiDurationMinutes} min`} />
        <FactCard label="Today's slot" value={formatTimeRange(detail.startTime, detail.endTime)} />
      </div>

      <div className={styles.detailList}>
        <DetailRow label="Contact" value={`${detail.patientPhone} · ${detail.patientEmail}`} />
        <DetailRow label="Identity" value={detail.patientCccd} />
        <DetailRow
          label="Checked in"
          value={detail.checkedInAt ? formatTimestamp(detail.checkedInAt) : "Not checked in yet"}
        />
      </div>

      {actionError ? (
        <InlineAlert title="Action failed" description={actionError} tone="red" />
      ) : null}

      <div className={styles.actionRow}>
        {assistantHref ? (
          <WorkspaceAction href={assistantHref} tone="ghost">
            Open assistant
          </WorkspaceAction>
        ) : (
          <WorkspaceAction disabled tone="ghost">
            Open assistant
          </WorkspaceAction>
        )}

        {detail.status === "CHECKED_IN" ? (
          <WorkspaceAction
            disabled={actionPending}
            onClick={() => {
              void onStartConsultation(detail.appointmentId);
            }}
            tone="primary"
          >
            {actionPending ? "Starting consultation..." : "Start consultation"}
          </WorkspaceAction>
        ) : detail.status === "IN_PROGRESS" ? (
          <WorkspaceAction
            href={`/medical-record-editor?appointmentId=${detail.appointmentId}`}
            tone="primary"
          >
            Open medical record
          </WorkspaceAction>
        ) : (
          <WorkspaceAction disabled tone="secondary">
            Awaiting nurse check-in
          </WorkspaceAction>
        )}

        <WorkspaceAction onClick={onRefresh} tone="secondary">
          Refresh detail
        </WorkspaceAction>
      </div>
    </div>
  );
}

function FactCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <article className={styles.factCard}>
      <div className={styles.factLabel}>{label}</div>
      <div className={styles.factValue}>{value}</div>
    </article>
  );
}

function DetailRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className={styles.detailRow}>
      <div className={styles.detailLabel}>{label}</div>
      <div className={styles.detailValue}>{value}</div>
    </div>
  );
}

function InlineAlert({
  title,
  description,
  tone
}: {
  readonly title: string;
  readonly description: string;
  readonly tone: "amber" | "red";
}) {
  return (
    <div className={tone === "red" ? styles.inlineAlertRed : styles.inlineAlertAmber} role="alert">
      <div className={styles.inlineAlertTitle}>{title}</div>
      <div className={styles.inlineAlertText}>{description}</div>
    </div>
  );
}

function DashboardState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <section className={styles.stateCard}>
      <h2 className={styles.stateTitle}>{title}</h2>
      <p className={styles.stateText}>{description}</p>
    </section>
  );
}

function buildMetrics(appointments: readonly ClinicalAppointment[]): readonly DashboardMetric[] {
  return [
    {
      label: "Appointments today",
      value: appointments.length.toString().padStart(2, "0"),
      accent: "blue"
    },
    {
      label: "Checked in / waiting",
      value: appointments
        .filter((appointment) => appointment.status === "CHECKED_IN")
        .length.toString()
        .padStart(2, "0"),
      accent: "green"
    },
    {
      label: "In progress",
      value: appointments
        .filter((appointment) => appointment.status === "IN_PROGRESS")
        .length.toString()
        .padStart(2, "0"),
      accent: "slate"
    }
  ];
}

function pickDefaultAppointment(appointments: readonly ClinicalAppointment[]) {
  return (
    appointments.find((appointment) => appointment.status === "IN_PROGRESS") ??
    appointments.find((appointment) => appointment.status === "CHECKED_IN") ??
    appointments[0] ??
    null
  );
}

function filterAppointments(
  appointments: readonly ClinicalAppointment[],
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return appointments;
  }

  return appointments.filter((appointment) =>
    [
      appointment.patientFullName,
      appointment.patientPhone,
      appointment.patientCccd,
      appointment.confirmationCode,
      appointment.status
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

function toInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function formatGender(value: AppointmentDetail["patientGender"]) {
  if (value === "MALE") {
    return "Male";
  }

  if (value === "FEMALE") {
    return "Female";
  }

  return "Other";
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function formatStatus(status: AppointmentStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function statusTone(status: AppointmentStatus): WorkspaceBadgeTone {
  if (status === "CHECKED_IN" || status === "DONE") {
    return "green";
  }

  if (status === "IN_PROGRESS" || status === "CONFIRMED") {
    return "cyan";
  }

  if (status === "CANCELLED") {
    return "red";
  }

  return "amber";
}

function metricAccent(accent: DashboardMetric["accent"]) {
  switch (accent) {
    case "blue":
      return "cyan" as const;
    case "green":
      return "green" as const;
    case "slate":
      return "slate" as const;
  }
}

function metricDescription(label: string) {
  switch (label) {
    case "Appointments today":
      return "All doctor-owned appointments for the current day.";
    case "Checked in / waiting":
      return "Patients ready for doctor action after nurse intake.";
    case "In progress":
      return "Consultations currently active in the live schedule.";
    default:
      return undefined;
  }
}

function buildAssistantHref(
  patientId: string,
  appointmentId: string,
  mode: InternalAssistantMode
) {
  const params = new URLSearchParams({
    assistant: "1",
    appointmentId,
    mode,
    patientId
  });

  return `/patient-records-management?${params.toString()}#assistant`;
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected request failure.";
}
