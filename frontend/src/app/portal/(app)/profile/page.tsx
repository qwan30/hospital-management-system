"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  getPatientPortalProfile,
  updatePatientPortalProfile,
  type PatientPortalProfileResponse,
  type PatientPortalProfileUpdateRequest,
} from "@/lib/operations-api";

import { HcIcon } from "@/components/ui/hc-icon";
type ProfileFormState = PatientPortalProfileUpdateRequest;

const emptyForm: ProfileFormState = {
  fullName: "",
  email: "",
  phone: "",
  occupation: "",
  bloodType: "",
  medicalHistory: "",
  drugAllergies: "",
  insuranceNumber: "",
};

export default function PatientPortalProfilePage() {
  const [profile, setProfile] = useState<PatientPortalProfileResponse | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const nextProfile = await getPatientPortalProfile();
        if (!isMounted) {
          return;
        }
        setProfile(nextProfile);
        setForm(toForm(nextProfile));
        setError(null);
      } catch (caught) {
        if (!isMounted) {
          return;
        }
        setError(errorMessage(caught, "Unable to load patient profile."));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const requiredMissing = useMemo(
    () => !form.fullName.trim() || !form.email.trim() || !form.phone.trim(),
    [form.email, form.fullName, form.phone],
  );

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSuccess(null);
  }

  function resetForm() {
    setForm(toForm(profile));
    setSuccess(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);

    if (requiredMissing) {
      setError("Full name, email, and phone are required.");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const savedProfile = await updatePatientPortalProfile(toRequest(form));
      setProfile(savedProfile);
      setForm(toForm(savedProfile));
      setSuccess("Profile saved from the patient portal API.");
    } catch (caught) {
      setError(errorMessage(caught, "Unable to save patient profile."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <div className="max-w-5xl mx-auto py-12 px-12">
          <p className="text-sm font-medium text-[var(--hc-text-secondary)]">Loading patient profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <form className="max-w-5xl mx-auto py-12 px-12" noValidate onSubmit={handleSubmit}>
        <div className="mb-12">
          <h1 className="text-4xl font-light text-[var(--hc-text)] tracking-tight mb-2">Patient Profile</h1>
          <p className="text-[var(--hc-text-secondary)] text-sm font-medium">Manage your personal information and security preferences.</p>
        </div>

        {error ? (
          <div className="mb-8 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-8 border border-[var(--hc-primary)]/20 bg-[var(--hc-primary)]/20 p-4 text-sm font-medium text-[var(--hc-primary)]" role="status">
            {success}
          </div>
        ) : null}

        {!profile && !error ? (
          <div className="mb-8 bg-[var(--hc-surface-muted)] p-6 text-sm font-medium text-[var(--hc-text-secondary)]">
            No profile is available for the current patient session.
          </div>
        ) : null}

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8">
            <div className="space-y-12">
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-6">Personal Information</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                  <ProfileInput
                    label="Full Name"
                    value={form.fullName}
                    onChange={(value) => updateField("fullName", value)}
                    required
                  />
                  <ProfileInput
                    label="Date of Birth"
                    value={formatDate(profile?.dateOfBirth)}
                    onChange={() => undefined}
                    disabled
                  />
                  <ProfileInput
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(value) => updateField("email", value)}
                    required
                  />
                  <ProfileInput
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(value) => updateField("phone", value)}
                    required
                  />
                  <ProfileInput
                    label="Occupation"
                    value={form.occupation ?? ""}
                    onChange={(value) => updateField("occupation", value)}
                  />
                  <ProfileInput
                    label="Blood Type"
                    value={form.bloodType ?? ""}
                    onChange={(value) => updateField("bloodType", value)}
                  />
                  <TextAreaInput
                    label="Medical History"
                    value={form.medicalHistory ?? ""}
                    onChange={(value) => updateField("medicalHistory", value)}
                  />
                  <TextAreaInput
                    label="Drug Allergies"
                    value={form.drugAllergies ?? ""}
                    onChange={(value) => updateField("drugAllergies", value)}
                  />
                  <ProfileInput
                    label="Insurance Number"
                    value={form.insuranceNumber ?? ""}
                    onChange={(value) => updateField("insuranceNumber", value)}
                    fullWidth
                  />
                </div>
              </section>

              <section id="security-settings">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-6">Security Settings</h2>
                <div className="bg-[var(--hc-border-strong)] p-8 space-y-6">
                  <UnsupportedSetting
                    title="Two-Factor Authentication"
                    description="Not exposed by the current patient portal API."
                  />
                  <UnsupportedSetting
                    title="Data Sharing Permissions"
                    description="Not exposed by the current patient portal API."
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-[var(--hc-content-bg)] p-8 border-t-4 border-[var(--hc-danger)]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-danger)] mb-6 flex items-center gap-2">
                <HcIcon name="emergency" className="text-sm" />
                Emergency Contact
              </h3>
              <p className="text-sm font-medium text-[var(--hc-text-secondary)]">
                Emergency contact editing is not exposed by the current patient portal API.
              </p>
              <button
                className="mt-6 w-full py-3 px-4 border border-[var(--hc-border-strong)] text-xs font-bold uppercase tracking-widest opacity-60"
                disabled
                type="button"
              >
                Edit Contact
              </button>
            </div>

            <div className="bg-[var(--hc-border-strong)] p-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-8">Medical Stats</h3>
              <div className="space-y-8">
                <StatBlock label="Blood Type" value={profile?.bloodType || "Not set"} />
                <StatBlock label="Insurance" value={profile?.insuranceNumber || "Not set"} />
                <StatBlock label="Patient ID" value={profile?.patientId ? profile.patientId.slice(0, 8) : "Unavailable"} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between py-12 border-t-2 border-[var(--hc-border-strong)]">
          <p className="text-xs text-[var(--hc-text-secondary)]">Profile data is loaded from the patient portal API.</p>
          <div className="flex items-center space-x-6">
            <button
              className="text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-[var(--hc-border)] transition-colors"
              disabled={isSaving}
              onClick={resetForm}
              type="button"
            >
              Discard changes
            </button>
            <button
              className="bg-[var(--hc-primary)] text-white text-xs font-bold uppercase tracking-widest px-12 py-4 shadow-[0_2px_0_0_var(--hc-blue-700)] active:shadow-none active:translate-y-[2px] transition-all disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

