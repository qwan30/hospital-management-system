"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  activateAdminUser,
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserResponse,
  type AdminUserUpsertRequest,
  type UserRole,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { Users, UserPlus, HeartPulse, Building2, ShieldCheck, Search, X } from "lucide-react";

const roles: UserRole[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "ACCOUNTANT",
];

interface UserFormState {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  departmentId: string;
  specialty: string;
  qualification: string;
  experienceYears: string;
  active: boolean;
}

const emptyForm: UserFormState = {
  email: "",
  password: "",
  fullName: "",
  phone: "",
  role: "DOCTOR",
  departmentId: "",
  specialty: "",
  qualification: "",
  experienceYears: "",
  active: true,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const loadUsers = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const nextUsers = await listAdminUsers();
      if (!isMounted()) {
        return;
      }
      setUsers(nextUsers);
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setUsers([]);
      setError(errorMessage(caught, "Unable to load admin users."));
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadUsers(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          user.userId,
          user.fullName,
          user.email,
          user.phone,
          user.departmentName,
          user.specialty,
          user.qualification,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? user.active : !user.active);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const stats = useMemo(() => {
    const medical = users.filter((user) => ["DOCTOR", "NURSE", "PHARMACIST"].includes(user.role)).length;
    const administration = users.filter((user) => ["ADMIN", "RECEPTIONIST", "ACCOUNTANT"].includes(user.role)).length;
    const active = users.filter((user) => user.active).length;
    return { total: users.length, medical, administration, active };
  }, [users]);

  function openCreateForm() {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(user: AdminUserResponse) {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      fullName: user.fullName,
      phone: user.phone ?? "",
      role: user.role,
      departmentId: user.departmentId ?? "",
      specialty: user.specialty ?? "",
      qualification: user.qualification ?? "",
      experienceYears: user.experienceYears == null ? "" : String(user.experienceYears),
      active: user.active,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = toUserRequest(form, editingUser);
    const validationError = validateUserRequest(request, Boolean(editingUser));
    setFormError(null);
    setSuccess(null);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingUser
        ? await updateAdminUser(editingUser.userId, request)
        : await createAdminUser(request);
      setSuccess(saved ? `User ${saved.fullName} saved.` : "User saved.");
      setIsFormOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
      await loadUsers();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save admin user."));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleUserActive(user: AdminUserResponse) {
    setFormError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const saved = user.active
        ? await deactivateAdminUser(user.userId)
        : await activateAdminUser(user.userId);
      setSuccess(saved ? `User ${saved.fullName} ${saved.active ? "activated" : "deactivated"}.` : "User status updated.");
      await loadUsers();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to update user status."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20">
      <PageHeader
        title="Staff Directory"
        description="System Administration • Manage user roles and access"
        action={
          <button
            className="hc-button-primary flex items-center gap-2"
            onClick={openCreateForm}
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Add User</span>
          </button>
        }
      />

      {error ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">
          {error}
        </div>
      ) : null}
      {formError ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">
          {formError}
        </div>
      ) : null}
      {success ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-4 text-sm font-medium text-[var(--hc-success)]" role="status">
          {success}
        </div>
      ) : null}

      <div className="hc-kpi-grid mb-8">
        <KpiCard label="Total Staff" value={stats.total.toString()} icon={Users} tone="blue" />
        <KpiCard label="Medical Dept" value={stats.medical.toString()} icon={HeartPulse} tone="teal" />
        <KpiCard label="Administration" value={stats.administration.toString()} icon={Building2} tone="purple" />
        <KpiCard label="Active Accounts" value={stats.active.toString()} icon={ShieldCheck} tone="green" />
      </div>

      <DataPanel
        title="User Accounts"
        action={
          <div className="flex items-center gap-4">
            <select
              aria-label="Filter users by role"
              className="hc-input py-2 text-xs w-48"
              onChange={(event) => setRoleFilter(event.target.value as "ALL" | UserRole)}
              value={roleFilter}
            >
              <option value="ALL">Role: All</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              aria-label="Filter users by status"
              className="hc-input py-2 text-xs w-48"
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
              value={statusFilter}
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] w-4 h-4" />
              <input
                className="hc-input pl-9 py-2 text-xs w-full"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                type="search"
                value={query}
              />
            </div>
          </div>
        }
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading staff users...</div>
        ) : (
          <UsersTable
            isSaving={isSaving}
            onEdit={openEditForm}
            onToggleActive={toggleUserActive}
            users={filteredUsers}
          />
        )}

        <div className="flex items-center justify-between p-4 bg-[var(--hc-surface-soft)] border-t border-[var(--hc-border-soft)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            Showing {filteredUsers.length} of {users.length} staff members
          </span>
        </div>
      </DataPanel>

      {isFormOpen ? (
        <Dialog title={editingUser ? "Edit User" : "Add User"} onClose={() => setIsFormOpen(false)}>
          <UserForm
            form={form}
            isEditing={Boolean(editingUser)}
            isSaving={isSaving}
            onChange={setForm}
            onSubmit={handleSubmit}
          />
        </Dialog>
      ) : null}
    </div>
  );
}

