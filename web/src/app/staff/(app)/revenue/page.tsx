import Image from "next/image";

export default function RevenueDashboardPage() {
  return (
    <>
      <main>

{/* TopAppBar Anchor */}
<header className="flex justify-between items-center px-8 sticky top-0 z-50 h-16 w-full bg-[#fcf9f8] dark:bg-[#171717] border-b-0">
<div className="flex items-center gap-6">
<div className="relative group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40 text-sm" data-icon="search">search</span>
<input className="bg-surface-container-low border-0 border-b-2 border-outline/20 focus:border-primary-container focus:ring-0 text-[10px] font-semibold tracking-widest pl-10 w-64 h-10 transition-all" placeholder="SEARCH FINANCE RECORDS..." type="text"/>
</div>
<div className="flex gap-4">
<button className="text-primary-container font-bold font-['Public_Sans'] font-semibold uppercase text-[10px] px-2 h-10 border-b-2 border-primary-container">OVERVIEW</button>
<button className="text-[#1c1b1b] dark:text-[#ffffff] font-['Public_Sans'] font-semibold uppercase text-[10px] px-2 h-10 border-b-2 border-transparent hover:border-outline-variant/50 transition-all">ANALYTICS</button>
<button className="text-[#1c1b1b] dark:text-[#ffffff] font-['Public_Sans'] font-semibold uppercase text-[10px] px-2 h-10 border-b-2 border-transparent hover:border-outline-variant/50 transition-all">REPORTS</button>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex gap-4">
<span className="material-symbols-outlined text-on-surface/60 hover:text-primary transition-colors cursor-pointer" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined text-on-surface/60 hover:text-primary transition-colors cursor-pointer" data-icon="history">history</span>
<span className="material-symbols-outlined text-on-surface/60 hover:text-primary transition-colors cursor-pointer" data-icon="account_circle">account_circle</span>
</div>
<div className="flex items-center gap-3 border-l border-outline-variant/20 pl-6">
<Image alt="User clinical profile" className="w-8 h-8 grayscale" data-alt="professional medical administrator portrait close-up with clean white background and sharp lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD83rNtUidIOU1a_YI7mECcR4GqxSmfnN0LHzAEDgMs1Wmigkm5F-Qx1_il7WSZIqwEaTC0ok6HHejOwh-frWeLf2XiqEBEWLuNpdsqg-tKIWgolBurO92xWj8VegrDwiZjTDh8dg5zroFNvUl1cKZJ3MkI-gVrMcsMjrgmUnpv9Ol1mHzsiCbpjIG6pLU0qlvN7VmVyvy624DfEBUU8xOJFaheL-YlNTugv2qER1nFLnHDSnMg3x6lzF2h6DyjLFyzmNc7wGdEvA" width={1200} height={800}/>
<div className="text-[9px] leading-tight">
<p className="font-bold uppercase tracking-tight">DR. A. VANCE</p>
<p className="opacity-50 font-semibold uppercase">FINANCIAL ADMIN</p>
</div>
</div>
</div>
</header>
{/* Dashboard Canvas */}
<div className="p-8">
{/* Header Section */}
<div className="flex justify-between items-end mb-12">
<div>
<span className="bg-on-surface text-surface text-[10px] px-2 py-0.5 font-black tracking-widest uppercase mb-4 inline-block">Finance Station</span>
<h2 className="text-5xl font-light tracking-tighter text-on-surface">Revenue Monitor</h2>
</div>
<div className="flex bg-surface-container-low p-1 h-12">
<button className="px-6 text-[10px] font-black tracking-widest bg-surface-container-lowest text-primary shadow-sm">DAILY</button>
<button className="px-6 text-[10px] font-black tracking-widest text-on-surface/40 hover:text-on-surface transition-colors">MONTHLY</button>
<button className="px-6 text-[10px] font-black tracking-widest text-on-surface/40 hover:text-on-surface transition-colors">ANNUAL</button>
</div>
</div>
{/* KPI Monoliths */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-12 border-t-2 border-on-surface">
<div className="bg-surface-container-lowest p-8 border-r border-surface-container">
<p className="text-[10px] font-black tracking-[0.2em] text-on-surface/50 mb-4 uppercase">Total Gross Revenue</p>
<div className="flex items-baseline gap-2">
<span className="text-4xl font-light tracking-tighter tabular-nums">$2,840,192</span>
<span className="text-xs font-bold text-primary">+12.4%</span>
</div>
</div>
<div className="bg-surface-container-low p-8 border-r border-surface-container">
<p className="text-[10px] font-black tracking-[0.2em] text-on-surface/50 mb-4 uppercase">Pending Claims</p>
<div className="flex items-baseline gap-2">
<span className="text-4xl font-light tracking-tighter tabular-nums">$412,050</span>
<span className="text-xs font-bold text-tertiary">ACTION REQ</span>
</div>
</div>
<div className="bg-surface-container-lowest p-8 border-r border-surface-container">
<p className="text-[10px] font-black tracking-[0.2em] text-on-surface/50 mb-4 uppercase">Avg Treatment Value</p>
<div className="flex items-baseline gap-2">
<span className="text-4xl font-light tracking-tighter tabular-nums">$3,842</span>
<span className="text-xs font-bold text-on-surface opacity-30">STABLE</span>
</div>
</div>
<div className="bg-primary-container p-8 text-surface">
<p className="text-[10px] font-black tracking-[0.2em] opacity-70 mb-4 uppercase">Collection Rate</p>
<div className="flex items-baseline gap-2">
<span className="text-4xl font-light tracking-tighter tabular-nums">98.2%</span>
<span className="material-symbols-outlined text-sm" data-icon="trending_up">trending_up</span>
</div>
</div>
</div>
{/* Main Analytics Grid */}
<div className="grid grid-cols-12 gap-8 mb-12">
{/* Primary Revenue Chart Section */}
<div className="col-span-8 bg-surface-container-low p-8 relative overflow-hidden">
<div className="flex justify-between items-start mb-12">
<h3 className="text-xs font-black tracking-[0.3em] uppercase">Revenue Velocity_24H</h3>
<div className="flex gap-4 items-center">
<div className="flex items-center gap-2">
<div className="w-3 h-3 bg-primary"></div>
<span className="text-[10px] font-bold opacity-60">BILLED</span>
</div>
<div className="flex items-center gap-2">
<div className="w-3 h-3 bg-outline-variant"></div>
<span className="text-[10px] font-bold opacity-60">ESTIMATED</span>
</div>
</div>
</div>
{/* Asymmetric Bar/Line Visualization (Representational) */}
<div className="h-64 flex items-end gap-2 border-b border-on-surface/10">
<div className="flex-1 bg-primary h-[40%] opacity-20"></div>
<div className="flex-1 bg-primary h-[55%] opacity-30"></div>
<div className="flex-1 bg-primary h-[45%] opacity-40"></div>
<div className="flex-1 bg-primary h-[70%] opacity-50"></div>
<div className="flex-1 bg-primary h-[85%] opacity-60"></div>
<div className="flex-1 bg-primary h-[60%] opacity-70"></div>
<div className="flex-1 bg-primary h-[95%] opacity-100"></div>
<div className="flex-1 bg-primary h-[80%]"></div>
<div className="flex-1 bg-primary h-[65%]"></div>
<div className="flex-1 bg-primary h-[50%]"></div>
<div className="flex-1 bg-primary h-[40%]"></div>
<div className="flex-1 bg-primary h-[30%]"></div>
</div>
<div className="flex justify-between mt-4 text-[9px] font-black opacity-30 tracking-widest">
<span>06:00</span>
<span>09:00</span>
<span>12:00</span>
<span>15:00</span>
<span>18:00</span>
<span>21:00</span>
</div>
</div>
{/* Secondary Data Stack */}
<div className="col-span-4 flex flex-col gap-8">
<div className="bg-surface-container-highest p-8 flex-1">
<h3 className="text-xs font-black tracking-[0.3em] uppercase mb-6">Patient Mix</h3>
<div className="space-y-6">
<div>
<div className="flex justify-between text-[10px] font-bold mb-2">
<span>PRIVATE INSURED</span>
<span>64%</span>
</div>
<div className="h-1 bg-on-surface/10">
<div className="h-full bg-primary w-[64%]"></div>
</div>
</div>
<div>
<div className="flex justify-between text-[10px] font-bold mb-2">
<span>GOVERNMENT/SUBSIDIZED</span>
<span>28%</span>
</div>
<div className="h-1 bg-on-surface/10">
<div className="h-full bg-on-surface w-[28%]"></div>
</div>
</div>
<div>
<div className="flex justify-between text-[10px] font-bold mb-2">
<span>OUT-OF-POCKET</span>
<span>8%</span>
</div>
<div className="h-1 bg-on-surface/10">
<div className="h-full bg-tertiary w-[8%]"></div>
</div>
</div>
</div>
</div>
<div className="bg-surface-container-lowest p-8 border-l-4 border-primary-container">
<h3 className="text-xs font-black tracking-[0.3em] uppercase mb-2">SYSTEM_HEALTH</h3>
<p className="text-xs font-semibold opacity-60 leading-relaxed">
                            API throughput optimal. No latency detected in billing gateways. Automatic reconciliation at 00:00 UTC.
                        </p>
</div>
</div>
</div>
{/* Department Breakdown Table */}
<div className="bg-surface-container-lowest overflow-hidden">
<div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
<h3 className="text-xs font-black tracking-[0.3em] uppercase">Department Performance Breakdown</h3>
<button className="text-xs font-bold text-primary flex items-center gap-2">
                        EXPORT DATA <span className="material-symbols-outlined text-sm" data-icon="download">download</span>
</button>
</div>
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low">
<th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Department</th>
<th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Encounters</th>
<th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Billed Amount</th>
<th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Unpaid</th>
<th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Efficiency</th>
<th className="px-8 py-4 text-[10px] font-black tracking-widest opacity-50 uppercase">Trend</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
<td className="px-8 py-5 text-xs font-black">CARDIOLOGY_UNIT</td>
<td className="px-8 py-5 text-xs tabular-nums">1,242</td>
<td className="px-8 py-5 text-xs font-semibold tabular-nums">$842,000</td>
<td className="px-8 py-5 text-xs tabular-nums text-tertiary">$12,400</td>
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="text-[10px] font-bold">96%</span>
<div className="w-16 h-1.5 bg-surface-container">
<div className="h-full bg-primary w-[96%]"></div>
</div>
</div>
</td>
<td className="px-8 py-5"><span className="material-symbols-outlined text-primary" data-icon="trending_up">trending_up</span></td>
</tr>
<tr className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
<td className="px-8 py-5 text-xs font-black">NEURO_SURGERY</td>
<td className="px-8 py-5 text-xs tabular-nums">340</td>
<td className="px-8 py-5 text-xs font-semibold tabular-nums">$1,102,400</td>
<td className="px-8 py-5 text-xs tabular-nums text-tertiary">$94,000</td>
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="text-[10px] font-bold">88%</span>
<div className="w-16 h-1.5 bg-surface-container">
<div className="h-full bg-primary w-[88%]"></div>
</div>
</div>
</td>
<td className="px-8 py-5"><span className="material-symbols-outlined text-primary" data-icon="trending_flat">trending_flat</span></td>
</tr>
<tr className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
<td className="px-8 py-5 text-xs font-black">EMERGENCY_STATION</td>
<td className="px-8 py-5 text-xs tabular-nums">4,810</td>
<td className="px-8 py-5 text-xs font-semibold tabular-nums">$524,000</td>
<td className="px-8 py-5 text-xs tabular-nums text-tertiary">$2,100</td>
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="text-[10px] font-bold">99%</span>
<div className="w-16 h-1.5 bg-surface-container">
<div className="h-full bg-primary w-[99%]"></div>
</div>
</div>
</td>
<td className="px-8 py-5"><span className="material-symbols-outlined text-primary" data-icon="trending_up">trending_up</span></td>
</tr>
<tr className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
<td className="px-8 py-5 text-xs font-black">DIAGNOSTICS_LAB</td>
<td className="px-8 py-5 text-xs tabular-nums">12,400</td>
<td className="px-8 py-5 text-xs font-semibold tabular-nums">$312,000</td>
<td className="px-8 py-5 text-xs tabular-nums text-tertiary">$41,000</td>
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="text-[10px] font-bold">82%</span>
<div className="w-16 h-1.5 bg-surface-container">
<div className="h-full bg-primary w-[82%]"></div>
</div>
</div>
</td>
<td className="px-8 py-5"><span className="material-symbols-outlined text-tertiary" data-icon="trending_down">trending_down</span></td>
</tr>
</tbody>
</table>
</div>
{/* Footer Meta */}
<div className="mt-12 flex justify-between items-center text-[10px] font-bold opacity-30 tracking-[0.2em] uppercase">
<p>System Build: v4.12.08-PRIME</p>
<p>Last Sync: 2023-11-24 14:42:01 UTC</p>
</div>
</div>

</main>
    </>
  );
}
