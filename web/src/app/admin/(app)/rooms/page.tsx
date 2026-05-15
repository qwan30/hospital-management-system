"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminRoom,
  deactivateAdminRoom,
  listAdminRooms,
  updateAdminRoom,
  updateAdminRoomStatus,
  type AdminRoomResponse,
  type AdminRoomUpsertRequest,
  type RoomStatus,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { DoorOpen, CheckCircle2, Activity, Wrench, Plus, AlertCircle, X } from "lucide-react";

const statuses: RoomStatus[] = ["READY", "IN_USE", "BREAK", "MAINTENANCE"];

interface RoomFormState {
  name: string;
  departmentId: string;
  status: RoomStatus;
  active: boolean;
}

const emptyForm: RoomFormState = {
  name: "",
  departmentId: "",
  status: "READY",
  active: true,
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoomResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | RoomStatus>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<AdminRoomResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<RoomFormState>(emptyForm);

  const loadRooms = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const nextRooms = await listAdminRooms();
      if (!isMounted()) {
        return;
      }
      setRooms(nextRooms);
      setSelectedRoomId((current) => current ?? nextRooms[0]?.roomId ?? null);
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setRooms([]);
      setSelectedRoomId(null);
      setError(errorMessage(caught, "Unable to load rooms."));
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadRooms(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadRooms]);

  const departments = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.departmentName || "Unassigned"))).sort(),
    [rooms],
  );

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const matchesStatus = statusFilter === "ALL" || room.status === statusFilter;
        const matchesDepartment = departmentFilter === "ALL" || (room.departmentName || "Unassigned") === departmentFilter;
        return matchesStatus && matchesDepartment;
      }),
    [departmentFilter, rooms, statusFilter],
  );

  const selectedRoom = filteredRooms.find((room) => room.roomId === selectedRoomId) ?? filteredRooms[0] ?? null;
  const readyCount = rooms.filter((room) => room.status === "READY" && room.active).length;
  const inUseCount = rooms.filter((room) => room.status === "IN_USE" && room.active).length;

  function openCreateForm() {
    setEditingRoom(null);
    setForm(emptyForm);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(room: AdminRoomResponse) {
    setEditingRoom(room);
    setForm({
      name: room.name,
      departmentId: room.departmentId ?? "",
      status: room.status,
      active: room.active,
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
      setFormError("Room name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingRoom
        ? await updateAdminRoom(editingRoom.roomId, request)
        : await createAdminRoom(request);
      setSuccess(saved ? `Room ${saved.name} saved.` : "Room saved.");
      setIsFormOpen(false);
      setEditingRoom(null);
      setForm(emptyForm);
      await loadRooms();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save room."));
    } finally {
      setIsSaving(false);
    }
  }

  async function changeStatus(room: AdminRoomResponse, status: RoomStatus) {
    setFormError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const saved = await updateAdminRoomStatus(room.roomId, status);
      setSuccess(saved ? `Room ${saved.name} status updated.` : "Room status updated.");
      await loadRooms();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to update room status."));
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivateRoom(room: AdminRoomResponse) {
    setFormError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      await deactivateAdminRoom(room.roomId);
      setSuccess(`Room ${room.name} deactivated.`);
      await loadRooms();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to deactivate room."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20">
      <PageHeader
        title="Room Inventory"
        description="API-Backed Monitoring & Allocation • Manage hospital rooms and their statuses"
        action={
          <div className="flex gap-2">
            <button className="hc-button-primary flex items-center gap-2" onClick={openCreateForm} type="button">
              <Plus className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-widest">Add Room</span>
            </button>
          </div>
        }
      />

      {error ? <Alert message={error} /> : null}
      {formError ? <Alert message={formError} /> : null}
      {success ? <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-4 text-sm font-medium text-[var(--hc-success)]" role="status">{success}</div> : null}

      <div className="hc-kpi-grid mb-8">
        <KpiCard label="Total Rooms" value={rooms.length.toString()} icon={DoorOpen} tone="blue" />
        <KpiCard label="Ready" value={readyCount.toString()} icon={CheckCircle2} tone="green" />
        <KpiCard label="In Use" value={inUseCount.toString()} icon={Activity} tone="amber" />
        <KpiCard label="Maintenance" value={rooms.filter(r => r.status === "MAINTENANCE").length.toString()} icon={Wrench} tone="red" />
      </div>

      <DataPanel
        title="Rooms Directory"
        action={
          <div className="flex items-center gap-4">
            <select
              aria-label="Filter by Status"
              className="hc-input py-2 text-xs w-48"
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | RoomStatus)}
              value={statusFilter}
            >
              <option value="ALL">Status: All</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select
              aria-label="Filter by Department"
              className="hc-input py-2 text-xs w-48"
              onChange={(e) => setDepartmentFilter(e.target.value)}
              value={departmentFilter}
            >
              <option value="ALL">Department: All</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>
        }
      >
        <div className="flex w-full flex-col lg:flex-row">
          <div className="flex-1 overflow-x-auto lg:border-r border-[var(--hc-border-soft)]">
            {isLoading ? (
              <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading rooms...</div>
            ) : (
              <RoomsTable
                isSaving={isSaving}
                onEdit={openEditForm}
                onSelect={(room) => setSelectedRoomId(room.roomId)}
                rooms={filteredRooms}
                selectedRoomId={selectedRoom?.roomId ?? null}
              />
            )}
          </div>
          <div className="w-full lg:w-96 shrink-0 bg-[var(--hc-surface-soft)]">
            <RoomDetails
              isSaving={isSaving}
              onDeactivate={deactivateRoom}
              onStatusChange={changeStatus}
              room={selectedRoom}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-[var(--hc-surface-soft)] border-t border-[var(--hc-border-soft)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </span>
        </div>
      </DataPanel>

      {isFormOpen ? (
        <Dialog title={editingRoom ? "Edit Room" : "Add Room"} onClose={() => setIsFormOpen(false)}>
          <RoomForm form={form} isSaving={isSaving} onChange={setForm} onSubmit={handleSubmit} />
        </Dialog>
      ) : null}
    </div>
  );
}

function RoomsTable({
  rooms,
  selectedRoomId,
  isSaving,
  onEdit,
  onSelect,
}: {
  rooms: AdminRoomResponse[];
  selectedRoomId: string | null;
  isSaving: boolean;
  onEdit: (room: AdminRoomResponse) => void;
  onSelect: (room: AdminRoomResponse) => void;
}) {
  if (rooms.length === 0) {
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">No rooms match the current filters.</div>;
  }

  return (
    <table className="hc-table">
      <thead>
        <tr>
          <th>Room ID</th>
          <th>Department</th>
          <th>Status</th>
          <th>Active</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr className={`cursor-pointer transition-colors ${selectedRoomId === room.roomId ? "bg-[var(--hc-surface-soft)]" : ""}`} key={room.roomId} onClick={() => onSelect(room)}>
            <td className="font-mono text-sm font-bold text-[var(--hc-blue-600)]">
              {room.name}
            </td>
            <td className="font-semibold text-[var(--hc-text)]">{room.departmentName || "Unassigned"}</td>
            <td><StatusBadge status={room.status} /></td>
            <td>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${room.active ? "bg-[var(--hc-success)]" : "bg-[var(--hc-text-secondary)]"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${room.active ? "" : "text-[var(--hc-text-secondary)]"}`}>
                  {room.active ? "Active" : "Inactive"}
                </span>
              </div>
            </td>
            <td className="text-right">
              <button
                className="hc-button-secondary py-1.5 px-3 text-[11px]"
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(room);
                }}
                type="button"
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RoomDetails({
  room,
  isSaving,
  onDeactivate,
  onStatusChange,
}: {
  room: AdminRoomResponse | null;
  isSaving: boolean;
  onDeactivate: (room: AdminRoomResponse) => void;
  onStatusChange: (room: AdminRoomResponse, status: RoomStatus) => void;
}) {
  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="p-6 border-b border-[var(--hc-border-soft)]">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-[var(--hc-text)]">Status Management</h2>
      </div>
      <div className="flex-1 p-6">
        {!room ? (
          <p className="text-sm font-medium text-[var(--hc-text-secondary)] text-center mt-10">Select a room to manage its status.</p>
        ) : (
          <div className="space-y-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">Current Room</span>
              <div className="text-3xl font-bold text-[var(--hc-text)] mt-1">{room.name}</div>
              <div className="flex gap-2 mt-3"><StatusBadge status={room.status} /></div>
            </div>
            
            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--hc-border-soft)] bg-white shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-1">Department</div>
              <div className="text-sm font-semibold text-[var(--hc-text)]">{room.departmentName || "Unassigned"}</div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">Update Status</div>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((status) => (
                  <button
                    className={`py-3 px-2 rounded-[var(--radius-md)] text-[10px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-60 ${room.status === status ? "bg-[var(--hc-blue-50)] border-[var(--hc-blue-600)] text-[var(--hc-blue-600)] shadow-sm" : "bg-white border-[var(--hc-border)] text-[var(--hc-text-secondary)] hover:border-[var(--hc-text)]"}`}
                    disabled={isSaving || room.status === status}
                    key={status}
                    onClick={() => onStatusChange(room, status)}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 border-t border-[var(--hc-border-soft)] mt-auto">
        <button
          className="w-full py-3 rounded-[var(--radius-md)] text-[10px] font-bold uppercase tracking-widest border transition-colors disabled:opacity-50 border-[var(--hc-danger)] text-[var(--hc-danger)] hover:bg-[var(--hc-danger-bg)] bg-white shadow-sm"
          disabled={isSaving || !room?.active}
          onClick={() => room && onDeactivate(room)}
          type="button"
        >
          Deactivate Room
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RoomStatus }) {
  const color = status === "READY" ? "bg-[var(--hc-success-bg)] text-[var(--hc-success)]" : status === "IN_USE" ? "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]" : status === "BREAK" ? "bg-[var(--hc-purple-bg)] text-[var(--hc-purple)]" : "bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)]";
  return <span className={`hc-badge ${color} border-none shadow-sm`}>{status}</span>;
}

function RoomForm({
  form,
  isSaving,
  onChange,
  onSubmit,
}: {
  form: RoomFormState;
  isSaving: boolean;
  onChange: (form: RoomFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <FormInput label="Room Name" onChange={(value) => onChange({ ...form, name: value })} required value={form.name} />
      <FormInput label="Department ID" onChange={(value) => onChange({ ...form, departmentId: value })} value={form.departmentId} />
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Status</label>
        <select aria-label="Status" className="hc-input w-full" onChange={(event) => onChange({ ...form, status: event.target.value as RoomStatus })} value={form.status}>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
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
        <button className="hc-button-primary disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save Room"}
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
      <input aria-label={label} className="hc-input w-full" onChange={(event) => onChange(event.target.value)} required={required} value={value} />
    </div>
  );
}

function Dialog({ children, title, onClose }: { children: ReactNode; title: string; onClose: () => void }) {
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

function Alert({ message }: { message: string }) {
  return <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">{message}</div>;
}

function toRequest(form: RoomFormState): AdminRoomUpsertRequest {
  return {
    name: form.name.trim(),
    departmentId: nullableTrim(form.departmentId),
    status: form.status,
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
