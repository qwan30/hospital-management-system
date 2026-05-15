import Image from "next/image";

import { HcIcon } from "@/components/ui/hc-icon";
export default function BookingWizardSymptomsPage() {
  return (
    <>
      <main>

<div className="max-w-6xl mx-auto">
<header className="mb-12">
<nav className="flex items-center space-x-0 mb-8 border-b border-surface-container-high">
<div className="flex items-center px-4 py-3 border-b-2 border-primary text-primary font-semibold text-sm">
<span className="w-5 h-5 flex items-center justify-center border border-primary text-[10px] mr-2">1</span>
                        Symptoms
                    </div>
<div className="flex items-center px-4 py-3 text-outline font-medium text-sm">
<span className="w-5 h-5 flex items-center justify-center border border-outline text-[10px] mr-2">2</span>
                        Triage
                    </div>
<div className="flex items-center px-4 py-3 text-outline font-medium text-sm">
<span className="w-5 h-5 flex items-center justify-center border border-outline text-[10px] mr-2">3</span>
                        Scheduling
                    </div>
<div className="flex items-center px-4 py-3 text-outline font-medium text-sm">
<span className="w-5 h-5 flex items-center justify-center border border-outline text-[10px] mr-2">4</span>
                        Confirmation
                    </div>
</nav>
<h1 className="text-4xl font-light tracking-tight text-on-surface mb-2">Booking Wizard: Symptoms</h1>
<p className="text-on-surface-variant max-w-2xl">Enter the patient's current clinical presentation. The system will prioritize based on severity markers and historical data.</p>
</header>
<div className="grid grid-cols-12 gap-0">
<section className="col-span-7 bg-surface-container-low p-8">
<h2 className="text-xs font-semibold uppercase tracking-widest text-outline mb-6">Patient Input Section</h2>
<div className="mb-8">
<label className="block text-sm font-semibold mb-2 text-on-surface">Primary Complaint</label>
<textarea className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-on-surface min-h-[160px] p-4 transition-all" placeholder="Describe the symptoms in detail (e.g., Duration, Intensity, Triggers)..."></textarea>
</div>
<div className="grid grid-cols-2 gap-8 mb-8">
<div>
<label className="block text-sm font-semibold mb-2 text-on-surface">Onset Time</label>
<input className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-on-surface p-4" type="time"/>
</div>
<div>
<label className="block text-sm font-semibold mb-2 text-on-surface">Pain Scale (1-10)</label>
<input className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 text-on-surface p-4" max="10" min="1" type="number"/>
</div>
</div>
<div className="mb-12">
<label className="block text-sm font-semibold mb-4 text-on-surface">Observed Symptoms (Check all that apply)</label>
<div className="grid grid-cols-2 gap-4">
<label className="flex items-center space-x-3 cursor-pointer">
<input className="w-4 h-4 border-2 border-outline text-primary focus:ring-0 rounded-none" type="checkbox"/>
<span className="text-sm">Acute Fever (&gt;101°F)</span>
</label>
<label className="flex items-center space-x-3 cursor-pointer">
<input className="w-4 h-4 border-2 border-outline text-primary focus:ring-0 rounded-none" type="checkbox"/>
<span className="text-sm">Respiratory Distress</span>
</label>
<label className="flex items-center space-x-3 cursor-pointer">
<input className="w-4 h-4 border-2 border-outline text-primary focus:ring-0 rounded-none" type="checkbox"/>
<span className="text-sm">Abdominal Sharpness</span>
</label>
<label className="flex items-center space-x-3 cursor-pointer">
<input className="w-4 h-4 border-2 border-outline text-primary focus:ring-0 rounded-none" type="checkbox"/>
<span className="text-sm">Neurological Deficit</span>
</label>
</div>
</div>
<div className="flex space-x-4">
<button className="bg-primary-container text-white px-8 py-3 font-medium flex items-center group">
                            Next: Analyze Results
                            <HcIcon name="arrow_forward" className="ml-2 transition-transform group-hover:translate-x-1" />
</button>
<button className="bg-surface-container-high text-on-surface px-8 py-3 font-medium">
                            Save Draft
                        </button>
</div>
</section>
<section className="col-span-5 bg-white p-8">
<h2 className="text-xs font-semibold uppercase tracking-widest text-outline mb-6">Real-time Analysis</h2>
<div className="space-y-8">
<div className="p-6 bg-surface-container-low border-l-4 border-primary">
<div className="flex justify-between items-start mb-4">
<span className="bg-primary-container text-[10px] text-white px-2 py-1 font-bold uppercase tracking-tighter">Urgency: High</span>
<span className="text-[10px] font-bold text-outline uppercase">Code: CLIN-042</span>
</div>
<h3 className="text-xl font-semibold mb-2">Preliminary Assessment</h3>
<p className="text-sm text-on-surface-variant leading-relaxed">
                                Based on the high pain scale and acute onset, this presentation requires immediate physician review within 30 minutes.
                            </p>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="p-6 bg-surface-container-low">
<p className="text-[10px] font-bold text-outline uppercase mb-1">Vital Match</p>
<p className="text-2xl font-light">94%</p>
<div className="w-full bg-surface-container-high h-1 mt-2">
<div className="bg-primary w-[94%] h-full"></div>
</div>
</div>
<div className="p-6 bg-surface-container-low">
<p className="text-[10px] font-bold text-outline uppercase mb-1">Queue Status</p>
<p className="text-2xl font-light">Priority 1</p>
</div>
</div>
<div>
<h4 className="text-xs font-semibold uppercase tracking-widest text-outline mb-4">Diagnostic Flags</h4>
<ul className="space-y-3">
<li className="flex items-center text-sm">
<HcIcon name="check_circle" className="text-primary text-lg mr-3" />
                                    Inflammation Markers Suggested
                                </li>
<li className="flex items-center text-sm">
<HcIcon name="check_circle" className="text-primary text-lg mr-3" />
                                    History: Patient #88219 Match
                                </li>
<li className="flex items-center text-sm text-outline">
<HcIcon name="radio_button_unchecked" className="text-lg mr-3" />
                                    Secondary Triage Required
                                </li>
</ul>
</div>
<div className="relative overflow-hidden">
<Image className="w-full h-48 object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-500" alt="high-tech clinical setting with sterile environment, blue-toned medical equipment and medical professional in soft focus background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvYfG9LUpiwHQg7TFOLBbm_p80bQl39VmGsH6gDJst9BWxOvwWTcMpEqHN3DpmwzBNWxmVcqrzk60YYu0SKnp2-fAeQ7j0_mdUKNyNa8Mw-2_ULZ3cm3Eq9hhEmxYkUx5WKaLpfQzk6sCF0ZOR5mhygt5P4NOQyLVPMUaX3-if8hv8lvt6wpQ_HPAyn9y-ticXOLFGxaGxvVbHK3StLh-RBzVpjXfGhqsgiC3ZOzH6jtrU2JDX8TVbPHEusS5Hk2ibDdHE_hf29Q" width={1200} height={800}/>
<div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
</div>
</div>
</section>
</div>
</div>

</main>
    </>
  );
}
