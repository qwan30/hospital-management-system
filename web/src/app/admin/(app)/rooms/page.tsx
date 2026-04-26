
export default function AdminRoomsPage() {
  return (
    <>
      <main>

{/* Header & Filters */}
<div className="p-8 bg-surface border-b-0">
<div className="flex justify-between items-end mb-8">
<div>
<h1 className="text-4xl font-light tracking-tight text-on-surface font-headline uppercase">Room Inventory</h1>
<p className="text-on-surface-variant text-xs font-semibold tracking-widest mt-2">REAL-TIME MONITORING &amp; ALLOCATION</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-2 bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-surface-dim transition-colors">Export CSV</button>
<button className="px-4 py-2 bg-primary-container text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-colors">
<span className="material-symbols-outlined text-sm">add</span> Add Room
                    </button>
</div>
</div>
{/* Filters */}
<div className="grid grid-cols-4 gap-px bg-outline-variant/20 p-px">
<div className="bg-surface-container-low p-4">
<label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Status</label>
<select className="w-full bg-transparent border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-sm py-1 font-semibold">
<option>ALL_STATUSES</option>
<option>AVAILABLE</option>
<option>OCCUPIED</option>
<option>CLEANING</option>
</select>
</div>
<div className="bg-surface-container-low p-4">
<label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Department</label>
<select className="w-full bg-transparent border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-sm py-1 font-semibold">
<option>CARDIOLOGY</option>
<option>NEUROLOGY</option>
<option>PEDIATRICS</option>
<option>EMERGENCY</option>
</select>
</div>
<div className="bg-surface-container-low p-4">
<label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Floor</label>
<select className="w-full bg-transparent border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-sm py-1 font-semibold">
<option>FLOOR_01</option>
<option>FLOOR_02</option>
<option>FLOOR_03</option>
</select>
</div>
<div className="bg-surface-container-low p-4 flex items-end">
<button className="w-full h-10 border border-outline-variant hover:bg-surface-container-high transition-all text-xs font-bold uppercase tracking-widest">Clear All Filters</button>
</div>
</div>
</div>
{/* Table View */}
<div className="flex-1 overflow-hidden flex">
<div className="flex-1 overflow-auto custom-scrollbar bg-white">
<table className="w-full text-left border-collapse">
<thead className="sticky top-0 bg-surface-container-highest z-10">
<tr>
<th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface">Room ID</th>
<th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface">Department</th>
<th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface">Status</th>
<th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface">Floor</th>
<th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface">Patient</th>
<th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface">Last Clean</th>
</tr>
</thead>
<tbody className="divide-y-0">
{/* Row 1 */}
<tr className="group hover:bg-surface-container transition-colors cursor-pointer border-b border-surface-container-low">
<td className="px-6 py-4 font-mono text-sm font-bold text-primary">RM-402-A</td>
<td className="px-6 py-4 text-sm font-semibold">Cardiology</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-tighter">
<span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                    AVAILABLE
                                </span>
</td>
<td className="px-6 py-4 text-sm">Floor 04</td>
<td className="px-6 py-4 text-sm opacity-40 italic">Vacant</td>
<td className="px-6 py-4 text-xs font-medium text-outline">2h 15m ago</td>
</tr>
{/* Row 2 */}
<tr className="group bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border-b border-surface-container-low">
<td className="px-6 py-4 font-mono text-sm font-bold text-primary">RM-402-B</td>
<td className="px-6 py-4 text-sm font-semibold">Cardiology</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-tighter">
<span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                    OCCUPIED
                                </span>
</td>
<td className="px-6 py-4 text-sm">Floor 04</td>
<td className="px-6 py-4 text-sm font-bold">Jonathan Doe</td>
<td className="px-6 py-4 text-xs font-medium text-outline">18h 30m ago</td>
</tr>
{/* Row 3 */}
<tr className="group hover:bg-surface-container transition-colors cursor-pointer border-b border-surface-container-low">
<td className="px-6 py-4 font-mono text-sm font-bold text-primary">RM-201-C</td>
<td className="px-6 py-4 text-sm font-semibold">Neurology</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-tighter">
<span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    CLEANING
                                </span>
</td>
<td className="px-6 py-4 text-sm">Floor 02</td>
<td className="px-6 py-4 text-sm opacity-40 italic">Vacant</td>
<td className="px-6 py-4 text-xs font-medium text-outline">In Progress</td>
</tr>
{/* Row 4 */}
<tr className="group bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border-b border-surface-container-low">
<td className="px-6 py-4 font-mono text-sm font-bold text-primary">RM-202-A</td>
<td className="px-6 py-4 text-sm font-semibold">Neurology</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-tighter">
<span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                    OCCUPIED
                                </span>
</td>
<td className="px-6 py-4 text-sm">Floor 02</td>
<td className="px-6 py-4 text-sm font-bold">Alice Thompson</td>
<td className="px-6 py-4 text-xs font-medium text-outline">6h 12m ago</td>
</tr>
{/* Row 5 */}
<tr className="group hover:bg-surface-container transition-colors cursor-pointer border-b border-surface-container-low">
<td className="px-6 py-4 font-mono text-sm font-bold text-primary">RM-105-D</td>
<td className="px-6 py-4 text-sm font-semibold">Pediatrics</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-tighter">
<span className="h-2 w-2 bg-green-500 rounded-full"></span>
                                    AVAILABLE
                                </span>
</td>
<td className="px-6 py-4 text-sm">Floor 01</td>
<td className="px-6 py-4 text-sm opacity-40 italic">Vacant</td>
<td className="px-6 py-4 text-xs font-medium text-outline">45m ago</td>
</tr>
{/* Row 6 */}
<tr className="group bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border-b border-surface-container-low">
<td className="px-6 py-4 font-mono text-sm font-bold text-primary">RM-112-F</td>
<td className="px-6 py-4 text-sm font-semibold">Pediatrics</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-tighter">
<span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                    OCCUPIED
                                </span>
</td>
<td className="px-6 py-4 text-sm">Floor 01</td>
<td className="px-6 py-4 text-sm font-bold">Marcus Chen</td>
<td className="px-6 py-4 text-xs font-medium text-outline">12h 00m ago</td>
</tr>
</tbody>
</table>
</div>
{/* Right Drawer */}
<div className="w-96 bg-surface-container-lowest border-l border-outline-variant/20 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
<div className="p-6 border-b border-surface-container-low flex justify-between items-center">
<h2 className="text-xs font-black uppercase tracking-widest text-primary">Room_Details_Panel</h2>
<button className="p-1 hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar p-6">
<div className="mb-8">
<span className="text-xs font-bold uppercase tracking-widest text-outline">Current Active Entity</span>
<div className="text-3xl font-light font-headline text-on-surface mt-2">RM-402-B</div>
<div className="flex gap-2 mt-4">
<span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-black uppercase">Occupied</span>
<span className="px-2 py-1 bg-surface-container-highest text-on-surface text-[10px] font-black uppercase tracking-tighter">Critical Care</span>
</div>
</div>
<div className="space-y-6">
<div className="p-4 bg-surface-container-low">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Patient Information</div>
<div className="flex items-center gap-4">
<div className="h-10 w-10 bg-primary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-primary">person</span>
</div>
<div>
<div className="text-sm font-bold">Jonathan Doe</div>
<div className="text-[10px] font-medium opacity-60">DOB: 12/04/1985 • Male</div>
</div>
</div>
</div>
<div className="p-4 bg-surface-container-low">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Facility Status</div>
<div className="space-y-3">
<div className="flex justify-between text-xs">
<span className="font-medium">Oxygen Supply</span>
<span className="text-primary font-bold">OPTIMAL</span>
</div>
<div className="flex justify-between text-xs">
<span className="font-medium">Heart Monitor</span>
<span className="text-primary font-bold">CONNECTED</span>
</div>
<div className="flex justify-between text-xs">
<span className="font-medium">Environment Temp</span>
<span className="font-bold">22.4°C</span>
</div>
</div>
</div>
<div className="p-4 bg-surface-container-low">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Update Room Status</div>
<div className="grid grid-cols-2 gap-2">
<button className="py-3 bg-white text-[10px] font-bold uppercase border border-outline-variant hover:border-primary transition-colors">Mark Cleaning</button>
<button className="py-3 bg-white text-[10px] font-bold uppercase border border-outline-variant hover:border-primary transition-colors">Mark Available</button>
</div>
</div>
</div>
<div className="mt-8">
<div className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">Event Log</div>
<div className="space-y-4 border-l border-outline-variant/50 ml-2 pl-4">
<div className="relative">
<div className="absolute -left-[21px] top-1 h-2 w-2 bg-primary"></div>
<div className="text-xs font-bold uppercase tracking-tight">Status Change: OCCUPIED</div>
<div className="text-[10px] opacity-60 mt-1">Today, 08:42 AM by ADM_L_KING</div>
</div>
<div className="relative opacity-60">
<div className="absolute -left-[21px] top-1 h-2 w-2 bg-outline"></div>
<div className="text-xs font-bold uppercase tracking-tight">Cleaning Completed</div>
<div className="text-[10px] mt-1">Today, 08:15 AM by STAFF_CLEAN_04</div>
</div>
</div>
</div>
</div>
<div className="p-6 bg-surface-container-low flex flex-col gap-2">
<button className="w-full bg-primary-container text-white py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-colors">Save Room Updates</button>
<button className="w-full bg-white text-on-surface py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container-high transition-colors">Discharge Patient</button>
</div>
</div>
</div>

</main>
    </>
  );
}
