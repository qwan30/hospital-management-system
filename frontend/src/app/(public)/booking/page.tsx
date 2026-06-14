"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createPublicAppointment,
  listDoctors,
  listDoctorSlots,
  type AppointmentResponse,
  type DoctorResponse,
  type DoctorSlotResponse,
} from "@/lib/public-api";

const symptomOptions = [
  "Acute fever (>101 F)",
  "Respiratory discomfort",
  "Chest tightness",
  "Gastrointestinal pain",
  "Neurological concern",
  "Other",
];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatSlotTime(slot: DoctorSlotResponse) {
  return `${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}`;
}

function getInitialDoctorId(doctors: DoctorResponse[]) {
  if (typeof window === "undefined") {
    return "";
  }

  const requestedDoctorId = new URLSearchParams(window.location.search).get("doctorId");
  if (!requestedDoctorId) {
    return "";
  }

  return doctors.some((doctor) => doctor.id === requestedDoctorId) ? requestedDoctorId : "";
}

export default function PublicBookingPage() {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [slotDate, setSlotDate] = useState(todayDate);
  const [slots, setSlots] = useState<DoctorSlotResponse[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [confirmation, setConfirmation] = useState<AppointmentResponse | null>(null);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [doctors, selectedDoctorId],
  );

  const availableSlots = useMemo(
    () => slots.filter((slot) => slot.status === "AVAILABLE"),
    [slots],
  );

  async function loadSlots(doctorId: string, date: string, clearCurrentMessage = true) {
    setIsLoadingSlots(true);
    setSelectedSlotId("");

    try {
      const nextSlots = await listDoctorSlots(doctorId, date);
      setSlots(nextSlots);
      if (clearCurrentMessage) {
        setMessage("");
      }
    } catch (slotError) {
      setSlots([]);
      setMessageTone("error");
      setMessage(slotError instanceof Error ? slotError.message : "Unable to load doctor slots.");
    } finally {
      setIsLoadingSlots(false);
    }
  }

  useEffect(() => {
    let isActive = true;
    const initialDate = todayDate();

    listDoctors()
      .then((nextDoctors) => {
        if (!isActive) {
          return;
        }

        setDoctors(nextDoctors);
        const initialDoctorId = getInitialDoctorId(nextDoctors);
        if (initialDoctorId) {
          setSelectedDoctorId(initialDoctorId);
          void loadSlots(initialDoctorId, initialDate);
        }
      })
      .catch((doctorError) => {
        if (!isActive) {
          return;
        }
        setDoctors([]);
        setMessageTone("error");
        setMessage(doctorError instanceof Error ? doctorError.message : "Unable to load doctors.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingDoctors(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleDoctorChange(nextDoctorId: string) {
    setSelectedDoctorId(nextDoctorId);
    setConfirmation(null);
    setMessage("");

    if (!nextDoctorId) {
      setSlots([]);
      setSelectedSlotId("");
      return;
    }

    void loadSlots(nextDoctorId, slotDate);
  }

  function handleDateChange(nextDate: string) {
    setSlotDate(nextDate);
    setConfirmation(null);
    setMessage("");

    if (selectedDoctorId && nextDate) {
      void loadSlots(selectedDoctorId, nextDate);
    } else {
      setSlots([]);
      setSelectedSlotId("");
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setConfirmation(null);

    const formData = new FormData(event.currentTarget);
    const patientFullName = String(formData.get("fullName") || "").trim();
    const patientPhone = String(formData.get("phone") || "").trim();
    const patientEmail = String(formData.get("email") || "").trim();
    const patientCccd = String(formData.get("cccd") || "").trim();
    const patientDateOfBirth = String(formData.get("dateOfBirth") || "").trim();
    const patientGender = String(formData.get("gender") || "").trim() as "MALE" | "FEMALE" | "OTHER";
    const provinceOrCity = String(formData.get("provinceOrCity") || "").trim();
    const district = String(formData.get("district") || "").trim();
    const streetAddress = String(formData.get("streetAddress") || "").trim();
    const symptoms = String(formData.get("symptoms") || "").trim();
    const observedSymptoms = formData.getAll("observedSymptoms").map(String);

    if (!selectedDoctorId || !selectedSlotId) {
      setMessageTone("error");
      setMessage("Select a doctor and an available appointment slot before submitting.");
      return;
    }

    if (
      !patientFullName ||
      !patientPhone ||
      !patientEmail ||
      !patientCccd ||
      !patientDateOfBirth ||
      !patientGender ||
      !provinceOrCity ||
      !district ||
      !streetAddress ||
      !symptoms
    ) {
      setMessageTone("error");
      setMessage("Complete all required patient, contact, address, and symptom fields.");
      return;
    }

    if (!/^[0-9]{12}$/.test(patientCccd)) {
      setMessageTone("error");
      setMessage("Patient CCCD must be exactly 12 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdAppointment = await createPublicAppointment({
        doctorId: selectedDoctorId,
        firstSlotId: selectedSlotId,
        aiDurationMinutes: 30,
        patientFullName,
        patientCccd,
        patientEmail,
        patientPhone,
        patientDateOfBirth,
        patientGender,
        patientAddress: {
          provinceOrCity,
          district,
          streetAddress,
        },
        symptoms: [symptoms, ...observedSymptoms].filter(Boolean).join(" | "),
      });

      setConfirmation(createdAppointment);
      setMessageTone("success");
      setMessage(`Appointment confirmed. Confirmation code: ${createdAppointment.confirmationCode}`);
      await loadSlots(selectedDoctorId, slotDate, false);
    } catch (submitError) {
      setMessageTone("error");
      setMessage(submitError instanceof Error ? submitError.message : "Unable to submit booking request.");
      if (selectedDoctorId && slotDate) {
        await loadSlots(selectedDoctorId, slotDate, false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
      <header className="mb-12">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--hc-primary)]">
          Patient Booking
        </p>
        <h1 className="mb-6 text-5xl font-light tracking-tight text-[var(--hc-text)] md:text-6xl">
          Book Appointment
        </h1>
        <p className="max-w-2xl text-xl font-medium leading-relaxed text-[var(--hc-text-secondary)]">
          Choose a real doctor, select an available slot, and submit the required patient details.
          Unsupported or unavailable slots are not faked.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <form className="border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-white p-8 lg:col-span-8 lg:p-12 shadow-sm" onSubmit={handleSubmit} noValidate>
          <section className="mb-12 border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] bg-[var(--hc-surface-muted)] p-8">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.15em] text-[var(--hc-text-muted)]">
              Doctor And Slot
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-doctor">
                  Doctor
                </label>
                <select
                  className="hc-input w-full bg-white"
                  disabled={isLoadingDoctors}
                  id="booking-doctor"
                  onChange={(event) => handleDoctorChange(event.target.value)}
                  value={selectedDoctorId}
                >
                  <option value="">{isLoadingDoctors ? "Loading doctors..." : "Select doctor"}</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName} {doctor.specialty ? `- ${doctor.specialty}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-date">
                  Appointment Date
                </label>
                <input
                  className="hc-input w-full bg-white"
                  id="booking-date"
                  min={todayDate()}
                  onChange={(event) => handleDateChange(event.target.value)}
                  type="date"
                  value={slotDate}
                />
              </div>
            </div>
            <div className="mt-8">
              {selectedDoctor ? (
                <p className="mb-4 text-sm text-[var(--hc-text-secondary)] font-medium">
                  Selected doctor: <span className="font-bold text-[var(--hc-text)]">{selectedDoctor.fullName}</span>
                </p>
              ) : null}
              {isLoadingSlots ? (
                <div className="grid gap-3 sm:grid-cols-3" aria-busy="true">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-[var(--radius-md)]" />
                  ))}
                </div>
              ) : selectedDoctorId ? (
                availableSlots.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {availableSlots.map((slot) => (
                      <button
                        className={`border rounded-[var(--radius-md)] px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                          selectedSlotId === slot.id
                            ? "border-[var(--hc-primary)] bg-[var(--hc-primary-bg)] text-[var(--hc-primary)]"
                            : "border-[var(--hc-border-soft)] bg-white text-[var(--hc-text)] hover:border-[var(--hc-border-strong)]"
                        }`}
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        type="button"
                      >
                        {formatSlotTime(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] bg-white p-4 text-sm font-medium text-[var(--hc-text-secondary)]">
                    No available slots for this doctor and date.
                  </p>
                )
              ) : (
                <p className="border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] bg-white p-4 text-sm font-medium text-[var(--hc-text-secondary)]">
                  Select a doctor to load real available slots.
                </p>
              )}
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-full-name">
                Full Name
              </label>
              <input className="hc-input w-full" id="booking-full-name" name="fullName" placeholder="Patient full name" type="text" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-phone">
                Contact Number
              </label>
              <input className="hc-input w-full" id="booking-phone" name="phone" placeholder="+84 ..." type="tel" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-email">
                Email Address
              </label>
              <input className="hc-input w-full" id="booking-email" name="email" placeholder="name@example.com" type="email" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-cccd">
                Patient CCCD
              </label>
              <input className="hc-input w-full" id="booking-cccd" inputMode="numeric" name="cccd" placeholder="12 digits" type="text" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-dob">
                Date Of Birth
              </label>
              <input className="hc-input w-full" id="booking-dob" name="dateOfBirth" type="date" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-gender">
                Gender
              </label>
              <select className="hc-input w-full" id="booking-gender" name="gender" defaultValue="">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-province">
                Province Or City
              </label>
              <input className="hc-input w-full" id="booking-province" name="provinceOrCity" placeholder="Ho Chi Minh City" type="text" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-district">
                District
              </label>
              <input className="hc-input w-full" id="booking-district" name="district" placeholder="District 1" type="text" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-street">
                Street Address
              </label>
              <input className="hc-input w-full" id="booking-street" name="streetAddress" placeholder="Street address" type="text" />
            </div>
          </div>

          <div className="mt-10">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]" htmlFor="booking-symptoms">
              Primary Symptom Description
            </label>
            <textarea className="hc-input w-full min-h-36 py-4 resize-y" id="booking-symptoms" name="symptoms" placeholder="Describe your symptoms, duration and severity..." />
          </div>

          <div className="mt-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]">
              Observed Symptoms
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {symptomOptions.map((symptom) => (
                <label key={symptom} className="flex items-center gap-3 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] bg-[var(--hc-surface-muted)] px-4 py-3 text-sm font-medium hover:border-[var(--hc-border-strong)] transition-colors cursor-pointer">
                  <input className="h-4 w-4 rounded-sm border-[var(--hc-border-strong)] text-[var(--hc-primary)] focus:ring-[var(--hc-primary)]" name="observedSymptoms" type="checkbox" value={symptom} />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-[var(--hc-border-soft)] pt-8">
            <button className="hc-button-primary px-8 py-3" type="submit" disabled={isSubmitting || isLoadingDoctors || isLoadingSlots}>
              {isSubmitting ? "Submitting Booking..." : "Confirm Appointment"}
            </button>
            <Link href="/portal/login" className="hc-button-secondary px-8 py-3">
              Sign In For Saved Profile
            </Link>
          </div>

          {message ? (
            <div className={`mt-8 border rounded-[var(--radius-md)] p-6 flex flex-col gap-2 ${messageTone === "success" ? "border-green-200 bg-[var(--hc-success-bg)] text-[var(--hc-success)]" : "border-red-200 bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]"}`} role="alert">
              <span className="text-sm font-bold tracking-tight">{messageTone === "success" ? "Success" : "Error"}</span>
              <p className="text-sm font-medium">{message}</p>
            </div>
          ) : null}
        </form>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-[var(--hc-surface-soft)] p-8">
            <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.15em] text-[var(--hc-text-muted)]">
              Intake Summary
            </h2>

            <div className="space-y-6">
              <div className="border border-[var(--hc-border-strong)] rounded-[var(--radius-lg)] bg-white p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--hc-primary)]"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--hc-text-muted)] mb-2">
                  Appointment Status
                </p>
                <p className="text-3xl font-light text-[var(--hc-text)] tracking-tight">
                  {confirmation?.status ?? "Pending"}
                </p>
                <p className="mt-2 text-xs font-medium text-[var(--hc-text-secondary)] leading-relaxed">
                  {confirmation
                    ? `Code ${confirmation.confirmationCode} for ${confirmation.appointmentDate}.`
                    : "A real confirmation code appears only after the backend creates an appointment."}
                </p>
              </div>

              <div className="border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--hc-text-muted)] mb-4">
                  Selected Slot
                </p>
                <ul className="space-y-3 text-sm font-medium text-[var(--hc-text-secondary)]">
                  <li className="flex justify-between border-b border-[var(--hc-border-soft)] pb-2">
                    <span>Doctor</span>
                    <span className="text-[var(--hc-text)] font-bold">{selectedDoctor?.fullName ?? "Not selected"}</span>
                  </li>
                  <li className="flex justify-between border-b border-[var(--hc-border-soft)] pb-2">
                    <span>Date</span>
                    <span className="text-[var(--hc-text)] font-bold">{slotDate || "Not selected"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Time</span>
                    <span className="text-[var(--hc-text)] font-bold">
                      {slots.find((slot) => slot.id === selectedSlotId)
                      ? formatSlotTime(slots.find((slot) => slot.id === selectedSlotId) as DoctorSlotResponse)
                      : "Not selected"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border border-[var(--hc-warning-bg)] rounded-[var(--radius-lg)] bg-[var(--hc-warning-bg)] p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-[var(--hc-warning)] text-xl mt-0.5">⚠</span>
                  <p className="text-xs font-medium leading-relaxed text-[var(--hc-warning)]">
                    Emergency symptoms such as severe chest pain, breathing distress, or heavy bleeding should use emergency services immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
