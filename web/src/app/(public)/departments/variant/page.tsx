import Image from "next/image";
import Link from "next/link";

export default function PublicDepartmentsPage() {
  return (
    <>
      <main>

<div className="max-w-[1440px] mx-auto">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 bg-outline-variant/10">
{/* Card 1: Diagnostic Engineering */}
<div className="bg-surface-container-lowest p-8 flex flex-col justify-between min-h-[400px] hover:bg-surface-container-high transition-colors duration-300 group cursor-pointer border-r border-b border-outline-variant/20">
<div>
<div className="mb-12">
<span className="material-symbols-outlined text-primary text-4xl" data-icon="biotech">biotech</span>
</div>
<h3 className="text-2xl font-semibold mb-4 text-on-surface">Diagnostic Engineering</h3>
<p className="text-on-surface-variant text-sm leading-6">Advanced imaging systems and pathology analytics integrated with real-time biometric feedback loops.</p>
</div>
<div className="pt-8 border-t border-outline-variant/30 flex justify-between items-center">
<span className="text-primary font-semibold text-xs tracking-widest uppercase group-hover:underline underline-offset-8">Explore Module</span>
<span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</div>
</div>
{/* Card 2: Surgical Suite */}
<div className="bg-surface-container-lowest p-8 flex flex-col justify-between min-h-[400px] hover:bg-surface-container-high transition-colors duration-300 group cursor-pointer border-r border-b border-outline-variant/20">
<div>
<div className="mb-12">
<span className="material-symbols-outlined text-primary text-4xl" data-icon="precision_manufacturing">precision_manufacturing</span>
</div>
<h3 className="text-2xl font-semibold mb-4 text-on-surface">Surgical Suite</h3>
<p className="text-on-surface-variant text-sm leading-6">Robotic-assisted surgical environments maintained under ISO Class 5 sterility standards for ultra-precise interventions.</p>
</div>
<div className="pt-8 border-t border-outline-variant/30 flex justify-between items-center">
<span className="text-primary font-semibold text-xs tracking-widest uppercase group-hover:underline underline-offset-8">Operative Data</span>
<span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</div>
</div>
{/* Card 3: Revenue Cycle */}
<div className="bg-surface-container-lowest p-8 flex flex-col justify-between min-h-[400px] hover:bg-surface-container-high transition-colors duration-300 group cursor-pointer border-r border-b border-outline-variant/20">
<div>
<div className="mb-12">
<span className="material-symbols-outlined text-primary text-4xl" data-icon="account_balance_wallet">account_balance_wallet</span>
</div>
<h3 className="text-2xl font-semibold mb-4 text-on-surface">Revenue Cycle</h3>
<p className="text-on-surface-variant text-sm leading-6">Automated fiscal management and insurance adjudication architecture designed for 100% transparency.</p>
</div>
<div className="pt-8 border-t border-outline-variant/30 flex justify-between items-center">
<span className="text-primary font-semibold text-xs tracking-widest uppercase group-hover:underline underline-offset-8">Fiscal Portal</span>
<span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</div>
</div>
{/* Card 4: Centralized Registry */}
<div className="bg-surface-container-lowest p-8 flex flex-col justify-between min-h-[400px] hover:bg-surface-container-high transition-colors duration-300 group cursor-pointer border-b border-outline-variant/20">
<div>
<div className="mb-12">
<span className="material-symbols-outlined text-primary text-4xl" data-icon="database">database</span>
</div>
<h3 className="text-20 text-2xl font-semibold mb-4 text-on-surface">Centralized Registry</h3>
<p className="text-on-surface-variant text-sm leading-6">Encrypted patient data lake leveraging distributed ledger technology for absolute integrity across clinical clusters.</p>
</div>
<div className="pt-8 border-t border-outline-variant/30 flex justify-between items-center">
<span className="text-primary font-semibold text-xs tracking-widest uppercase group-hover:underline underline-offset-8">Access Ledger</span>
<span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
