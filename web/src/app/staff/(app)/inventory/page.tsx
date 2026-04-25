import Image from "next/image";
import Link from "next/link";

export default function InventoryPage() {
  return (
    <>
      <main>

{/* Workspace Header */}
<section className="mb-12">
<span className="font-['Public_Sans'] text-[10px] font-semibold text-primary-container tracking-widest uppercase block mb-2">Operations Center</span>
<h2 className="text-5xl font-light text-on-surface tracking-tight font-['Public_Sans'] mb-8">Inventory Workspace</h2>
{/* KPI Strip: Data Monoliths */}
<div className="grid grid-cols-4 gap-0 mb-12">
<div className="bg-surface-container-highest p-6 border-r border-outline-variant/15">
<span className="font-['Public_Sans'] text-[10px] font-bold text-on-surface/60 tracking-widest block mb-4 uppercase">Total Stock Value</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-light">$1.2M</span>
<span className="text-[10px] font-bold text-primary-container">+4.2%</span>
</div>
</div>
<div className="bg-surface-container-highest p-6 border-r border-outline-variant/15">
<span className="font-['Public_Sans'] text-[10px] font-bold text-on-surface/60 tracking-widest block mb-4 uppercase">Critical Alerts</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-light text-error">14</span>
<span className="text-[10px] font-bold text-error">ACTION REQ.</span>
</div>
</div>
<div className="bg-surface-container-highest p-6 border-r border-outline-variant/15">
<span className="font-['Public_Sans'] text-[10px] font-bold text-on-surface/60 tracking-widest block mb-4 uppercase">Active Batches</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-light">482</span>
</div>
</div>
<div className="bg-surface-container-highest p-6">
<span className="font-['Public_Sans'] text-[10px] font-bold text-on-surface/60 tracking-widest block mb-4 uppercase">Pending Receipts</span>
<div className="flex items-baseline gap-2">
<span className="text-3xl font-light">08</span>
<span className="material-symbols-outlined text-secondary" data-icon="local_shipping">local_shipping</span>
</div>
</div>
</div>
</section>
{/* Workspace Tabs */}
<div className="flex border-b-2 border-surface-container mb-0">
<button className="px-8 py-4 font-['Public_Sans'] text-[10px] font-bold tracking-widest uppercase border-b-4 border-primary-container text-primary-container bg-surface-container-lowest transition-colors">Items</button>
<button className="px-8 py-4 font-['Public_Sans'] text-[10px] font-bold tracking-widest uppercase border-b-4 border-transparent text-on-surface/60 hover:text-on-surface hover:bg-surface-container-low transition-colors">Lots</button>
<button className="px-8 py-4 font-['Public_Sans'] text-[10px] font-bold tracking-widest uppercase border-b-4 border-transparent text-on-surface/60 hover:text-on-surface hover:bg-surface-container-low transition-colors">Movements</button>
</div>
{/* Content Area: Data Table */}
<section className="bg-surface-container-lowest">
{/* Table Controls */}
<div className="p-4 flex justify-between items-center bg-surface-container-low">
<div className="flex gap-4">
<button className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 text-[10px] font-bold tracking-widest">
<span className="material-symbols-outlined text-[16px]" data-icon="filter_list">filter_list</span>
                        FILTER
                    </button>
<button className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 text-[10px] font-bold tracking-widest">
<span className="material-symbols-outlined text-[16px]" data-icon="download">download</span>
                        EXPORT CSV
                    </button>
</div>
<span className="text-[10px] font-bold text-on-surface/40 tracking-widest">SHOWING 1-12 OF 284 ITEMS</span>
</div>
{/* Brutalist Table */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant/15">
<th className="px-6 py-4 font-['Public_Sans'] text-[10px] font-extrabold tracking-widest text-on-surface/50 uppercase">SKU / Item Name</th>
<th className="px-6 py-4 font-['Public_Sans'] text-[10px] font-extrabold tracking-widest text-on-surface/50 uppercase">Category</th>
<th className="px-6 py-4 font-['Public_Sans'] text-[10px] font-extrabold tracking-widest text-on-surface/50 uppercase">Qty / Unit</th>
<th className="px-6 py-4 font-['Public_Sans'] text-[10px] font-extrabold tracking-widest text-on-surface/50 uppercase">Threshold</th>
<th className="px-6 py-4 font-['Public_Sans'] text-[10px] font-extrabold tracking-widest text-on-surface/50 uppercase">Expiry Date</th>
<th className="px-6 py-4 font-['Public_Sans'] text-[10px] font-extrabold tracking-widest text-on-surface/50 uppercase">Status</th>
</tr>
</thead>
<tbody className="font-['Public_Sans'] text-xs">
<tr className="group hover:bg-surface-container-low transition-colors border-b border-outline-variant/15">
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="font-bold text-on-surface">MED-9942</span>
<span className="text-on-surface/60">Epinephrine Auto-Injector 0.3mg</span>
</div>
</td>
<td className="px-6 py-5 uppercase font-bold text-on-surface/60">Emergency</td>
<td className="px-6 py-5 font-bold">42 <span className="text-on-surface/40 font-normal">UNITS</span></td>
<td className="px-6 py-5 text-on-surface/60">50</td>
<td className="px-6 py-5 text-on-surface/60">OCT 12, 2025</td>
<td className="px-6 py-5">
<span className="inline-flex items-center px-2 py-1 bg-error-container text-error font-extrabold text-[9px] tracking-widest uppercase">Low Stock</span>
</td>
</tr>
<tr className="group hover:bg-surface-container-low transition-colors border-b border-outline-variant/15">
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="font-bold text-on-surface">SUR-2210</span>
<span className="text-on-surface/60">Sterile Surgical Gown - Size L</span>
</div>
</td>
<td className="px-6 py-5 uppercase font-bold text-on-surface/60">Apparel</td>
<td className="px-6 py-5 font-bold">1,240 <span className="text-on-surface/40 font-normal">UNITS</span></td>
<td className="px-6 py-5 text-on-surface/60">200</td>
<td className="px-6 py-5 text-on-surface/60">N/A</td>
<td className="px-6 py-5">
<span className="inline-flex items-center px-2 py-1 bg-primary-fixed text-primary font-extrabold text-[9px] tracking-widest uppercase">Optimal</span>
</td>
</tr>
<tr className="group hover:bg-surface-container-low transition-colors border-b border-outline-variant/15">
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="font-bold text-on-surface">LAB-7721</span>
<span className="text-on-surface/60">Blood Culture Bottles (Set of 10)</span>
</div>
</td>
<td className="px-6 py-5 uppercase font-bold text-on-surface/60">Laboratory</td>
<td className="px-6 py-5 font-bold">12 <span className="text-on-surface/40 font-normal">UNITS</span></td>
<td className="px-6 py-5 text-on-surface/60">15</td>
<td className="px-6 py-5 text-on-surface/60">MAY 04, 2024</td>
<td className="px-6 py-5">
<span className="inline-flex items-center px-2 py-1 bg-tertiary-fixed text-tertiary font-extrabold text-[9px] tracking-widest uppercase">Expiring Soon</span>
</td>
</tr>
<tr className="group hover:bg-surface-container-low transition-colors border-b border-outline-variant/15">
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="font-bold text-on-surface">MED-1102</span>
<span className="text-on-surface/60">Normal Saline IV Fluid 500ml</span>
</div>
</td>
<td className="px-6 py-5 uppercase font-bold text-on-surface/60">Fluids</td>
<td className="px-6 py-5 font-bold">480 <span className="text-on-surface/40 font-normal">UNITS</span></td>
<td className="px-6 py-5 text-on-surface/60">100</td>
<td className="px-6 py-5 text-on-surface/60">AUG 21, 2026</td>
<td className="px-6 py-5">
<span className="inline-flex items-center px-2 py-1 bg-primary-fixed text-primary font-extrabold text-[9px] tracking-widest uppercase">Optimal</span>
</td>
</tr>
<tr className="group hover:bg-surface-container-low transition-colors border-b border-outline-variant/15">
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="font-bold text-on-surface">MED-3381</span>
<span className="text-on-surface/60">Propofol Emulsion 10mg/mL</span>
</div>
</td>
<td className="px-6 py-5 uppercase font-bold text-on-surface/60">Anesthesia</td>
<td className="px-6 py-5 font-bold">08 <span className="text-on-surface/40 font-normal">UNITS</span></td>
<td className="px-6 py-5 text-on-surface/60">25</td>
<td className="px-6 py-5 text-on-surface/60">DEC 30, 2024</td>
<td className="px-6 py-5">
<span className="inline-flex items-center px-2 py-1 bg-error-container text-error font-extrabold text-[9px] tracking-widest uppercase">Critical</span>
</td>
</tr>
</tbody>
</table>
</div>
{/* Footer Stats Overlay */}
<div className="p-8 flex items-center justify-end gap-12 bg-surface-container-lowest border-t border-outline-variant/15">
<div className="flex flex-col items-end">
<span className="text-[9px] font-bold text-on-surface/40 tracking-widest uppercase">Current On-Hand</span>
<span className="text-xl font-light">18,402 Units</span>
</div>
<div className="flex flex-col items-end">
<span className="text-[9px] font-bold text-on-surface/40 tracking-widest uppercase">Replenishment Cost</span>
<span className="text-xl font-light text-primary-container">$41,029.00</span>
</div>
<button className="bg-primary-container text-white px-10 py-4 font-bold text-[10px] tracking-widest uppercase hover:brightness-110 transition-all">
                    Generate Order
                </button>
</div>
</section>
{/* Secondary Info Area: Asymmetric Layout */}
<section className="grid grid-cols-12 gap-8 mt-12">
<div className="col-span-8 bg-surface-container-low p-8">
<h3 className="font-['Public_Sans'] text-[10px] font-extrabold tracking-widest uppercase mb-8">Stock Movement Analytics</h3>
<div className="h-64 relative bg-surface-container-lowest p-4 overflow-hidden">
{/* Placeholder for Chart with Abstract Aesthetic */}
<div className="absolute inset-0 opacity-10 flex items-end">
<div className="w-1/6 h-[60%] bg-primary-container mx-1"></div>
<div className="w-1/6 h-[80%] bg-primary-container mx-1"></div>
<div className="w-1/6 h-[40%] bg-primary-container mx-1"></div>
<div className="w-1/6 h-[90%] bg-primary-container mx-1"></div>
<div className="w-1/6 h-[55%] bg-primary-container mx-1"></div>
<div className="w-1/6 h-[75%] bg-primary-container mx-1"></div>
</div>
<div className="relative z-10 flex flex-col h-full justify-center items-center text-on-surface/40">
<span className="material-symbols-outlined text-4xl mb-4" data-icon="analytics">analytics</span>
<p className="text-[10px] font-bold tracking-widest">REAL-TIME MOVEMENT DATA ACTIVE</p>
</div>
</div>
</div>
<div className="col-span-4 flex flex-col gap-8">
<div className="bg-primary-container text-white p-8">
<span className="material-symbols-outlined text-4xl mb-6" data-icon="inventory">inventory</span>
<h4 className="text-2xl font-light mb-4">Stock Audit Ready</h4>
<p className="text-xs opacity-80 leading-relaxed mb-6">Last reconciliation was performed 14 hours ago by STATION_04. Next scheduled audit in 10 hours.</p>
<button className="w-full py-4 border border-white/30 text-[10px] font-bold tracking-widest hover:bg-white/10 transition-colors">START MANUAL AUDIT</button>
</div>
<div className="bg-surface-container-high p-8">
<span className="font-['Public_Sans'] text-[10px] font-extrabold tracking-widest uppercase mb-4 block">Quick Actions</span>
<ul className="space-y-4">
<li><a className="flex items-center justify-between text-xs font-bold border-b border-on-surface/10 pb-2 hover:text-primary-container transition-colors" href="#"><span>ADJUST STOCK</span> <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span></a></li>
<li><a className="flex items-center justify-between text-xs font-bold border-b border-on-surface/10 pb-2 hover:text-primary-container transition-colors" href="#"><span>TRANSFER BATCH</span> <span className="material-symbols-outlined text-sm" data-icon="swap_horiz">swap_horiz</span></a></li>
<li><a className="flex items-center justify-between text-xs font-bold border-b border-on-surface/10 pb-2 hover:text-primary-container transition-colors" href="#"><span>PRINT LABELS</span> <span className="material-symbols-outlined text-sm" data-icon="print">print</span></a></li>
</ul>
</div>
</div>
</section>

</main>
    </>
  );
}
