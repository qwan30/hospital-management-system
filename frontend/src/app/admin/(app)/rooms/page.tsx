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
import {
  CheckCircle2,
  Wrench,
  Plus,
  X,
  ChevronDown,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  PauseCircle,
  Trash2,
  Activity,
  ChevronsUpDown,
  DoorOpen
} from "lucide-react";

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

  function handleExportCSV() {
    const headers = ["Room ID", "Name", "Department", "Status", "Active"];
    const rows = filteredRooms.map((room) => [
      room.roomId,
      room.name,
      room.departmentName ?? "Unassigned",
      room.status,
      room.active ? "Active" : "Inactive",
    ]);
    downloadCsv(`rooms_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  }

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
    const confirmed = window.confirm(
      `Confirm deactivation for ${room.name}. This room will no longer be available for scheduling until reactivated.`,
    );
    if (!confirmed) {
      return;
    }

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
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        title="Room Inventory"
        description="API-backed monitoring & allocation of clinical rooms and spaces."
        action={
          <div className="flex gap-3">
            <button
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] text-[var(--hc-text)] hover:bg-[var(--hc-surface-soft)] transition-colors shadow-sm disabled:opacity-60"
              disabled={filteredRooms.length === 0}
              onClick={handleExportCSV}
              type="button"
            >
              <Download className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-widest">Export CSV</span>
            </button>
            <button className="hc-button-primary flex items-center gap-2 h-10 px-5" onClick={openCreateForm} type="button">
              <Plus className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-widest">Add Room</span>
            </button>
          </div>
        }
      />

      {error ? <Alert message={error} /> : null}
      {formError ? <Alert message={formError} /> : null}
      {success ? <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-4 text-sm font-medium text-[var(--hc-success)]" role="status">{success}</div> : null}

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <div className="flex-1 flex flex-col min-w-0 gap-6">
          <div className="bg-[var(--hc-surface)] p-5 rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--hc-text-secondary)] mb-2 capitalize">Status</label>
                  <div className="relative">
                    <select
                      aria-label="Filter rooms by status"
                      className="h-10 pl-4 pr-10 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)] appearance-none font-medium min-w-[200px]"
                      onChange={(e) => setStatusFilter(e.target.value as "ALL" | RoomStatus)}
                      value={statusFilter}
                    >
                      <option value="ALL">All Statuses</option>
                      {statuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] pointer-events-none" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--hc-success)] pointer-events-none" />
                    <style jsx>{`select { padding-left: 1.75rem; }`}</style>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--hc-text-secondary)] mb-2 capitalize">Department</label>
                  <div className="relative">
                    <select
                      aria-label="Filter rooms by department"
                      className="h-10 pl-4 pr-10 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)] appearance-none font-medium min-w-[200px]"
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      value={departmentFilter}
                    >
                      <option value="ALL">All Departments</option>
                      {departments.map((department) => <option key={department} value={department}>{department}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] pointer-events-none" />
                    <Activity className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-muted)] pointer-events-none" />
                    <style jsx>{`select { padding-left: 1.75rem; }`}</style>
                  </div>
                </div>

                <div>
                   <label className="block text-[11px] font-medium text-[var(--hc-text-secondary)] mb-2 capitalize">Ready / In Use</label>
                   <div className="h-10 flex items-center">
                     <span className="text-xl font-bold text-[var(--hc-blue-600)]">{readyCount}</span>
                     <span className="text-xl font-medium text-slate-300 mx-1.5">/</span>
                     <span className="text-xl font-bold text-[var(--hc-text)]">{inUseCount}</span>
                   </div>
                </div>
              </div>

              <button
                className="flex items-center gap-2 px-4 h-10 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] text-sm font-semibold text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] transition-colors"
                onClick={() => {
                  setStatusFilter("ALL");
                  setDepartmentFilter("ALL");
                }}
                type="button"
              >
                <Filter className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm flex-1 flex flex-col">
            {isLoading ? (
              <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading rooms...</div>
            ) : (
              <>
                <RoomsTable
                  isSaving={isSaving}
                  onEdit={openEditForm}
                  onSelect={(room) => setSelectedRoomId(room.roomId)}
                  rooms={filteredRooms}
                  selectedRoomId={selectedRoom?.roomId ?? null}
                />
                <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] mt-auto">
                  <span className="text-xs text-[var(--hc-text-secondary)] font-medium">
                    Showing 1 to {filteredRooms.length} of {rooms.length} rooms
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
              </>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm sticky top-6">
            <RoomDetails
              isSaving={isSaving}
              onDeactivate={deactivateRoom}
              onStatusChange={changeStatus}
              room={selectedRoom}
            />
          </div>
        </div>
      </div>

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
    <div className="overflow-x-auto flex-1">
      <table className="hc-table">
        <thead>
          <tr>
            <th className="w-[20%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Room ID <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[30%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Department <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[20%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Status <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[15%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                Active <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[15%] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.roomId;
            return (
              <tr
                className={`cursor-pointer transition-colors relative group ${isSelected ? "bg-[var(--hc-primary-bg)]/50" : "hover:bg-[var(--hc-background)]"}`}
                key={room.roomId}
                onClick={() => onSelect(room)}
              >
                {isSelected && (
                  <td className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--hc-blue-600)] rounded-r p-0 border-0" />
                )}
                <td className="font-semibold text-sm text-[var(--hc-blue-600)]">
                  {room.name}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--hc-text-muted)]" />
                    <span className="text-sm font-medium text-[var(--hc-text)]">{room.departmentName || "Unassigned"}</span>
                  </div>
                </td>
                <td><StatusBadge status={room.status} /></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${room.active ? "bg-[var(--hc-success)]" : "bg-slate-400"}`} />
                    <span className={`text-sm font-medium ${room.active ? "text-[var(--hc-text)]" : "text-[var(--hc-text-secondary)]"}`}>
                      {room.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 flex items-center justify-center text-[var(--hc-blue-600)] hover:bg-[var(--hc-primary-bg)] rounded-md transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(room);
                      }}
                      disabled={isSaving}
                      aria-label="Edit"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
      <div className="px-6 py-5 border-b border-[var(--hc-border-soft)] flex justify-between items-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-blue-600)]">Room Details</h2>
        {room && room.active && (
           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--hc-success-bg)] text-[var(--hc-success)] border border-[var(--hc-success)]">
             <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Active</span>
           </div>
        )}
      </div>

      <div className="flex-1 p-6">
        {!room ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--hc-text-secondary)] opacity-60">
            <DoorOpen className="w-12 h-12 mb-3" />
            <p className="text-sm font-medium">Select a room to manage its status.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="text-sm font-medium text-[var(--hc-text-secondary)] mb-3">Current Active Entity</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--hc-danger-bg)] flex items-center justify-center shrink-0 border border-red-100">
                  <Activity className="w-8 h-8 text-[var(--hc-danger)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--hc-text)] mb-2">{room.name}</div>
                  <StatusBadge status={room.status} />
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-[var(--hc-text-secondary)] mb-3">Department</div>
              <div className="p-4 rounded-xl border border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--hc-danger-bg)] flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-[var(--hc-danger)]" />
                </div>
                <div className="text-sm font-bold text-[var(--hc-text)]">{room.departmentName || "Unassigned"}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-[var(--hc-text-secondary)] mb-3">Update Room Status</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border transition-all ${
                    room.status === "READY"
                      ? "bg-[var(--hc-success-bg)] border-[var(--hc-success)] text-[var(--hc-success)] shadow-sm"
                      : "bg-[var(--hc-surface)] border-[var(--hc-success)] text-[var(--hc-success)] hover:bg-[var(--hc-success-bg)]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isSaving || room.status === "READY"}
                  onClick={() => onStatusChange(room, "READY")}
                  aria-label="READY"
                  type="button"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Ready</span>
                </button>

                <button
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border transition-all ${
                    room.status === "IN_USE"
                      ? "bg-[var(--hc-danger-bg)] border-red-500 text-[var(--hc-danger)] shadow-sm"
                      : "bg-[var(--hc-surface)] border-red-300 text-[var(--hc-danger)] hover:bg-[var(--hc-danger-bg)]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isSaving || room.status === "IN_USE"}
                  onClick={() => onStatusChange(room, "IN_USE")}
                  aria-label="IN_USE"
                  type="button"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-semibold">In Use</span>
                </button>

                <button
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border transition-all ${
                    room.status === "BREAK"
                      ? "bg-[var(--hc-amber-bg)] border-amber-500 text-[var(--hc-amber-600)] shadow-sm"
                      : "bg-[var(--hc-surface)] border-amber-300 text-[var(--hc-amber-600)] hover:bg-[var(--hc-amber-bg)]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isSaving || room.status === "BREAK"}
                  onClick={() => onStatusChange(room, "BREAK")}
                  aria-label="BREAK"
                  type="button"
                >
                  <PauseCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">Break</span>
                </button>

                <button
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border transition-all ${
                    room.status === "MAINTENANCE"
                      ? "bg-[var(--hc-surface-soft)] border-slate-400 text-[var(--hc-text-secondary)] shadow-sm"
                      : "bg-[var(--hc-surface)] border-slate-300 text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isSaving || room.status === "MAINTENANCE"}
                  onClick={() => onStatusChange(room, "MAINTENANCE")}
                  aria-label="MAINTENANCE"
                  type="button"
                >
                  <Wrench className="w-5 h-5" />
                  <span className="text-sm font-semibold">Maintenance</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {room && (
        <div className="p-6">
          <button
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border transition-colors disabled:opacity-50 border-red-200 text-[var(--hc-danger)] hover:bg-[var(--hc-danger-bg)] bg-[var(--hc-surface)]"
            disabled={isSaving || !room.active}
            onClick={() => onDeactivate(room)}
            type="button"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Deactivate Room</span>
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RoomStatus }) {
  if (status === "READY") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--hc-success)] bg-[var(--hc-success-bg)] text-[var(--hc-success)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--hc-success)]" />
        <span className="text-[11px] font-semibold leading-none">Ready</span>
      </div>
    );
  }
  if (status === "IN_USE") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-300 bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
        <span className="text-[11px] font-semibold leading-none">In Use</span>
      </div>
    );
  }
  if (status === "BREAK") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-300 bg-[var(--hc-amber-bg)] text-[var(--hc-amber-600)]">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        <span className="text-[11px] font-semibold leading-none">Break</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-300 bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)]">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--hc-surface-soft)]0" />
      <span className="text-[11px] font-semibold leading-none">Maintenance</span>
    </div>
  );
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
          {statuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
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
      <div className="w-full max-w-xl bg-[var(--hc-surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]">
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
