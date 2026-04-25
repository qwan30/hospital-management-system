import Image from "next/image";
import Link from "next/link";

export default function AdminAuditLogsPage() {
  return (
    <>
      <main>

{/* Dashboard Header */}
<header className="p-8 pb-4">
<h1 className="text-4xl font-light tracking-tight mb-2">Audit Logs</h1>
<p className="text-on-surface-variant text-sm max-w-2xl">Monitor and trace all administrative actions, system interactions, and record updates across the MedCore HMS ecosystem.</p>
</header>
{/* Filter Bar */}
<section className="px-8 py-4 bg-surface-container-low flex items-end gap-0">
<div className="flex-1 max-w-sm">
<label className="block text-[11px] font-bold text-on-surface uppercase mb-2">Actor</label>
<div className="relative group">
<input className="w-full bg-surface-container-high border-none border-b-2 border-outline focus:border-primary focus:ring-0 text-sm py-3 px-4 placeholder:text-outline-variant transition-all" placeholder="Search by name or UID" type="text"/>
<span className="material-symbols-outlined absolute right-3 top-3 text-outline">search</span>
</div>
</div>
<div className="flex-1 max-w-xs ml-8">
<label className="block text-[11px] font-bold text-on-surface uppercase mb-2">Date Range</label>
<div className="relative">
<input className="w-full bg-surface-container-high border-none border-b-2 border-outline focus:border-primary focus:ring-0 text-sm py-3 px-4 transition-all" type="text" value="Oct 20, 2023 - Oct 27, 2023"/>
<span className="material-symbols-outlined absolute right-3 top-3 text-outline">calendar_today</span>
</div>
</div>
<div className="ml-auto flex gap-2">
<button className="bg-primary-container hover:bg-primary text-on-primary px-8 py-3 flex items-center gap-2 font-semibold text-sm transition-colors">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Apply Filters
                </button>
<button className="bg-surface-container-high hover:bg-surface-variant text-on-surface px-4 py-3 transition-colors">
<span className="material-symbols-outlined">download</span>
</button>
</div>
</section>
{/* Data Table Section */}
<section className="flex-1 overflow-auto bg-surface relative">
<div className="min-w-[1000px]">
<table className="w-full text-left border-collapse table-fixed">
<thead className="sticky top-0 z-10 bg-surface-container-high">
<tr className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
<th className="py-3 px-8 w-64 border-b border-outline-variant/30">Timestamp (UTC)</th>
<th className="py-3 px-4 w-48 border-b border-outline-variant/30">Actor</th>
<th className="py-3 px-4 w-48 border-b border-outline-variant/30">Action</th>
<th className="py-3 px-4 w-64 border-b border-outline-variant/30">Target</th>
<th className="py-3 px-4 w-32 border-b border-outline-variant/30">Result</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
{/* Row 1 */}
<tr className="group hover:bg-surface-container-lowest cursor-pointer transition-colors">
<td className="py-4 px-8 mono-text text-sm text-zinc-500">2023-10-27 14:22:01.004</td>
<td className="py-4 px-4 text-sm font-semibold">Admin.James_K</td>
<td className="py-4 px-4">
<span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tracking-tight">UPDATE_RECORD</span>
</td>
<td className="py-4 px-4 text-sm text-primary">Patient_ID: 99420-B</td>
<td className="py-4 px-4">
<span className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
<span className="w-2 h-2 bg-emerald-600"></span> SUCCESS
                                </span>
</td>
</tr>
{/* Row 2 */}
<tr className="group hover:bg-surface-container-lowest cursor-pointer transition-colors bg-surface-container-low/30">
<td className="py-4 px-8 mono-text text-sm text-zinc-500">2023-10-27 14:18:55.210</td>
<td className="py-4 px-4 text-sm font-semibold">Sys_Daemon_01</td>
<td className="py-4 px-4">
<span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tracking-tight">AUTH_SYNC</span>
</td>
<td className="py-4 px-4 text-sm text-primary">Global_AD_Service</td>
<td className="py-4 px-4">
<span className="flex items-center gap-2 text-[11px] font-bold text-error">
<span className="w-2 h-2 bg-error"></span> FAIL
                                </span>
</td>
</tr>
{/* Row 3 */}
<tr className="group hover:bg-surface-container-lowest cursor-pointer transition-colors">
<td className="py-4 px-8 mono-text text-sm text-zinc-500">2023-10-27 13:55:12.871</td>
<td className="py-4 px-4 text-sm font-semibold">Dr.Sarah.Miller</td>
<td className="py-4 px-4">
<span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tracking-tight">LOGIN</span>
</td>
<td className="py-4 px-4 text-sm text-primary">Station_Node_4</td>
<td className="py-4 px-4">
<span className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
<span className="w-2 h-2 bg-emerald-600"></span> SUCCESS
                                </span>
</td>
</tr>
{/* Row 4 */}
<tr className="group hover:bg-surface-container-lowest cursor-pointer transition-colors bg-surface-container-low/30">
<td className="py-4 px-8 mono-text text-sm text-zinc-500">2023-10-27 13:42:00.000</td>
<td className="py-4 px-4 text-sm font-semibold">Admin.James_K</td>
<td className="py-4 px-4">
<span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tracking-tight">EXPORT_PDF</span>
</td>
<td className="py-4 px-4 text-sm text-primary">Radiology_Report_Q3</td>
<td className="py-4 px-4">
<span className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
<span className="w-2 h-2 bg-emerald-600"></span> SUCCESS
                                </span>
</td>
</tr>
{/* Row 5 */}
<tr className="group hover:bg-surface-container-lowest cursor-pointer transition-colors">
<td className="py-4 px-8 mono-text text-sm text-zinc-500">2023-10-27 12:15:33.441</td>
<td className="py-4 px-4 text-sm font-semibold">Nurs.Station.02</td>
<td className="py-4 px-4">
<span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tracking-tight">PRESCRIPTION_ADD</span>
</td>
<td className="py-4 px-4 text-sm text-primary">Patient_ID: 10229-C</td>
<td className="py-4 px-4">
<span className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
<span className="w-2 h-2 bg-emerald-600"></span> SUCCESS
                                </span>
</td>
</tr>
{/* Row 6 */}
<tr className="group hover:bg-surface-container-lowest cursor-pointer transition-colors bg-surface-container-low/30">
<td className="py-4 px-8 mono-text text-sm text-zinc-500">2023-10-27 11:58:02.112</td>
<td className="py-4 px-4 text-sm font-semibold">Sec_Ops_Lead</td>
<td className="py-4 px-4">
<span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tracking-tight">POLICY_CHANGE</span>
</td>
<td className="py-4 px-4 text-sm text-primary">Firewall_Inbound_H04</td>
<td className="py-4 px-4">
<span className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
<span className="w-2 h-2 bg-emerald-600"></span> SUCCESS
                                </span>
</td>
</tr>
</tbody>
</table>
</div>
{/* Right Drawer (Active State Simulation) */}
<div className="fixed right-0 top-12 bottom-0 w-[480px] bg-surface-container-lowest z-40 border-l border-outline-variant shadow-2xl overflow-y-auto">
<div className="p-8">
<div className="flex items-center justify-between mb-8">
<div>
<span className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1 block">Log Detail</span>
<h2 className="text-xl font-bold">Event: UPDATE_RECORD</h2>
</div>
<button className="p-2 hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">close</span></button>
</div>
<div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
<div>
<span className="block text-[10px] font-bold uppercase text-outline mb-1">Status</span>
<span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
<span className="w-2 h-2 bg-emerald-600"></span> SUCCESSFUL_COMMIT
                            </span>
</div>
<div>
<span className="block text-[10px] font-bold uppercase text-outline mb-1">Actor ID</span>
<span className="text-sm font-mono">USR_882910_JK</span>
</div>
<div>
<span className="block text-[10px] font-bold uppercase text-outline mb-1">IP Address</span>
<span className="text-sm font-mono">192.168.1.104</span>
</div>
<div>
<span className="block text-[10px] font-bold uppercase text-outline mb-1">Correlation ID</span>
<span className="text-sm font-mono">82f-da22-1b</span>
</div>
</div>
<div className="space-y-4">
<span className="block text-[10px] font-bold uppercase text-outline">Raw Payload</span>
<div className="bg-zinc-950 p-6 text-zinc-300 font-mono text-xs leading-relaxed">
<pre className="whitespace-pre-wrap">&#123;
  "action": "UPDATE_RECORD",
  "actor": "Admin.James_K",
  "timestamp": "2023-10-27T14:22:01.004Z",
  "changes": &#123;
    "prev_state": &#123;
      "admission_status": "PENDING",
      "ward_assigned": null
    &#125;,
    "new_state": &#123;
      "admission_status": "ADMITTED",
      "ward_assigned": "ICU-LEVEL-2"
    &#125;
  &#125;,
  "metadata": &#123;
    "browser": "Chrome/118.0.0.0",
    "os": "MacOS 14.1",
    "region": "US-EAST-1"
  &#125;
&#125;</pre>
</div>
</div>
<div className="mt-8 pt-8 border-t border-outline-variant/30 flex justify-between items-center">
<button className="text-primary text-sm font-semibold hover:underline flex items-center gap-2">
<span className="material-symbols-outlined text-sm">open_in_new</span>
                            View full object history
                        </button>
<button className="bg-surface-container-high px-4 py-2 text-sm">Copy ID</button>
</div>
</div>
</div>
</section>
{/* Pagination Bar */}
<footer className="h-12 bg-surface-container-high flex items-center justify-between px-8 border-t border-outline-variant/20">
<div className="flex items-center gap-6 text-[11px] font-semibold text-on-surface-variant uppercase">
<span>Items per page: 40</span>
<span>1-40 of 1,288 items</span>
</div>
<div className="flex items-center">
<span className="text-[11px] font-semibold text-on-surface-variant uppercase mr-4">1 of 33 pages</span>
<div className="flex border-l border-outline-variant/30 h-12">
<button className="w-12 h-12 flex items-center justify-center hover:bg-surface-variant border-r border-outline-variant/30 transition-colors">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="w-12 h-12 flex items-center justify-center hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</footer>

</main>
    </>
  );
}
