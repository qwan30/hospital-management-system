"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Heart,
  Search,
  Users,
  Clipboard,
  CheckCircle2,
  ListFilter,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

interface TriagePatient {
  id: string;
  name: string;
  cccd: string;
  checkInTime: string;
  status: "Waiting Triage" | "Vitals Completed" | "Priority Triage";
  assignedDoc: string;
  symptoms: string;
}

const MOCK_TRIAGE_QUEUE: TriagePatient[] = [
  { id: "Q-101", name: "David Miller", cccd: "030095817263", checkInTime: "14:15", status: "Waiting Triage", assignedDoc: "Dr. A. Vance", symptoms: "Mild chest tightness, dyspnea" },
  { id: "Q-102", name: "Sarah Connor", cccd: "010093847291", checkInTime: "14:22", status: "Priority Triage", assignedDoc: "Dr. L. Ross", symptoms: "High fever (39.2C), persistent cough" },
  { id: "Q-103", name: "Robert Downey", cccd: "079088716253", checkInTime: "14:35", status: "Vitals Completed", assignedDoc: "Dr. M. Patel", symptoms: "Right wrist injury, swelling" },
  { id: "Q-104", name: "Emma Watson", cccd: "020084736291", checkInTime: "14:40", status: "Waiting Triage", assignedDoc: "Dr. A. Vance", symptoms: "Acute abdominal pain, nausea" },
];

export function NurseDashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredQueue = useMemo(() => {
    return MOCK_TRIAGE_QUEUE.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.cccd.includes(searchQuery);
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  function getStatusBadge(status: TriagePatient["status"]) {
    const classes = {
      "Waiting Triage": "bg-[var(--hc-warning-bg)] text-[var(--hc-warning)]",
      "Vitals Completed": "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
      "Priority Triage": "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${classes[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === "Priority Triage" ? "bg-[var(--hc-danger)]" : status === "Vitals Completed" ? "bg-[var(--hc-success)]" : "bg-[var(--hc-warning)]"}`} />
        {status}
      </span>
    );
  }

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="CLINICAL TRIAGE"
        title="Nurse Operations Dashboard"
        description="Monitor checking-in queue flows, record patient intake vitals, and coordinate clinical room handoffs."
        action={
          <div className="flex gap-2">
            <Link href="/staff/nurse-intake" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[var(--hc-primary)] hover:bg-[var(--hc-primary-hover)] text-white rounded-[var(--radius-md)] transition-all">
              <PlusCircle className="w-4 h-4" /> Start New Triage
            </Link>
            <Link href="/staff/queue" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-white hover:bg-slate-50 transition-colors">
              <Activity className="w-4 h-4 text-slate-400" /> Queue Board
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Triage Pending" value="04" helper={<span className="text-[var(--hc-warning)]">Avg wait time: 14m</span>} icon={Users} tone="purple" />
        <KpiCard label="Urgent Alerts" value="01" helper={<span className="text-[var(--hc-danger)]">Priority triage required</span>} icon={AlertCircle} tone="red" />
        <KpiCard label="Room Allocation" value="84%" helper="22 of 26 rooms occupied" icon={Clipboard} tone="blue" />
        <KpiCard label="Intakes Completed" value="38" helper={<span className="text-[var(--hc-success)]">Triage SLA: 98.2%</span>} icon={CheckCircle2} tone="teal" />
      </section>

      {/* Quick Action Shortcuts */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm">
          <h3 className="text-sm font-bold text-[var(--hc-text)] mb-3">Triage Operations Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/staff/vital-signs" className="flex items-center gap-3 p-4 border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-all">
              <Heart className="w-5 h-5 text-[var(--hc-danger)]" />
              <div>
                <p className="text-sm font-bold text-[var(--hc-text)]">Record Vitals</p>
                <p className="text-xs text-slate-500">Record BP, SpO2, Temp</p>
              </div>
            </Link>
            <Link href="/staff/queue" className="flex items-center gap-3 p-4 border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-all">
              <Clock className="w-5 h-5 text-[var(--hc-primary)]" />
              <div>
                <p className="text-sm font-bold text-[var(--hc-text)]">Assign Rooms</p>
                <p className="text-xs text-slate-500">Allocate clinical slot rooms</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--hc-text)] mb-2">Triage Nurse Guidelines</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ensure all checking-in patients undergo immediate heart rate, blood pressure, and SpO2 vital assessments.
              Highlight waiting times exceeding 20 minutes to the shift supervisor.
            </p>
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-[var(--radius-md)] text-xs text-red-700 flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>CRITICAL: High fever (≥39.0C) or O2 SpO2 &lt; 94% must be escalated immediately.</span>
          </div>
        </div>
      </section>

      {/* Main Triage Table */}
      <section className="mt-8 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-[var(--hc-text)]">Active Intake Queue</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient or CCCD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hc-input w-[240px] pl-9"
              />
            </div>
            <select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hc-input text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Waiting Triage">Waiting Triage</option>
              <option value="Vitals Completed">Vitals Completed</option>
              <option value="Priority Triage">Priority Triage</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th className="hc-th">PATIENT / CCCD</th>
                <th className="hc-th">CHECK-IN TIME</th>
                <th className="hc-th">STATUS</th>
                <th className="hc-th">SYMPTOMS</th>
                <th className="hc-th">ASSIGNED DOCTOR</th>
                <th className="hc-th text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.length > 0 ? (
                filteredQueue.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="hc-td">
                      <div>
                        <p className="text-sm font-semibold text-[var(--hc-text)]">{patient.name}</p>
                        <p className="text-xs text-slate-400">CCCD: {patient.cccd}</p>
                      </div>
                    </td>
                    <td className="hc-td text-sm font-mono text-[var(--hc-text)]">{patient.checkInTime}</td>
                    <td className="hc-td">{getStatusBadge(patient.status)}</td>
                    <td className="hc-td text-sm max-w-[300px] truncate" title={patient.symptoms}>{patient.symptoms}</td>
                    <td className="hc-td text-sm text-slate-600">{patient.assignedDoc}</td>
                    <td className="hc-td text-right">
                      <Link
                        href={`/staff/vital-signs?cccd=${patient.cccd}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-colors"
                      >
                        Record Vitals
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="hc-td text-center py-12 text-slate-400">
                    No intake records found.
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
