import Image from "next/image";
import Link from "next/link";

export default function AdminNewsPage() {
  return (
    <>
      <main>

<div className="max-w-6xl mx-auto">
{/* Header Section */}
<div className="flex items-end justify-between mb-12">
<div>
<span className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em] block mb-2">Internal Communications</span>
<h1 className="text-5xl font-light tracking-tight text-on-surface">Hospital News</h1>
</div>
<button className="bg-primary-container text-white px-6 py-3 font-semibold flex items-center space-x-2 hover:bg-primary transition-colors">
<span>Create Article</span>
<span className="material-symbols-outlined text-sm">add</span>
</button>
</div>
{/* News Statistics (Data Monoliths) */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-12">
<div className="bg-surface-container-highest p-6">
<span className="text-[10px] font-bold text-on-surface uppercase tracking-widest block mb-4">Total Articles</span>
<span className="text-5xl font-light">142</span>
</div>
<div className="bg-surface-container-high p-6">
<span className="text-[10px] font-bold text-on-surface uppercase tracking-widest block mb-4">Scheduled</span>
<span className="text-5xl font-light">08</span>
</div>
<div className="bg-surface-container p-6">
<span className="text-[10px] font-bold text-on-surface uppercase tracking-widest block mb-4">Drafts</span>
<span className="text-5xl font-light">24</span>
</div>
</div>
{/* Data Table Section */}
<div className="bg-surface">
<div className="flex items-center justify-between p-4 bg-surface-container-low">
<div className="flex items-center space-x-4">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
<input className="pl-10 pr-4 py-2 bg-surface border-none focus:ring-0 w-64 text-sm" placeholder="Search news articles..." type="text"/>
</div>
<button className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-sm">filter_list</span>
<span>Filter</span>
</button>
</div>
</div>
<table className="w-full border-collapse">
<thead>
<tr className="bg-surface-container-highest border-b border-outline-variant/20">
<th className="p-4 text-left w-12">
<input className="border-on-surface-variant focus:ring-primary text-primary-container rounded-none" type="checkbox"/>
</th>
<th className="p-4 text-[10px] font-bold text-on-surface uppercase tracking-widest text-left">Title</th>
<th className="p-4 text-[10px] font-bold text-on-surface uppercase tracking-widest text-left">Publish Date</th>
<th className="p-4 text-[10px] font-bold text-on-surface uppercase tracking-widest text-left">Author</th>
<th className="p-4 text-[10px] font-bold text-on-surface uppercase tracking-widest text-left">Status</th>
<th className="p-4 text-[10px] font-bold text-on-surface uppercase tracking-widest text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="group hover:bg-surface-container-lowest transition-colors cursor-pointer">
<td className="p-4"><input className="rounded-none" type="checkbox"/></td>
<td className="p-4 font-semibold text-sm">New Oncology Wing Opening Ceremony</td>
<td className="p-4 text-sm text-on-surface-variant">Oct 24, 2023</td>
<td className="p-4 text-sm text-on-surface-variant">Dr. Sarah Jenkins</td>
<td className="p-4">
<span className="inline-block px-2 py-1 text-[10px] font-bold uppercase bg-green-100 text-green-700">Published</span>
</td>
<td className="p-4 text-right">
<button className="p-2 text-outline hover:text-on-surface transition-colors">
<span className="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
<tr className="group bg-surface-container-low border-l-4 border-primary">
<td className="p-4"><input defaultChecked className="rounded-none" type="checkbox"/></td>
<td className="p-4 font-semibold text-sm">Q4 Staff Wellness Program Updates</td>
<td className="p-4 text-sm text-on-surface-variant">Nov 02, 2023</td>
<td className="p-4 text-sm text-on-surface-variant">HR Department</td>
<td className="p-4">
<span className="inline-block px-2 py-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700">Draft</span>
</td>
<td className="p-4 text-right">
<button className="p-2 text-on-surface">
<span className="material-symbols-outlined text-sm">edit</span>
</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-lowest transition-colors cursor-pointer">
<td className="p-4"><input className="rounded-none" type="checkbox"/></td>
<td className="p-4 font-semibold text-sm">Annual Medical Research Symposium 2024</td>
<td className="p-4 text-sm text-on-surface-variant">Dec 15, 2023</td>
<td className="p-4 text-sm text-on-surface-variant">Research Office</td>
<td className="p-4">
<span className="inline-block px-2 py-1 text-[10px] font-bold uppercase bg-zinc-200 text-zinc-600">Archived</span>
</td>
<td className="p-4 text-right">
<button className="p-2 text-outline hover:text-on-surface transition-colors">
<span className="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-lowest transition-colors cursor-pointer">
<td className="p-4"><input className="rounded-none" type="checkbox"/></td>
<td className="p-4 font-semibold text-sm">Changes to Patient Visitation Hours</td>
<td className="p-4 text-sm text-on-surface-variant">Oct 30, 2023</td>
<td className="p-4 text-sm text-on-surface-variant">Admin Liaison</td>
<td className="p-4">
<span className="inline-block px-2 py-1 text-[10px] font-bold uppercase bg-green-100 text-green-700">Published</span>
</td>
<td className="p-4 text-right">
<button className="p-2 text-outline hover:text-on-surface transition-colors">
<span className="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
<div className="flex items-center justify-between p-4 bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
<span>Showing 1-4 of 142 articles</span>
<div className="flex items-center space-x-4">
<button className="flex items-center space-x-1 hover:text-on-surface">
<span className="material-symbols-outlined text-sm">chevron_left</span>
<span>Previous</span>
</button>
<div className="flex space-x-2">
<span className="px-2 py-1 bg-primary text-white">1</span>
<span className="px-2 py-1 hover:bg-surface-container-high cursor-pointer">2</span>
<span className="px-2 py-1 hover:bg-surface-container-high cursor-pointer">3</span>
</div>
<button className="flex items-center space-x-1 hover:text-on-surface">
<span>Next</span>
<span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
