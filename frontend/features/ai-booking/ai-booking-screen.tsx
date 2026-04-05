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
import styles from "./ai-booking-screen.module.css";

type Specialist = {
  readonly id: string;
  readonly name: string;
  readonly specialty: string;
  readonly summary: string;
  readonly distance: string;
  readonly slot: string;
  readonly fit: string;
  readonly reason: string;
};

const specialists: readonly Specialist[] = [
  {
    id: "julian-vance",
    name: "Dr. Julian Vance",
    specialty: "Neurology",
    summary:
      "Strong match for recurrent headache clusters, aura symptoms, and dizziness after concentrated visual work.",
    distance: "2.4 km",
    slot: "Today · 14:15",
    fit: "94%",
    reason: "Symptom profile aligns with neurology triage template and the fastest near-term slot is available."
  },
  {
    id: "eliza-north",
    name: "Dr. Eliza North",
    specialty: "Internal Medicine",
    summary:
      "Useful fallback for broad diagnostic review when symptom severity is moderate and multi-system screening is needed.",
    distance: "3.8 km",
    slot: "Today · 15:45",
    fit: "89%",
    reason: "Suitable if the patient prefers a generalist evaluation before specialist routing."
  }
] as const;

const days = [
  { id: "mon", label: "Mon · 11 Sep" },
  { id: "tue", label: "Tue · 12 Sep" },
  { id: "wed", label: "Wed · 13 Sep" },
  { id: "thu", label: "Thu · 14 Sep" }
] as const;

const timeSlotsByDay: Record<(typeof days)[number]["id"], readonly string[]> = {
  mon: ["09:00", "10:30", "11:00", "14:15", "15:00", "16:30"],
  tue: ["08:30", "09:45", "11:15", "13:00", "15:30", "17:00"],
  wed: ["09:15", "10:15", "13:30", "14:45", "16:00", "17:15"],
  thu: ["08:45", "10:00", "11:30", "14:30", "15:45", "17:30"]
};

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Home", href: "/", icon: <HomeGlyph /> },
  { label: "Flow", href: "#intake", icon: <SparkGlyph />, active: true, badge: "Step 2" },
  { label: "Schedule", href: "#slot-selection", icon: <CalendarGlyph /> },
  { label: "Review", href: "#review", icon: <ClipboardGlyph /> }
] as const;

