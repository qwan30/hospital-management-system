"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";
import { ApiClientError } from "./hms-api";
import {
  MailGlyph,
  LockGlyph,
  PublicAction,
  PublicBrand,
  PublicEyebrow,
  PublicInputField,
  PublicNotice
} from "../public-ui/public-ui";
import styles from "./patient-access-screen.module.css";

export function PatientLoginScreen() {
  const { bootstrap, bootstrapped, login, session, status } = useAuth();
  const [email, setEmail] = useState("patient@example.com");
  const [password, setPassword] = useState("Patient@1234");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/patient-portal";
  const emailId = useId();
  const passwordId = useId();

  useEffect(() => {
    if (!bootstrapped && status !== "loading") {
      void bootstrap("patient");
    }
  }, [bootstrap, bootstrapped, status]);

  useEffect(() => {
    if (session?.scope === "patient" && session.role === "PATIENT") {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password, "patient");
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
          <PublicBrand name="Clinical Atelier" label="Patient portal access" mark="CA" tone="inverse" />
          <PublicEyebrow tone="inverse">Patient portal</PublicEyebrow>
          <h1 className={styles.heroTitle}>Login to review your appointments, lab results, and messages.</h1>
          <p className={styles.heroSummary}>
            Patient access is isolated from staff workspaces and routes directly into the Stitch-backed portal screens.
          </p>
          <div className={styles.bulletList}>
            <div className={styles.bullet}>
              <div className={styles.bulletTitle}>Demo patient account</div>
              <div className={styles.bulletText}>patient@example.com / Patient@1234</div>
            </div>
            <div className={styles.bullet}>
              <div className={styles.bulletTitle}>Need first-time access?</div>
              <div className={styles.bulletText}>Claim portal access with your identity details before signing in.</div>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelTop}>
            <div className={styles.panelBadge}>Continue to {redirectTarget}</div>
            <PublicAction href="/patient-portal/claim" tone="inline">
              Claim portal access
            </PublicAction>
          </div>

          <div>
            <PublicEyebrow>Patient login</PublicEyebrow>
            <h2 className={styles.heading}>Welcome back</h2>
            <p className={styles.bodyText}>
              Use your portal email and password to open the authenticated patient screens.
            </p>
          </div>

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
              type="password"
              value={password}
            />
            <div className={styles.actions}>
              <PublicAction disabled={isSubmitting} tone="primary" type="submit">
                {isSubmitting ? "Signing in..." : "Open patient portal"}
              </PublicAction>
              <PublicAction href="/" tone="secondary">
                Back to public home
              </PublicAction>
            </div>
          </form>
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
