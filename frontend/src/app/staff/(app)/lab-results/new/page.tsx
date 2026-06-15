"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createLabResult,
  listAppointments,
  type AppointmentListResponse,
} from "@/lib/clinical-api";
import { useStoredRole } from "@/lib/use-stored-role";
import { PageHeader } from "@/components/ui/page-header";
import { RouteErrorState } from "@/components/ui/route-error-state";

type LabResultForm = {
  appointmentId: string;
  testName: string;
  resultValue: string;
  referenceRange: string;
  status: string;
  notes: string;
};

const emptyForm: LabResultForm = {
  appointmentId: "",
  testName: "",
  resultValue: "",
  referenceRange: "",
  status: "COMPLETED",
  notes: "",
};

const STATUS_OPTIONS = ["PENDING", "COMPLETED", "ABNORMAL", "CRITICAL", "VERIFIED"];

export default function NewLabResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = useStoredRole("staff");
  const canWrite = role === "ADMIN" || role === "DOCTOR";
  const requestedAppointmentId = searchParams.get("appointmentId") ?? "";

  const [appointments, setAppointments] = useState<AppointmentListResponse[]>([]);
  const [form, setForm] = useState<LabResultForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextAppointments = await listAppointments({ size: 100 });
      setAppointments(nextAppointments);
      setForm((current) => ({
        ...current,
        appointmentId: resolveAppointmentId(
          current.appointmentId,
          requestedAppointmentId,
          nextAppointments,
        ),
      }));
    } catch (loadError) {
      setAppointments([]);
      setForm((current) => ({ ...current, appointmentId: "" }));
      setError(loadError instanceof Error ? loadError.message : "Unable to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [requestedAppointmentId]);

  useEffect(() => {
    void Promise.resolve().then(loadAppointments);
  }, [loadAppointments]);

  const selectedAppointment = useMemo(
    () =>
      appointments.find((appointment) => appointment.appointmentId === form.appointmentId)
      ?? null,
    [appointments, form.appointmentId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const request = buildRequest(form);
    if (!request) {
      setError("Appointment, test name, and result value are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createLabResult(request);
      router.push(`/staff/lab-results/${created.labResultId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save lab result.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof LabResultForm>(field: K, value: LabResultForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  if (!canWrite) {
    return (
      <main className="mx-auto max-w-[900px] p-8 pb-20">
        <RouteErrorState
          title="Lab result creation unavailable"
          description="Lab result creation is limited to doctors and administrators."
          primaryHref="/staff/lab-results"
          primaryLabel="Back to Lab Results"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] p-8 pb-20">
      <PageHeader
        categoryLabel="DIAGNOSTICS"
        title="Record Lab Result"
        description="Create a patient diagnostic result from an existing appointment."
        action={
          <Link className="hc-button-secondary inline-flex items-center gap-2" href="/staff/lab-results">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Lab Results
          </Link>
        }
      />

      {error ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-semibold text-[var(--hc-danger)]" role="alert">
          {error}
        </section>
      ) : null}

      <form className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]" noValidate onSubmit={handleSubmit}>
        <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] shadow-sm">
          <div className="border-b border-[var(--hc-border-soft)] px-6 py-4">
            <h2 className="text-sm font-bold text-[var(--hc-text)]">Result Details</h2>
          </div>

          <div className="grid gap-6 p-6">
            <label className="grid gap-2 text-sm font-semibold text-[var(--hc-text)]" htmlFor="lab-appointment">
              Appointment
              <select
                className="hc-input"
                disabled={isLoading}
                id="lab-appointment"
                onChange={(event) => updateField("appointmentId", event.target.value)}
                value={form.appointmentId}
              >
                <option value="">Select an appointment</option>
                {appointments.map((appointment) => (
                  <option key={appointment.appointmentId} value={appointment.appointmentId}>
                    {appointment.confirmationCode} | {appointment.patientName} | {appointment.appointmentDate} {formatTime(appointment.startTime)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <TextField
                id="lab-test-name"
                label="Test Name"
                onChange={(value) => updateField("testName", value)}
                placeholder="Complete Blood Count"
                required
                value={form.testName}
              />
              <label className="grid gap-2 text-sm font-semibold text-[var(--hc-text)]" htmlFor="lab-status">
                Status
                <select
                  className="hc-input"
                  id="lab-status"
                  onChange={(event) => updateField("status", event.target.value)}
                  value={form.status}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <TextAreaField
              id="lab-result-value"
              label="Result Value"
              onChange={(value) => updateField("resultValue", value)}
              placeholder="Hemoglobin 13.9 g/dL; WBC 6.2 x10^9/L"
              required
              rows={4}
              value={form.resultValue}
            />

            <TextField
              id="lab-reference-range"
              label="Reference Range"
              onChange={(value) => updateField("referenceRange", value)}
              placeholder="Hemoglobin 13.5-17.5 g/dL"
              value={form.referenceRange}
            />

            <TextAreaField
              id="lab-notes"
              label="Notes"
              onChange={(value) => updateField("notes", value)}
              placeholder="Clinical interpretation or follow-up note"
              rows={3}
              value={form.notes}
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">
              <FileText className="size-4" aria-hidden="true" />
              {selectedAppointment ? `Appointment ${selectedAppointment.confirmationCode}` : "No appointment selected"}
            </p>
            <button
              className="hc-button-primary inline-flex items-center justify-center gap-2"
              disabled={isSubmitting || isLoading}
              type="submit"
            >
              <Save className="size-4" aria-hidden="true" />
              {isSubmitting ? "Saving Lab Result..." : "Save Lab Result"}
            </button>
          </div>
        </section>

        <aside className="rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--hc-text)]">Selected Patient</h2>
          {selectedAppointment ? (
            <dl className="mt-5 space-y-4 text-sm">
              <Metadata label="Patient" value={selectedAppointment.patientName} />
              <Metadata label="Phone" value={selectedAppointment.patientPhone} />
              <Metadata label="Doctor" value={selectedAppointment.doctorName} />
              <Metadata label="Date" value={`${selectedAppointment.appointmentDate} ${formatTime(selectedAppointment.startTime)}`} />
              <Metadata label="Status" value={selectedAppointment.status} />
            </dl>
          ) : (
            <p className="mt-4 text-sm font-medium leading-6 text-[var(--hc-text-secondary)]">
              Select an appointment to attach this lab result to a real patient encounter.
            </p>
          )}
        </aside>
      </form>
    </main>
  );
}

function TextField({
  id,
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--hc-text)]" htmlFor={id}>
      {label}
      <input
        className="hc-input"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  id,
  label,
  onChange,
  placeholder,
  required = false,
  rows,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows: number;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--hc-text)]" htmlFor={id}>
      {label}
      <textarea
        className="hc-input min-h-24 resize-y"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[var(--hc-text)]">{value}</dd>
    </div>
  );
}

function resolveAppointmentId(
  current: string,
  requested: string,
  appointments: AppointmentListResponse[],
) {
  if (current && appointments.some((appointment) => appointment.appointmentId === current)) {
    return current;
  }

  if (requested && appointments.some((appointment) => appointment.appointmentId === requested)) {
    return requested;
  }

  return appointments[0]?.appointmentId ?? "";
}

function buildRequest(form: LabResultForm) {
  const appointmentId = form.appointmentId.trim();
  const testName = form.testName.trim();
  const resultValue = form.resultValue.trim();

  if (!appointmentId || !testName || !resultValue) {
    return null;
  }

  return {
    appointmentId,
    testName,
    resultValue,
    referenceRange: optionalText(form.referenceRange),
    status: optionalText(form.status) ?? "COMPLETED",
    notes: optionalText(form.notes),
  };
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}
