import Image from "next/image";
import { HcIcon } from "@/components/ui/hc-icon";

export default function BookingDetailsReviewPage() {
  return (
    <main className="max-w-[1400px] mx-auto p-8 pb-20">
      <header className="mb-8">
        <nav className="flex items-center gap-0 mb-8 border-b border-[var(--hc-border-soft)]">
          <div className="flex items-center px-6 py-4 border-b-2 border-transparent text-slate-400 font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 bg-slate-100 rounded-[var(--radius-sm)] text-[10px] mr-2">1</span>
            Symptoms
          </div>
          <div className="flex items-center px-6 py-4 border-b-2 border-transparent text-slate-400 font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 bg-slate-100 rounded-[var(--radius-sm)] text-[10px] mr-2">2</span>
            Triage & Slots
          </div>
          <div className="flex items-center px-6 py-4 border-b-2 border-[var(--hc-primary)] text-[var(--hc-primary)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--hc-primary)] rounded-[var(--radius-sm)] text-[10px] mr-2">3</span>
            Patient Details
          </div>
          <div className="flex items-center px-6 py-4 text-slate-400 font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 rounded-[var(--radius-sm)] text-[10px] mr-2">4</span>
            Confirmation
          </div>
        </nav>
        <h1 className="text-3xl font-light tracking-tight text-[var(--hc-text)] mb-2">Patient Details & Review</h1>
        <p className="text-[var(--hc-text-secondary)] text-sm max-w-2xl font-normal">Complete the required health profile to finalize the surgical admission. All information is encrypted via Level 4 medical security standards.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-6 border-b border-[var(--hc-border-soft)] pb-4">Required Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Legal First Name</label>
                <input className="hc-input w-full" placeholder="e.g. Jonathan" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Legal Last Name</label>
                <input className="hc-input w-full" placeholder="e.g. Miller" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Date of Birth</label>
                <input className="hc-input w-full" type="date" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Insurance ID</label>
                <input className="hc-input w-full" placeholder="XX-00000000" type="text" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-[var(--hc-border-soft)] pb-4">Optional Health Context</h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Known Allergies or Contraindications</label>
                <textarea className="hc-input w-full resize-none" placeholder="List any drug allergies or respiratory conditions..." rows={3}></textarea>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Medications</label>
                <input className="hc-input w-full" placeholder="e.g. Lisinopril 10mg" type="text" />
              </div>

              <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 p-4 rounded-[var(--radius-lg)] mt-2">
                <input className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500" id="emergency" type="checkbox" />
                <label className="text-xs font-bold text-amber-900 tracking-tight cursor-pointer" htmlFor="emergency">I AUTHORIZE EMERGENCY DATA SHARING WITH ON-CALL SURGEONS</label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 sticky top-8">
          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-1">Review Summary</div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--hc-text)]">Surgery Booking</h3>
              </div>
              <HcIcon name="info" className="text-slate-400" />
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-[var(--hc-border-soft)] pb-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Procedure</div>
                <div className="text-sm font-bold text-[var(--hc-text)]">Minimally Invasive Cardiac Bypass</div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-[var(--hc-border-soft)] pb-4">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</div>
                  <div className="text-sm font-bold text-[var(--hc-text)]">Oct 14, 2024</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Check-in</div>
                  <div className="text-sm font-bold text-[var(--hc-text)]">05:45 AM</div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 flex-shrink-0">
                  <Image alt="Dr. Aris Thorne" className="h-full w-full object-cover rounded-[var(--radius-md)]" data-alt="close-up portrait of a surgeon in professional attire with soft clinical background lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD081xid81nHg8Ye8g9JIjC6fmI6Y5csBXIj7rECP4BDU2A2jQ7f_OBvf81x4pnnIpeELPoxJ64FKi5r8WEaYCspghW4fX1J8bpUB_bYstab-jxyoJ-767izPPuKcMNLHl1v9ZnsVOyJ6xLpYZgJ7wLQqwgVK8EXvhY_o2iRTvwcjO-r_89i3zlyduiUsD49tt9xFDY1cKaIGJC4Ha0X2uAZnjQ42ccoe58yAsRJi30qDlbxmjWm0rXcNrWjgnpqnxG_TciLRJHYw" width={1200} height={800} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Surgeon</div>
                  <div className="text-sm font-bold text-[var(--hc-text)]">Dr. Aris Thorne, MD</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--hc-border-soft)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Estimated Duration</span>
                  <span className="text-sm font-bold text-[var(--hc-text)]">4.5 Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Facility Fee</span>
                  <span className="text-sm font-bold text-[var(--hc-text)]">$1,250.00</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button className="w-full hc-button-primary py-3.5">
                Confirm Booking
              </button>
              <button className="w-full hc-button-secondary py-3.5">
                Save as Draft
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed italic font-medium mt-2">
              By clicking confirm, you agree to MED-CORE's surgical intake policies and privacy protocols.
            </p>
          </div>

          <div className="mt-4 p-5 bg-emerald-50 border border-emerald-100 rounded-[var(--radius-lg)] flex items-start gap-4">
            <HcIcon name="verified_user" className="text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 mb-1">Data Protection</div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">This session is encrypted using 256-bit AES. All PHI is handled per HIPAA and GDPR standards.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
