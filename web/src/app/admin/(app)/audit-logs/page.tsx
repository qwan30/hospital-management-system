"use client";

import { useEffect, useMemo, useState } from "react";
import { listAuditLogs, type AuditLogResponse } from "@/lib/operations-api";

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
      <header className="p-8 pb-4">
        <h1 className="mb-2 text-4xl font-light tracking-tight">Audit Logs</h1>
        <p className="max-w-2xl text-sm text-on-surface-variant">
          Monitor authorization denials, queue actions, inventory movement, and administrative
          changes.
        </p>
      </header>

      <section className="flex items-end gap-0 bg-surface-container-low px-8 py-4">
        <label className="max-w-sm flex-1">
          <span className="mb-2 block text-[11px] font-bold uppercase text-on-surface">
            Search
          </span>
          <input
            className="w-full border-none border-b-2 border-outline bg-surface-container-high px-4 py-3 text-sm transition-all focus:border-primary focus:ring-0"
            placeholder="Actor, action, or entity"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span className="ml-auto text-[11px] font-semibold uppercase text-on-surface-variant">
          {filteredLogs.length} events
        </span>
      </section>

      {error ? (
        <section className="m-8 border border-error-container bg-white p-6" role="alert">
          <p className="text-sm font-semibold text-error">{error}</p>
        </section>
      ) : null}

      <section className="overflow-auto bg-surface" data-testid="audit-log-table">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left">
          <thead className="bg-surface-container-high">
            <tr className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              <th className="w-56 border-b border-outline-variant/30 px-8 py-3">Timestamp</th>
              <th className="w-48 border-b border-outline-variant/30 px-4 py-3">Actor</th>
              <th className="w-56 border-b border-outline-variant/30 px-4 py-3">Action</th>
              <th className="w-48 border-b border-outline-variant/30 px-4 py-3">Target</th>
              <th className="border-b border-outline-variant/30 px-4 py-3">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredLogs.map((log) => (
              <tr key={log.auditLogId} className="hover:bg-surface-container-lowest">
                <td className="px-8 py-4 font-mono text-sm text-zinc-500">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-4 py-4 text-sm font-semibold">
                  {log.actorName ?? "System"}
                  {log.actorRole ? (
                    <span className="ml-2 text-[10px] uppercase text-outline">
                      {log.actorRole}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <span className="bg-zinc-200 px-2 py-0.5 text-[10px] font-bold tracking-tight">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-primary">
                  {log.entityType}
                  {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-4 text-xs text-on-surface-variant">
                  {formatMetadata(log.metadata)}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 ? (
              <tr>
                <td className="px-8 py-10 text-center text-sm font-semibold" colSpan={5}>
                  No audit events match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
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
