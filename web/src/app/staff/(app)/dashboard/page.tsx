"use client";

import { useState, useMemo } from "react";
import { Activity, AlertTriangle, Clock, FlaskConical, Filter, Download, Stethoscope } from "lucide-react";
import { HcIcon } from "@/components/ui/hc-icon";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";

const MOCK_PATIENTS = [
  { id: "PX-2024-8812", name: "Elena Rodriguez", initials: "ER", status: "Critical", ward: "ER", bp: "145/92", hr: 98, o2: 91, lastCheck: "13:45:00", nurse: "Nurse S. Miller", avatarColor: "bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)]" },
  { id: "PX-2024-8740", name: "James T. Kendrick", initials: "JK", status: "Stable", ward: "Ward 4-A", bp: "120/80", hr: 72, o2: 98, lastCheck: "12:10:22", nurse: "Nurse R. Chen", avatarColor: "bg-[#ECFCCB] text-[#4D7C0F]" },
  { id: "PX-2024-9003", name: "Linda Wu", initials: "LW", status: "Observation", ward: "Observation", bp: "132/85", hr: 84, o2: 96, lastCheck: "14:00:15", nurse: "Nurse S. Miller", avatarColor: "bg-[var(--hc-info-bg)] text-[var(--hc-info)]" },
  { id: "PX-2024-8119", name: "Marcus V. Aurelius", initials: "MA", status: "Critical", ward: "ICU East", bp: "90/60", hr: 110, o2: 94, lastCheck: "13:58:10", nurse: "Nurse R. Chen", avatarColor: "bg-[var(--hc-purple-bg)] text-[var(--hc-purple)]" },
];

