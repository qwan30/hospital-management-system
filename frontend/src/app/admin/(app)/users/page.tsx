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
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Users, UserPlus, HeartPulse, Building2, ShieldCheck,
  Search, X, Filter, ChevronDown, Download, Pencil,
  ChevronLeft, ChevronRight, ChevronsUpDown, Lock, Mail, LayoutGrid
} from "lucide-react";

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

  function handleExportCSV() {
    const headers = ["User ID", "Full Name", "Email", "Phone", "Role", "Department", "Specialty", "Status"];
    const rows = filteredUsers.map((user) => [
      user.userId,
      user.fullName,
      user.email,
      user.phone ?? "",
      user.role,
      user.departmentName ?? "",
      user.specialty ?? "",
      user.active ? "Active" : "Inactive",
    ]);
    downloadCsv(`staff_users_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  }

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
    const action = user.active ? "deactivate" : "activate";
    const confirmed = window.confirm(
      `Confirm ${action} for ${user.fullName}. This changes staff access immediately.`,
    );
    if (!confirmed) {
      return;
    }

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
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        title="Staff Directory"
        description="System Administration • Manage user roles and access"
        action={
          <div className="flex gap-3">
            <button
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] bg-white text-[var(--hc-text)] hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-60"
              disabled={filteredUsers.length === 0}
              onClick={handleExportCSV}
              type="button"
            >
              <Download className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-widest">Export CSV</span>
            </button>
            <button
              className="hc-button-primary flex items-center gap-2 h-10 px-5"
              onClick={openCreateForm}
              type="button"
            >
              <UserPlus className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-widest">Add User</span>
            </button>
          </div>
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
        <KpiCard label="Total Staff" value={isLoading ? "" : stats.total.toString()} icon={Users} tone="blue" isLoading={isLoading} />
        <KpiCard label="Medical Dept" value={isLoading ? "" : stats.medical.toString()} icon={HeartPulse} tone="teal" isLoading={isLoading} />
        <KpiCard label="Admin Stations" value={isLoading ? "" : stats.administration.toString()} icon={Building2} tone="purple" isLoading={isLoading} />
        <KpiCard label="Active Accounts" value={isLoading ? "" : stats.active.toString()} icon={ShieldCheck} tone="green" isLoading={isLoading} />
      </div>

      <div className="bg-white p-5 rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] w-4 h-4 pointer-events-none" />
            <input
              aria-label="Search users"
              className="h-10 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)] w-full transition-colors"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or ID..."
              type="search"
              value={query}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                aria-label="Filter users by role"
                className="h-10 pl-4 pr-10 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)] appearance-none font-medium min-w-[160px] transition-colors"
                onChange={(event) => setRoleFilter(event.target.value as "ALL" | UserRole)}
                value={roleFilter}
              >
                <option value="ALL">Role: All</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                aria-label="Filter users by status"
                className="h-10 pl-4 pr-10 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)] appearance-none font-medium min-w-[160px] transition-colors"
                onChange={(event) => setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
                value={statusFilter}
              >
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] pointer-events-none" />
            </div>

            <button
              aria-label="Clear user filters"
              className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] text-[var(--hc-text-secondary)] hover:bg-slate-50 transition-colors bg-white shadow-sm"
              onClick={() => {
                setQuery("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
              title="Clear Filters"
              type="button"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        {isLoading ? (
          <table className="hc-table w-full">
            <thead><tr><th className="hc-th">Name</th><th className="hc-th">Role</th><th className="hc-th">Status</th><th className="hc-th">Phone</th><th className="hc-th">Actions</th></tr></thead>
            <tbody>
              <TableRowSkeleton columns={5} />
              <TableRowSkeleton columns={5} />
              <TableRowSkeleton columns={5} />
              <TableRowSkeleton columns={5} />
            </tbody>
          </table>
        ) : (
          <>
            <UsersTable
              isSaving={isSaving}
              onEdit={openEditForm}
              onToggleActive={toggleUserActive}
              users={filteredUsers}
            />

            <div className="px-6 py-4 flex flex-wrap items-center justify-between border-t border-[var(--hc-border-soft)] bg-slate-50/50 mt-auto gap-4">
              <span className="text-xs text-[var(--hc-text-secondary)] font-medium">
                Showing 1 to {filteredUsers.length} of {users.length} staff members
              </span>

              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <div className="flex items-center gap-2 text-[11px] text-[var(--hc-text-secondary)]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Passwords are not exposed by the current API and access service.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    aria-label="Previous staff page"
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    disabled
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Staff page 1"
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--hc-blue-600)] text-white text-xs font-medium shadow-sm transition-colors"
                    type="button"
                  >
                    1
                  </button>
                  <button
                    aria-label="Next staff page"
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    disabled
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

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
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)] m-auto">No staff users match the current filters.</div>;
  }

  return (
    <div className="overflow-x-auto flex-1">
      <table className="hc-table">
        <thead>
          <tr>
            <th className="w-[30%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Full Name <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[25%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Email <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[15%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Role <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[15%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Department <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[10%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Status <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[5%] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId} className="hover:bg-[var(--hc-background)] transition-colors group">
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[var(--hc-blue-600)] flex items-center justify-center text-xs font-bold border border-blue-100 shrink-0">
                    {initials(user.fullName)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[var(--hc-text)] tracking-tight truncate">{user.fullName}</span>
                    <span className="text-xs text-[var(--hc-text-secondary)] font-medium truncate">{user.userId}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2 text-sm text-[var(--hc-text-secondary)]">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </td>
              <td>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                  user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                  user.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                  user.role === 'NURSE' ? 'bg-teal-50 text-teal-600 border border-teal-200' :
                  user.role === 'PHARMACIST' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {user.role}
                </div>
              </td>
              <td>
                <div className="text-sm font-medium text-[var(--hc-text)] truncate">
                  {user.departmentName || "Unassigned"}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.active ? "bg-[var(--hc-success)]" : "bg-slate-400"}`} />
                  <span className={`text-sm font-medium ${user.active ? "text-[var(--hc-text)]" : "text-[var(--hc-text-secondary)]"}`}>
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-[var(--hc-text-secondary)] hover:bg-slate-100 rounded-md transition-colors border border-transparent hover:border-slate-200"
                    disabled={isSaving}
                    onClick={() => onEdit(user)}
                    title="Edit User"
                    type="button"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="sr-only">edit</span>
                  </button>
                  <button
                    className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors disabled:opacity-50 border ${
                      user.active
                      ? "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white"
                      : "border-slate-200 text-slate-400 bg-slate-50 hover:bg-slate-500 hover:text-white"
                    }`}
                    disabled={isSaving}
                    onClick={() => onToggleActive(user)}
                    title={user.active ? "Deactivate User" : "Activate User"}
                    aria-label={user.active ? "Deactivate" : "Activate"}
                    type="button"
                  >
                    <LayoutGrid className="w-4 h-4" />
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
        <div className="relative">
          <select
            aria-label="Role"
            className="hc-input w-full pl-4 pr-10 appearance-none"
            onChange={(event) => onChange({ ...form, role: event.target.value as UserRole })}
            value={form.role}
          >
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] pointer-events-none" />
        </div>
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

function downloadCsv(fileName: string, rows: Array<Array<string | number>>) {
  const body = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const link = document.createElement("a");
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(body)}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}
