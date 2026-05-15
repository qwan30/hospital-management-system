import Image from "next/image";

import { HcIcon } from "@/components/ui/hc-icon";
export default function BookingDetailsReviewPage() {
  return (
    <>
      <main>

<section className="bg-surface-container-low px-8 pt-8 pb-4">
<div className="flex items-center gap-0 overflow-x-auto no-scrollbar max-w-6xl">
<div className="flex items-center gap-4 border-t-4 border-primary pt-4 pr-16 min-w-max">
<span className="text-xs font-bold text-primary">01</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface">Provider Selection</span>
</div>
<div className="flex items-center gap-4 border-t-4 border-primary pt-4 pr-16 min-w-max">
<span className="text-xs font-bold text-primary">02</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface">Time &amp; Method</span>
</div>
<div className="flex items-center gap-4 border-t-4 border-primary pt-4 pr-16 min-w-max">
<span className="text-xs font-bold text-primary">03</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface">Patient Details</span>
</div>
<div className="flex items-center gap-4 border-t-4 border-outline-variant pt-4 pr-16 min-w-max opacity-40">
<span className="text-xs font-bold text-on-surface-variant">04</span>
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Confirmation</span>
</div>
</div>
<h1 className="mt-12 text-5xl font-light tracking-tight text-on-surface">Patient Details &amp; Review</h1>
<p className="mt-4 text-on-surface-variant max-w-2xl font-normal">Complete the required health profile to finalize the surgical admission. All information is encrypted via Level 4 medical security standards.</p>
</section>
<section className="p-8 max-w-7xl mx-auto">
<div className="grid grid-cols-12 gap-12 items-start">
<div className="col-span-12 lg:col-span-7 flex flex-col gap-16">
<div className="flex flex-col gap-8">
<div className="flex items-center gap-4">
<h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Required Information</h2>
<div className="h-px flex-1 bg-surface-container-highest"></div>
</div>
<div className="grid grid-cols-2 gap-x-8 gap-y-10">
<div className="flex flex-col gap-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Legal First Name</label>
<input className="bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 text-sm transition-all outline-none" placeholder="e.g. Jonathan" type="text"/>
</div>
<div className="flex flex-col gap-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Legal Last Name</label>
<input className="bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 text-sm transition-all outline-none" placeholder="e.g. Miller" type="text"/>
</div>
<div className="flex flex-col gap-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date of Birth</label>
<input className="bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 text-sm transition-all outline-none" type="date"/>
</div>
<div className="flex flex-col gap-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Insurance ID</label>
<input className="bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 text-sm transition-all outline-none" placeholder="XX-00000000" type="text"/>
</div>
</div>
</div>
<div className="flex flex-col gap-8">
<div className="flex items-center gap-4">
<h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Optional Health Context</h2>
<div className="h-px flex-1 bg-surface-container-highest"></div>
</div>
<div className="flex flex-col gap-10">
<div className="flex flex-col gap-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Known Allergies or Contraindications</label>
<textarea className="bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 text-sm transition-all outline-none resize-none" placeholder="List any drug allergies or respiratory conditions..." rows={3}></textarea>
</div>
<div className="flex flex-col gap-2">
<label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Current Medications</label>
<input className="bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 text-sm transition-all outline-none" placeholder="e.g. Lisinopril 10mg" type="text"/>
</div>
<div className="flex items-center gap-4 bg-surface-container-low p-4">
<input className="h-4 w-4 rounded-none border-2 border-outline text-primary focus:ring-0" id="emergency" type="checkbox"/>
<label className="text-xs font-semibold text-on-surface tracking-tight" htmlFor="emergency">I AUTHORIZE EMERGENCY DATA SHARING WITH ON-CALL SURGEONS</label>
</div>
</div>
</div>
</div>
<div className="col-span-12 lg:col-span-5 sticky top-24">
<div className="bg-surface-container-highest p-8 flex flex-col gap-10">
<div className="flex justify-between items-start">
<div>
<div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Review Summary</div>
<h3 className="text-2xl font-bold tracking-tight">Surgery Booking</h3>
</div>
<HcIcon name="info" className="text-on-surface-variant" />
</div>
<div className="flex flex-col gap-6">
<div className="flex flex-col gap-1">
<div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Procedure</div>
<div className="text-sm font-semibold">Minimally Invasive Cardiac Bypass</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="flex flex-col gap-1">
<div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</div>
<div className="text-sm font-semibold">October 14, 2024</div>
</div>
<div className="flex flex-col gap-1">
<div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Check-in</div>
<div className="text-sm font-semibold">05:45 AM</div>
</div>
</div>
<div className="flex items-center gap-4 p-4 bg-surface-container-low">
<div className="h-10 w-10 flex-shrink-0">
<Image alt="Dr. Aris Thorne" className="h-full w-full object-cover" data-alt="close-up portrait of a surgeon in professional attire with soft clinical background lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD081xid81nHg8Ye8g9JIjC6fmI6Y5csBXIj7rECP4BDU2A2jQ7f_OBvf81x4pnnIpeELPoxJ64FKi5r8WEaYCspghW4fX1J8bpUB_bYstab-jxyoJ-767izPPuKcMNLHl1v9ZnsVOyJ6xLpYZgJ7wLQqwgVK8EXvhY_o2iRTvwcjO-r_89i3zlyduiUsD49tt9xFDY1cKaIGJC4Ha0X2uAZnjQ42ccoe58yAsRJi30qDlbxmjWm0rXcNrWjgnpqnxG_TciLRJHYw" width={1200} height={800}/>
</div>
<div>
<div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Primary Surgeon</div>
<div className="text-sm font-bold">Dr. Aris Thorne, MD</div>
</div>
</div>
<div className="h-px bg-outline-variant opacity-20"></div>
<div className="flex justify-between items-center">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Estimated Duration</span>
<span className="text-sm font-bold">4.5 Hours</span>
</div>
<div className="flex justify-between items-center">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Facility Fee</span>
<span className="text-sm font-bold">$1,250.00</span>
</div>
</div>
<div className="flex flex-col gap-3">
<button className="w-full bg-primary-container text-white py-4 font-bold text-sm tracking-widest uppercase transition-all hover:bg-primary active:scale-95">
                                Confirm Booking
                            </button>
<button className="w-full bg-transparent border-2 border-outline-variant text-on-surface py-4 font-bold text-sm tracking-widest uppercase transition-all hover:bg-surface-container-low">
                                Save as Draft
                            </button>
</div>
<p className="text-[10px] text-on-surface-variant text-center px-4 leading-relaxed italic">
                            By clicking confirm, you agree to MED-CORE's surgical intake policies and privacy protocols.
                        </p>
</div>
<div className="mt-8 p-6 bg-surface-container-low flex items-start gap-4">
<HcIcon name="verified_user" className="text-primary" />
<div>
<div className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Data Protection</div>
<p className="text-[10px] text-on-surface-variant mt-1 leading-tight">This session is encrypted using 256-bit AES. All PHI is handled per HIPAA and GDPR standards.</p>
</div>
</div>
</div>
</div>
</section>

</main>
    </>
  );
}
