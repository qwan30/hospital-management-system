import Image from "next/image";
import { HcIcon } from "@/components/ui/hc-icon";
import { PageHeader } from "@/components/ui/page-header";

export default function DoctorDetailPage() {
  return (
    <>
      <main>
        <PageHeader
            title="Doctor Detail"
        />
        <div className="p-6 md:p-8 pt-0 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-8 space-y-12">
            {/* Hero Identity */}
            <section className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-64 h-80 flex-shrink-0 bg-slate-100 rounded-[var(--radius-xl)] relative overflow-hidden shadow-sm">
                <Image
                  alt="Doctor Professional Portrait"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQKBX7pN66DLIDqIM9FUgaxs9eciBMz5Vu2AW_jPDqZ6OiSNymdU5scCJwQtIrFZk0pG3eG4BcVMmeTUeRvXCHkMY9r3kvHn90nHrGY1QXqzkFOGpXIxTUrsSGLFmik72hsjqA91MQDj4S1VV2r2ve5JWva0EB0wvfLjM7N3nZQOtDd99LP1JhsAEHoalAylThSy8cv4s51EyNHLhu7UhRqErFkq7dGmgDhrGTWjrjKOHuFRNTlzYxCAxcM-bhZAK2MQ3U5h535Q"
                  width={1200}
                  height={800}
                />
              </div>
              <div className="flex-grow pt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-3 block">Senior Consultant</span>
                <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-[var(--hc-text)] mb-3 leading-none">Dr. Alistair Thorne</h1>
                <h2 className="text-xl text-[var(--hc-text-secondary)] font-medium mb-8">Interventional Cardiology &amp; Electrophysiology</h2>
                <div className="flex flex-wrap gap-12">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Experience</p>
                    <p className="text-2xl font-light text-[var(--hc-text)]">18+ Years</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Education</p>
                    <p className="text-2xl font-light text-[var(--hc-text)]">MD, PhD, FACC</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Consultations</p>
                    <p className="text-2xl font-light text-[var(--hc-text)]">12k+</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bio Section */}
            <section className="bg-slate-50 border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 md:p-10 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text)] mb-6">Professional Biography</h3>
              <div className="max-w-3xl space-y-6">
                <p className="text-xl leading-relaxed font-light text-[var(--hc-text)]">
                  Dr. Alistair Thorne is a globally recognized authority in Interventional Cardiology, specializing in complex coronary interventions and structural heart disease. With nearly two decades of clinical excellence, his practice integrates advanced robotic-assisted procedures with patient-centric recovery protocols.
                </p>
                <p className="text-base text-[var(--hc-text-secondary)] font-medium leading-relaxed">
                  His research at the Hospital Core Institute of Vascular Research focuses on the miniaturization of pacemaker technology and high-precision stent placement. Dr. Thorne leads the HMS "Precision Care Initiative," ensuring that surgical outcomes are measured with architectural rigor.
                </p>
              </div>
            </section>

            {/* Specializations & Research */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Clinical Expertise</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <HcIcon name="check_circle" className="text-[var(--hc-primary)] w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight text-[var(--hc-text)]">Coronary Angioplasty</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <HcIcon name="check_circle" className="text-[var(--hc-primary)] w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight text-[var(--hc-text)]">Valvuloplasty</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <HcIcon name="check_circle" className="text-[var(--hc-primary)] w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight text-[var(--hc-text)]">TAVI/TAVR Procedures</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Hospital Affiliations</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <HcIcon name="apartment" className="text-[var(--hc-primary)] w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight text-[var(--hc-text)]">Hospital Core Main Campus</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <HcIcon name="apartment" className="text-[var(--hc-primary)] w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight text-[var(--hc-text)]">Cardiac Institute of London</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Sticky Slot Picker */}
          <aside className="md:col-span-4 sticky top-8 h-fit">
            <div className="bg-white border border-[var(--hc-border-soft)] border-t-4 border-t-[var(--hc-primary)] rounded-[var(--radius-xl)] shadow-sm p-6 md:p-8">
              <h3 className="text-2xl font-bold tracking-tight mb-8 text-[var(--hc-text)]">Schedule Consultation</h3>

              {/* Date Picker Simulation */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Date</p>
                  <p className="text-sm font-bold text-[var(--hc-text)]">November 2024</p>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  <div className="flex-shrink-0 w-14 h-20 rounded-[var(--radius-md)] flex flex-col items-center justify-center bg-slate-50 border border-[var(--hc-border-soft)] cursor-pointer hover:border-[var(--hc-primary)] transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mon</span>
                    <span className="text-lg font-bold text-[var(--hc-text)]">11</span>
                  </div>
                  <div className="flex-shrink-0 w-14 h-20 rounded-[var(--radius-md)] flex flex-col items-center justify-center bg-[var(--hc-primary)] text-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/80">Tue</span>
                    <span className="text-lg font-bold">12</span>
                  </div>
                  <div className="flex-shrink-0 w-14 h-20 rounded-[var(--radius-md)] flex flex-col items-center justify-center bg-slate-50 border border-[var(--hc-border-soft)] cursor-pointer hover:border-[var(--hc-primary)] transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Wed</span>
                    <span className="text-lg font-bold text-[var(--hc-text)]">13</span>
                  </div>
                  <div className="flex-shrink-0 w-14 h-20 rounded-[var(--radius-md)] flex flex-col items-center justify-center bg-slate-50 border border-[var(--hc-border-soft)] cursor-pointer hover:border-[var(--hc-primary)] transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Thu</span>
                    <span className="text-lg font-bold text-[var(--hc-text)]">14</span>
                  </div>
                  <div className="flex-shrink-0 w-14 h-20 rounded-[var(--radius-md)] flex flex-col items-center justify-center bg-slate-50 border border-[var(--hc-border-soft)] cursor-pointer hover:border-[var(--hc-primary)] transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Fri</span>
                    <span className="text-lg font-bold text-[var(--hc-text)]">15</span>
                  </div>
                </div>
              </div>

              {/* Time Slot Picker */}
              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HcIcon name="wb_sunny" className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Morning Sessions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] text-[var(--hc-text)] transition-colors">09:00 AM</button>
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] text-[var(--hc-text)] transition-colors">09:45 AM</button>
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] text-[var(--hc-text)] transition-colors">10:30 AM</button>
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight border border-[var(--hc-border-soft)] text-slate-300 bg-slate-50 cursor-not-allowed" disabled>11:15 AM</button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HcIcon name="dark_mode" className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Afternoon Sessions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight bg-[var(--hc-primary)] text-white shadow-sm hover:opacity-90 transition-opacity">02:00 PM</button>
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] text-[var(--hc-text)] transition-colors">02:45 PM</button>
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] text-[var(--hc-text)] transition-colors">03:30 PM</button>
                    <button className="py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-bold tracking-tight border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] text-[var(--hc-text)] transition-colors">04:15 PM</button>
                  </div>
                </div>
              </div>

              {/* Selected Summary */}
              <div className="bg-slate-50 border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-5 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Booking Summary</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-base font-bold tracking-tight text-[var(--hc-text)] mb-1">Tuesday, Nov 12</p>
                    <p className="text-sm font-bold text-[var(--hc-primary)]">02:00 PM to 02:45 PM</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Fee</p>
                    <p className="text-xl font-bold text-[var(--hc-text)]">$180</p>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <button className="hc-button-primary w-full py-4">
                Continue booking
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Secure Architectural Health Systems</p>
            </div>

            {/* Additional Help Card */}
            <div className="mt-6 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text)] mb-4">Need Assistance?</h4>
              <div className="flex gap-3 items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <HcIcon name="call" className="text-[var(--hc-primary)] w-4 h-4" />
                </div>
                <span className="text-sm font-bold tracking-tight text-[var(--hc-text-secondary)]">Support: +1 (800) Hospital Core</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <HcIcon name="mail" className="text-[var(--hc-primary)] w-4 h-4" />
                </div>
                <span className="text-sm font-bold tracking-tight text-[var(--hc-text-secondary)]">concierge@hospitalcore.hms</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
