"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";
import { ApiClientError } from "./hms-api";
import {
  LockGlyph,
  MailGlyph,
  PublicAction,
  PublicBrand,
  PublicEyebrow,
  PublicInputField,
  PublicNotice
} from "../public-ui/public-ui";
import styles from "./patient-access-screen.module.css";

export function PatientClaimScreen() {
  const { claimPatient } = useAuth();
  const [fullName, setFullName] = useState("Nguyen Thi Hoa");
  const [email, setEmail] = useState("patient@example.com");
  const [cccd, setCccd] = useState("012345678901");
  const [dateOfBirth, setDateOfBirth] = useState("1992-04-15");
  const [password, setPassword] = useState("Patient@1234");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/patient-portal";
  const fullNameId = useId();
  const emailId = useId();
  const cccdId = useId();
  const dateOfBirthId = useId();
  const passwordId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await claimPatient({
        cccd,
        dateOfBirth,
        email,
        fullName,
        password
      });
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
          <PublicBrand name="Clinical Atelier" label="Portal activation" mark="CA" tone="inverse" />
          <PublicEyebrow tone="inverse">Patient claim</PublicEyebrow>
          <h1 className={styles.heroTitle}>Claim your patient portal access.</h1>
          <p className={styles.heroSummary}>
            Verify the same details used during booking so the portal can bind to the correct patient chart.
          </p>
          <div className={styles.bulletList}>
            <div className={styles.bullet}>
              <div className={styles.bulletTitle}>Identity checks</div>
              <div className={styles.bulletText}>Name, email, CCCD, and date of birth must match an existing patient record.</div>
            </div>
            <div className={styles.bullet}>
              <div className={styles.bulletTitle}>Demo data</div>
              <div className={styles.bulletText}>The seeded demo values are prefilled so local verification works immediately.</div>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelTop}>
            <div className={styles.panelBadge}>Continue to {redirectTarget}</div>
            <PublicAction href="/patient-login" tone="inline">
              Already have access?
            </PublicAction>
          </div>

          <div>
            <PublicEyebrow>Activate portal access</PublicEyebrow>
            <h2 className={styles.heading}>Verify your patient identity</h2>
            <p className={styles.bodyText}>
              After activation, the patient session will go directly into the portal dashboard.
            </p>
          </div>

          {errorMessage ? (
            <div role="alert">
              <PublicNotice tone="danger">{errorMessage}</PublicNotice>
            </div>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <PublicInputField
              id={fullNameId}
              label="Full name"
              name="fullName"
              onChange={(event) => setFullName(event.target.value)}
              value={fullName}
            />
            <PublicInputField
              autoComplete="email"
              icon={<MailGlyph />}
              id={emailId}
              label="Email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
            <PublicInputField
              id={cccdId}
              label="CCCD"
              name="cccd"
              onChange={(event) => setCccd(event.target.value)}
              value={cccd}
            />
            <PublicInputField
              id={dateOfBirthId}
              label="Date of birth"
              name="dateOfBirth"
              onChange={(event) => setDateOfBirth(event.target.value)}
              type="date"
              value={dateOfBirth}
            />
            <PublicInputField
              autoComplete="new-password"
              icon={<LockGlyph />}
              id={passwordId}
              label="Create password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
            <div className={styles.actions}>
              <PublicAction disabled={isSubmitting} tone="primary" type="submit">
                {isSubmitting ? "Activating..." : "Activate patient portal"}
              </PublicAction>
              <PublicAction href="/patient-login" tone="secondary">
                Back to login
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

  return "Unable to activate the patient portal right now.";
}
