import Image from "next/image";
import Link from "next/link";

export default function LabResultDetailPage() {
  return (
    <>
      <main>

{/* Breadcrumb & Header Segment */}
<div className="max-w-5xl mx-auto mb-12">
<div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4">
<span>Patients</span>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<span>ID: 992834-X</span>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<span className="text-primary">Diagnostic Detail</span>
</div>
<div className="flex justify-between items-end">
<div>
<h1 className="text-4xl font-light tracking-tight text-on-surface mb-2 uppercase">Complete Blood Count (CBC)</h1>
<p className="text-on-surface-variant font-plex-sans">Collected: Oct 24, 2023 08:42 AM  |  Location: Central Diagnostic Lab</p>
</div>
<div className="flex gap-4">
<button className="px-4 py-2 bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm">print</span> PRINT REPORT
                    </button>
<button className="px-4 py-2 bg-primary-container text-white font-semibold text-xs flex items-center gap-2 hover:bg-primary transition-colors">
<span className="material-symbols-outlined text-sm">share</span> EXPORT DATA
                    </button>
</div>
</div>
</div>
{/* Bento Grid Layout for Lab Data */}
<div className="max-w-5xl mx-auto grid grid-cols-12 gap-8">
{/* Main Result Monolith (Layer 01 - Gray 10) */}
<div className="col-span-12 md:col-span-8 bg-surface-container-low p-8 border-b-2 border-primary-container">
<div className="flex justify-between items-start mb-12">
<div className="space-y-1">
<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Primary Metric</span>
<h2 className="text-2xl font-semibold text-on-surface">HEMOGLOBIN</h2>
</div>
{/* Status Badge */}
<div className="flex items-center gap-2 px-3 py-1 bg-[#198038] text-white text-[11px] font-bold tracking-wider uppercase">
<span className="material-symbols-outlined text-sm" >check_circle</span>
                        NORMAL RANGE
                    </div>
</div>
<div className="flex items-baseline gap-4 mb-12">
<span className="text-8xl font-plex-mono font-medium tracking-tighter text-on-surface">14.2</span>
<span className="text-2xl font-plex-sans text-on-surface-variant font-light">g/dL</span>
</div>
<div className="grid grid-cols-2 gap-12 border-t border-outline-variant pt-8">
<div>
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Reference Range</span>
<span className="text-xl font-plex-mono text-on-surface">13.5 — 17.5 g/dL</span>
</div>
<div>
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Analytical State</span>
<span className="text-xl font-plex-mono text-on-surface">STABLE</span>
</div>
</div>
</div>
{/* Side Technical Metadata */}
<div className="col-span-12 md:col-span-4 space-y-8">
{/* Clinician Info */}
<div className="bg-surface-container-highest p-6">
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Attending Clinician</span>
<div className="flex items-center gap-4">
<div className="w-12 h-12 bg-surface-container-low overflow-hidden">
<img alt="Dr. Sarah Miller" className="w-full h-full object-cover grayscale" data-alt="Close-up of a female doctor in a white coat looking professionally at the camera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeEpFVNiBU1r3rcAYupxpS6sfBxPz4apmNlAoRI-8t-k7p9CWk3mebI1VrKdKKGW5efo8UoxEoGh8yjtEGYf4yhUKSpqtkZ8Hn1AoTflm5tY5RQrhAI_lmhvgSeAjtyiLd30OSJBCRTiq378XBILKRLvy3RdfFOKiO3ViWE9Q3Pcb8wM-Ep2hn8F4VGWjMJISfaxoeypF_2O9NCBitN4p6D7Gm9un8EnCdH8m5ZZY0qeMxVK0tysJqEkhsAznppT2D978W6HXN4Q"/>
</div>
<div>
<div className="font-semibold text-on-surface">Dr. Sarah Miller</div>
<div className="text-xs text-on-surface-variant">Hematology Specialist</div>
</div>
</div>
</div>
{/* Attachment Link Section */}
<div className="bg-surface-container-low p-6">
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Laboratory Documentation</span>
<a className="group flex items-center justify-between py-3 border-b border-outline-variant" href="#">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">description</span>
<span className="text-xs font-semibold">Full_CBC_Report.pdf</span>
</div>
<span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
</a>
<a className="group flex items-center justify-between py-3" href="#">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">analytics</span>
<span className="text-xs font-semibold">Raw_Spectrometry_Data.csv</span>
</div>
<span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
</a>
</div>
</div>
{/* Clinician Comment Section */}
<div className="col-span-12 bg-surface-container-low p-8">
<div className="flex items-center gap-4 mb-6">
<span className="material-symbols-outlined text-on-surface">comment</span>
<h3 className="text-sm font-bold uppercase tracking-widest">Clinician Insights &amp; Observations</h3>
</div>
<div className="bg-white p-8 border-l-4 border-primary">
<p className="font-plex-sans text-lg text-on-surface leading-relaxed italic">
                        "The patient's hemoglobin levels show consistent stability compared to the previous assessment on September 12.
                        No immediate clinical intervention is required at this stage. We will continue to monitor the red blood cell
                        indices during the next scheduled follow-up in three months. Recommended: maintain current dietary iron intake."
                    </p>
<div className="mt-6 pt-6 border-t border-surface-container flex justify-between items-center">
<span className="text-xs font-plex-mono uppercase text-on-surface-variant">Signed Digitally: Oct 25, 2023 · 11:15 AM</span>
<div className="flex gap-2">
<span className="px-2 py-1 bg-surface-container text-[10px] font-bold">VERIFIED</span>
<span className="px-2 py-1 bg-surface-container text-[10px] font-bold">ENCRYPTED</span>
</div>
</div>
</div>
</div>
{/* Secondary Metrics (Asymmetric Detail) */}
<div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8">
<div className="bg-surface-container-low p-6">
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">RBC Count</span>
<div className="text-2xl font-plex-mono text-on-surface">5.12 <span className="text-sm text-on-surface-variant">10^6/μL</span></div>
<div className="mt-4 h-1 bg-surface-container overflow-hidden">
<div className="h-full bg-primary w-3/4"></div>
</div>
</div>
<div className="bg-surface-container-low p-6">
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">WBC Count</span>
<div className="text-2xl font-plex-mono text-on-surface">7.4 <span className="text-sm text-on-surface-variant">10^3/μL</span></div>
<div className="mt-4 h-1 bg-surface-container overflow-hidden">
<div className="h-full bg-primary w-1/2"></div>
</div>
</div>
<div className="bg-[#fff9e6] p-6 border-b-2 border-[#f1c21b]">
<span className="block text-[10px] font-bold uppercase tracking-widest text-[#856404] mb-2">Platelet Count</span>
<div className="text-2xl font-plex-mono text-on-surface">142 <span className="text-sm text-on-surface-variant">10^3/μL</span></div>
<div className="flex items-center gap-1 mt-4 text-[#856404] text-[10px] font-bold">
<span className="material-symbols-outlined text-sm">warning</span>
                        BORDERLINE LOW
                    </div>
</div>
<div className="bg-surface-container-low p-6">
<span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Hematocrit</span>
<div className="text-2xl font-plex-mono text-on-surface">42.8 <span className="text-sm text-on-surface-variant">%</span></div>
<div className="mt-4 h-1 bg-surface-container overflow-hidden">
<div className="h-full bg-primary w-2/3"></div>
</div>
</div>
</div>
</div>
<footer className="max-w-5xl mx-auto mt-24 pb-12 border-t border-outline-variant pt-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
<div>System Terminal ID: CORE-882-ALPHA</div>
<div className="flex gap-8">
<a className="hover:text-primary" href="#">Data Privacy Protocol</a>
<a className="hover:text-primary" href="#">System Status: Nominal</a>
</div>
</footer>

</main>
    </>
  );
}
