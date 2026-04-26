import Image from "next/image";

export default function PatientAppointmentsPage() {
  return (
    <>
      <main>

{/* TopNavBar (JSON Derived) */}
<header className="bg-white dark:bg-neutral-950 flex justify-between items-center px-6 w-full max-w-none h-16 shrink-0 border-b-0 bg-neutral-100 dark:bg-neutral-900">
<div className="flex items-center gap-4">
<span className="text-lg font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">HMS Precision</span>
<div className="h-4 w-px bg-neutral-300 mx-2"></div>
<nav className="flex items-center gap-6">
<span className="text-neutral-400 text-sm">Dashboard</span>
<span className="text-neutral-400 text-sm">/</span>
<span className="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-semibold text-sm py-5">Appointments</span>
</nav>
</div>
<div className="flex items-center gap-6">
<div className="relative">
<input className="bg-surface-container-low border-0 border-b-2 border-outline px-4 py-1.5 text-sm focus:ring-0 focus:border-primary w-64 transition-all" placeholder="Search Patient ID..." type="text"/>
</div>
<div className="flex items-center gap-4 text-neutral-600">
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors" data-icon="settings">settings</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors" data-icon="help">help</span>
<div className="h-8 w-8 bg-neutral-200 overflow-hidden">
<Image alt="User profile" className="h-full w-full object-cover" data-alt="professional portrait of a medical administrator in a clean modern clinical setting with soft natural light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-vVbeWD4kwISaeRFRKlvVuqSENkHizYgzcJdOOF4FwTvt3DPCoh1zzdyLnAESMlxiwh1nkSXpAJMCwsXtuKDRPmGQ_0p6PpKYx4K8hiHJjQA_iiMxJavSoGcbsE2K-ZgTgghKayjvGuDkU2J28sAdebZYqfd4gH_jq0sLDw_jCF9r5O1fVLARLWZt7kFW6LMYwSnllk-K4pA6mbPLCiiPPsga7RxW96Hfyz6C_xLwGVKKB1mH72FN0LMA2hCpBJydGGhS9pRNgw" width={1200} height={800}/>
</div>
</div>
</div>
</header>
{/* Content Canvas */}
<section className="flex-1 overflow-y-auto bg-surface-container-low p-8">
<div className="max-w-6xl mx-auto space-y-8">
{/* Page Header & Filter */}
<div className="flex justify-between items-end">
<div>
<h2 className="text-4xl font-light text-on-surface tracking-tight">Patient Appointments</h2>
<p className="text-on-surface-variant text-sm mt-2">Manage upcoming clinical sessions and review historical patient visits.</p>
</div>
{/* Segmented Control */}
<div className="flex bg-surface-container-high p-1">
<button className="px-6 py-2 text-xs font-bold uppercase tracking-widest bg-white text-primary shadow-sm">Upcoming</button>
<button className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:bg-white/50 transition-colors">Past</button>
<button className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:bg-white/50 transition-colors">All</button>
</div>
</div>
{/* Appointment List Area */}
<div className="space-y-4">
{/* Card Header Row (Logical) */}
<div className="grid grid-cols-12 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
<div className="col-span-2">Date &amp; Time</div>
<div className="col-span-3">Physician</div>
<div className="col-span-3">Department</div>
<div className="col-span-2">Status</div>
<div className="col-span-2 text-right">Actions</div>
</div>
{/* Appointment Card 1 */}
<div className="grid grid-cols-12 items-center bg-surface px-6 py-6 border-b-2 border-transparent hover:border-primary-container hover:bg-surface-container-lowest transition-all group">
<div className="col-span-2">
<p className="text-lg font-semibold tabular-nums leading-none">Oct 24, 2023</p>
<p className="text-xs text-on-surface-variant mt-1 tabular-nums">09:30 AM — 10:15 AM</p>
</div>
<div className="col-span-3 flex items-center gap-3">
<div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
</div>
<div>
<p className="font-semibold text-sm">Dr. Sarah Kensington</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Lead Cardiologist</p>
</div>
</div>
<div className="col-span-3">
<p className="text-sm font-medium">Cardiovascular Unit</p>
<p className="text-[10px] text-on-surface-variant">Wing B, Room 402</p>
</div>
<div className="col-span-2">
<span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest">
                                Confirmed
                            </span>
</div>
<div className="col-span-2 text-right">
<button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline transition-all">View details</button>
</div>
</div>
{/* Appointment Card 2 */}
<div className="grid grid-cols-12 items-center bg-surface px-6 py-6 border-b-2 border-transparent hover:border-primary-container hover:bg-surface-container-lowest transition-all group">
<div className="col-span-2">
<p className="text-lg font-semibold tabular-nums leading-none">Oct 26, 2023</p>
<p className="text-xs text-on-surface-variant mt-1 tabular-nums">02:00 PM — 02:30 PM</p>
</div>
<div className="col-span-3 flex items-center gap-3">
<div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
</div>
<div>
<p className="font-semibold text-sm">Dr. Michael Chen</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Radiology Specialist</p>
</div>
</div>
<div className="col-span-3">
<p className="text-sm font-medium">Diagnostic Imaging</p>
<p className="text-[10px] text-on-surface-variant">Main Lab, Floor 1</p>
</div>
<div className="col-span-2">
<span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-widest">
                                Pending Lab
                            </span>
</div>
<div className="col-span-2 text-right">
<button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline transition-all">View details</button>
</div>
</div>
{/* Appointment Card 3 */}
<div className="grid grid-cols-12 items-center bg-surface px-6 py-6 border-b-2 border-transparent hover:border-primary-container hover:bg-surface-container-lowest transition-all group">
<div className="col-span-2">
<p className="text-lg font-semibold tabular-nums leading-none">Nov 02, 2023</p>
<p className="text-xs text-on-surface-variant mt-1 tabular-nums">11:00 AM — 11:45 AM</p>
</div>
<div className="col-span-3 flex items-center gap-3">
<div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
</div>
<div>
<p className="font-semibold text-sm">Dr. Elena Rodriguez</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Neurology Consultant</p>
</div>
</div>
<div className="col-span-3">
<p className="text-sm font-medium">Neurosciences Center</p>
<p className="text-[10px] text-on-surface-variant">South Wing, Suite 88</p>
</div>
<div className="col-span-2">
<span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest">
                                Pre-Cleared
                            </span>
</div>
<div className="col-span-2 text-right">
<button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline transition-all">View details</button>
</div>
</div>
{/* Appointment Card 4 */}
<div className="grid grid-cols-12 items-center bg-surface px-6 py-6 border-b-2 border-transparent hover:border-primary-container hover:bg-surface-container-lowest transition-all group opacity-60">
<div className="col-span-2">
<p className="text-lg font-semibold tabular-nums leading-none">Nov 12, 2023</p>
<p className="text-xs text-on-surface-variant mt-1 tabular-nums">04:15 PM — 04:45 PM</p>
</div>
<div className="col-span-3 flex items-center gap-3">
<div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="person">person</span>
</div>
<div>
<p className="font-semibold text-sm">Dr. Arthur Vance</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">General Practitioner</p>
</div>
</div>
<div className="col-span-3">
<p className="text-sm font-medium">Internal Medicine</p>
<p className="text-[10px] text-on-surface-variant">General Ward, Floor 2</p>
</div>
<div className="col-span-2">
<span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest">
                                Cancelled
                            </span>
</div>
<div className="col-span-2 text-right">
<button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline transition-all">Re-book</button>
</div>
</div>
</div>
{/* Footer Summary / Data Monoliths */}
<div className="grid grid-cols-4 gap-8 pt-8 border-t border-surface-container-highest">
<div className="bg-surface-container-highest p-6 space-y-1">
<p className="text-3xl font-light tabular-nums leading-tight">04</p>
<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pending Checkups</p>
</div>
<div className="bg-surface-container-highest p-6 space-y-1">
<p className="text-3xl font-light tabular-nums leading-tight">12</p>
<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Completed This Month</p>
</div>
<div className="bg-primary-container p-6 space-y-1">
<p className="text-3xl font-light tabular-nums text-white leading-tight">24h</p>
<p className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed">Avg Response Time</p>
</div>
<div className="bg-surface-container-highest p-6 space-y-1">
<p className="text-3xl font-light tabular-nums leading-tight">98%</p>
<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Patient Satisfaction</p>
</div>
</div>
</div>
</section>

</main>
    </>
  );
}
