import Image from "next/image";
import Link from "next/link";

export default function DoctorDashboardPage() {
  return (
    <>
      <main>

<div className="p-8">
{/* Header Section */}
<div className="mb-8">
<h1 className="text-3xl font-light tracking-tight text-on-surface">Doctor Dashboard</h1>
<p className="text-sm text-on-surface-variant font-mono mt-1">ID: HMS-PHYS-9942 // LAST REFRESH: 14:02:11</p>
</div>
{/* KPI Cards - Monolithic Data Blocks */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-8">
<div className="bg-surface-container-low p-6 border-r border-surface-container">
<span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Active Rounds</span>
<div className="text-4xl font-light mt-2 text-primary-container">12</div>
<div className="mt-4 text-[10px] mono text-on-surface-variant">+2 FROM PREV. SHIFT</div>
</div>
<div className="bg-surface-container-low p-6 border-r border-surface-container">
<span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Critical Alerts</span>
<div className="text-4xl font-light mt-2 text-error">03</div>
<div className="mt-4 text-[10px] mono text-error">REQUIRES IMMEDIATE ACTION</div>
</div>
<div className="bg-surface-container-low p-6 border-r border-surface-container">
<span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Wait Time Avg</span>
<div className="text-4xl font-light mt-2">18<span className="text-xl">min</span></div>
<div className="mt-4 text-[10px] mono text-on-surface-variant">UNIT EFFICIENCY: 94%</div>
</div>
<div className="bg-surface-container-low p-6">
<span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Pending Lab Reports</span>
<div className="text-4xl font-light mt-2">24</div>
<div className="mt-4 text-[10px] mono text-on-surface-variant">5 EXPIRING SOON</div>
</div>
</div>
{/* Sticky Filters & Table Header */}
<div className="sticky top-[48px] bg-surface z-40 py-4 border-b-2 border-primary-container mb-1">
<div className="flex items-center justify-between">
<div className="flex gap-4 items-center">
<div className="flex items-center bg-surface-container-low px-3 h-10 border-b-2 border-outline focus-within:border-primary">
<span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
<input className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder-on-surface-variant" placeholder="Search by name or ID..." type="text"/>
</div>
<select className="bg-surface-container-low border-none border-b-2 border-outline focus:ring-0 h-10 text-sm px-3 w-40 font-semibold">
<option>All Status</option>
<option>Critical</option>
<option>Stable</option>
<option>Discharging</option>
</select>
<select className="bg-surface-container-low border-none border-b-2 border-outline focus:ring-0 h-10 text-sm px-3 w-40 font-semibold">
<option>Ward 4-A</option>
<option>ICU East</option>
<option>Cardiology</option>
</select>
</div>
<div className="flex gap-2">
<button className="bg-surface-container-high px-4 h-10 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm">filter_list</span>
                            Advanced Filter
                        </button>
<button className="bg-surface-container-high px-4 h-10 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm">download</span>
                            Export
                        </button>
</div>
</div>
</div>
{/* High Density Table */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low">
<th className="p-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Patient / Case ID</th>
<th className="p-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Priority</th>
<th className="p-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Vital Stats</th>
<th className="p-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Last Check</th>
<th className="p-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Attending Nurse</th>
<th className="p-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{/* Patient Row 1 */}
<tr className="hms-row transition-colors group">
<td className="p-4">
<div className="font-semibold text-sm">Elena Rodriguez</div>
<div className="mono text-[11px] text-on-surface-variant">PX-2024-8812</div>
</td>
<td className="p-4">
<span className="bg-error-container text-on-error-container px-2 py-0.5 text-[10px] font-bold uppercase">Critical</span>
</td>
<td className="p-4">
<div className="flex gap-4">
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">BP</span><span className="mono">145/92</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">HR</span><span className="mono">98</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">O2</span><span className="mono text-error">91%</span></div>
</div>
</td>
<td className="p-4 mono text-sm">13:45:00</td>
<td className="p-4 text-sm font-medium">Nurse S. Miller</td>
<td className="p-4">
<div className="flex gap-2">
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">edit_note</span>
</button>
</div>
</td>
</tr>
{/* Patient Row 2 */}
<tr className="hms-row transition-colors group">
<td className="p-4">
<div className="font-semibold text-sm">James T. Kendrick</div>
<div className="mono text-[11px] text-on-surface-variant">PX-2024-8740</div>
</td>
<td className="p-4">
<span className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 text-[10px] font-bold uppercase">Stable</span>
</td>
<td className="p-4">
<div className="flex gap-4">
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">BP</span><span className="mono">120/80</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">HR</span><span className="mono">72</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">O2</span><span className="mono">98%</span></div>
</div>
</td>
<td className="p-4 mono text-sm">12:10:22</td>
<td className="p-4 text-sm font-medium">Nurse R. Chen</td>
<td className="p-4">
<div className="flex gap-2">
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">edit_note</span>
</button>
</div>
</td>
</tr>
{/* Patient Row 3 */}
<tr className="hms-row transition-colors group">
<td className="p-4">
<div className="font-semibold text-sm">Linda Wu</div>
<div className="mono text-[11px] text-on-surface-variant">PX-2024-9003</div>
</td>
<td className="p-4">
<span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase">Observation</span>
</td>
<td className="p-4">
<div className="flex gap-4">
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">BP</span><span className="mono">132/85</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">HR</span><span className="mono">84</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">O2</span><span className="mono">96%</span></div>
</div>
</td>
<td className="p-4 mono text-sm">14:00:15</td>
<td className="p-4 text-sm font-medium">Nurse S. Miller</td>
<td className="p-4">
<div className="flex gap-2">
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">edit_note</span>
</button>
</div>
</td>
</tr>
{/* Patient Row 4 */}
<tr className="hms-row transition-colors group">
<td className="p-4">
<div className="font-semibold text-sm">Marcus V. Aurelius</div>
<div className="mono text-[11px] text-on-surface-variant">PX-2024-8119</div>
</td>
<td className="p-4">
<span className="bg-error-container text-on-error-container px-2 py-0.5 text-[10px] font-bold uppercase">Critical</span>
</td>
<td className="p-4">
<div className="flex gap-4">
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">BP</span><span className="mono text-error">90/60</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">HR</span><span className="mono">110</span></div>
<div className="text-sm"><span className="text-[10px] text-on-surface-variant mr-1">O2</span><span className="mono">94%</span></div>
</div>
</td>
<td className="p-4 mono text-sm">13:58:10</td>
<td className="p-4 text-sm font-medium">Nurse R. Chen</td>
<td className="p-4">
<div className="flex gap-2">
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-[18px]">edit_note</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Dashboard Bento Grid - Secondary Insights */}
<div className="grid grid-cols-12 gap-8 mt-12">
<div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8">
<div className="flex justify-between items-end mb-8">
<div>
<h3 className="text-xl font-light">Laboratory Queue Trends</h3>
<p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mt-1">Next 12 Hours Forecast</p>
</div>
<div className="flex gap-1">
<div className="w-2 h-8 bg-primary-container"></div>
<div className="w-2 h-12 bg-primary"></div>
<div className="w-2 h-16 bg-primary-container"></div>
<div className="w-2 h-10 bg-primary"></div>
<div className="w-2 h-14 bg-primary-container"></div>
</div>
</div>
<div className="h-48 bg-surface-container-highest flex items-center justify-center relative">
{/* Visual placeholder for a data chart */}
<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_#1c1b1b_1px,_transparent_0)] bg-[size:24px_24px]"></div>
<div className="text-[10px] mono text-on-surface-variant font-bold">DATA_STREAM_VISUALIZATION_LAYER</div>
</div>
</div>
<div className="col-span-12 lg:col-span-4 bg-surface-container-low p-8 flex flex-col">
<h3 className="text-xl font-light mb-6">Staffing Overview</h3>
<div className="space-y-6 flex-1">
<div className="flex justify-between items-center">
<span className="text-sm font-medium">Cardiology Team</span>
<span className="mono text-xs bg-surface-container-highest px-2 py-1">ON-CALL</span>
</div>
<div className="flex justify-between items-center">
<span className="text-sm font-medium">ER Resident Pool</span>
<span className="mono text-xs text-error font-bold">STRETCHED (82%)</span>
</div>
<div className="flex justify-between items-center">
<span className="text-sm font-medium">Surgery Prep Unit</span>
<span className="mono text-xs text-primary font-bold">OPTIMAL</span>
</div>
</div>
<button className="w-full mt-8 border border-outline px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-surface-container-highest transition-colors">
                        Reassign Resources
                    </button>
</div>
</div>
</div>

</main>
    </>
  );
}
