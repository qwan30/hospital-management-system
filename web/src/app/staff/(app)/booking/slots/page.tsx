import Image from "next/image";
import Link from "next/link";

export default function BookingDoctorSlotSelectionPage() {
  return (
    <>
      <main>

{/* Stepper */}
<div className="mb-12">
<div className="flex items-center w-full">
<div className="flex flex-col gap-2 flex-1">
<div className="h-1 bg-primary"></div>
<span className="text-[11px] font-semibold uppercase tracking-widest text-primary">01 Department</span>
</div>
<div className="w-8"></div>
<div className="flex flex-col gap-2 flex-1">
<div className="h-1 bg-primary"></div>
<span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface">02 Selection</span>
</div>
<div className="w-8"></div>
<div className="flex flex-col gap-2 flex-1">
<div className="h-1 bg-surface-container-highest"></div>
<span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">03 Patient Info</span>
</div>
<div className="w-8"></div>
<div className="flex flex-col gap-2 flex-1">
<div className="h-1 bg-surface-container-highest"></div>
<span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">04 Review</span>
</div>
</div>
<h1 className="text-3xl font-light mt-6 text-on-surface">Schedule Appointment</h1>
<p className="text-on-surface-variant mt-2 max-w-2xl">Select a healthcare professional and an available time slot for your consultation in the Cardiology department.</p>
</div>
{/* Two Column Layout */}
<div className="grid grid-cols-12 gap-8 items-start">
{/* Left Column: Doctor & Slots (8 cols) */}
<div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
{/* Doctor Selection Section */}
<section className="flex flex-col gap-4">
<div className="flex items-center justify-between">
<h2 className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Available Specialists</h2>
<div className="flex gap-4">
<span className="text-xs text-primary font-semibold cursor-pointer">FILTER BY SENIORITY</span>
<span className="text-xs text-on-surface-variant font-semibold cursor-pointer">SORT BY AVAILABILITY</span>
</div>
</div>
{/* Doctor Card 1 */}
<div className="bg-surface-container-low p-6 flex flex-col md:flex-row gap-8 hover:bg-surface-container-lowest transition-colors group">
<div className="shrink-0">
<img alt="Dr. Sarah Jenkins" className="w-24 h-24 object-cover" data-alt="Professional headshot of a male doctor in glasses and blue scrubs with a clean clinic background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBb1_yE4u4Bwq2YnFYxt4yB433OfkmINjPK-A9GS28YBNnZkZbLXxr-PJGK0jQsgIc8Qen_LkkguBNAo7KcVqViGw96CYukI9Biz-VCXleX7NA88OXszRdvvoWS00EEu9-OdH1ZGzAbBpFvo_rsyBM9FyCnV97fwtWHcfVaSf8tH5RO3A8AKEJV-rWULczf_dK7gRnA-wH-yMeAq5YaiLj5kfq32WxqjGjXdActBuGXBQ6a26hFN2ACfi90Gfrka7Vc7QIrOlwbg"/>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-4">
<div>
<h3 className="text-xl font-semibold">Dr. Sarah Jenkins</h3>
<p className="text-sm text-on-surface-variant">Senior Cardiologist • 12 Years Exp.</p>
</div>
<div className="bg-primary-fixed px-2 py-1 text-[10px] font-bold text-on-primary-fixed uppercase">Highly Rated</div>
</div>
{/* Slot Groups */}
<div className="space-y-4">
<div>
<span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2">Morning Slots</span>
<div className="flex flex-wrap gap-2">
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">08:30 AM</button>
<button className="px-4 py-2 bg-primary text-white text-sm">09:15 AM</button>
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">10:00 AM</button>
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">11:30 AM</button>
</div>
</div>
<div>
<span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2">Afternoon Slots</span>
<div className="flex flex-wrap gap-2">
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">01:45 PM</button>
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">02:30 PM</button>
<button className="px-4 py-2 bg-surface text-sm opacity-30 cursor-not-allowed">03:15 PM</button>
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">04:00 PM</button>
</div>
</div>
</div>
</div>
</div>
{/* Doctor Card 2 */}
<div className="bg-surface-container-low p-6 flex flex-col md:flex-row gap-8 hover:bg-surface-container-lowest transition-colors group">
<div className="shrink-0">
<img alt="Dr. Marcus Thorne" className="w-24 h-24 object-cover" data-alt="Medical professional headshot of a female doctor in a white coat with a friendly smile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkixEEDa4D_UpfICVURFVwbixMF_TdxHPVQacbh7KHWWQikXwcL7GrapqPfKnVlS48MJUXiXqRR7UCGDKryWFSSWglL0zClIQgKWOr3s3pdnPvvY2vpbmm7Hj7ezXPVBbaMgKklBMJJDcvR39awxoNCxMm-BtU2UFJ3LV47IRqu3gYZVJh-Wv8QvbY8bxoW1WpnCSLis3jvT7INZg8gwmhfu-miKz1JHR9omKXa0bAAmJ2G-9fcHSqs-ImgHOoM8Tx-pAZbPSA6A"/>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-4">
<div>
<h3 className="text-xl font-semibold">Dr. Marcus Thorne</h3>
<p className="text-sm text-on-surface-variant">Interventional Cardiology Specialist</p>
</div>
</div>
{/* Slot Groups */}
<div className="space-y-4">
<div>
<span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2">Morning Slots</span>
<div className="flex flex-wrap gap-2">
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">09:00 AM</button>
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">10:30 AM</button>
</div>
</div>
<div>
<span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2">Afternoon Slots</span>
<div className="flex flex-wrap gap-2">
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">02:00 PM</button>
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">03:00 PM</button>
<button className="px-4 py-2 bg-surface text-sm hover:bg-primary hover:text-white transition-colors">04:30 PM</button>
</div>
</div>
</div>
</div>
</div>
</section>
</div>
{/* Right Column: Sticky Summary (4 cols) */}
<div className="col-span-12 lg:col-span-4 sticky top-24">
<div className="bg-surface-container-highest p-8 flex flex-col gap-8">
<div>
<h2 className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-6">Appointment Summary</h2>
{/* Summary Item: Department */}
<div className="mb-6">
<span className="text-[10px] font-bold uppercase text-primary">Department</span>
<div className="text-lg font-semibold text-on-surface">Cardiology Unit 4A</div>
</div>
{/* Summary Item: Professional */}
<div className="mb-6">
<span className="text-[10px] font-bold uppercase text-primary">Healthcare Professional</span>
<div className="flex items-center gap-4 mt-2">
<img alt="Dr. Sarah Jenkins" className="w-10 h-10 object-cover" data-alt="Micro headshot of a professional doctor for a UI summary card" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKZnYcR7GpVX28RJIrG-nm_5-n0U2i314IyfHzPHTJNch7EOXpCvNl4X3iLO1Hia2lr8uOSN50pRTcapUqEd45UhQmGgx1p0w7EeDI8Z3q0htXLvjMfBblX5a5-T8upGERFzeYTObzeeRXRau22BF4zL6hX3EmllQQ7t0GesGTlpB2W7RgdBm746RMrpEVz80Qj3BhKbIGHqWY_LCFEFEqhtU26LLp0LieLZRtdxrwq5_XNd-ENeP5AeWifjEts3O1awamtmUZlg"/>
<div>
<div className="text-sm font-semibold text-on-surface">Dr. Sarah Jenkins</div>
<div className="text-[11px] text-on-surface-variant">Senior Cardiologist</div>
</div>
</div>
</div>
{/* Summary Item: Time */}
<div className="mb-6">
<span className="text-[10px] font-bold uppercase text-primary">Selected Slot</span>
<div className="flex items-center gap-2 mt-2">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span className="text-sm font-semibold">Oct 24, 2023</span>
<span className="mx-2 text-outline">|</span>
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="text-sm font-semibold">09:15 AM</span>
</div>
</div>
</div>
<div className="pt-8 border-t border-outline-variant/30">
<div className="flex justify-between items-center mb-6">
<span className="text-xs text-on-surface-variant">Consultation Fee</span>
<span className="text-lg font-bold text-on-surface">$120.00</span>
</div>
<button className="w-full bg-primary-container text-white py-4 font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-between px-6">
<span>CONTINUE TO PATIENT INFO</span>
<span className="material-symbols-outlined">arrow_forward</span>
</button>
<p className="text-[10px] text-on-surface-variant mt-4 text-center">Insurance eligibility will be verified in the next step.</p>
</div>
</div>
{/* Assistance Card */}
<div className="mt-4 p-6 bg-surface-container-low flex items-start gap-4">
<span className="material-symbols-outlined text-primary">help_outline</span>
<div>
<div className="text-xs font-bold uppercase mb-1">Need help?</div>
<p className="text-[11px] text-on-surface-variant leading-relaxed">Contact the coordination desk at (555) 012-3456 for manual scheduling assistance.</p>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
