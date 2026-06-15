"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  Filter,
  FlaskConical,
  MoreVertical,
  RefreshCw,
  Search,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertBanner } from "@/components/ui/alert-banner";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { ReactNode } from "react";

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

interface StaffMember {
  label: string;
  badge: string;
  tone: "green" | "red" | "neutral";
}

interface DoctorDashboardProps {
  patients?: PatientRow[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
}

const PAGE_SIZE = 10;

const MOCK_PATIENTS: PatientRow[] = [
  { id: "PX-2024-8812", name: "Elena Rodriguez", initials: "ER", status: "Critical", ward: "ER", bp: "145/92", hr: 98, o2: 91, lastCheck: "13:45:00", nurse: "Nurse S. Miller" },
  { id: "PX-2024-8740", name: "James T. Kendrick", initials: "JK", status: "Stable", ward: "Ward 4-A", bp: "120/80", hr: 72, o2: 98, lastCheck: "12:10:22", nurse: "Nurse R. Chen" },
  { id: "PX-2024-9003", name: "Linda Wu", initials: "LW", status: "Observation", ward: "Observation", bp: "132/85", hr: 84, o2: 96, lastCheck: "14:00:15", nurse: "Nurse S. Miller" },
  { id: "PX-2024-8119", name: "Marcus V. Aurelius", initials: "MA", status: "Critical", ward: "ICU East", bp: "90/60", hr: 110, o2: 94, lastCheck: "13:58:10", nurse: "Nurse R. Chen" },
];

const MOCK_STAFF: StaffMember[] = [
  { label: "Cardiology Team", badge: "ON-CALL", tone: "green" },
  { label: "ER Resident Pool", badge: "STRETCHED (82%)", tone: "red" },
  { label: "Surgery Prep Unit", badge: "OPTIMAL", tone: "neutral" },
];

const statusToneMap: Record<string, "red" | "green" | "blue"> = {
  Critical: "red",
  Stable: "green",
  Observation: "blue",
};

const staffToneMap: Record<string, "green" | "red" | "purple"> = {
  green: "green",
  red: "red",
  neutral: "purple",
};

/* ─── Sub-components ─── */

function StaffRow({ label, badge, tone }: StaffMember) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm font-semibold text-[var(--hc-text)]">{label}</span>
      <StatusBadge label={badge} tone={staffToneMap[tone]} />
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-12 text-center">
        <p className="text-sm text-[var(--hc-text-muted)]">{children}</p>
      </td>
    </tr>
  );
}

/* ─── Main View ─── */

