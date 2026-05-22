"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  createMedicalRecord,
  getAppointmentDetail,
  type AppointmentDetailResponse,
  type MedicalRecordResponse,
  type PrescriptionItemPayload,
} from "@/lib/medical-records-api";
import { getErrorMessage } from "@/lib/staff-queue";

import { HcIcon } from "@/components/ui/hc-icon";
import { PageHeader } from "@/components/ui/page-header";

interface PrescriptionDraft {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: string;
  instructions: string;
}

const EMPTY_PRESCRIPTION: PrescriptionDraft = {
  medicineName: "",
  dosage: "",
  frequency: "",
  durationDays: "",
  instructions: "",
};

const ALLOWED_RECORD_STATUSES = ["CHECKED_IN", "IN_PROGRESS", "DONE"];

function formatTimeRange(appointment: AppointmentDetailResponse) {
  const startTime = appointment.startTime?.slice(0, 5);
  const endTime = appointment.endTime?.slice(0, 5);

  return startTime && endTime ? `${startTime} - ${endTime}` : "Time not scheduled";
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPrescriptionItems(drafts: PrescriptionDraft[]): PrescriptionItemPayload[] {
  return drafts
    .map((draft, index) => ({
      medicineName: draft.medicineName.trim(),
      dosage: draft.dosage.trim(),
      frequency: draft.frequency.trim() || undefined,
      durationDays: optionalNumber(draft.durationDays),
      instructions: draft.instructions.trim() || undefined,
      sortOrder: index,
    }))
    .filter((item) => item.medicineName || item.dosage);
}

export default function MedicalRecordEditorPage() {
  const params = useParams<{ id: string }>();
  const appointmentId = params.id;

  const [appointment, setAppointment] = useState<AppointmentDetailResponse | null>(null);
  const [savedRecord, setSavedRecord] = useState<MedicalRecordResponse | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionDraft[]>([
    EMPTY_PRESCRIPTION,
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAppointment = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setAppointment(await getAppointmentDetail(appointmentId));
    } catch (error) {
      setAppointment(null);
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    void Promise.resolve().then(loadAppointment);
  }, [loadAppointment]);

  const canCreateRecord = useMemo(
    () => appointment && ALLOWED_RECORD_STATUSES.includes(appointment.status),
    [appointment],
  );

  const updatePrescription = (
    index: number,
    field: keyof PrescriptionDraft,
    value: string,
  ) => {
    setPrescriptions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addPrescription = () => {
    setPrescriptions((current) => [...current, EMPTY_PRESCRIPTION]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions((current) =>
      current.length === 1 ? [EMPTY_PRESCRIPTION] : current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const validateForm = () => {
    if (!appointment) {
      return "Appointment context is required before saving a medical record.";
    }
    if (!canCreateRecord) {
      return "Appointment must be checked in, in progress, or done before creating a medical record.";
    }
    if (!diagnosis.trim()) {
      return "Diagnosis is required.";
    }

    const invalidPrescription = toPrescriptionItems(prescriptions).some(
      (item) => !item.medicineName || !item.dosage,
    );
    if (invalidPrescription) {
      return "Prescription items require medicine name and dosage.";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSavedRecord(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await createMedicalRecord({
        appointmentId,
        diagnosis: diagnosis.trim(),
        clinicalNotes: clinicalNotes.trim() || undefined,
        vitalSigns: {
          bloodPressure: bloodPressure.trim() || undefined,
          temperature: optionalNumber(temperature),
          weight: optionalNumber(weight),
          height: optionalNumber(height),
        },
        followUpDate: followUpDate || undefined,
        prescriptionItems: toPrescriptionItems(prescriptions),
      });
      setSavedRecord(record);
      await loadAppointment();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="p-8" aria-busy="true">
        <section className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <HcIcon name="hourglass_empty" className="text-4xl text-[var(--hc-text-placeholder)] mb-4 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
            Loading appointment context...
          </p>
        </section>
      </main>
    );
  }

  if (loadError || !appointment) {
    return (
      <main className="p-8">
        <section className="bg-[var(--hc-surface)] border border-red-200 rounded-[var(--radius-xl)] p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]" role="alert">
          <HcIcon name="error_outline" className="text-4xl text-red-500 mb-4" />
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--hc-text)]">
            {loadError || "Appointment was not returned by the backend."}
          </h1>
          <p className="mb-8 text-sm font-bold uppercase tracking-widest text-red-500">
            Medical record context unavailable
          </p>
          <button
            className="hc-button-secondary border-red-200 text-red-700 hover:bg-red-50"
            type="button"
            onClick={loadAppointment}
          >
            Retry Loading
          </button>
        </section>
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        title="Patient Record Entry"
        description={`${appointment.appointmentDate} | ${formatTimeRange(appointment)} | ${appointment.status}`}
      />
      <form className="grid grid-cols-12 gap-8 p-8 pt-0" onSubmit={handleSubmit}>
        <div className="col-span-12 flex flex-col gap-8 xl:col-span-8">

          {formError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-[var(--radius-lg)] p-4 text-sm font-medium flex items-center gap-3" role="alert">
              <HcIcon name="warning" className="w-5 h-5 shrink-0" />
              {formError}
            </div>
          ) : null}
          {savedRecord ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-[var(--radius-lg)] p-4 text-sm font-medium flex items-center gap-3" role="status">
              <HcIcon name="check_circle" className="w-5 h-5 shrink-0" />
              Medical record saved. Appointment status is now {savedRecord.appointmentStatus}.
            </div>
          ) : null}

          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--hc-border-soft)]">
              <div className="p-6 bg-[var(--hc-surface-soft)]">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]" htmlFor="diagnosis">
                  Primary Diagnosis
                </label>
                <input
                  id="diagnosis"
                  className="hc-input w-full bg-[var(--hc-surface)]"
                  placeholder="Enter diagnosis"
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-6 p-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
                    Status
                  </label>
                  <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-widest">
                    {appointment.status}
                  </span>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
                    Doctor
                  </label>
                  <span className="block text-sm font-bold text-[var(--hc-text)]">{appointment.doctorName}</span>
                </div>
              </div>
            </div>
          </div>

          <section className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--hc-border-soft)]">
            <VitalInput label="Blood Pressure" value={bloodPressure} onChange={setBloodPressure} placeholder="120/80" />
            <VitalInput label="Temperature" value={temperature} onChange={setTemperature} placeholder="37.2" />
            <VitalInput label="Weight" value={weight} onChange={setWeight} placeholder="65" />
            <VitalInput label="Height" value={height} onChange={setHeight} placeholder="170" />
          </section>

          <section className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)]">
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="clinical-notes">
                Clinical Observation &amp; Subjective Notes
              </label>
            </div>
            <textarea
              id="clinical-notes"
              className="min-h-[320px] w-full border-none p-6 text-sm leading-relaxed text-[var(--hc-text-secondary)] font-medium placeholder:text-[var(--hc-text-placeholder)] focus:ring-0 focus:outline-none resize-y"
              placeholder="Start typing clinical observation notes here..."
              value={clinicalNotes}
              onChange={(event) => setClinicalNotes(event.target.value)}
            />
          </section>

          <section className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--hc-border-soft)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]">
                Active Prescriptions &amp; Medication Orders
              </h2>
              <button
                className="hc-button-secondary py-2"
                type="button"
                onClick={addPrescription}
              >
                <HcIcon name="add" className="w-4 h-4" /> ADD MEDICATION
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--hc-surface-soft)] border-b border-[var(--hc-border-soft)]">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">Medication</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">Dosage</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">Frequency</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">Days</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--hc-border-soft)]">
                  {prescriptions.map((item, index) => (
                    <tr key={index} className="hover:bg-[var(--hc-surface-soft)] transition-colors">
                      <MedicationCell label={`Medicine ${index + 1}`} value={item.medicineName} onChange={(value) => updatePrescription(index, "medicineName", value)} />
                      <MedicationCell label={`Dosage ${index + 1}`} value={item.dosage} onChange={(value) => updatePrescription(index, "dosage", value)} />
                      <MedicationCell label={`Frequency ${index + 1}`} value={item.frequency} onChange={(value) => updatePrescription(index, "frequency", value)} />
                      <MedicationCell label={`Duration days ${index + 1}`} value={item.durationDays} onChange={(value) => updatePrescription(index, "durationDays", value)} />
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          type="button"
                          title="Remove medication"
                          onClick={() => removePrescription(index)}
                        >
                          <HcIcon name="delete" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--hc-border-soft)]">
            <div className="p-6 bg-[var(--hc-surface-soft)]">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]" htmlFor="follow-up-date">
                Follow-up Schedule
              </label>
              <input
                id="follow-up-date"
                className="hc-input w-full bg-[var(--hc-surface)]"
                type="date"
                value={followUpDate}
                onChange={(event) => setFollowUpDate(event.target.value)}
              />
            </div>
            <div className="p-6 flex flex-col justify-center">
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]">
                PDF Support
              </label>
              <p className="text-xs font-medium text-[var(--hc-text-secondary)]">
                Prescription PDF is generated by the backend after a successful save.
              </p>
            </div>
            <div className="p-6 flex items-center justify-center bg-[var(--hc-surface-soft)]">
              <button
                className="hc-button-primary w-full py-3 flex items-center justify-center gap-2"
                type="submit"
                disabled={isSubmitting || !canCreateRecord}
              >
                {isSubmitting ? "Saving Record..." : "Commit Record"}
                <HcIcon name="send" className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>

        <aside className="col-span-12 xl:col-span-4">
          <div className="sticky top-8 flex flex-col gap-6">
            <div className="bg-[var(--hc-text)] text-white rounded-[var(--radius-xl)] p-8 shadow-md">
              <div className="mb-8">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--hc-text-placeholder)]">
                  Subject Profile
                </p>
                <h2 className="text-3xl font-light tracking-tight">
                  {appointment.patientFullName}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <Info label="ID Number" value={appointment.patientCccd} theme="dark" />
                <Info label="Birth Date" value={appointment.patientDateOfBirth} theme="dark" />
                <Info label="Gender" value={appointment.patientGender} theme="dark" />
                <Info label="Phone" value={appointment.patientPhone} theme="dark" />
              </div>
            </div>

            <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm">
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
                Appointment Context
              </h3>
              <div className="space-y-6">
                <Info label="Symptoms" value={appointment.symptoms || "No symptoms recorded"} theme="light" />
                <Info label="Appointment ID" value={appointment.appointmentId} theme="light" />
                <p className="text-xs font-semibold text-[var(--hc-text-secondary)]">Case File: {appointment.confirmationCode}</p>
                <Info label="Patient Email" value={appointment.patientEmail} theme="light" />
              </div>
            </div>

            {!canCreateRecord ? (
              <div className="bg-red-50 border border-red-200 rounded-[var(--radius-xl)] p-6 shadow-sm" role="alert">
                <div className="mb-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <HcIcon name="warning" className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-red-900">
                    Record Creation Blocked
                  </h3>
                </div>
                <p className="text-xs font-medium text-red-700 leading-relaxed">
                  This appointment is {appointment.status}. The backend only accepts records
                  for checked-in, in-progress, or done appointments.
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </form>
    </main>
  );
}

function VitalInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="p-6">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
        {label}
      </label>
      <input
        className="w-full border-b-2 border-[var(--hc-border-soft)] bg-transparent px-1 py-2 text-sm font-bold text-[var(--hc-text)] outline-none focus:border-[var(--hc-primary)] transition-colors placeholder:text-[var(--hc-text-placeholder)] placeholder:font-medium"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function MedicationCell({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <td className="px-6 py-4">
      <label className="sr-only">{label}</label>
      <input
        aria-label={label}
        className="w-full border-b-2 border-[var(--hc-border-soft)] bg-transparent px-1 py-2 text-sm font-medium text-[var(--hc-text)] outline-none focus:border-[var(--hc-primary)] transition-colors"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter value"
      />
    </td>
  );
}

function Info({ label, value, theme = "light" }: { label: string; value: string; theme?: "light" | "dark" }) {
  return (
    <div>
      <p className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${theme === "dark" ? "text-[var(--hc-text-placeholder)]" : "text-[var(--hc-text-placeholder)]"}`}>
        {label}
      </p>
      <p className={`break-words text-sm font-bold ${theme === "dark" ? "text-white" : "text-[var(--hc-text)]"}`}>
        {value}
      </p>
    </div>
  );
}
