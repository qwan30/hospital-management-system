"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-hc-primary">
          Patient Booking
        </p>
        <h1 className="text-4xl font-light tracking-tight text-hc-on-surface md:text-5xl">
          Book Appointment
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hc-on-surface-variant">
          Choose a real doctor, select an available slot, and submit the required patient details.
          Unsupported or unavailable slots are not faked.
        </p>
      </header>

      <div className="grid gap-0 border border-hc-outline-variant/30 lg:grid-cols-12">
        <form className="bg-hc-surface-container-low p-6 lg:col-span-8 lg:p-10" onSubmit={handleSubmit} noValidate>
          <section className="mb-10 border border-hc-outline-variant/30 bg-hc-surface p-5">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-hc-outline">
              Doctor And Slot
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-doctor">
                  Doctor
                </label>
                <select
                  className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary"
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-date">
                  Appointment Date
                </label>
                <input
                  className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary"
                  id="booking-date"
                  min={todayDate()}
                  onChange={(event) => handleDateChange(event.target.value)}
                  type="date"
                  value={slotDate}
                />
              </div>
            </div>
            <div className="mt-6">
              {selectedDoctor ? (
                <p className="mb-3 text-xs text-hc-on-surface-variant">
                  Selected doctor: <span className="font-semibold text-hc-on-surface">{selectedDoctor.fullName}</span>
                </p>
              ) : null}
              {isLoadingSlots ? (
                <p className="border border-hc-outline-variant/30 bg-hc-surface-container-low p-4 text-sm text-hc-on-surface-variant">
                  Loading available slots...
                </p>
              ) : selectedDoctorId ? (
                availableSlots.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {availableSlots.map((slot) => (
                      <button
                        className={`border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                          selectedSlotId === slot.id
                            ? "border-hc-primary bg-hc-primary-container text-white"
                            : "border-hc-outline-variant bg-hc-surface text-hc-on-surface hover:border-hc-primary"
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
                  <p className="border border-hc-outline-variant/30 bg-hc-surface-container-low p-4 text-sm text-hc-on-surface-variant">
                    No available slots for this doctor and date.
                  </p>
                )
              ) : (
                <p className="border border-hc-outline-variant/30 bg-hc-surface-container-low p-4 text-sm text-hc-on-surface-variant">
                  Select a doctor to load real available slots.
                </p>
              )}
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-full-name">
                Full Name
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-full-name" name="fullName" placeholder="Patient full name" type="text" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-phone">
                Contact Number
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-phone" name="phone" placeholder="+84 ..." type="tel" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-email">
                Email Address
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-email" name="email" placeholder="name@example.com" type="email" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-cccd">
                Patient CCCD
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-cccd" inputMode="numeric" name="cccd" placeholder="12 digits" type="text" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-dob">
                Date Of Birth
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-dob" name="dateOfBirth" type="date" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-gender">
                Gender
              </label>
              <select className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-gender" name="gender" defaultValue="">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-province">
                Province Or City
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-province" name="provinceOrCity" placeholder="Ho Chi Minh City" type="text" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-district">
                District
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-district" name="district" placeholder="District 1" type="text" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-street">
                Street Address
              </label>
              <input className="w-full border-0 border-b-2 border-hc-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-street" name="streetAddress" placeholder="Street address" type="text" />
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hc-on-surface" htmlFor="booking-symptoms">
              Primary Symptom Description
            </label>
            <textarea className="min-h-36 w-full border border-hc-outline-variant/40 bg-hc-surface p-4 text-sm outline-none transition-colors focus:border-hc-primary" id="booking-symptoms" name="symptoms" placeholder="Describe your symptoms, duration and severity..." />
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-hc-on-surface">
              Observed Symptoms
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {symptomOptions.map((symptom) => (
                <label key={symptom} className="flex items-center gap-3 border border-hc-outline-variant/30 bg-hc-surface px-3 py-2 text-sm">
                  <input className="h-4 w-4 rounded-none border-hc-outline" name="observedSymptoms" type="checkbox" value={symptom} />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button className="bg-hc-primary-container px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-hc-primary disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting || isLoadingDoctors || isLoadingSlots}>
              {isSubmitting ? "Submitting Booking" : "Confirm Appointment"}
            </button>
            <Link href="/portal/login" className="border border-hc-outline-variant px-6 py-3 text-xs font-bold uppercase tracking-widest text-hc-on-surface transition-colors hover:bg-hc-surface-container">
              Sign In For Saved Profile
            </Link>
          </div>

          {message ? (
            <p className={`mt-6 border px-4 py-3 text-sm font-semibold ${messageTone === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`} role="alert">
              {message}
            </p>
          ) : null}
        </form>

        <aside className="bg-hc-surface p-6 lg:col-span-4 lg:p-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-hc-outline">
            Intake Summary
          </h2>

          <div className="mt-6 space-y-5">
            <div className="border-l-4 border-hc-primary bg-hc-surface-container-low p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-hc-primary">
                Appointment Status
              </p>
              <p className="mt-2 text-3xl font-light text-hc-on-surface">
                {confirmation?.status ?? "Pending"}
              </p>
              <p className="mt-1 text-xs text-hc-on-surface-variant">
                {confirmation
                  ? `Code ${confirmation.confirmationCode} for ${confirmation.appointmentDate}.`
                  : "A real confirmation code appears only after the backend creates an appointment."}
              </p>
            </div>

            <div className="border border-hc-outline-variant/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-hc-outline">
                Selected Slot
              </p>
              <ul className="mt-3 space-y-2 text-sm text-hc-on-surface-variant">
                <li>Doctor: {selectedDoctor?.fullName ?? "Not selected"}</li>
                <li>Date: {slotDate || "Not selected"}</li>
                <li>
                  Time: {slots.find((slot) => slot.id === selectedSlotId)
                    ? formatSlotTime(slots.find((slot) => slot.id === selectedSlotId) as DoctorSlotResponse)
                    : "Not selected"}
                </li>
              </ul>
            </div>

            <div className="border border-hc-outline-variant/30 p-4 text-xs leading-relaxed text-hc-on-surface-variant">
              Emergency symptoms such as severe chest pain, breathing distress, or heavy bleeding should use emergency services immediately.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
