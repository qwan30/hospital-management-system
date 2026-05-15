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
  Plus
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";

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
    if (!normalizedQuery) {
      return closures;
    }

    return closures.filter((closure) =>
      [closure.title, closure.reason, closure.doctorName, closure.roomName, closure.closureDate]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [closures, query]);

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
    <div className="p-8 pb-20">
      <PageHeader
        title="Special Closures"
        description="Scheduling Administration • Record doctor leave, room maintenance, and hospital calendar exceptions"
        action={
          <button
            className="hc-button-primary flex items-center gap-2"
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

      <div className="hc-kpi-grid mb-8">
        <KpiCard label="Total Closures" value={closures.length.toString()} icon={CalendarOff} tone="blue" />
        <KpiCard label="Active" value={closures.filter((c) => c.active).length.toString()} icon={CheckCircle} tone="green" />
        <KpiCard label="Doctors" value={doctors.length.toString()} icon={Stethoscope} tone="teal" />
        <KpiCard label="Rooms" value={rooms.length.toString()} icon={DoorOpen} tone="purple" />
      </div>

      <DataPanel
        title="Closures List"
        action={
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] w-4 h-4" />
            <input
              className="hc-input pl-9 py-2 text-xs w-full"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search closures..."
              type="search"
              value={query}
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading special closures...</div>
        ) : (
          <ClosuresTable closures={filteredClosures} isSaving={isSaving} onEdit={openEditForm} />
        )}
      </DataPanel>

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
            <th>Title</th>
            <th>Date</th>
            <th>Doctor</th>
            <th>Room</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {closures.map((closure) => (
            <tr key={closure.closureId}>
              <td>
                <div className="text-sm font-semibold text-[var(--hc-text)] tracking-tight">{closure.title}</div>
                <div className="mt-1 text-xs text-[var(--hc-text-secondary)]">{closure.reason ?? "No reason provided"}</div>
              </td>
              <td className="text-[var(--hc-text-secondary)]">{closure.closureDate}</td>
              <td className="text-[var(--hc-text-secondary)]">{closure.doctorName ?? "All doctors"}</td>
              <td className="text-[var(--hc-text-secondary)]">{closure.roomName ?? "All rooms"}</td>
              <td>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${closure.active ? "bg-[var(--hc-success)]" : "bg-[var(--hc-text-secondary)]"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${closure.active ? "" : "text-[var(--hc-text-secondary)]"}`}>
                    {closure.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="text-right">
                <button
                  className="hc-button-secondary py-1.5 px-3 text-[11px]"
                  disabled={isSaving}
                  onClick={() => onEdit(closure)}
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
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Doctor</label>
        <select
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
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Room</label>
        <select
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
