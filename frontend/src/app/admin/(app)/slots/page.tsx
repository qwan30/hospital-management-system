"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  blockAdminSlot,
  deleteAdminSlot,
  generateAdminSlots,
  listAdminSlots,
  listAdminUsers,
  type AdminSlotResponse,
  type AdminSlotStatus,
  type AdminUserResponse,
} from "@/lib/operations-api";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

import { Dialog } from "@/components/ui/dialog";
import { Plus, Ban, Trash2, CalendarDays, CheckCircle2, XCircle, Lock, Search } from "lucide-react";

interface GenerateFormState {
  doctorId: string;
  fromDate: string;
  toDate: string;
}

const emptyGenerateForm: GenerateFormState = {
  doctorId: "",
  fromDate: "",
  toDate: "",
};

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<AdminSlotResponse[]>([]);
  const [doctors, setDoctors] = useState<AdminUserResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminSlotStatus>("ALL");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<GenerateFormState>(emptyGenerateForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const loadData = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const [nextSlots, nextUsers] = await Promise.all([listAdminSlots(), listAdminUsers()]);
      if (!isMounted()) {
        return;
      }
      setSlots(nextSlots);
      setDoctors(nextUsers.filter((user) => user.role === "DOCTOR" && user.active));
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setSlots([]);
      setDoctors([]);
      setError(errorMessage(caught, "Unable to load time slots."));
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

  const filteredSlots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return slots.filter((slot) => {
      const matchesStatus = statusFilter === "ALL" || slot.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [slot.doctorName, slot.slotDate, slot.startTime, slot.endTime, slot.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [query, slots, statusFilter]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.fromDate || !form.toDate) {
      setError("From date and to date are required.");
      return;
    }
    if (form.fromDate > form.toDate) {
      setError("From date must be before or equal to to date.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await generateAdminSlots({
        doctorId: form.doctorId || null,
        fromDate: form.fromDate,
        toDate: form.toDate,
      });
      setSuccess(result ? `${result.summary} Created ${result.slotsCreated}, skipped ${result.slotsSkipped}.` : "Slot generation complete.");
      setIsGenerateModalOpen(false);
      setForm(emptyGenerateForm);
      await loadData();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to generate slots."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBlock(slot: AdminSlotResponse) {
    const confirmed = window.confirm(
      `Confirm blocking ${slot.doctorName}'s slot on ${slot.slotDate} from ${slot.startTime} to ${slot.endTime}. Patients will not be able to book it.`,
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const blocked = await blockAdminSlot(slot.id);
      setSuccess(blocked ? `Slot ${blocked.doctorName} ${blocked.slotDate} ${blocked.startTime} blocked.` : "Slot blocked.");
      await loadData();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to block slot."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(slot: AdminSlotResponse) {
    const confirmed = window.confirm(
      `Confirm deleting ${slot.doctorName}'s slot on ${slot.slotDate} from ${slot.startTime} to ${slot.endTime}. This cannot be undone from the UI.`,
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      await deleteAdminSlot(slot.id);
      setSuccess(`Slot ${slot.doctorName} ${slot.slotDate} ${slot.startTime} deleted.`);
      await loadData();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to delete slot."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20">
      <PageHeader
        title="Slot Generation"
        description="Generate real appointment slots from templates and manage unbooked slots."
        action={
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="hc-button-primary flex items-center gap-2"
            type="button"
          >
            <Plus className="h-4 w-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Generate Slots</span>
          </button>
        }
      />

      {error ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-4 text-sm font-medium text-[var(--hc-success)]" role="status">
          {success}
        </div>
      ) : null}

      <div className="hc-kpi-grid mb-8">
        <KpiCard label="Total Slots" value={slots.length.toString()} icon={CalendarDays} tone="blue" />
        <KpiCard label="Available" value={slots.filter((slot) => slot.status === "AVAILABLE").length.toString()} icon={CheckCircle2} tone="green" />
        <KpiCard label="Booked" value={slots.filter((slot) => slot.status === "BOOKED").length.toString()} icon={XCircle} tone="purple" />
        <KpiCard label="Blocked" value={slots.filter((slot) => slot.status === "BLOCKED").length.toString()} icon={Lock} tone="red" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6 bg-[var(--hc-surface)] p-3 rounded-xl border border-[var(--hc-border-soft)] shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
          <input
            aria-label="Search time slots"
            className="w-full h-9 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by doctor, date, or time..."
            type="search"
            value={query}
          />
        </div>

        <div className="flex-none">
          <select
            aria-label="Status"
            className="h-9 px-3 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] text-[var(--hc-text-secondary)]"
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | AdminSlotStatus)}
            value={statusFilter}
          >
            <option value="ALL">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading time slots...</div>
        ) : (
          <SlotsTable isSaving={isSaving} onBlock={handleBlock} onDelete={handleDelete} slots={filteredSlots} />
        )}

        <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)]">
          <span className="text-xs text-[var(--hc-text-secondary)] font-medium">
            Showing {filteredSlots.length} of {slots.length} time slots
          </span>
        </div>
      </div>

      <Dialog
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Slots"
        description="Select a doctor and date range to generate available appointment slots."
      >
        <form onSubmit={handleGenerate} className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Doctor</label>
            <select
              aria-label="Doctor"
              className="hc-input w-full"
              onChange={(event) => setForm({ ...form, doctorId: event.target.value })}
              value={form.doctorId}
            >
              <option value="">All doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.userId} value={doctor.userId}>{doctor.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">From Date</label>
            <input
              aria-label="From Date"
              className="hc-input w-full"
              onChange={(event) => setForm({ ...form, fromDate: event.target.value })}
              required
              type="date"
              value={form.fromDate}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">To Date</label>
            <input
              aria-label="To Date"
              className="hc-input w-full"
              onChange={(event) => setForm({ ...form, toDate: event.target.value })}
              required
              type="date"
              value={form.toDate}
            />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--hc-border-soft)]">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="hc-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="hc-button-primary disabled:opacity-60"
            >
              {isSaving ? "Generating..." : "Generate Slots"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function SlotsTable({
  isSaving,
  onBlock,
  onDelete,
  slots,
}: {
  isSaving: boolean;
  onBlock: (slot: AdminSlotResponse) => void;
  onDelete: (slot: AdminSlotResponse) => void;
  slots: AdminSlotResponse[];
}) {
  if (slots.length === 0) {
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">No time slots match the current filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="hc-table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time Range</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id}>
              <td className="font-semibold text-[var(--hc-text)]">{slot.doctorName}</td>
              <td className="text-[var(--hc-text-secondary)]">{slot.slotDate}</td>
              <td className="text-[var(--hc-text-secondary)]">
                <span>{slot.startTime}</span> - <span>{slot.endTime}</span>
              </td>
              <td>
                <span className={`hc-badge ${
                  slot.status === "AVAILABLE" ? "bg-[var(--hc-success-bg)] text-[var(--hc-success)]" :
                  slot.status === "BOOKED" ? "bg-[var(--hc-info-bg)] text-[var(--hc-info)]" :
                  "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]"
                }`}>
                  {slot.status}
                </span>
              </td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="hc-icon-btn disabled:opacity-40"
                    disabled={isSaving || slot.status !== "AVAILABLE"}
                    onClick={() => onBlock(slot)}
                    title="Block Slot"
                    type="button"
                  >
                    <Ban className="h-4 w-4" />
                    <span className="sr-only">Block</span>
                  </button>
                  <button
                    className="hc-icon-btn disabled:opacity-40"
                    disabled={isSaving || slot.status === "BOOKED"}
                    onClick={() => onDelete(slot)}
                    title="Delete Slot"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
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

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}
