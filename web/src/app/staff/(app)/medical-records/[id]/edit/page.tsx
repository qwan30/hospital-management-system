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
import { DataPanel } from "@/components/ui/data-panel";
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
        <section className="bg-surface-container-lowest p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
            Loading appointment context...
          </p>
        </section>
      </main>
    );
  }

  if (loadError || !appointment) {
    return (
      <main className="p-8">
        <section className="border border-error-container bg-white p-8" role="alert">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-error">
            Medical record context unavailable
          </p>
          <h1 className="mt-3 text-3xl font-light text-on-surface">
            {loadError || "Appointment was not returned by the backend."}
          </h1>
          <button
            className="mt-6 bg-primary-container px-4 py-3 text-xs font-bold uppercase tracking-widest text-white"
            type="button"
            onClick={loadAppointment}
          >
            Retry
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
        <div className="col-span-12 flex flex-col gap-8 lg:col-span-8">

          {formError ? (
            <div className="border border-error-container bg-white p-4 text-sm font-semibold text-error" role="alert">
              {formError}
            </div>
          ) : null}
          {savedRecord ? (
            <div className="border border-primary-container bg-surface-container-low p-4 text-sm font-semibold text-primary" role="status">
              Medical record saved. Appointment status is now {savedRecord.appointmentStatus}.
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-px bg-surface-container-highest">
            <div className="bg-surface-container-lowest p-6">
              <label className="mb-3 block font-['Public_Sans'] text-[10px] font-semibold uppercase tracking-widest text-outline" htmlFor="diagnosis">
                Primary Diagnosis
              </label>
              <input
                id="diagnosis"
                className="w-full border-b-2 border-outline/30 bg-surface-container-low px-3 py-3 text-sm font-semibold outline-none focus:border-primary-container"
                placeholder="Enter diagnosis"
                value={diagnosis}
                onChange={(event) => setDiagnosis(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 bg-surface-container-lowest p-6">
              <div>
                <label className="mb-2 block font-['Public_Sans'] text-[10px] font-semibold uppercase tracking-widest text-outline">
                  Status
                </label>
                <span className="inline-flex items-center bg-tertiary-fixed px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-on-tertiary-fixed-variant">
                  {appointment.status}
                </span>
              </div>
              <div>
                <label className="mb-2 block font-['Public_Sans'] text-[10px] font-semibold uppercase tracking-widest text-outline">
                  Doctor
                </label>
                <span className="block text-xs font-semibold">{appointment.doctorName}</span>
              </div>
            </div>
          </div>

          <section className="grid grid-cols-4 gap-px bg-surface-container-highest">
            <VitalInput label="Blood Pressure" value={bloodPressure} onChange={setBloodPressure} placeholder="120/80" />
            <VitalInput label="Temperature" value={temperature} onChange={setTemperature} placeholder="37.2" />
            <VitalInput label="Weight" value={weight} onChange={setWeight} placeholder="65" />
            <VitalInput label="Height" value={height} onChange={setHeight} placeholder="170" />
          </section>

          <section className="flex flex-col">
            <label className="mb-4 font-['Public_Sans'] text-[11px] font-semibold uppercase tracking-widest text-on-surface" htmlFor="clinical-notes">
              Clinical Observation &amp; Subjective Notes
            </label>
            <textarea
              id="clinical-notes"
              className="min-h-[320px] w-full border-none bg-surface-container-lowest p-8 text-base leading-relaxed text-on-surface-variant placeholder:opacity-30 focus:ring-1 focus:ring-primary-container"
              placeholder="Start typing clinical observation notes here..."
              value={clinicalNotes}
              onChange={(event) => setClinicalNotes(event.target.value)}
            />
          </section>

          <section className="bg-surface-container-lowest p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-['Public_Sans'] text-[11px] font-semibold uppercase tracking-widest">
                Active Prescriptions &amp; Medication Orders
              </h2>
              <button
                className="flex items-center gap-2 bg-on-surface px-4 py-2 text-[10px] font-bold text-surface transition-all hover:bg-black"
                type="button"
                onClick={addPrescription}
              >
                <HcIcon name="add" className="text-sm" /> ADD MEDICATION
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Medication</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Dosage</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Frequency</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Days</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-outline">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {prescriptions.map((item, index) => (
                    <tr key={index}>
                      <MedicationCell label={`Medicine ${index + 1}`} value={item.medicineName} onChange={(value) => updatePrescription(index, "medicineName", value)} />
                      <MedicationCell label={`Dosage ${index + 1}`} value={item.dosage} onChange={(value) => updatePrescription(index, "dosage", value)} />
                      <MedicationCell label={`Frequency ${index + 1}`} value={item.frequency} onChange={(value) => updatePrescription(index, "frequency", value)} />
                      <MedicationCell label={`Duration days ${index + 1}`} value={item.durationDays} onChange={(value) => updatePrescription(index, "durationDays", value)} />
                      <td className="px-4 py-4 text-xs">
                        <button
                          className="min-h-6 text-[10px] font-bold text-error"
                          type="button"
                          onClick={() => removePrescription(index)}
                        >
                          REMOVE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-px bg-surface-container-highest">
            <div className="bg-surface-container-lowest p-6">
              <label className="mb-3 block font-['Public_Sans'] text-[10px] font-semibold uppercase tracking-widest text-outline" htmlFor="follow-up-date">
                Follow-up Schedule
              </label>
              <input
                id="follow-up-date"
                className="w-full border-b-2 border-outline/30 bg-surface-container-low px-3 py-3 text-sm font-semibold outline-none focus:border-primary-container"
                type="date"
                value={followUpDate}
                onChange={(event) => setFollowUpDate(event.target.value)}
              />
            </div>
            <div className="bg-surface-container-lowest p-6">
              <label className="mb-3 block font-['Public_Sans'] text-[10px] font-semibold uppercase tracking-widest text-outline">
                PDF Support
              </label>
              <p className="text-xs font-semibold text-on-surface-variant">
                Prescription PDF is generated by the backend after a successful save.
              </p>
            </div>
            <div className="flex items-end bg-surface-container-lowest p-6">
              <button
                className="flex h-[52px] w-full items-center justify-center gap-3 bg-primary-container text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all hover:bg-primary disabled:opacity-60"
                type="submit"
                disabled={isSubmitting || !canCreateRecord}
              >
                {isSubmitting ? "Saving Record" : "Commit Record"}
                <HcIcon name="send" />
              </button>
            </div>
          </section>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="bg-on-surface p-8 text-surface">
              <div className="mb-8">
                <p className="mb-1 font-['Public_Sans'] text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">
                  Subject Profile
                </p>
                <h2 className="text-3xl font-light tracking-tight">
                  {appointment.patientFullName}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-y-6">
                <Info label="ID Number" value={appointment.patientCccd} />
                <Info label="Birth Date" value={appointment.patientDateOfBirth} />
                <Info label="Gender" value={appointment.patientGender} />
                <Info label="Phone" value={appointment.patientPhone} />
              </div>
            </div>

            <div className="bg-surface-container-low p-8">
              <h3 className="mb-6 font-['Public_Sans'] text-[10px] font-semibold uppercase tracking-widest">
                Appointment Context
              </h3>
              <div className="space-y-5 text-xs font-semibold">
                <Info label="Symptoms" value={appointment.symptoms || "No symptoms recorded"} />
                <Info label="Appointment ID" value={appointment.appointmentId} />
                <Info label="Patient Email" value={appointment.patientEmail} />
              </div>
            </div>

            {!canCreateRecord ? (
              <div className="bg-error-container p-6" role="alert">
                <div className="mb-3 flex items-center gap-3">
                  <HcIcon name="warning" className="text-error" />
                  <h3 className="font-['Public_Sans'] text-[11px] font-semibold uppercase tracking-widest text-on-error-container">
                    Record Creation Blocked
                  </h3>
                </div>
                <p className="text-xs font-bold">
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
    <div className="bg-surface-container-lowest p-4">
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-outline">
        {label}
      </label>
      <input
        className="w-full border-b border-outline/30 bg-surface-container-low px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
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
    <td className="px-4 py-4 text-xs">
      <label className="sr-only">{label}</label>
      <input
        aria-label={label}
        className="w-full border-b border-outline/30 bg-transparent px-1 py-2 outline-none focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </td>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase opacity-50">{label}</p>
      <p className="break-words text-sm font-semibold">{value}</p>
    </div>
  );
}
