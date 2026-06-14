import Image from "next/image";

import { HcIcon } from "@/components/ui/hc-icon";
export default function PatientRecordBrowserPage() {
  return (
    <>
      <main>

{/* Left Pane: Search and List (5/12 columns equivalent) */}
<div className="w-[41.66%] bg-white border-r-0 flex flex-col h-full z-10">
<div className="p-8 space-y-6">
<div className="space-y-1">
<label className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline">Patient Directory</label>
<h1 className="text-3xl font-light tracking-tight text-on-background">Search Records</h1>
</div>
<div className="relative group">
<input className="w-full bg-surface-container-low border-0 border-b-2 border-outline p-4 pr-12 focus:ring-0 focus:border-primary transition-all font-body text-sm placeholder:text-outline placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest" placeholder="Search by name, ID or DOB..." type="text"/>
<HcIcon name="search" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary" />
</div>
<div className="flex gap-2 overflow-x-auto pb-2">
<button className="whitespace-nowrap px-3 py-1 bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest">Active</button>
<button className="whitespace-nowrap px-3 py-1 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors">Inpatient</button>
<button className="whitespace-nowrap px-3 py-1 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors">Emergency</button>
<button className="whitespace-nowrap px-3 py-1 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors">Follow-up</button>
</div>
</div>
<div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4">
{/* Patient Card Active */}
<div className="p-6 bg-surface-container-lowest border-l-4 border-primary transition-all cursor-pointer">
<div className="flex justify-between items-start mb-4">
<div>
<h3 className="font-bold text-on-background text-lg leading-tight">Sarah J. Miller</h3>
<p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">ID: #MC-902341</p>
</div>
<span className="text-[10px] font-bold px-2 py-0.5 bg-error-container text-on-error-container uppercase">Critical</span>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-low p-2">
<span className="block text-[9px] text-outline font-bold uppercase">Age / Sex</span>
<span className="text-xs font-semibold">34 / Female</span>
</div>
<div className="bg-surface-container-low p-2">
<span className="block text-[9px] text-outline font-bold uppercase">Last Visit</span>
<span className="text-xs font-semibold">Oct 12, 2023</span>
</div>
</div>
</div>
{/* Patient Card */}
<div className="p-6 bg-surface-container-high hover:bg-surface-container-lowest transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-4">
<div>
<h3 className="font-bold text-on-background text-lg leading-tight group-hover:text-primary">Marcus V. Thorne</h3>
<p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">ID: #MC-902352</p>
</div>
<span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container-highest text-outline uppercase">Stable</span>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-white/50 p-2">
<span className="block text-[9px] text-outline font-bold uppercase">Age / Sex</span>
<span className="text-xs font-semibold">58 / Male</span>
</div>
<div className="bg-white/50 p-2">
<span className="block text-[9px] text-outline font-bold uppercase">Last Visit</span>
<span className="text-xs font-semibold">Oct 08, 2023</span>
</div>
</div>
</div>
{/* Patient Card */}
<div className="p-6 bg-surface-container-high hover:bg-surface-container-lowest transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-4">
<div>
<h3 className="font-bold text-on-background text-lg leading-tight group-hover:text-primary">Elena Rodriguez</h3>
<p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">ID: #MC-902364</p>
</div>
<span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container-highest text-outline uppercase">Stable</span>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-white/50 p-2">
<span className="block text-[9px] text-outline font-bold uppercase">Age / Sex</span>
<span className="text-xs font-semibold">27 / Female</span>
</div>
<div className="bg-white/50 p-2">
<span className="block text-[9px] text-outline font-bold uppercase">Last Visit</span>
<span className="text-xs font-semibold">Sep 29, 2023</span>
</div>
</div>
</div>
</div>
</div>
{/* Right Pane: Details (7/12 columns equivalent) */}
<div className="flex-1 overflow-y-auto bg-surface-container-low p-8">
<div className="max-w-5xl mx-auto space-y-8">
{/* Identity Section */}
<div className="bg-white p-8 space-y-8">
<div className="flex justify-between items-start">
<div className="flex gap-6 items-center">
<div className="w-24 h-24 bg-surface-container-highest flex-shrink-0">
<Image alt="Sarah J. Miller" className="w-full h-full object-cover grayscale" data-alt="close up headshot of a young woman with a calm professional expression against a soft neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsjvD3G_nUqQ3p-O7i9bGyRfSjfTpbqjwqWZUc4p_TmnHUfq7z_VgiWWlnCtcSS_L-4zmtN1rX3iikTdunpacJvyHD-j82s-BgXDa0TYEqG0BotqoeTJPjFGmcCNGuWAYEy5MzfdIQxgJbFiB81g8nPF-lFWxQGKufqdJmPntnZQLfHpyxeJaklYmCx6QG92dki0JI8KiIfn1OoLfeGJnnsQdWS2gFwT9EeQ1dlwNHEsCndQJeXTtmk5piC3eSlHRSkuGRr9GFCw" width={1200} height={800}/>
</div>
<div>
<span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Active Patient Record</span>
<h2 className="text-4xl font-light tracking-tighter text-on-background mt-1">Sarah J. Miller</h2>
<p className="text-sm text-outline mt-2 font-medium">Primary Physician: <span className="text-on-background">Dr. Julian Vance</span></p>
</div>
</div>
<div className="flex gap-3">
<button className="bg-surface-container-highest p-3 hover:bg-surface-container-high transition-colors"><HcIcon name="edit" className="text-on-surface" /></button>
<button className="bg-surface-container-highest p-3 hover:bg-surface-container-high transition-colors"><HcIcon name="print" className="text-on-surface" /></button>
<button className="bg-primary-container text-white px-6 py-3 font-bold uppercase text-[10px] tracking-widest">Update Record</button>
</div>
</div>
<div className="grid grid-cols-4 gap-8">
<div>
<span className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Date of Birth</span>
<p className="text-sm font-semibold">May 14, 1989 (34y)</p>
</div>
<div>
<span className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Blood Type</span>
<p className="text-sm font-semibold">O Positive (O+)</p>
</div>
<div>
<span className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Contact</span>
<p className="text-sm font-semibold">+1 (555) 012-9934</p>
</div>
<div>
<span className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Insurance</span>
<p className="text-sm font-semibold">BlueShield PPO</p>
</div>
</div>
</div>
<div className="grid grid-cols-2 gap-8">
{/* Conditions & Allergies */}
<div className="bg-white p-8">
<h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-surface-container-highest pb-4 mb-6">Conditions &amp; Allergies</h3>
<div className="space-y-6">
<div className="space-y-3">
<span className="text-[10px] font-bold text-outline uppercase tracking-widest">Medical History</span>
<div className="flex flex-wrap gap-2">
<span className="px-3 py-1.5 bg-surface-container-low text-on-surface text-[11px] font-medium border-l-2 border-outline">Type 1 Diabetes</span>
<span className="px-3 py-1.5 bg-surface-container-low text-on-surface text-[11px] font-medium border-l-2 border-outline">Hypothyroidism</span>
</div>
</div>
<div className="space-y-3">
<span className="text-[10px] font-bold text-error uppercase tracking-widest">Allergies (High Severity)</span>
<div className="flex flex-wrap gap-2">
<span className="px-3 py-1.5 bg-error-container text-on-error-container text-[11px] font-bold border-l-2 border-error">Penicillin</span>
<span className="px-3 py-1.5 bg-error-container text-on-error-container text-[11px] font-bold border-l-2 border-error">Latex</span>
</div>
</div>
</div>
</div>
{/* Appointment History */}
<div className="bg-white p-8">
<div className="flex justify-between items-center border-b-2 border-surface-container-highest pb-4 mb-6">
<h3 className="text-xs font-bold uppercase tracking-widest">Recent Activity</h3>
<button className="text-[10px] font-bold text-primary uppercase tracking-widest">View All</button>
</div>
<div className="space-y-6">
<div className="flex gap-4">
<div className="w-10 h-10 bg-surface-container-low flex items-center justify-center flex-shrink-0">
<HcIcon name="calendar_month" className="text-primary" />
</div>
<div>
<h4 className="text-sm font-bold">Endocrinology Check-up</h4>
<p className="text-xs text-outline">Oct 12, 2023 • Dr. Vance</p>
</div>
</div>
<div className="flex gap-4">
<div className="w-10 h-10 bg-surface-container-low flex items-center justify-center flex-shrink-0">
<HcIcon name="biotech" className="text-primary" />
</div>
<div>
<h4 className="text-sm font-bold">Comprehensive Metabolic Panel</h4>
<p className="text-xs text-outline">Oct 05, 2023 • LabCorp HQ</p>
</div>
</div>
<div className="flex gap-4">
<div className="w-10 h-10 bg-surface-container-low flex items-center justify-center flex-shrink-0">
<HcIcon name="pill" className="text-primary" />
</div>
<div>
<h4 className="text-sm font-bold">Insulin Prescription Refill</h4>
<p className="text-xs text-outline">Sep 28, 2023 • CVS Pharmacy</p>
</div>
</div>
</div>
</div>
</div>
{/* Labs Snapshot (Bento Style) */}
<div className="bg-white p-8">
<h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-surface-container-highest pb-4 mb-6">Vitals &amp; Labs Snapshot</h3>
<div className="grid grid-cols-4 gap-4">
<div className="bg-surface-container-low p-6">
<span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-4">Glucose</span>
<div className="flex items-baseline gap-1">
<span className="text-3xl font-light text-on-background">112</span>
<span className="text-xs font-medium text-outline">mg/dL</span>
</div>
<div className="mt-4 h-1 bg-surface-container-highest relative">
<div className="absolute inset-y-0 left-0 bg-primary w-[70%]"></div>
</div>
</div>
<div className="bg-surface-container-low p-6">
<span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-4">A1C</span>
<div className="flex items-baseline gap-1">
<span className="text-3xl font-light text-error">7.1</span>
<span className="text-xs font-medium text-outline">%</span>
</div>
<div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-error uppercase">
<HcIcon name="trending_up" className="text-[14px]" /> Elevated
                            </div>
</div>
<div className="bg-surface-container-low p-6">
<span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-4">BP</span>
<div className="flex items-baseline gap-1">
<span className="text-3xl font-light text-on-background">118/76</span>
<span className="text-xs font-medium text-outline">mmHg</span>
</div>
<div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
<HcIcon name="check_circle" className="text-[14px]" /> Normal
                            </div>
</div>
<div className="bg-surface-container-low p-6">
<span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-4">Weight</span>
<div className="flex items-baseline gap-1">
<span className="text-3xl font-light text-on-background">142</span>
<span className="text-xs font-medium text-outline">lbs</span>
</div>
<p className="mt-4 text-[10px] font-bold text-outline uppercase">-2 lbs since last visit</p>
</div>
</div>
</div>
{/* Footer-like action area */}
<div className="flex justify-end pt-4 pb-12">
<div className="flex gap-4">
<button className="bg-surface-container-highest text-on-surface px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors">Archive Record</button>
<button className="bg-on-background text-white px-12 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">Schedule Appointment</button>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
