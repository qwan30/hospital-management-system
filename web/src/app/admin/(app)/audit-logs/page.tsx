"use client";

import { useEffect, useMemo, useState } from "react";
import { listAuditLogs, type AuditLogResponse } from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";

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

  return (
    <main>
      <PageHeader 
        title="Audit Logs"
        description="Monitor authorization denials, queue actions, inventory movement, and administrative changes."
      />

      <div className="p-8 pt-0 space-y-8">
        <DataPanel className="flex items-end gap-0 px-8 py-4 bg-[var(--hc-surface)]">
          <label className="max-w-sm flex-1">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
              Search
            </span>
            <input
              className="w-full border-none border-b-2 border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] px-4 py-3 text-sm transition-all focus:border-[var(--hc-primary)] focus:ring-0 rounded-t-[var(--radius-sm)]"
              placeholder="Actor, action, or entity"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
            {filteredLogs.length} events
          </span>
        </DataPanel>

        {error ? (
          <section className="border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-6 rounded-[var(--radius-md)]" role="alert">
            <p className="text-sm font-semibold text-[var(--hc-danger)]">{error}</p>
          </section>
        ) : null}

        <DataPanel className="overflow-auto" data-testid="audit-log-table">
          <table className="hc-table w-full min-w-[900px] table-fixed border-collapse text-left">
            <thead>
              <tr>
                <th className="w-56">Timestamp</th>
                <th className="w-48">Actor</th>
                <th className="w-56">Action</th>
                <th className="w-48">Target</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hc-border-soft)]">
              {filteredLogs.map((log) => (
                <tr key={log.auditLogId}>
                  <td className="font-mono text-sm text-[var(--hc-text-secondary)]">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="text-sm font-semibold text-[var(--hc-text)]">
                    {log.actorName ?? "System"}
                    {log.actorRole ? (
                      <span className="ml-2 hc-badge bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)] border border-[var(--hc-border-soft)]">
                        {log.actorRole}
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className="hc-badge bg-[var(--hc-surface-soft)] text-[var(--hc-text)] border border-[var(--hc-border)]">
                      {log.action}
                    </span>
                  </td>
                  <td className="text-sm text-[var(--hc-info)] font-medium">
                    {log.entityType}
                    {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="text-xs text-[var(--hc-text-secondary)]">
                    {formatMetadata(log.metadata)}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 ? (
                <tr>
                  <td className="px-8 py-10 text-center text-sm font-semibold text-[var(--hc-text-secondary)]" colSpan={5}>
                    No audit events match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </DataPanel>
      </div>
    </main>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "No metadata";
  }

  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");
}
