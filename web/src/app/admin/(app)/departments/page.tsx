"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminDepartment,
  deactivateAdminDepartment,
  listAdminDepartments,
  updateAdminDepartment,
  type AdminDepartmentResponse,
  type AdminDepartmentUpsertRequest,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { Building2, CheckCircle2, XCircle, Network, Plus, Search, X } from "lucide-react";

interface DepartmentFormState {
  name: string;
  description: string;
  imageUrl: string;
  phone: string;
  active: boolean;
}

const emptyForm: DepartmentFormState = {
  name: "",
  description: "",
  imageUrl: "",
  phone: "",
  active: true,
};

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<AdminDepartmentResponse[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AdminDepartmentResponse | null>(null);
  const [form, setForm] = useState<DepartmentFormState>(emptyForm);

  const loadDepartments = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const nextDepartments = await listAdminDepartments();
      if (!isMounted()) {
        return;
      }
      setDepartments(nextDepartments);
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setDepartments([]);
      setError(errorMessage(caught, "Unable to load departments."));
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadDepartments(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadDepartments]);

  const filteredDepartments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return departments;
    }

    return departments.filter((department) =>
      [department.name, department.description, department.phone]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [departments, query]);

  const activeCount = departments.filter((department) => department.active).length;

  function openCreateForm() {
    setEditingDepartment(null);
    setForm(emptyForm);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(department: AdminDepartmentResponse) {
    setEditingDepartment(department);
    setForm({
      name: department.name,
      description: department.description ?? "",
      imageUrl: department.imageUrl ?? "",
      phone: department.phone ?? "",
      active: department.active,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = toRequest(form);
    setFormError(null);
    setSuccess(null);

    if (!request.name) {
      setFormError("Department name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingDepartment
        ? await updateAdminDepartment(editingDepartment.departmentId, request)
        : await createAdminDepartment(request);
      setSuccess(saved ? `Department ${saved.name} saved.` : "Department saved.");
      setIsFormOpen(false);
      setEditingDepartment(null);
      setForm(emptyForm);
      await loadDepartments();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save department."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(department: AdminDepartmentResponse) {
    setFormError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      await deactivateAdminDepartment(department.departmentId);
      setSuccess(`Department ${department.name} deactivated.`);
      await loadDepartments();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to deactivate department."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20">
      <PageHeader
        title="Manage Departments"
        description="Hospital Administration • Configure and manage hospital departments"
        action={
          <button className="hc-button-primary flex items-center gap-2" onClick={openCreateForm} type="button">
            <Plus className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Add Department</span>
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
        <KpiCard label="Total Departments" value={departments.length.toString()} icon={Building2} tone="blue" />
        <KpiCard label="Active Units" value={activeCount.toString()} icon={CheckCircle2} tone="green" />
        <KpiCard label="Inactive Units" value={(departments.length - activeCount).toString()} icon={XCircle} tone="red" />
        <KpiCard label="API Backed" value={filteredDepartments.length.toString()} icon={Network} tone="teal" />
      </div>

      <DataPanel
        title="Department Directory"
        action={
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] w-4 h-4" />
            <input
              className="hc-input pl-9 py-2 text-xs w-full"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name..."
              type="search"
              value={query}
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading departments...</div>
        ) : (
          <DepartmentsTable
            departments={filteredDepartments}
            isSaving={isSaving}
            onDeactivate={handleDeactivate}
            onEdit={openEditForm}
          />
        )}
        <div className="flex items-center justify-between p-4 bg-[var(--hc-surface-soft)] border-t border-[var(--hc-border-soft)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            Showing {filteredDepartments.length} of {departments.length} departments
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            Pagination is not exposed by the current admin departments API
          </span>
        </div>
      </DataPanel>

      {isFormOpen ? (
        <Dialog title={editingDepartment ? "Edit Department" : "Add Department"} onClose={() => setIsFormOpen(false)}>
          <DepartmentForm form={form} isSaving={isSaving} onChange={setForm} onSubmit={handleSubmit} />
        </Dialog>
      ) : null}
    </div>
  );
}

function DepartmentsTable({
  departments,
  isSaving,
  onDeactivate,
  onEdit,
}: {
  departments: AdminDepartmentResponse[];
  isSaving: boolean;
  onDeactivate: (department: AdminDepartmentResponse) => void;
  onEdit: (department: AdminDepartmentResponse) => void;
}) {
  if (departments.length === 0) {
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">No departments match the current filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="hc-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Phone</th>
            <th>Image URL</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.departmentId}>
              <td className="font-semibold text-[var(--hc-text)]">{department.name}</td>
              <td className="text-[var(--hc-text-secondary)]">{department.description || "No description"}</td>
              <td className="font-mono text-[var(--hc-text-secondary)] text-xs">{department.phone || "No phone"}</td>
              <td className="max-w-xs truncate text-[var(--hc-text-secondary)]" title={department.imageUrl || ""}>
                {department.imageUrl || "No image"}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${department.active ? "bg-[var(--hc-success)]" : "bg-[var(--hc-text-secondary)]"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${department.active ? "" : "text-[var(--hc-text-secondary)]"}`}>
                    {department.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="hc-button-secondary py-1.5 px-3 text-[11px]"
                    disabled={isSaving}
                    onClick={() => onEdit(department)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className={`py-1.5 px-3 rounded-[var(--radius-md)] text-[10px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-50 ${department.active ? "border-[var(--hc-danger)] text-[var(--hc-danger)] hover:bg-[var(--hc-danger-bg)]" : "border-[var(--hc-border)] text-[var(--hc-text-secondary)]"}`}
                    disabled={isSaving || !department.active}
                    onClick={() => onDeactivate(department)}
                    type="button"
                  >
                    Deactivate
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

function DepartmentForm({
  form,
  isSaving,
  onChange,
  onSubmit,
}: {
  form: DepartmentFormState;
  isSaving: boolean;
  onChange: (form: DepartmentFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <FormInput label="Name" onChange={(value) => onChange({ ...form, name: value })} required value={form.name} />
      <FormInput label="Description" onChange={(value) => onChange({ ...form, description: value })} value={form.description} />
      <FormInput label="Image URL" onChange={(value) => onChange({ ...form, imageUrl: value })} value={form.imageUrl} />
      <FormInput label="Phone" onChange={(value) => onChange({ ...form, phone: value })} value={form.phone} />
      <label className="flex items-center gap-3 pt-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text)]">
        <input
          checked={form.active}
          className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] text-[var(--hc-blue-600)] focus:ring-[var(--hc-blue-500)]"
          onChange={(event) => onChange({ ...form, active: event.target.checked })}
          type="checkbox"
        />
        Active
      </label>
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--hc-border-soft)]">
        <button className="hc-button-primary disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save Department"}
        </button>
      </div>
    </form>
  );
}

function FormInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
      <div className="w-full max-w-xl bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]">
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

function toRequest(form: DepartmentFormState): AdminDepartmentUpsertRequest {
  return {
    name: form.name.trim(),
    description: nullableTrim(form.description),
    imageUrl: nullableTrim(form.imageUrl),
    phone: nullableTrim(form.phone),
    active: form.active,
  };
}

function nullableTrim(value: string) {
  const nextValue = value.trim();
  return nextValue ? nextValue : null;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}
