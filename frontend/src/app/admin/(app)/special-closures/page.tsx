"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminSpecialClosure,
  listAdminRooms,
  listAdminSpecialClosures,
  listAdminUsers,
  updateAdminSpecialClosure,
  type AdminRoomResponse,
  type AdminUserResponse,
  type SpecialClosureResponse,
  type SpecialClosureUpsertRequest,
} from "@/lib/operations-api";

import {
  CalendarOff,
  CheckCircle,
  Stethoscope,
  DoorOpen,
  Search,
  X,
  Plus,
  Calendar,
  User,
  MoreVertical,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";


interface ClosureFormState {
  title: string;
  closureDate: string;
  doctorId: string;
  roomId: string;
  reason: string;
  active: boolean;
}

const emptyForm: ClosureFormState = {
  title: "",
  closureDate: "",
  doctorId: "",
  roomId: "",
  reason: "",
  active: true,
};

export default function AdminSpecialClosuresPage() {
  const [closures, setClosures] = useState<SpecialClosureResponse[]>([]);
  const [doctors, setDoctors] = useState<AdminUserResponse[]>([]);
  const [rooms, setRooms] = useState<AdminRoomResponse[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClosure, setEditingClosure] = useState<SpecialClosureResponse | null>(null);
  const [form, setForm] = useState<ClosureFormState>(emptyForm);

  const loadData = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const [nextClosures, nextUsers, nextRooms] = await Promise.all([
        listAdminSpecialClosures(),
        listAdminUsers(),
        listAdminRooms(),
      ]);
      if (!isMounted()) {
        return;
      }
      setClosures(nextClosures);
      setDoctors(nextUsers.filter((user) => user.role === "DOCTOR" && user.active));
      setRooms(nextRooms.filter((room) => room.active));
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setClosures([]);
      setDoctors([]);
      setRooms([]);
      setError(errorMessage(caught, "Unable to load special closures."));
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

  const filteredClosures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return closures.filter((closure) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? closure.active : !closure.active);
      const matchesQuery =
        !normalizedQuery ||
        [closure.title, closure.reason, closure.doctorName, closure.roomName, closure.closureDate]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [closures, query, statusFilter]);

  function openCreateForm() {
    setEditingClosure(null);
    setForm(emptyForm);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(closure: SpecialClosureResponse) {
    setEditingClosure(closure);
    setForm({
      title: closure.title,
      closureDate: closure.closureDate,
      doctorId: closure.doctorId ?? "",
      roomId: closure.roomId ?? "",
      reason: closure.reason ?? "",
      active: closure.active,
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

    if (!request.title || !request.closureDate) {
      setFormError("Title and closure date are required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingClosure
        ? await updateAdminSpecialClosure(editingClosure.closureId, request)
        : await createAdminSpecialClosure(request);
      setSuccess(saved ? `Closure ${saved.title} saved.` : "Special closure saved.");
      setIsFormOpen(false);
      setEditingClosure(null);
      await loadData();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save special closure."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="SCHEDULING ADMINISTRATION"
        title="Special Closures"
        description="Record doctor leave, room maintenance, and hospital calendar exceptions."
        action={
          <button
            className="hc-button-primary flex items-center gap-2 h-10 px-5"
            onClick={openCreateForm}
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Add Closure</span>
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
        <KpiCard label="CLOSURES" value={closures.length.toString()} icon={CalendarOff} tone="blue" helper="Total closures" />
        <KpiCard label="ACTIVE" value={closures.filter((c) => c.active).length.toString()} icon={CheckCircle} tone="green" helper="Currently active" />
        <KpiCard label="DOCTORS" value={doctors.length.toString()} icon={Stethoscope} tone="purple" helper="Affected doctors" />
        <KpiCard label="ROOMS" value={rooms.length.toString()} icon={DoorOpen} tone="amber" helper="Affected rooms" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6 bg-[var(--hc-surface)] p-3 rounded-xl border border-[var(--hc-border-soft)] shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
          <input
            type="search"
            aria-label="Search special closures"
            placeholder="Search closures..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]"
            onChange={(event) => setQuery(event.target.value)}
            value={query}
          />
        </div>

        <div className="flex-none">
          <select
            aria-label="Filter closures by status"
            className="h-9 px-3 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] text-[var(--hc-text-secondary)]"
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            value={statusFilter}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <button className="hc-button-secondary flex items-center gap-2 h-9 px-4 ml-auto opacity-60" disabled title="Special closure export is not exposed by the current backend API." type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 7.33333L8 10.6667M8 10.6667L4.66667 7.33333M8 10.6667V2" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold text-xs text-[var(--hc-text-secondary)]">Export CSV</span>
        </button>
      </div>

      <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading special closures...</div>
        ) : (
          <ClosuresTable closures={filteredClosures} isSaving={isSaving} onEdit={openEditForm} />
        )}
      </div>

      {isFormOpen ? (
        <Dialog title={editingClosure ? "Edit Closure" : "Add Closure"} onClose={() => setIsFormOpen(false)}>
          <ClosureForm doctors={doctors} form={form} isSaving={isSaving} onChange={setForm} onSubmit={handleSubmit} rooms={rooms} />
        </Dialog>
      ) : null}
    </div>
  );
}

function ClosuresTable({
  closures,
  isSaving,
  onEdit,
}: {
  closures: SpecialClosureResponse[];
  isSaving: boolean;
  onEdit: (closure: SpecialClosureResponse) => void;
}) {
  if (closures.length === 0) {
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">No special closures match the current filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="hc-table">
        <thead>
          <tr>
            <th className="w-[30%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                TITLE <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[18%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                DATE <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[18%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                DOCTOR <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[12%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                ROOM <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[12%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                STATUS <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[10%] text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {closures.map((closure) => (
            <tr key={closure.closureId} className="group hover:bg-[var(--hc-background)] transition-colors">
              <td>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--hc-primary-bg)] flex items-center justify-center shrink-0 border border-blue-100">
                    <Calendar className="w-5 h-5 text-[var(--hc-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-sm font-bold text-[var(--hc-text)] truncate">{closure.title}</div>
                    <div className="text-xs text-[var(--hc-text-secondary)] truncate mt-0.5">{closure.reason ?? "No reason provided"}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--hc-text-muted)] shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[var(--hc-text)]">{closure.closureDate}</div>
                    <div className="text-xs text-[var(--hc-text-secondary)] mt-0.5">(Mon)</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--hc-text-muted)] shrink-0" />
                  <span className="text-sm font-medium text-[var(--hc-text)]">{closure.doctorName ?? "All doctors"}</span>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-[var(--hc-text-muted)] shrink-0" />
                  <span className="text-sm font-medium text-[var(--hc-text)]">{closure.roomName ?? "All rooms"}</span>
                </div>
              </td>
              <td>
                {closure.active ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--hc-success)] bg-[var(--hc-success-bg)] text-[var(--hc-success)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--hc-success)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Active</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-300 bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Inactive</span>
                  </div>
                )}
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="h-8 px-3 text-xs font-semibold text-[var(--hc-blue-600)] bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-surface-soft)] hover:border-slate-300 transition-colors"
                    disabled={isSaving}
                    onClick={() => onEdit(closure)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-[var(--hc-text-muted)] rounded-md transition-colors opacity-60" disabled title="Closure row actions are limited to edit until a delete/deactivate API contract is exposed." type="button">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)]">
        <span className="text-xs text-[var(--hc-text-secondary)] font-medium">
          Showing 1 to {closures.length} of {closures.length} closures
        </span>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] text-[var(--hc-text-muted)] hover:bg-[var(--hc-surface-soft)] disabled:opacity-50" disabled type="button">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--hc-blue-600)] text-white text-xs font-medium" type="button">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] text-[var(--hc-text-muted)] hover:bg-[var(--hc-surface-soft)] disabled:opacity-50" disabled type="button">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ClosureForm({
  doctors,
  form,
  isSaving,
  onChange,
  onSubmit,
  rooms,
}: {
  doctors: AdminUserResponse[];
  form: ClosureFormState;
  isSaving: boolean;
  onChange: (form: ClosureFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  rooms: AdminRoomResponse[];
}) {
  return (
    <form className="grid gap-5" noValidate onSubmit={onSubmit}>
      <TextField label="Title" onChange={(value) => onChange({ ...form, title: value })} required value={form.title} />
      <TextField label="Closure Date" onChange={(value) => onChange({ ...form, closureDate: value })} required type="date" value={form.closureDate} />
      <div>
        <label htmlFor="doctor-select" className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Doctor</label>
        <select
          id="doctor-select"
          aria-label="Doctor"
          className="hc-input w-full"
          onChange={(event) => onChange({ ...form, doctorId: event.target.value })}
          value={form.doctorId}
        >
          <option value="">All doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor.userId} value={doctor.userId}>{doctor.fullName}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="room-select" className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Room</label>
        <select
          id="room-select"
          aria-label="Room"
          className="hc-input w-full"
          onChange={(event) => onChange({ ...form, roomId: event.target.value })}
          value={form.roomId}
        >
          <option value="">All rooms</option>
          {rooms.map((room) => (
            <option key={room.roomId} value={room.roomId}>{room.name}</option>
          ))}
        </select>
      </div>
      <TextArea label="Reason" onChange={(value) => onChange({ ...form, reason: value })} value={form.reason} />
      <label className="flex items-center gap-3 pt-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text)]">
        <input
          checked={form.active}
          className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] text-[var(--hc-blue-600)] focus:ring-[var(--hc-blue-500)]"
          onChange={(event) => onChange({ ...form, active: event.target.checked })}
          type="checkbox"
        />
        Active
      </label>
      <div className="flex justify-end mt-4 pt-4 border-t border-[var(--hc-border-soft)]">
        <button className="hc-button-primary disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save Closure"}
        </button>
      </div>
    </form>
  );
}

function TextField({ label, onChange, required = false, type = "text", value }: { label: string; onChange: (value: string) => void; required?: boolean; type?: string; value: string }) {
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

function TextArea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">{label}</label>
      <textarea
        aria-label={label}
        className="hc-input w-full"
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        value={value}
      />
    </div>
  );
}

function Dialog({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-2xl bg-[var(--hc-surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]">
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

function toRequest(form: ClosureFormState): SpecialClosureUpsertRequest {
  return {
    title: form.title.trim(),
    closureDate: form.closureDate,
    doctorId: nullableText(form.doctorId),
    roomId: nullableText(form.roomId),
    reason: nullableText(form.reason),
    active: form.active,
  };
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}
