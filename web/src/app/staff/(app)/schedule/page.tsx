import Image from "next/image";
import Link from "next/link";

export default function ScheduleTemplatesPage() {
  return (
    <>
      <main>

{/* Content Area */}
<section className="flex-grow p-8 overflow-y-auto">
<div className="mb-12">
<span className="text-xs font-bold text-primary uppercase tracking-[0.2em] block mb-2">SYSTEM_ADMINISTRATION</span>
<h1 className="text-5xl font-light tracking-tight text-on-surface">Schedule Templates</h1>
</div>
{/* Bento Layout for Templates */}
<div className="grid grid-cols-12 gap-8">
{/* Summary Monoliths */}
<div className="col-span-12 md:col-span-4 bg-surface-container-highest p-8 flex flex-col justify-between aspect-square md:aspect-auto h-48">
<span className="text-[10px] font-bold text-on-surface tracking-widest uppercase">ACTIVE_TEMPLATES</span>
<div className="text-6xl font-light text-on-surface">14</div>
</div>
<div className="col-span-12 md:col-span-4 bg-surface-container-low p-8 flex flex-col justify-between aspect-square md:aspect-auto h-48">
<span className="text-[10px] font-bold text-on-surface tracking-widest uppercase">PENDING_CHANGES</span>
<div className="text-6xl font-light text-on-surface">03</div>
</div>
<div className="col-span-12 md:col-span-4 bg-primary-container p-8 flex flex-col justify-between aspect-square md:aspect-auto h-48">
<span className="text-[10px] font-bold text-white tracking-widest uppercase">TOTAL_STAFF_ALLOCATED</span>
<div className="text-6xl font-light text-white">182</div>
</div>
{/* Template Table */}
<div className="col-span-12 bg-white mt-4">
<div className="p-6 border-b-2 border-surface-container flex justify-between items-center bg-surface-container-low">
<h2 className="text-xs font-bold tracking-widest uppercase">TEMPLATE_LIBRARY_INDEX</h2>
<button className="bg-on-surface text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">add</span> CREATE_TEMPLATE
                        </button>
</div>
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-low border-b-2 border-surface-container text-[10px] font-bold tracking-widest uppercase">
<tr>
<th className="px-6 py-4">TEMPLATE_NAME</th>
<th className="px-6 py-4">EFFECTIVE_DATE</th>
<th className="px-6 py-4">DOCTOR_COUNT</th>
<th className="px-6 py-4">STATUS</th>
<th className="px-6 py-4 text-right">ACTIONS</th>
</tr>
</thead>
<tbody className="text-xs">
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-6 font-semibold tracking-tight">GENERAL_PRACTICE_SUMMER_24</td>
<td className="px-6 py-6 font-mono">2024-06-01</td>
<td className="px-6 py-6">42</td>
<td className="px-6 py-6">
<span className="bg-primary-container text-white px-2 py-0.5 text-[8px] font-black uppercase">ACTIVE</span>
</td>
<td className="px-6 py-6 text-right">
<button className="text-primary font-bold uppercase tracking-widest text-[9px] hover:underline">CONFIGURE</button>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-6 font-semibold tracking-tight">EMERGENCY_PEAK_AUTUMN</td>
<td className="px-6 py-6 font-mono">2024-09-15</td>
<td className="px-6 py-6">12</td>
<td className="px-6 py-6">
<span className="bg-surface-container-highest text-on-surface px-2 py-0.5 text-[8px] font-black uppercase">DRAFT</span>
</td>
<td className="px-6 py-6 text-right">
<button className="text-primary font-bold uppercase tracking-widest text-[9px] hover:underline">CONFIGURE</button>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-6 font-semibold tracking-tight">NIGHT_SHIFT_STANDARD_V2</td>
<td className="px-6 py-6 font-mono">2024-01-01</td>
<td className="px-6 py-6">08</td>
<td className="px-6 py-6">
<span className="bg-primary-container text-white px-2 py-0.5 text-[8px] font-black uppercase">ACTIVE</span>
</td>
<td className="px-6 py-6 text-right">
<button className="text-primary font-bold uppercase tracking-widest text-[9px] hover:underline">CONFIGURE</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>
{/* Right Drawer (Matrix Editor) */}
<aside className="w-[480px] bg-white border-l-2 border-surface-container flex flex-col h-full overflow-hidden shadow-2xl">
<div className="p-8 bg-surface-container-low flex justify-between items-start">
<div>
<span className="text-[10px] font-bold text-primary tracking-widest uppercase block mb-1">EDITOR_MODE</span>
<h3 className="text-xl font-bold tracking-tight text-on-surface">GENERAL_PRACTICE_SUMMER_24</h3>
<p className="text-xs text-outline mt-1 font-mono uppercase tracking-tight">ID: TEM-GP-SUM24-001</p>
</div>
<button className="p-2 hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined">close</span>
</button>
</div>
<div className="flex-grow overflow-y-auto p-8">
<div className="flex justify-between items-center mb-6">
<h4 className="text-xs font-bold uppercase tracking-widest">WEEKLY_MATRIX_CONFIGURATION</h4>
<div className="flex gap-2">
<button className="p-1 bg-primary text-white"><span className="material-symbols-outlined text-xs">edit</span></button>
<button className="p-1 bg-surface-container-highest"><span className="material-symbols-outlined text-xs">history</span></button>
</div>
</div>
{/* Matrix Editor Grid */}
<div className="space-y-4">
{/* Day Block: Monday */}
<div className="p-4 bg-surface-container-low border-b-2 border-primary-container">
<div className="flex justify-between mb-4">
<span className="text-[10px] font-black uppercase tracking-[0.2em]">MON_MONDAY</span>
<span className="text-[10px] font-mono text-primary font-bold">12_SLOTS</span>
</div>
<div className="space-y-2">
<div className="flex items-center justify-between text-xs p-3 bg-white border-b border-surface-container group hover:bg-primary-container hover:text-white transition-colors cursor-pointer">
<span className="font-bold tracking-tight">08:00 AM - 12:00 PM</span>
<span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">settings</span>
</div>
<div className="flex items-center justify-between text-xs p-3 bg-white border-b border-surface-container group hover:bg-primary-container hover:text-white transition-colors cursor-pointer">
<span className="font-bold tracking-tight">01:00 PM - 05:00 PM</span>
<span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">settings</span>
</div>
<button className="w-full py-2 border-2 border-dashed border-outline-variant text-[9px] font-bold uppercase tracking-widest text-outline hover:border-primary hover:text-primary transition-all">
                                ADD_TIME_WINDOW
                            </button>
</div>
</div>
{/* Day Block: Tuesday */}
<div className="p-4 bg-surface-container-low border-b-2 border-surface-container-highest">
<div className="flex justify-between mb-4">
<span className="text-[10px] font-black uppercase tracking-[0.2em]">TUE_TUESDAY</span>
<span className="text-[10px] font-mono text-outline font-bold">08_SLOTS</span>
</div>
<div className="space-y-2">
<div className="flex items-center justify-between text-xs p-3 bg-white border-b border-surface-container group hover:bg-primary-container hover:text-white transition-colors cursor-pointer">
<span className="font-bold tracking-tight">09:00 AM - 01:00 PM</span>
<span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">settings</span>
</div>
<div className="flex items-center justify-between text-xs p-3 bg-white border-b border-surface-container group hover:bg-primary-container hover:text-white transition-colors cursor-pointer">
<span className="font-bold tracking-tight">02:00 PM - 06:00 PM</span>
<span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">settings</span>
</div>
</div>
</div>
{/* Day Block: Wednesday */}
<div className="p-4 bg-surface-container-low border-b-2 border-surface-container-highest">
<div className="flex justify-between mb-4">
<span className="text-[10px] font-black uppercase tracking-[0.2em]">WED_WEDNESDAY</span>
<span className="text-[10px] font-mono text-outline font-bold">--_SLOTS</span>
</div>
<div className="bg-white/50 p-6 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant">
<span className="material-symbols-outlined text-outline-variant mb-2">event_busy</span>
<span className="text-[9px] font-bold text-outline-variant uppercase tracking-widest">NO_WINDOWS_DEFINED</span>
</div>
</div>
</div>
</div>
<div className="p-8 bg-surface-container-highest flex gap-4">
<button className="flex-grow bg-primary text-white py-4 font-bold tracking-widest text-[10px] uppercase hover:bg-primary-container transition-colors shadow-lg">
                    COMMIT_TEMPLATE_CHANGES
                </button>
<button className="px-6 border-2 border-on-surface text-on-surface py-4 font-bold tracking-widest text-[10px] uppercase hover:bg-on-surface hover:text-white transition-colors">
                    CANCEL
                </button>
</div>
</aside>

</main>
    </>
  );
}
