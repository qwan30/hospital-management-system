"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  HelpCircle,
  Laptop,
  Lock,
  Send,
  Server,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

const SUPPORT_QUEUES = [
  { title: "Clinical Application", icon: Laptop, count: "4 open", detail: "Median response 8m", tone: "blue" as const },
  { title: "Access & Roles", icon: Lock, count: "2 open", detail: "Median response 12m", tone: "teal" as const },
  { title: "Infrastructure", icon: Server, count: "1 open", detail: "On-call active", tone: "amber" as const },
];

export default function StaffSupportPage() {
  const [category, setCategory] = useState("Clinical application");
  const [stationId, setStationId] = useState("");
  const [description, setDescription] = useState("");

  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="STAFF SUPPORT"
        title="Operations Help Desk"
        description="Route workflow issues, access requests, and production support needs to the correct operations queue."
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {SUPPORT_QUEUES.map((q) => (
          <KpiCard
            key={q.title}
            label={q.title}
            value={q.count}
            helper={q.detail}
            icon={q.icon}
            tone={q.tone}
          />
        ))}
      </section>

      {/* Content Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* Support Form */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-blue-50 text-[var(--hc-primary)]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[var(--hc-text)]">Open Request</h2>
          </div>
          <div className="p-6">
            <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] p-4 text-sm font-medium text-[var(--hc-text-secondary)]" role="note">
              Support ticket submission is read-only in this release because no support-ticket API is available.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="station-id" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Station or Staff ID</label>
                <input
                  id="station-id"
                  type="text"
                  placeholder="e.g. WS-4C-001"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="hc-input w-full"
                />
              </div>
              <div>
                <label htmlFor="support-category" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Support Category</label>
                <select
                  id="support-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="hc-input w-full"
                >
                  <option>Clinical application</option>
                  <option>Access and roles</option>
                  <option>Infrastructure</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="support-desc" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Issue Description</label>
                <textarea
                  id="support-desc"
                  className="hc-input w-full min-h-[120px] resize-y"
                  placeholder="Describe the issue or request in detail…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-5 hc-button-primary flex items-center gap-2 disabled:opacity-60"
              disabled
              title="Support ticket submission is not exposed by the current backend API."
            >
              <Send className="w-4 h-4" /> Request submission unavailable
            </button>
          </div>
        </div>

        {/* Critical Escalation */}
        <div className="bg-slate-900 rounded-[var(--radius-xl)] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Critical Escalation</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xl font-light text-slate-200 leading-relaxed">
                For patient-safety blocking issues, page the active clinical command desk.
              </p>
              <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>24/7 emergency support available</span>
              </div>
            </div>
            <Link
              href="/staff/queue"
              className="mt-6 inline-flex items-center justify-center gap-2 h-12 border border-white/30 rounded-[var(--radius-md)] px-6 text-sm font-bold text-white hover:bg-white hover:text-slate-900 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Open Queue Board
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
