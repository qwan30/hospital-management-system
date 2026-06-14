"use client";

import { PageHeader } from "@/components/ui/page-header";
import { DataPanel } from "@/components/ui/data-panel";

import { Bolt } from "lucide-react";

export default function SlotGenerationPage() {
  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Generate Service Slots"
        description="Automated mass-generation of clinical appointment slots based on predefined room templates and staff availability matrix. Review the impact assessment before final execution."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <DataPanel title="01. Parameters">
            <form className="space-y-6 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field: Service Provider */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-hc-on-surface">Primary Practitioner</label>
                  <select className="w-full border border-hc-outline-variant/50 bg-hc-surface px-3 py-2.5 text-sm text-hc-on-surface rounded-md focus:outline-none focus:ring-1 focus:ring-hc-primary">
                    <option>Select Practitioner...</option>
                    <option>Dr. Elena Rodriguez (Cardiology)</option>
                    <option>Dr. Marcus Thorne (Neurology)</option>
                    <option>Dr. Sarah Jenkins (General Practice)</option>
                  </select>
                </div>
                {/* Field: Room Template */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-hc-on-surface">Configuration Template</label>
                  <select className="w-full border border-hc-outline-variant/50 bg-hc-surface px-3 py-2.5 text-sm text-hc-on-surface rounded-md focus:outline-none focus:ring-1 focus:ring-hc-primary">
                    <option>Select Template...</option>
                    <option>STD_OP_30_MIN (Standard Outpatient)</option>
                    <option>EXT_CONSULT_60 (Extended Consultation)</option>
                    <option>PROC_SHORT_15 (Minor Procedure)</option>
                  </select>
                </div>
                {/* Field: Date Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-hc-on-surface">Start Date</label>
                  <input className="w-full border border-hc-outline-variant/50 bg-hc-surface px-3 py-2 text-sm text-hc-on-surface rounded-md focus:outline-none focus:ring-1 focus:ring-hc-primary" type="date" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-hc-on-surface">End Date</label>
                  <input className="w-full border border-hc-outline-variant/50 bg-hc-surface px-3 py-2 text-sm text-hc-on-surface rounded-md focus:outline-none focus:ring-1 focus:ring-hc-primary" type="date" />
                </div>
              </div>
              
              {/* Checkboxes / Toggles */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-hc-outline text-hc-primary focus:ring-hc-primary" />
                  <span className="text-sm text-hc-on-surface">Override existing empty slots</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-hc-outline text-hc-primary focus:ring-hc-primary" defaultChecked />
                  <span className="text-sm text-hc-on-surface">Exclude national bank holidays</span>
                </label>
              </div>
            </form>
          </DataPanel>
        </div>

        {/* Right: Impact & Summary */}
        <div className="lg:col-span-1">
          <DataPanel title="02. Operational Impact" className="bg-hc-surface-container-highest border-0">
            <div className="p-2 space-y-6">
              <div className="p-6 bg-hc-surface rounded-lg border border-hc-outline-variant/30 text-center">
                <div className="text-5xl font-light tracking-tight text-hc-primary">448</div>
                <div className="text-xs font-medium uppercase tracking-widest text-hc-on-surface-variant mt-2">Est. Slots Created</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-hc-outline-variant/30 pb-2">
                  <span className="text-xs font-medium text-hc-on-surface-variant">Concurrency Load</span>
                  <span className="text-sm font-semibold text-hc-on-surface">12.5%</span>
                </div>
                <div className="flex justify-between items-center border-b border-hc-outline-variant/30 pb-2">
                  <span className="text-xs font-medium text-hc-on-surface-variant">Room Utilization</span>
                  <span className="text-sm font-semibold text-hc-on-surface">88.0%</span>
                </div>
                <div className="flex justify-between items-center border-b border-hc-outline-variant/30 pb-2">
                  <span className="text-xs font-medium text-hc-on-surface-variant">System Latency Est.</span>
                  <span className="text-sm font-semibold text-hc-on-surface">1.2s</span>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  className="w-full bg-hc-primary hover:bg-hc-primary/90 text-white py-3 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Bolt className="w-4 h-4" />
                  EXECUTE GENERATION
                </button>
                <p className="text-[10px] text-hc-on-surface-variant text-center mt-3 uppercase tracking-widest">Irreversible database action</p>
              </div>
            </div>
          </DataPanel>
        </div>
      </div>

      {/* Bottom: Preview Table */}
      <DataPanel 
        title="03. Sampling Preview"
        action={
          <button className="px-4 py-1.5 border border-hc-outline-variant text-hc-on-surface rounded text-xs font-semibold hover:bg-hc-surface-container transition-colors">
            RE-CALCULATE PREVIEW
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-hc-surface-container-lowest/50 border-b border-hc-outline-variant/30 text-xs text-hc-on-surface-variant">
                <th className="px-4 py-3 font-medium">Sequence</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Room ID</th>
                <th className="px-4 py-3 font-medium">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hc-outline-variant/20">
              {[
                { seq: "#SLT-2023-001", time: "Oct 12, 2023 • 08:00 AM", dur: "30 MIN", room: "CONSULT-RM-402", status: "VALID", valid: true },
                { seq: "#SLT-2023-002", time: "Oct 12, 2023 • 08:30 AM", dur: "30 MIN", room: "CONSULT-RM-402", status: "VALID", valid: true },
                { seq: "#SLT-2023-003", time: "Oct 12, 2023 • 09:00 AM", dur: "30 MIN", room: "CONSULT-RM-402", status: "VALID", valid: true },
                { seq: "#SLT-2023-004", time: "Oct 12, 2023 • 09:30 AM", dur: "30 MIN", room: "CONSULT-RM-402", status: "CONFLICT_WARN", valid: false },
                { seq: "#SLT-2023-005", time: "Oct 12, 2023 • 10:00 AM", dur: "30 MIN", room: "CONSULT-RM-402", status: "VALID", valid: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-hc-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-hc-on-surface">{row.seq}</td>
                  <td className="px-4 py-3 text-sm text-hc-on-surface-variant">{row.time}</td>
                  <td className="px-4 py-3 text-sm text-hc-on-surface-variant">{row.dur}</td>
                  <td className="px-4 py-3 text-sm text-hc-on-surface-variant">{row.room}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${
                      row.valid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
      
      <footer className="pt-4 flex justify-between items-center text-hc-on-surface-variant text-[10px] font-bold uppercase tracking-widest border-t border-hc-outline-variant/30">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> SERVER_STATUS: OPTIMAL</span>
          <span>QUEUE_DEPTH: 0</span>
        </div>
        <div>LAST_RUN: 2023-10-11 14:22:01 UTC</div>
      </footer>
    </main>
  );
}
