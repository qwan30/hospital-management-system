import Image from "next/image";

import { HcIcon } from "@/components/ui/hc-icon";
export default function NurseIntakeBoardPage() {
  return (
    <>
      <main>

{/* TopNavBar */}
<header className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b-2 border-neutral-900 dark:border-neutral-800 font-public-sans tracking-tighter antialiased">
<div className="flex items-center gap-8">
<span className="text-xl font-bold tracking-widest text-neutral-900 dark:text-white uppercase">HOSPITAL CORE</span>
<div className="relative group">
<HcIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600" />
<input className="bg-surface-container-low border-b-2 border-neutral-900 focus:border-blue-600 focus:ring-0 w-80 pl-10 pr-4 py-1 text-xs font-semibold uppercase placeholder:text-neutral-400 outline-none transition-all" placeholder="SEARCH PATIENT, ID, OR CLINICIAN..." type="text"/>
</div>
</div>
<div className="flex items-center gap-2">
<button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors active:bg-neutral-200">
<HcIcon name="notifications" />
</button>
<button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors active:bg-neutral-200">
<HcIcon name="help" />
</button>
<div className="h-8 w-[2px] bg-neutral-200 dark:bg-neutral-800 mx-2"></div>
<div className="flex items-center gap-3 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
<div className="text-right">
<p className="text-[10px] font-bold uppercase leading-none">Nurse Sarah Chen</p>
<p className="text-[9px] text-neutral-500 uppercase">Shift Lead • Ward 4C</p>
</div>
<Image alt="User Profile Avatar" className="w-8 h-8 grayscale" data-alt="professional portrait of a female nurse in blue scrubs with a warm and focused expression" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTBrouVq_vDn_wN1T7LJqW3K8Sdz-g73F9f11rWaGanQsQ1ZN3SICIbtTI3_3JL64fEFOIzb2HFKqrMdytFLviQ3HPQqLL_mZ1Lymw0_E0MKoG4uLZkmAwQ49V2EYm15d6wVvs1641VkRPxnUxW6hacHunrFHhF3coLgyHuDWCKoCgj1X-MWXgb00SfiIB4dXmzxkUHNO_FhrGoorJ6WIMI0X_SzdxMM-N6Tw4N4ZuJcWnA-2Z5E0CsQw8d7Nw_s14cxOpgnhUJA" width={1200} height={800}/>
</div>
</div>
</header>
{/* Page Content */}
<div className="flex-1 overflow-y-auto p-8 space-y-8">
{/* KPI Mini Cards Row */}
<div className="grid grid-cols-12 gap-8">
<div className="col-span-4 bg-surface-container-highest p-6 flex flex-col justify-between h-32 relative overflow-hidden">
<div className="z-10">
<p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Waiting Room</p>
<p className="text-4xl font-light text-neutral-900">14</p>
</div>
<div className="z-10 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
<HcIcon name="trending_up" className="text-sm" />
<span>+2 from last hour</span>
</div>
<div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
<HcIcon name="groups" className="text-9xl" />
</div>
</div>
<div className="col-span-4 bg-surface-container-highest p-6 flex flex-col justify-between h-32 relative overflow-hidden">
<div className="z-10">
<p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Currently Checked-in</p>
<p className="text-4xl font-light text-neutral-900">28</p>
</div>
<div className="z-10 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
<HcIcon name="timer" className="text-sm" />
<span>Avg. Wait: 12m</span>
</div>
</div>
<div className="col-span-4 bg-surface-container-highest p-6 flex flex-col justify-between h-32 relative overflow-hidden border-r-4 border-error">
<div className="z-10">
<p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Overdue / Critical</p>
<p className="text-4xl font-light text-error">03</p>
</div>
<div className="z-10 flex items-center gap-2 text-[10px] font-bold text-error uppercase">
<HcIcon name="warning" className="text-sm" />
<span>Requires Immediate Action</span>
</div>
</div>
</div>
{/* Main Dashboard Grid */}
<div className="grid grid-cols-12 gap-8 items-start">
{/* Left: Time-grouped Appointment List (5 cols) */}
<section className="col-span-5 space-y-6">
<div className="flex justify-between items-end border-b-2 border-neutral-900 pb-2">
<h2 className="text-lg font-black uppercase tracking-tighter">Daily Intake Schedule</h2>
<p className="text-[10px] font-bold text-neutral-500">OCTOBER 24, 2023</p>
</div>
<div className="space-y-8">
{/* Group: 09:00 AM */}
<div className="space-y-4">
<div className="flex items-center gap-4">
<span className="text-xs font-black text-blue-600 uppercase">09:00 AM</span>
<div className="flex-1 h-[1px] bg-neutral-200"></div>
</div>
<div className="space-y-1">
{/* Patient Item Active */}
<div className="bg-surface-container-lowest p-4 border-l-4 border-blue-600 flex items-center gap-4 group cursor-pointer hover:bg-surface-container-high transition-colors">
<div className="w-10 h-10 bg-neutral-100 flex items-center justify-center font-bold text-neutral-400">AM</div>
<div className="flex-1">
<h4 className="text-sm font-bold uppercase tracking-tight">Arthur Morgan</h4>
<p className="text-[10px] text-neutral-500 uppercase font-semibold">Post-Op Follow-up • Dr. Adler</p>
</div>
<HcIcon name="chevron_right" className="text-blue-600" />
</div>
{/* Patient Item */}
<div className="bg-surface p-4 border-l-4 border-transparent flex items-center gap-4 cursor-pointer hover:bg-neutral-100 transition-colors">
<div className="w-10 h-10 bg-neutral-100 flex items-center justify-center font-bold text-neutral-400">JM</div>
<div className="flex-1">
<h4 className="text-sm font-bold uppercase tracking-tight">John Marston</h4>
<p className="text-[10px] text-neutral-500 uppercase font-semibold">Triage Routine • Dr. Miller</p>
</div>
<div className="text-[10px] font-bold text-neutral-400 uppercase">Checked-In</div>
</div>
</div>
</div>
{/* Group: 10:00 AM */}
<div className="space-y-4">
<div className="flex items-center gap-4">
<span className="text-xs font-black text-neutral-400 uppercase">10:00 AM</span>
<div className="flex-1 h-[1px] bg-neutral-200"></div>
</div>
<div className="space-y-1">
<div className="bg-surface p-4 border-l-4 border-error flex items-center gap-4 cursor-pointer hover:bg-neutral-100 transition-colors">
<div className="w-10 h-10 bg-error-container text-error flex items-center justify-center font-bold">SM</div>
<div className="flex-1">
<h4 className="text-sm font-bold uppercase tracking-tight">Sadie Miller</h4>
<p className="text-[10px] text-neutral-500 uppercase font-semibold">Emergency Chest Pain • Triage 1</p>
</div>
<HcIcon name="priority_high" className="text-error" />
</div>
<div className="bg-surface p-4 border-l-4 border-transparent flex items-center gap-4 cursor-pointer hover:bg-neutral-100 transition-colors">
<div className="w-10 h-10 bg-neutral-100 flex items-center justify-center font-bold text-neutral-400">DB</div>
<div className="flex-1">
<h4 className="text-sm font-bold uppercase tracking-tight">Dutch Van-Der-Linde</h4>
<p className="text-[10px] text-neutral-500 uppercase font-semibold">Consultation • Dr. Strauss</p>
</div>
<div className="text-[10px] font-bold text-neutral-400 uppercase">Waiting</div>
</div>
</div>
</div>
</div>
</section>
{/* Center: Selected Patient Card (4 cols) */}
<section className="col-span-4 bg-white border-2 border-neutral-900 p-8 space-y-8">
<div className="space-y-2">
<div className="flex justify-between items-start">
<span className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">ACTIVE SESSION</span>
<span className="text-neutral-400 text-[10px] font-bold">ID: #8829-01</span>
</div>
<h3 className="text-3xl font-black uppercase leading-none tracking-tighter">Arthur Morgan</h3>
<div className="flex gap-4">
<div className="text-[10px] font-bold uppercase"><span className="text-neutral-400 mr-1">AGE</span> 36Y</div>
<div className="text-[10px] font-bold uppercase"><span className="text-neutral-400 mr-1">SEX</span> M</div>
<div className="text-[10px] font-bold uppercase"><span className="text-neutral-400 mr-1">BLOOD</span> O-</div>
</div>
</div>
<div className="space-y-6">
<div className="space-y-1">
<p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Reason for Visit</p>
<p className="text-sm font-semibold uppercase">Post-Operative Wound Assessment - Right Shoulder. Patient reports mild discomfort during movement.</p>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-low p-4">
<p className="text-[9px] font-black text-neutral-400 uppercase mb-1">Status</p>
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-blue-600"></div>
<p className="text-xs font-bold uppercase">Ready for Triage</p>
</div>
</div>
<div className="bg-surface-container-low p-4">
<p className="text-[9px] font-black text-neutral-400 uppercase mb-1">Last Update</p>
<p className="text-xs font-bold uppercase">08:45 AM</p>
</div>
</div>
<div className="space-y-4 pt-4">
<button className="w-full bg-primary-container text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-primary transition-all active:translate-y-1">
                                Complete Intake Check-in
                            </button>
<button className="w-full border-2 border-neutral-900 py-4 text-xs font-black uppercase tracking-widest hover:bg-neutral-100 transition-all active:bg-neutral-200">
                                View Full Medical History
                            </button>
</div>
</div>
</section>
{/* Right: Vitals Summary / Handoff Card (3 cols) */}
<section className="col-span-3 space-y-6">
<div className="bg-surface-container-low p-6 space-y-6">
<div className="flex items-center justify-between">
<h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Quick Vitals</h4>
<HcIcon name="history" className="text-sm text-blue-600" />
</div>
<div className="space-y-4">
<div className="flex justify-between items-end">
<div>
<p className="text-[9px] font-bold text-neutral-400 uppercase">Blood Pressure</p>
<p className="text-xl font-light">118/76 <span className="text-[10px] font-bold uppercase ml-1">mmHg</span></p>
</div>
<div className="text-[9px] font-black text-blue-600 px-1 bg-blue-50">NORMAL</div>
</div>
<div className="w-full h-1 bg-neutral-200">
<div className="w-3/4 h-full bg-blue-600"></div>
</div>
<div className="flex justify-between items-end">
<div>
<p className="text-[9px] font-bold text-neutral-400 uppercase">Heart Rate</p>
<p className="text-xl font-light">72 <span className="text-[10px] font-bold uppercase ml-1">BPM</span></p>
</div>
<div className="text-[9px] font-black text-blue-600 px-1 bg-blue-50">STABLE</div>
</div>
<div className="w-full h-1 bg-neutral-200">
<div className="w-1/2 h-full bg-blue-600"></div>
</div>
<div className="flex justify-between items-end">
<div>
<p className="text-[9px] font-bold text-neutral-400 uppercase">SpO2</p>
<p className="text-xl font-light">98 <span className="text-[10px] font-bold uppercase ml-1">%</span></p>
</div>
<div className="text-[9px] font-black text-blue-600 px-1 bg-blue-50">NORMAL</div>
</div>
</div>
</div>
<div className="bg-neutral-900 p-6 space-y-4">
<div className="flex items-center gap-2">
<HcIcon name="bolt" className="text-blue-500" />
<h4 className="text-[10px] font-black uppercase tracking-widest text-white">Clinical Handoff Insight</h4>
</div>
<p className="text-xs text-neutral-400 font-medium leading-relaxed italic">
                            "Arthur Morgan's BP has trended slightly lower over the last 3 visits. Verify baseline and note current medication compliance for Metoprolol."
                        </p>
<button className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1 hover:text-white transition-colors">
                            ACKNOWLEDGE INSIGHT <HcIcon name="check" className="text-xs" />
</button>
</div>
<div className="bg-surface-container-highest p-6">
<div className="flex items-center gap-2 mb-4">
<HcIcon name="event_note" className="text-sm" />
<h4 className="text-[10px] font-black uppercase tracking-widest">Upcoming Shift Tasks</h4>
</div>
<div className="space-y-3">
<div className="flex items-center gap-3">
<div className="w-4 h-4 border-2 border-neutral-900 flex-shrink-0"></div>
<span className="text-[11px] font-bold uppercase">Restock Triage Unit A</span>
</div>
<div className="flex items-center gap-3">
<div className="w-4 h-4 border-2 border-neutral-900 flex-shrink-0 bg-neutral-900 flex items-center justify-center">
<HcIcon name="check" className="text-[10px] text-white" />
</div>
<span className="text-[11px] font-bold uppercase line-through text-neutral-400">Review Lab Results Room 12</span>
</div>
<div className="flex items-center gap-3">
<div className="w-4 h-4 border-2 border-neutral-900 flex-shrink-0"></div>
<span className="text-[11px] font-bold uppercase">Update Ward Capacity Map</span>
</div>
</div>
</div>
</section>
</div>
</div>

</main>
    </>
  );
}
