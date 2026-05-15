"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminScheduleTemplate,
  listAdminScheduleTemplates,
  listAdminUsers,
  updateAdminScheduleTemplate,
  type AdminUserResponse,
  type DoctorScheduleTemplateResponse,
  type DoctorScheduleTemplateUpsertRequest,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { FileText, CheckCircle2, User, Calendar, Plus, Search, X } from "lucide-react";

interface TemplateFormState {
  doctorId: string;
  weekday: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: string;
  active: boolean;
}

const emptyForm: TemplateFormState = {
  doctorId: "",
  weekday: "1",
  startTime: "08:00",
  endTime: "12:00",
  slotDurationMinutes: "30",
  active: true,
};

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AdminScheduleTemplatesPage() {
  const [templates, setTemplates] = useState<DoctorScheduleTemplateResponse[]>([]);
  const [doctors, setDoctors] = useState<AdminUserResponse[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DoctorScheduleTemplateResponse | null>(null);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);

  const loadData = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const [nextTemplates, nextUsers] = await Promise.all([
        listAdminScheduleTemplates(),
        listAdminUsers(),
      ]);
      if (!isMounted()) {
        return;
      }
      const nextDoctors = nextUsers.filter((user) => user.role === "DOCTOR" && user.active);
      setTemplates(nextTemplates);
      setDoctors(nextDoctors);
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setTemplates([]);
      setDoctors([]);
      setError(errorMessage(caught, "Unable to load schedule templates."));
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadData(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadData]);

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return templates;
    }

    return templates.filter((template) =>
      [template.doctorName, weekdayName(template.weekday), template.startTime, template.endTime]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, templates]);

  function openCreateForm() {
    setEditingTemplate(null);
    setForm({ ...emptyForm, doctorId: doctors[0]?.userId ?? "" });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(template: DoctorScheduleTemplateResponse) {
    setEditingTemplate(template);
    setForm({
      doctorId: template.doctorId,
      weekday: String(template.weekday),
      startTime: template.startTime.slice(0, 5),
      endTime: template.endTime.slice(0, 5),
      slotDurationMinutes: String(template.slotDurationMinutes),
      active: template.active,
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

    if (!request.doctorId) {
      setFormError("A real doctor must be selected before saving a schedule template.");
      return;
    }
    if (request.startTime >= request.endTime) {
      setFormError("Start time must be before end time.");
      return;
    }
    if (request.slotDurationMinutes < 15) {
      setFormError("Slot duration must be at least 15 minutes.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingTemplate
        ? await updateAdminScheduleTemplate(editingTemplate.templateId, request)
        : await createAdminScheduleTemplate(request);
      setSuccess(saved ? `Template for ${saved.doctorName} saved.` : "Schedule template saved.");
      setIsFormOpen(false);
      setEditingTemplate(null);
      await loadData();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save schedule template."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20">
      <PageHeader
        title="Schedule Templates"
        description="Scheduling Administration • Define recurring doctor availability templates"
        action={
          <button className="hc-button-primary flex items-center gap-2" onClick={openCreateForm} type="button">
            <Plus className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Add Template</span>
          </button>
        }
      />

      {error ? <Alert message={error} /> : null}
      {formError ? <Alert message={formError} /> : null}
      {success ? <Status message={success} /> : null}

      <div className="hc-kpi-grid mb-8">
        <KpiCard label="Total Templates" value={templates.length.toString()} icon={FileText} tone="blue" />
        <KpiCard label="Active Templates" value={templates.filter((template) => template.active).length.toString()} icon={CheckCircle2} tone="green" />
        <KpiCard label="Doctors" value={doctors.length.toString()} icon={User} tone="amber" />
        <KpiCard label="Visible" value={filteredTemplates.length.toString()} icon={Calendar} tone="teal" />
      </div>

      <DataPanel
        title="Templates Directory"
        action={
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] w-4 h-4" />
            <input
              aria-label="Search schedule templates"
              className="hc-input pl-9 py-2 text-xs w-full"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by doctor, weekday, or time..."
              type="search"
              value={query}
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading schedule templates...</div>
        ) : (
          <TemplatesTable isSaving={isSaving} onEdit={openEditForm} templates={filteredTemplates} />
        )}
        <div className="flex items-center justify-between p-4 bg-[var(--hc-surface-soft)] border-t border-[var(--hc-border-soft)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            Showing {filteredTemplates.length} of {templates.length} templates
          </span>
        </div>
      </DataPanel>

      {isFormOpen ? (
        <Dialog title={editingTemplate ? "Edit Schedule Template" : "Add Schedule Template"} onClose={() => setIsFormOpen(false)}>
          <TemplateForm doctors={doctors} form={form} isSaving={isSaving} onChange={setForm} onSubmit={handleSubmit} />
        </Dialog>
      ) : null}
    </div>
  );
}

function TemplatesTable({
  isSaving,
  onEdit,
  templates,
}: {
  isSaving: boolean;
  onEdit: (template: DoctorScheduleTemplateResponse) => void;
  templates: DoctorScheduleTemplateResponse[];
}) {
  if (templates.length === 0) {
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">No schedule templates match the current filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="hc-table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Weekday</th>
            <th>Start</th>
            <th>End</th>
            <th>Duration</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.templateId}>
              <td>
                <span className="text-sm font-semibold text-[var(--hc-text)] tracking-tight">{template.doctorName}</span>
              </td>
              <td className="text-[var(--hc-text-secondary)]">{weekdayName(template.weekday)}</td>
              <td className="text-[var(--hc-text-secondary)]">{template.startTime}</td>
              <td className="text-[var(--hc-text-secondary)]">{template.endTime}</td>
              <td className="text-[var(--hc-text-secondary)]">{template.slotDurationMinutes} min</td>
              <td>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${template.active ? "bg-[var(--hc-success)]" : "bg-[var(--hc-text-secondary)]"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${template.active ? "" : "text-[var(--hc-text-secondary)]"}`}>
                    {template.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="text-right">
                <button
                  className="hc-button-secondary py-1.5 px-3 text-[11px]"
                  disabled={isSaving}
                  onClick={() => onEdit(template)}
                  type="button"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TemplateForm({
  doctors,
  form,
  isSaving,
  onChange,
  onSubmit,
}: {
  doctors: AdminUserResponse[];
  form: TemplateFormState;
  isSaving: boolean;
  onChange: (form: TemplateFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Doctor</label>
        <select
          className="hc-input w-full"
          onChange={(event) => onChange({ ...form, doctorId: event.target.value })}
          required
          value={form.doctorId}
        >
          <option value="">Select real doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.userId} value={doctor.userId}>{doctor.fullName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Weekday</label>
        <select
          className="hc-input w-full"
          onChange={(event) => onChange({ ...form, weekday: event.target.value })}
          value={form.weekday}
        >
          {weekdays.map((day, index) => (
            <option key={day} value={index + 1}>{day}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <TextField label="Start Time" onChange={(value) => onChange({ ...form, startTime: value })} type="time" value={form.startTime} />
        <TextField label="End Time" onChange={(value) => onChange({ ...form, endTime: value })} type="time" value={form.endTime} />
        <TextField label="Slot Duration (Min)" onChange={(value) => onChange({ ...form, slotDurationMinutes: value })} type="number" value={form.slotDurationMinutes} />
      </div>

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
        <button className="hc-button-primary disabled:opacity-60" disabled={isSaving || doctors.length === 0} type="submit">
          {isSaving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </form>
  );
}

function TextField({ label, onChange, type = "text", value }: { label: string; onChange: (value: string) => void; type?: string; value: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">{label}</label>
      <input
        aria-label={label}
        className="hc-input w-full"
        min={type === "number" ? 15 : undefined}
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
    </div>
  );
}

function Dialog({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-2xl bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]">
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

function Alert({ message }: { message: string }) {
  return <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">{message}</div>;
}

function Status({ message }: { message: string }) {
  return <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-4 text-sm font-medium text-[var(--hc-success)]" role="status">{message}</div>;
}

function toRequest(form: TemplateFormState): DoctorScheduleTemplateUpsertRequest {
  return {
    doctorId: form.doctorId,
    weekday: Number(form.weekday),
    startTime: form.startTime,
    endTime: form.endTime,
    slotDurationMinutes: Number(form.slotDurationMinutes),
    active: form.active,
  };
}

function weekdayName(value: number) {
  return weekdays[value - 1] ?? `Day ${value}`;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}

