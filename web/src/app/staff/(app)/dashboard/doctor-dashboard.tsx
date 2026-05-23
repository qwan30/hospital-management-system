"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Filter,
  FlaskConical,
  MoreVertical,
  RefreshCw,
  Stethoscope,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

/* ─────────────────── Types ─────────────────── */

interface PatientRow {
  id: string;
  name: string;
  initials: string;
  status: "Critical" | "Stable" | "Observation";
  ward: string;
  bp: string;
  hr: number;
  o2: number;
  lastCheck: string;
  nurse: string;
}

const PAGE_SIZE = 10;

const MOCK_PATIENTS: PatientRow[] = [
  { id: "PX-2024-8812", name: "Elena Rodriguez", initials: "ER", status: "Critical", ward: "ER", bp: "145/92", hr: 98, o2: 91, lastCheck: "13:45:00", nurse: "Nurse S. Miller" },
  { id: "PX-2024-8740", name: "James T. Kendrick", initials: "JK", status: "Stable", ward: "Ward 4-A", bp: "120/80", hr: 72, o2: 98, lastCheck: "12:10:22", nurse: "Nurse R. Chen" },
  { id: "PX-2024-9003", name: "Linda Wu", initials: "LW", status: "Observation", ward: "Observation", bp: "132/85", hr: 84, o2: 96, lastCheck: "14:00:15", nurse: "Nurse S. Miller" },
  { id: "PX-2024-8119", name: "Marcus V. Aurelius", initials: "MA", status: "Critical", ward: "ICU East", bp: "90/60", hr: 110, o2: 94, lastCheck: "13:58:10", nurse: "Nurse R. Chen" },
];

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const c: Record<string, string> = {
    Critical: "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]",
    Stable: "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
    Observation: "bg-[#E8F0FF] text-[var(--hc-primary)]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${c[status] ?? "bg-slate-100 text-slate-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "Critical" ? "bg-[var(--hc-danger)]" : status === "Stable" ? "bg-[var(--hc-success)]" : "bg-[var(--hc-primary)]"}`} />
      {status}
    </span>
  );
}

function StaffRow({ label, badge, badgeClass }: { label: string; badge: string; badgeClass: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm font-semibold text-[var(--hc-text)]">{label}</span>
      <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${badgeClass}`}>
        {badge}
      </span>
    </div>
  );
}

