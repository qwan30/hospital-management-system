
export default function AdminDepartmentsPage() {
  return (
    <>
      <main>

{/* Page Header */}
<div className="p-8 pb-0">
<div className="flex justify-between items-end mb-8">
<div>
<div className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2">Hospital Administration</div>
<h1 className="text-4xl font-light text-on-surface tracking-tight">Manage Departments</h1>
</div>
<div className="flex gap-4">
<div className="bg-surface-container-lowest px-4 py-2 flex items-center gap-2 border-b-2 border-outline focus-within:border-primary transition-colors">
<span className="material-symbols-outlined text-outline" data-icon="search">search</span>
<input className="bg-transparent border-none focus:ring-0 text-sm p-0 w-64" placeholder="Search by name..." type="text"/>
</div>
</div>
</div>
{/* Bento Stats */}
<div className="grid grid-cols-4 gap-4 mb-8">
<div className="bg-surface-container-highest p-6 flex flex-col justify-between h-32">
<span className="text-[10px] font-bold uppercase text-on-surface-variant">Total Departments</span>
<span className="text-4xl font-light tracking-tighter">18</span>
</div>
<div className="bg-primary-container p-6 flex flex-col justify-between h-32 text-on-primary-container">
<span className="text-[10px] font-bold uppercase">Active Units</span>
<span className="text-4xl font-light tracking-tighter">16</span>
</div>
<div className="bg-surface-container-highest p-6 flex flex-col justify-between h-32">
<span className="text-[10px] font-bold uppercase text-on-surface-variant">Occupancy Rate</span>
<span className="text-4xl font-light tracking-tighter">84%</span>
</div>
<div className="bg-surface-container-highest p-6 flex flex-col justify-between h-32">
<span className="text-[10px] font-bold uppercase text-on-surface-variant">Avg Response Time</span>
<span className="text-4xl font-light tracking-tighter">4.2m</span>
</div>
</div>
</div>
{/* Data Table Container */}
<div className="px-8 pb-12">
<div className="bg-surface-container-lowest overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
<th className="px-6 py-4">Name</th>
<th className="px-6 py-4">Head Doctor</th>
<th className="px-6 py-4">Phone</th>
<th className="px-6 py-4">Floor / Room</th>
<th className="px-6 py-4">Status</th>
<th className="px-6 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="text-sm">
{/* Table Row 1 */}
<tr className="group hover:bg-surface-container transition-colors">
<td className="px-6 py-4 font-semibold">Cardiology Center</td>
<td className="px-6 py-4">Dr. Sarah Jenkins</td>
<td className="px-6 py-4 font-mono">+1 (555) 012-3456</td>
<td className="px-6 py-4">4th Floor / 402-A</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase">
<span className="w-1.5 h-1.5 bg-green-600"></span> Active
                                </span>
</td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:underline font-bold text-xs uppercase tracking-wider">Edit</button>
</td>
</tr>
{/* Table Row 2 */}
<tr className="group hover:bg-surface-container transition-colors">
<td className="px-6 py-4 font-semibold">Neurology Unit</td>
<td className="px-6 py-4">Dr. Marcus Vane</td>
<td className="px-6 py-4 font-mono">+1 (555) 012-9876</td>
<td className="px-6 py-4">3rd Floor / 315</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase">
<span className="w-1.5 h-1.5 bg-green-600"></span> Active
                                </span>
</td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:underline font-bold text-xs uppercase tracking-wider">Edit</button>
</td>
</tr>
{/* Table Row 3 */}
<tr className="group hover:bg-surface-container transition-colors">
<td className="px-6 py-4 font-semibold">Pediatrics</td>
<td className="px-6 py-4">Dr. Elena Rodriguez</td>
<td className="px-6 py-4 font-mono">+1 (555) 012-4433</td>
<td className="px-6 py-4">2nd Floor / Wing B</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase">
<span className="w-1.5 h-1.5 bg-green-600"></span> Active
                                </span>
</td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:underline font-bold text-xs uppercase tracking-wider">Edit</button>
</td>
</tr>
{/* Table Row 4 */}
<tr className="group hover:bg-surface-container transition-colors">
<td className="px-6 py-4 font-semibold">Radiology Labs</td>
<td className="px-6 py-4">Dr. Simon Kael</td>
<td className="px-6 py-4 font-mono">+1 (555) 012-7711</td>
<td className="px-6 py-4">Basement / B-12</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-200 text-neutral-600 text-[10px] font-bold uppercase">
<span className="w-1.5 h-1.5 bg-neutral-500"></span> Inactive
                                </span>
</td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:underline font-bold text-xs uppercase tracking-wider">Edit</button>
</td>
</tr>
{/* Table Row 5 */}
<tr className="group hover:bg-surface-container transition-colors">
<td className="px-6 py-4 font-semibold">Emergency Room</td>
<td className="px-6 py-4">Dr. Julian Thorne</td>
<td className="px-6 py-4 font-mono">+1 (555) 012-0000</td>
<td className="px-6 py-4">1st Floor / Main</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase">
<span className="w-1.5 h-1.5 bg-green-600"></span> Active
                                </span>
</td>
<td className="px-6 py-4 text-right">
<button className="text-primary hover:underline font-bold text-xs uppercase tracking-wider">Edit</button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination Placeholder */}
<div className="flex items-center justify-between mt-4 text-[11px] font-bold uppercase text-outline px-2">
<div>Showing 5 of 18 Departments</div>
<div className="flex gap-4">
<button className="hover:text-primary transition-colors">Previous</button>
<div className="flex gap-2">
<span className="text-on-surface">01</span>
<span>02</span>
<span>03</span>
<span>04</span>
</div>
<button className="hover:text-primary transition-colors">Next</button>
</div>
</div>
</div>

</main>
    </>
  );
}
