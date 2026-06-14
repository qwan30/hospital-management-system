"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Headphones,
  Layers,
  MoreVertical,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

/* ─────────────────── Types ─────────────────── */

interface SupportTicket {
  ticketId: string;
  requesterName: string;
  requesterRole: string;
  requesterInitials: string;
  department: string;
  departmentSub: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Pending Info" | "Resolved";
  ownerName: string;
  ownerTitle: string;
  ownerInitials: string;
  waitTime: string;
  sla: string;
}

const PAGE_SIZE = 10;

const tabs = [
  { label: "Clinical Application", count: 42 },
  { label: "Access & Roles", count: 22 },
  { label: "Infrastructure", count: 22 },
];

/* ─────────────────── Mock data (no backend API exists for support tickets yet) ─────────────────── */

const MOCK_TICKETS: SupportTicket[] = [
  { ticketId: "TKT-2024-0847", requesterName: "Jane Brown", requesterRole: "Nurse", requesterInitials: "JB", department: "Clinical Application", departmentSub: "EHR / EMR", priority: "Critical", status: "In Progress", ownerName: "Alex Morgan", ownerTitle: "Tier 2 Engineer", ownerInitials: "AM", waitTime: "1h 28m", sla: "SLA 2h" },
  { ticketId: "TKT-2024-0821", requesterName: "Robert Patel", requesterRole: "Physician", requesterInitials: "RP", department: "Clinical Application", departmentSub: "EHR / EMR", priority: "High", status: "Open", ownerName: "Sara Chen", ownerTitle: "Tier 1 Analyst", ownerInitials: "SC", waitTime: "45m", sla: "SLA 1h" },
  { ticketId: "TKT-2024-0803", requesterName: "Linda Martinez", requesterRole: "Front Desk", requesterInitials: "LM", department: "Access & Roles", departmentSub: "Identity Management", priority: "High", status: "Open", ownerName: "Tom Kim", ownerTitle: "Tier 2 Engineer", ownerInitials: "TK", waitTime: "38m", sla: "SLA 1h" },
  { ticketId: "TKT-2024-0791", requesterName: "David Singh", requesterRole: "Pharmacist", requesterInitials: "DS", department: "Infrastructure", departmentSub: "Network / Connectivity", priority: "Medium", status: "In Progress", ownerName: "Jack Wilson", ownerTitle: "Network Engineer", ownerInitials: "JW", waitTime: "32m", sla: "SLA 2h" },
  { ticketId: "TKT-2024-0775", requesterName: "Aisha Carter", requesterRole: "Nurse", requesterInitials: "AC", department: "Clinical Application", departmentSub: "Medications", priority: "Medium", status: "Open", ownerName: "Sara Chen", ownerTitle: "Tier 1 Analyst", ownerInitials: "SC", waitTime: "28m", sla: "SLA 1h" },
  { ticketId: "TKT-2024-0758", requesterName: "Mark Garcia", requesterRole: "Lab Tech", requesterInitials: "MG", department: "Infrastructure", departmentSub: "Workstations", priority: "Low", status: "Pending Info", ownerName: "Nina Brooks", ownerTitle: "Service Desk", ownerInitials: "NB", waitTime: "12m", sla: "SLA 4h" },
  { ticketId: "TKT-2024-0742", requesterName: "Emily Tran", requesterRole: "Admin", requesterInitials: "ET", department: "Access & Roles", departmentSub: "Permissions", priority: "Low", status: "Resolved", ownerName: "Tom Kim", ownerTitle: "Tier 2 Engineer", ownerInitials: "TK", waitTime: "N/A", sla: "Closed" },
  { ticketId: "TKT-2024-0731", requesterName: "James Lee", requesterRole: "Doctor", requesterInitials: "JL", department: "Clinical Application", departmentSub: "Scheduling", priority: "Medium", status: "Open", ownerName: "Alex Morgan", ownerTitle: "Tier 2 Engineer", ownerInitials: "AM", waitTime: "15m", sla: "SLA 2h" },
];

/* ─────────────────── Component ─────────────────── */

