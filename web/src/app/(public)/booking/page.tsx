"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

const symptomOptions = [
  "Acute fever (>101 F)",
  "Respiratory discomfort",
  "Chest tightness",
  "Gastrointestinal pain",
  "Neurological concern",
  "Other",
];

export default function PublicBookingPage() {
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const symptoms = String(formData.get("symptoms") || "").trim();
    const observedSymptoms = formData.getAll("observedSymptoms").map(String);

    if (!fullName || !phone || !email || !symptoms) {
      setMessageTone("error");
      setMessage("Full name, contact number, email address, and symptom description are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId:
            process.env.NEXT_PUBLIC_HMS_E2E_DOCTOR_ID ||
            "00000000-0000-0000-0000-000000000001",
          firstSlotId:
            process.env.NEXT_PUBLIC_HMS_E2E_SLOT_ID ||
            "00000000-0000-0000-0000-000000000002",
          aiDurationMinutes: 30,
          patientFullName: fullName,
          patientCccd: "012345678901",
          patientEmail: email,
          patientPhone: phone,
          patientDateOfBirth: "1990-05-15",
          patientGender: "MALE",
          patientAddress: {
            provinceOrCity: "Ho Chi Minh City",
            district: "District 1",
            streetAddress: "Pending intake confirmation",
          },
          symptoms: [symptoms, ...observedSymptoms].join(" | "),
        }),
      });

      setMessageTone("success");
      setMessage("Booking request received. Slot confirmation is pending clinical review.");
    } catch (submitError) {
      setMessageTone("error");
      setMessage(submitError instanceof Error ? submitError.message : "Unable to submit booking request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-hms-primary">
          Patient Booking
        </p>
        <h1 className="text-4xl font-light tracking-tight text-hms-on-surface md:text-5xl">
          Book Appointment
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hms-on-surface-variant">
          Complete the initial intake details. Our triage workflow prioritizes urgency and routes you to the earliest clinically appropriate slot.
        </p>
      </header>

      <div className="grid gap-0 border border-hms-outline-variant/30 lg:grid-cols-12">
        <form className="bg-hms-surface-container-low p-6 lg:col-span-8 lg:p-10" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hms-on-surface" htmlFor="booking-full-name">
                Full Name
              </label>
              <input
                className="w-full border-0 border-b-2 border-hms-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hms-primary"
                id="booking-full-name"
                name="fullName"
                placeholder="Patient full name"
                type="text"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hms-on-surface" htmlFor="booking-phone">
                Contact Number
              </label>
              <input
                className="w-full border-0 border-b-2 border-hms-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hms-primary"
                id="booking-phone"
                name="phone"
                placeholder="+84 ..."
                type="tel"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hms-on-surface" htmlFor="booking-email">
                Email Address
              </label>
              <input
                className="w-full border-0 border-b-2 border-hms-outline bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-hms-primary"
                id="booking-email"
                name="email"
                placeholder="name@hospital.com"
                type="email"
              />
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-hms-on-surface" htmlFor="booking-symptoms">
              Primary Symptom Description
            </label>
            <textarea
              className="min-h-36 w-full border border-hms-outline-variant/40 bg-hms-surface p-4 text-sm outline-none transition-colors focus:border-hms-primary"
              id="booking-symptoms"
              name="symptoms"
              placeholder="Describe your symptoms, duration and severity..."
            />
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-hms-on-surface">
              Observed Symptoms
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {symptomOptions.map((symptom) => (
                <label
                  key={symptom}
                  className="flex items-center gap-3 border border-hms-outline-variant/30 bg-hms-surface px-3 py-2 text-sm"
                >
                  <input
                    className="h-4 w-4 rounded-none border-hms-outline"
                    name="observedSymptoms"
                    type="checkbox"
                    value={symptom}
                  />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              className="bg-hms-primary-container px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-hms-primary disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Intake" : "Continue To Slot Selection"}
            </button>
            <Link
              href="/portal/login"
              className="border border-hms-outline-variant px-6 py-3 text-xs font-bold uppercase tracking-widest text-hms-on-surface transition-colors hover:bg-hms-surface-container"
            >
              Sign In For Saved Profile
            </Link>
          </div>

          {message ? (
            <p
              className={`mt-6 border px-4 py-3 text-sm font-semibold ${
                messageTone === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
              role="alert"
            >
              {message}
            </p>
          ) : null}
        </form>

        <aside className="bg-hms-surface p-6 lg:col-span-4 lg:p-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-hms-outline">
            Intake Summary
          </h2>

          <div className="mt-6 space-y-5">
            <div className="border-l-4 border-hms-primary bg-hms-surface-container-low p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-hms-primary">
                Estimated Wait
              </p>
              <p className="mt-2 text-3xl font-light text-hms-on-surface">~15 min</p>
              <p className="mt-1 text-xs text-hms-on-surface-variant">
                For triage confirmation and scheduling recommendation.
              </p>
            </div>

            <div className="border border-hms-outline-variant/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-hms-outline">
                Supported Channels
              </p>
              <ul className="mt-3 space-y-2 text-sm text-hms-on-surface-variant">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-hms-primary">
                    check_circle
                  </span>
                  SMS confirmation
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-hms-primary">
                    check_circle
                  </span>
                  Email reminder
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-hms-primary">
                    check_circle
                  </span>
                  Portal status updates
                </li>
              </ul>
            </div>

            <div className="border border-hms-outline-variant/30 p-4 text-xs leading-relaxed text-hms-on-surface-variant">
              Emergency symptoms such as severe chest pain, breathing distress, or heavy bleeding should use emergency services immediately.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
