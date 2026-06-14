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
import {
  Building2,
  CheckCircle2,
  XCircle,
  Network,
  Plus,
  Search,
  X,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";

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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
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
    return departments.filter((department) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? department.active : !department.active);
      const matchesQuery =
        !normalizedQuery ||
        [department.name, department.description, department.phone]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [departments, query, statusFilter]);

  const activeCount = departments.filter((department) => department.active).length;

  function handleExportCSV() {
    const headers = ["Department ID", "Name", "Phone", "Description", "Image URL", "Status"];
    const rows = filteredDepartments.map((department) => [
      department.departmentId,
      department.name,
      department.phone ?? "",
      department.description ?? "",
      department.imageUrl ?? "",
      department.active ? "Active" : "Inactive",
    ]);
    downloadCsv(`departments_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  }

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
    const confirmed = window.confirm(
      `Confirm deactivation for ${department.name}. Public department discovery and scheduling references may change immediately.`,
    );
    if (!confirmed) {
      return;
    }

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
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="FACILITY ADMINISTRATION"
        title="Manage Departments"
        description="Configure and manage hospital departments, their statuses, and directory information."
        action={
          <button className="hc-button-primary flex items-center gap-2 h-10 px-5" onClick={openCreateForm} type="button">
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

      <div className="hc-kpi-grid mb-6">
        <KpiCard label="DEPARTMENTS" value={departments.length.toString()} icon={Building2} tone="blue" helper="Total departments" />
        <KpiCard label="ACTIVE" value={activeCount.toString()} icon={CheckCircle2} tone="green" helper="Currently active" />
        <KpiCard label="INACTIVE" value={(departments.length - activeCount).toString()} icon={XCircle} tone="red" helper="Currently inactive" />
        <KpiCard label="API BACKED" value={filteredDepartments.length.toString()} icon={Network} tone="teal" helper="Filtered results" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-[var(--hc-border-soft)] shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
          <input
            type="search"
            aria-label="Search departments"
            placeholder="Search by name, description, or phone..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]"
            onChange={(event) => setQuery(event.target.value)}
            value={query}
          />
        </div>

        <div className="flex-none">
          <select
            aria-label="Filter departments by status"
            className="h-9 px-3 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] text-[var(--hc-text-secondary)]"
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            value={statusFilter}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <button
          className="hc-button-secondary flex items-center gap-2 h-9 px-4 ml-auto disabled:opacity-60"
          disabled={filteredDepartments.length === 0}
          onClick={handleExportCSV}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 7.33333L8 10.6667M8 10.6667L4.66667 7.33333M8 10.6667V2" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold text-xs text-[var(--hc-text-secondary)]">Export CSV</span>
        </button>
      </div>

      <div className="bg-white border border-[var(--hc-border-soft)] rounded-xl overflow-hidden shadow-sm">
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
      </div>

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
            <th className="w-[30%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                DEPARTMENT <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[20%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                CONTACT <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[25%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                IMAGE <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[15%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                STATUS <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </th>
            <th className="w-[10%] text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.departmentId} className="group hover:bg-[var(--hc-background)] transition-colors">
              <td>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-sm font-bold text-[var(--hc-text)] truncate">{department.name}</div>
                    <div className="text-xs text-[var(--hc-text-secondary)] line-clamp-1 mt-0.5" title={department.description || "No description"}>{department.description || "No description"}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-sm font-medium text-[var(--hc-text)]">{department.phone || "No phone"}</div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs text-[var(--hc-text-secondary)] truncate" title={department.imageUrl || ""}>
                    {department.imageUrl || "No image"}
                  </span>
                </div>
              </td>
              <td>
                {department.active ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--hc-success)] bg-[var(--hc-success-bg)] text-[var(--hc-success)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--hc-success)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Active</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-300 bg-slate-50 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Inactive</span>
                  </div>
                )}
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="h-8 px-3 text-xs font-semibold text-[var(--hc-blue-600)] bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                    disabled={isSaving}
                    onClick={() => onEdit(department)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[var(--hc-danger)] hover:bg-[var(--hc-danger-bg)] rounded-md transition-colors disabled:opacity-50"
                    disabled={isSaving || !department.active}
                    onClick={() => onDeactivate(department)}
                    title={department.active ? "Deactivate" : "Already inactive"}
                    type="button"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--hc-border-soft)] bg-slate-50/50">
        <span className="text-xs text-[var(--hc-text-secondary)] font-medium">
          Showing 1 to {departments.length} of {departments.length} departments
        </span>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled type="button">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--hc-blue-600)] text-white text-xs font-medium" type="button">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled type="button">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
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
