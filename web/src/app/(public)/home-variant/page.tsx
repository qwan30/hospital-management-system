import Image from "next/image";
import Link from "next/link";

export default function PublicHomePage() {
  return (
    <>
      <main>

{/* Hero Section */}
<section className="bg-surface py-24 px-8 md:px-16">
<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
<div className="md:col-span-7">
<p className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">INTELLIGENT HEALTHCARE SYSTEMS</p>
<h1 className="text-[60px] leading-[1.1] font-light text-[#161616] tracking-tight mb-8">
                        Precision engineering for the <span className="font-semibold">clinical frontier</span>.
                    </h1>
<button className="bg-primary-container text-white px-8 py-4 flex items-center gap-4 hover:bg-primary transition-all active:translate-y-[2px]">
<span className="font-semibold tracking-wide">EXPLORE CORE ARCHITECTURE</span>
<span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
<div className="md:col-span-5 aspect-square bg-surface-container-low overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Modern minimalist architectural hospital wing with sharp angles and clean white concrete surfaces under bright daylight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdN9YuMy4-cAkHpJG5mgRTEakK4HXRuYcWXwTbSsQ_yh4D-AzklTYBEhSvd6DQ_aUhmejGPfe6T7QJUGJJZAZzJ0PLbjYrBJGj6v7ibuOF8lGlO8QuEbB4W2gsdhncntJdJFN5QWxToA1pXsABMBpRPnMm--MWL1BwgCvl_g65K-TxoIDdzqDhciWUx-qP-FlFLJqiNs3SuT_QzVYPSwJqasS6JWOC7HbCNZLjKtnvuESIuoyD8AAbFnc7seBxe6D4AQz0WDSTvw"/>
</div>
</div>
</section>
{/* Trust Signals */}
<section className="bg-surface-container-low py-12 px-8 border-y border-outline-variant/10">
<div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-outline" data-icon="verified">verified</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">ISO 27001 Certified</span>
</div>
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-outline" data-icon="shield">shield</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">HIPAA Compliant Nodes</span>
</div>
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-outline" data-icon="speed">speed</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">99.99% Core Uptime</span>
</div>
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-outline" data-icon="lan">lan</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Federated AI Network</span>
</div>
</div>
</section>
{/* Featured Departments (Bento Grid Style) */}
<section className="bg-surface-container-low py-24 px-8 md:px-16">
<div className="max-w-7xl mx-auto">
<h2 className="text-3xl font-light tracking-tight mb-12">Clinical Hubs</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-1">
<div className="bg-surface p-12 aspect-[4/5] flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
<div>
<span className="material-symbols-outlined text-primary text-4xl mb-6" data-icon="biotech">biotech</span>
<h3 className="text-xl font-semibold mb-4">Precision Diagnostics</h3>
<p className="text-on-surface-variant text-sm leading-relaxed">Advanced imaging and molecular analysis powered by MED-CORE's proprietary neural engine.</p>
</div>
<a className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2" href="#">Protocol 01 <span className="material-symbols-outlined text-sm" data-icon="east">east</span></a>
</div>
<div className="bg-surface p-12 aspect-[4/5] flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
<div>
<span className="material-symbols-outlined text-primary text-4xl mb-6" data-icon="cardiology">cardiology</span>
<h3 className="text-xl font-semibold mb-4">Cardiac Architecture</h3>
<p className="text-on-surface-variant text-sm leading-relaxed">Integrated cardiovascular monitoring with predictive telemetry and remote intervention suites.</p>
</div>
<a className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2" href="#">Protocol 02 <span className="material-symbols-outlined text-sm" data-icon="east">east</span></a>
</div>
<div className="bg-surface p-12 aspect-[4/5] flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
<div>
<span className="material-symbols-outlined text-primary text-4xl mb-6" data-icon="neurology">neurology</span>
<h3 className="text-xl font-semibold mb-4">Neural Systems</h3>
<p className="text-on-surface-variant text-sm leading-relaxed">Specialized neurological response units focusing on rapid neurovascular recovery protocols.</p>
</div>
<a className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2" href="#">Protocol 03 <span className="material-symbols-outlined text-sm" data-icon="east">east</span></a>
</div>
</div>
</div>
</section>
{/* Featured Doctors Row */}
<section className="bg-surface py-24 px-8 md:px-16 overflow-hidden">
<div className="max-w-7xl mx-auto">
<div className="flex justify-between items-end mb-12">
<h2 className="text-3xl font-light tracking-tight">Lead Strategists</h2>
<div className="flex gap-4">
<button className="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button className="w-12 h-12 border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low">
<span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
<div className="flex gap-8 overflow-x-auto no-scrollbar">
<div className="min-w-[320px] flex-shrink-0 group">
<div className="aspect-[3/4] bg-surface-container-high mb-6 overflow-hidden">
<img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Portrait of a female chief medical officer in a white coat, focused expression, cinematic clinical studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNVU4WxlcmlBz10RhV8SxIa879AsYQ-Clh-HXmnplOwJ30ho1rn63LvT8lRhrr8l_SrIycwRr8fMg29DiqY2ulaajdXwx9NYjPfzvJJl6xwOdcM4zU5wwuBW74PIxWLzyCiCBmI61GLqfE7AU3RaWDtU1aNxqJfYNDxk6BPkL_jMqNZ4NNDsy4MZI6rj4HcdR0PHS3wKDzg8cRr6UwQPTmAW3S1DC7UFozLkjtnE8vu8Fm1VVeksHW-x-LLhbk76VqAW8R1NMA3g"/>
</div>
<p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Chief Surgeon</p>
<h4 className="text-xl font-semibold">Dr. Elena Volkov</h4>
</div>
<div className="min-w-[320px] flex-shrink-0 group">
<div className="aspect-[3/4] bg-surface-container-high mb-6 overflow-hidden">
<img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Male cardiologist in professional medical attire, silver hair, confident stance, high-tech diagnostic background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh-dWQXanUv3QIT-V6H7IcDSnoB98iIBeVUtZYkhx8N49kmFQDatuaNpohMs8LXQx9q7r2ZhxMpXIeI3bEg2NZzhYDo5pGk-wa7okFRr3uphMjWlu8bV0sNP55IWsR1LTFBw4xEUuCSBwfqhY3q4Jr21Q_YR31XZ-g3W8YU92CaTcaTtcINfu8buHyysxcSIpkCDXAPDEMSBoXTd7oi0vxCd6qzYXs3HWiYM5ViAOPeOCd50OkOZ-W4bOSyN_vQ-Xv1ONkLfvmAQ"/>
</div>
<p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Neural Lead</p>
<h4 className="text-xl font-semibold">Dr. Marcus Chen</h4>
</div>
<div className="min-w-[320px] flex-shrink-0 group">
<div className="aspect-[3/4] bg-surface-container-high mb-6 overflow-hidden">
<img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Female research scientist in clinical laboratory, focused on microscope, blue and white clinical lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIrYsuUyVJIxfxbtLn2v6sTngLGaTDmJ_s7cz7dQJ9oggb5xpaGT70eGqDfxVC14w5Sv38b6usv8qyJ8Vnz3IVgWcS6aotkyFRKwPtrcWlE55PLsIZL6VNjfbkjGR8WS1-c9p2MhmtUD7jO3pBdCf6zgaWgoLceg68hyIHCqtuexoD-P3T7GgJevQOuVPasUEcXt53r-IZQvqa_bfRC9_O906R72wEAfJq1BnrjfUtdFWFabXThiT2UMIz1STt8y-GnDH3NnDVeA"/>
</div>
<p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Research Director</p>
<h4 className="text-xl font-semibold">Dr. Sarah Kostic</h4>
</div>
<div className="min-w-[320px] flex-shrink-0 group">
<div className="aspect-[3/4] bg-surface-container-high mb-6 overflow-hidden">
<img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Male pediatrician in a modern clinic setting, warm natural lighting, minimalist medical environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqV7KQ7ADTW9pgGaFJDZT1JF5BASdJ8nH3to7a_CVmWZKNeS1DW_r9Y3Uu_RM1HIKitMfH8j7DfdGgR8VLLTrTwONb1TtnrmWFPAz5g8TSwhUpK_SCp8Dwz9MMLa0IMY7w169iOjTpdRIjJCSEiOOIYMC2I3Ku0kaGz4v3qhwa3Y8vwMi3VGi5GteWYTMp5oObFAJVKjutG3ehM9Y2pVISg8aCh0jq-y81sC7lW_D8Dgk3q103yF2OwN_N7-9hsnoFTh0eVvV3RA"/>
</div>
<p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Pediatric Lead</p>
<h4 className="text-xl font-semibold">Dr. Julian Thorne</h4>
</div>
</div>
</div>
</section>
{/* Latest News */}
<section className="bg-surface-container-low py-24 px-8 md:px-16">
<div className="max-w-7xl mx-auto">
<h2 className="text-3xl font-light tracking-tight mb-12">Intelligence Feed</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
<article className="bg-surface hover:bg-surface-container-lowest transition-all">
<div className="aspect-video bg-surface-container-highest">
<img className="w-full h-full object-cover" data-alt="Close-up of a digital medical interface with glowing blue data points and molecular structures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSTj2S3Es9ZxdX2cEiMtZrkWukzs7vf8ukZLu_H_vkjsmRecXRFCAb-QY4JPVkSzcaGto8ubr-sA0Hzk3eOWNe3eu1YzgmvEauiP6wecK1md9NjPwIi4o0ffMTgNY9mpMpcC6_hERWXZiu8VbbuiWBL9Gbj1g0LJbaGt5qb5IqLD4FGrlddhirkwcKl-5ynZ6ucDSGMOgoZONk2h2s60m1l0r9BUYQO0vfkeRKYhtJ429w4D9xms5HFwCey5O77Zf41dRyhgNcSg"/>
</div>
<div className="p-8">
<time className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-4 block">OCT 24, 2023</time>
<h3 className="text-lg font-semibold mb-4 leading-tight">Implementing Real-Time Neural Mapping in Phase 4 Theaters</h3>
<p className="text-on-surface-variant text-sm mb-6">A deep dive into the latest firmware update for MED-CORE intraoperative environments.</p>
<a className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2" href="#">Read Protocol <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span></a>
</div>
</article>
<article className="bg-surface hover:bg-surface-container-lowest transition-all">
<div className="aspect-video bg-surface-container-highest">
<img className="w-full h-full object-cover" data-alt="Architectural rendering of a futuristic hospital atrium with glass ceilings and hanging gardens" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFe353U-j1hW7QxkmEod02nbMm187xAV5dlPxt32zm-y21P2zBDbfnV_Cp1Ny6aq7xb4XphiJeVw6W8-iu1rlhjuaolnRYBd1eEAjWXzY-dDtwvwbL-ZuBPX6blyAS0qnwyOJR6DWL1hquV4g51pKA26POmUP4bDbiB707rjoippqapKkhLhRPPJY6SwJdmud5XHI2rMTYB_4RQyHjAwsO8FG7ZqlfasFKE6H8TbQoAkUslhOW8N_qPhtzyIVz6PJGt0jOeenxGA"/>
</div>
<div className="p-8">
<time className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-4 block">OCT 20, 2023</time>
<h3 className="text-lg font-semibold mb-4 leading-tight">Expansion of the Geneva Central Operations Hub</h3>
<p className="text-on-surface-variant text-sm mb-6">New infrastructure developments to support pan-European clinical data liquidity.</p>
<a className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2" href="#">Read Update <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span></a>
</div>
</article>
<article className="bg-surface hover:bg-surface-container-lowest transition-all">
<div className="aspect-video bg-surface-container-highest">
<img className="w-full h-full object-cover" data-alt="Macro photography of a sleek titanium surgical instrument resting on a white laboratory surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClVpcuFV2UrdYYa-sqWRZkak2Z3rpyUR7PaGquDqzCvwwlkhucz-2tT-ksulrNf4LbR0pZHNM19WnAnVl2woD69GERDJjtxSiVLMw3w7plE44ZxJ4WeFhO0Biwuf9R3yPh6Rjtf39r7ptbIUZfElDRWHzQffKJLD9rS2FGhkmGApuyz7Q8eRlqbLdNrnq78T4-n6E-s9BFfpAj6C9XzbCy74i56oCWVo8EuCrNLhrKsa0prkHnbHqHR8p0ZExIgN8gvxEoSM1tiw"/>
</div>
<div className="p-8">
<time className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-4 block">OCT 15, 2023</time>
<h3 className="text-lg font-semibold mb-4 leading-tight">The Future of Non-Invasive Microsurgical Precision</h3>
<p className="text-on-surface-variant text-sm mb-6">Evaluating the efficacy of the new H-Series autonomous surgical stabilizers.</p>
<a className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2" href="#">Read Analysis <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span></a>
</div>
</article>
</div>
</div>
</section>
{/* Footer */}
<footer className="bg-neutral-900 text-white py-24 px-8 md:px-16">
<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
<div className="md:col-span-1">
<div className="font-black text-xl tracking-tighter uppercase mb-8">MED-CORE</div>
<p className="text-neutral-400 text-sm leading-relaxed mb-8">Architectural precision in healthcare delivery. Building the systems that sustain the future of human recovery.</p>
<div className="flex gap-4">
<a className="w-10 h-10 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors" href="#">
<span className="material-symbols-outlined text-sm" data-icon="share">share</span>
</a>
<a className="w-10 h-10 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors" href="#">
<span className="material-symbols-outlined text-sm" data-icon="mail">mail</span>
</a>
<a className="w-10 h-10 bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors" href="#">
<span className="material-symbols-outlined text-sm" data-icon="public">public</span>
</a>
</div>
</div>
<div>
<h5 className="text-xs font-bold uppercase tracking-[0.2em] mb-8">Navigation</h5>
<ul className="space-y-4 text-sm text-neutral-400">
<li><a className="hover:text-white transition-colors" href="#">Clinical Hubs</a></li>
<li><a className="hover:text-white transition-colors" href="#">Research Units</a></li>
<li><a className="hover:text-white transition-colors" href="#">Patient Portals</a></li>
<li><a className="hover:text-white transition-colors" href="#">System Status</a></li>
</ul>
</div>
<div>
<h5 className="text-xs font-bold uppercase tracking-[0.2em] mb-8">Compliance</h5>
<ul className="space-y-4 text-sm text-neutral-400">
<li><a className="hover:text-white transition-colors" href="#">Privacy Protocols</a></li>
<li><a className="hover:text-white transition-colors" href="#">Data Governance</a></li>
<li><a className="hover:text-white transition-colors" href="#">Ethics Board</a></li>
<li><a className="hover:text-white transition-colors" href="#">Security Standards</a></li>
</ul>
</div>
<div>
<h5 className="text-xs font-bold uppercase tracking-[0.2em] mb-8">Terminal</h5>
<div className="bg-neutral-800 p-4 font-mono text-[10px] text-neutral-500 leading-tight">
<p>&gt; MEDCORE_OS_INIT: SUCCESS</p>
<p>&gt; ENCRYPTION: ACTIVE</p>
<p>&gt; NODES ONLINE: 1,402</p>
<p>&gt; LOCAL_TIME: 14:22:01 UTC</p>
</div>
</div>
</div>
<div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between gap-4">
<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">© 2024 MED-CORE ARCHITECT. ALL RIGHTS RESERVED.</p>
<div className="flex gap-8">
<a className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white" href="#">Legal</a>
<a className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white" href="#">Accessibility</a>
<a className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white" href="#">Contact</a>
</div>
</div>
</footer>

</main>
    </>
  );
}