export function DoctorDashboardView({
  patients: externalPatients,
  isLoading = false,
  error = null,
  onRetry,
  onRefresh,
}: DoctorDashboardProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [wardFilter, setWardFilter] = useState("All Wards");
  const [page, setPage] = useState(1);

  const patients = externalPatients ?? MOCK_PATIENTS;

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
      const matchesWard = wardFilter === "All Wards" || p.ward === wardFilter;
      return matchesSearch && matchesStatus && matchesWard;
    });
  }, [patients, searchQuery, statusFilter, wardFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const paged = filteredPatients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <DashboardSkeleton kpiCount={4} rowCount={5} columns={6} />;

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="CLINICAL OVERVIEW"
        title="Clinical Operations Dashboard"
        description="Monitor patient load, clinical priorities, staffing, diagnostics, and daily operational risks."
        action={
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-[var(--hc-surface)] hover:bg-[var(--hc-surface-soft)] transition-colors"
          >
            <RefreshCw className="size-4 text-[var(--hc-text-muted)]" /> Refresh
          </button>
        }
      />

      {error && (
        <div className="mt-4">
          <AlertBanner tone="danger" onRetry={onRetry}>
            {error}
          </AlertBanner>
        </div>
      )}

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Active Rounds" value="12" helper={<span className="text-[var(--hc-success)]">Up 2 from previous shift</span>} icon={Stethoscope} tone="blue" />
        <KpiCard label="Critical Alerts" value="03" helper={<span className="text-[var(--hc-danger)]">Requires immediate action</span>} icon={AlertTriangle} tone="red" />
        <KpiCard label="Wait Time Avg" value="18m" helper="Unit efficiency: 94%" icon={Clock} tone="teal" />
        <KpiCard label="Pending Lab Reports" value="24" helper={<span className="text-[var(--hc-warning)]">5 expiring soon</span>} icon={FlaskConical} tone="purple" />
      </section>

      {/* Filter Bar */}
      <section className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--hc-text-muted)]" aria-hidden="true" />
          <input
            aria-label="Search patients by name or ID"
            type="search"
            placeholder="Search by name or ID..."
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
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-colors">
          <Filter className="size-4" /> More Filters
        </button>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-colors">
          <Download className="size-4" /> Export
        </button>
      </section>

      {/* Patient Table */}
      <section className="mt-4 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th>PATIENT / CASE ID</th>
                <th>PRIORITY</th>
                <th>VITAL STATS</th>
                <th>LAST CHECK</th>
                <th>ATTENDING NURSE</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? (
                paged.map((patient) => {
                  const tone = statusToneMap[patient.status];
                  return (
                    <tr key={patient.id} className="transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                            tone === "red" ? "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]"
                              : tone === "green" ? "bg-[var(--hc-success-bg)] text-[var(--hc-success)]"
                              : "bg-[var(--hc-primary-bg)] text-[var(--hc-primary)]"
                          }`}>
                            {patient.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--hc-text)]">{patient.name}</p>
                            <p className="text-xs text-[var(--hc-text-placeholder)]">{patient.id}</p>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge label={patient.status} tone={tone} /></td>
                      <td>
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            <span className="text-[10px] text-[var(--hc-text-muted)] mr-1 uppercase font-bold">BP</span>
                            <span className={`font-mono tabular-nums ${patient.bp.startsWith("90/") ? "text-[var(--hc-danger)]" : ""}`}>{patient.bp}</span>
                          </span>
                          <span>
                            <span className="text-[10px] text-[var(--hc-text-muted)] mr-1 uppercase font-bold">HR</span>
                            <span className="font-mono tabular-nums">{patient.hr}</span>
                          </span>
                          <span>
                            <span className="text-[10px] text-[var(--hc-text-muted)] mr-1 uppercase font-bold">O2</span>
                            <span className={`font-mono tabular-nums ${patient.o2 < 95 ? "text-[var(--hc-danger)]" : "text-[var(--hc-success)]"}`}>{patient.o2}%</span>
                          </span>
                        </div>
                      </td>
                      <td className="text-sm font-mono tabular-nums text-[var(--hc-text)]">{patient.lastCheck}</td>
                      <td className="text-sm font-medium text-[var(--hc-text)]">{patient.nurse}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" aria-label={`View ${patient.name}`} className="p-1.5 hover:bg-[var(--hc-surface-soft)] rounded-[var(--radius-md)] transition-colors" title="View">
                            <Eye className="size-4 text-[var(--hc-text-muted)]" />
                          </button>
                          <button type="button" aria-label={`More actions for ${patient.name}`} className="p-1.5 hover:bg-[var(--hc-surface-soft)] rounded-[var(--radius-md)] transition-colors" title="More">
                            <MoreVertical className="size-4 text-[var(--hc-text-placeholder)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyState>No patients match your search criteria.</EmptyState>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--hc-border-soft)] text-sm">
          <span className="text-[var(--hc-text-muted)]">
            Showing {filteredPatients.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, filteredPatients.length)} of {filteredPatients.length} patients
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-30" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={page === p}
                    onClick={() => setPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page >= totalPages ? "pointer-events-none opacity-30" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>

      {/* Secondary Insights */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Laboratory Queue Trends */}
        <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--hc-purple-bg)] text-[var(--hc-purple)]">
                <FlaskConical className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--hc-text)]">Laboratory Queue Trends</h3>
                <p className="text-xs text-[var(--hc-text-muted)]">Next 12 hours forecast</p>
              </div>
            </div>
            <select aria-label="Laboratory queue trend range" className="text-xs border border-[var(--hc-border)] rounded-[var(--radius-md)] px-3 py-1.5 bg-[var(--hc-surface)]">
              <option>Next 12 Hours</option>
              <option>Next 24 Hours</option>
            </select>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-4 h-[220px] px-4 pb-4">
              {[30, 45, 75, 95, 60, 50, 20].map((height, i) => (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="bg-[var(--hc-purple-300)] rounded-t-sm transition-all hover:bg-[var(--hc-purple)] w-full"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--hc-text)] text-[var(--hc-white)] text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap">
                      {Math.round(height * 0.5)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staffing Overview */}
        <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--hc-border-soft)] flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)]">
              <Stethoscope className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--hc-text)]">Staffing Overview</h3>
          </div>
          <div className="divide-y divide-[var(--hc-border-soft)]">
            {MOCK_STAFF.map((s) => (
              <StaffRow key={s.label} {...s} />
            ))}
          </div>
          <div className="p-4">
            <button type="button" className="w-full flex items-center justify-center gap-2 h-[42px] border border-[var(--hc-primary)] text-[var(--hc-primary)] rounded-[var(--radius-md)] text-sm font-bold hover:bg-[var(--hc-primary-bg)] transition-all">
              <Stethoscope className="size-4" /> Reassign Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
