
export default function InvoicesPage() {
  return (
    <>
      <main>

{/* TopAppBar */}
<header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-50 bg-[#fcf9f8] dark:bg-[#171717]">
<div className="flex items-center flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" data-icon="search">search</span>
<input className="w-full bg-transparent border-none focus:ring-0 pl-8 font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest placeholder:text-outline-variant" placeholder="SEARCH PATIENTS OR INVOICES..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<button className="hover:bg-[#f6f3f2] dark:hover:bg-[#262626] p-2 transition-all">
<span className="material-symbols-outlined text-lg" data-icon="notifications">notifications</span>
</button>
<button className="hover:bg-[#f6f3f2] dark:hover:bg-[#262626] p-2 transition-all">
<span className="material-symbols-outlined text-lg" data-icon="history">history</span>
</button>
<div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
<span className="font-['Public_Sans'] font-semibold uppercase text-[10px] tracking-widest">ADMIN_04</span>
<span className="material-symbols-outlined text-3xl text-primary" data-icon="account_circle" >account_circle</span>
</div>
</div>
</header>
{/* Page Canvas */}
<div className="flex-1 p-8 space-y-8">
{/* Page Header & Actions */}
<div className="flex justify-between items-end">
<div>
<h2 className="text-4xl font-light tracking-tight text-on-surface">Financial Ledger</h2>
<p className="font-semibold uppercase text-[10px] tracking-[0.2em] text-primary mt-2">Centralized Billing &amp; Invoice Control</p>
</div>
<div className="flex gap-1">
<button className="bg-surface-container-high text-on-surface px-6 py-3 font-semibold text-[10px] tracking-widest uppercase hover:bg-surface-variant transition-colors">Export CSV</button>
<button className="bg-primary-container text-white px-6 py-3 font-semibold text-[10px] tracking-widest uppercase hover:bg-primary transition-colors flex items-center">
<span className="material-symbols-outlined mr-2 text-sm" data-icon="receipt_long">receipt_long</span>
                        Create Invoice
                    </button>
</div>
</div>
{/* KPI Strip: Data Monoliths */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-0">
<div className="bg-surface-container-highest p-6 border-r border-surface">
<p className="font-semibold uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-2">Total Issued</p>
<p className="text-3xl font-light tracking-tighter">$42,850.00</p>
<p className="text-[10px] font-bold text-primary mt-1">+12% VS LAST MONTH</p>
</div>
<div className="bg-surface-container-highest p-6 border-r border-surface">
<p className="font-semibold uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-2">Pending Payment</p>
<p className="text-3xl font-light tracking-tighter">$12,405.10</p>
<p className="text-[10px] font-bold text-tertiary mt-1">24 OVERDUE ITEMS</p>
</div>
<div className="bg-surface-container-highest p-6 border-r border-surface">
<p className="font-semibold uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-2">Paid In Full</p>
<p className="text-3xl font-light tracking-tighter">$28,210.40</p>
<p className="text-[10px] font-bold text-green-600 mt-1">94% COLLECTION RATE</p>
</div>
<div className="bg-surface-container-highest p-6">
<p className="font-semibold uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-2">Voided/Canceled</p>
<p className="text-3xl font-light tracking-tighter">$2,234.50</p>
<p className="text-[10px] font-bold text-error mt-1">3 ADJUSTED TODAY</p>
</div>
</div>
{/* Filter Bar */}
<div className="bg-surface-container-low p-4 flex flex-wrap items-center gap-6">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-lg opacity-40" data-icon="filter_list">filter_list</span>
<span className="font-semibold uppercase text-[10px] tracking-widest">Filter By:</span>
</div>
{/* Status Select */}
<div className="relative group">
<select className="appearance-none bg-transparent border-b-2 border-outline-variant pr-8 py-1 font-semibold uppercase text-[10px] tracking-widest focus:border-primary focus:ring-0 cursor-pointer">
<option>All Statuses</option>
<option>Paid</option>
<option>Pending</option>
<option>Overdue</option>
<option>Voided</option>
</select>
<span className="material-symbols-outlined absolute right-0 top-1 text-sm pointer-events-none" data-icon="expand_more">expand_more</span>
</div>
{/* Date Range */}
<div className="relative group">
<input className="bg-transparent border-b-2 border-outline-variant pr-8 py-1 font-semibold uppercase text-[10px] tracking-widest focus:border-primary focus:ring-0 cursor-pointer" type="text" defaultValue="OCT 01, 2023 - OCT 31, 2023"/>
<span className="material-symbols-outlined absolute right-0 top-1 text-sm pointer-events-none" data-icon="calendar_today">calendar_today</span>
</div>
<div className="ml-auto flex items-center gap-4">
<p className="font-semibold uppercase text-[10px] tracking-widest opacity-40">Showing 142 Results</p>
</div>
</div>
{/* Data Table (The Monolithic Ledger) */}
<div className="bg-surface-container-lowest overflow-hidden">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-high">
<tr>
<th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-[0.2em] border-b border-surface">
<div className="flex items-center gap-1">Invoice ID <span className="material-symbols-outlined text-xs" data-icon="arrow_downward">arrow_downward</span></div>
</th>
<th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-[0.2em] border-b border-surface">Patient Details</th>
<th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-[0.2em] border-b border-surface">Date Issued</th>
<th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-[0.2em] border-b border-surface">Total Amount</th>
<th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-[0.2em] border-b border-surface">Status</th>
<th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-[0.2em] border-b border-surface text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-low">
{/* Row 1 */}
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5 font-mono text-[11px] font-bold text-primary">INV-2023-0842</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">EH</div>
<div>
<p className="font-bold text-xs uppercase tracking-wider">ELARA HAMILTON</p>
<p className="text-[10px] opacity-60">ID: #8829-X</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-semibold text-[11px] opacity-70 uppercase tracking-tighter">OCT 24, 2023</td>
<td className="px-6 py-5 font-bold text-xs">$1,420.00</td>
<td className="px-6 py-5">
<span className="bg-green-100 text-green-800 px-3 py-1 font-bold text-[9px] uppercase tracking-widest">Paid</span>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5 font-mono text-[11px] font-bold text-primary">INV-2023-0843</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">JM</div>
<div>
<p className="font-bold text-xs uppercase tracking-wider">JULIAN MERCER</p>
<p className="text-[10px] opacity-60">ID: #9102-A</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-semibold text-[11px] opacity-70 uppercase tracking-tighter">OCT 22, 2023</td>
<td className="px-6 py-5 font-bold text-xs">$450.00</td>
<td className="px-6 py-5">
<span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 font-bold text-[9px] uppercase tracking-widest">Pending</span>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5 font-mono text-[11px] font-bold text-primary">INV-2023-0844</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">SK</div>
<div>
<p className="font-bold text-xs uppercase tracking-wider">SARAH KENSINGTON</p>
<p className="text-[10px] opacity-60">ID: #7741-B</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-semibold text-[11px] opacity-70 uppercase tracking-tighter">OCT 21, 2023</td>
<td className="px-6 py-5 font-bold text-xs">$3,120.50</td>
<td className="px-6 py-5">
<span className="bg-error-container text-error px-3 py-1 font-bold text-[9px] uppercase tracking-widest">Overdue</span>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5 font-mono text-[11px] font-bold text-primary">INV-2023-0845</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">RB</div>
<div>
<p className="font-bold text-xs uppercase tracking-wider">ROBERT BLAINE</p>
<p className="text-[10px] opacity-60">ID: #4400-K</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-semibold text-[11px] opacity-70 uppercase tracking-tighter">OCT 19, 2023</td>
<td className="px-6 py-5 font-bold text-xs">$115.00</td>
<td className="px-6 py-5">
<span className="bg-green-100 text-green-800 px-3 py-1 font-bold text-[9px] uppercase tracking-widest">Paid</span>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
{/* Row 5 */}
<tr className="hover:bg-surface-container transition-colors group">
<td className="px-6 py-5 font-mono text-[11px] font-bold text-primary">INV-2023-0846</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">LW</div>
<div>
<p className="font-bold text-xs uppercase tracking-wider">LEONA WHITTAKER</p>
<p className="text-[10px] opacity-60">ID: #2215-L</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-semibold text-[11px] opacity-70 uppercase tracking-tighter">OCT 18, 2023</td>
<td className="px-6 py-5 font-bold text-xs">$2,400.00</td>
<td className="px-6 py-5">
<span className="bg-surface-variant text-on-surface-variant px-3 py-1 font-bold text-[9px] uppercase tracking-widest">Voided</span>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-lg" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
{/* Pagination */}
<div className="bg-surface-container-low px-6 py-4 flex items-center justify-between">
<div className="flex items-center gap-4">
<p className="font-semibold uppercase text-[10px] tracking-widest">Items per page</p>
<select className="bg-transparent border-none focus:ring-0 font-bold text-[10px] tracking-widest">
<option>10</option>
<option >20</option>
<option>50</option>
</select>
</div>
<div className="flex items-center gap-8">
<p className="font-semibold uppercase text-[10px] tracking-widest">1-20 of 142 items</p>
<div className="flex gap-2">
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high">
<span className="material-symbols-outlined text-lg" data-icon="chevron_left">chevron_left</span>
</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high bg-primary-container text-white">
<span className="material-symbols-outlined text-lg" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
{/* Asymmetric Utility Section */}
<div className="grid grid-cols-12 gap-8">
{/* Recent Activity */}
<div className="col-span-8 bg-surface-container-low p-8">
<h3 className="font-semibold uppercase text-[10px] tracking-[0.2em] mb-6">Financial Audit Log</h3>
<div className="space-y-4">
<div className="flex items-start gap-4 pb-4 border-b border-surface">
<span className="material-symbols-outlined text-primary" data-icon="update">update</span>
<div>
<p className="text-xs font-bold uppercase tracking-wider">Adjustment made to INV-2023-0846</p>
<p className="text-[10px] opacity-60 mt-1">OCT 25, 14:32 — User STATION_04_ADMIN voided the balance due to insurance claim resolution.</p>
</div>
</div>
<div className="flex items-start gap-4 pb-4 border-b border-surface">
<span className="material-symbols-outlined text-green-600" data-icon="task_alt">task_alt</span>
<div>
<p className="text-xs font-bold uppercase tracking-wider">Batch Payment Confirmation</p>
<p className="text-[10px] opacity-60 mt-1">OCT 25, 09:15 — 12 invoices successfully reconciled from external bank feed.</p>
</div>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-tertiary" data-icon="warning">warning</span>
<div>
<p className="text-xs font-bold uppercase tracking-wider">Overdue Alert: High Risk Account</p>
<p className="text-[10px] opacity-60 mt-1">OCT 24, 18:00 — Patient SARAH KENSINGTON (INV-2023-0844) reached 30-day delinquency.</p>
</div>
</div>
</div>
</div>
{/* Quick Insights */}
<div className="col-span-4 space-y-8">
<div className="bg-primary text-white p-8">
<h3 className="font-bold uppercase text-[10px] tracking-[0.2em] mb-4 opacity-80">Collection Target</h3>
<div className="relative pt-1">
<div className="flex mb-2 items-center justify-between">
<div>
<span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full bg-white text-primary">
                                        82% ACHIEVED
                                    </span>
</div>
</div>
<div className="overflow-hidden h-1 mb-4 text-xs flex bg-white/20">
<div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white" ></div>
</div>
</div>
<p className="text-[10px] font-semibold opacity-70 leading-relaxed uppercase tracking-widest">
                            $3,200 more needed to reach monthly revenue goal for clinical station 04.
                        </p>
</div>
<div className="bg-surface-container-highest p-8">
<div className="flex items-center justify-between mb-6">
<h3 className="font-semibold uppercase text-[10px] tracking-[0.2em]">Automated Billing</h3>
<span className="material-symbols-outlined text-primary text-lg" data-icon="toggle_on" >toggle_on</span>
</div>
<p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant leading-normal">
                            System is scheduled to run next batch processing for recurring memberships on <span className="text-primary font-bold">NOV 01, 2023 AT 00:00 EST.</span>
</p>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
