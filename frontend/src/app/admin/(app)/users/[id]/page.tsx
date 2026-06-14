"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  activateAdminUser,
  deactivateAdminUser,
  getAdminUser,
  updateAdminUser,
  type AdminUserResponse,
  type AdminUserUpsertRequest,
  type UserRole,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";

import { RouteErrorState } from "@/components/ui/route-error-state";

type StaffRole = Exclude<UserRole, "PATIENT">;

interface AdminUserFormState {
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  departmentId: string;
  specialty: string;
  qualification: string;
  experienceYears: string;
  active: boolean;
}

const roles: StaffRole[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"];

export default function AdminUserDetailEditPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "DOCTOR" as StaffRole,
    departmentId: "",
    specialty: "",
    qualification: "",
    experienceYears: "",
    active: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setSuccess(null);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isUUID) {
      setUser(null);
      setError("User not found.");
      setIsLoading(false);
      return;
    }

    try {
      const nextUser = await getAdminUser(userId);
      setUser(nextUser);
      setForm(toForm(nextUser));
      setError(null);
    } catch (caught) {
      setUser(null);
      setError(errorMessage(caught, "Unable to load admin user."));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void Promise.resolve().then(loadUser);
  }, [loadUser]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const request = toRequest(form);
    const validationError = validateRequest(request);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const saved = await updateAdminUser(userId, request);
      setUser(saved);
      setForm(toForm(saved));
      setSuccess(saved ? `User ${saved.fullName} updated.` : "User updated.");
    } catch (caught) {
      setError(errorMessage(caught, "Unable to update admin user."));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive() {
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const saved = user?.active
        ? await deactivateAdminUser(userId)
        : await activateAdminUser(userId);
      setUser(saved);
      setForm(toForm(saved));
      setSuccess(saved ? `User ${saved.fullName} ${saved.active ? "activated" : "deactivated"}.` : "User status updated.");
    } catch (caught) {
      setError(errorMessage(caught, "Unable to update user status."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <div className="max-w-5xl p-10">
          <p className="text-sm font-medium text-[var(--hc-text-secondary)]">Loading admin user...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        title="Staff Directory"
      />

      <div className="p-8 pt-0 max-w-5xl">

        {error && user ? (
          <div className="mb-8 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)] rounded-[var(--radius-md)]" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-8 border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-4 text-sm font-medium text-[var(--hc-success)] rounded-[var(--radius-md)]" role="status">
            {success}
          </div>
        ) : null}

        {!user ? (
          <RouteErrorState
            title="Staff user not found"
            description="This staff account may have been removed, deactivated, or you may not have permission to view it."
            primaryHref="/admin/users"
            primaryLabel="Back to Staff Directory"
            onRetry={error === "User not found." ? undefined : () => void loadUser()}
          />
        ) : (
          <div className="grid grid-cols-12 gap-8">
            <form className="col-span-12 lg:col-span-8" noValidate onSubmit={handleSubmit}>
              <div className="bg-white border border-[var(--hc-border-soft)] rounded-xl shadow-sm p-8 grid grid-cols-2 gap-5">
                <FormInput label="Full Name" onChange={(value) => setForm({ ...form, fullName: value })} required value={form.fullName} />
                <FormInput label="Email" onChange={(value) => setForm({ ...form, email: value })} required type="email" value={form.email} />
                <FormInput label="Phone" onChange={(value) => setForm({ ...form, phone: value })} value={form.phone} />
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Role</label>
                  <select
                    aria-label="Role"
                    className="w-full bg-[var(--hc-surface-soft)] border border-[var(--hc-border)] rounded-md py-3 px-4 text-sm"
                    onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })}
                    value={form.role}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <FormInput label="Department ID" onChange={(value) => setForm({ ...form, departmentId: value })} value={form.departmentId} />
                <FormInput label="Specialty" onChange={(value) => setForm({ ...form, specialty: value })} value={form.specialty} />
                <FormInput label="Qualification" onChange={(value) => setForm({ ...form, qualification: value })} value={form.qualification} />
                <FormInput label="Experience Years" onChange={(value) => setForm({ ...form, experienceYears: value })} type="number" value={form.experienceYears} />
                <label className="flex items-center gap-3 pt-8 text-xs font-bold uppercase tracking-widest text-[var(--hc-text)]">
                  <input checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} type="checkbox" className="rounded-[4px] border-[var(--hc-border)] text-[var(--hc-primary)] focus:ring-[var(--hc-primary)]" />
                  Active
                </label>
                <div className="col-span-2 flex justify-end">
                  <button className="hc-button-primary disabled:opacity-60" disabled={isSaving} type="submit">
                    {isSaving ? "Saving..." : "Save User"}
                  </button>
                </div>
              </div>
            </form>

            <aside className="col-span-12 lg:col-span-4 space-y-4">
              <div className="bg-white border border-[var(--hc-border-soft)] rounded-xl shadow-sm p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-1">User ID</div>
                <div className="text-sm font-mono break-all text-[var(--hc-text)]">{user.userId}</div>
              </div>
              <div className="bg-white border border-[var(--hc-border-soft)] rounded-xl shadow-sm p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-1">Department</div>
                <div className="text-2xl font-light text-[var(--hc-text)]">{user.departmentName || "Unassigned"}</div>
              </div>
              <button
                className="w-full hc-button-secondary disabled:opacity-60"
                disabled={isSaving}
                onClick={toggleActive}
                type="button"
              >
                {user.active ? "Deactivate User" : "Activate User"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">{label}</label>
      <input
        aria-label={label}
        className="w-full bg-[var(--hc-surface-soft)] border-b-2 border-[var(--hc-border-soft)] py-3 px-4 text-sm focus:border-[var(--hc-primary)] focus:ring-0 transition-all rounded-t-[var(--radius-sm)]"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function toForm(user: AdminUserResponse | null): AdminUserFormState {
  return {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role === "PATIENT" ? "DOCTOR" : user?.role ?? "DOCTOR",
    departmentId: user?.departmentId ?? "",
    specialty: user?.specialty ?? "",
    qualification: user?.qualification ?? "",
    experienceYears: user?.experienceYears == null ? "" : String(user.experienceYears),
    active: user?.active ?? true,
  };
}

function toRequest(form: ReturnType<typeof toForm>): AdminUserUpsertRequest {
  const experienceYears = form.experienceYears.trim();
  return {
    email: form.email.trim(),
    password: null,
    fullName: form.fullName.trim(),
    phone: nullableTrim(form.phone),
    role: form.role,
    departmentId: nullableTrim(form.departmentId),
    specialty: nullableTrim(form.specialty),
    qualification: nullableTrim(form.qualification),
    experienceYears: experienceYears ? Number(experienceYears) : null,
    active: form.active,
  };
}

function validateRequest(request: AdminUserUpsertRequest) {
  if (!request.fullName || !request.email || !request.role) {
    return "Full name, email, and role are required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    return "Enter a valid email address.";
  }
  if (request.experienceYears != null && (Number.isNaN(request.experienceYears) || request.experienceYears < 0)) {
    return "Experience years must be zero or greater.";
  }
  return null;
}

function nullableTrim(value: string) {
  const nextValue = value.trim();
  return nextValue ? nextValue : null;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}
