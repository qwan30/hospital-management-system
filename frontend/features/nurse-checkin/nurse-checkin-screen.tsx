"use client";

import { useState } from "react";
import {
  CalendarGlyph,
  ClipboardGlyph,
  HomeGlyph,
  SparkGlyph,
  WorkspaceAction,
  WorkspaceBadge,
  WorkspaceMetricCard,
  WorkspaceMetricGrid,
  WorkspacePageIntro,
  WorkspacePanel,
  WorkspaceShell,
  type WorkspaceNavItem
} from "../workspace-ui";
import { InternalAssistantPanel } from "../internal-assistant/internal-assistant-panel";
import styles from "./nurse-checkin-screen.module.css";

const queueRows = [
  {
    time: "08:40",
    appointmentId: "appt-1104",
    assistantLabel: "Room 1104 · Neurology",
    assistantSummary: "Vitals done. Ready for the doctor handoff.",
    patientId: "patient-1104",
    patient: "Nina Scott",
    department: "Neurology",
    intake: "Vitals done",
    room: "Room 1104",
    state: "Ready"
  },
  {
    time: "09:10",
    appointmentId: "appt-1201",
    assistantLabel: "Room 1201 · General consult",
    assistantSummary: "Check-in complete. Queue ready for review.",
    patientId: "patient-1201",
    patient: "Jae Hoon",
    department: "General consult",
    intake: "Check-in complete",
    room: "Room 1201",
    state: "Queued"
  },
  {
    time: "09:45",
    appointmentId: "appt-1308",
    assistantLabel: "Lab Bay 3 · MRI follow-up",
    assistantSummary: "Waiting for nurse. Follow-up chart still open.",
    patientId: "patient-1308",
    patient: "Marco Park",
    department: "MRI follow-up",
    intake: "Waiting for nurse",
    room: "Lab Bay 3",
    state: "Delayed"
  }
] as const;

const boardColumns = [
  {
    title: "Ready for vitals",
    tone: "cyan" as const,
    items: ["A-42 · Jonathan Doe", "A-44 · Lara Kim"]
  },
  {
    title: "Prep complete",
    tone: "green" as const,
    items: ["A-39 · Nina Scott", "A-41 · Marco Park"]
  },
  {
    title: "Needs attention",
    tone: "amber" as const,
    items: ["A-47 · Jae Hoon"]
  }
] as const;

const rooms = [
  {
    name: "Room 1104",
    meta: "Neurology consult · Dr. Sarah Chen",
    state: "Ready"
  },
  {
    name: "Room 1106",
    meta: "General consult · Dr. Eliza North",
    state: "Occupied"
  },
  {
    name: "Lab Bay 3",
    meta: "Prep hold for scan review",
    state: "Preparing"
  },
  {
    name: "Room 1201",
    meta: "Overflow consult room",
    state: "Maintenance"
  }
] as const;

const stageLabels = ["Check-in", "Vitals", "Prep", "Lab", "Consult"] as const;

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Home", href: "/", icon: <HomeGlyph /> },
  { label: "Queue", href: "#queue", icon: <ClipboardGlyph />, active: true, badge: "Live" },
  { label: "Rooms", href: "#rooms", icon: <CalendarGlyph /> },
  { label: "Flow", href: "#prep", icon: <SparkGlyph /> }
] as const;

