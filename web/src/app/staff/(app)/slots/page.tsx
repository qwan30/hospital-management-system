import Image from "next/image";
import Link from "next/link";

export default function SlotGenerationPage() {
  return (
    <>
      <main>

<div className="p-8 max-w-[1400px] mx-auto">
{/* Breadcrumbs */}
<div className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-outline">
<span>Admin</span>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<span>Operations</span>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<span className="text-on-surface">SLOT_GENERATION</span>
</div>
{/* Page Header */}
<div className="mb-12">
<h2 className="text-4xl font-light tracking-tight text-on-surface leading-tight">Generate Service Slots</h2>
<p className="text-on-surface-variant max-w-2xl mt-2 font-body text-sm">Automated mass-generation of clinical appointment slots based on predefined room templates and staff availability matrix. Review the impact assessment before final execution.</p>
</div>
<div className="grid grid-cols-12 gap-0">
{/* Left: Configuration Form */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-low p-8">
<div className="mb-8">
<span className="text-[10px] font-bold uppercase tracking-widest text-primary border-l-4 border-primary pl-3">01. Parameters</span>
</div>
<form className="space-y-12">
<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
{/* Field: Service Provider */}
<div className="space-y-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">Primary Practitioner</label>
<div className="relative group">
<select className="w-full bg-surface-container-low border-b-2 border-outline px-4 py-3 appearance-none focus:outline-none focus:border-primary transition-colors font-body text-sm">
<option>Select Practitioner...</option>
<option>Dr. Elena Rodriguez (Cardiology)</option>
<option>Dr. Marcus Thorne (Neurology)</option>
<option>Dr. Sarah Jenkins (General Practice)</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-outline">expand_more</span>
</div>
</div>
{/* Field: Room Template */}
<div className="space-y-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">Configuration Template</label>
<div className="relative group">
<select className="w-full bg-surface-container-low border-b-2 border-outline px-4 py-3 appearance-none focus:outline-none focus:border-primary transition-colors font-body text-sm">
<option>Select Template...</option>
<option>STD_OP_30_MIN (Standard Outpatient)</option>
<option>EXT_CONSULT_60 (Extended Consultation)</option>
<option>PROC_SHORT_15 (Minor Procedure)</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-outline">expand_more</span>
</div>
</div>
{/* Field: Date Range */}
<div className="space-y-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">Start Date</label>
<input className="w-full bg-surface-container-low border-b-2 border-outline px-4 py-3 focus:outline-none focus:border-primary transition-colors font-body text-sm" type="date"/>
</div>
<div className="space-y-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">End Date</label>
<input className="w-full bg-surface-container-low border-b-2 border-outline px-4 py-3 focus:outline-none focus:border-primary transition-colors font-body text-sm" type="date"/>
</div>
</div>
{/* Checkboxes / Toggles */}
<div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
<label className="flex items-center gap-4 cursor-pointer group">
<div className="w-5 h-5 border-2 border-outline group-hover:border-primary flex items-center justify-center transition-colors">
<div className="w-3 h-3 bg-primary opacity-0 group-hover:opacity-20"></div>
</div>
<span className="text-sm font-body">Override existing empty slots</span>
</label>
<label className="flex items-center gap-4 cursor-pointer group">
<div className="w-5 h-5 border-2 border-primary flex items-center justify-center transition-colors">
<div className="w-3 h-3 bg-primary"></div>
</div>
<span className="text-sm font-body">Exclude national bank holidays</span>
</label>
</div>
</form>
</div>
{/* Right: Impact & Summary */}
<div className="col-span-12 lg:col-span-4 bg-on-surface text-white p-8">
<div className="mb-8">
<span className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim border-l-4 border-primary-fixed-dim pl-3">02. Operational Impact</span>
</div>
<div className="space-y-12">
{/* Data Monolith */}
<div className="bg-[#262626] p-8">
<div className="text-6xl font-light tracking-tighter text-white">448</div>
<div className="text-[10px] font-bold uppercase tracking-widest text-outline-variant mt-2">Estimated Slots to be Created</div>
</div>
<div className="space-y-6">
<div className="flex justify-between items-end border-b border-[#313030] pb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">Concurrency Load</span>
<span className="text-xl font-light">12.5%</span>
</div>
<div className="flex justify-between items-end border-b border-[#313030] pb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">Room Utilization</span>
<span className="text-xl font-light">88.0%</span>
</div>
<div className="flex justify-between items-end border-b border-[#313030] pb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">System Latency Est.</span>
<span className="text-xl font-light">1.2s</span>
</div>
</div>
<div className="pt-8">
<button className="w-full bg-primary-container hover:bg-primary text-white py-4 font-bold text-sm tracking-widest transition-colors flex items-center justify-center gap-3">
                                EXECUTE GENERATION
                                <span className="material-symbols-outlined" data-icon="bolt">bolt</span>
</button>
<p className="text-[10px] text-outline-variant text-center mt-4 uppercase tracking-widest">Irreversible database action</p>
</div>
</div>
</div>
{/* Bottom: Preview Table */}
<div className="col-span-12 bg-surface-container-lowest mt-16">
<div className="p-8 border-b border-surface-container">
<div className="flex justify-between items-center">
<div>
<span className="text-[10px] font-bold uppercase tracking-widest text-primary border-l-4 border-primary pl-3 block mb-2">03. Sampling Preview</span>
<h3 className="text-xl font-semibold">First 5 Computed Results</h3>
</div>
<button className="px-6 py-2 border-2 border-on-surface text-on-surface font-bold text-[10px] uppercase tracking-widest hover:bg-on-surface hover:text-white transition-colors">
                                RE-CALCULATE PREVIEW
                            </button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low">
<th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sequence</th>
<th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Timestamp</th>
<th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Duration</th>
<th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Room ID</th>
<th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Integrity</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="hover:bg-surface-container transition-colors">
<td className="px-8 py-6 font-mono text-xs">#SLT-2023-001</td>
<td className="px-8 py-6 text-sm font-body">Oct 12, 2023 • 08:00 AM</td>
<td className="px-8 py-6 text-sm font-body">30 MIN</td>
<td className="px-8 py-6 text-sm font-body">CONSULT-RM-402</td>
<td className="px-8 py-6">
<span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold tracking-widest">VALID</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="px-8 py-6 font-mono text-xs">#SLT-2023-002</td>
<td className="px-8 py-6 text-sm font-body">Oct 12, 2023 • 08:30 AM</td>
<td className="px-8 py-6 text-sm font-body">30 MIN</td>
<td className="px-8 py-6 text-sm font-body">CONSULT-RM-402</td>
<td className="px-8 py-6">
<span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold tracking-widest">VALID</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="px-8 py-6 font-mono text-xs">#SLT-2023-003</td>
<td className="px-8 py-6 text-sm font-body">Oct 12, 2023 • 09:00 AM</td>
<td className="px-8 py-6 text-sm font-body">30 MIN</td>
<td className="px-8 py-6 text-sm font-body">CONSULT-RM-402</td>
<td className="px-8 py-6">
<span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold tracking-widest">VALID</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="px-8 py-6 font-mono text-xs">#SLT-2023-004</td>
<td className="px-8 py-6 text-sm font-body">Oct 12, 2023 • 09:30 AM</td>
<td className="px-8 py-6 text-sm font-body">30 MIN</td>
<td className="px-8 py-6 text-sm font-body">CONSULT-RM-402</td>
<td className="px-8 py-6">
<span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold tracking-widest">CONFLICT_WARN</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="px-8 py-6 font-mono text-xs">#SLT-2023-005</td>
<td className="px-8 py-6 text-sm font-body">Oct 12, 2023 • 10:00 AM</td>
<td className="px-8 py-6 text-sm font-body">30 MIN</td>
<td className="px-8 py-6 text-sm font-body">CONSULT-RM-402</td>
<td className="px-8 py-6">
<span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold tracking-widest">VALID</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
{/* Footer / Status */}
<footer className="mt-16 flex justify-between items-center text-outline-variant font-['Public_Sans'] text-[10px] font-bold uppercase tracking-widest">
<div className="flex gap-8">
<span>SERVER_STATUS: OPTIMAL</span>
<span>QUEUE_DEPTH: 0</span>
</div>
<div>LAST_RUN: 2023-10-11 14:22:01 UTC</div>
</footer>
</div>

</main>
    </>
  );
}
