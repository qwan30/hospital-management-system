import { Users, DollarSign, Bed, Stethoscope, RefreshCw, ClipboardList, AlertTriangle, Activity, Package, FileText, ChevronRight, Shield, Lock, Settings, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";

export default function AdminDashboardPage() {
  return (
    <div className="p-8 pb-20">
      {/* Header Section */}
      <PageHeader
        categoryLabel="SYSTEM OVERVIEW"
        title="Admin Statistics"
        description={
          <>
            Real-time HMS performance data across the hospital.
            <span className="text-[var(--hc-success)] mx-1">●</span> Last updated: 12 Oct 2023, 08:45 AM
          </>
        }
        action={
          <button className="flex items-center gap-2 text-sm font-semibold text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        }
      />

      {/* KPI Bento Grid */}
      <div className="hc-kpi-grid">
        <KpiCard
          label="Total Patients"
          value="12,842"
          helper="↑ 4.2% VS LAST MONTH"
          icon={Users}
          tone="blue"
        />
        <KpiCard
          label="Gross Revenue"
          value="$1.24M"
          helper="↑ 12% FISCAL YTD"
          icon={DollarSign}
          tone="teal"
        />
        <KpiCard
          label="Bed Occupancy"
          value="92.4%"
          helper={<span className="text-[var(--hc-danger)]">Critical Capacity</span>}
          icon={Bed}
          tone="red"
        />
        <KpiCard
          label="Active Staff"
          value="412"
          helper="98 ON CALL"
          icon={Stethoscope}
          tone="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Module */}
        <div className="lg:col-span-2">
          <section className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-[24px] shadow-[var(--shadow-card)] h-full">
            <div className="flex items-end justify-between mb-8">
              <h3 className="text-lg font-bold text-[var(--hc-text)] leading-tight">
                Appointment Velocity
              </h3>
              <div className="flex gap-4">
                <button className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-[var(--hc-blue-600)] pb-1 text-[var(--hc-text)]">
                  Daily
                </button>
                <button className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-transparent pb-1 text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] transition-colors">
                  Weekly
                </button>
              </div>
            </div>

            <ChartPlaceholder title="Appointment Velocity" description="Detailed chart with axis labels goes here" className="aspect-[16/7] h-auto" />

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="p-5 border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] bg-[var(--hc-surface-soft)]">
                <span className="text-[10px] font-semibold uppercase tracking-widest block mb-2 text-[var(--hc-text-secondary)]">
                  Pending Confirmations
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-light text-[var(--hc-text)]">28</span>
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="p-5 border border-[var(--hc-danger-bg)] rounded-[var(--radius-lg)] bg-[#FFF5F5]">
                <span className="text-[10px] font-semibold uppercase tracking-widest block mb-2 text-[var(--hc-danger)]">
                  Emergency Slots
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-light text-[var(--hc-danger)]">04</span>
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--hc-danger)] text-white flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Side Actions & Logs */}
        <div className="space-y-6 flex flex-col">
          {/* Quick Link Tiles */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-[24px] shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-[var(--hc-text)]">
              System Controls
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { icon: Activity, label: "Live Monitoring", desc: "Real-time system health" },
                { icon: Package, label: "Inventory Audit", desc: "Check stock levels" },
                { icon: FileText, label: "Audit Log Export", desc: "Download system logs" },
                { icon: Settings, label: "System Settings", desc: "Configure preferences" },
              ].map((item, i) => (
                <li key={i}>
                  <button className="w-full flex items-center justify-between p-4 rounded-[var(--radius-lg)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-blue-600)] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-[13px] font-bold text-[var(--hc-text)] mb-0.5">{item.label}</div>
                        <div className="text-[12px] text-[var(--hc-text-secondary)]">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--hc-text-secondary)] group-hover:text-[var(--hc-blue-600)]" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Module Summaries (Inventory) */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface-soft)] p-[24px] shadow-[var(--shadow-card)] flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--hc-text)]">
                Critical Inventory
              </h3>
              <button className="text-[13px] font-bold text-[var(--hc-blue-600)] hover:underline">
                View all
              </button>
            </div>
            <ul className="space-y-5">
              <li className="flex items-center justify-between">
                <span className="font-semibold text-[var(--hc-text)] text-[13px] w-32">Surgical Masks</span>
                <div className="w-full bg-[var(--hc-border)] rounded-full h-1.5 overflow-hidden flex-1 mx-4">
                  <div className="bg-[var(--hc-danger)] h-full w-[12%]" />
                </div>
                <span className="text-[var(--hc-text)] font-bold text-[13px] w-12 text-right mr-4">12%</span>
                <Badge variant="danger" className="w-24 justify-center">Critical</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-[var(--hc-text)] text-[13px] w-32">Oxygen Cylinders</span>
                <div className="w-full bg-[var(--hc-border)] rounded-full h-1.5 overflow-hidden flex-1 mx-4">
                  <div className="bg-[var(--hc-blue-500)] h-full w-[45%]" />
                </div>
                <span className="text-[var(--hc-text)] font-bold text-[13px] w-12 text-right mr-4">45%</span>
                <Badge variant="warning" className="w-24 justify-center bg-[#FEF3C7] text-[#B45309] hover:bg-[#FEF3C7]">Low Stock</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-[var(--hc-text)] text-[13px] w-32">Saline Solution</span>
                <div className="w-full bg-[var(--hc-border)] rounded-full h-1.5 overflow-hidden flex-1 mx-4">
                  <div className="bg-[var(--hc-blue-500)] h-full w-[88%]" />
                </div>
                <span className="text-[var(--hc-text)] font-bold text-[13px] w-12 text-right mr-4">88%</span>
                <Badge variant="success" className="w-24 justify-center">Sufficient</Badge>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Asymmetric Bottom Section: Security & Logs */}
      <section className="mt-6 rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-[24px] shadow-[var(--shadow-card)]">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/3">
            <h3 className="text-lg font-bold text-[var(--hc-text)] mb-3">
              Security & Logs
            </h3>
            <p className="text-[13px] text-[var(--hc-text-secondary)] leading-relaxed max-w-sm mb-6">
              Automated monitoring of all system interactions. Discrepancies are
              flagged and held for manual administrator review within 24 hours.
            </p>
            <div className="flex justify-center my-8">
               <div className="relative">
                 <Shield className="w-32 h-32 text-[var(--hc-blue-50)]" strokeWidth={1} />
                 <div className="absolute inset-0 flex items-center justify-center text-[var(--hc-blue-300)]">
                   <div className="text-4xl font-light">+</div>
                 </div>
                 <div className="absolute bottom-4 right-4 bg-[var(--hc-blue-600)] rounded-md p-1.5 shadow-sm text-white">
                   <Lock className="w-4 h-4" />
                 </div>
               </div>
            </div>
          </div>
          <div className="md:w-2/3 flex flex-col w-full h-full">
            <div className="flex items-center justify-between border-b border-[var(--hc-border-soft)] w-full mb-4">
              <div className="flex gap-4">
                 <button className="text-[13px] font-bold text-[var(--hc-blue-600)] border-b-2 border-[var(--hc-blue-600)] pb-2 px-1">
                   Recent Alerts
                 </button>
                 <button className="text-[13px] font-bold text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] border-b-2 border-transparent pb-2 px-1 transition-colors">
                   System Events
                 </button>
              </div>
              <button className="flex items-center gap-1 text-[13px] font-bold text-[var(--hc-blue-600)] hover:underline mb-2">
                 View all logs <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              <div className="border border-transparent hover:border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-3 flex items-center justify-between transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-[var(--hc-text-secondary)] w-16">
                    08:42 AM
                  </span>
                  <AlertTriangle className="w-4 h-4 text-[var(--hc-danger)] shrink-0" />
                  <span className="text-[13px] font-medium text-[var(--hc-text)]">
                    Unauthorized access attempt blocked – Node IP 192.168.1.42
                  </span>
                </div>
                <Badge variant="danger">High Alert</Badge>
              </div>

              <div className="border border-transparent hover:border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-3 flex items-center justify-between transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-[var(--hc-text-secondary)] w-16">
                    08:15 AM
                  </span>
                  <AlertTriangle className="w-4 h-4 text-[var(--hc-warning)] shrink-0" />
                  <span className="text-[13px] font-medium text-[var(--hc-text)]">
                    Inventory depletion: Type B- Blood Units below threshold
                  </span>
                </div>
                <Badge variant="default" className="bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] hover:bg-[var(--hc-blue-50)]">System</Badge>
              </div>

              <div className="border border-transparent hover:border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-3 flex items-center justify-between transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-[var(--hc-text-secondary)] w-16">
                    07:55 AM
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[var(--hc-success)] shrink-0" />
                  <span className="text-[13px] font-medium text-[var(--hc-text)]">
                    Server maintenance completed successfully on Primary Cluster
                  </span>
                </div>
                <Badge variant="success">Success</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
