"use client";

import type { ComponentType, HTMLAttributes } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  Heart,
  RefreshCw,
  Save,
  Thermometer,
  UserCheck,
  Wind,
} from "lucide-react";
import {
  getTodayAppointments,
  getTodayQueue,
  saveAppointmentVitalSigns,
  type AppointmentVitalSignsResponse,
  type ClinicalAppointmentResponse,
} from "@/lib/clinical-api";
import { getErrorMessage } from "@/lib/staff-queue";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

const ELIGIBLE_STATUSES = ["CHECKED_IN", "IN_PROGRESS"];

export default function VitalSignsEditorPage() {
  const [appointments, setAppointments] = useState<ClinicalAppointmentResponse[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<AppointmentVitalSignsResponse | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [queueAppointments, todayAppointments] = await Promise.all([
        getTodayQueue(),
        getTodayAppointments(),
      ]);
      const nextAppointments = mergeAppointments(todayAppointments, queueAppointments)
        .filter((appointment) => ELIGIBLE_STATUSES.includes(appointment.status));

      setAppointments(nextAppointments);
      setSelectedAppointmentId((current) =>
        current && nextAppointments.some((appointment) => appointment.appointmentId === current)
          ? current
          : nextAppointments[0]?.appointmentId ?? "",
      );
    } catch (loadError) {
      setAppointments([]);
      setSelectedAppointmentId("");
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadAppointments);
  }, [loadAppointments]);

  const selectedAppointment = useMemo(
    () =>
      appointments.find((appointment) => appointment.appointmentId === selectedAppointmentId)
      ?? null,
    [appointments, selectedAppointmentId],
  );

  const summary = useMemo(
    () => ({
      ready: appointments.filter((appointment) => appointment.status === "CHECKED_IN").length,
      inProgress: appointments.filter((appointment) => appointment.status === "IN_PROGRESS").length,
      total: appointments.length,
    }),
    [appointments],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSavedRecord(null);

    if (!selectedAppointment) {
      setError("Select a checked-in or in-progress appointment before saving vitals.");
      return;
    }

    if (!hasAnyVitalValue([bloodPressure, heartRate, oxygenSaturation, temperature, respiratoryRate, weight, height])) {
      setError("Enter at least one vital sign before saving.");
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await saveAppointmentVitalSigns(selectedAppointment.appointmentId, {
        bloodPressure: emptyToUndefined(bloodPressure),
        heartRate: optionalInteger(heartRate),
        oxygenSaturation: optionalNumber(oxygenSaturation),
        temperature: optionalNumber(temperature),
        respiratoryRate: optionalInteger(respiratoryRate),
        weight: optionalNumber(weight),
        height: optionalNumber(height),
      });
      setSavedRecord(record);
      await loadAppointments();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] p-8 pb-20">
      <PageHeader
        categoryLabel="NURSING"
        title="Vital Signs Recording"
        description="Record clinical telemetry for checked-in or in-progress appointments."
        action={
          <button
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-[var(--hc-surface)] px-4 py-2 text-sm font-bold text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)] disabled:opacity-60"
            type="button"
            onClick={loadAppointments}
            disabled={isLoading}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <KpiCard label="Eligible Patients" value={String(summary.total)} helper="Checked-in or active" icon={UserCheck} tone="blue" />
        <KpiCard label="Ready For Vitals" value={String(summary.ready)} helper="Checked-in" icon={Clock} tone="teal" />
        <KpiCard label="In Consultation" value={String(summary.inProgress)} helper="Active consults" icon={Activity} tone="purple" />
      </section>

      {error ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-semibold text-[var(--hc-danger)]" role="alert">
          {error}
        </section>
      ) : null}

      {savedRecord ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--hc-success-bg)] bg-[var(--hc-success-bg)] p-4 text-sm font-semibold text-[var(--hc-success)]" role="status">
          Vital signs saved for {selectedAppointment?.patientFullName ?? "selected patient"} at {new Date(savedRecord.recordedAt).toLocaleString()}.
        </section>
      ) : null}

      <form className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]" onSubmit={handleSubmit}>
        <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] shadow-sm">
          <div className="border-b border-[var(--hc-border-soft)] px-6 py-4">
            <h2 className="text-sm font-bold text-[var(--hc-text)]">Record Vitals</h2>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <VitalField
              id="vitals-blood-pressure"
              icon={Heart}
              label="Blood Pressure"
              unit="mmHg"
              placeholder="120/80"
              value={bloodPressure}
              onChange={setBloodPressure}
            />
            <VitalField
              id="vitals-temperature"
              icon={Thermometer}
              label="Body Temperature"
              unit="C"
              placeholder="36.6"
              value={temperature}
              onChange={setTemperature}
              inputMode="decimal"
            />
            <VitalField
              id="vitals-heart-rate"
              icon={Activity}
              label="Heart Rate"
              unit="BPM"
              placeholder="72"
              value={heartRate}
              onChange={setHeartRate}
              inputMode="numeric"
            />
            <VitalField
              id="vitals-respiratory-rate"
              icon={Wind}
              label="Respiratory Rate"
              unit="breaths/min"
              placeholder="16"
              value={respiratoryRate}
              onChange={setRespiratoryRate}
              inputMode="numeric"
            />
            <VitalField
              id="vitals-oxygen-saturation"
              icon={Activity}
              label="Oxygen Saturation"
              unit="%"
              placeholder="98"
              value={oxygenSaturation}
              onChange={setOxygenSaturation}
              inputMode="decimal"
            />
            <div className="grid grid-cols-2 gap-4">
              <VitalField
                id="vitals-weight"
                icon={Activity}
                label="Weight"
                unit="kg"
                placeholder="65"
                value={weight}
                onChange={setWeight}
                inputMode="decimal"
              />
              <VitalField
                id="vitals-height"
                icon={Activity}
                label="Height"
                unit="cm"
                placeholder="170"
                value={height}
                onChange={setHeight}
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">
              <Clock className="size-4" aria-hidden="true" />
              {selectedAppointment ? `Appointment ${selectedAppointment.confirmationCode}` : "No eligible appointment selected"}
            </p>
            <button
              className="hc-button-primary inline-flex items-center justify-center gap-2"
              type="submit"
              disabled={isSubmitting || isLoading || !selectedAppointment}
            >
              <Save className="size-4" aria-hidden="true" />
              {isSubmitting ? "Saving Vitals..." : "Save Vitals"}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] p-6 shadow-sm">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]" htmlFor="vitals-appointment">
              Current Patient
            </label>
            <select
              className="hc-input w-full"
              id="vitals-appointment"
              value={selectedAppointmentId}
              onChange={(event) => setSelectedAppointmentId(event.target.value)}
              disabled={isLoading || appointments.length === 0}
            >
              {appointments.length === 0 ? (
                <option value="">No eligible appointments</option>
              ) : (
                appointments.map((appointment) => (
                  <option key={appointment.appointmentId} value={appointment.appointmentId}>
                    {appointment.patientFullName} - {appointment.status}
                  </option>
                ))
              )}
            </select>

            {selectedAppointment ? (
              <div className="mt-6 space-y-4 text-sm">
                <Info label="Patient" value={selectedAppointment.patientFullName} />
                <Info label="Doctor" value={selectedAppointment.doctorName} />
                <Info label="Time" value={`${selectedAppointment.startTime.slice(0, 5)} - ${selectedAppointment.endTime.slice(0, 5)}`} />
                <Info label="Status" value={selectedAppointment.status} />
              </div>
            ) : (
              <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--hc-warning-bg)] p-4 text-sm font-semibold text-[var(--hc-warning)]">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Check in a patient from the queue before recording vitals.
              </div>
            )}
          </section>
        </aside>
      </form>
    </main>
  );
}

function VitalField({
  icon: Icon,
  id,
  inputMode,
  label,
  onChange,
  placeholder,
  unit,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  id: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--hc-text-muted)]" htmlFor={id}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </label>
      <div className="relative">
        <input
          className="hc-input w-full pr-20 text-xl font-light"
          id={id}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-[var(--hc-text-muted)]">
          {unit}
        </span>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">
        {label}
      </p>
      <p className="break-words text-sm font-bold text-[var(--hc-text)]">
        {value}
      </p>
    </div>
  );
}

function mergeAppointments(...appointmentLists: ClinicalAppointmentResponse[][]) {
  return Array.from(
    appointmentLists.flat().reduce((byId, appointment) => {
      byId.set(appointment.appointmentId, appointment);
      return byId;
    }, new Map<string, ClinicalAppointmentResponse>()).values(),
  );
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalInteger(value: string) {
  const parsed = optionalNumber(value);
  return parsed === undefined ? undefined : Math.trunc(parsed);
}

function hasAnyVitalValue(values: string[]) {
  return values.some((value) => value.trim().length > 0);
}
