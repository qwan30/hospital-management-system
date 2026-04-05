"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";
import { ApiClientError } from "./hms-api";
import { resolveStaffAccessPolicy } from "./staff-access";
import {
  CalendarGlyph,
  LockGlyph,
  MailGlyph,
  PublicAction,
  PublicBrand,
  PublicEyebrow,
  PublicInputField,
  PublicNotice,
  PulseGlyph,
  ShieldGlyph
} from "../public-ui/public-ui";
import styles from "./login-screen.module.css";

const accessHighlights = [
  {
    label: "Refresh cookie restore",
    summary: "Bootstraps the in-memory session before protected routes load.",
    icon: <ShieldGlyph />
  },
  {
    label: "Role-gated dashboard",
    summary: "Only doctor sessions can enter this vertical slice today.",
    icon: <PulseGlyph />
  },
  {
    label: "Live HMS handoff",
    summary: "Redirects directly into the doctor dashboard after sign-in succeeds.",
    icon: <CalendarGlyph />
  }
] as const;

export function LoginScreen() {
  const { bootstrap, bootstrapped, login, logout, session, status } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/doctor-dashboard";
  const accessPolicy = resolveStaffAccessPolicy(redirectTarget);
  const [email, setEmail] = useState(accessPolicy.primaryCredential.email);
  const [password, setPassword] = useState(accessPolicy.primaryCredential.password);

  useEffect(() => {
    if (!bootstrapped && status !== "loading") {
      void bootstrap("staff");
    }
  }, [bootstrap, bootstrapped, status]);

  useEffect(() => {
    if (
      session?.scope === "staff" &&
      accessPolicy.allowedRoles.includes(
        session.role as (typeof accessPolicy.allowedRoles)[number]
      )
    ) {
      router.replace(redirectTarget);
    }
  }, [accessPolicy.allowedRoles, redirectTarget, router, session]);

  useEffect(() => {
    setEmail(accessPolicy.primaryCredential.email);
    setPassword(accessPolicy.primaryCredential.password);
  }, [accessPolicy.primaryCredential.email, accessPolicy.primaryCredential.password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const nextSession = await login(email, password, "staff");
      if (
        !accessPolicy.allowedRoles.includes(
          nextSession.role as (typeof accessPolicy.allowedRoles)[number]
        )
      ) {
        await logout();
        setErrorMessage(accessPolicy.description);
        return;
      }

      router.replace(redirectTarget);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <PublicBrand
            label={accessPolicy.title}
            mark="CA"
            name="Clinical Atelier"
            tone="inverse"
          />

          <div className={styles.heroBody}>
            <PublicEyebrow tone="inverse">Secure staff handoff</PublicEyebrow>
            <h1 className={styles.heroTitle}>Staff access for the requested HMS workspace.</h1>
            <p className={styles.heroSummary}>
              Sign in restores the refresh-cookie backed session, validates the
              requested staff role, then routes directly into the target workspace.
            </p>
          </div>

          <div className={styles.heroHighlights}>
            {accessHighlights.map((item) => (
              <article key={item.label} className={styles.highlightCard}>
                <div className={styles.highlightIcon}>{item.icon}</div>
                <div className={styles.highlightLabel}>{item.label}</div>
                <p className={styles.highlightSummary}>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelTop}>
            <div className={styles.panelBadge}>Continue to {redirectTarget}</div>
            <PublicAction href="/" tone="inline">
              Back to public home
            </PublicAction>
          </div>

          <div className={styles.panelHeader}>
            <PublicEyebrow>Staff login</PublicEyebrow>
            <h2 className={styles.heading}>Welcome back</h2>
            <p className={styles.bodyText}>
              {accessPolicy.description}
            </p>
          </div>

          {status === "loading" && !bootstrapped ? (
            <PublicNotice tone="info">
              Restoring a previous session before re-entering protected routes.
            </PublicNotice>
          ) : null}

          {errorMessage ? (
            <div role="alert">
              <PublicNotice tone="danger">{errorMessage}</PublicNotice>
            </div>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <PublicInputField
              autoComplete="username"
              icon={<MailGlyph />}
              id={emailId}
              label="Email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />

            <PublicInputField
              autoComplete="current-password"
              icon={<LockGlyph />}
              id={passwordId}
              label="Password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              type="password"
              value={password}
            />

            <div className={styles.actions}>
              <PublicAction disabled={isSubmitting} tone="primary" type="submit">
                {isSubmitting ? "Signing in..." : "Continue to workspace"}
              </PublicAction>
            </div>
          </form>

          <PublicNotice tone="success">
            Recommended account: <strong>{accessPolicy.primaryCredential.email}</strong> /{" "}
            <strong>{accessPolicy.primaryCredential.password}</strong>
          </PublicNotice>
        </section>
      </div>
    </div>
  );
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to sign in right now.";
}