export function NurseCheckinScreen() {
  const [activeStage, setActiveStage] = useState<(typeof stageLabels)[number]>("Vitals");
  const [selectedQueueIndex, setSelectedQueueIndex] = useState(0);
  const selectedQueueRow = queueRows[selectedQueueIndex] ?? queueRows[0];

  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="Nurse Check-In"
      meta="Nursing station A · Intake queue · Consultation prep"
      navItems={navItems}
      userName="Mia Torres"
      userRole="Lead nurse"
      topbarLead={
        <div className={styles.toolbarCard}>
          <div className={styles.toolbarText}>
            Queue stability is good. Three patients are ready for the next operational handoff.
          </div>
          <WorkspaceBadge tone="green">No blocked rooms</WorkspaceBadge>
        </div>
      }
      topbarActions={
        <WorkspaceAction href="/doctor-dashboard" tone="secondary">
          Open doctor board
        </WorkspaceAction>
      }
      sidebarFooter={
        <WorkspaceAction tone="danger">Emergency alerts</WorkspaceAction>
      }
    >
      <WorkspacePageIntro
        eyebrow="Station overview"
        title="Nursing station A: patient check-in"
        summary="This screen keeps intake, vitals capture, room readiness, and queue movement in one place so the nurse station can move patients forward without losing clinical context."
        aside={
          <>
            <WorkspaceBadge tone="green">Queue stable</WorkspaceBadge>
            <WorkspaceBadge tone="navy">Desktop-first workflow</WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="cyan"
          label="Patients waiting"
          value="11"
          description="Three arrivals expected in the next 20 minutes."
        />
        <WorkspaceMetricCard
          accent="slate"
          label="Average intake"
          value="08 min"
          description="Measured from arrival confirmation to vitals completion."
        />
        <WorkspaceMetricCard
          accent="green"
          label="Rooms prepared"
          value="04"
          description="Consultation rooms ready for immediate handoff."
        />
        <WorkspaceMetricCard
          accent="amber"
          label="Exceptions"
          value="01"
          description="One delayed intake needs manual attention."
        />
      </WorkspaceMetricGrid>

      <section className={styles.contextGrid}>
        <WorkspacePanel eyebrow="Selected context" title="Assistant handoff">
          <div className={styles.contextSelector}>
            {queueRows.map((row, index) => (
              <button
                key={`${row.patientId}-${row.time}`}
                className={
                  index === selectedQueueIndex ? styles.contextButtonActive : styles.contextButton
                }
                aria-pressed={index === selectedQueueIndex}
                onClick={() => setSelectedQueueIndex(index)}
                type="button"
              >
                <div className={styles.contextButtonTitle}>{row.patient}</div>
                <div className={styles.contextButtonMeta}>
                  {row.room} / {row.department}
                </div>
                <div className={styles.contextButtonState}>{row.state}</div>
              </button>
            ))}
          </div>

          <div className={styles.contextDetail}>
            <div className={styles.contextDetailRow}>
              <span>Selected patient</span>
              <strong>{selectedQueueRow.patient}</strong>
            </div>
            <div className={styles.contextDetailRow}>
              <span>Appointment</span>
              <strong>
                {selectedQueueRow.time} / {selectedQueueRow.department}
              </strong>
            </div>
            <div className={styles.contextDetailRow}>
              <span>Room</span>
              <strong>{selectedQueueRow.room}</strong>
            </div>
            <div className={styles.contextDetailNote}>
              The assistant follows the selected queue item. Switching patients starts a separate thread.
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Selected patient" title="Context snapshot">
          <div className={styles.selectedSnapshot}>
            <Field label="Patient name" value={selectedQueueRow.patient} />
            <Field label="Queue number" value={selectedQueueRow.time} />
            <Field label="Department" value={selectedQueueRow.department} />
            <Field label="Assistant context" value={selectedQueueRow.assistantLabel} wide />
          </div>
          <div className={styles.contextDetailNote}>{selectedQueueRow.assistantSummary}</div>
        </WorkspacePanel>
      </section>

      <section className={styles.primaryGrid}>
        <WorkspacePanel eyebrow="Arrival intake" title="Reception handoff">
          <div className={styles.arrivalCard}>
            <div className={styles.fieldGrid}>
              <Field label="Patient name" value="Jonathan Doe" />
              <Field label="Queue number" value="A-42" />
              <Field label="Expected doctor" value="Dr. Sarah Chen" />
              <Field label="Arrival time" value="09:02" />
              <Field
                label="Reported concern"
                value="Recurring headache with dizziness after morning commute."
                wide
              />
            </div>
            <div className={styles.quickStats}>
              <StatCard label="Wait target" value="12 min" />
              <StatCard label="Escort needed" value="No" />
              <StatCard label="ID check" value="Verified" />
            </div>
            <div className={styles.actionRow}>
              <WorkspaceAction tone="ghost">Open intake form</WorkspaceAction>
              <WorkspaceAction tone="primary">Confirm arrival</WorkspaceAction>
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Clinical prep" title="Vitals and room readiness">
          <div className={styles.vitalsGrid} id="prep">
            <VitalCard label="Weight" value="62 kg" meta="Recorded 2 min ago" />
            <VitalCard label="BP" value="122/78" meta="Within standard range" />
            <VitalCard label="Pulse" value="84 bpm" meta="Slightly elevated" />
            <VitalCard label="Temp" value="36.8°C" meta="No fever detected" />
          </div>
          <div className={styles.stageList}>
            {stageLabels.map((label) => (
              <button
                key={label}
                className={`${styles.stageButton} ${
                  activeStage === label ? styles.stageButtonActive : ""
                }`}
                onClick={() => setActiveStage(label)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.actionRow}>
            <WorkspaceAction tone="secondary">Case form</WorkspaceAction>
            <WorkspaceAction tone="success">Push to consultation queue</WorkspaceAction>
          </div>
        </WorkspacePanel>
      </section>

      <section className={styles.queueGrid} id="queue">
        <WorkspacePanel eyebrow="Queue view" title="Today's active queue">
          <div className={styles.queueBoard}>
            <table className={styles.queueTable}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Intake</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {queueRows.map((row) => (
                  <tr key={`${row.time}-${row.patient}`}>
                    <td>{row.time}</td>
                    <td>{row.patient}</td>
                    <td>{row.department}</td>
                    <td>{row.intake}</td>
                    <td>
                      <WorkspaceBadge tone={mapTone(row.state)}>{row.state}</WorkspaceBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Board view" title="Queue board">
          <div className={styles.boardColumnList}>
            {boardColumns.map((column) => (
              <div key={column.title} className={styles.boardColumn}>
                <div className={styles.boardTitle}>
                  <WorkspaceBadge tone={column.tone}>{column.title}</WorkspaceBadge>
                </div>
                {column.items.map((item) => (
                  <div key={item} className={styles.boardCard}>
                    <div className={styles.boardTitle}>{item}</div>
                    <div className={styles.boardMeta}>
                      {column.title === "Needs attention"
                        ? "Manual nurse review required before room assignment."
                        : "Prepared for the next workflow step."}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </section>

      <WorkspacePanel eyebrow="Rooms" title="Consultation and prep spaces">
        <div className={styles.roomGrid} id="rooms">
          {rooms.map((room) => (
            <article key={room.name} className={styles.roomCard}>
              <div className={styles.roomHeader}>
                <div>
                  <div className={styles.roomName}>{room.name}</div>
                  <div className={styles.roomMeta}>{room.meta}</div>
                </div>
                <WorkspaceBadge tone={mapTone(room.state)}>{room.state}</WorkspaceBadge>
              </div>
              <WorkspaceAction tone="secondary">Update room state</WorkspaceAction>
            </article>
          ))}
        </div>
      </WorkspacePanel>

      <InternalAssistantPanel
        assistantId="assistant"
        appointmentId={selectedQueueRow.appointmentId}
        appointmentLabel={selectedQueueRow.assistantLabel}
        patientId={selectedQueueRow.patientId}
        patientLabel={selectedQueueRow.patient}
        role="NURSE"
        summary="Ask about the selected patient, queue handoff, chart context, or approved internal guidance before room assignment."
        title="Nurse assistant"
      />
    </WorkspaceShell>
  );
}

function Field({
  label,
  value,
  wide = false
}: {
  readonly label: string;
  readonly value: string;
  readonly wide?: boolean;
}) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{value}</div>
    </div>
  );
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function VitalCard({
  label,
  value,
  meta
}: {
  readonly label: string;
  readonly value: string;
  readonly meta: string;
}) {
  return (
    <div className={styles.vitalCard}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.vitalValue}>{value}</div>
      <div className={styles.vitalMeta}>{meta}</div>
    </div>
  );
}

function mapTone(value: string) {
  if (value === "Ready" || value === "Verified") {
    return "green" as const;
  }

  if (value === "Queued" || value === "Occupied") {
    return "cyan" as const;
  }

  return "amber" as const;
}
