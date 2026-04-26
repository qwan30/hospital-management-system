
export default function PricingManagementPage() {
  return (
    <>
      <main>

{/* Header Section */}
<header className="mb-12 flex justify-between items-end">
<div className="max-w-2xl">
<span className="font-['Public_Sans'] font-semibold uppercase text-[10px] text-[#0f62fe] tracking-widest block mb-2">FINANCIAL_MODULE / PRICING</span>
<h2 className="text-5xl font-light tracking-tighter text-on-surface mb-4">Service Catalog</h2>
<p className="text-on-surface-variant font-body text-sm leading-relaxed opacity-80">
                    Manage standard billing rates and service protocols for global billing. Changes applied here will reflect in future patient admissions and clinical billing cycles.
                </p>
</div>
<div className="flex items-center space-x-4">
<button className="bg-surface-container-high text-on-surface px-6 py-3 font-semibold text-[10px] tracking-widest uppercase hover:bg-surface-container-highest transition-colors">
                    EXPORT CSV
                </button>
<button className="bg-[#0f62fe] text-white px-6 py-3 font-semibold text-[10px] tracking-widest uppercase hover:bg-[#004ccd] transition-all">
                    ADD SERVICE
                </button>
</div>
</header>
{/* Asymmetric Grid: Main Table & Sidebar Rules */}
<div className="grid grid-cols-12 gap-8">
{/* Table Container (Bento Style Card) */}
<div className="col-span-12 xl:col-span-9 bg-surface-container-low p-1">
<div className="bg-surface-container-lowest p-8 overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="border-b-2 border-surface-container-high">
<th className="pb-6 font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest">Service Type</th>
<th className="pb-6 font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest">Internal Name</th>
<th className="pb-6 font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest">Base Price</th>
<th className="pb-6 font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest">Currency</th>
<th className="pb-6 font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest text-center">Status</th>
<th className="pb-6 font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{/* Row 1 */}
<tr className="group hover:bg-surface-container-low transition-colors">
<td className="py-6 pr-4">
<span className="bg-primary-container/10 text-primary font-bold text-[9px] px-2 py-1 tracking-tighter">DIAGNOSTIC</span>
</td>
<td className="py-6 font-semibold text-sm">Full Bio-Scan Protocol</td>
<td className="py-6 font-mono text-sm">1,240.00</td>
<td className="py-6 text-xs text-on-surface-variant font-bold">USD</td>
<td className="py-6 text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-green-100 text-green-700 uppercase">Active</span>
</td>
<td className="py-6 text-right space-x-2">
<button className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg" data-icon="edit">edit</span></button>
<button className="text-outline hover:text-error transition-colors"><span className="material-symbols-outlined text-lg" data-icon="delete">delete</span></button>
</td>
</tr>
{/* Row 2 */}
<tr className="group hover:bg-surface-container-low transition-colors">
<td className="py-6 pr-4">
<span className="bg-tertiary-container/10 text-tertiary font-bold text-[9px] px-2 py-1 tracking-tighter">SURGICAL</span>
</td>
<td className="py-6 font-semibold text-sm">Minor Soft Tissue Repair</td>
<td className="py-6 font-mono text-sm">4,850.00</td>
<td className="py-6 text-xs text-on-surface-variant font-bold">USD</td>
<td className="py-6 text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-green-100 text-green-700 uppercase">Active</span>
</td>
<td className="py-6 text-right space-x-2">
<button className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg" data-icon="edit">edit</span></button>
<button className="text-outline hover:text-error transition-colors"><span className="material-symbols-outlined text-lg" data-icon="delete">delete</span></button>
</td>
</tr>
{/* Row 3 */}
<tr className="group hover:bg-surface-container-low transition-colors">
<td className="py-6 pr-4">
<span className="bg-secondary-container/20 text-secondary font-bold text-[9px] px-2 py-1 tracking-tighter">THERAPY</span>
</td>
<td className="py-6 font-semibold text-sm">Neuro-Rehabilitation Session</td>
<td className="py-6 font-mono text-sm">320.00</td>
<td className="py-6 text-xs text-on-surface-variant font-bold">USD</td>
<td className="py-6 text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-yellow-100 text-yellow-700 uppercase">Draft</span>
</td>
<td className="py-6 text-right space-x-2">
<button className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg" data-icon="edit">edit</span></button>
<button className="text-outline hover:text-error transition-colors"><span className="material-symbols-outlined text-lg" data-icon="delete">delete</span></button>
</td>
</tr>
{/* Row 4 */}
<tr className="group hover:bg-surface-container-low transition-colors">
<td className="py-6 pr-4">
<span className="bg-primary-container/10 text-primary font-bold text-[9px] px-2 py-1 tracking-tighter">DIAGNOSTIC</span>
</td>
<td className="py-6 font-semibold text-sm">Pathology Screening L4</td>
<td className="py-6 font-mono text-sm">850.00</td>
<td className="py-6 text-xs text-on-surface-variant font-bold">USD</td>
<td className="py-6 text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-green-100 text-green-700 uppercase">Active</span>
</td>
<td className="py-6 text-right space-x-2">
<button className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg" data-icon="edit">edit</span></button>
<button className="text-outline hover:text-error transition-colors"><span className="material-symbols-outlined text-lg" data-icon="delete">delete</span></button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Side "Data Monoliths" and Summary */}
<div className="col-span-12 xl:col-span-3 space-y-6">
{/* Data Monolith 1 */}
<div className="bg-surface-container-highest p-8">
<span className="font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest block mb-4">TOTAL CATALOG VALUE</span>
<h3 className="text-4xl font-light tracking-tighter text-on-surface">$248.5K</h3>
<div className="mt-4 h-1 bg-surface-container w-full">
<div className="h-full bg-primary w-2/3"></div>
</div>
<p className="mt-2 text-[10px] font-bold text-primary">68% YOY INCREASE</p>
</div>
{/* Data Monolith 2 */}
<div className="bg-surface-container-highest p-8 border-l-4 border-primary">
<span className="font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest block mb-4">ACTIVE SERVICES</span>
<h3 className="text-4xl font-light tracking-tighter text-on-surface">142</h3>
<p className="mt-2 text-[10px] font-bold text-on-surface-variant uppercase opacity-60">8 PENDING REVIEW</p>
</div>
{/* Quick Help Block */}
<div className="bg-surface-container-low p-8 text-xs leading-relaxed text-on-surface-variant opacity-80">
<h4 className="font-bold text-on-surface mb-2 uppercase tracking-widest">Pricing Rules</h4>
<ul className="space-y-4">
<li className="flex items-start">
<span className="material-symbols-outlined text-primary mr-2 scale-75" data-icon="info">info</span>
                            Prices exclude local tax and regulatory surcharges.
                        </li>
<li className="flex items-start">
<span className="material-symbols-outlined text-primary mr-2 scale-75" data-icon="sync">sync</span>
                            Updates sync with patient portal every 24 hours.
                        </li>
</ul>
</div>
</div>
</div>

</main>
    </>
  );
}
