import Image from "next/image";
import Link from "next/link";

export default function MedicalRecordEditorPage() {
  return (
    <>
      <main>

{/* Left Column: Editor (8/12) */}
<div className="col-span-8 flex flex-col gap-8">
{/* Page Header */}
<section>
<div className="flex items-center gap-3 mb-2">
<span className="font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-[0.2em] text-primary">Case File: #MR-8829-01</span>
<span className="h-px flex-1 bg-surface-container-highest"></span>
</div>
<h2 className="text-4xl font-light text-on-surface tracking-tight leading-none mb-4">Patient Record Entry</h2>
</section>
{/* Diagnosis & Vitals Section */}
<div className="grid grid-cols-2 gap-px bg-surface-container-highest">
<div className="bg-surface-container-lowest p-6">
<label className="block font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest mb-3 text-outline">Primary Diagnosis</label>
<div className="relative">
<select className="w-full bg-surface-container-low border-b-2 border-outline/30 px-3 py-3 font-semibold text-sm focus:border-primary-container outline-none appearance-none">
<option>G40.309 - Generalized Idiopathic Epilepsy</option>
<option>G43.909 - Migraine, Unspecified</option>
<option>R51.9 - Headache, Unspecified</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none opacity-40">expand_more</span>
</div>
</div>
<div className="bg-surface-container-lowest p-6 grid grid-cols-2 gap-4">
<div>
<label className="block font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest mb-2 text-outline">Status</label>
<span className="inline-flex items-center px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-tighter">Urgent Review</span>
</div>
<div>
<label className="block font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest mb-2 text-outline">Last Assessment</label>
<span className="block text-xs font-semibold">14 OCT 2023</span>
</div>
</div>
</div>
{/* Clinical Notes (Large Textarea) */}
<section className="flex flex-col">
<div className="flex items-center justify-between mb-4">
<label className="font-['Public_Sans'] font-semibold uppercase text-[11px] tracking-widest text-on-surface">Clinical Observation &amp; Subjective Notes</label>
<div className="flex gap-4">
<button className="text-[10px] font-bold text-primary flex items-center gap-1"><span className="material-symbols-outlined text-xs">history_edu</span> USE TEMPLATE</button>
<button className="text-[10px] font-bold text-primary flex items-center gap-1"><span className="material-symbols-outlined text-xs">mic</span> DICTATE</button>
</div>
</div>
<textarea className="w-full min-h-[400px] bg-surface-container-lowest border-none p-8 text-base leading-relaxed text-on-surface-variant focus:ring-1 focus:ring-primary-container placeholder:opacity-30 font-body" placeholder="Start typing clinical observation notes here..."></textarea>
</section>
{/* Prescription Items (Inline Table) */}
<section className="bg-surface-container-lowest p-8">
<div className="flex items-center justify-between mb-6">
<h3 className="font-['Public_Sans'] font-semibold uppercase text-[11px] tracking-widest">Active Prescriptions &amp; Medication Orders</h3>
<button className="bg-on-surface text-surface px-4 py-2 text-[10px] font-bold flex items-center gap-2 hover:bg-black transition-all">
<span className="material-symbols-outlined text-sm">add</span> ADD MEDICATION
                    </button>
</div>
<div className="overflow-hidden">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low">
<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-outline">Medication</th>
<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-outline">Dosage</th>
<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-outline">Frequency</th>
<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-outline">Route</th>
<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-outline">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr>
<td className="py-4 px-4 text-xs font-semibold">Levetiracetam (Keppra) 500mg</td>
<td className="py-4 px-4 text-xs">1 Tablet</td>
<td className="py-4 px-4 text-xs">Twice Daily</td>
<td className="py-4 px-4 text-xs">Oral</td>
<td className="py-4 px-4 text-xs"><button className="text-error font-bold text-[10px]">REMOVE</button></td>
</tr>
<tr>
<td className="py-4 px-4 text-xs font-semibold">Sumatriptan 50mg</td>
<td className="py-4 px-4 text-xs">1 Tablet</td>
<td className="py-4 px-4 text-xs">As Needed (PRN)</td>
<td className="py-4 px-4 text-xs">Oral</td>
<td className="py-4 px-4 text-xs"><button className="text-error font-bold text-[10px]">REMOVE</button></td>
</tr>
</tbody>
</table>
</div>
</section>
{/* Follow-up Planning */}
<section className="grid grid-cols-3 gap-px bg-surface-container-highest">
<div className="bg-surface-container-lowest p-6">
<label className="block font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest mb-3 text-outline">Follow-up Schedule</label>
<input className="w-full bg-surface-container-low border-b-2 border-outline/30 px-3 py-3 font-semibold text-sm focus:border-primary-container outline-none" type="date"/>
</div>
<div className="bg-surface-container-lowest p-6">
<label className="block font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest mb-3 text-outline">Referral Required</label>
<div className="relative">
<select className="w-full bg-surface-container-low border-b-2 border-outline/30 px-3 py-3 font-semibold text-sm focus:border-primary-container outline-none appearance-none">
<option>None</option>
<option>Imaging: MRI (Brain)</option>
<option>Lab: Blood Chemistry</option>
<option>Specialist: Neuro-Opth</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none opacity-40 text-sm">expand_more</span>
</div>
</div>
<div className="bg-surface-container-lowest p-6 flex items-end">
<button className="w-full h-[52px] bg-primary-container text-on-primary-container font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all">
                        Commit Record <span className="material-symbols-outlined">send</span>
</button>
</div>
</section>
</div>
{/* Right Column: Patient Summary Sidebar (4/12) */}
<aside className="col-span-4">
<div className="sticky top-24 flex flex-col gap-6">
{/* Patient Identity "Monolith" */}
<div className="bg-on-surface text-surface p-8">
<div className="flex items-start justify-between mb-8">
<div>
<p className="font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-[0.2em] opacity-60 mb-1">Subject Profile</p>
<h3 className="text-3xl font-light tracking-tight">Kerrigan, Sarah</h3>
</div>
<div className="h-16 w-16 bg-surface/10 overflow-hidden">
<img alt="Patient thumbnail" className="h-full w-full object-cover grayscale" data-alt="high-contrast monochromatic portrait of a middle-aged woman with thoughtful expression, minimalist clinical background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsZFc7iacn0IOG97tSc0c7Q9Xs2-jV7aJmQJTvBqhgASN-nffi3q5YMLRHjn-8-8ocFx2F4atljdiw6dVy1n7yfCBCzYKpxkd5mNtYzC7GMXc5GKTv1TdVugJ3akkSx_FHTULGwBlqCJTxdQNOdABArRmJEKX6iCWfCbypyg0zGh5F1Y3_VDbPP-HiEzDPalItwueWXjpwmr5MVUBgEvdTWv6biCiogUosH0snGlftcMxxBbE5Ba51ILO-RHVRXF34uFASWE7rQg"/>
</div>
</div>
<div className="grid grid-cols-2 gap-y-6">
<div>
<p className="text-[10px] font-bold uppercase opacity-50 mb-1">ID NUMBER</p>
<p className="text-sm font-semibold">992-004-1882</p>
</div>
<div>
<p className="text-[10px] font-bold uppercase opacity-50 mb-1">BIRTH DATE</p>
<p className="text-sm font-semibold">22 MAY 1984 (39y)</p>
</div>
<div>
<p className="text-[10px] font-bold uppercase opacity-50 mb-1">GENDER</p>
<p className="text-sm font-semibold">FEMALE</p>
</div>
<div>
<p className="text-[10px] font-bold uppercase opacity-50 mb-1">BLOOD TYPE</p>
<p className="text-sm font-semibold">O NEGATIVE</p>
</div>
</div>
</div>
{/* Vital Metrics Monoliths */}
<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-highest p-6">
<p className="font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest text-outline mb-2">Heart Rate</p>
<div className="flex items-baseline gap-1">
<span className="text-3xl font-light">72</span>
<span className="text-[10px] font-bold">BPM</span>
</div>
<div className="mt-2 h-1 w-full bg-surface-container flex">
<div className="h-full bg-primary" ></div>
</div>
</div>
<div className="bg-surface-container-highest p-6">
<p className="font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest text-outline mb-2">BP (Sys/Dia)</p>
<div className="flex items-baseline gap-1">
<span className="text-3xl font-light">118/78</span>
<span className="text-[10px] font-bold">MMHG</span>
</div>
<div className="mt-2 h-1 w-full bg-surface-container flex">
<div className="h-full bg-primary" ></div>
</div>
</div>
</div>
{/* Patient History Quicklist */}
<div className="bg-surface-container-low p-8">
<h4 className="font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest mb-6">Recent Clinical Activity</h4>
<div className="space-y-6">
<div className="flex gap-4">
<div className="flex-none w-px bg-surface-container-highest relative">
<div className="absolute -top-1 -left-[4px] h-2 w-2 rounded-full bg-primary"></div>
</div>
<div>
<p className="text-[10px] font-bold text-primary mb-1">10 OCT 2023</p>
<p className="text-xs font-semibold leading-tight">Neurological Consult - Post-Seizure Follow-up</p>
<p className="text-[10px] opacity-60 mt-1">DR. MARSHALL, J.</p>
</div>
</div>
<div className="flex gap-4">
<div className="flex-none w-px bg-surface-container-highest relative">
<div className="absolute -top-1 -left-[4px] h-2 w-2 rounded-full bg-outline"></div>
</div>
<div>
<p className="text-[10px] font-bold text-outline mb-1">02 OCT 2023</p>
<p className="text-xs font-semibold leading-tight">Diagnostic Imaging - MRI Full Brain</p>
<p className="text-[10px] opacity-60 mt-1">RADIOLOGY DEPT.</p>
</div>
</div>
<div className="flex gap-4">
<div className="flex-none w-px bg-surface-container-highest relative">
<div className="absolute -top-1 -left-[4px] h-2 w-2 rounded-full bg-outline"></div>
</div>
<div>
<p className="text-[10px] font-bold text-outline mb-1">15 SEP 2023</p>
<p className="text-xs font-semibold leading-tight">General Physical Examination</p>
<p className="text-[10px] opacity-60 mt-1">DR. VANCE, E.</p>
</div>
</div>
</div>
<button className="w-full mt-8 py-3 text-[10px] font-bold border-b border-on-surface/10 flex justify-between items-center hover:text-primary transition-all">
                        VIEW ALL CLINICAL HISTORY <span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
{/* Alerts / Allergies */}
<div className="bg-error-container p-6">
<div className="flex items-center gap-3 mb-3">
<span className="material-symbols-outlined text-error" >warning</span>
<h4 className="font-['Public_Sans'] font-semibold uppercase text-[11px] tracking-widest text-on-error-container">Critical Alerts</h4>
</div>
<ul className="space-y-2">
<li className="text-xs font-bold flex items-center gap-2">
<span className="h-1.5 w-1.5 bg-error rounded-full"></span>
                            ALLERGY: PENICILLIN (G-4)
                        </li>
<li className="text-xs font-bold flex items-center gap-2">
<span className="h-1.5 w-1.5 bg-error rounded-full"></span>
                            HISTORY: SEIZURE ACTIVITY
                        </li>
</ul>
</div>
</div>
</aside>

</main>
    </>
  );
}