interface ProfileInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}

function ProfileInput({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  fullWidth = false,
}: ProfileInputProps) {
  return (
    <div className={fullWidth ? "col-span-2" : "col-span-2 md:col-span-1"}>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">
        {label}
      </label>
      <div className="bg-[var(--hc-surface-muted)] border-b-2 border-[var(--hc-border-strong)] focus-within:border-[var(--hc-primary)] transition-colors">
        <input
          aria-label={label}
          className="w-full bg-transparent border-none focus:ring-0 text-[var(--hc-text)] py-3 px-4 font-medium disabled:text-[var(--hc-text-secondary)]"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          type={type}
          value={value}
        />
      </div>
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="col-span-2">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">
        {label}
      </label>
      <div className="bg-[var(--hc-surface-muted)] border-b-2 border-[var(--hc-border-strong)] focus-within:border-[var(--hc-primary)] transition-colors">
        <textarea
          aria-label={label}
          className="min-h-28 w-full resize-y bg-transparent border-none focus:ring-0 text-[var(--hc-text)] py-3 px-4 font-medium"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      </div>
    </div>
  );
}

function UnsupportedSetting({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="font-bold text-sm mb-1">{title}</p>
        <p className="text-xs text-[var(--hc-text-secondary)]">{description}</p>
      </div>
      <div className="w-12 h-6 bg-[var(--hc-surface-muted)] border-2 border-[var(--hc-border)] relative opacity-60">
        <div className="absolute left-0 top-0 w-6 h-6 bg-white border-2 border-[var(--hc-border)]"></div>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-3xl font-light tracking-tight break-words">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mt-1">{label}</span>
    </div>
  );
}

function toForm(profile: PatientPortalProfileResponse | null): ProfileFormState {
  if (!profile) {
    return emptyForm;
  }

  return {
    fullName: profile.fullName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    occupation: profile.occupation ?? "",
    bloodType: profile.bloodType ?? "",
    medicalHistory: profile.medicalHistory ?? "",
    drugAllergies: profile.drugAllergies ?? "",
    insuranceNumber: profile.insuranceNumber ?? "",
  };
}

function toRequest(form: ProfileFormState): PatientPortalProfileUpdateRequest {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    occupation: nullableTrim(form.occupation),
    bloodType: nullableTrim(form.bloodType),
    medicalHistory: nullableTrim(form.medicalHistory),
    drugAllergies: nullableTrim(form.drugAllergies),
    insuranceNumber: nullableTrim(form.insuranceNumber),
  };
}

function nullableTrim(value: string | null) {
  const nextValue = value?.trim() ?? "";
  return nextValue ? nextValue : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}
