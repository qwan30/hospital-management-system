"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield, ShieldAlert, Settings, CheckCircle, ArrowUp, Search, ChevronDown, RotateCcw, Calendar as CalendarIcon, MoreVertical, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listAuditLogs, type AuditLogResponse } from "@/lib/operations-api";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    listAuditLogs()
      .then((nextLogs) => {
        if (isMounted) {
          setLogs(nextLogs);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setLogs([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load audit logs.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return logs;
    }

    return logs.filter((log) =>
      [log.actorName, log.actorRole, log.action, log.entityType, log.entityId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [logs, query]);

  const getSeverity = (action: string) => {
    if (action.includes("DENIED") || action.includes("FAILED") || action.includes("ERROR")) return "HIGH";
    if (action.includes("VIEWED") || action.includes("READ")) return "LOW";
    return "INFO";
  };

  const getSeverityBadgeVariant = (severity: string): "destructive" | "success" | "info" => {
    switch (severity) {
      case "HIGH": return "destructive";
      case "LOW": return "success";
      default: return "info";
    }
  };

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="CLINICAL SECURITY"
        title={
          <div className="flex items-center gap-4">
              <span>Audit Logs</span>
              <Badge variant="outline" className="rounded-full bg-green-50 text-green-700 border-green-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                  Live
              </Badge>
          </div>
        }
        description="Monitor authorization, system actions, inventory movement, and administrative changes."
        action={
          <button className="hc-button-outline flex items-center gap-2 h-10 px-5 bg-white hover:bg-[var(--hc-background)]">
              <Download className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-widest">Export CSV</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="hc-kpi-grid mb-6">
          <KpiCard
              label="Total Events"
              value="24,851"
              icon={Shield}
              tone="blue"
              helper={
                  <span className="flex items-center text-xs">
                      <span className="flex items-center text-[var(--hc-green-600)] font-semibold mr-1">
                          <ArrowUp className="w-3 h-3 mr-0.5" /> 8.3%
                      </span>
                      <span className="text-[var(--hc-text-secondary)] font-medium">vs last 7 days</span>
                  </span>
              }
          />
          <KpiCard
              label="Security Alerts"
              value="142"
              icon={ShieldAlert}
              tone="red"
              helper={
                  <span className="flex items-center text-xs">
                      <span className="flex items-center text-[var(--hc-red-600)] font-semibold mr-1">
                          <ArrowUp className="w-3 h-3 mr-0.5" /> 12.6%
                      </span>
                      <span className="text-[var(--hc-text-secondary)] font-medium">vs last 7 days</span>
                  </span>
              }
          />
          <KpiCard
              label="System Actions"
              value="18,742"
              icon={Settings}
              tone="green"
              helper={
                  <span className="flex items-center text-xs">
                      <span className="flex items-center text-[var(--hc-green-600)] font-semibold mr-1">
                          <ArrowUp className="w-3 h-3 mr-0.5" /> 6.7%
                      </span>
                      <span className="text-[var(--hc-text-secondary)] font-medium">vs last 7 days</span>
                  </span>
              }
          />
          <KpiCard
              label="Validation Events"
              value="5,967"
              icon={CheckCircle}
              tone="purple"
              helper={
                  <span className="flex items-center text-xs">
                      <span className="flex items-center text-[var(--hc-green-600)] font-semibold mr-1">
                          <ArrowUp className="w-3 h-3 mr-0.5" /> 9.2%
                      </span>
                      <span className="text-[var(--hc-text-secondary)] font-medium">vs last 7 days</span>
                  </span>
              }
          />
      </div>

      {/* Filters Area */}
      <div className="bg-white rounded-xl border border-[var(--hc-border-soft)] p-4 shadow-sm mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--hc-text)]">Search logs</label>
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search by actor, target, or details..."
                  className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--hc-text)]">Actor</label>
            <button className="flex items-center justify-between gap-3 h-9 px-3 bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors w-full text-left">
                <span className="text-sm font-medium text-[var(--hc-text-secondary)]">All Actors</span>
                <ChevronDown className="w-4 h-4 text-[var(--hc-text-secondary)]" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--hc-text)]">Action Type</label>
            <button className="flex items-center justify-between gap-3 h-9 px-3 bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors w-full text-left">
                <span className="text-sm font-medium text-[var(--hc-text-secondary)]">All Actions</span>
                <ChevronDown className="w-4 h-4 text-[var(--hc-text-secondary)]" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[var(--hc-text)]">Date Range</label>
            <button className="flex items-center justify-start gap-3 h-9 px-3 bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors w-full text-left">
                <CalendarIcon className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                <span className="text-sm font-medium text-[var(--hc-text)]">May 12, 2025 – May 15, 2025</span>
            </button>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1.5 w-full max-w-[calc(25%-12px)]">
            <label className="text-[11px] font-bold text-[var(--hc-text)]">Department</label>
            <button className="flex items-center justify-between gap-3 h-9 px-3 bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors w-full text-left">
                <span className="text-sm font-medium text-[var(--hc-text-secondary)]">All Departments</span>
                <ChevronDown className="w-4 h-4 text-[var(--hc-text-secondary)]" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 w-full max-w-[calc(25%-12px)]">
            <label className="text-[11px] font-bold text-[var(--hc-text)]">Severity</label>
            <button className="flex items-center justify-between gap-3 h-9 px-3 bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors w-full text-left">
                <span className="text-sm font-medium text-[var(--hc-text-secondary)]">All Severity</span>
                <ChevronDown className="w-4 h-4 text-[var(--hc-text-secondary)]" />
            </button>
          </div>

          <button className="flex items-center gap-2 h-9 px-3 text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] transition-colors text-sm font-medium">
            <RotateCcw className="w-4 h-4" />
            Clear filters
          </button>
        </div>
      </div>

      {error ? (
        <section className="border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-6 rounded-[var(--radius-md)] mb-6" role="alert">
          <p className="text-sm font-semibold text-[var(--hc-danger)]">{error}</p>
        </section>
      ) : null}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[var(--hc-border-soft)] overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-[var(--hc-border-soft)] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--hc-blue-600)]" />
            <h2 className="text-lg font-bold text-[var(--hc-text)]">Audit Logs</h2>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap" data-testid="audit-log-table">
                <thead>
                    <tr className="border-b border-[var(--hc-border-soft)] text-[11px] font-bold text-[var(--hc-text-secondary)] uppercase tracking-widest bg-[var(--hc-background)]">
                        <th className="px-5 py-4 font-bold">Timestamp</th>
                        <th className="px-5 py-4 font-bold">Actor</th>
                        <th className="px-5 py-4 font-bold">Role</th>
                        <th className="px-5 py-4 font-bold">Action</th>
                        <th className="px-5 py-4 font-bold">Target</th>
                        <th className="px-5 py-4 font-bold">Severity</th>
                        <th className="px-5 py-4 font-bold">Details</th>
                        <th className="px-5 py-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--hc-border-soft)]">
                    {filteredLogs.map((log) => {
                      const severity = getSeverity(log.action);
                      const severityVariant = getSeverityBadgeVariant(severity);

                      return (
                        <tr key={log.auditLogId} className="hover:bg-[var(--hc-background)] transition-colors align-top">
                            <td className="px-5 py-3 font-medium text-[var(--hc-text)] pt-4">
                                {formatDateTime(log.createdAt)}
                            </td>
                            <td className="px-5 py-3 font-medium text-[var(--hc-text)] pt-4">{log.actorName ?? "System"}</td>
                            <td className="px-5 py-3 text-[var(--hc-text-secondary)] pt-4">{log.actorRole ?? "System"}</td>
                            <td className="px-5 py-3 pt-4">
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold text-[var(--hc-blue-600)] bg-blue-50 border-none">
                                    {log.action}
                                </Badge>
                            </td>
                            <td className="px-5 py-3 font-semibold text-[var(--hc-blue-600)] pt-4 uppercase text-[11px] tracking-wider">
                                {log.entityType}{log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                            </td>
                            <td className="px-5 py-3 pt-4">
                                <Badge variant={severityVariant} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold">
                                    {severity}
                                </Badge>
                            </td>
                            <td className="px-5 py-3 text-xs text-[var(--hc-text-secondary)] pt-4">
                                {formatMetadata(log.metadata)}
                            </td>
                            <td className="px-5 py-3 text-right pt-4">
                                <button className="p-1.5 rounded-md hover:bg-[var(--hc-border-soft)] text-[var(--hc-text-secondary)] transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    )})}
                    {filteredLogs.length === 0 ? (
                        <tr>
                            <td className="px-8 py-10 text-center text-sm font-semibold text-[var(--hc-text-secondary)]" colSpan={8}>
                            No audit events match the current filter.
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </table>
        </div>

        <div className="p-4 border-t border-[var(--hc-border-soft)] flex items-center justify-between bg-white">
            <p className="text-sm text-[var(--hc-text-secondary)]">Showing 1 to {Math.min(10, filteredLogs.length)} of {filteredLogs.length > 0 ? "24,851" : "0"} events</p>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[var(--hc-text-secondary)] mr-4">
                    <span>Rows per page</span>
                    <div className="flex items-center justify-between border border-[var(--hc-border-soft)] rounded bg-white px-2 py-1 min-w-[60px]">
                        <span className="font-medium text-[var(--hc-text)]">10</span>
                        <ChevronDown className="w-3 h-3" />
                    </div>
                </div>

                <nav aria-label="audit log pagination" className="flex items-center justify-end gap-1">
                    <button
                        className="h-8 rounded-md px-3 text-xs font-medium opacity-60"
                        disabled
                        title="Audit-log pagination is not exposed by the current backend API."
                        type="button"
                    >
                        Previous
                    </button>
                    {[1, 2, 3, 4, 5].map((pageNumber) => (
                        <button
                            aria-current={pageNumber === 1 ? "page" : undefined}
                            className={`h-8 w-8 rounded-md text-xs font-medium opacity-60 ${pageNumber === 1 ? "bg-[var(--hc-blue-600)] text-white" : ""}`}
                            disabled
                            key={pageNumber}
                            title="Audit-log pagination is not exposed by the current backend API."
                            type="button"
                        >
                            {pageNumber}
                        </button>
                    ))}
                    <span className="inline-flex h-8 w-8 items-center justify-center text-xs text-[var(--hc-text-secondary)]">
                        ...
                    </span>
                    <button
                        className="h-8 min-w-8 rounded-md px-2 text-xs font-medium opacity-60"
                        disabled
                        title="Audit-log pagination is not exposed by the current backend API."
                        type="button"
                    >
                        2,486
                    </button>
                    <button
                        className="h-8 rounded-md px-3 text-xs font-medium opacity-60"
                        disabled
                        title="Audit-log pagination is not exposed by the current backend API."
                        type="button"
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  const d = new Date(value);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <span className="italic text-[var(--hc-text-placeholder)]">No details</span>;
  }

  return (
    <div className="flex flex-col gap-0.5 font-mono text-[10px] leading-relaxed">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key}>
            <span className="text-[var(--hc-text-secondary)]">{key}:</span> <span className="text-[var(--hc-text)]">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
