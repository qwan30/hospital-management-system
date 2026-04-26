
export default function QueueBoardPage() {
  return (
    <>
      <main>

{/* Header Section */}
<header className="mb-8 flex justify-between items-end">
<div>
<h1 className="text-4xl font-light tracking-tight text-on-surface mb-2">Queue Board</h1>
<p className="text-sm text-on-surface-variant font-medium uppercase tracking-widest">Main Lobby Entrance • Unit 4B</p>
</div>
<div className="flex gap-4">
<div className="bg-surface-container-highest px-6 py-4 flex flex-col justify-center">
<span className="text-xs font-bold uppercase tracking-tighter text-outline">Average Wait</span>
<span className="text-2xl font-semibold text-primary">14m</span>
</div>
<div className="bg-surface-container-highest px-6 py-4 flex flex-col justify-center">
<span className="text-xs font-bold uppercase tracking-tighter text-outline">Active Patients</span>
<span className="text-2xl font-semibold text-on-surface">32</span>
</div>
</div>
</header>
{/* Search and Filter Bar */}
<div className="bg-surface-container-low p-4 flex justify-between items-center mb-0 border-b border-outline-variant/10">
<div className="flex bg-white">
<button className="px-6 py-2 text-xs font-bold uppercase tracking-widest bg-primary-container text-white">Waiting</button>
<button className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-high transition-colors">Ready</button>
<button className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container-high transition-colors">In progress</button>
</div>
<div className="flex items-center gap-4 w-96">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
<input className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline py-2 pl-10 text-xs font-medium uppercase tracking-widest focus:ring-0 focus:border-primary transition-colors" placeholder="FILTER QUEUE..." type="text"/>
</div>
</div>
</div>
{/* Table Container (High Density) */}
<div className="bg-white overflow-hidden">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
<th className="px-4 py-3">Queue #</th>
<th className="px-4 py-3">Patient</th>
<th className="px-4 py-3">Doctor</th>
<th className="px-4 py-3">Checked in at</th>
<th className="px-4 py-3">Wait Duration</th>
<th className="px-4 py-3">State</th>
<th className="px-4 py-3 text-right">Actions</th>
</tr>
</thead>
<tbody className="text-sm">
{/* Row 1: Long Wait (Yellow) */}
<tr className="hover:bg-surface-container-low border-b border-surface-container transition-colors group">
<td className="px-4 py-4 font-bold text-primary">#4021</td>
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">ELIAS, NATHANIEL</span>
<span className="text-[10px] text-outline-variant font-bold uppercase">ID: 882-192-00</span>
</div>
</td>
<td className="px-4 py-4 text-on-surface-variant font-medium">DR. SARAH CHEN</td>
<td className="px-4 py-4 text-on-surface-variant">09:12 AM</td>
<td className="px-4 py-4">
<span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 text-[10px] font-bold uppercase">24m 12s</span>
</td>
<td className="px-4 py-4">
<span className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
<span className="w-1.5 h-1.5 bg-tertiary"></span>
                                Priority 2
                            </span>
</td>
<td className="px-4 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-primary-container p-1"><span className="material-symbols-outlined">edit</span></button>
<button className="text-on-surface p-1"><span className="material-symbols-outlined">more_vert</span></button>
</td>
</tr>
{/* Row 2: Standard Wait (Green) */}
<tr className="hover:bg-surface-container-low border-b border-surface-container transition-colors group">
<td className="px-4 py-4 font-bold text-primary">#4022</td>
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">VAUGHN, REBECCA</span>
<span className="text-[10px] text-outline-variant font-bold uppercase">ID: 104-552-91</span>
</div>
</td>
<td className="px-4 py-4 text-on-surface-variant font-medium">DR. MARCUS WRIGHT</td>
<td className="px-4 py-4 text-on-surface-variant">09:28 AM</td>
<td className="px-4 py-4">
<span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 text-[10px] font-bold uppercase">08m 45s</span>
</td>
<td className="px-4 py-4">
<span className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
<span className="w-1.5 h-1.5 bg-secondary"></span>
                                Routine
                            </span>
</td>
<td className="px-4 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-primary-container p-1"><span className="material-symbols-outlined">edit</span></button>
<button className="text-on-surface p-1"><span className="material-symbols-outlined">more_vert</span></button>
</td>
</tr>
{/* Row 3: Critical (Red) */}
<tr className="hover:bg-surface-container-low border-b border-surface-container transition-colors group">
<td className="px-4 py-4 font-bold text-primary">#4019</td>
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">GRANT, WILLIAM</span>
<span className="text-[10px] text-outline-variant font-bold uppercase">ID: 291-002-83</span>
</div>
</td>
<td className="px-4 py-4 text-on-surface-variant font-medium">DR. SARAH CHEN</td>
<td className="px-4 py-4 text-on-surface-variant">08:45 AM</td>
<td className="px-4 py-4">
<span className="bg-error-container text-on-error-container px-2 py-0.5 text-[10px] font-bold uppercase">51m 02s</span>
</td>
<td className="px-4 py-4">
<span className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
<span className="w-1.5 h-1.5 bg-error"></span>
                                Delayed
                            </span>
</td>
<td className="px-4 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-primary-container p-1"><span className="material-symbols-outlined">edit</span></button>
<button className="text-on-surface p-1"><span className="material-symbols-outlined">more_vert</span></button>
</td>
</tr>
{/* Row 4: Standard Wait */}
<tr className="hover:bg-surface-container-low border-b border-surface-container transition-colors group">
<td className="px-4 py-4 font-bold text-primary">#4023</td>
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">LOPEZ, MARIA</span>
<span className="text-[10px] text-outline-variant font-bold uppercase">ID: 772-110-39</span>
</div>
</td>
<td className="px-4 py-4 text-on-surface-variant font-medium">DR. EMMA FOSTER</td>
<td className="px-4 py-4 text-on-surface-variant">09:32 AM</td>
<td className="px-4 py-4">
<span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 text-[10px] font-bold uppercase">04m 19s</span>
</td>
<td className="px-4 py-4">
<span className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
<span className="w-1.5 h-1.5 bg-secondary"></span>
                                Routine
                            </span>
</td>
<td className="px-4 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-primary-container p-1"><span className="material-symbols-outlined">edit</span></button>
<button className="text-on-surface p-1"><span className="material-symbols-outlined">more_vert</span></button>
</td>
</tr>
{/* Row 5: Urgent */}
<tr className="hover:bg-surface-container-low border-b border-surface-container transition-colors group">
<td className="px-4 py-4 font-bold text-primary">#4024</td>
<td className="px-4 py-4">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">SMITH, ROBERT</span>
<span className="text-[10px] text-outline-variant font-bold uppercase">ID: 990-221-55</span>
</div>
</td>
<td className="px-4 py-4 text-on-surface-variant font-medium">DR. MARCUS WRIGHT</td>
<td className="px-4 py-4 text-on-surface-variant">09:35 AM</td>
<td className="px-4 py-4">
<span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 text-[10px] font-bold uppercase">01m 55s</span>
</td>
<td className="px-4 py-4">
<span className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
<span className="w-1.5 h-1.5 bg-primary"></span>
                                Urgent
                            </span>
</td>
<td className="px-4 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-primary-container p-1"><span className="material-symbols-outlined">edit</span></button>
<button className="text-on-surface p-1"><span className="material-symbols-outlined">more_vert</span></button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination / Footer Metadata */}
<div className="mt-8 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-outline">
<div>Displaying 5 of 12 waiting patients</div>
<div className="flex gap-4 items-center">
<span className="flex items-center gap-1"><span className="w-2 h-2 bg-secondary"></span> Within Target</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 bg-tertiary"></span> Review Required</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 bg-error"></span> SLA Breach</span>
</div>
<div className="flex bg-surface-container">
<button className="px-4 py-2 hover:bg-surface-container-high border-r border-outline-variant/10 transition-colors">Prev</button>
<button className="px-4 py-2 hover:bg-surface-container-high transition-colors">Next</button>
</div>
</div>
{/* Secondary Section: Staff Allocation Bento Grid */}
<section className="mt-16">
<h2 className="text-sm font-extrabold uppercase tracking-[0.3em] text-outline mb-6">Physician Allocation</h2>
<div className="grid grid-cols-12 gap-0">
{/* Physician Card 1 */}
<div className="col-span-12 md:col-span-4 bg-white p-6 border-r border-b border-surface-container">
<div className="flex justify-between items-start mb-6">
<div>
<p className="text-[10px] font-bold uppercase text-primary mb-1">On Duty</p>
<h3 className="text-xl font-semibold uppercase">Dr. Sarah Chen</h3>
</div>
<span className="material-symbols-outlined text-outline">clinical_notes</span>
</div>
<div className="space-y-4">
<div className="flex justify-between text-xs">
<span className="text-outline uppercase tracking-wider">Queue Load</span>
<span className="font-bold">8 / 10 Patients</span>
</div>
<div className="w-full bg-surface-container h-1">
<div className="bg-primary h-full" ></div>
</div>
<p className="text-[10px] text-on-surface-variant font-medium leading-relaxed italic">Currently attending to Emergency Triage #201. Expected finish in 12m.</p>
</div>
</div>
{/* Physician Card 2 */}
<div className="col-span-12 md:col-span-4 bg-white p-6 border-r border-b border-surface-container">
<div className="flex justify-between items-start mb-6">
<div>
<p className="text-[10px] font-bold uppercase text-secondary mb-1">Available</p>
<h3 className="text-xl font-semibold uppercase">Dr. Marcus Wright</h3>
</div>
<span className="material-symbols-outlined text-outline">stethoscope</span>
</div>
<div className="space-y-4">
<div className="flex justify-between text-xs">
<span className="text-outline uppercase tracking-wider">Queue Load</span>
<span className="font-bold">2 / 10 Patients</span>
</div>
<div className="w-full bg-surface-container h-1">
<div className="bg-secondary h-full" ></div>
</div>
<p className="text-[10px] text-on-surface-variant font-medium leading-relaxed italic">Completing paperwork for room discharge. Accepting new walk-ins.</p>
</div>
</div>
{/* Physician Card 3 */}
<div className="col-span-12 md:col-span-4 bg-surface-container-high p-6 border-b border-surface-container">
<div className="flex justify-between items-start mb-6">
<div>
<p className="text-[10px] font-bold uppercase text-outline mb-1">On Break</p>
<h3 className="text-xl font-semibold uppercase text-outline">Dr. Emma Foster</h3>
</div>
<span className="material-symbols-outlined text-outline">coffee</span>
</div>
<div className="flex flex-col justify-center h-20 border-t border-dashed border-outline-variant/30">
<p className="text-xs font-bold uppercase tracking-widest text-outline text-center">Scheduled Return: 10:30 AM</p>
</div>
</div>
</div>
</section>

</main>
    </>
  );
}