export function AiBookingScreen() {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(specialists[0].id);
  const [selectedDay, setSelectedDay] = useState<(typeof days)[number]["id"]>(days[0].id);
  const [selectedTime, setSelectedTime] = useState<string>(timeSlotsByDay[days[0].id][3]);

  const selectedSpecialist =
    specialists.find((specialist) => specialist.id === selectedSpecialistId) ?? specialists[0];

  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="AI Booking"
      meta="Guided intake · Specialist recommendation · Appointment confirmation"
      navItems={navItems}
      userName="Front Desk"
      userRole="AI assisted booking"
      topbarLead={
        <div className={styles.toolbarCard}>
          <div>
            <div className={styles.toolbarLabel}>Current routing decision</div>
            <div className={styles.toolbarValue}>Neurology recommended for migraine triage</div>
          </div>
          <WorkspaceBadge tone="green">Estimated intake 18 min</WorkspaceBadge>
        </div>
      }
      topbarActions={
        <WorkspaceAction href="/medical-record-editor" tone="secondary">
          View patient chart
        </WorkspaceAction>
      }
      sidebarFooter={
        <WorkspaceAction href="/doctor-dashboard" tone="primary">
          Open doctor board
        </WorkspaceAction>
      }
    >
      <WorkspacePageIntro
        eyebrow="Booking step 2"
        title="Specialist selection"
        summary="The intake assistant has already clustered symptoms, checked nearby availability, and ranked the best clinician options. The next step is to confirm the specialist, lock a time, and review patient details before submitting."
        aside={
          <>
            <WorkspaceBadge tone="cyan">AI confidence 94%</WorkspaceBadge>
            <WorkspaceBadge tone="navy">4-step booking flow</WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="cyan"
          label="Predicted complexity"
          value="Medium"
          description="Recommend specialist-led review before general triage fallback."
        />
        <WorkspaceMetricCard
          accent="green"
          label="Fastest available slot"
          value={selectedSpecialist.slot}
          description="Nearby availability already checked against doctor schedules."
        />
        <WorkspaceMetricCard
          accent="amber"
          label="Travel distance"
          value={selectedSpecialist.distance}
          description="Distance estimate from the patient address on file."
        />
        <WorkspaceMetricCard
          accent="slate"
          label="Confirmation state"
          value="Ready"
          description="All booking prerequisites are present except final approval."
        />
      </WorkspaceMetricGrid>

      <section className={styles.stepGrid} aria-label="Booking steps">
        {[
          "Choose clinician",
          "Review match rationale",
          "Select date and time",
          "Confirm patient details"
        ].map((step, index) => (
          <article
            key={step}
            className={`${styles.stepCard} ${index === 0 ? styles.stepCardActive : ""}`}
          >
            <span className={styles.stepNumber}>{index + 1}</span>
            <div className={styles.stepTitle}>{step}</div>
            <div className={styles.stepText}>
              {index === 0
                ? "Compare the recommended neurologist against one clinically safe fallback."
                : index === 1
                  ? "Show why the recommendation was selected so the booking is explainable."
                  : index === 2
                    ? "Expose only slots that can absorb the predicted consultation duration."
                    : "Summarize patient identity and symptom details before commit."}
            </div>
          </article>
        ))}
      </section>

      <section className={styles.summaryGrid} id="intake">
        <WorkspacePanel eyebrow="Recommendation" title="Why this specialist is the best fit">
          <div className={styles.recommendationPanel}>
            <div className={styles.recommendationHero}>
              <div className={styles.heroTop}>
                <div>
                  <h2 className={styles.heroTitle}>{selectedSpecialist.name}</h2>
                  <p className={styles.heroMeta}>
                    {selectedSpecialist.specialty} · Suggested because the symptom pattern
                    strongly matches a headache and neuro-visual workflow.
                  </p>
                </div>
                <WorkspaceBadge tone="green">{selectedSpecialist.fit} match</WorkspaceBadge>
              </div>
              <div className={styles.heroBody}>{selectedSpecialist.reason}</div>
              <div className={styles.chipList}>
                <div className={styles.chip}>
                  <div className={styles.chipLabel}>Severity signal</div>
                  <span className={styles.chipValue}>Stable, non-emergency</span>
                </div>
                <div className={styles.chip}>
                  <div className={styles.chipLabel}>Symptom cluster</div>
                  <span className={styles.chipValue}>Migraine · Dizziness · Visual aura</span>
                </div>
                <div className={styles.chip}>
                  <div className={styles.chipLabel}>Duration needed</div>
                  <span className={styles.chipValue}>45 min consultation block</span>
                </div>
              </div>
            </div>

            <aside className={styles.rationaleCard}>
              <WorkspaceBadge tone="cyan">Decision trace</WorkspaceBadge>
              <ul className={styles.rationaleList}>
                <li className={styles.rationaleItem}>
                  <span className={styles.rationaleDot} />
                  <span>
                    Reported symptoms map to a neurology-first triage template rather than
                    a general primary-care path.
                  </span>
                </li>
                <li className={styles.rationaleItem}>
                  <span className={styles.rationaleDot} />
                  <span>
                    The selected doctor has the fastest viable slot within the required
                    consultation duration window.
                  </span>
                </li>
                <li className={styles.rationaleItem}>
                  <span className={styles.rationaleDot} />
                  <span>
                    The fallback option remains visible in case the patient requests a
                    broader internal-medicine review.
                  </span>
                </li>
              </ul>
            </aside>
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Patient journey" title="What happens after confirmation">
          <div className={styles.timelineCard}>
            <ul className={styles.timelineList}>
              <li className={styles.timelineItem}>
                <span className={styles.timelineDot} />
                <div>
                  <div className={styles.timelineTime}>Immediately</div>
                  <div className={styles.timelineTitle}>Slot reservation</div>
                  <div className={styles.timelineText}>
                    The appointment hold is created and a confirmation code is issued.
                  </div>
                </div>
              </li>
              <li className={styles.timelineItem}>
                <span className={styles.timelineDot} />
                <div>
                  <div className={styles.timelineTime}>Within minutes</div>
                  <div className={styles.timelineTitle}>Clinical handoff</div>
                  <div className={styles.timelineText}>
                    The receiving doctor sees symptom context and predicted duration on the dashboard.
                  </div>
                </div>
              </li>
              <li className={styles.timelineItem}>
                <span className={styles.timelineDot} />
                <div>
                  <div className={styles.timelineTime}>Arrival day</div>
                  <div className={styles.timelineTitle}>Nurse check-in</div>
                  <div className={styles.timelineText}>
                    Intake captures vitals, confirms room routing, and moves the patient into queue.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </WorkspacePanel>
      </section>

      <WorkspacePanel
        eyebrow="Choose clinician"
        title="Available specialists"
        aside={<WorkspaceBadge tone="slate">Two viable options</WorkspaceBadge>}
      >
        <div className={styles.selectionGrid}>
          {specialists.map((specialist) => {
            const isSelected = specialist.id === selectedSpecialistId;

            return (
              <article
                key={specialist.id}
                className={`${styles.specialistCard} ${
                  isSelected ? styles.specialistCardSelected : ""
                }`}
              >
                <div className={styles.specialistTop}>
                  <div className={styles.avatar} aria-hidden="true">
                    {toInitials(specialist.name)}
                  </div>
                  <WorkspaceBadge tone={isSelected ? "green" : "cyan"}>
                    {specialist.fit} fit
                  </WorkspaceBadge>
                </div>
                <div>
                  <h3 className={styles.specialistName}>{specialist.name}</h3>
                  <p className={styles.specialistMeta}>{specialist.specialty}</p>
                </div>
                <p className={styles.specialistSummary}>{specialist.summary}</p>
                <div className={styles.specialistStats}>
                  <div className={styles.statTile}>
                    <div className={styles.statLabel}>Distance</div>
                    <span className={styles.statValue}>{specialist.distance}</span>
                  </div>
                  <div className={styles.statTile}>
                    <div className={styles.statLabel}>Next slot</div>
                    <span className={styles.statValue}>{specialist.slot}</span>
                  </div>
                  <div className={styles.statTile}>
                    <div className={styles.statLabel}>Booking mode</div>
                    <span className={styles.statValue}>
                      {isSelected ? "Primary path" : "Fallback path"}
                    </span>
                  </div>
                </div>
                <WorkspaceAction
                  onClick={() => setSelectedSpecialistId(specialist.id)}
                  tone={isSelected ? "success" : "secondary"}
                >
                  {isSelected ? "Selected specialist" : "Select specialist"}
                </WorkspaceAction>
              </article>
            );
          })}
        </div>
      </WorkspacePanel>

      <section className={styles.slotGrid} id="slot-selection">
        <WorkspacePanel eyebrow="Availability" title="Select date">
          <div className={styles.dayList}>
            {days.map((day) => (
              <button
                key={day.id}
                className={`${styles.dayButton} ${
                  day.id === selectedDay ? styles.dayButtonActive : ""
                }`}
                onClick={() => {
                  setSelectedDay(day.id);
                  setSelectedTime(timeSlotsByDay[day.id][0]);
                }}
                type="button"
              >
                {day.label}
              </button>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Availability" title="Select time">
          <div className={styles.timeList}>
            {timeSlotsByDay[selectedDay].map((time) => (
              <button
                key={time}
                className={`${styles.timeButton} ${
                  time === selectedTime ? styles.timeButtonActive : ""
                }`}
                onClick={() => setSelectedTime(time)}
                type="button"
              >
                {time}
              </button>
            ))}
          </div>
        </WorkspacePanel>
      </section>

      <WorkspacePanel
        eyebrow="Review"
        title="Patient information"
        aside={<WorkspaceBadge tone="navy">Ready for confirmation</WorkspaceBadge>}
      >
        <div className={styles.infoGrid} id="review">
          <InfoCard label="Patient full name" value="Nina Jill Scott" />
          <InfoCard label="Phone number" value="+84 912 458 302" />
          <InfoCard label="Email address" value="nina.scott@atelier.vn" />
          <InfoCard label="Insurance ID" value="VN-1984-22-4932" />
          <InfoCard label="Chosen specialist" value={selectedSpecialist.name} />
          <InfoCard label="Scheduled slot" value={`${selectedDay.toUpperCase()} · ${selectedTime}`} />
          <InfoCard
            label="Reported symptoms"
            value="Recurring headaches, dizziness, blurred vision after prolonged screen exposure."
            wide
          />
          <InfoCard
            label="Additional notes"
            value="Patient requests the earliest afternoon slot and can travel to the neurology clinic."
            wide
          />
        </div>
        <div className={styles.actionRow}>
          <WorkspaceAction href="/doctor-dashboard" tone="ghost">
            Back to doctor board
          </WorkspaceAction>
          <WorkspaceAction href="/medical-record-editor" tone="secondary">
            Review chart context
          </WorkspaceAction>
          <WorkspaceAction tone="primary">Finalize appointment</WorkspaceAction>
        </div>
      </WorkspacePanel>
    </WorkspaceShell>
  );
}

function InfoCard({
  label,
  value,
  wide = false
}: {
  readonly label: string;
  readonly value: string;
  readonly wide?: boolean;
}) {
  return (
    <div className={`${styles.infoCard} ${wide ? styles.infoCardWide : ""}`}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value}</div>
    </div>
  );
}

function toInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
