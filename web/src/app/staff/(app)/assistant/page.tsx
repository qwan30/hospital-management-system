import Image from "next/image";
import Link from "next/link";

export default function InternalAssistantPage() {
  return (
    <>
      <main>

{/* Central Workspace (Empty State/Context) */}
<div className="flex-1 p-8">
<div className="max-w-4xl mx-auto space-y-8">
<div className="bg-surface-container-lowest p-12 flex flex-col items-start gap-4">
<span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Active Context</span>
<h1 className="text-5xl font-light tracking-tight text-on-surface">Patient Analysis: <span className="font-semibold">Case #8821</span></h1>
<p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">System-wide clinical data integration in progress. Use the internal assistant on the right for real-time decision support based on latest EMR entries and radiology reports.</p>
<div className="grid grid-cols-3 gap-0 w-full mt-8">
<div className="bg-surface-container-highest p-6 border-r border-outline-variant/10">
<p className="text-[10px] font-bold uppercase text-outline tracking-[0.2em] mb-2">Heart Rate</p>
<p className="text-3xl font-mono text-primary">72 BPM</p>
</div>
<div className="bg-surface-container-highest p-6 border-r border-outline-variant/10">
<p className="text-[10px] font-bold uppercase text-outline tracking-[0.2em] mb-2">SPO2</p>
<p className="text-3xl font-mono text-primary">98%</p>
</div>
<div className="bg-surface-container-highest p-6">
<p className="text-[10px] font-bold uppercase text-outline tracking-[0.2em] mb-2">Last Sync</p>
<p className="text-3xl font-mono text-primary">02:14</p>
</div>
</div>
</div>
<div className="grid grid-cols-2 gap-8">
<div className="bg-surface-container-lowest p-8 h-64 flex flex-col justify-end relative">
<div className="absolute inset-0 opacity-10 grayscale overflow-hidden">
<img alt="Medical data" className="w-full h-full object-cover" data-alt="monochrome high-contrast MRI brain scan visualization with technical clinical annotations and medical grid overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt36IqzBVt_u-AaKEQkK3njP6pomazrxb444qEjTkMa87EEOfWR8cGfdsRXptPrBw00jyRh-sSDGKmUHBw-2CJZYMEXlRjetvO9A16bBiQCxUY1jUwo1RU7zvspTcysRU_pdCfIAH_puYkzVjdQ1FvojbeU26IQsWcLg-_pZOe8RasxddzJqhWEjbnGtFPQm6MbzxkY2xkOdFzGgIjxyrSRtUGC6G4Mhh6QJV_m-HM0ZWmZmI31MWxIagIm1LzotvntfPczhvGPA"/>
</div>
<h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-1 relative z-10">Recent Imaging</h3>
<p className="text-xl font-semibold relative z-10">Transverse Cerebral Section</p>
</div>
<div className="bg-surface-container-lowest p-8 h-64 flex flex-col justify-end relative">
<div className="absolute inset-0 opacity-10 grayscale overflow-hidden">
<img alt="Clinical chart" className="w-full h-full object-cover" data-alt="complex medical data visualization showing fluctuating vital signs in a professional dashboard interface with clean lines" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDug56TF9VzTCFZ5-lFc53lUhtAgwKgsE41FL9GgzX2jJb7j74YHgx_ifIumAF_FpGTI7JdYjl0DVuDNHh2gR5tdcmRV5C1rVpmoVCAeL-G90jZTiXLtIG67smXZLvgw9FNGDdIDLKuHfXCZhCHMglff8WTUnUwFLReWxZSsbWoyDYeBP_FOrvNBjfHY0Fl78i9i8uXTcWDSnZBXM0kHDH49k6eJUbHNpNZNfKW_DWwi71vcoYthi-_6yFwEy014whelrvAoGMtlA"/>
</div>
<h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-1 relative z-10">Vital Trends</h3>
<p className="text-xl font-semibold relative z-10">24-Hour Observation Log</p>
</div>
</div>
</div>
</div>
{/* Internal Assistant Panel (IBM Style) */}
<aside className="w-[400px] bg-white border-l border-outline-variant/20 flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
{/* Panel Header */}
<div className="p-6 pb-0">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary text-xl" >smart_toy</span>
<h2 className="text-base font-semibold tracking-tight">Clinical Assistant</h2>
</div>
{/* Tabs */}
<div className="flex gap-0 border-b border-surface-container">
<button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 border-primary text-primary">Docs</button>
<button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 border-transparent text-outline hover:text-on-surface">Patient</button>
<button className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 border-transparent text-outline hover:text-on-surface">Hybrid</button>
</div>
</div>
{/* Body: Chat List */}
<div className="flex-1 overflow-y-auto p-6 space-y-8 bg-neutral-50/50">
{/* User Bubble */}
<div className="flex flex-col items-end gap-2">
<div className="bg-surface-container-high p-4 max-w-[85%]">
<p className="text-xs text-on-surface leading-relaxed">What are the recommended dosage adjustments for Lisinopril in patients with Case #8821's current creatinine clearance levels?</p>
</div>
<span className="text-[10px] text-outline font-bold uppercase">Staff Dr. Miller • 10:42 AM</span>
</div>
{/* Assistant Answer Block */}
<div className="flex flex-col items-start gap-4">
<div className="bg-white border-l-4 border-primary p-5 shadow-sm space-y-4">
<div className="flex items-center gap-2">
<span className="bg-primary-container text-white text-[9px] font-bold px-2 py-0.5 tracking-tighter">AI VERIFIED</span>
<p className="text-[11px] font-bold uppercase tracking-widest text-outline">Evidence-backed answer</p>
</div>
<p className="text-sm text-on-surface leading-relaxed">
                                Based on the patient's current <span className="font-semibold text-primary">CrCl of 42 mL/min</span>, clinical guidelines recommend a reduction in the initial dose of Lisinopril. Start at <span className="font-semibold">5 mg once daily</span> (instead of the standard 10 mg). Monitor serum potassium and creatinine within 1-2 weeks.
                            </p>
{/* Citations List */}
<div className="pt-4 border-t border-surface-container">
<p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Citations</p>
<ul className="space-y-1">
<li className="flex items-start gap-2">
<span className="text-[10px] text-primary mt-1">01</span>
<span className="font-mono text-[13px] text-on-surface-variant leading-tight">AHA/ACC Hypertension Guidelines, 2023 Update, Section 7.4.2</span>
</li>
<li className="flex items-start gap-2">
<span className="text-[10px] text-primary mt-1">02</span>
<span className="font-mono text-[13px] text-on-surface-variant leading-tight">KDIGO Clinical Practice Guideline for CKD Management, p.112-115</span>
</li>
</ul>
</div>
</div>
{/* Follow-up Prompts */}
<div className="w-full space-y-2">
<button className="w-full text-left p-3 text-xs border border-outline-variant/30 hover:bg-white transition-colors flex justify-between items-center group">
<span className="text-on-surface-variant">Check interaction with Furosemide</span>
<span className="material-symbols-outlined text-sm text-outline group-hover:text-primary">arrow_forward</span>
</button>
<button className="w-full text-left p-3 text-xs border border-outline-variant/30 hover:bg-white transition-colors flex justify-between items-center group">
<span className="text-on-surface-variant">View patient's 3-month potassium trend</span>
<span className="material-symbols-outlined text-sm text-outline group-hover:text-primary">arrow_forward</span>
</button>
</div>
</div>
</div>
{/* Input Area */}
<div className="p-6 bg-white border-t border-surface-container">
<div className="relative bg-surface-container-low p-2">
<textarea className="w-full bg-transparent border-none focus:ring-0 text-sm p-2 resize-none h-24 placeholder:text-outline/50" placeholder="Ask about clinical guidelines..."></textarea>
<div className="flex justify-between items-center mt-2 px-2">
<div className="flex gap-2">
<button className="material-symbols-outlined text-outline hover:text-primary">attach_file</button>
<button className="material-symbols-outlined text-outline hover:text-primary">mic</button>
</div>
<button className="bg-primary text-white p-2">
<span className="material-symbols-outlined">send</span>
</button>
</div>
</div>
</div>
</aside>

</main>
    </>
  );
}