function UsersTable({
  users,
  isSaving,
  onEdit,
  onToggleActive,
}: {
  users: AdminUserResponse[];
  isSaving: boolean;
  onEdit: (user: AdminUserResponse) => void;
  onToggleActive: (user: AdminUserResponse) => void;
}) {
  if (users.length === 0) {
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">No staff users match the current filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="hc-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--hc-surface-soft)] flex items-center justify-center text-[10px] font-bold border border-[var(--hc-border-soft)]">
                    {initials(user.fullName)}
                  </div>
                  <span className="text-sm font-semibold text-[var(--hc-text)] tracking-tight">{user.fullName}</span>
                </div>
              </td>
              <td className="text-[var(--hc-text-secondary)]">{user.email}</td>
              <td>
                <span className="hc-badge bg-[var(--hc-surface-soft)] text-[var(--hc-text)] border-[var(--hc-border-soft)]">
                  {user.role}
                </span>
              </td>
              <td>{user.departmentName || "Unassigned"}</td>
              <td>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-[var(--hc-success)]" : "bg-[var(--hc-text-secondary)]"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${user.active ? "" : "text-[var(--hc-text-secondary)]"}`}>
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="hc-button-secondary py-1.5 px-3 text-[11px]"
                    disabled={isSaving}
                    onClick={() => onEdit(user)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className={`py-1.5 px-3 rounded-[var(--radius-md)] text-[10px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-50 ${user.active ? "border-[var(--hc-border)] text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)]" : "bg-[var(--hc-success-bg)] text-[var(--hc-success)] border-[var(--hc-success-bg)] hover:bg-[var(--hc-success)] hover:text-white"}`}
                    disabled={isSaving}
                    onClick={() => onToggleActive(user)}
                    type="button"
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserForm({
  form,
  isEditing,
  isSaving,
  onChange,
  onSubmit,
}: {
  form: UserFormState;
  isEditing: boolean;
  isSaving: boolean;
  onChange: (form: UserFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="grid grid-cols-2 gap-5" noValidate onSubmit={onSubmit}>
      <FormInput label="Full Name" onChange={(value) => onChange({ ...form, fullName: value })} required value={form.fullName} />
      <FormInput label="Email" onChange={(value) => onChange({ ...form, email: value })} required type="email" value={form.email} />
      <FormInput
        label={isEditing ? "Password (optional)" : "Password"}
        onChange={(value) => onChange({ ...form, password: value })}
        required={!isEditing}
        type="password"
        value={form.password}
      />
      <FormInput label="Phone" onChange={(value) => onChange({ ...form, phone: value })} value={form.phone} />
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Role</label>
        <select
          aria-label="Role"
          className="hc-input w-full"
          onChange={(event) => onChange({ ...form, role: event.target.value as UserRole })}
          value={form.role}
        >
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <FormInput label="Department ID" onChange={(value) => onChange({ ...form, departmentId: value })} value={form.departmentId} />
      <FormInput label="Specialty" onChange={(value) => onChange({ ...form, specialty: value })} value={form.specialty} />
      <FormInput label="Qualification" onChange={(value) => onChange({ ...form, qualification: value })} value={form.qualification} />
      <FormInput label="Experience Years" onChange={(value) => onChange({ ...form, experienceYears: value })} type="number" value={form.experienceYears} />
      <label className="flex items-center gap-3 pt-8 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text)]">
        <input
          checked={form.active}
          className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] text-[var(--hc-blue-600)] focus:ring-[var(--hc-blue-500)]"
          onChange={(event) => onChange({ ...form, active: event.target.checked })}
          type="checkbox"
        />
        Active
      </label>
      <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--hc-border-soft)]">
        <button className="hc-button-primary disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save User"}
        </button>
      </div>
    </form>
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
        className="hc-input w-full"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function Dialog({
  children,
  title,
  onClose,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-3xl bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--hc-text)]">{title}</h2>
          <button aria-label="Close dialog" className="p-2 text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] rounded-[var(--radius-md)] transition-colors" onClick={onClose} type="button">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function toUserRequest(form: UserFormState, editingUser: AdminUserResponse | null): AdminUserUpsertRequest {
  const experienceYears = form.experienceYears.trim();

  return {
    email: form.email.trim(),
    password: form.password.trim() || (editingUser ? null : ""),
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

function validateUserRequest(request: AdminUserUpsertRequest, isEditing: boolean) {
  if (!request.fullName || !request.email || !request.role) {
    return "Full name, email, and role are required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    return "Enter a valid email address.";
  }
  if (!isEditing && (!request.password || request.password.length < 8)) {
    return "Password must be at least 8 characters for new users.";
  }
  if (request.password && request.password.length < 8) {
    return "Password must be at least 8 characters.";
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

