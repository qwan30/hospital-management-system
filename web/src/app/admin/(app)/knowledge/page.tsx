import Image from "next/image";
import Link from "next/link";

export default function AdminKnowledgeDocumentsPage() {
  return (
    <>
      <main>

{/* Header Section */}
<div className="p-8 bg-surface-container-low flex justify-between items-end">
<div>
<span className="text-xs font-bold uppercase tracking-[0.2em] text-outline mb-2 block">Administration</span>
<h1 className="text-4xl font-light text-on-surface tracking-tight">Knowledge Documents</h1>
</div>
<button className="bg-primary-container text-on-primary-container px-6 py-3 font-semibold text-sm flex items-center gap-2 hover:bg-primary transition-colors active:translate-y-[2px]">
<span className="material-symbols-outlined" data-icon="upload">upload</span>
                    UPLOAD DOCUMENT
                </button>
</div>
<div className="flex-1 flex min-h-0">
{/* Table Container */}
<div className="flex-1 p-8 overflow-auto">
<div className="bg-surface-container-lowest">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high text-on-surface border-b-2 border-neutral-900">
<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Document Name</th>
<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Status</th>
<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Source</th>
<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Updated</th>
<th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Index State</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-sm text-primary">SOP_Cardiology_Emergency_v2.pdf</span>
<span className="text-[10px] text-outline font-medium tracking-wide">ID: DOC-9928-11</span>
</div>
</td>
<td className="px-4 py-4">
<span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase">Indexed</span>
</td>
<td className="px-4 py-4 text-xs font-medium">Internal Storage / Clinical</td>
<td className="px-4 py-4 text-xs">2023-11-24 14:22</td>
<td className="px-4 py-4">
<div className="w-full bg-surface-container-high h-1">
<div className="bg-primary h-full w-full"></div>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer bg-surface-container-low/30 border-l-4 border-primary">
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-sm text-primary">Manual_Imaging_Lab_Procedures.docx</span>
<span className="text-[10px] text-outline font-medium tracking-wide">ID: DOC-9928-12</span>
</div>
</td>
<td className="px-4 py-4">
<span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
<span className="material-symbols-outlined text-[12px] animate-spin" data-icon="sync">sync</span> Processing
                                        </span>
</td>
<td className="px-4 py-4 text-xs font-medium">Cloud Upload / Admin</td>
<td className="px-4 py-4 text-xs">2023-11-24 16:05</td>
<td className="px-4 py-4">
<div className="w-full bg-surface-container-high h-1">
<div className="bg-primary h-full w-[65%]"></div>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer">
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-sm text-primary">Policy_HIPAA_Compliance_2024.pdf</span>
<span className="text-[10px] text-outline font-medium tracking-wide">ID: DOC-9928-14</span>
</div>
</td>
<td className="px-4 py-4">
<span className="px-2 py-1 bg-neutral-200 text-neutral-600 text-[10px] font-bold uppercase">Uploaded</span>
</td>
<td className="px-4 py-4 text-xs font-medium">S3 Bucket / Legal</td>
<td className="px-4 py-4 text-xs">2023-11-23 09:12</td>
<td className="px-4 py-4">
<div className="w-full bg-surface-container-high h-1">
<div className="bg-primary h-full w-0"></div>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer">
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-sm text-primary">Guidelines_Patient_Discharge.txt</span>
<span className="text-[10px] text-outline font-medium tracking-wide">ID: DOC-9928-15</span>
</div>
</td>
<td className="px-4 py-4">
<span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase">Failed</span>
</td>
<td className="px-4 py-4 text-xs font-medium">Manual Input</td>
<td className="px-4 py-4 text-xs">2023-11-22 18:45</td>
<td className="px-4 py-4">
<div className="w-full bg-red-200 h-1"></div>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors cursor-pointer opacity-50">
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-sm text-primary">Legacy_Patient_Records_2019.csv</span>
<span className="text-[10px] text-outline font-medium tracking-wide">ID: DOC-9925-01</span>
</div>
</td>
<td className="px-4 py-4">
<span className="px-2 py-1 bg-neutral-800 text-white text-[10px] font-bold uppercase">Revoked</span>
</td>
<td className="px-4 py-4 text-xs font-medium">Archived Database</td>
<td className="px-4 py-4 text-xs">2023-10-01 10:00</td>
<td className="px-4 py-4">
<div className="w-full bg-neutral-400 h-1"></div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Right-side Detail NavigationDrawer */}
<aside className="w-96 bg-white dark:bg-neutral-900 border-l-2 border-neutral-900 dark:border-neutral-800 flex flex-col h-full sticky right-0 top-0 overflow-y-auto p-8 gap-6 z-30">
<div className="flex justify-between items-start">
<div>
<h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">Document Detail</h3>
<p className="text-[10px] font-medium text-outline">Selected: DOC-9928-12</p>
</div>
<button className="text-outline hover:text-on-surface">
<span className="material-symbols-outlined" data-icon="close">close</span>
</button>
</div>
<div className="space-y-4">
<div className="bg-surface-container-low p-4 space-y-2">
<label className="text-[10px] font-bold uppercase text-outline">Metadata</label>
<div className="grid grid-cols-2 gap-4">
<div>
<p className="text-[10px] text-outline mb-1">MIME Type</p>
<p className="text-xs font-semibold">application/vnd.openxml</p>
</div>
<div>
<p className="text-[10px] text-outline mb-1">Size</p>
<p className="text-xs font-semibold">2.4 MB</p>
</div>
<div>
<p className="text-[10px] text-outline mb-1">Vector Segments</p>
<p className="text-xs font-semibold">142 Units</p>
</div>
<div>
<p className="text-[10px] text-outline mb-1">Language</p>
<p className="text-xs font-semibold">EN-US</p>
</div>
</div>
</div>
<div className="space-y-3">
<label className="text-[10px] font-bold uppercase text-outline block">Status Timeline</label>
<div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200">
<div className="relative">
<div className="absolute -left-[25px] top-1 w-3 h-3 bg-primary"></div>
<p className="text-xs font-bold">Indexing Phase 2</p>
<p className="text-[10px] text-outline">Active - 65% Complete</p>
</div>
<div className="relative opacity-60">
<div className="absolute -left-[25px] top-1 w-3 h-3 bg-neutral-400"></div>
<p className="text-xs font-bold">Preprocessing</p>
<p className="text-[10px] text-outline">Completed 16:08</p>
</div>
<div className="relative opacity-60">
<div className="absolute -left-[25px] top-1 w-3 h-3 bg-neutral-400"></div>
<p className="text-xs font-bold">Security Scan</p>
<p className="text-[10px] text-outline">Verified 16:06</p>
</div>
</div>
</div>
<div className="pt-6 border-t border-surface-container flex flex-col gap-2">
<label className="text-[10px] font-bold uppercase text-outline mb-2">Available Actions</label>
<button className="w-full py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="play_arrow">play_arrow</span> Activate
                            </button>
<div className="grid grid-cols-2 gap-2">
<button className="py-3 bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-neutral-300 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="refresh">refresh</span> Reindex
                                </button>
<button className="py-3 bg-surface-container-high text-error text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="block">block</span> Revoke
                                </button>
</div>
</div>
<div className="bg-surface p-4">
<label className="text-[10px] font-bold uppercase text-outline mb-2 block">Source Preview</label>
<div className="aspect-video bg-surface-container-highest flex items-center justify-center text-outline">
<span className="material-symbols-outlined text-4xl" data-icon="description">description</span>
</div>
</div>
</div>
</aside>
</div>

</main>
    </>
  );
}
