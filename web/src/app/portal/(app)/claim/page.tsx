import Image from "next/image";
import Link from "next/link";

export default function PatientClaimAccessPage() {
  return (
    <>
      <main>

{/* Focused Auth Shell (520px) */}
<div className="w-full max-w-[520px] bg-surface-container-lowest flex flex-col">
{/* Branding Header */}
<header className="p-8 pb-4">
<div className="flex items-center gap-2 mb-12">
<div className="w-8 h-8 bg-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-white text-xl" data-icon="health_metrics">health_metrics</span>
</div>
<span className="text-xl font-bold tracking-widest text-neutral-900 uppercase">MEDCORE OS</span>
</div>
<h1 className="text-3xl font-light text-on-surface leading-tight mb-2 tracking-tight">Patient Claim Access</h1>
<p className="text-on-surface-variant text-sm font-normal">Secure portal activation for medical record retrieval and insurance claim management.</p>
</header>
{/* Step Indicators */}
<div className="grid grid-cols-2 px-8 gap-1">
<div className="step-active py-2">
<span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Step 01</span>
<span className="text-xs font-semibold text-on-surface">Identity</span>
</div>
<div className="step-inactive py-2 opacity-40">
<span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Step 02</span>
<span className="text-xs font-semibold text-on-surface-variant">Verification</span>
</div>
</div>
{/* Form Body */}
<div className="p-8 flex flex-col gap-8">
<section className="flex flex-col gap-6">
{/* Input 1: CCCD */}
<div className="flex flex-col gap-2">
<label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="cccd">Citizen ID (CCCD) / Passport Number</label>
<div className="relative group">
<input className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all duration-200" id="cccd" placeholder="Enter identification number" type="text"/>
<div className="absolute right-4 top-3 text-outline-variant group-focus-within:text-primary transition-colors">
<span className="material-symbols-outlined text-xl" data-icon="badge">badge</span>
</div>
</div>
</div>
{/* Input 2: Email */}
<div className="flex flex-col gap-2">
<label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Registered Email Address</label>
<div className="relative group">
<input className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all duration-200" id="email" placeholder="name@hospital.com" type="email"/>
<div className="absolute right-4 top-3 text-outline-variant group-focus-within:text-primary transition-colors">
<span className="material-symbols-outlined text-xl" data-icon="mail">mail</span>
</div>
</div>
</div>
{/* Security Info Box */}
<div className="bg-surface-container-high p-4 flex gap-4 items-start">
<span className="material-symbols-outlined text-primary text-xl" data-icon="info">info</span>
<p className="text-xs text-on-surface-variant leading-relaxed">
                            Your identity will be cross-referenced with our secure Clinical Staff registry. Ensure the details match your latest hospital admission record.
                        </p>
</div>
</section>
{/* Actions */}
<div className="flex flex-col gap-4">
<button className="w-full bg-primary-container text-white py-4 px-6 flex justify-between items-center group active:translate-y-[1px] transition-all">
<span className="font-semibold tracking-wide uppercase text-sm">Request Verification Code</span>
<span className="material-symbols-outlined transition-transform group-hover:translate-x-1" data-icon="arrow_forward">arrow_forward</span>
</button>
<a className="text-xs font-semibold text-primary hover:underline self-start uppercase tracking-wider" href="#">
                        Already activated? Sign in
                    </a>
</div>
</div>
{/* Visual Decorative "Blue 60" Bar */}
<div className="h-1 bg-gradient-to-r from-primary to-primary-container"></div>
</div>
{/* Background Decor (Architectural/Monolithic) */}
<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
<div className="absolute -top-[20%] -left-[10%] w-[60%] h-[120%] bg-surface-container-high opacity-50 rotate-12"></div>
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]">
<img alt="Medical architecture" className="w-full h-full object-cover grayscale" data-alt="Monolithic modern hospital hallway with clean white walls and blue accent lights reflecting on polished marble floors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOC9biM1FEjBEEaruoLpfKoUAXCxH0eMogR1X890B46HRmx7uaIvBMWn56cpTrvJLLLqdS90C49z7XXnG3u27U_4I_GxE19LDuD63VKAjDqGkcROIyHXXF5bEkgpPnRohmWl88rYX4Xil7fLAfgZ8YhzlvicX4qhkpvBEhqhYW11TDXvg9uwSkJIGz8wMXNUm9cwAW9Xx0b13PsOTQ6vzKRK4fCgoe25MyxkzGN8KEmbwJ7_KrkhpGoMJjzZ0DSXuZ2HFs2-m1AA"/>
</div>
</div>

</main>
    </>
  );
}
