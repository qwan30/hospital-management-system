"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { HcIcon } from "@/components/ui/hc-icon";

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "#MC-8294401";
  return (
    <main className="max-w-[1400px] mx-auto p-8 pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[720px] flex flex-col space-y-10">

        <header className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-100 text-[var(--hc-success)] shadow-sm">
            <HcIcon name="check_circle" className="text-5xl" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-[var(--hc-text)] leading-tight">
              Booking confirmed.
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
              Appointment ID: {id}
            </p>
          </div>
        </header>

        <section className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8 md:p-10 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Practitioner</span>
              <div className="flex items-center space-x-4">
                <Image
                  alt="Doctor Profile"
                  className="w-14 h-14 object-cover rounded-[var(--radius-md)] grayscale"
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
                  unoptimized
                  width={1200} height={800}
                />
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-[var(--hc-text)]">Dr. Julian Sterling</h2>
                  <p className="text-sm font-medium text-[var(--hc-text-muted)]">Chief Cardiologist</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Schedule Details</span>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-[var(--hc-text)]">
                  <HcIcon name="calendar_today" className="text-[var(--hc-primary)] text-xl" />
                  <span className="text-lg font-bold">October 24, 2023</span>
                </div>
                <div className="flex items-center space-x-3 text-[var(--hc-text)]">
                  <HcIcon name="schedule" className="text-[var(--hc-primary)] text-xl" />
                  <span className="text-lg font-bold">09:15 AM (EST)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-[var(--hc-border-soft)] w-full"></div>

          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Instructions</span>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 bg-[var(--hc-surface-soft)] p-4 rounded-[var(--radius-lg)]">
                <HcIcon name="info" className="text-[var(--hc-primary)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed font-medium">Please arrive 15 minutes prior to your appointment at the <strong className="text-[var(--hc-text)]">West Wing Cardiology Department, Level 4</strong>.</p>
              </li>
              <li className="flex items-start gap-3 bg-[var(--hc-surface-soft)] p-4 rounded-[var(--radius-lg)]">
                <HcIcon name="mail" className="text-[var(--hc-primary)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed font-medium">A confirmation email has been sent to your registered address with the digital check-in QR code.</p>
              </li>
            </ul>
          </div>
        </section>

        <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button onClick={() => router.push("/staff/dashboard")} className="w-full sm:w-auto px-12 py-3 hc-button-primary">
            Go Home
          </button>
          <button onClick={() => router.push("/staff/booking")} className="w-full sm:w-auto px-12 py-3 hc-button-secondary">
            Book Another
          </button>
        </footer>

        <div className="pt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--hc-text-muted)]">
            Automated Hospital Core System &copy; 2024 HOSPITAL CORE
          </p>
        </div>
      </div>
    </main>
  );
}
