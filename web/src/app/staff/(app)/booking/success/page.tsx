import Image from "next/image";

export default function BookingSuccessPage() {
  return (
    <>
      <main>

{/* Centered Confirmation Stack: ~720px */}
<div className="w-full max-w-[720px] flex flex-col space-y-12">
{/* Success Indicator & Display Heading */}
<header className="flex flex-col items-center text-center space-y-6">
<div className="w-20 h-20 flex items-center justify-center bg-primary-container text-white">
<span className="material-symbols-outlined text-5xl" >check_circle</span>
</div>
<div className="space-y-2">
<h1 className="text-5xl font-[300] tracking-tight text-on-surface leading-tight">
                        Booking confirmed.
                    </h1>
<p className="text-sm font-semibold uppercase tracking-widest text-outline">
                        Appointment ID: #MC-8294401
                    </p>
</div>
</header>
{/* Summary Card: Monochromatic Layering */}
<section className="bg-surface-container-low p-8 md:p-10 space-y-10">
<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
{/* Data Monolith: Doctor */}
<div className="flex flex-col space-y-2">
<span className="text-xs font-semibold uppercase tracking-widest text-outline">Practitioner</span>
<div className="flex items-start space-x-4">
<Image alt="Doctor Profile" className="w-12 h-12 grayscale" data-alt="Professional portrait of a male doctor in a white lab coat with a stethoscope around his neck, minimalist white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGYAfT8LWRcPEPCvaz0oYNZwLwRF0tPWJAo13CzHohYwCGfXzkEyzL4EOfWZ-XY42A1rUtPU3Qm0UXI3KDaKavGQyUQvVSKQ_ULnGTIL3azNekw7wwmb58ffbypeSes6KUZ85GQxnGX6ZniQELqQ75fYn-ILfTphg-sRbt5SP2QANxbuy5S_dSzi0fo9XiBlQVdRzYbTrLeI9mSDUYVaJXc6Ikj2EsoSlCAwhX3pLyzCnRaWWC2VwyznNIS2A_KCNQRsMZrrkDhQ" width={1200} height={800}/>
<div className="flex flex-col">
<h2 className="text-xl font-semibold">Dr. Julian Sterling</h2>
<p className="text-sm text-outline">Chief Cardiologist</p>
</div>
</div>
</div>
{/* Data Monolith: Schedule */}
<div className="flex flex-col space-y-2">
<span className="text-xs font-semibold uppercase tracking-widest text-outline">Schedule Details</span>
<div className="space-y-1">
<div className="flex items-center space-x-2">
<span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
<span className="text-xl font-semibold">October 24, 2023</span>
</div>
<div className="flex items-center space-x-2">
<span className="material-symbols-outlined text-primary text-xl">schedule</span>
<span className="text-xl font-semibold">09:15 AM (EST)</span>
</div>
</div>
</div>
</div>
{/* Separation Logic: Background shift instead of border */}
<div className="bg-surface-container-highest h-[1px] w-full"></div>
{/* Next Steps Instructions */}
<div className="space-y-4">
<span className="text-xs font-semibold uppercase tracking-widest text-outline">Instructions</span>
<ul className="space-y-4">
<li className="flex items-start space-x-3">
<span className="material-symbols-outlined text-primary mt-0.5">info</span>
<p className="text-sm leading-relaxed">Please arrive 15 minutes prior to your appointment at the <strong>West Wing Cardiology Department, Level 4</strong>.</p>
</li>
<li className="flex items-start space-x-3">
<span className="material-symbols-outlined text-primary mt-0.5">mail</span>
<p className="text-sm leading-relaxed">A confirmation email has been sent to your registered address with the digital check-in QR code.</p>
</li>
</ul>
</div>
</section>
{/* Actions */}
<footer className="flex flex-col sm:flex-row items-center gap-4">
<button className="w-full sm:w-auto px-12 h-12 bg-primary-container text-white font-semibold text-sm hover:brightness-110 active:translate-y-[2px] transition-all">
                    Go Home
                </button>
<button className="w-full sm:w-auto px-12 h-12 bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest active:translate-y-[2px] transition-all">
                    Book Another
                </button>
</footer>
{/* Branding Footer */}
<div className="pt-12 text-center">
<p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-outline-variant">
                    Automated Health Management System © 2023 MED-CARBON HMS
                </p>
</div>
</div>

</main>
    </>
  );
}
