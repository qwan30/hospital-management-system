"use client";

import { useSearchParams } from "next/navigation";
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
import type { InternalAssistantMode } from "../internal-assistant/internal-assistant.types";
import styles from "./medical-record-editor-screen.module.css";

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Home", href: "/", icon: <HomeGlyph /> },
  { label: "Summary", href: "#summary", icon: <ClipboardGlyph />, active: true, badge: "Live note" },
  { label: "Orders", href: "#orders", icon: <SparkGlyph /> },
  { label: "Follow-up", href: "#follow-up", icon: <CalendarGlyph /> }
] as const;

export function MedicalRecordEditorScreen() {
  const searchParams = useSearchParams();
  const assistantMode = parseAssistantMode(searchParams.get("mode"));
  const assistantPatientId = searchParams.get("patientId");
  const assistantAppointmentId = searchParams.get("appointmentId");
  const patientLabel = searchParams.get("patientName");
  const appointmentLabel = searchParams.get("appointmentLabel");

  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="Medical Record Editor"
      meta="Clinical note · Assessment · Orders · Follow-up planning"
      navItems={navItems}
      userName="Dr. Sarah Chen"
      userRole="Editing current note"
      topbarLead={
        <div className={styles.toolbarCard}>
          <div className={styles.toolbarText}>
            Chart is synchronized with the latest nurse handoff and imaging metadata.
          </div>
          <WorkspaceBadge tone="green">Auto-save healthy</WorkspaceBadge>
        </div>
      }
      topbarActions={
        <>
          <WorkspaceAction href="#assistant" tone="ghost">
            Open assistant
          </WorkspaceAction>
          <WorkspaceAction href="/doctor-dashboard" tone="secondary">
            View dashboard
          </WorkspaceAction>
          <WorkspaceAction tone="primary">Save note</WorkspaceAction>
        </>
      }
      sidebarFooter={
        <WorkspaceAction href="/ai-booking" tone="ghost">
          Adjust follow-up booking
        </WorkspaceAction>
      }
    >
      <WorkspacePageIntro
        eyebrow="Patient chart"
        title="Johnathan Doe"
        summary="54 years old · Male · Episode 0789 · Active neurology consult. This workspace keeps SOAP notes, current vitals, prescription changes, and follow-up planning visible at the same time so the clinical decision stays coherent."
        aside={
          <>
            <WorkspaceBadge tone="green">Vitals captured 5 min ago</WorkspaceBadge>
            <WorkspaceBadge tone="navy">Doctor-owned note</WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="cyan"
          label="Blood pressure"
          value="116/76"
          description="No hypertensive risk signal during current visit."
        />
        <WorkspaceMetricCard
          accent="green"
          label="Pulse"
          value="72 bpm"
          description="Stable since nurse intake confirmation."
        />
        <WorkspaceMetricCard
          accent="slate"
          label="Oxygen"
          value="98%"
          description="No respiratory concern flagged in the current episode."
        />
        <WorkspaceMetricCard
          accent="amber"
          label="Temperature"
          value="36.4°C"
          description="Afebrile at the time of note completion."
        />
      </WorkspaceMetricGrid>

      <section className={styles.snapshotGrid} id="summary">
        <SnapshotCard label="Primary complaint" value="Migraine with aura" />
        <SnapshotCard label="AI duration" value="45 min" />
        <SnapshotCard label="Confirmation" value="HMS-NEURO-91" />
        <SnapshotCard label="Next follow-up" value="Tue · 09:15" />
      </section>

      <section className={styles.recordGrid}>
        <div>
          <WorkspacePanel eyebrow="SOAP summary" title="Clinical notes">
            <div className={styles.soapGrid}>
              <SoapCard
                title="Subjective"
                body="Patient reports persistent headaches, transient dizziness, and visual disturbance after prolonged concentration. Symptoms improve with rest but recur after high-focus work."
              />
              <SoapCard
                title="Objective"
                body="Vitals stable. Neurological exam broadly normal aside from mild photophobia. MRI scan metadata has been attached for review."
              />
              <SoapCard
                title="Assessment"
                body="Migraine with aura remains most likely. Differential still includes vestibular dysfunction and less likely medication-related trigger."
              />
              <SoapCard
                title="Plan"
                body="Continue acute migraine protocol, review MRI, refine medication guidance, and reassess in 48 hours if symptoms persist or worsen."
              />
            </div>
          </WorkspacePanel>

          <section className={styles.ordersGrid} id="orders">
            <WorkspacePanel eyebrow="Medication and dose" title="Prescription builder">
              <div className={styles.prescriptionTable}>
                <div className={styles.prescriptionHeader}>
                  <span>Medication</span>
                  <span>Dose</span>
                  <span>Frequency</span>
                  <span>Duration</span>
                </div>
                <div className={styles.prescriptionRow}>
                  <div>
                    <div className={styles.medicationName}>Metoprolol</div>
                    <div className={styles.medicationMeta}>Preventive migraine support</div>
                  </div>
                  <span>50 mg</span>
                  <span>Twice daily</span>
                  <span>14 days</span>
                </div>
                <div className={styles.prescriptionRow}>
                  <div>
                    <div className={styles.medicationName}>Ondansetron</div>
                    <div className={styles.medicationMeta}>PRN nausea support</div>
                  </div>
                  <span>4 mg</span>
                  <span>As needed</span>
                  <span>5 days</span>
                </div>
              </div>
            </WorkspacePanel>

            <WorkspacePanel eyebrow="Follow-up" title="Next appointment">
              <div className={styles.timelineCard} id="follow-up">
                <div className={styles.miniTitle}>Neurology review</div>
                <div className={styles.timelineText}>
                  Tuesday · 09:15 AM · Room 1104. Booking can be adjusted if MRI review changes the recommended care path.
                </div>
                <div className={styles.actionRow}>
                  <WorkspaceAction href="/ai-booking" tone="secondary">
                    Adjust booking
                  </WorkspaceAction>
                  <WorkspaceAction tone="primary">Confirm follow-up</WorkspaceAction>
                </div>
              </div>
            </WorkspacePanel>
          </section>
        </div>

        <div className={styles.sidebarGrid}>
          <WorkspacePanel eyebrow="Safety" title="Critical allergy">
            <div className={styles.alertCard}>
              <WorkspaceBadge tone="red">Penicillin reaction</WorkspaceBadge>
              <div className={styles.timelineText}>
                Penicillin reaction documented in prior episodes. Verify alternatives before finalizing medication orders or discharge instructions.
              </div>
            </div>
          </WorkspacePanel>

          <WorkspacePanel eyebrow="Visit snapshot" title="Current handoff">
            <div className={styles.listCard}>
              <ul className={styles.list}>
                <li className={styles.listItem}>Room preparation complete</li>
                <li className={styles.listItem}>MRI review pending neurologist interpretation</li>
                <li className={styles.listItem}>Nurse handoff attached to chart</li>
              </ul>
            </div>
          </WorkspacePanel>

          <WorkspacePanel eyebrow="Medication changes" title="Recent updates">
            <div className={styles.listCard}>
              <ul className={styles.list}>
                <li className={styles.listItem}>Acute migraine protocol started</li>
                <li className={styles.listItem}>Nausea medication added as PRN</li>
                <li className={styles.listItem}>Hydration target increased</li>
              </ul>
            </div>
          </WorkspacePanel>

          <WorkspacePanel eyebrow="Timeline" title="Episode progression">
            <div className={styles.timelineCard}>
              <ul className={styles.timelineList}>
                <li className={styles.timelineItem}>
                  <span className={styles.timelineDot} />
                  <div>
                    <div className={styles.timelineTime}>08:55</div>
                    <div className={styles.timelineTitle}>Nurse intake completed</div>
                    <div className={styles.timelineText}>
                      Vitals, symptom note, and room assignment synchronized to the chart.
                    </div>
                  </div>
                </li>
                <li className={styles.timelineItem}>
                  <span className={styles.timelineDot} />
                  <div>
                    <div className={styles.timelineTime}>09:12</div>
                    <div className={styles.timelineTitle}>Doctor review started</div>
                    <div className={styles.timelineText}>
                      Current note opened and imaging review queued.
                    </div>
                  </div>
                </li>
                <li className={styles.timelineItem}>
                  <span className={styles.timelineDot} />
                  <div>
                    <div className={styles.timelineTime}>09:28</div>
                    <div className={styles.timelineTitle}>Medication plan drafted</div>
                    <div className={styles.timelineText}>
                      Preventive and PRN medication options added to the prescription builder.
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </WorkspacePanel>
        </div>
      </section>

      <div className={styles.actionRow}>
        <WorkspaceAction href="/nurse-checkin" tone="ghost">
          Return to nurse queue
        </WorkspaceAction>
        <WorkspaceAction tone="secondary">Preview prescription</WorkspaceAction>
        <WorkspaceAction tone="primary">Send for review</WorkspaceAction>
      </div>

      <InternalAssistantPanel
        assistantId="assistant"
        appointmentId={assistantAppointmentId}
        appointmentLabel={appointmentLabel}
        mode={assistantMode}
        patientId={assistantPatientId}
        patientLabel={patientLabel}
        role="DOCTOR"
        summary="Ask about the current note, chart context, lab results, or approved internal guidance before finalizing the visit."
        title="Clinical assistant"
      />
    </WorkspaceShell>
  );
}

function SnapshotCard({
  label,
  value
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <article className={styles.snapshotCard}>
      <div className={styles.snapshotLabel}>{label}</div>
      <div className={styles.snapshotValue}>{value}</div>
    </article>
  );
}

function SoapCard({
  title,
  body
}: {
  readonly title: string;
  readonly body: string;
}) {
  return (
    <article className={styles.soapCard}>
      <h3 className={styles.soapTitle}>{title}</h3>
      <p className={styles.soapBody}>{body}</p>
    </article>
  );
}

function parseAssistantMode(value: string | null): InternalAssistantMode | undefined {
  if (value === "docs" || value === "patient" || value === "hybrid") {
    return value;
  }

  return undefined;
}
