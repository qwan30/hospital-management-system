"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getMonitoringSnapshot,
  listInventoryAlerts,
  type SystemMonitoringSnapshotResponse,
  type InventoryAlertResponse,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  ExternalLink,
  FileText,
  Info,
  Package,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Zap,
} from "lucide-react";

/* ─────────────────── Types ─────────────────── */

interface AlertEntry {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: "HIGH" | "MEDIUM" | "INFO";
}

/* ─────────────────── Component ─────────────────── */

export default function AdminMonitoringPage() {
  const [snapshot, setSnapshot] = useState<SystemMonitoringSnapshotResponse | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlertResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dateRange, setDateRange] = useState("24h");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [snap, invAlerts] = await Promise.all([
        getMonitoringSnapshot(),
        listInventoryAlerts(),
      ]);
      setSnapshot(snap);
      setAlerts(invAlerts);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load monitoring.");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(loadData, 30_000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, loadData]);

  /* ─── Derived data ─── */
  const recentAlerts = useMemo<AlertEntry[]>(() => {
    const entries: AlertEntry[] = [];
    // Derive alerts from inventory alerts
    for (const a of alerts.slice(0, 3)) {
      entries.push({
        id: a.itemId,
        title: `${a.alertType === "LOW_STOCK" ? "Inventory below reorder level" : a.alertType === "EXPIRING_SOON" ? "Item expiring soon" : "Expired item"}`,
        description: `${a.itemName}${a.lotCode ? ` (${a.lotCode})` : ""}`,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        severity: a.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
      });
    }
    // Add system-derived alerts
    if (snapshot) {
      if (snapshot.scheduleAlertCount > 0) {
        entries.push({
          id: "schedule",
          title: "Schedule conflict detected",
          description: `${snapshot.scheduleAlertCount} scheduling conflict${snapshot.scheduleAlertCount === 1 ? "" : "s"}`,
          time: formatTime(snapshot.generatedAt),
          severity: "MEDIUM",
        });
      }
      if (!snapshot.healthy) {
        entries.push({
          id: "system",
          title: "System health degraded",
          description: "One or more subsystems need attention",
          time: formatTime(snapshot.generatedAt),
          severity: "HIGH",
        });
      }
    }
    return entries.slice(0, 5);
  }, [alerts, snapshot]);

  const uptimePercent = snapshot
    ? Math.min(100, (snapshot.uptimeSeconds / (24 * 3600)) * 100).toFixed(2)
    : "—";

  return (
    <main data-testid="monitoring-snapshot" className="p-8 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          categoryLabel="MONITORING DASHBOARD"
          title="HMS Operational Health"
          description="Real-time overview of system status, alerts, and operational performance."
        />
        <div className="flex items-center gap-3 mt-2">
          {/* Auto-refresh toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-white hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? "text-[var(--hc-success)] animate-spin" : "text-slate-400"}`} style={autoRefresh ? { animationDuration: "3s" } : undefined} />
            Auto refresh:
            <span className={autoRefresh ? "text-[var(--hc-success)] font-bold" : "text-slate-400"}>
              {autoRefresh ? "● ON" : "OFF"}
            </span>
          </button>
          {/* Date range */}
          <div className="relative">
            <select
              aria-label="Monitoring date range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm font-medium rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {error ? (
        <section className="mt-6 border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-6 rounded-[var(--radius-md)]" role="alert">
          <p className="text-sm font-semibold text-[var(--hc-danger)]">{error}</p>
        </section>
      ) : null}

      {/* ── Status Banner Row ── */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusBanner
          label="DATABASE"
          status={snapshot?.databaseStatus ?? "Loading"}
          description="PostgreSQL schema validation"
          healthy={snapshot?.databaseStatus === "UP"}
          icon={Database}
        />
        <StatusBanner
          label="QUEUE"
          status={snapshot?.queueStatus ?? "Loading"}
          description="Staff queue workflow"
          healthy={snapshot?.queueStatus === "UP"}
          icon={Server}
        />
        <StatusBanner
          label="SYSTEM"
          status={snapshot?.healthy ? "HEALTHY" : snapshot ? "ATTENTION" : "Loading"}
          description={snapshot ? pluralize(snapshot.activeAlerts, "active alert") : "Loading alerts"}
          healthy={snapshot?.healthy ?? true}
          icon={snapshot?.healthy ? Shield : AlertTriangle}
          hasChevron
        />
      </section>

      {/* ── KPI Cards Row ── */}
      <section className="mt-6 hc-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <KpiCard
          label="Active Alerts"
          value={snapshot?.activeAlerts ?? "—"}
          helper={<TrendIndicator value={12} label="vs yesterday" />}
          icon={Bell}
          tone="blue"
        />
        <KpiCard
          label="Inventory Alerts"
          value={snapshot?.inventoryAlertCount ?? "—"}
          helper={<TrendIndicator value={-5} label="vs yesterday" />}
          icon={Package}
          tone="amber"
        />
        <KpiCard
          label="Schedule Alerts"
          value={snapshot?.scheduleAlertCount ?? "—"}
          helper={<TrendIndicator value={0} label="vs yesterday" />}
          icon={Activity}
          tone="green"
        />
        <KpiCard
          label="Uptime"
          value={`${uptimePercent}%`}
          helper={formatUptime(snapshot?.uptimeSeconds ?? 0) + " uptime"}
          icon={Zap}
          tone="teal"
        />
        <KpiCard
          label="Generated"
          value={snapshot ? formatDateTime(snapshot.generatedAt) : "Pending"}
          helper="Today"
          icon={Clock}
          tone="purple"
        />
      </section>

      {/* ── Bottom Panel: Chart + Recent Alerts + Quick Actions ── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px_260px] gap-4">
        {/* Alerts Trend Chart Placeholder */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--hc-text)]">ALERTS TREND</h3>
            <select aria-label="Alerts trend grouping" className="text-xs border border-[var(--hc-border)] rounded-[var(--radius-md)] px-3 py-1.5 bg-white">
              <option>By hour</option>
              <option>By day</option>
            </select>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6 text-xs mb-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#1E40AF] rounded-full inline-block" /> Active Alerts</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[var(--hc-success)] rounded-full inline-block" /> Inventory Alerts</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[var(--hc-warning)] rounded-full inline-block" /> Schedule Alerts</span>
            </div>
            {/* SVG Chart */}
            <AlertsChart
              activeAlerts={snapshot?.activeAlerts ?? 0}
              inventoryAlerts={snapshot?.inventoryAlertCount ?? 0}
              scheduleAlerts={snapshot?.scheduleAlertCount ?? 0}
            />
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--hc-border-soft)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--hc-text)]">RECENT ALERTS</h3>
            <button type="button" className="text-xs font-semibold text-[var(--hc-primary)] hover:underline">View all</button>
          </div>
          <div className="divide-y divide-[var(--hc-border-soft)]">
            {recentAlerts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No recent alerts</div>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${alert.severity === "HIGH" ? "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]" : alert.severity === "MEDIUM" ? "bg-[#FFF3E0] text-[var(--hc-warning)]" : "bg-[#E8F0FF] text-[var(--hc-primary)]"}`}>
                    {alert.severity === "INFO" ? <Info className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--hc-text)] leading-tight">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{alert.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs text-slate-400">{alert.time}</span>
                    <span className={`block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${alert.severity === "HIGH" ? "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]" : alert.severity === "MEDIUM" ? "bg-[#FFF3E0] text-[var(--hc-warning)]" : "bg-[#E8F0FF] text-[var(--hc-primary)]"}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-3 border-t border-[var(--hc-border-soft)]">
            <button type="button" className="text-xs font-semibold text-[var(--hc-primary)] flex items-center gap-1 hover:underline">
              View all alerts <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--hc-border-soft)]">
            <h3 className="text-sm font-bold text-[var(--hc-text)]">QUICK ACTIONS</h3>
          </div>
          <div className="divide-y divide-[var(--hc-border-soft)]">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50/50 transition-colors group"
              >
                <div className={`grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)] ${action.bg}`}>
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--hc-text)]">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─────────────────── Sub-components ─────────────────── */

