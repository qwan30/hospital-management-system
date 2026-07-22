"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Building2,
  Clock,
  Download,
  Eye,
  Filter,
  FlaskConical,
  Heart,
  MoreVertical,
  RefreshCw,
  Search,
  Stethoscope,
  UserCheck,
  Wind,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertBanner } from "@/components/ui/alert-banner";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { Dialog } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getTodayQueue, getAppointmentVitalSigns } from "@/lib/clinical-api";
import { getErrorMessage } from "@/lib/staff-queue";
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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [nurseFilter, setNurseFilter] = useState("All Nurses");
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [localPatients, setLocalPatients] = useState<PatientRow[]>([]);
  const [localIsLoading, setLocalIsLoading] = useState(!externalPatients);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (externalPatients) {
      return;
    }
    let mounted = true;
    async function load() {
      try {
        setLocalIsLoading(true);
        setLocalError(null);
        const queue = await getTodayQueue();
        const active = queue.filter(a => ["CHECKED_IN", "IN_PROGRESS"].includes(a.status));
        const patientsData: PatientRow[] = [];
        
        for (const appt of active) {
          try {
            const vitals = await getAppointmentVitalSigns(appt.appointmentId);
            patientsData.push({
              id: appt.appointmentId,
              name: appt.patientFullName,
              initials: appt.patientFullName.slice(0, 2).toUpperCase(),
              status: appt.status === "IN_PROGRESS" ? "Critical" : "Stable",
              ward: "Consultation",
              bp: vitals.bloodPressure || "N/A",
              hr: vitals.heartRate || 0,
              o2: vitals.oxygenSaturation || 0,
              lastCheck: new Date(vitals.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              nurse: appt.doctorName, // Just to show something
            });
          } catch {
            // No vitals recorded, ignore for doctor dashboard
          }
        }
        
        if (mounted) setLocalPatients(patientsData);
      } catch (err) {
        if (mounted) setLocalError(getErrorMessage(err));
      } finally {
        if (mounted) setLocalIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [externalPatients]);

  const patients = externalPatients ?? localPatients;
  const isDataLoading = isLoading || localIsLoading;
  const displayError = error || localError;

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
      const matchesWard = wardFilter === "All Wards" || p.ward === wardFilter;
      const matchesNurse = nurseFilter === "All Nurses" || p.nurse === nurseFilter;
      return matchesSearch && matchesStatus && matchesWard && matchesNurse;
    });
  }, [patients, searchQuery, statusFilter, wardFilter, nurseFilter]);

  const handleExport = () => {
    const headers = "Case ID,Name,Status,Ward,BP,HR,O2,Attending Nurse\n";
    const rows = filteredPatients.map(p => 
      `"${p.id}","${p.name}","${p.status}","${p.ward}","${p.bp}",${p.hr},${p.o2},"${p.nurse}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "patient_records_export.csv");
    a.click();
  };

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const paged = filteredPatients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isDataLoading) return <DashboardSkeleton kpiCount={4} rowCount={5} columns={6} />;

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="CLINICAL OVERVIEW"
        title="Clinical Operations Dashboard"
        description="Monitor patient load, clinical priorities, staffing, diagnostics, and daily operational risks."
        action={
          <button
            type="button"
            onClick={onRefresh || (() => window.location.reload())}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--hc-border)] rounded-[var(--radius-md)] bg-[var(--hc-surface)] hover:bg-[var(--hc-surface-soft)] transition-colors"
          >
            <RefreshCw className="size-4 text-[var(--hc-text-muted)]" /> Refresh
          </button>
        }
      />

      {displayError && (
        <div className="mt-4">
          <AlertBanner tone="danger" onRetry={onRetry}>
            {displayError}
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
        <button
          type="button"
          onClick={() => setShowMoreFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-[var(--radius-md)] transition-colors ${showMoreFilters ? "border-[var(--hc-primary)] bg-[var(--hc-primary-bg)] text-[var(--hc-primary)]" : "border-[var(--hc-border)] hover:bg-[var(--hc-surface-soft)]"}`}
        >
          <Filter className="size-4" /> More Filters {showMoreFilters ? "▲" : "▼"}
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-colors"
        >
          <Download className="size-4" /> Export
        </button>
      </section>

      {showMoreFilters && (
        <section className="mt-2 p-4 border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] rounded-[var(--radius-xl)] flex items-center gap-4 flex-wrap shadow-sm">
          <span className="text-xs font-bold text-[var(--hc-text-muted)] uppercase">Advanced Filters:</span>
          <select
            aria-label="Filter by attending nurse"
            value={nurseFilter}
            onChange={(e) => { setNurseFilter(e.target.value); setPage(1); }}
            className="hc-input text-xs min-w-[160px]"
          >
            <option value="All Nurses">All Attending Nurses</option>
            <option value="Nurse S. Miller">Nurse S. Miller</option>
            <option value="Nurse R. Chen">Nurse R. Chen</option>
          </select>
          <button
            type="button"
            onClick={() => { setNurseFilter("All Nurses"); setShowMoreFilters(false); }}
            className="text-xs text-[var(--hc-text-secondary)] hover:text-[var(--hc-primary)] hover:underline ml-auto"
          >
            Reset Advanced Filters
          </button>
        </section>
      )}

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
                          <button
                            type="button"
                            onClick={() => setSelectedPatient(patient)}
                            aria-label={`View ${patient.name}`}
                            className="p-1.5 hover:bg-[var(--hc-surface-soft)] rounded-[var(--radius-md)] transition-colors"
                            title="View Patient Details"
                          >
                            <Eye className="size-4 text-[var(--hc-primary)]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPatient(patient)}
                            aria-label={`More actions for ${patient.name}`}
                            className="p-1.5 hover:bg-[var(--hc-surface-soft)] rounded-[var(--radius-md)] transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="size-4 text-[var(--hc-text-placeholder)] hover:text-[var(--hc-text)]" />
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
            <button
              type="button"
              onClick={() => setActionNotice("Reassigning staffing resources: ER Resident Pool request dispatched. Optimizing shifts.")}
              className="w-full flex items-center justify-center gap-2 h-[42px] border border-[var(--hc-primary)] text-[var(--hc-primary)] rounded-[var(--radius-md)] text-sm font-bold hover:bg-[var(--hc-primary-bg)] transition-all"
            >
              <Stethoscope className="size-4" /> Reassign Resources
            </button>
          </div>
        </div>
      </div>

      {/* Patient Clinical Profile Modal */}
      <Dialog
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        title="Patient Clinical Profile"
        description="Real-time clinical vitals, priority status, and attending staff assignment."
        className="max-w-2xl"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Header Card */}
            <div className="flex items-center justify-between p-4 bg-[var(--hc-surface-soft)] rounded-[var(--radius-lg)] border border-[var(--hc-border-soft)]">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-[var(--hc-primary-bg)] text-[var(--hc-primary)] font-bold text-lg flex items-center justify-center border border-[var(--hc-primary)]/20 shadow-sm shrink-0">
                  {selectedPatient.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-[var(--hc-text)]">{selectedPatient.name}</h3>
                    <StatusBadge
                      label={selectedPatient.status}
                      tone={statusToneMap[selectedPatient.status] ?? "blue"}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[var(--hc-text-muted)] font-mono bg-[var(--hc-surface)] px-2.5 py-0.5 rounded border border-[var(--hc-border-soft)]">
                      Case ID: {selectedPatient.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--hc-text-muted)] flex items-center gap-1.5 mb-1">
                  <Building2 className="size-3.5 text-[var(--hc-primary)]" /> Assigned Ward
                </span>
                <p className="text-sm font-semibold text-[var(--hc-text)]">{selectedPatient.ward}</p>
              </div>
              <div className="p-3.5 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--hc-text-muted)] flex items-center gap-1.5 mb-1">
                  <UserCheck className="size-3.5 text-[var(--hc-primary)]" /> Attending Nurse
                </span>
                <p className="text-sm font-semibold text-[var(--hc-text)]">{selectedPatient.nurse}</p>
              </div>
              <div className="p-3.5 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--hc-text-muted)] flex items-center gap-1.5 mb-1">
                  <Clock className="size-3.5 text-[var(--hc-primary)]" /> Last Vitals Check
                </span>
                <p className="text-sm font-semibold text-[var(--hc-text)]">{selectedPatient.lastCheck}</p>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--hc-text-secondary)] mb-3 flex items-center gap-2">
                <Activity className="size-4 text-[var(--hc-primary)]" /> Live Vital Signs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* BP */}
                <div className={`p-4 rounded-[var(--radius-lg)] border ${selectedPatient.bp.startsWith("90/") ? "bg-red-50/50 border-red-200" : "bg-[var(--hc-surface)] border-[var(--hc-border-soft)]"}`}>
                  <span className="text-xs font-bold text-[var(--hc-text-muted)] block mb-1">Blood Pressure</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold font-mono ${selectedPatient.bp.startsWith("90/") ? "text-[var(--hc-danger)]" : "text-[var(--hc-text)]"}`}>
                      {selectedPatient.bp}
                    </span>
                    <span className="text-xs text-[var(--hc-text-muted)] font-medium">mmHg</span>
                  </div>
                  {selectedPatient.bp.startsWith("90/") ? (
                    <span className="text-[11px] text-[var(--hc-danger)] font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3" /> Hypotension alert
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--hc-success)] font-semibold flex items-center gap-1 mt-1">
                      Optimal pressure
                    </span>
                  )}
                </div>

                {/* HR */}
                <div className="p-4 rounded-[var(--radius-lg)] border bg-[var(--hc-surface)] border-[var(--hc-border-soft)]">
                  <span className="text-xs font-bold text-[var(--hc-text-muted)] flex items-center gap-1 mb-1">
                    <Heart className="size-3.5 text-[var(--hc-danger)] fill-red-100" /> Heart Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-[var(--hc-text)]">
                      {selectedPatient.hr}
                    </span>
                    <span className="text-xs text-[var(--hc-text-muted)] font-medium">bpm</span>
                  </div>
                  <span className="text-[11px] text-[var(--hc-success)] font-semibold flex items-center gap-1 mt-1">
                    Normal sinus rhythm
                  </span>
                </div>

                {/* O2 */}
                <div className={`p-4 rounded-[var(--radius-lg)] border ${selectedPatient.o2 < 95 ? "bg-red-50/50 border-red-200" : "bg-[var(--hc-surface)] border-[var(--hc-border-soft)]"}`}>
                  <span className="text-xs font-bold text-[var(--hc-text-muted)] flex items-center gap-1 mb-1">
                    <Wind className="size-3.5 text-sky-500" /> Oxygen Saturation
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold font-mono ${selectedPatient.o2 < 95 ? "text-[var(--hc-danger)]" : "text-[var(--hc-success)]"}`}>
                      {selectedPatient.o2}%
                    </span>
                    <span className="text-xs text-[var(--hc-text-muted)] font-medium">SpO2</span>
                  </div>
                  {selectedPatient.o2 < 95 ? (
                    <span className="text-[11px] text-[var(--hc-danger)] font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="size-3" /> Hypoxia warning
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--hc-success)] font-semibold flex items-center gap-1 mt-1">
                      Optimal oxygenation
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-[var(--hc-border-soft)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActionNotice(`Discharge request initiated for ${selectedPatient.name}.`);
                    setSelectedPatient(null);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-[var(--hc-danger)] border border-[var(--hc-danger-bg)] rounded-[var(--radius-md)] hover:bg-[var(--hc-danger-bg)] transition-colors"
                >
                  Discharge Patient
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionNotice(`Ward transfer requested for ${selectedPatient.name}.`);
                    setSelectedPatient(null);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-[var(--hc-primary)] border border-[var(--hc-primary-bg)] rounded-[var(--radius-md)] hover:bg-[var(--hc-primary-bg)] transition-colors"
                >
                  Transfer Ward
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2 text-xs font-bold bg-[var(--hc-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--hc-blue-700)] shadow-sm transition-colors ml-auto"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
