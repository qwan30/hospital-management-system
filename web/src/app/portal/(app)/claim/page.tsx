"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  apiRequest,
  persistSession,
  type PatientLoginResponse,
} from "@/lib/api-client";

export default function PatientClaimAccessPage() {
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClaim = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await apiRequest<PatientLoginResponse>("/patient-auth/claim", {
        method: "POST",
        body: JSON.stringify({
          fullName: String(formData.get("fullName") || ""),
          email: String(formData.get("email") || ""),
          cccd: String(formData.get("cccd") || ""),
          dateOfBirth: String(formData.get("dateOfBirth") || ""),
          password: String(formData.get("password") || ""),
        }),
      });

      persistSession("patient", response.data?.tokens, response.data?.role);
      setMessageTone("success");
      setMessage("Portal access activated. You can sign in with these credentials.");
    } catch (claimError) {
      setMessageTone("error");
      setMessage(claimError instanceof Error ? claimError.message : "Unable to activate portal access.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="w-full max-w-[520px] bg-surface-container-lowest flex flex-col">
        <header className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl" data-icon="health_metrics">
                health_metrics
              </span>
            </div>
            <span className="text-xl font-bold tracking-widest text-neutral-900 uppercase">
              MEDCORE OS
            </span>
          </div>
          <h1 className="text-3xl font-light text-on-surface leading-tight mb-2 tracking-tight">
            Patient Claim Access
          </h1>
          <p className="text-on-surface-variant text-sm font-normal">
            Secure portal activation for medical record retrieval and insurance claim management.
          </p>
        </header>

        <div className="grid grid-cols-2 px-8 gap-1">
          <div className="step-active py-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
              Step 01
            </span>
            <span className="text-xs font-semibold text-on-surface">Identity</span>
          </div>
          <div className="step-inactive py-2 opacity-40">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">
              Step 02
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">Verification</span>
          </div>
        </div>

        <form className="p-8 flex flex-col gap-8" onSubmit={handleClaim}>
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="fullName">
                Patient Full Name
              </label>
              <input
                className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all duration-200"
                id="fullName"
                name="fullName"
                placeholder="Enter full name"
                type="text"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="cccd">
                Citizen ID (CCCD) / Passport Number
              </label>
              <input
                className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all duration-200"
                id="cccd"
                name="cccd"
                placeholder="Enter identification number"
                type="text"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="dateOfBirth">
                Date of Birth
              </label>
              <input
                className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all duration-200"
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Registered Email Address
              </label>
              <input
                className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all duration-200"
                id="email"
                name="email"
                placeholder="name@hospital.com"
                type="email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <input
                className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all duration-200"
                id="password"
                name="password"
                placeholder="Create portal password"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="bg-surface-container-high p-4 flex gap-4 items-start">
              <span className="material-symbols-outlined text-primary text-xl" data-icon="info">
                info
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your identity will be cross-referenced with our secure Clinical Staff registry. Ensure the details match your latest hospital admission record.
              </p>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            {message ? (
              <p
                className={`border px-4 py-3 text-sm font-semibold ${
                  messageTone === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
                role="alert"
              >
                {message}
              </p>
            ) : null}
            <button
              className="w-full bg-primary-container text-white py-4 px-6 flex justify-between items-center group active:translate-y-[1px] transition-all disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              <span className="font-semibold tracking-wide uppercase text-sm">
                {isSubmitting ? "Requesting Verification" : "Request Verification Code"}
              </span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
            <Link className="text-xs font-semibold text-primary hover:underline self-start uppercase tracking-wider" href="/portal/login">
              Already activated? Sign in
            </Link>
          </div>
        </form>

        <div className="h-1 bg-gradient-to-r from-primary to-primary-container" />
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[120%] bg-surface-container-high opacity-50 rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]">
          <Image
            alt="Medical architecture"
            className="w-full h-full object-cover grayscale"
            data-alt="Monolithic modern hospital hallway with clean white walls and blue accent lights reflecting on polished marble floors"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOC9biM1FEjBEEaruoLpfKoUAXCxH0eMogR1X890B46HRmx7uaIvBMWn56cpTrvJLLLqdS90C49z7XXnG3u27U_4I_GxE19LDuD63VKAjDqGkcROIyHXXF5bEkgpPnRohmWl88rYX4Xil7fLAfgZ8YhzlvicX4qhkpvBEhqhYW11TDXvg9uwSkJIGz8wMXNUm9cwAW9Xx0b13PsOTQ6vzKRK4fCgoe25MyxkzGN8KEmbwJ7_KrkhpGoMJjzZ0DSXuZ2HFs2-m1AA"
            width={1200}
            height={800}
          />
        </div>
      </div>
    </main>
  );
}
