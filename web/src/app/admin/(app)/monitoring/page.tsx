"use client";

import { useEffect, useState } from "react";
import {
  getMonitoringSnapshot,
  type SystemMonitoringSnapshotResponse,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { DataPanel } from "@/components/ui/data-panel";
import { KpiCard } from "@/components/ui/kpi-card";
import { Activity, AlertTriangle, CheckCircle2, Clock, Database, Server, Settings } from "lucide-react";

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
    <main data-testid="monitoring-snapshot">
      <PageHeader 
        title="HMS Operational Health"
      />

      <div className="p-8 pt-0 space-y-8">
        {error ? (
          <section className="border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-6 rounded-[var(--radius-md)]" role="alert">
            <p className="text-sm font-semibold text-[var(--hc-danger)]">{error}</p>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <KpiCard
            label="Database"
            value={snapshot?.databaseStatus ?? "Loading"}
            helper="PostgreSQL schema validation"
            tone={snapshot?.databaseStatus === "UP" ? "green" : "amber"}
            icon={Database}
          />
          <KpiCard
            label="Queue"
            value={snapshot?.queueStatus ?? "Loading"}
            helper="Staff queue workflow"
            tone={snapshot?.queueStatus === "UP" ? "green" : "amber"}
            icon={Settings}
          />
          <KpiCard
            label="System"
            value={snapshot?.healthy ? "HEALTHY" : snapshot ? "ATTENTION" : "Loading"}
            helper={snapshot ? pluralize(snapshot.activeAlerts, "active alert") : "Loading alerts"}
            tone={snapshot?.healthy ? "green" : "amber"}
            icon={snapshot?.healthy ? CheckCircle2 : AlertTriangle}
          />
        </section>

        <DataPanel>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            <Metric label="Active Alerts" value={snapshot?.activeAlerts ?? 0} />
            <Metric label="Inventory Alerts" value={snapshot?.inventoryAlertCount ?? 0} />
            <Metric label="Schedule Alerts" value={snapshot?.scheduleAlertCount ?? 0} />
            <Metric label="Uptime" value={formatUptime(snapshot?.uptimeSeconds ?? 0)} />
            <Metric
              label="Generated"
              value={snapshot ? formatDateTime(snapshot.generatedAt) : "Pending"}
            />
          </div>
        </DataPanel>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-t-2 border-[var(--hc-primary)] pt-6">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
        {label}
      </div>
      <div className="text-xl font-semibold text-[var(--hc-text)]">{value}</div>
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
