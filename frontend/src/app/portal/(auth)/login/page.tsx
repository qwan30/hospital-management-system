"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Hospital,
  Calendar,
  HeartPulse,
  FileText,
  MessageSquare,
  Globe,
  ChevronDown,
} from "lucide-react";
import {
  apiRequest,
  persistSession,
  type PatientLoginResponse,
} from "@/lib/api-client";

export default function PortalLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const response = await apiRequest<PatientLoginResponse>("/patient-auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.data?.tokens?.accessToken) {
        throw new Error("Patient login did not return a session.");
      }

      persistSession("patient", response.data.tokens, response.data.role);
      router.push("/portal/overview");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white text-[var(--hc-text)]">
      {/* SUPPORT Button - Floating top-right on the entire viewport */}
      <button className="absolute right-8 top-8 z-30 flex h-10 items-center gap-2 rounded-full border border-[var(--hc-border)] bg-white px-4 text-[13px] font-bold text-[var(--hc-primary)] shadow-sm hover:bg-[var(--hc-surface-muted)] transition">
        <span className="grid size-[18px] place-items-center rounded-full border-[1.5px] border-[var(--hc-primary)] font-bold text-[10px]">?</span>
        SUPPORT
      </button>

      <div className="relative flex flex-1">

        {/* Left Column - Information Panel */}
        <section className="relative z-10 hidden w-full flex-col justify-center px-8 py-10 lg:flex lg:w-[45%] lg:px-16 xl:px-24 bg-[#f8fbff]">
          <div className="absolute left-8 top-8 flex items-center gap-3 lg:left-12">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--hc-primary)] text-white">
              <Hospital className="size-5" aria-hidden="true" />
            </span>
            <span className="text-[15px] font-bold tracking-wide text-[var(--hc-primary)] uppercase">Hospital Core</span>
          </div>

          <div className="mt-8 max-w-[480px]">
            <h1 className="text-[52px] font-bold leading-[1.1] tracking-tight text-[#0a2540]">
              Patient Portal
            </h1>
            <p className="mt-2 text-[20px] font-medium text-[var(--hc-text-secondary)]">
              Your health. Your time. Your portal.
            </p>

            <p className="mb-8 mt-12 text-[22px] font-bold leading-snug text-[#0a2540]">
              Everything you need<br />
              for your health journey,<br />
              all in one place.
            </p>

            <div className="grid gap-7">
              <FeatureItem
                icon={<Calendar className="size-[22px] text-[var(--hc-primary)]" />}
                title="Manage Appointments"
                description="Schedule, view or cancel appointments with ease."
              />
              <FeatureItem
                icon={<HeartPulse className="size-[22px] text-[var(--hc-primary)]" />}
                title="Access Your Health"
                description="View test results, medications, immunizations and more."
              />
              <FeatureItem
                icon={<FileText className="size-[22px] text-[var(--hc-primary)]" />}
                title="Billing & Payments"
                description="View statements and make secure payments online."
              />
              <FeatureItem
                icon={<MessageSquare className="size-[22px] text-[var(--hc-primary)]" />}
                title="Message Your Care Team"
                description="Communicate securely with your healthcare providers."
              />
            </div>

            <div className="mt-10 flex items-start gap-4 rounded-xl bg-[#eef6ff] p-5 border border-[#d6e8ff]">
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[var(--hc-primary)]" aria-hidden="true" />
              <div>
                <p className="text-[14px] font-bold text-[var(--hc-primary)]">Your privacy is our priority.</p>
                <p className="mt-0.5 text-[13px] text-[#4b6a8e]">
                  We keep your information safe and secure in compliance with HIPAA standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column - Reception Lobby Photo Panel */}
        <section className="relative w-full lg:w-[55%] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/lobby.png')` }}
          />
          {/* Subtle translucent overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]" />
        </section>

        {/* Floating Centered Card Container */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-[540px] px-6 py-10 pointer-events-auto">
            <div className="rounded-[24px] border border-[var(--hc-border)] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
              <header className="mb-8 flex flex-col items-center text-center">
                <span className="mb-4 grid size-12 place-items-center rounded-xl border border-[var(--hc-primary)] bg-[#f8fbff] text-[var(--hc-primary)]">
                  <ClipboardPlus className="size-6" aria-hidden="true" />
                </span>
                <span className="mb-1.5 text-[12px] font-extrabold uppercase tracking-widest text-[var(--hc-primary)]">
                  Welcome Back
                </span>
                <h2 className="text-[28px] font-bold text-[#0a2540]">
                  Log in to your account
                </h2>
                <p className="mt-1 text-[15px] text-[var(--hc-text-secondary)]">
                  Access your health information securely
                </p>
              </header>

              <hr className="mb-8 border-[var(--hc-border)]" />

              <form className="grid gap-5" onSubmit={handleLogin}>
                <label className="grid gap-2" htmlFor="patient-email">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0a2540]">Email</span>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-[var(--hc-border)] bg-white px-4 transition focus-within:border-[var(--hc-primary)] focus-within:ring-2 focus-within:ring-[rgba(15,98,254,0.12)]">
                    <MailIcon className="size-5 shrink-0 text-[#9bb9da]" aria-hidden="true" />
                    <input
                      className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-[var(--hc-text)] outline-none placeholder:text-[#9bb9da]"
                      id="patient-email"
                      name="email"
                      placeholder="name@hospital.com"
                      type="email"
                      autoComplete="username"
                      required
                    />
                  </span>
                </label>

                <label className="grid gap-2" htmlFor="patient-password">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0a2540]">Password</span>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-[var(--hc-border)] bg-white px-4 transition focus-within:border-[var(--hc-primary)] focus-within:ring-2 focus-within:ring-[rgba(15,98,254,0.12)]">
                    <LockKeyhole className="size-5 shrink-0 text-[#9bb9da]" aria-hidden="true" />
                    <input
                      className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-[var(--hc-text)] outline-none placeholder:text-[#9bb9da]"
                      id="patient-password"
                      name="password"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#9bb9da] hover:text-[var(--hc-text)] focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="size-5 shrink-0" aria-hidden="true" /> : <Eye className="size-5 shrink-0" aria-hidden="true" />}
                    </button>
                  </span>
                </label>

                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="size-4 rounded border-[#9bb9da] text-[var(--hc-primary)] focus:ring-[var(--hc-primary)]" />
                    <span className="text-[13px] font-bold text-[#0a2540]">Remember me</span>
                  </label>
                  <button
                    className="text-[13px] font-bold text-[var(--hc-text-secondary)] opacity-70"
                    disabled
                    title="Patient password reset is not exposed by the current portal authentication API."
                    type="button"
                  >
                    Reset unavailable
                  </button>
                </div>

                {error ? (
                  <p
                    className="rounded-lg border border-[var(--hc-danger-bg)] bg-[var(--hc-danger-bg)] px-4 py-3 text-sm font-semibold text-[var(--hc-danger)]"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  className="relative mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-[var(--hc-primary)] px-5 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(11,92,255,0.3)] transition hover:bg-[var(--hc-blue-700)] disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting ? "Authenticating..." : "Log In"}
                  </span>
                  <ArrowRight className="absolute right-5 size-5" aria-hidden="true" />
                </button>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mt-4 mb-2">
                  <div className="h-px bg-[var(--hc-border)]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--hc-text-muted)]">
                    OR
                  </span>
                  <div className="h-px bg-[var(--hc-border)]" />
                </div>

                <Link
                  href="/portal/claim"
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[var(--hc-border-strong)] bg-white px-4 text-[14px] font-bold text-[var(--hc-primary)] shadow-sm transition hover:border-[var(--hc-primary)] hover:bg-[var(--hc-primary-bg)]"
                >
                  <Hospital className="size-[18px]" aria-hidden="true" />
                  Need access? Claim your portal
                </Link>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bar */}
      <footer className="relative z-20 flex h-[64px] items-center justify-between border-t border-[var(--hc-border)] bg-[#f4f7fb] px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-[#0a2540] text-[13px] font-bold text-white">
            N
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--hc-text-muted)]">
              System Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--hc-success)]" />
              <span className="text-[11px] font-bold text-[#0a2540]">OPERATIONAL // NODE_S7</span>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ShieldCheck className="size-5 text-[#0a2540]" aria-hidden="true" />
          <span className="text-[13px] font-bold text-[#0a2540]">Trusted. Secure. Healthcare.</span>
          <span className="text-[13px] font-medium text-[var(--hc-primary)]">HIPAA Compliant</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 lg:flex cursor-pointer hover:text-[var(--hc-primary)] transition">
            <Globe className="size-4 text-[var(--hc-text-secondary)]" />
            <span className="text-[13px] font-bold text-[#0a2540]">English (US)</span>
            <ChevronDown className="size-4 text-[var(--hc-text-secondary)]" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text)]">
              Patient Portal
            </span>
            <span className="text-[10px] font-medium text-[var(--hc-text-secondary)]">
              Hospital Management System
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#eef6ff]">
        {icon}
      </span>
      <div>
        <h3 className="text-[15px] font-bold text-[#0a2540]">{title}</h3>
        <p className="mt-0.5 text-[14px] text-[var(--hc-text-secondary)]">{description}</p>
      </div>
    </div>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
