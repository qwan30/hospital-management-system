import Image from "next/image";
import Link from "next/link";

export default function PublicHomePage() {
  return (
    <>
      <main>

{/* Hero Section */}
<section className="hero-gradient min-h-[600px] flex items-center px-6 md:px-24">
<div className="max-w-4xl min-w-0">
<h1 className="text-5xl sm:text-[60px] leading-[1.1] font-light text-white tracking-tight mb-6">
                    Engineering-grade healthcare <br/>
<span className="font-normal">precision at scale.</span>
</h1>
<p className="text-[16px] text-gray-300 max-w-xl mb-10 leading-relaxed">
                    HOSPITAL CORE provides a deterministic clinical environment. We treat hospital management as a high-precision engineering problem, delivering zero-latency patient data and architectural integrity for modern medicine.
                </p>
<div className="flex flex-col gap-4 sm:flex-row">
<button className="bg-primary-container hover:bg-primary text-white px-6 sm:px-8 py-4 text-sm font-semibold tracking-wide transition-all active:translate-y-[2px]">
                        COMMENCE OPERATIONS
                    </button>
<button className="bg-transparent border border-white/20 text-white px-6 sm:px-8 py-4 text-sm font-semibold tracking-wide hover:bg-white/10 transition-all">
                        TECHNICAL DOCUMENTATION
                    </button>
</div>
</div>
</section>
{/* Stats Block (Data Monolith) */}
<section className="bg-surface py-20 px-6 md:px-24">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
<div className="bg-surface-container-highest p-8">
<div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">System Uptime</div>
<div className="text-4xl font-light text-primary">99.998%</div>
</div>
<div className="bg-surface-container-highest p-8">
<div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Daily Transactions</div>
<div className="text-4xl font-light text-on-surface">4.2M</div>
</div>
<div className="bg-surface-container-highest p-8">
<div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Verified Providers</div>
<div className="text-4xl font-light text-on-surface">12,400+</div>
</div>
<div className="bg-surface-container-highest p-8">
<div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Clinical Accuracy</div>
<div className="text-4xl font-light text-on-surface">Sigma 6</div>
</div>
</div>
</section>
{/* Features Section (Alternating background Gray 10) */}
<section className="bg-surface-container-low py-24 px-6 md:px-24">
<div className="flex flex-col md:flex-row justify-between items-start mb-16">
<div className="max-w-2xl">
<h2 className="text-4xl font-light tracking-tight text-on-background mb-4">Core Clinical Departments</h2>
<p className="text-on-surface-variant">Structured modules designed for modular integration across hospital clusters.</p>
</div>
</div>
{/* Bento-style Department Tiles */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-1 auto-rows-[300px]">
<div className="md:col-span-8 bg-surface-container-highest p-10 flex flex-col justify-between hover:bg-white transition-colors duration-300">
<div>
<span className="material-symbols-outlined text-primary text-4xl mb-6">biotech</span>
<h3 className="text-2xl font-semibold mb-4">Diagnostic Engineering</h3>
<p className="text-on-surface-variant max-w-md">Automated pathology workflows with real-time telemetry and sequence analysis.</p>
</div>
<a className="text-primary font-bold text-sm tracking-widest uppercase flex items-center group" href="#">
                        Enter Module
                        <span className="material-symbols-outlined ml-2 group-hover:translate-x-2 transition-transform">arrow_forward</span>
</a>
</div>
<div className="md:col-span-4 bg-surface-container-highest p-10 flex flex-col justify-between hover:bg-white transition-colors duration-300">
<div>
<span className="material-symbols-outlined text-primary text-4xl mb-6">medical_services</span>
<h3 className="text-2xl font-semibold mb-4">Surgical Suite</h3>
<p className="text-on-surface-variant">Optimization engine for theater scheduling and inventory synchronization.</p>
</div>
</div>
<div className="md:col-span-4 bg-surface-container-highest p-10 flex flex-col justify-between hover:bg-white transition-colors duration-300">
<div>
<span className="material-symbols-outlined text-primary text-4xl mb-6">payments</span>
<h3 className="text-2xl font-semibold mb-4">Revenue Cycle</h3>
<p className="text-on-surface-variant">Deterministic billing logic and automated insurance reconciliation.</p>
</div>
</div>
<div className="md:col-span-8 bg-surface-container-highest p-0 relative overflow-hidden group">
<img alt="Clinical Center" className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" data-alt="wide shot of a clean modern clinical laboratory with stainless steel equipment and bright white lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcvFt1XHaghSjVXGavDUD66dWH0i1qfaQglymOPm5Mt5-ALENn8pCKWY_1A_CKADgh-bYFv3FPuRQYQ6alZyd-Qi_nKA0obBx4q6-hjNTSQ8AryEA3KNQKvbrSE0OB15hVMxF4MUbyCppDR1YrfgIzjBXZkTebPfzWOu5wp9jKtqHXPjxT9n_454paLSlRovg4siSLAJpLjKwGbVGLXgog2j9x_cQxLGPail5JvAiYqqucXkZtIceh3e02i3F2JcYKPda5cFGlIQ"/>
<div className="absolute inset-0 p-10 flex flex-col justify-end text-white pointer-events-none">
<h3 className="text-3xl font-light mb-2">Centralized Registry</h3>
<p className="text-gray-300 max-w-xs">Unified Electronic Health Records (EHR) with immutable audit trails.</p>
</div>
</div>
</div>
</section>
{/* Technical Integration Section (White Background) */}
<section className="bg-surface py-24 px-6 md:px-24">
<div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
<div className="order-2 md:order-1">
<img alt="Infrastructure" className="w-full aspect-square object-cover shadow-2xl" data-alt="abstract close up of high-end server hardware and network cables with cool blue technical lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEO13-EEZtuXxRfyAvoPToBA_DQ0ninAkJl04GsG8ItTS2JXS-q4PJMa2wg52GT8mq8TN7uc52TXlqBMQuGQZ_GHtQxEVLaVtQJQZ29-k55YIk0-_BKP4UnPwqR1OuroO9M4kMHvJ1kO3PeptmZBEgH7HRxZHwaTTaUPDNrbENbkEx4LhjXEtWuWU3860o81piV5CMtlQbwXdInXJ2JwsFn2akVEKKYTeoZwuZSs4ja8BrJhkHgGglV4OG2WMM85nzBGidwmmBRg"/>
</div>
<div className="order-1 md:order-2">
<h2 className="text-4xl font-light tracking-tight text-on-background mb-8">Architectural Precision</h2>
<div className="space-y-12">
<div className="flex gap-6">
<span className="text-primary font-bold text-xl">01</span>
<div>
<h4 className="text-lg font-semibold mb-2">Distributed Architecture</h4>
<p className="text-on-surface-variant leading-relaxed">System-wide redundancy ensures that patient care never experiences a single point of failure. Deployable across local or cloud instances.</p>
</div>
</div>
<div className="flex gap-6">
<span className="text-primary font-bold text-xl">02</span>
<div>
<h4 className="text-lg font-semibold mb-2">Interoperability Protocol</h4>
<p className="text-on-surface-variant leading-relaxed">Full compliance with global HL7 and FHIR standards. Our API allows seamless integration with legacy laboratory and imaging equipment.</p>
</div>
</div>
<div className="flex gap-6">
<span className="text-primary font-bold text-xl">03</span>
<div>
<h4 className="text-lg font-semibold mb-2">Security Audit Trails</h4>
<p className="text-on-surface-variant leading-relaxed">Every keystroke and data access event is logged with cryptographic verification, ensuring HIPAA and GDPR compliance by design.</p>
</div>
</div>
</div>
</div>
</div>
</section>

</main>
    </>
  );
}