export function DoctorDashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [wardFilter, setWardFilter] = useState("All Wards");
  const [page, setPage] = useState(1);

  const filteredPatients = useMemo(() => {
    return MOCK_PATIENTS.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
      const matchesWard = wardFilter === "All Wards" || p.ward === wardFilter;
      return matchesSearch && matchesStatus && matchesWard;
    });
  }, [searchQuery, statusFilter, wardFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const paged = filteredPatients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="CLINICAL OVERVIEW"
        title="Clinical Operations Dashboard"
        description="Monitor patient load, clinical priorities, staffing, diagnostics, and daily operational risks."
        action={
          <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-white hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh
          </button>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Active Rounds" value="12" helper={<span className="text-[var(--hc-success)]">↑ 2 from previous shift</span>} icon={Stethoscope} tone="blue" />
        <KpiCard label="Critical Alerts" value="03" helper={<span className="text-[var(--hc-danger)]">Requires immediate action</span>} icon={AlertTriangle} tone="red" />
        <KpiCard label="Wait Time Avg" value="18m" helper="Unit efficiency: 94%" icon={Clock} tone="teal" />
        <KpiCard label="Pending Lab Reports" value="24" helper={<span className="text-[var(--hc-warning)]">5 expiring soon</span>} icon={FlaskConical} tone="purple" />
      </section>

      {/* Filter Bar */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            aria-label="Search patients by name or ID"
            type="search"
            placeholder="Search by name or ID…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="hc-input w-full pl-10"
          />
        </div>
        <select
          aria-label="Filter patients by status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="hc-input min-w-[140px]"
        >
          <option value="All Status">All Status</option>
          <option value="Critical">Critical</option>
          <option value="Stable">Stable</option>
          <option value="Observation">Observation</option>
        </select>
        <select
          aria-label="Filter patients by ward"
          value={wardFilter}
          onChange={(e) => { setWardFilter(e.target.value); setPage(1); }}
          className="hc-input min-w-[140px]"
        >
          <option value="All Wards">All Wards</option>
          <option value="Ward 4-A">Ward 4-A</option>
          <option value="ICU East">ICU East</option>
          <option value="ER">ER</option>
          <option value="Observation">Observation</option>
        </select>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" /> More Filters
        </button>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </section>

      {/* Table */}
      <section className="mt-4 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th className="hc-th">PATIENT / CASE ID</th>
                <th className="hc-th">PRIORITY</th>
                <th className="hc-th">VITAL STATS</th>
                <th className="hc-th">LAST CHECK</th>
                <th className="hc-th">ATTENDING NURSE</th>
                <th className="hc-th text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? (
                paged.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="hc-td">
                      <div className="flex items-center gap-3">
                        <div className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${patient.status === "Critical" ? "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]" : patient.status === "Stable" ? "bg-[var(--hc-success-bg)] text-[var(--hc-success)]" : "bg-[#E8F0FF] text-[var(--hc-primary)]"}`}>
                          {patient.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--hc-text)]">{patient.name}</p>
                          <p className="text-xs text-slate-400">{patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hc-td"><StatusBadge status={patient.status} /></td>
                    <td className="hc-td">
                      <div className="flex items-center gap-4 text-sm">
                        <span><span className="text-[10px] text-slate-400 mr-1 uppercase font-bold">BP</span><span className={`font-mono tabular-nums ${patient.bp.startsWith("90/") ? "text-[var(--hc-danger)]" : ""}`}>{patient.bp}</span></span>
                        <span><span className="text-[10px] text-slate-400 mr-1 uppercase font-bold">HR</span><span className="font-mono tabular-nums">{patient.hr}</span></span>
                        <span><span className="text-[10px] text-slate-400 mr-1 uppercase font-bold">O₂</span><span className={`font-mono tabular-nums ${patient.o2 < 95 ? "text-[var(--hc-danger)]" : "text-[var(--hc-success)]"}`}>{patient.o2}%</span></span>
                      </div>
                    </td>
                    <td className="hc-td text-sm font-mono tabular-nums text-[var(--hc-text)]">{patient.lastCheck}</td>
                    <td className="hc-td text-sm font-medium text-[var(--hc-text)]">{patient.nurse}</td>
                    <td className="hc-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" aria-label={`View ${patient.name}`} className="p-1.5 hover:bg-slate-100 rounded-[var(--radius-md)] transition-colors" title="View">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button type="button" aria-label={`More actions for ${patient.name}`} className="p-1.5 hover:bg-slate-100 rounded-[var(--radius-md)] transition-colors" title="More">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="hc-td text-center py-12 text-slate-400">
                    No patients match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--hc-border-soft)] text-sm">
          <span className="text-slate-500">
            Showing {filteredPatients.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredPatients.length)} of {filteredPatients.length} patients
          </span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous patient page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" aria-label={`Patient page ${p}`} onClick={() => setPage(p)} className={`min-w-[32px] h-8 rounded-[var(--radius-md)] text-sm font-medium ${page === p ? "bg-[var(--hc-primary)] text-white" : "hover:bg-slate-100"}`}>
                {p}
              </button>
            ))}
            <button type="button" aria-label="Next patient page" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Secondary Insights */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Laboratory Queue Trends */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-purple-50 text-purple-600">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--hc-text)]">Laboratory Queue Trends</h3>
                <p className="text-xs text-slate-500">Next 12 hours forecast</p>
              </div>
            </div>
            <select aria-label="Laboratory queue trend range" className="text-xs border border-[var(--hc-border)] rounded-[var(--radius-md)] px-3 py-1.5 bg-white">
              <option>Next 12 Hours</option>
              <option>Next 24 Hours</option>
            </select>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-4 h-[220px] px-4 pb-4">
              {[30, 45, 75, 95, 60, 50, 20].map((height, i) => (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="bg-purple-300 rounded-t-sm transition-all hover:bg-purple-600 w-full"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                      {Math.round(height * 0.5)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staffing Overview */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--hc-border-soft)] flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-slate-100 text-slate-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--hc-text)]">Staffing Overview</h3>
          </div>
          <div className="divide-y divide-[var(--hc-border-soft)]">
            <StaffRow label="Cardiology Team" badge="ON-CALL" badgeClass="bg-[var(--hc-success-bg)] text-[var(--hc-success)]" />
            <StaffRow label="ER Resident Pool" badge="STRETCHED (82%)" badgeClass="bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]" />
            <StaffRow label="Surgery Prep Unit" badge="OPTIMAL" badgeClass="bg-slate-100 text-slate-600" />
          </div>
          <div className="p-4">
            <button type="button" className="w-full flex items-center justify-center gap-2 h-[42px] border border-[var(--hc-primary)] text-[var(--hc-primary)] rounded-[var(--radius-md)] text-sm font-bold hover:bg-[#E8F0FF] transition-all">
              <Users className="w-4 h-4" /> Reassign Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
