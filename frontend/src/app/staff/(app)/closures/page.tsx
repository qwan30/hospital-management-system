import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

const CLOSURES = [
  {
    id: 1,
    title: "National Health Observance Day",
    description: "All clinics and laboratories closed. Emergency ER services remain at 50% capacity.",
    date: "Oct 11",
    duration: "Full Day",
    location: "Campus-wide",
    type: "holiday" as const,
  },
  {
    id: 2,
    title: "System Infrastructure Upgrade",
    description: "Electronic Medical Records (EMR) system offline for periodic DB migration.",
    date: "Oct 17",
    duration: "22:00 to 04:00",
    location: "Radiology Dept",
    type: "maintenance" as const,
  },
  {
    id: 3,
    title: "Staff Professional Development",
    description: "Internal training session. OPD closed for the afternoon session.",
    date: "Oct 02",
    duration: "13:00 – 18:00",
    location: "OPD Unit B",
    type: "maintenance" as const,
  },
];

const CALENDAR_DAYS = [
  { day: 24, prev: true }, { day: 25, prev: true }, { day: 26, prev: true }, { day: 27, prev: true }, { day: 28, prev: true }, { day: 29, prev: true }, { day: 30, prev: true },
  { day: 1 }, { day: 2, marker: "maintenance" as const }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 },
  { day: 8 }, { day: 9 }, { day: 10 }, { day: 11, marker: "holiday" as const, label: "HOLIDAY" }, { day: 12 }, { day: 13 }, { day: 14 },
  { day: 15 }, { day: 16 }, { day: 17, marker: "maintenance" as const }, { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 },
  { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 },
];

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SpecialClosuresPage() {
  return (
    <main className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="OPERATIONS"
        title="Special Closures"
        description="Administration & lab suspension schedules."
        action={
          <button type="button" className="hc-button-primary flex items-center gap-2" aria-label="CREATE_NEW_CLOSURE">
            <Plus className="w-4 h-4" /> Create Closure
          </button>
        }
      />

      {/* KPI Cards */}
      <section className="mt-8 hc-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <KpiCard label="Total Entries" value="8" helper="Active & upcoming" icon={Calendar} tone="blue" />
        <KpiCard label="Next Closure" value="Oct 11" helper="National Health Observance" icon={Clock} tone="amber" />
        <KpiCard label="Affected Sites" value="3" helper="Departments impacted" icon={MapPin} tone="teal" />
      </section>

      {/* Calendar + Closure List */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        {/* Calendar */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-[var(--hc-text)]">Closure Calendar</h2>
            <div className="flex items-center gap-1">
              <button type="button" className="p-1.5 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-3 text-xs font-bold text-[var(--hc-text)] uppercase">October 2023</span>
              <button type="button" className="p-1.5 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-[var(--radius-md)] overflow-hidden">
            {CALENDAR_DAYS.map((cell, i) => (
              <div
                key={i}
                className={`aspect-square p-2 flex flex-col justify-between text-xs font-medium transition-colors ${
                  cell.marker === "holiday"
                    ? "bg-[var(--hc-primary)] text-white"
                    : "bg-white hover:bg-slate-50"
                } ${cell.prev ? "text-slate-300" : "text-[var(--hc-text)]"}`}
              >
                <span>{cell.day}</span>
                {cell.marker === "maintenance" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--hc-primary)]" />
                )}
                {cell.label && (
                  <span className="text-[7px] font-bold uppercase tracking-wider">{cell.label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--hc-primary)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maintenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Holiday</span>
            </div>
          </div>
        </div>

        {/* Closure List */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-[var(--hc-border-soft)]">
            <h2 className="text-sm font-bold text-[var(--hc-text)]">Active & Upcoming Schedule</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
              {CLOSURES.length} Entries
            </span>
          </div>

          <div className="divide-y divide-[var(--hc-border-soft)]">
            {CLOSURES.map((closure) => (
              <div key={closure.id} className="group p-6 flex items-start justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-4">
                  {/* Date Indicator */}
                  <div className={`w-14 h-14 shrink-0 rounded-[var(--radius-md)] flex flex-col items-center justify-center text-sm ${
                    closure.type === "holiday"
                      ? "bg-[var(--hc-primary)] text-white"
                      : "bg-[var(--hc-blue-50)] text-[var(--hc-primary)]"
                  }`}>
                    <span className="text-[9px] font-bold uppercase">{closure.date.split(" ")[0]}</span>
                    <span className="text-lg font-black leading-none">{closure.date.split(" ")[1]}</span>
                  </div>

                  {/* Details */}
                  <div>
                    <h3 className="text-sm font-bold text-[var(--hc-text)] mb-1">{closure.title}</h3>
                    <p className="text-xs text-slate-500 mb-2 max-w-md">{closure.description}</p>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <Clock className="w-3 h-3" /> {closure.duration}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <MapPin className="w-3 h-3" /> {closure.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (visible on hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" className="p-2 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors text-slate-400 hover:text-[var(--hc-primary)]">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--hc-danger-bg)] transition-colors text-slate-400 hover:text-[var(--hc-danger)]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