export default function AdminSupportPage() {
  const [tickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  /* ─── KPI ─── */
  const totalActive = tickets.filter((t) => t.status !== "Resolved").length;
  const urgentCount = tickets.filter((t) => t.priority === "Critical" || t.priority === "High").length;

  /* ─── Filtered ─── */
  const filtered = useMemo(() => {
    let result = tickets;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((t) =>
        t.ticketId.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q),
      );
    }
    if (priorityFilter !== "All") result = result.filter((t) => t.priority === priorityFilter);
    if (statusFilter !== "All") result = result.filter((t) => t.status === statusFilter);
    if (ownerFilter !== "All") result = result.filter((t) => t.ownerName === ownerFilter);

    // Tab filter
    const tabLabel = tabs[activeTab].label;
    result = result.filter((t) => t.department === tabLabel);

    return result;
  }, [tickets, query, priorityFilter, statusFilter, ownerFilter, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ─── Priority badge ─── */
  function PriorityBadge({ priority }: { priority: string }) {
    const c: Record<string, string> = {
      Critical: "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]",
      High: "bg-[#FFF3E0] text-[var(--hc-warning)]",
      Medium: "bg-[#E8F0FF] text-[var(--hc-primary)]",
      Low: "bg-slate-100 text-slate-500",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${c[priority] ?? "bg-slate-100 text-slate-500"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${priority === "Critical" ? "bg-[var(--hc-danger)]" : priority === "High" ? "bg-[var(--hc-warning)]" : priority === "Medium" ? "bg-[var(--hc-primary)]" : "bg-slate-400"}`} />
        {priority}
      </span>
    );
  }

  /* ─── Status badge ─── */
  function StatusBadge({ status }: { status: string }) {
    const c: Record<string, string> = {
      Open: "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
      "In Progress": "bg-[#E8F0FF] text-[var(--hc-primary)]",
      "Pending Info": "bg-[#FFF3E0] text-[var(--hc-warning)]",
      Resolved: "bg-slate-100 text-slate-500",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${c[status] ?? "bg-slate-100 text-slate-500"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === "Open" ? "bg-[var(--hc-success)]" : status === "In Progress" ? "bg-[var(--hc-primary)]" : status === "Pending Info" ? "bg-[var(--hc-warning)]" : "bg-slate-400"}`} />
        {status}
      </span>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] overflow-x-hidden px-4 py-6 pb-20 sm:p-8 sm:pb-20">
      <PageHeader
        categoryLabel="ADMIN SUPPORT"
        title="Admin Support Center"
        description="Track staff help desk requests, operational incidents, access issues, and escalation response."
      />

      <section className="mt-6 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] p-4 text-sm font-medium text-[var(--hc-text-secondary)]" role="note">
        Support tickets are reference-only in this release. Ticket create, update, export, and drilldown actions remain disabled until a support-ticket API is introduced.
      </section>

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid">
        <KpiCard label="Total Active Tickets" value={totalActive} helper={<span className="text-[var(--hc-success)]">+12 from yesterday ↑</span>} icon={Layers} tone="blue" />
        <KpiCard label="Urgent Escalations" value={urgentCount} helper={<span className="text-[var(--hc-danger)]">Requires immediate action</span>} icon={AlertTriangle} tone="red" />
        <KpiCard label="Median Response Time" value="12m" helper={<span>Target: ≤ 15m <span className="text-[var(--hc-success)]">✓</span></span>} icon={Clock} tone="teal" />
        <KpiCard label="On-Call Coverage" value="100%" helper={<span className="text-[var(--hc-success)]">All teams covered ✓</span>} icon={Users} tone="green" />
      </section>

      {/* ─── Main Layout: Table + Sidebar ─── */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        {/* Left: Filters + Table */}
        <div className="min-w-0">
          {/* Filter bar */}
          <div className="mb-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <div className="relative min-w-0 sm:min-w-[200px] sm:max-w-sm sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="search" placeholder="Search tickets by ID, requester, or keyword…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="hc-input w-full pl-10" />
            </div>
            <div className="grid gap-1.5 text-sm sm:flex sm:items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
              <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="hc-input">
                <option value="All">All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="grid gap-1.5 text-sm sm:flex sm:items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="hc-input">
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Info">Pending Info</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="grid gap-1.5 text-sm sm:flex sm:items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Owner</label>
              <select value={ownerFilter} onChange={(e) => { setOwnerFilter(e.target.value); setPage(1); }} className="hc-input">
                <option value="All">All</option>
                {[...new Set(tickets.map((t) => t.ownerName))].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button type="button" className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] opacity-60" disabled title="Saved filter presets are not exposed by the current support API.">
              <Filter className="w-4 h-4" /> Filter presets unavailable
            </button>
            <button type="button" className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] opacity-60" disabled title="Support export is not exposed by the current backend API.">
              <Download className="w-4 h-4" /> Export unavailable
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-0 grid gap-3 border-b border-[var(--hc-border-soft)] lg:flex lg:items-center">
            <div className="-mx-1 flex min-w-0 overflow-x-auto px-1">
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => { setActiveTab(i); setPage(1); }}
                  className={`shrink-0 px-3 py-3 text-sm font-medium border-b-2 transition-colors sm:px-4 ${i === activeTab ? "border-[var(--hc-primary)] text-[var(--hc-primary)]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  {tab.label} <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100">{tab.count}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pb-3 text-sm text-slate-500 lg:ml-auto lg:gap-3 lg:pb-1">
              <span>Sort by</span>
              <select className="hc-input min-w-0 max-w-full text-xs py-1">
                <option>Wait Time (High → Low)</option>
                <option>Priority (High → Low)</option>
                <option>Newest First</option>
              </select>
              <button type="button" className="p-1.5 rounded-[var(--radius-md)] opacity-60" disabled title="Support refresh is local-only until ticket APIs are available.">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <section className="bg-white border border-[var(--hc-border-soft)] border-t-0 rounded-b-[var(--radius-xl)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="hc-table w-full">
                <thead>
                  <tr>
                    <th className="hc-th">TICKET ID</th>
                    <th className="hc-th">REQUESTER</th>
                    <th className="hc-th">DEPARTMENT</th>
                    <th className="hc-th">PRIORITY</th>
                    <th className="hc-th">STATUS</th>
                    <th className="hc-th">OWNER</th>
                    <th className="hc-th">WAIT TIME</th>
                    <th className="hc-th text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={8} className="hc-td text-center py-12 text-slate-400">No tickets found</td></tr>
                  ) : (
                    paged.map((t) => (
                      <tr key={t.ticketId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="hc-td">
                          <span className="font-semibold text-[var(--hc-primary)]">{t.ticketId}</span>
                        </td>
                        <td className="hc-td">
                          <div className="flex items-center gap-2">
                            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E8F0FF] text-[var(--hc-primary)] text-[10px] font-bold">
                              {t.requesterInitials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--hc-text)]">{t.requesterName}</p>
                              <p className="text-xs text-slate-400">{t.requesterRole}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hc-td">
                          <p className="text-sm font-medium">{t.department}</p>
                          <p className="text-xs text-slate-400">{t.departmentSub}</p>
                        </td>
                        <td className="hc-td"><PriorityBadge priority={t.priority} /></td>
                        <td className="hc-td"><StatusBadge status={t.status} /></td>
                        <td className="hc-td">
                          <div className="flex items-center gap-2">
                            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                              {t.ownerInitials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--hc-text)]">{t.ownerName}</p>
                              <p className="text-xs text-slate-400">{t.ownerTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hc-td">
                          <span className={`text-sm font-semibold tabular-nums ${t.status === "Resolved" ? "text-slate-400" : t.priority === "Critical" || t.priority === "High" ? "text-[var(--hc-danger)]" : "text-[var(--hc-text)]"}`}>
                            {t.waitTime}
                          </span>
                          <p className="text-[10px] text-slate-400">{t.sla}</p>
                        </td>
                        <td className="hc-td text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" className="px-3 py-1.5 text-xs font-semibold border border-[var(--hc-primary)] text-[var(--hc-primary)] rounded-[var(--radius-md)] opacity-60" disabled title="Ticket detail drilldown is not exposed by the current support API.">
                              View unavailable
                            </button>
                            <button type="button" className="p-1.5 rounded-[var(--radius-md)] transition-colors opacity-60" disabled title="Ticket row actions are not exposed by the current support API.">
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-[var(--hc-border-soft)] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span className="text-slate-500">
                Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tickets
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPage(p)} className={`min-w-[32px] h-8 rounded-[var(--radius-md)] text-sm font-medium ${page === p ? "bg-[var(--hc-primary)] text-white" : "hover:bg-slate-100"}`}>
                    {p}
                  </button>
                ))}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* SLA Health */}
          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--hc-text)]">SLA HEALTH</h3>
              <button type="button" className="text-xs font-semibold text-[var(--hc-primary)] opacity-60" disabled title="SLA detail drilldown is not exposed by the current support API.">View all unavailable</button>
            </div>
            {/* Donut */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <svg viewBox="0 0 120 120" className="w-32 h-32">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#059669" strokeWidth="12" strokeDasharray="209 105" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#D97706" strokeWidth="12" strokeDasharray="66 248" strokeLinecap="round" transform="rotate(150 60 60)" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#DC2626" strokeWidth="12" strokeDasharray="25 289" strokeLinecap="round" transform="rotate(225 60 60)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--hc-text)]">{totalActive}</span>
                  <span className="text-[10px] text-slate-500">Total</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--hc-success)]" /> On Track</span><span className="font-bold">58 (67%)</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--hc-warning)]" /> At Risk</span><span className="font-bold">18 (21%)</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--hc-danger)]" /> Breached</span><span className="font-bold">7 (8%)</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> No SLA</span><span className="font-bold">3 (4%)</span></div>
            </div>
          </div>

          {/* Escalation Guide */}
          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-5">
            <h3 className="text-sm font-bold text-[var(--hc-text)] mb-4">ESCALATION GUIDE</h3>
            <div className="space-y-3">
              <EscalationItem icon={AlertTriangle} color="text-[var(--hc-danger)]" bg="bg-[var(--hc-danger-bg)]" title={`${urgentCount} urgent escalations`} desc="Require immediate attention" />
              <EscalationItem icon={Clock} color="text-[var(--hc-warning)]" bg="bg-[#FFF3E0]" title="18 at risk tickets" desc="Review and act to avoid breach" />
              <EscalationItem icon={Headphones} color="text-[var(--hc-primary)]" bg="bg-[#E8F0FF]" title="SLA policies" desc="Review response targets" />
              <EscalationItem icon={Users} color="text-[var(--hc-success)]" bg="bg-[var(--hc-success-bg)]" title="On-call contacts" desc="View team coverage" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─────────────────── Sub-components ─────────────────── */

function EscalationItem({ icon: Icon, color, bg, title, desc }: { icon: React.ElementType; color: string; bg: string; title: string; desc: string }) {
  return (
    <div className="w-full flex items-center gap-3 text-left p-2 -mx-2 rounded-[var(--radius-md)] opacity-80">
      <div className={`grid size-8 shrink-0 place-items-center rounded-full ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${color}`}>{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
    </div>
  );
}
