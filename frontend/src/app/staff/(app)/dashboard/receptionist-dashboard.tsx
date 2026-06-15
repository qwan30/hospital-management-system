"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Search,
  AlertTriangle,
  Clock,
  UserCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";

interface SlotRow {
  id: string;
  doctor: string;
  department: string;
  timeSlot: string;
  status: "Available" | "Booked" | "Blocked";
  patientName?: string;
}

const MOCK_SLOTS: SlotRow[] = [
  { id: "S-501", doctor: "Dr. Arthur Vance", department: "Cardiology", timeSlot: "08:00 - 08:30", status: "Booked", patientName: "Elena Rodriguez" },
  { id: "S-502", doctor: "Dr. Arthur Vance", department: "Cardiology", timeSlot: "08:30 - 09:00", status: "Available" },
  { id: "S-503", doctor: "Dr. Lisa Ross", department: "Pediatrics", timeSlot: "09:00 - 09:30", status: "Booked", patientName: "Sarah Connor" },
  { id: "S-504", doctor: "Dr. Lisa Ross", department: "Pediatrics", timeSlot: "09:30 - 10:00", status: "Blocked" },
  { id: "S-505", doctor: "Dr. Michael Patel", department: "Orthopedics", timeSlot: "10:30 - 11:00", status: "Available" },
];

export function ReceptionistDashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const filteredSlots = useMemo(() => {
    return MOCK_SLOTS.filter((s) => {
      const matchesSearch = s.doctor.toLowerCase().includes(searchQuery.toLowerCase()) || (s.patientName && s.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = deptFilter === "All" || s.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, deptFilter]);

  function getStatusBadge(status: SlotRow["status"]) {
    const classes = {
      Available: "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
      Booked: "bg-[var(--hc-primary-bg)] text-[var(--hc-primary)]",
      Blocked: "bg-[var(--hc-surface-soft)] text-[var(--hc-text-muted)]",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${classes[status]}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="RECEPTIONIST OPERATIONS"
        title="Receptionist Booking Dashboard"
        description="Launch booking wizards, confirm patient check-ins, verify slot calendars, and coordinate incoming visits."
        action={
          <Link href="/staff/booking" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[var(--hc-primary)] hover:bg-[var(--hc-blue-700)] text-white rounded-[var(--radius-md)] transition-all">
            <BookOpen className="w-4 h-4" /> Launch Booking Wizard
          </Link>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Checked In Today" value="28" helper={<span className="text-[var(--hc-success)]">↑ 4 in the last hour</span>} icon={UserCheck} tone="teal" />
        <KpiCard label="Waiting in Queue" value="06" helper="Triage queue active" icon={Clock} tone="blue" />
        <KpiCard label="No Shows" value="02" helper={<span className="text-[var(--hc-text-muted)]">SLA rate: 94.5%</span>} icon={AlertTriangle} tone="red" />
        <KpiCard label="Available Slots" value="45" helper="Out of 80 total slots today" icon={Calendar} tone="purple" />
      </section>

      {/* Receptionist Quick Nav links */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--hc-surface)] p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--hc-text)] mb-1">Appointment Booking</h4>
            <p className="text-xs text-[var(--hc-text-muted)] leading-relaxed mb-4">Launch wizard to register new patients and confirm appointments slotting.</p>
          </div>
          <Link href="/staff/booking" className="text-xs font-bold text-[var(--hc-primary)] hover:underline inline-flex items-center gap-1">
            Go to Booking Wizard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-[var(--hc-surface)] p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--hc-text)] mb-1">Triage Queue Board</h4>
            <p className="text-xs text-[var(--hc-text-muted)] leading-relaxed mb-4">View active clinical queues, call patients, and manage room allocations.</p>
          </div>
          <Link href="/staff/queue" className="text-xs font-bold text-[var(--hc-primary)] hover:underline inline-flex items-center gap-1">
            Go to Triage Queue <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-[var(--hc-surface)] p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--hc-text)] mb-1">Support Incident Center</h4>
            <p className="text-xs text-[var(--hc-text-muted)] leading-relaxed mb-4">Need help? Open support incident tickets or call the system hotline.</p>
          </div>
          <Link href="/staff/support" className="text-xs font-bold text-[var(--hc-primary)] hover:underline inline-flex items-center gap-1">
            Go to Support Center <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Slots log table */}
      <section className="mt-8 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-[var(--hc-text)]">Doctor Availability & Slot Logs</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--hc-text-muted)]" />
              <input
                type="text"
                placeholder="Search Doctor or Patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hc-input w-[240px] pl-9"
              />
            </div>
            <select
              aria-label="Filter department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="hc-input text-xs"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th className="hc-th">DOCTOR</th>
                <th className="hc-th">DEPARTMENT</th>
                <th className="hc-th">TIME SLOT</th>
                <th className="hc-th">STATUS</th>
                <th className="hc-th">PATIENT NAME</th>
                <th className="hc-th text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.length > 0 ? (
                filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-[var(--hc-surface-soft)]/50 transition-colors">
                    <td className="hc-td font-semibold text-[var(--hc-text)]">{slot.doctor}</td>
                    <td className="hc-td text-sm text-[var(--hc-text-muted)]">{slot.department}</td>
                    <td className="hc-td text-sm font-mono text-[var(--hc-text)]">{slot.timeSlot}</td>
                    <td className="hc-td"><StatusBadge label={slot.status} tone={slot.status === "Available" ? "green" : slot.status === "Booked" ? "blue" : slot.status === "Blocked" ? "neutral" : "neutral"} /></td>
                    <td className="hc-td text-sm text-[var(--hc-text)]">{slot.patientName || "N/A"}</td>
                    <td className="hc-td text-right">
                      {slot.status === "Available" ? (
                        <Link
                          href={`/staff/booking?doctor=${encodeURIComponent(slot.doctor)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[var(--hc-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--hc-blue-700)] transition-colors"
                        >
                          Book Slot
                        </Link>
                      ) : slot.status === "Booked" ? (
                        <Link
                          href="/staff/queue"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-colors"
                        >
                          Check In
                        </Link>
                      ) : (
                        <span className="text-xs text-[var(--hc-text-muted)] font-medium">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="hc-td text-center py-12 text-[var(--hc-text-muted)]">
                    No doctor slots matched criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