const quickActions = [
  { label: "Run Health Check", desc: "Validate system components", icon: Zap, bg: "bg-emerald-50", color: "text-emerald-600" },
  { label: "View Alert Center", desc: "Manage and acknowledge alerts", icon: Bell, bg: "bg-blue-50", color: "text-blue-600" },
  { label: "Inventory Overview", desc: "Check stock and thresholds", icon: Package, bg: "bg-amber-50", color: "text-amber-600" },
  { label: "Queue Monitoring", desc: "View queue performance", icon: Activity, bg: "bg-purple-50", color: "text-purple-600" },
  { label: "System Logs", desc: "Access system logs", icon: FileText, bg: "bg-slate-100", color: "text-slate-600" },
] as const;

function StatusBanner({
  label,
  status,
  description,
  healthy,
  icon: Icon,
  hasChevron,
}: {
  label: string;
  status: string;
  description: string;
  healthy: boolean;
  icon: React.ElementType;
  hasChevron?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-[var(--radius-xl)] border p-5 transition-colors ${healthy ? "border-[var(--hc-border-soft)] bg-white" : "border-amber-200 bg-amber-50/50"}`}>
      <div className={`grid size-12 shrink-0 place-items-center rounded-full ${healthy ? "bg-[var(--hc-success-bg)] text-[var(--hc-success)]" : "bg-amber-100 text-amber-600"}`}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className={`text-xl font-bold ${healthy ? "text-[var(--hc-success)]" : "text-amber-600"}`}>{status}</p>
        <p className="text-xs text-slate-500">{description}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${healthy ? "bg-[var(--hc-success)]" : "bg-amber-500"}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {healthy ? "OPERATIONAL" : "REVIEW REQUIRED"}
          </span>
        </div>
      </div>
      {hasChevron ? (
        <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
      ) : (
        <CheckCircle2 className={`w-6 h-6 shrink-0 ${healthy ? "text-[var(--hc-success)]" : "text-amber-500"}`} />
      )}
    </div>
  );
}

function TrendIndicator({ value, label }: { value: number; label: string }) {
  if (value === 0) return <span className="text-slate-400">— 0% {label}</span>;
  const isUp = value > 0;
  return (
    <span className={isUp ? "text-[var(--hc-success)]" : "text-[var(--hc-danger)]"}>
      {isUp ? "↑" : "↓"} {Math.abs(value)}% {label}
    </span>
  );
}

function AlertsChart({ activeAlerts, inventoryAlerts, scheduleAlerts }: { activeAlerts: number; inventoryAlerts: number; scheduleAlerts: number }) {
  // Generate mock chart data points from the snapshot values
  const hours = 24;
  const points = Array.from({ length: hours }, (_, i) => i);
  const maxVal = Math.max(activeAlerts || 1, inventoryAlerts || 1, 80);
  const w = 620;
  const h = 240;
  const padX = 40;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  function yPos(val: number) {
    return padY + chartH - (val / maxVal) * chartH;
  }

  function generatePath(baseVal: number, variance: number) {
    return points.map((i) => {
      const progress = i / (hours - 1);
      const noise = Math.sin(i * 1.2 + variance) * variance * 0.3;
      const val = Math.max(0, baseVal * (0.5 + 0.5 * progress) + noise);
      const x = padX + (i / (hours - 1)) * chartW;
      const y = yPos(val);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }

  const activePath = generatePath(activeAlerts, 5);
  const inventoryPath = generatePath(inventoryAlerts, 3);
  const schedulePath = generatePath(scheduleAlerts, 1);

  // Y-axis labels
  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" style={{ maxHeight: 260 }}>
      {/* Grid lines */}
      {yLabels.map((v) => (
        <g key={v}>
          <line x1={padX} y1={yPos(v)} x2={w - padX} y2={yPos(v)} stroke="#E2E8F0" strokeWidth="0.5" />
          <text x={padX - 8} y={yPos(v) + 4} textAnchor="end" className="fill-slate-400" fontSize="10">{v}</text>
        </g>
      ))}
      {/* X-axis labels */}
      {[0, 6, 12, 18, 23].map((i) => (
        <text key={i} x={padX + (i / (hours - 1)) * chartW} y={h - 2} textAnchor="middle" className="fill-slate-400" fontSize="10">
          {`${String((i + 3) % 24).padStart(2, "0")}:00`}
        </text>
      ))}
      {/* Lines */}
      <path d={activePath} fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" />
      <path d={inventoryPath} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <path d={schedulePath} fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      {/* Current value dots */}
      <circle cx={w - padX} cy={yPos(activeAlerts)} r="4" fill="#1E40AF" />
      <circle cx={w - padX} cy={yPos(inventoryAlerts)} r="4" fill="#059669" />
      <circle cx={w - padX} cy={yPos(scheduleAlerts)} r="4" fill="#D97706" />
    </svg>
  );
}

/* ─────────────────── Helpers ─────────────────── */

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

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}
