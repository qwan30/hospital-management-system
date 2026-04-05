"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PatientRouteGuard } from "../auth/patient-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import { WorkspaceAction } from "../workspace-ui/workspace-ui";
import { buildPatientPortalNav } from "./patient-portal-nav";
import { PatientPortalCard, PatientPortalShell } from "../patient-portal-ui/patient-portal-ui";
import { PatientPortalRouteState } from "./patient-portal-route-state";
import styles from "./patient-portal-screen.module.css";

type PortalProfile = {
  readonly patientId: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly dateOfBirth: string;
  readonly occupation: string | null;
  readonly bloodType: string | null;
  readonly medicalHistory: string | null;
  readonly drugAllergies: string | null;
  readonly insuranceNumber: string | null;
};

export function PatientProfileScreen() {
  return (
    <PatientRouteGuard
      fallback={<PatientPortalRouteState title="Checking patient access" description="Restoring your session before loading profile settings." />}
      forbiddenFallback={<PatientPortalRouteState title="Patient access required" description="This route is reserved for authenticated patient sessions." />}
    >
      <PatientProfileContent />
    </PatientRouteGuard>
  );
}

function PatientProfileContent() {
  const { apiFetch, logout } = useAuth();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void apiFetch<PortalProfile>("/patient-portal/profile", { scope: "patient" })
      .then(setProfile)
      .catch((error) => setErrorMessage(toMessage(error)));
  }, [apiFetch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setSaving(true);
    setSuccessMessage(null);

    try {
      const nextProfile = await apiFetch<PortalProfile>("/patient-portal/profile", {
        body: {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          occupation: profile.occupation,
          bloodType: profile.bloodType,
          medicalHistory: profile.medicalHistory,
          drugAllergies: profile.drugAllergies,
          insuranceNumber: profile.insuranceNumber
        },
        method: "PUT",
        scope: "patient"
      });
      setProfile(nextProfile);
      setSuccessMessage("Profile updated.");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PatientPortalShell
      navItems={buildPatientPortalNav("/patient-portal/profile")}
      subtitle="Patient profile"
      title="Profile & Settings"
      topbarAction={
        <WorkspaceAction
          onClick={() => {
            void logout("patient").then(() => {
              window.location.assign("/patient-login");
            });
          }}
          tone="secondary"
        >
          Sign out
        </WorkspaceAction>
      }
    >
      {errorMessage ? <div className={styles.notice}>{errorMessage}</div> : null}
      {successMessage ? <div className={styles.notice}>{successMessage}</div> : null}

      {profile ? (
        <PatientPortalCard eyebrow="Editable profile" title={profile.fullName}>
          <form className={styles.profileGrid} onSubmit={handleSubmit}>
            <label className={styles.profileField}>
              <span className={styles.meta}>Full name</span>
              <input
                onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
                value={profile.fullName}
              />
            </label>
            <label className={styles.profileField}>
              <span className={styles.meta}>Email</span>
              <input
                onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                value={profile.email}
              />
            </label>
            <label className={styles.profileField}>
              <span className={styles.meta}>Phone</span>
              <input
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                value={profile.phone}
              />
            </label>
            <label className={styles.profileField}>
              <span className={styles.meta}>Occupation</span>
              <input
                onChange={(event) => setProfile({ ...profile, occupation: event.target.value })}
                value={profile.occupation || ""}
              />
            </label>
            <label className={styles.profileField}>
              <span className={styles.meta}>Blood type</span>
              <input
                onChange={(event) => setProfile({ ...profile, bloodType: event.target.value })}
                value={profile.bloodType || ""}
              />
            </label>
            <label className={styles.profileField}>
              <span className={styles.meta}>Insurance</span>
              <input
                onChange={(event) => setProfile({ ...profile, insuranceNumber: event.target.value })}
                value={profile.insuranceNumber || ""}
              />
            </label>
            <label className={styles.profileField}>
              <span className={styles.meta}>Medical history</span>
              <textarea
                onChange={(event) => setProfile({ ...profile, medicalHistory: event.target.value })}
                rows={4}
                value={profile.medicalHistory || ""}
              />
            </label>
            <label className={styles.profileField}>
              <span className={styles.meta}>Drug allergies</span>
              <textarea
                onChange={(event) => setProfile({ ...profile, drugAllergies: event.target.value })}
                rows={4}
                value={profile.drugAllergies || ""}
              />
            </label>
            <div>
              <WorkspaceAction tone="primary" type="submit">
                {saving ? "Saving..." : "Save profile"}
              </WorkspaceAction>
            </div>
          </form>
        </PatientPortalCard>
      ) : (
        <PatientPortalRouteState
          title="Loading profile"
          description="Fetching your editable patient profile."
        />
      )}
    </PatientPortalShell>
  );
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load the patient profile right now.";
}
