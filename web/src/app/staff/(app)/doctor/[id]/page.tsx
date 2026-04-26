import Image from "next/image";

export default function DoctorDetailPage() {
  return (
    <>
      <main>

{/* Left: Doctor Identity & Content */}
<div className="md:col-span-8 space-y-16">
{/* Hero Identity */}
<section className="flex flex-col md:flex-row gap-12 items-start">
<div className="w-64 h-80 flex-shrink-0 bg-surface-container-high relative overflow-hidden">
<Image alt="Doctor Professional Portrait" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="professional portrait of a senior cardiologist in a white coat with a confident smile, clinical architectural background, soft cinematic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQKBX7pN66DLIDqIM9FUgaxs9eciBMz5Vu2AW_jPDqZ6OiSNymdU5scCJwQtIrFZk0pG3eG4BcVMmeTUeRvXCHkMY9r3kvHn90nHrGY1QXqzkFOGpXIxTUrsSGLFmik72hsjqA91MQDj4S1VV2r2ve5JWva0EB0wvfLjM7N3nZQOtDd99LP1JhsAEHoalAylThSy8cv4s51EyNHLhu7UhRqErFkq7dGmgDhrGTWjrjKOHuFRNTlzYxCAxcM-bhZAK2MQ3U5h535Q" width={1200} height={800}/>
</div>
<div className="flex-grow pt-4">
<span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4 block">Senior Consultant</span>
<h1 className="text-6xl font-light tracking-tighter text-on-surface mb-4 leading-none">Dr. Alistair Thorne</h1>
<h2 className="text-xl text-outline mb-8 font-normal">Interventional Cardiology &amp; Electrophysiology</h2>
<div className="flex gap-16">
<div>
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">Experience</p>
<p className="text-2xl font-light">18+ Years</p>
</div>
<div>
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">Education</p>
<p className="text-2xl font-light">MD, PhD, FACC</p>
</div>
<div>
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">Consultations</p>
<p className="text-2xl font-light">12k+</p>
</div>
</div>
</div>
</section>
{/* Bio Section */}
<section className="bg-surface-container-low p-12">
<h3 className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-8">Professional Biography</h3>
<div className="max-w-2xl space-y-6">
<p className="text-xl leading-relaxed font-light text-on-surface">
                        Dr. Alistair Thorne is a globally recognized authority in Interventional Cardiology, specializing in complex coronary interventions and structural heart disease. With nearly two decades of clinical excellence, his practice integrates advanced robotic-assisted procedures with patient-centric recovery protocols.
                    </p>
<p className="text-base text-on-surface-variant leading-relaxed">
                        His research at the Medicore Institute of Vascular Research focus on the miniaturization of pacemaker technology and high-precision stent placement. Dr. Thorne leads the HMS "Precision Care Initiative," ensuring that surgical outcomes are measured with architectural rigor.
                    </p>
</div>
</section>
{/* Specializations & Research */}
<div className="grid grid-cols-2 gap-12">
<div>
<h4 className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-6">Clinical Expertise</h4>
<ul className="space-y-3">
<li className="flex items-center gap-3 py-3 border-b border-outline-variant/20">
<span className="material-symbols-outlined text-primary text-sm">check_circle</span>
<span className="text-sm font-semibold tracking-tight uppercase">Coronary Angioplasty</span>
</li>
<li className="flex items-center gap-3 py-3 border-b border-outline-variant/20">
<span className="material-symbols-outlined text-primary text-sm">check_circle</span>
<span className="text-sm font-semibold tracking-tight uppercase">Valvuloplasty</span>
</li>
<li className="flex items-center gap-3 py-3 border-b border-outline-variant/20">
<span className="material-symbols-outlined text-primary text-sm">check_circle</span>
<span className="text-sm font-semibold tracking-tight uppercase">TAVI/TAVR Procedures</span>
</li>
</ul>
</div>
<div>
<h4 className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-6">Hospital Affiliations</h4>
<ul className="space-y-3">
<li className="flex items-center gap-3 py-3 border-b border-outline-variant/20">
<span className="material-symbols-outlined text-primary text-sm">apartment</span>
<span className="text-sm font-semibold tracking-tight uppercase">Medicore HMS Main Campus</span>
</li>
<li className="flex items-center gap-3 py-3 border-b border-outline-variant/20">
<span className="material-symbols-outlined text-primary text-sm">apartment</span>
<span className="text-sm font-semibold tracking-tight uppercase">Cardiac Institute of London</span>
</li>
</ul>
</div>
</div>
</div>
{/* Right: Sticky Slot Picker */}
<aside className="md:col-span-4 sticky top-8">
<div className="bg-surface-container-lowest p-8 border-b-4 border-primary shadow-sm">
<h3 className="text-2xl font-light tracking-tight mb-8">Schedule Consultation</h3>
{/* Date Picker Simulation */}
<div className="mb-10">
<div className="flex justify-between items-center mb-4">
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline">Select Date</p>
<p className="text-xs font-semibold">November 2024</p>
</div>
<div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
<div className="flex-shrink-0 w-14 h-20 flex flex-col items-center justify-center bg-surface-container-high border-b-2 border-transparent cursor-pointer hover:bg-surface-variant transition-colors">
<span className="text-[10px] font-semibold uppercase text-outline">Mon</span>
<span className="text-lg font-bold">11</span>
</div>
<div className="flex-shrink-0 w-14 h-20 flex flex-col items-center justify-center bg-primary text-white border-b-2 border-on-primary-fixed cursor-pointer">
<span className="text-[10px] font-semibold uppercase opacity-80">Tue</span>
<span className="text-lg font-bold">12</span>
</div>
<div className="flex-shrink-0 w-14 h-20 flex flex-col items-center justify-center bg-surface-container-high border-b-2 border-transparent cursor-pointer hover:bg-surface-variant transition-colors">
<span className="text-[10px] font-semibold uppercase text-outline">Wed</span>
<span className="text-lg font-bold">13</span>
</div>
<div className="flex-shrink-0 w-14 h-20 flex flex-col items-center justify-center bg-surface-container-high border-b-2 border-transparent cursor-pointer hover:bg-surface-variant transition-colors">
<span className="text-[10px] font-semibold uppercase text-outline">Thu</span>
<span className="text-lg font-bold">14</span>
</div>
<div className="flex-shrink-0 w-14 h-20 flex flex-col items-center justify-center bg-surface-container-high border-b-2 border-transparent cursor-pointer hover:bg-surface-variant transition-colors">
<span className="text-[10px] font-semibold uppercase text-outline">Fri</span>
<span className="text-lg font-bold">15</span>
</div>
</div>
</div>
{/* Time Slot Picker */}
<div className="space-y-8 mb-12">
<div>
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-sm text-outline">wb_sunny</span>
<span className="text-[10px] font-semibold uppercase tracking-widest text-outline">Morning Sessions</span>
</div>
<div className="grid grid-cols-2 gap-2">
<button className="py-3 px-4 text-sm font-semibold tracking-tight border border-outline-variant/30 hover:bg-surface-container text-on-surface">09:00 AM</button>
<button className="py-3 px-4 text-sm font-semibold tracking-tight border border-outline-variant/30 hover:bg-surface-container text-on-surface">09:45 AM</button>
<button className="py-3 px-4 text-sm font-semibold tracking-tight border border-outline-variant/30 hover:bg-surface-container text-on-surface">10:30 AM</button>
<button className="py-3 px-4 text-sm font-semibold tracking-tight border border-outline-variant/30 text-outline-variant cursor-not-allowed bg-surface-container-low" disabled>11:15 AM</button>
</div>
</div>
<div>
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-sm text-outline">dark_mode</span>
<span className="text-[10px] font-semibold uppercase tracking-widest text-outline">Afternoon Sessions</span>
</div>
<div className="grid grid-cols-2 gap-2">
<button className="py-3 px-4 text-sm font-semibold tracking-tight bg-primary text-white">02:00 PM</button>
<button className="py-3 px-4 text-sm font-semibold tracking-tight border border-outline-variant/30 hover:bg-surface-container text-on-surface">02:45 PM</button>
<button className="py-3 px-4 text-sm font-semibold tracking-tight border border-outline-variant/30 hover:bg-surface-container text-on-surface">03:30 PM</button>
<button className="py-3 px-4 text-sm font-semibold tracking-tight border border-outline-variant/30 hover:bg-surface-container text-on-surface">04:15 PM</button>
</div>
</div>
</div>
{/* Selected Summary */}
<div className="bg-surface-container p-6 mb-8">
<p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-2">Booking Summary</p>
<div className="flex justify-between items-end">
<div>
<p className="text-lg font-bold tracking-tight">Tuesday, Nov 12</p>
<p className="text-sm font-semibold text-primary">02:00 PM — 02:45 PM</p>
</div>
<div className="text-right">
<p className="text-sm text-outline font-semibold">Fee</p>
<p className="text-xl font-bold">$180</p>
</div>
</div>
</div>
{/* Primary CTA */}
<button className="w-full bg-primary-container text-on-primary-container py-5 text-base font-bold uppercase tracking-widest hover:brightness-110 transition-all active:translate-y-0.5">
                    Continue booking
                </button>
<p className="text-center text-[10px] text-outline-variant uppercase tracking-[0.2em] mt-4">Secure Architectural Health Systems</p>
</div>
{/* Additional Help Card */}
<div className="mt-8 p-8 border border-outline-variant/20">
<h4 className="text-xs font-bold uppercase tracking-widest mb-4">Need Assistance?</h4>
<div className="flex gap-4 items-center mb-4">
<span className="material-symbols-outlined text-primary">call</span>
<span className="text-sm font-semibold tracking-tight">Support: +1 (800) MED-CORE</span>
</div>
<div className="flex gap-4 items-center">
<span className="material-symbols-outlined text-primary">mail</span>
<span className="text-sm font-semibold tracking-tight">concierge@medicore.hms</span>
</div>
</div>
</aside>

</main>
    </>
  );
}
