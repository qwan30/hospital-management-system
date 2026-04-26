
export default function AdminUserDetailEditPage() {
  return (
    <>
      <main>

<header className="mb-10 max-w-5xl">
<div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-outline mb-2">Internal Resources</div>
<h1 className="text-4xl font-light tracking-tight text-on-background">Staff Directory</h1>
</header>
{/* User Table */}
<div className="max-w-5xl">
<div className="flex items-center justify-between mb-4 bg-surface-container-low p-4">
<div className="flex items-center gap-4">
<span className="text-xs font-semibold uppercase tracking-widest">Active Personnel (42)</span>
<span className="w-px h-4 bg-outline-variant"></span>
<button className="text-[10px] font-bold text-blue-600 hover:underline">EXPORT CSV</button>
</div>
<div className="flex gap-2">
<button className="p-2 hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-sm">filter_list</span></button>
<button className="p-2 hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-sm">view_column</span></button>
</div>
</div>
<div className="w-full">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high text-[10px] font-bold uppercase tracking-widest">
<th className="px-6 py-4">ID</th>
<th className="px-6 py-4">Full Name</th>
<th className="px-6 py-4">Role</th>
<th className="px-6 py-4">Department</th>
<th className="px-6 py-4">Status</th>
<th className="px-6 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="text-xs font-medium">
<tr className="group hover:bg-surface-container-lowest transition-colors">
<td className="px-6 py-4 text-outline">MC-0842</td>
<td className="px-6 py-4 font-semibold">Sarah Jenkins</td>
<td className="px-6 py-4">Senior Surgeon</td>
<td className="px-6 py-4">Cardiology</td>
<td className="px-6 py-4"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span> Active</td>
<td className="px-6 py-4 text-right">
<button className="text-blue-600 font-bold hover:underline">EDIT</button>
</td>
</tr>
<tr className="bg-surface-container-low group hover:bg-surface-container-lowest transition-colors">
<td className="px-6 py-4 text-outline">MC-0911</td>
<td className="px-6 py-4 font-semibold">Marcus Vance</td>
<td className="px-6 py-4">Lab Director</td>
<td className="px-6 py-4">Diagnostics</td>
<td className="px-6 py-4"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span> Active</td>
<td className="px-6 py-4 text-right">
<button className="text-blue-600 font-bold hover:underline">EDIT</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-lowest transition-colors">
<td className="px-6 py-4 text-outline">MC-1102</td>
<td className="px-6 py-4 font-semibold">Elena Rodriguez</td>
<td className="px-6 py-4">Pharmacist</td>
<td className="px-6 py-4">Pharmacy</td>
<td className="px-6 py-4"><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> On Leave</td>
<td className="px-6 py-4 text-right">
<button className="text-blue-600 font-bold hover:underline">EDIT</button>
</td>
</tr>
<tr className="bg-surface-container-low group hover:bg-surface-container-lowest transition-colors">
<td className="px-6 py-4 text-outline">MC-1248</td>
<td className="px-6 py-4 font-semibold">David Chen</td>
<td className="px-6 py-4">Staff Nurse</td>
<td className="px-6 py-4">Emergency</td>
<td className="px-6 py-4"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span> Active</td>
<td className="px-6 py-4 text-right text-blue-600 font-bold cursor-pointer hover:underline">EDIT</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Detail Grid (Bento Style) */}
<div className="max-w-5xl mt-12 grid grid-cols-4 gap-1">
<div className="col-span-1 bg-surface-container-highest p-6">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">TOTAL STAFF</div>
<div className="text-3xl font-light">128</div>
</div>
<div className="col-span-1 bg-surface-container-highest p-6">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">ON SHIFT</div>
<div className="text-3xl font-light">34</div>
</div>
<div className="col-span-2 bg-surface-container-highest p-6 flex items-center justify-between">
<div>
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">SYSTEM UPTIME</div>
<div className="text-3xl font-light">99.98%</div>
</div>
<div className="w-24 h-12 flex items-end gap-1">
<div className="w-2 bg-blue-600 h-1/2"></div>
<div className="w-2 bg-blue-600 h-3/4"></div>
<div className="w-2 bg-blue-600 h-1/4"></div>
<div className="w-2 bg-blue-600 h-full"></div>
<div className="w-2 bg-blue-600 h-2/3"></div>
</div>
</div>
</div>

</main>
    </>
  );
}
