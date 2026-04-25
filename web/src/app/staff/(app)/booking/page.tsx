import Image from "next/image";

export default function BookingWizardSymptomsPage() {
  return (
    <div className="max-w-6xl mx-auto p-12">
      <header className="mb-12">
        <nav className="flex items-center space-x-0 mb-8 border-b border-hms-surface-container-high">
          <div className="flex items-center px-4 py-3 border-b-2 border-hms-primary text-hms-primary font-semibold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-hms-primary text-[10px] mr-2">1</span>
            Symptoms
          </div>
          <div className="flex items-center px-4 py-3 text-hms-outline font-medium text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-hms-outline text-[10px] mr-2">2</span>
            Triage
          </div>
          <div className="flex items-center px-4 py-3 text-hms-outline font-medium text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-hms-outline text-[10px] mr-2">3</span>
            Scheduling
          </div>
          <div className="flex items-center px-4 py-3 text-hms-outline font-medium text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-hms-outline text-[10px] mr-2">4</span>
            Confirmation
          </div>
        </nav>
        <h1 className="text-4xl font-light tracking-tight text-hms-on-surface mb-2">Booking Wizard: Symptoms</h1>
        <p className="text-hms-on-surface-variant max-w-2xl">Enter the patient&apos;s current clinical presentation. The system will prioritize based on severity markers and historical data.</p>
      </header>

      <div className="grid grid-cols-12 gap-0">
        <section className="col-span-7 bg-hms-surface-container-low p-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-hms-outline mb-6">Patient Input Section</h2>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2 text-hms-on-surface">Primary Complaint</label>
            <textarea
              className="w-full bg-hms-surface-container-low border-0 border-b-2 border-hms-outline focus:border-hms-primary focus:ring-0 text-hms-on-surface min-h-[160px] p-4 transition-all outline-none"
              placeholder="Describe the symptoms in detail (e.g., Duration, Intensity, Triggers)..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-semibold mb-2 text-hms-on-surface">Onset Time</label>
              <input
                className="w-full bg-hms-surface-container-low border-0 border-b-2 border-hms-outline focus:border-hms-primary focus:ring-0 text-hms-on-surface p-4 outline-none"
                type="time"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-hms-on-surface">Pain Scale (1-10)</label>
              <input
                className="w-full bg-hms-surface-container-low border-0 border-b-2 border-hms-outline focus:border-hms-primary focus:ring-0 text-hms-on-surface p-4 outline-none"
                max="10"
                min="1"
                type="number"
              />
            </div>
          </div>

          <div className="mb-12">
            <label className="block text-sm font-semibold mb-4 text-hms-on-surface">Observed Symptoms (Check all that apply)</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input className="w-4 h-4 border-2 border-hms-outline text-hms-primary focus:ring-0 rounded-none bg-transparent" type="checkbox" />
                <span className="text-sm">Acute Fever (&gt;101°F)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input className="w-4 h-4 border-2 border-hms-outline text-hms-primary focus:ring-0 rounded-none bg-transparent" type="checkbox" />
                <span className="text-sm">Respiratory Distress</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input className="w-4 h-4 border-2 border-hms-outline text-hms-primary focus:ring-0 rounded-none bg-transparent" type="checkbox" />
                <span className="text-sm">Abdominal Sharpness</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input className="w-4 h-4 border-2 border-hms-outline text-hms-primary focus:ring-0 rounded-none bg-transparent" type="checkbox" />
                <span className="text-sm">Neurological Deficit</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="bg-hms-primary-container text-white px-8 py-3 font-medium flex items-center group transition-colors hover:bg-hms-primary">
              Next: Analyze Results
              <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
            <button className="bg-hms-surface-container-high text-hms-on-surface px-8 py-3 font-medium hover:bg-hms-surface-container-highest transition-colors">
              Save Draft
            </button>
          </div>
        </section>

        <section className="col-span-5 bg-white p-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-hms-outline mb-6">Real-time Analysis</h2>

          <div className="space-y-8">
            <div className="p-6 bg-hms-surface-container-low border-l-4 border-hms-primary">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-hms-primary-container text-[10px] text-white px-2 py-1 font-bold uppercase tracking-tighter">Urgency: High</span>
                <span className="text-[10px] font-bold text-hms-outline uppercase">Code: CLIN-042</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Preliminary Assessment</h3>
              <p className="text-sm text-hms-on-surface-variant leading-relaxed">
                Based on the high pain scale and acute onset, this presentation requires immediate physician review within 30 minutes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-hms-surface-container-low">
                <p className="text-[10px] font-bold text-hms-outline uppercase mb-1">Vital Match</p>
                <p className="text-2xl font-light">94%</p>
                <div className="w-full bg-hms-surface-container-high h-1 mt-2">
                  <div className="bg-hms-primary w-[94%] h-full"></div>
                </div>
              </div>
              <div className="p-6 bg-hms-surface-container-low">
                <p className="text-[10px] font-bold text-hms-outline uppercase mb-1">Queue Status</p>
                <p className="text-2xl font-light">Priority 1</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-hms-outline mb-4">Diagnostic Flags</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <span className="material-symbols-outlined text-hms-primary text-lg mr-3">check_circle</span>
                  Inflammation Markers Suggested
                </li>
                <li className="flex items-center text-sm">
                  <span className="material-symbols-outlined text-hms-primary text-lg mr-3">check_circle</span>
                  History: Patient #88219 Match
                </li>
                <li className="flex items-center text-sm text-hms-outline">
                  <span className="material-symbols-outlined text-lg mr-3">radio_button_unchecked</span>
                  Secondary Triage Required
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden h-48 w-full group">
              <Image
                className="object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvYfG9LUpiwHQg7TFOLBbm_p80bQl39VmGsH6gDJst9BWxOvwWTcMpEqHN3DpmwzBNWxmVcqrzk60YYu0SKnp2-fAeQ7j0_mdUKNyNa8Mw-2_ULZ3cm3Eq9hhEmxYkUx5WKaLpfQzk6sCF0ZOR5mhygt5P4NOQyLVPMUaX3-if8hv8lvt6wpQ_HPAyn9y-ticXOLFGxaGxvVbHK3StLh-RBzVpjXfGhqsgiC3ZOzH6jtrU2JDX8TVbPHEusS5Hk2ibDdHE_hf29Q"
                alt="high-tech clinical setting"
                fill
                unoptimized
              />
              <div className="absolute inset-0 bg-hms-primary/10 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
