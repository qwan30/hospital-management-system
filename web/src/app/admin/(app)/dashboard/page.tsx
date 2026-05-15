import { Users, DollarSign, Bed, Stethoscope, RefreshCw, ClipboardList, AlertTriangle, Activity, Package, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

export default function AdminDashboardPage() {
  return (
    <div className="p-8 pb-20">
      {/* Header Section */}
      <PageHeader
        title="Admin Statistics"
        description="Real-time HMS Performance Data • Last Updated: 12 Oct 2023, 08:45 AM"
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
          helper="CRITICAL CAPACITY"
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
            <div className="bg-[var(--hc-surface-soft)] rounded-[var(--radius-lg)] aspect-[16/7] w-full flex items-end px-8 pb-8 pt-8 gap-4 border border-[var(--hc-border-soft)]">
              {/* Faux Bar Chart for Editorial Aesthetic */}
              <div className="flex-1 bg-[var(--hc-blue-300)] rounded-t-sm h-[40%] transition-all hover:bg-[var(--hc-blue-600)]" />
              <div className="flex-1 bg-[var(--hc-blue-400)] rounded-t-sm h-[65%] transition-all hover:bg-[var(--hc-blue-600)]" />
              <div className="flex-1 bg-[var(--hc-blue-500)] rounded-t-sm h-[55%] transition-all hover:bg-[var(--hc-blue-600)]" />
              <div className="flex-1 bg-[var(--hc-blue-600)] rounded-t-sm h-[85%] transition-all hover:bg-[var(--hc-blue-700)]" />
              <div className="flex-1 bg-[var(--hc-blue-700)] rounded-t-sm h-[95%] transition-all hover:bg-[var(--hc-blue-800)]" />
              <div className="flex-1 bg-[var(--hc-blue-500)] rounded-t-sm h-[45%] transition-all hover:bg-[var(--hc-blue-600)]" />
              <div className="flex-1 bg-[var(--hc-blue-300)] rounded-t-sm h-[30%] transition-all hover:bg-[var(--hc-blue-600)]" />
            </div>
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
            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center justify-between p-3.5 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-blue-600)] hover:bg-[var(--hc-blue-50)] hover:text-[var(--hc-blue-600)] transition-all group text-[var(--hc-text)]">
                <span className="font-semibold text-[13px]">Real-time Monitoring</span>
                <Activity className="w-5 h-5 text-[var(--hc-text-secondary)] group-hover:text-[var(--hc-blue-600)]" />
              </button>
              <button className="flex items-center justify-between p-3.5 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-blue-600)] hover:bg-[var(--hc-blue-50)] hover:text-[var(--hc-blue-600)] transition-all group text-[var(--hc-text)]">
                <span className="font-semibold text-[13px]">Inventory Audit</span>
                <Package className="w-5 h-5 text-[var(--hc-text-secondary)] group-hover:text-[var(--hc-blue-600)]" />
              </button>
              <button className="flex items-center justify-between p-3.5 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-blue-600)] hover:bg-[var(--hc-blue-50)] hover:text-[var(--hc-blue-600)] transition-all group text-[var(--hc-text)]">
                <span className="font-semibold text-[13px]">Audit Log Export</span>
                <FileText className="w-5 h-5 text-[var(--hc-text-secondary)] group-hover:text-[var(--hc-blue-600)]" />
              </button>
            </div>
          </section>

          {/* Module Summaries (Inventory) */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface-soft)] p-[24px] shadow-[var(--shadow-card)] flex-1">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-[var(--hc-text)]">
              Critical Inventory
            </h3>
            <ul className="space-y-5">
              <li className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[var(--hc-text)] text-[13px]">Surgical Masks</span>
                  <span className="text-[var(--hc-danger)] font-bold text-[13px]">12%</span>
                </div>
                <div className="w-full bg-[var(--hc-border)] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[var(--hc-danger)] h-full w-[12%]" />
                </div>
              </li>
              <li className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[var(--hc-text)] text-[13px]">Oxygen Cylinders</span>
                  <span className="text-[var(--hc-text)] font-bold text-[13px]">45%</span>
                </div>
                <div className="w-full bg-[var(--hc-border)] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[var(--hc-blue-500)] h-full w-[45%]" />
                </div>
              </li>
              <li className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-[var(--hc-text)] text-[13px]">Saline Solution</span>
                  <span className="text-[var(--hc-text)] font-bold text-[13px]">88%</span>
                </div>
                <div className="w-full bg-[var(--hc-border)] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[var(--hc-blue-500)] h-full w-[88%]" />
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Asymmetric Bottom Section: Recent Alerts */}
      <section className="mt-6 rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-[24px] shadow-[var(--shadow-card)]">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/3">
            <h3 className="text-lg font-bold text-[var(--hc-text)] mb-3">
              Security & Logs
            </h3>
            <p className="text-[13px] text-[var(--hc-text-secondary)] leading-relaxed max-w-sm">
              Automated monitoring of all system interactions. Discrepancies are
              flagged and held for manual administrator review within 24 hours.
            </p>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 gap-3 w-full">
            <div className="border border-[var(--hc-danger-bg)] rounded-[var(--radius-lg)] bg-[#FFF5F5] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-[var(--hc-danger)] uppercase tracking-wider bg-white px-2 py-1 rounded shadow-sm border border-[var(--hc-danger-bg)]">
                  08:42
                </span>
                <span className="text-[13px] font-medium text-[var(--hc-text)]">
                  Unauthorized access attempt blocked - Node IP 192.168.1.42
                </span>
              </div>
              <span className="hc-badge bg-[var(--hc-danger)] text-white shadow-sm border-none">
                High Alert
              </span>
            </div>
            <div className="border border-[var(--hc-warning-bg)] rounded-[var(--radius-lg)] bg-[#FFFBEB] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider bg-white px-2 py-1 rounded shadow-sm border border-[#FEF3C7]">
                  08:15
                </span>
                <span className="text-[13px] font-medium text-[var(--hc-text)]">
                  Inventory depletion: Type B- Blood Units below threshold
                </span>
              </div>
              <span className="hc-badge bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]">
                System
              </span>
            </div>
            <div className="border border-[var(--hc-success-bg)] rounded-[var(--radius-lg)] bg-[#F0FDF4] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-[var(--hc-success)] uppercase tracking-wider bg-white px-2 py-1 rounded shadow-sm border border-[var(--hc-success-bg)]">
                  07:55
                </span>
                <span className="text-[13px] font-medium text-[var(--hc-text)]">
                  Server maintenance completed successfully on Primary Cluster
                </span>
              </div>
              <span className="hc-badge bg-[var(--hc-success-bg)] text-[var(--hc-success)] border-[var(--hc-success-bg)]">
                Success
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
