import { HcIcon } from "@/components/ui/hc-icon";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function BookingWizardSymptomsPage() {
  return (
    <main className="max-w-[1400px] mx-auto p-8 pb-20">
      <header className="mb-8">
        <nav className="flex items-center gap-0 mb-8 border-b border-[var(--hc-border-soft)]">
          <div className="flex items-center px-6 py-4 border-b-2 border-[var(--hc-primary)] text-[var(--hc-primary)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--hc-primary)] rounded-[var(--radius-sm)] text-[10px] mr-2">1</span>
            Symptoms
          </div>
          <div className="flex items-center px-6 py-4 text-[var(--hc-text-placeholder)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--hc-border-soft)] rounded-[var(--radius-sm)] text-[10px] mr-2">2</span>
            Triage
          </div>
          <div className="flex items-center px-6 py-4 text-[var(--hc-text-placeholder)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--hc-border-soft)] rounded-[var(--radius-sm)] text-[10px] mr-2">3</span>
            Scheduling
          </div>
          <div className="flex items-center px-6 py-4 text-[var(--hc-text-placeholder)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--hc-border-soft)] rounded-[var(--radius-sm)] text-[10px] mr-2">4</span>
            Confirmation
          </div>
        </nav>
        <h1 className="text-3xl font-light tracking-tight text-[var(--hc-text)] mb-2">Booking Wizard: Symptoms</h1>
        <p className="text-[var(--hc-text-secondary)] max-w-2xl text-sm">Enter the patient's current clinical presentation. The system will prioritize based on severity markers and historical data.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="col-span-12 lg:col-span-7 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mb-6">Patient Input Section</h2>

          <div className="mb-8">
            <label className="block text-sm font-bold mb-2 text-[var(--hc-text)]">Primary Complaint</label>
            <textarea
              className="hc-input w-full min-h-[160px] resize-none"
              placeholder="Describe the symptoms in detail (e.g., Duration, Intensity, Triggers)..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold mb-2 text-[var(--hc-text)]">Onset Time</label>
              <input
                className="hc-input w-full"
                type="time"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-[var(--hc-text)]">Pain Scale (1-10)</label>
              <input
                className="hc-input w-full"
                max="10"
                min="1"
                type="number"
              />
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-sm font-bold mb-4 text-[var(--hc-text)]">Observed Symptoms (Check all that apply)</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] transition-colors group">
                <input className="w-4 h-4 text-[var(--hc-primary)] rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] focus:ring-[var(--hc-primary)]" type="checkbox" />
                <span className="text-sm font-medium group-hover:text-[var(--hc-primary)] transition-colors">Acute Fever (&gt;101°F)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] transition-colors group">
                <input className="w-4 h-4 text-[var(--hc-primary)] rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] focus:ring-[var(--hc-primary)]" type="checkbox" />
                <span className="text-sm font-medium group-hover:text-[var(--hc-primary)] transition-colors">Respiratory Distress</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] transition-colors group">
                <input className="w-4 h-4 text-[var(--hc-primary)] rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] focus:ring-[var(--hc-primary)]" type="checkbox" />
                <span className="text-sm font-medium group-hover:text-[var(--hc-primary)] transition-colors">Abdominal Sharpness</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:border-[var(--hc-primary)] transition-colors group">
                <input className="w-4 h-4 text-[var(--hc-primary)] rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] focus:ring-[var(--hc-primary)]" type="checkbox" />
                <span className="text-sm font-medium group-hover:text-[var(--hc-primary)] transition-colors">Neurological Deficit</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex items-center group">
              Next: Analyze Results
              <HcIcon name="arrow_forward" className="ml-2 transition-transform group-hover:translate-x-1 w-4 h-4" />
            </Button>
            <Button variant="secondary">
              Save Draft
            </Button>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8 sticky top-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mb-6">Real-time Analysis</h2>

          <div className="space-y-6">
            <div className="p-6 bg-[var(--hc-surface-soft)] border-l-4 border-[var(--hc-danger)] rounded-r-[var(--radius-xl)]">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-[var(--hc-danger)] text-[10px] text-white px-2 py-1 font-bold uppercase rounded-full">Urgency: High</span>
                <span className="text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase">Code: CLIN-042</span>
              </div>
              <h3 className="text-sm font-bold mb-2 text-[var(--hc-text)]">Preliminary Assessment</h3>
              <p className="text-xs text-[var(--hc-text-secondary)] leading-relaxed">
                Based on the high pain scale and acute onset, this presentation requires immediate physician review within 30 minutes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)]">
                <p className="text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase mb-2">Vital Match</p>
                <p className="text-2xl font-black text-[var(--hc-text)]">94%</p>
                <div className="w-full bg-[var(--hc-border-soft)] h-1 mt-3 rounded-full overflow-hidden">
                  <div className="bg-[var(--hc-primary)] w-[94%] h-full"></div>
                </div>
              </div>
              <div className="p-5 border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)]">
                <p className="text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase mb-2">Risk Level</p>
                <p className="text-2xl font-black text-[var(--hc-danger)]">Elevated</p>
                <div className="w-full bg-[var(--hc-border-soft)] h-1 mt-3 rounded-full overflow-hidden">
                  <div className="bg-[var(--hc-danger)] w-[75%] h-full"></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mb-4">Diagnostic Flags</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-sm font-medium text-[var(--hc-text)]">
                  <HcIcon name="check_circle" className="text-[var(--hc-primary)] w-4 h-4 mr-3" />
                  Inflammation Markers Suggested
                </li>
                <li className="flex items-center text-sm font-medium text-[var(--hc-text)]">
                  <HcIcon name="check_circle" className="text-[var(--hc-primary)] w-4 h-4 mr-3" />
                  History: Patient #88219 Match
                </li>
                <li className="flex items-center text-sm font-medium text-[var(--hc-text-placeholder)]">
                  <HcIcon name="radio_button_unchecked" className="w-4 h-4 mr-3" />
                  Secondary Triage Required
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden h-40 w-full group rounded-[var(--radius-lg)] mt-4">
              <Image
                className="object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvYfG9LUpiwHQg7TFOLBbm_p80bQl39VmGsH6gDJst9BWxOvwWTcMpEqHN3DpmwzBNWxmVcqrzk60YYu0SKnp2-fAeQ7j0_mdUKNyNa8Mw-2_ULZ3cm3Eq9hhEmxYkUx5WKaLpfQzk6sCF0ZOR5mhygt5P4NOQyLVPMUaX3-if8hv8lvt6wpQ_HPAyn9y-ticXOLFGxaGxvVbHK3StLh-RBzVpjXfGhqsgiC3ZOzH6jtrU2JDX8TVbPHEusS5Hk2ibDdHE_hf29Q"
                alt="high-tech clinical setting"
                fill
                unoptimized
              />
              <div className="absolute inset-0 bg-[var(--hc-primary)]/10 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
