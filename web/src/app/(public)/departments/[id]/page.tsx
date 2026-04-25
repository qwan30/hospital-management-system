import Image from "next/image";
import Link from "next/link";

export default function DepartmentDetailPage() {
  return (
    <>
      <main>

{/* Content Layering: Surface to Surface-container-low */}
<div className="bg-surface-container-low px-8 py-12">
<div className="max-w-7xl mx-auto">
{/* Breadcrumb */}
<nav className="flex items-center gap-2 mb-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
<a className="hover:text-primary transition-colors" href="#">DEPARTMENTS</a>
<span className="material-symbols-outlined text-[12px]" data-icon="chevron_right">chevron_right</span>
<span className="text-on-surface">CARDIOLOGY &amp; VASCULAR MEDICINE</span>
</nav>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
{/* Main Content Col */}
<div className="lg:col-span-8">
<h1 className="text-6xl md:text-8xl font-light font-headline tracking-tighter text-on-surface mb-8 leading-[0.9]">Cardiology</h1>
<div className="bg-surface-container-lowest p-0 relative mb-12">
<div className="h-64 w-full bg-surface-container-highest">
<img className="w-full h-full object-cover mix-blend-multiply opacity-80 grayscale hover:grayscale-0 transition-all duration-700" data-alt="modern medical cardiology lab with high-tech equipment and clean white architectural lines" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnOLeIk45kNIKHJW-UCSCA4ACkVPySFf3cIY7VjuSe39i0axlmxGZ9PCKdCRhWI7Y-NGrSoibI5A8jniky0BoRLPV9xYK6MnW4cMERNRpyhKDHmi2UzSt8Z5G9BbFHR472O7roKddeWZs9HlQhU95YX9pB_u6OMPoHJQsvWWip4czXuSeTL5kgcsiyrxkNd8W1ostMcSq4yQju6JkiIfEW-cDx5BhGUE2AqO19MswV6gFErgtDjm8EU7d8wiTf5o8Xx3KPj9I8xg"/>
</div>
</div>
<div className="prose prose-neutral max-w-none">
<p className="text-xl font-body leading-relaxed text-on-surface-variant mb-6 font-light">
                                Our Cardiology department is at the forefront of cardiovascular health, providing world-class diagnostic, interventional, and preventive care. We utilize the most advanced imaging technologies and minimally invasive surgical techniques to treat complex heart conditions.
                            </p>
<p className="text-base font-body leading-relaxed text-on-surface-variant mb-12">
                                Accredited as a center of excellence, our team collaborates across specialties to ensure comprehensive care for patients with coronary artery disease, arrhythmias, and heart failure. We are dedicated to translating the latest research into patient-centered clinical practice.
                            </p>
</div>
{/* Data Monoliths Bento Grid */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
<div className="bg-surface-container-highest p-6">
<span className="block text-4xl font-headline font-light mb-1">42</span>
<span className="text-[10px] font-semibold uppercase tracking-widest text-outline">Specialists</span>
</div>
<div className="bg-surface-container-highest p-6">
<span className="block text-4xl font-headline font-light mb-1">12</span>
<span className="text-[10px] font-semibold uppercase tracking-widest text-outline">ICU Suites</span>
</div>
<div className="bg-surface-container-highest p-6">
<span className="block text-4xl font-headline font-light mb-1">98%</span>
<span className="text-[10px] font-semibold uppercase tracking-widest text-outline">Success Rate</span>
</div>
<div className="bg-surface-container-highest p-6">
<span className="block text-4xl font-headline font-light mb-1">24/7</span>
<span className="text-[10px] font-semibold uppercase tracking-widest text-outline">Emergency</span>
</div>
</div>
{/* Doctors Section */}
<section id="doctors">
<div className="flex justify-between items-end mb-8">
<h3 className="text-2xl font-headline font-semibold tracking-tight">Doctors in this department</h3>
<button className="text-primary text-xs font-semibold uppercase tracking-widest flex items-center hover:underline">
                                    View All Staff <span className="material-symbols-outlined ml-2" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/10">
{/* Doctor Card 1 */}
<div className="bg-surface-container-lowest p-6 flex gap-4 transition-colors hover:bg-white group">
<div className="w-20 h-20 bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="professional portrait of senior male cardiologist with graying hair and glasses in white clinical coat" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNgNwccUIsNfFjWVeu-ZSWJTelJsBS9-owR70ddmdVtgYV8qsuvzsam00ohA-NkyJPgLOyf7H_QOqMoybn9SlOW3IMTvb-UZ0YFTq9LSywyAs9xXr6Bu3lnKpmGMQCcIri5OfxdjTRCDLXMwKbtH5sRCzcOPl2HpvRnzelgJJwI72CLv37IcUsIOiqsRyAz2t8bgwwpBX8RGTRiVCcPPiza2BxJAh110BMA_XEqQzVBv_4r3ZIWsg7vuesyEdeze8D-CUDVy_tpA"/>
</div>
<div className="flex flex-col justify-center">
<h4 className="font-headline font-semibold text-lg leading-tight group-hover:text-primary transition-colors">Dr. Elena Rodriguez</h4>
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-2">Senior Cardiologist</p>
<div className="flex gap-2">
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">Interventional</span>
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">MD, PhD</span>
</div>
</div>
</div>
{/* Doctor Card 2 */}
<div className="bg-surface-container-lowest p-6 flex gap-4 transition-colors hover:bg-white group">
<div className="w-20 h-20 bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="portrait of a young professional female doctor in blue scrubs with stethoscope around her neck" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCi16LYKew9m6FVVmqBqLq-PjaVRoLZMbCf2CoA3asP5qZ9w6hWf0BbYCmY1dgoSlgpzAHHB9DrWy7fF9p72a6Tti0_EcYz9HXVu4yx87WVkMEG38YeBx2TT3q8iNigtu0neOM4sEU2Nf3tF6V4iH_Hul4haI1_449iR2ok0I2QytBlLNw4DKssyu_pYxECt5oTnvkbKNIuph-az2wpVPQThIUHCQ3WhrWNmxBDEGe2-iNt5dxTYdcqd7NDGRcxKM6n2lpo5SOfKA"/>
</div>
<div className="flex flex-col justify-center">
<h4 className="font-headline font-semibold text-lg leading-tight group-hover:text-primary transition-colors">Dr. Marcus Thorne</h4>
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-2">Electrophysiology</p>
<div className="flex gap-2">
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">Arrhythmia</span>
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">FACC</span>
</div>
</div>
</div>
{/* Doctor Card 3 */}
<div className="bg-surface-container-lowest p-6 flex gap-4 transition-colors hover:bg-white group">
<div className="w-20 h-20 bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="professional headshot of an Asian male doctor in white coat smiling in modern clinic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNk5a66MITdOV5Hwe6lrUA4TlCJj75yCPyCBcvcD2Q6cIA6SIo-AbBST7hmiLLdUFB5JfqWz9snA_tuG3284uBVQvD_7FWOmnsXF41cYXQT2qrQG5w-M_7Bctb-o9DDXC1ZqQl9QJTv5vxn0xL3R9tbSga2s_FiYKvuzI_Oq-5x0DsC1OrkJ62qUVBS5Q8BovYTx527ragt1Ds8jmgUrU4BAi14ZEm_GIuMVsHGCwFqvge00ho0kVfA8zjeW5jos1APSMz0hujiA"/>
</div>
<div className="flex flex-col justify-center">
<h4 className="font-headline font-semibold text-lg leading-tight group-hover:text-primary transition-colors">Dr. Sarah Jenkins</h4>
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-2">Vascular Surgeon</p>
<div className="flex gap-2">
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">Surgical</span>
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">FRCS</span>
</div>
</div>
</div>
{/* Doctor Card 4 */}
<div className="bg-surface-container-lowest p-6 flex gap-4 transition-colors hover:bg-white group">
<div className="w-20 h-20 bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="portrait of a confident black male doctor in clinical setting wearing modern glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE6i6pPokaB4ovb8ld23_E2WUAC8xw0d5vUmz-ol1n-sfuKW62qhxfwIq_-83uaoyLTgiW4LjbadPhzjgBePdcWoWQ_CV-q7oI9QeZcLY0lh9NY2_VI0DVE3ur8xUKOqj3pW_Ooa93SFhOPqAEi4y9MB4669AMo-PDO_1H2bDCquzD_-eL26LPz8AeVXSCrt3Lrl_ZnFFUfXGXjiXD8QOmBCCPnEiv1qmMZOwW0XJUX_iGmhDo_lueGw-bTc_nRApqjPZcT5yIWQ"/>
</div>
<div className="flex flex-col justify-center">
<h4 className="font-headline font-semibold text-lg leading-tight group-hover:text-primary transition-colors">Dr. Alan Cooper</h4>
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-2">Pediatric Cardiology</p>
<div className="flex gap-2">
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">Pediatric</span>
<span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">MD</span>
</div>
</div>
</div>
</div>
</section>
</div>
{/* Sidebar Col: Sticky Facts */}
<div className="lg:col-span-4">
<div className="sticky top-20">
<div className="bg-surface-container-lowest p-8 border-t-4 border-primary">
<h3 className="text-sm font-semibold uppercase tracking-widest mb-8 flex items-center">
<span className="material-symbols-outlined mr-2" data-icon="info">info</span> Quick Facts
                                </h3>
<div className="space-y-8">
<div>
<span className="block text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">Direct Phone</span>
<p className="text-xl font-headline font-medium">+1 (555) 042-9900</p>
</div>
<div>
<span className="block text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">Hospital Location</span>
<p className="text-lg font-headline font-medium">North Wing, Floor 04</p>
<p className="text-sm text-on-surface-variant font-light">Suites 401A - 428B</p>
</div>
<div>
<span className="block text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">Visiting Hours</span>
<p className="text-lg font-headline font-medium">08:00 AM — 08:00 PM</p>
<p className="text-sm text-on-surface-variant font-light">Monday to Sunday</p>
</div>
</div>
<div className="mt-12 space-y-3">
<button className="w-full bg-primary text-white py-4 font-semibold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-surface-tint transition-colors">
                                        Book Consultation <span className="material-symbols-outlined text-sm" data-icon="calendar_month">calendar_month</span>
</button>
<button className="w-full bg-surface-container-high text-on-surface py-4 font-semibold uppercase tracking-widest text-xs hover:bg-surface-container-highest transition-colors">
                                        Download Department Guide
                                    </button>
</div>
</div>
{/* Contextual Map Component */}
<div className="mt-4 bg-surface-container-highest p-4">
<div className="h-40 bg-outline-variant/30 flex items-center justify-center overflow-hidden">
<img className="w-full h-full object-cover grayscale brightness-110" data-alt="clean abstract geometric map visualization with high contrast blue and white aesthetics" data-location="Chicago Medical District" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArNSuP3GACJLcUFWdP0XbC8evHXJnp0tezFuGM_HZLtA_w2U4kMACvTApZ__l3Uu9kys4TggxX-nHXKK5Hk3i9KvE5WM5QcwGeQ-4w9EqEVfixt_mzlLCx9-Nxt17AMrG_r1G2CSCyXXNg88dM8R1n0od0dvQNsBWrwyXPKbT8MXj0fj5fDfZ3ZDDabHPZf7qQWz9qrGj4oRQ9u_y-UQNf2d2K0cmvTLqrQbN9hqJzHgG4c4z1Iuq2A7waUIV53viPuC4DDNELaw"/>
</div>
<div className="mt-4 flex items-center justify-between">
<span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface">Facility Navigation</span>
<span className="material-symbols-outlined text-primary text-sm" data-icon="open_in_new">open_in_new</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Footer / Sub-layout Layering */}
<footer className="bg-surface px-8 py-12">
<div className="max-w-7xl mx-auto border-t border-outline-variant/20 pt-12">
<div className="grid grid-cols-1 md:grid-cols-4 gap-12">
<div className="col-span-2">
<span className="text-lg font-semibold tracking-tighter text-[#1c1b1b] uppercase mb-4 block">MED-CARBON HMS</span>
<p className="text-sm text-on-surface-variant max-w-sm font-light">
                            Architecting the future of healthcare through technical precision and compassionate care. Part of the Carbon Global Health network.
                        </p>
</div>
<div>
<h4 className="text-[10px] font-semibold uppercase tracking-widest text-on-surface mb-4">Related Units</h4>
<ul className="text-sm space-y-2 text-on-surface-variant font-light">
<li><a className="hover:text-primary transition-colors" href="#">Cardiac Surgery</a></li>
<li><a className="hover:text-primary transition-colors" href="#">Vascular Diagnostics</a></li>
<li><a className="hover:text-primary transition-colors" href="#">Cardiac Rehab</a></li>
</ul>
</div>
<div>
<h4 className="text-[10px] font-semibold uppercase tracking-widest text-on-surface mb-4">Internal Systems</h4>
<ul className="text-sm space-y-2 text-on-surface-variant font-light">
<li><a className="hover:text-primary transition-colors" href="#">Physician Portal</a></li>
<li><a className="hover:text-primary transition-colors" href="#">EHR Integration</a></li>
<li><a className="hover:text-primary transition-colors" href="#">PACs Server</a></li>
</ul>
</div>
</div>
<div className="mt-20 flex justify-between items-center text-[10px] font-semibold uppercase tracking-widest text-outline">
<span>© 2024 MED-CARBON HMS SYSTEMS. ALL RIGHTS RESERVED.</span>
<div className="flex gap-6">
<a className="hover:text-on-surface" href="#">Security</a>
<a className="hover:text-on-surface" href="#">Privacy</a>
<a className="hover:text-on-surface" href="#">Compliance</a>
</div>
</div>
</div>
</footer>

</main>
    </>
  );
}
