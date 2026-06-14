"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Calendar,
  ClipboardPlus,
  FileText,
  MessageSquare,
  Stethoscope,
} from "lucide-react";
import {
  apiRequest,
  persistSession,
  type StaffLoginResponse,
} from "@/lib/api-client";

export default function StaffLoginPage() {
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
      const response = await apiRequest<StaffLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.data?.tokens?.accessToken || !response.data.role) {
        throw new Error("Staff login did not return a session.");
      }

      persistSession("staff", response.data.tokens, response.data.role);
      router.push("/staff/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white text-[var(--hc-text)]">
      <div className="flex flex-1">
        {/* Left Column - Feature Panel */}
        <section className="relative z-10 hidden w-full flex-col justify-center px-8 py-10 lg:flex lg:w-[45%] lg:px-16 xl:px-24 bg-[var(--hc-surface-muted)]">
          <div className="absolute left-8 top-8 flex items-center gap-3 lg:left-12">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--hc-primary)] text-white">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <span className="text-[15px] font-bold tracking-wide text-[var(--hc-primary)] uppercase">
              Hospital Core
            </span>
          </div>

          <div className="mt-8 max-w-[480px]">
            <h1 className="text-[44px] font-bold leading-[1.08] tracking-tight text-[var(--hc-text)]">
              Clinical Suite
            </h1>
            <p className="mt-2 text-[18px] font-medium text-[var(--hc-text-secondary)]">
              Your clinical workspace, organized and secure.
            </p>

            <p className="mb-8 mt-10 text-[20px] font-bold leading-snug text-[var(--hc-text)]">
              Everything you need for patient care, all in one place.
            </p>

            <div className="grid gap-6">
              <FeatureItem
                icon={<Calendar className="size-[22px] text-[var(--hc-primary)]" />}
                title="Manage Schedule"
                description="View and manage your daily appointments and schedule."
              />
              <FeatureItem
                icon={<FileText className="size-[22px] text-[var(--hc-primary)]" />}
                title="Patient Records"
                description="Access patient medical records securely and efficiently."
              />
              <FeatureItem
                icon={<ClipboardPlus className="size-[22px] text-[var(--hc-primary)]" />}
                title="Clinical Tasks"
                description="Track your tasks, queues, and clinical responsibilities."
              />
              <FeatureItem
                icon={<MessageSquare className="size-[22px] text-[var(--hc-primary)]" />}
                title="Secure Messaging"
                description="Communicate with your team and patients securely."
              />
            </div>

            <div className="mt-10 flex items-start gap-4 rounded-xl bg-[var(--hc-primary-bg)] p-5 border border-[var(--hc-blue-100)]">
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[var(--hc-primary)]" aria-hidden="true" />
              <div>
                <p className="text-[14px] font-bold text-[var(--hc-primary)]">
                  Strict access control active
                </p>
                <p className="mt-0.5 text-[13px] text-[var(--hc-text-secondary)]">
                  All activities in the Clinical Suite are monitored and audited for compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column - Login Form */}
        <section className="relative flex w-full items-center justify-center lg:w-[55%]">
          <div className="relative z-10 w-full max-w-[500px] px-6 py-10 lg:px-0">
            <div className="rounded-[var(--radius-2xl)] border border-[var(--hc-border)] bg-white px-8 py-10 shadow-[var(--shadow-card)]">
              <header className="mb-8 flex flex-col items-center text-center">
                <span className="mb-4 grid size-12 place-items-center rounded-xl border border-[var(--hc-primary)] bg-[var(--hc-primary-bg)] text-[var(--hc-primary)]">
                  <LockKeyhole className="size-6" aria-hidden="true" />
                </span>
                <span className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-primary)]">
                  Hospital Core
                </span>
                <h2 className="text-[26px] font-bold text-[var(--hc-text)]">
                  Staff Login
                </h2>
                <p className="mt-1 text-[14px] text-[var(--hc-text-secondary)]">
                  Enter your clinical credentials to access the suite.
                </p>
              </header>

              <hr className="mb-8 border-[var(--hc-border)]" />

              <form className="grid gap-5" onSubmit={handleLogin}>
                <label className="grid gap-2" htmlFor="staff-email">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--hc-text)]">
                    Email
                  </span>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-[var(--hc-border)] bg-white px-4 transition focus-within:border-[var(--hc-primary)] focus-within:ring-2 focus-within:ring-[var(--hc-primary-bg)]">
                    <UserRound className="size-5 shrink-0 text-[var(--hc-text-placeholder)]" aria-hidden="true" />
                    <input
                      className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-[var(--hc-text)] outline-none placeholder:text-[var(--hc-text-placeholder)]"
                      id="staff-email"
                      name="email"
                      placeholder="admin@hospital.vn"
                      type="email"
                      autoComplete="username"
                      required
                    />
                  </span>
                </label>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--hc-text)]" htmlFor="staff-password">
                      Password
                    </label>
                    <button
                      className="text-[12px] font-bold text-[var(--hc-text-secondary)] opacity-70"
                      disabled
                      title="Staff password reset is not exposed by the current authentication API."
                      type="button"
                    >
                      Reset unavailable
                    </button>
                  </div>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-[var(--hc-border)] bg-white px-4 transition focus-within:border-[var(--hc-primary)] focus-within:ring-2 focus-within:ring-[var(--hc-primary-bg)]">
                    <LockKeyhole className="size-5 shrink-0 text-[var(--hc-text-placeholder)]" aria-hidden="true" />
                    <input
                      className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-[var(--hc-text)] outline-none placeholder:text-[var(--hc-text-placeholder)]"
                      id="staff-password"
                      name="password"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[var(--hc-text-placeholder)] hover:text-[var(--hc-text)] focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-5 shrink-0" aria-hidden="true" /> : <Eye className="size-5 shrink-0" aria-hidden="true" />}
                    </button>
                  </span>
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
                  className="mt-2 flex h-12 w-full items-center justify-between rounded-lg bg-[var(--hc-primary)] px-5 text-[14px] font-bold text-white shadow-[var(--shadow-blue)] transition hover:bg-[var(--hc-blue-700)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span className="inline-flex items-center gap-3">
                    {isSubmitting ? (
                      <span className="size-[18px] shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                    ) : (
                      <LockKeyhole className="size-[18px]" aria-hidden="true" />
                    )}
                    {isSubmitting ? "Authenticating..." : "Log in to Clinical Suite"}
                  </span>
                  <ArrowRight className="size-5" aria-hidden="true" />
                </button>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mt-2">
                  <div className="h-px bg-[var(--hc-border)]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--hc-text-muted)]">
                    Emergency Access
                  </span>
                  <div className="h-px bg-[var(--hc-border)]" />
                </div>

                <button
                  className="flex h-12 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-[var(--hc-surface-muted)] px-4 text-[13px] font-bold text-[var(--hc-text)] transition hover:border-[var(--hc-primary)] hover:bg-[var(--hc-primary-bg)] disabled:opacity-60"
                  type="button"
                  disabled
                  title="Emergency code access is not available in the current authentication configuration."
                >
                  <span className="inline-flex items-center gap-3">
                    <ShieldCheck className="size-[18px] text-[var(--hc-text-secondary)]" aria-hidden="true" />
                    One-Time Emergency Code
                  </span>
                  <span className="text-[11px] font-medium text-[var(--hc-text-muted)]">Unavailable</span>
                </button>
              </form>

              <footer className="grid gap-3 pt-6 mt-4 sm:grid-cols-2 border-t border-[var(--hc-border)]">
                <StatusTile
                  icon={<span className="size-2.5 rounded-full bg-[var(--hc-success)]" />}
                  label="Status"
                  title="Systems Nominal"
                  detail="All services operational"
                />
                <StatusTile
                  icon={<Info className="size-4 text-[var(--hc-primary)]" aria-hidden="true" />}
                  label="Environment"
                  title="Clinical Suite"
                  detail="HIPAA-compliant platform"
                />
              </footer>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Bar */}
      <footer className="relative z-20 flex h-[64px] items-center justify-between border-t border-[var(--hc-border)] bg-[var(--hc-surface-muted)] px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-[var(--hc-navy-900)] text-white">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">
              System Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--hc-success)]" />
              <span className="text-[11px] font-bold text-[var(--hc-text)]">All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ShieldCheck className="size-5 text-[var(--hc-text)]" aria-hidden="true" />
          <span className="text-[13px] font-bold text-[var(--hc-text)]">Trusted. Secure. Healthcare.</span>
          <span className="text-[13px] font-medium text-[var(--hc-primary)]">HIPAA Compliant</span>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text)]">
            Clinical Suite
          </span>
          <span className="text-[10px] font-medium text-[var(--hc-text-secondary)]">
            Hospital Management System
          </span>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--hc-primary-bg)]">
        {icon}
      </span>
      <div>
        <h3 className="text-[15px] font-bold text-[var(--hc-text)]">{title}</h3>
        <p className="mt-0.5 text-[14px] text-[var(--hc-text-secondary)]">{description}</p>
      </div>
    </div>
  );
}

function StatusTile({
  detail,
  icon,
  label,
  title,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  title: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-[var(--hc-surface-muted)] p-3">
      <div className="mb-1.5 flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--hc-text-muted)]">
          {label}
        </span>
      </div>
      <p className="text-[13px] font-bold text-[var(--hc-text)]">{title}</p>
      <p className="mt-0.5 text-[12px] text-[var(--hc-text-secondary)]">{detail}</p>
    </div>
  );
}
