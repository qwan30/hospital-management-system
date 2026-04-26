"use client";

import { useEffect, useState } from "react";
import {
  getMonitoringSnapshot,
  type SystemMonitoringSnapshotResponse,
} from "@/lib/operations-api";

export default function AdminMonitoringPage() {
  const [snapshot, setSnapshot] = useState<SystemMonitoringSnapshotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getMonitoringSnapshot()
      .then((nextSnapshot) => {
        if (isMounted) {
          setSnapshot(nextSnapshot);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setSnapshot(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load monitoring.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="p-8" data-testid="monitoring-snapshot">
      <header className="mb-10">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Monitoring Dashboard
        </span>
        <h1 className="text-4xl font-light tracking-tight text-on-background">
          HMS Operational Health
        </h1>
      </header>

      {error ? (
        <section className="mb-8 border border-error-container bg-white p-6" role="alert">
          <p className="text-sm font-semibold text-error">{error}</p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-px bg-outline-variant/20 md:grid-cols-3">
        <HealthTile
          label="Database"
          value={snapshot?.databaseStatus ?? "Loading"}
          detail="PostgreSQL schema validation"
          healthy={snapshot?.databaseStatus === "UP"}
        />
        <HealthTile
          label="Queue"
          value={snapshot?.queueStatus ?? "Loading"}
          detail="Staff queue workflow"
          healthy={snapshot?.queueStatus === "UP"}
        />
        <HealthTile
          label="System"
          value={snapshot?.healthy ? "HEALTHY" : snapshot ? "ATTENTION" : "Loading"}
          detail={snapshot ? pluralize(snapshot.activeAlerts, "active alert") : "Loading alerts"}
          healthy={Boolean(snapshot?.healthy)}
        />
      </section>

      <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        <Metric label="Active Alerts" value={snapshot?.activeAlerts ?? 0} />
        <Metric label="Uptime" value={formatUptime(snapshot?.uptimeSeconds ?? 0)} />
        <Metric
          label="Generated"
          value={snapshot ? formatDateTime(snapshot.generatedAt) : "Pending"}
        />
      </section>
    </main>
  );
}

function HealthTile({
  label,
  value,
  detail,
  healthy,
}: {
  label: string;
  value: string;
  detail: string;
  healthy: boolean;
}) {
  return (
    <div className="bg-surface-container-low p-8">
      <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-outline">
        {label}
      </span>
      <div className="mb-2 text-2xl font-semibold text-on-background">{value}</div>
      <div className="text-xs text-outline">{detail}</div>
      <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        <span className={`h-2 w-2 ${healthy ? "bg-emerald-500" : "bg-error"}`} />
        {healthy ? "Operational" : "Review"}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-t-2 border-primary pt-6">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-outline">
        {label}
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}
