import Image from "next/image";

import { HcIcon } from "@/components/ui/hc-icon";
export default function VitalSignsEditorPage() {
  return (
    <>
      <main>

{/* TopAppBar (Authority: Shared Components JSON) */}
<header className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b-2 border-neutral-900 dark:border-neutral-800">
<div className="flex items-center gap-4">
<span className="text-xl font-bold tracking-widest text-neutral-900 dark:text-white uppercase">HOSPITAL CORE</span>
</div>
<div className="flex-1 max-w-md ml-12">
<div className="relative group">
<HcIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
<input className="w-full bg-neutral-100 border-none px-10 py-2 focus:ring-2 focus:ring-blue-600 outline-none text-sm" placeholder="Search patient or record..." type="text"/>
</div>
</div>
<div className="flex items-center gap-2">
<button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-75 active:bg-neutral-200">
<HcIcon name="notifications" className="text-neutral-600" />
</button>
<button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-75 active:bg-neutral-200">
<HcIcon name="help" className="text-neutral-600" />
</button>
<div className="h-8 w-8 bg-blue-600 flex items-center justify-center ml-2">
<HcIcon name="account_circle" className="text-white text-sm" />
</div>
</div>
</header>
{/* Canvas Area */}
<div className="p-12 max-w-6xl w-full mx-auto">
{/* Patient Header / Data Monolith */}
<section className="mb-12 flex flex-col md:flex-row gap-0.5 bg-neutral-900">
<div className="bg-surface-container-lowest p-8 flex-1">
<div className="flex items-center gap-4 mb-4">
<Image alt="Patient Avatar" className="w-16 h-16 grayscale border border-neutral-200" data-alt="professional headshot of an elderly man with kind eyes and short grey hair, monochromatic studio lighting, clean background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_DN6oozxQXNYh74iq__-BrfwcMwbt3ibtXjNtH73O_cScjRfEU03XP22nZbRj68KjSDehAxb2PKdz4Fd3o8TQ3nisTK0oK_Mh7GMmyKGj0aoAXeZXU6dptbN2OhKuxDcfAXxrHqSijtZoMLx7y6c75ltdfy8QRPrAldAtbUouVndleAz2TxhPhJ4HS3Ri1LV9XM9OSHquxxIsWX9KUaORUlg2ZKPCEVs0uAx0qVZWsPr5mn99zWNFBXtjyyTJWEAlKIAJjODwwg" width={1200} height={800}/>
<div>
<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-1">Current Patient</p>
<h2 className="text-3xl font-light tracking-tight text-on-surface">DRS. HARRISON WELLS</h2>
</div>
</div>
<div className="grid grid-cols-3 gap-8 pt-6 border-t border-neutral-100">
<div>
<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">DOB</p>
<p className="text-sm font-semibold">12 SEP 1954 (69Y)</p>
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">ID</p>
<p className="text-sm font-semibold">#MC-9021-X</p>
</div>
<div>
<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</p>
<div className="flex items-center gap-2">
<div className="w-2 h-2 bg-blue-600"></div>
<p className="text-sm font-semibold">IN-PATIENT (WARD 4B)</p>
</div>
</div>
</div>
</div>
<div className="bg-surface-container-highest p-8 w-full md:w-80 flex flex-col justify-center">
<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Last Updated</p>
<p className="text-xl font-light tracking-tight">Today, 08:42 AM</p>
<p className="text-xs text-neutral-500 mt-1">by Dr. Sarah Chen</p>
</div>
</section>
{/* Editor Title */}
<div className="mb-8">
<h3 className="text-xl font-semibold tracking-tight">Vital Signs Recording</h3>
<p className="text-sm text-neutral-500 mt-1">Input mandatory clinical telemetry for nursing rounds.</p>
</div>
{/* Editor Form Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-16">
{/* Left Column */}
<div className="space-y-12">
{/* Blood Pressure */}
<div className="group">
<label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 group-focus-within:text-blue-600 transition-colors">Blood Pressure (Systolic/Diastolic)</label>
<div className="relative bg-surface-container-low p-4">
<input className="w-full bg-transparent border-none border-b-2 border-outline p-0 text-2xl font-light focus:ring-0 focus:border-primary transition-all placeholder:text-neutral-300" placeholder="120/80" type="text"/>
<span className="absolute right-4 bottom-4 text-xs font-bold text-neutral-400 uppercase">mmHg</span>
</div>
<p className="text-[10px] text-neutral-400 mt-2 italic">Standard range: 90/60 to 120/80 mmHg</p>
</div>
{/* Heart Rate */}
<div className="group">
<label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 group-focus-within:text-blue-600 transition-colors">Heart Rate</label>
<div className="relative bg-surface-container-low p-4">
<input className="w-full bg-transparent border-none border-b-2 border-outline p-0 text-2xl font-light focus:ring-0 focus:border-primary transition-all placeholder:text-neutral-300" placeholder="72" type="number"/>
<span className="absolute right-4 bottom-4 text-xs font-bold text-neutral-400 uppercase">BPM</span>
</div>
<p className="text-[10px] text-neutral-400 mt-2 italic">Standard range: 60 to 100 BPM (At rest)</p>
</div>
{/* SpO2 */}
<div className="group">
<label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 group-focus-within:text-blue-600 transition-colors">Oxygen Saturation (SpO2)</label>
<div className="relative bg-surface-container-low p-4">
<input className="w-full bg-transparent border-none border-b-2 border-outline p-0 text-2xl font-light focus:ring-0 focus:border-primary transition-all placeholder:text-neutral-300" placeholder="98" type="number"/>
<span className="absolute right-4 bottom-4 text-xs font-bold text-neutral-400 uppercase">%</span>
</div>
<p className="text-[10px] text-neutral-400 mt-2 italic">Notify staff if saturation drops below 94%</p>
</div>
</div>
{/* Right Column */}
<div className="space-y-12">
{/* Temperature */}
<div className="group">
<label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 group-focus-within:text-blue-600 transition-colors">Body Temperature</label>
<div className="relative bg-surface-container-low p-4">
<input className="w-full bg-transparent border-none border-b-2 border-outline p-0 text-2xl font-light focus:ring-0 focus:border-primary transition-all placeholder:text-neutral-300" placeholder="36.6" step="0.1" type="number"/>
<span className="absolute right-4 bottom-4 text-xs font-bold text-neutral-400 uppercase">°C</span>
</div>
<p className="text-[10px] text-neutral-400 mt-2 italic">Standard oral range: 36.5°C to 37.2°C</p>
</div>
{/* Respiratory Rate */}
<div className="group">
<label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 group-focus-within:text-blue-600 transition-colors">Respiratory Rate</label>
<div className="relative bg-surface-container-low p-4">
<input className="w-full bg-transparent border-none border-b-2 border-outline p-0 text-2xl font-light focus:ring-0 focus:border-primary transition-all placeholder:text-neutral-300" placeholder="16" type="number"/>
<span className="absolute right-4 bottom-4 text-xs font-bold text-neutral-400 uppercase">Breaths/min</span>
</div>
<p className="text-[10px] text-neutral-400 mt-2 italic">Adult standard: 12 to 16 breaths per minute</p>
</div>
{/* Clinical Observation Note */}
<div className="group">
<label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 group-focus-within:text-blue-600 transition-colors">Clinical Observations</label>
<div className="bg-surface-container-low p-4">
<textarea className="w-full bg-transparent border-none border-b-2 border-outline p-0 text-sm focus:ring-0 focus:border-primary transition-all placeholder:text-neutral-300 resize-none" placeholder="e.g. Patient reporting slight dizziness..." rows={2}></textarea>
</div>
<p className="text-[10px] text-neutral-400 mt-2 italic">Note any physical anomalies or patient feedback.</p>
</div>
</div>
</div>
{/* Action Bar */}
<footer className="mt-24 border-t-2 border-neutral-900 pt-8 flex items-center justify-between">
<div className="flex items-center gap-6">
<div className="flex items-center gap-2 text-neutral-500">
<HcIcon name="schedule" className="text-sm" />
<span className="text-[10px] font-bold uppercase tracking-widest">Entry Time: 14:22:05 EST</span>
</div>
<div className="flex items-center gap-2 text-neutral-500">
<HcIcon name="lock" className="text-sm" />
<span className="text-[10px] font-bold uppercase tracking-widest">Secure Ledger Protocol V2</span>
</div>
</div>
<div className="flex gap-4">
<button className="bg-surface-container-high px-8 py-3 text-xs font-bold uppercase tracking-widest text-on-surface hover:brightness-95 active:translate-y-0.5 transition-all">
                        Discard Changes
                    </button>
<button className="bg-primary-container text-white px-12 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-primary active:translate-y-0.5 transition-all">
                        Save Vitals <HcIcon name="send" className="text-sm" />
</button>
</div>
</footer>
</div>
{/* System Drawer / Telemetry Logs (Right Side) */}
<div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-96 bg-white border-l-2 border-neutral-900 z-30 flex flex-col">
<div className="p-8 border-b border-neutral-100 bg-surface-container-low">
<h4 className="text-xs font-black tracking-[0.2em] uppercase text-neutral-900">Historical Telemetry</h4>
<p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Comparison to last 24h average</p>
</div>
<div className="flex-1 overflow-y-auto p-8 space-y-8">
{/* Trend Card 1 */}
<div className="group border-b border-neutral-100 pb-4">
<div className="flex justify-between items-end mb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Heart Rate Avg</span>
<span className="text-2xl font-light">68 <span className="text-xs uppercase font-bold text-neutral-400">bpm</span></span>
</div>
<div className="w-full bg-neutral-100 h-1 mt-2">
<div className="bg-blue-600 h-full w-[68%]"></div>
</div>
<p className="text-[10px] text-blue-600 mt-2 font-bold tracking-widest uppercase">Normal Variance (-4%)</p>
</div>
{/* Trend Card 2 */}
<div className="group border-b border-neutral-100 pb-4">
<div className="flex justify-between items-end mb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">BP Systolic Avg</span>
<span className="text-2xl font-light">124 <span className="text-xs uppercase font-bold text-neutral-400">mmHg</span></span>
</div>
<div className="w-full bg-neutral-100 h-1 mt-2">
<div className="bg-neutral-900 h-full w-[82%]"></div>
</div>
<p className="text-[10px] text-neutral-500 mt-2 font-bold tracking-widest uppercase">Stable Profile</p>
</div>
{/* History List */}
<div className="pt-4">
<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Recent Submissions</p>
<div className="space-y-6">
<div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-blue-600">
<p className="text-xs font-semibold">120/80, 72bpm, 36.6C</p>
<p className="text-[10px] text-neutral-400 uppercase tracking-tighter">08:42 AM · Sarah Chen, RN</p>
</div>
<div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-neutral-300">
<p className="text-xs font-semibold">118/79, 70bpm, 36.5C</p>
<p className="text-[10px] text-neutral-400 uppercase tracking-tighter">04:15 AM · Automated (MC-A4)</p>
</div>
<div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-neutral-300">
<p className="text-xs font-semibold">122/82, 75bpm, 36.8C</p>
<p className="text-[10px] text-neutral-400 uppercase tracking-tighter">Yesterday, 10:30 PM · Mike Ross, RN</p>
</div>
</div>
</div>
</div>
<div className="p-8 bg-neutral-950 text-white">
<button className="w-full flex justify-between items-center group">
<span className="text-[10px] font-black uppercase tracking-[0.2em]">View Full Patient History</span>
<HcIcon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
</button>
</div>
</div>

</main>
    </>
  );
}