export default function DoctorDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [wardFilter, setWardFilter] = useState("All Wards");

  const filteredPatients = useMemo(() => {
    return MOCK_PATIENTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
      const matchesWard = wardFilter === "All Wards" || p.ward === wardFilter;
      return matchesSearch && matchesStatus && matchesWard;
    });
  }, [searchQuery, statusFilter, wardFilter]);

  return (
    <div className="p-8">
      {/* Header Section */}
      <PageHeader 
        title="Doctor Dashboard"
        description="ID: HMS-PHYS-9942 • LAST REFRESH: 14:02:11"
        action={
          <button className="flex items-center gap-2 text-sm font-semibold text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] transition-colors">
            <HcIcon name="refresh" className="text-lg" />
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="hc-kpi-grid">
        <KpiCard
          label="Active Rounds"
          value="12"
          helper="↑ 2 from previous shift"
          icon={Stethoscope}
          tone="blue"
        />
        <KpiCard
          label="Critical Alerts"
          value="03"
          helper="Requires immediate action"
          icon={AlertTriangle}
          tone="red"
        />
        <KpiCard
          label="Wait Time Avg"
          value="18m"
          helper="Unit efficiency: 94%"
          icon={Clock}
          tone="teal"
        />
        <KpiCard
          label="Pending Lab Reports"
          value="24"
          helper="5 expiring soon"
          icon={FlaskConical}
          tone="purple"
        />
      </div>

      {/* Data Panel */}
      <DataPanel
        className="mb-8"
        filters={
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hc-search">
                <HcIcon name="search" className="text-[var(--hc-text-placeholder)]" />
                <input
                  aria-label="Search patients by name or ID"
                  placeholder="Search by name or ID..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                aria-label="Filter patients by status"
                className="hc-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="Critical">Critical</option>
                <option value="Stable">Stable</option>
                <option value="Observation">Observation</option>
              </select>
              <select
                aria-label="Filter patients by ward"
                className="hc-select"
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
              >
                <option value="All Wards">All Wards</option>
                <option value="Ward 4-A">Ward 4-A</option>
                <option value="ICU East">ICU East</option>
                <option value="Cardiology">Cardiology</option>
                <option value="ER">ER</option>
                <option value="Observation">Observation</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 h-10 border border-[var(--hc-border)] rounded-[var(--radius-md)] text-[13px] font-semibold text-[var(--hc-text)] hover:bg-[var(--hc-surface-soft)] transition-colors bg-[var(--hc-surface)] shadow-[var(--shadow-xs)]">
                <Filter className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                More Filters
              </button>
              <button className="flex items-center gap-2 px-4 h-10 border border-[var(--hc-border)] rounded-[var(--radius-md)] text-[13px] font-semibold text-[var(--hc-text)] hover:bg-[var(--hc-surface-soft)] transition-colors bg-[var(--hc-surface)] shadow-[var(--shadow-xs)]">
                <Download className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                Export
              </button>
            </div>
          </div>
        }
        footer={
          <>
            <span className="text-[13px] font-medium text-[var(--hc-text-secondary)]">Showing {filteredPatients.length > 0 ? 1 : 0}-{filteredPatients.length} of {filteredPatients.length} patients</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--hc-border)] flex items-center justify-center text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] disabled:opacity-50" disabled>
                  {"<"}
                </button>
                <button className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--hc-blue-600)] bg-[var(--hc-blue-600)] flex items-center justify-center text-white font-medium text-sm">
                  1
                </button>
                <button className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--hc-border)] flex items-center justify-center text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] disabled:opacity-50" disabled>
                  {">"}
                </button>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[13px] text-[var(--hc-text-secondary)]">Show</span>
                <select className="border border-[var(--hc-border)] rounded-[var(--radius-sm)] h-8 px-2 text-[13px] text-[var(--hc-text)] font-medium bg-[var(--hc-surface)] outline-none">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="hc-table w-full text-left">
            <thead>
              <tr>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Patient / Case ID</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Priority</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Vital Stats</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Last Check</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Attending Nurse</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hc-border-soft)]">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="group transition-colors hover:bg-[var(--hc-blue-50)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${patient.avatarColor}`}>
                          {patient.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--hc-text)] text-[13px]">{patient.name}</div>
                          <div className="text-[11px] text-[var(--hc-text-secondary)] mt-0.5">{patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`hc-badge ${
                        patient.status === 'Critical' ? 'bg-[var(--hc-critical-bg)] text-[var(--hc-critical)]' :
                        patient.status === 'Stable' ? 'bg-[var(--hc-success-bg)] text-[var(--hc-success)]' :
                        'bg-[var(--hc-info-bg)] text-[var(--hc-info)]'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <span><span className="text-[10px] text-[var(--hc-text-placeholder)] mr-1 uppercase font-bold">BP</span><span className={`font-mono text-[13px] ${patient.bp.startsWith('90/') ? 'text-[var(--hc-danger)]' : ''}`}>{patient.bp}</span></span>
                        <span><span className="text-[10px] text-[var(--hc-text-placeholder)] mr-1 uppercase font-bold">HR</span><span className="font-mono text-[13px]">{patient.hr}</span></span>
                        <span><span className="text-[10px] text-[var(--hc-text-placeholder)] mr-1 uppercase font-bold">O₂</span><span className={`font-mono text-[13px] ${patient.o2 < 95 ? 'text-[var(--hc-danger)]' : 'text-[var(--hc-success)]'}`}>{patient.o2}%</span></span>
                      </div>
                    </td>
                    <td className="p-4 text-[13px] text-[var(--hc-text)] font-mono">{patient.lastCheck}</td>
                    <td className="p-4 text-[13px] text-[var(--hc-text)] font-medium">{patient.nurse}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="hc-icon-btn text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-[var(--hc-surface-soft)] p-1.5 rounded-md transition-colors"><HcIcon name="visibility" className="text-[18px]" /></button>
                        <button className="hc-icon-btn text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-[var(--hc-surface-soft)] p-1.5 rounded-md transition-colors"><HcIcon name="more_vert" className="text-[18px]" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[13px] font-medium text-[var(--hc-text-secondary)]">
                    No patients match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataPanel>

      {/* Dashboard Secondary Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-[24px] shadow-[var(--shadow-card)] flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--hc-surface-soft)] flex items-center justify-center text-[var(--hc-text-secondary)]">
                <HcIcon name="science" className="text-[20px]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--hc-text)] leading-tight">Laboratory Queue Trends</h2>
                <p className="text-sm text-[var(--hc-text-secondary)] mt-0.5">Next 12 hours forecast</p>
              </div>
            </div>
            <select className="border border-[var(--hc-border)] rounded-md px-3 h-9 text-sm text-[var(--hc-text)] bg-[var(--hc-surface)] font-medium outline-none">
              <option>Next 12 Hours</option>
              <option>Next 24 Hours</option>
            </select>
          </div>
          <div className="bg-[var(--hc-surface-soft)] rounded-[var(--radius-lg)] h-[220px] w-full flex items-end px-8 pb-8 pt-8 gap-4 border border-[var(--hc-border-soft)]">
            {/* CSS-Based Bar Chart */}
            <div className="flex-1 bg-[var(--hc-purple-300)] rounded-t-sm h-[30%] transition-all hover:bg-[var(--hc-purple-600)] relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">12</div>
            </div>
            <div className="flex-1 bg-[var(--hc-purple-400)] rounded-t-sm h-[45%] transition-all hover:bg-[var(--hc-purple-600)] relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">18</div>
            </div>
            <div className="flex-1 bg-[var(--hc-purple-500)] rounded-t-sm h-[75%] transition-all hover:bg-[var(--hc-purple-600)] relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">32</div>
            </div>
            <div className="flex-1 bg-[var(--hc-purple-600)] rounded-t-sm h-[95%] transition-all hover:bg-[var(--hc-purple-700)] relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">45</div>
            </div>
            <div className="flex-1 bg-[var(--hc-purple-500)] rounded-t-sm h-[60%] transition-all hover:bg-[var(--hc-purple-600)] relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">28</div>
            </div>
            <div className="flex-1 bg-[var(--hc-purple-400)] rounded-t-sm h-[50%] transition-all hover:bg-[var(--hc-purple-600)] relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">22</div>
            </div>
            <div className="flex-1 bg-[var(--hc-purple-300)] rounded-t-sm h-[20%] transition-all hover:bg-[var(--hc-purple-600)] relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded">8</div>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-[24px] shadow-[var(--shadow-card)] flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--hc-surface-soft)] flex items-center justify-center text-[var(--hc-text-secondary)]">
                <HcIcon name="groups" className="text-[20px]" />
             </div>
             <h2 className="text-lg font-bold text-[var(--hc-text)]">Staffing Overview</h2>
          </div>
          
          <div className="flex flex-col gap-0 flex-1">
            <div className="flex items-center justify-between py-4 border-b border-[var(--hc-border-soft)]">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[var(--hc-success-bg)] text-[var(--hc-success)] flex items-center justify-center">
                    <HcIcon name="favorite" className="text-[16px]" />
                 </div>
                 <span className="text-[13px] font-semibold text-[var(--hc-text)]">Cardiology Team</span>
              </div>
              <span className="hc-badge bg-[var(--hc-success-bg)] text-[var(--hc-success)]">ON-CALL</span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-[var(--hc-border-soft)]">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[var(--hc-purple-bg)] text-[var(--hc-purple)] flex items-center justify-center">
                    <HcIcon name="stethoscope" className="text-[16px]" />
                 </div>
                 <span className="text-[13px] font-semibold text-[var(--hc-text)]">ER Resident Pool</span>
              </div>
              <span className="hc-badge bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] border border-[var(--hc-danger-bg)]">STRETCHED (82%)</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                    <HcIcon name="content_cut" className="text-[16px]" />
                 </div>
                 <span className="text-[13px] font-semibold text-[var(--hc-text)]">Surgery Prep Unit</span>
              </div>
              <span className="hc-badge bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)]">OPTIMAL</span>
            </div>
          </div>
          
          <button className="mt-auto flex items-center justify-center gap-2 w-full h-[42px] border border-[var(--hc-border)] bg-[var(--hc-surface)] text-[var(--hc-blue-600)] rounded-[var(--radius-md)] text-sm font-bold hover:bg-[var(--hc-blue-50)] hover:border-[var(--hc-blue-600)] transition-all shadow-[var(--shadow-xs)]">
            <HcIcon name="manage_accounts" className="text-[18px]" />
            Reassign Resources
          </button>
        </section>
      </div>
    </div>
  );
}

