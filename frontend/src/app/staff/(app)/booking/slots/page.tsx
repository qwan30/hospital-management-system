import Image from "next/image";
import { HcIcon } from "@/components/ui/hc-icon";

export default function BookingDoctorSlotSelectionPage() {
  return (
    <main className="max-w-[1400px] mx-auto p-8 pb-20">
      <header className="mb-8">
        <nav className="flex items-center gap-0 mb-8 border-b border-[var(--hc-border-soft)]">
          <div className="flex items-center px-6 py-4 border-b-2 border-transparent text-[var(--hc-text-muted)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 bg-[var(--hc-surface-soft)] rounded-[var(--radius-sm)] text-[10px] mr-2">1</span>
            Symptoms
          </div>
          <div className="flex items-center px-6 py-4 border-b-2 border-[var(--hc-primary)] text-[var(--hc-primary)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--hc-primary)] rounded-[var(--radius-sm)] text-[10px] mr-2">2</span>
            Triage & Slots
          </div>
          <div className="flex items-center px-6 py-4 text-[var(--hc-text-muted)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 rounded-[var(--radius-sm)] text-[10px] mr-2">3</span>
            Patient Info
          </div>
          <div className="flex items-center px-6 py-4 text-[var(--hc-text-muted)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 rounded-[var(--radius-sm)] text-[10px] mr-2">4</span>
            Confirmation
          </div>
        </nav>
        <h1 className="text-3xl font-light tracking-tight text-[var(--hc-text)] mb-2">Schedule Appointment</h1>
        <p className="text-[var(--hc-text-secondary)] text-sm max-w-2xl">Select a healthcare professional and an available time slot for your consultation in the Cardiology department.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Available Specialists</h2>
              <div className="flex gap-4">
                <span className="text-xs text-[var(--hc-primary)] font-bold cursor-pointer hover:underline">FILTER BY SENIORITY</span>
                <span className="text-xs text-[var(--hc-text-muted)] font-bold cursor-pointer hover:text-[var(--hc-text)] transition-colors">SORT BY AVAILABILITY</span>
              </div>
            </div>

            {/* Doctor Card 1 */}
            <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6 flex flex-col md:flex-row gap-8 hover:border-slate-300 transition-colors group">
              <div className="shrink-0">
                <Image
                  alt="Dr. Sarah Jenkins"
                  className="w-24 h-24 object-cover rounded-[var(--radius-lg)]"
                  data-alt="Professional headshot of a male doctor in glasses and blue scrubs with a clean clinic background"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBb1_yE4u4Bwq2YnFYxt4yB433OfkmINjPK-A9GS28YBNnZkZbLXxr-PJGK0jQsgIc8Qen_LkkguBNAo7KcVqViGw96CYukI9Biz-VCXleX7NA88OXszRdvvoWS00EEu9-OdH1ZGzAbBpFvo_rsyBM9FyCnV97fwtWHcfVaSf8tH5RO3A8AKEJV-rWULczf_dK7gRnA-wH-yMeAq5YaiLj5kfq32WxqjGjXdActBuGXBQ6a26hFN2ACfi90Gfrka7Vc7QIrOlwbg"
                  width={1200} height={800}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--hc-text)]">Dr. Sarah Jenkins</h3>
                    <p className="text-xs font-medium text-[var(--hc-text-secondary)] mt-1">Senior Cardiologist • 12 Years Exp.</p>
                  </div>
                  <div className="bg-amber-100 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-800 uppercase tracking-widest">Highly Rated</div>
                </div>

                {/* Slot Groups */}
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)] block mb-3">Morning Slots</span>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">08:30 AM</button>
                      <button className="px-4 py-2 bg-[var(--hc-primary)] border border-[var(--hc-primary)] rounded-[var(--radius-md)] text-white text-sm font-medium shadow-sm">09:15 AM</button>
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">10:00 AM</button>
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">11:30 AM</button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)] block mb-3">Afternoon Slots</span>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">01:45 PM</button>
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">02:30 PM</button>
                      <button className="px-4 py-2 border border-slate-200 bg-[var(--hc-surface-soft)] text-slate-300 rounded-[var(--radius-md)] text-sm font-medium cursor-not-allowed">03:15 PM</button>
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">04:00 PM</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Card 2 */}
            <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-6 flex flex-col md:flex-row gap-8 hover:border-slate-300 transition-colors group">
              <div className="shrink-0">
                <Image
                  alt="Dr. Marcus Thorne"
                  className="w-24 h-24 object-cover rounded-[var(--radius-lg)]"
                  data-alt="Medical professional headshot of a female doctor in a white coat with a friendly smile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkixEEDa4D_UpfICVURFVwbixMF_TdxHPVQacbh7KHWWQikXwcL7GrapqPfKnVlS48MJUXiXqRR7UCGDKryWFSSWglL0zClIQgKWOr3s3pdnPvvY2vpbmm7Hj7ezXPVBbaMgKklBMJJDcvR39awxoNCxMm-BtU2UFJ3LV47IRqu3gYZVJh-Wv8QvbY8bxoW1WpnCSLis3jvT7INZg8gwmhfu-miKz1JHR9omKXa0bAAmJ2G-9fcHSqs-ImgHOoM8Tx-pAZbPSA6A"
                  width={1200} height={800}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--hc-text)]">Dr. Marcus Thorne</h3>
                    <p className="text-xs font-medium text-[var(--hc-text-secondary)] mt-1">Interventional Cardiology Specialist</p>
                  </div>
                </div>

                {/* Slot Groups */}
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)] block mb-3">Morning Slots</span>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">09:00 AM</button>
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">10:30 AM</button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)] block mb-3">Afternoon Slots</span>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">02:00 PM</button>
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">03:00 PM</button>
                      <button className="px-4 py-2 border border-[var(--hc-border-soft)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--hc-primary)] hover:text-[var(--hc-primary)] transition-colors">04:30 PM</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="col-span-12 lg:col-span-4 sticky top-8">
          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-muted)] mb-6">Appointment Summary</h2>

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-primary)]">Department</span>
                <div className="text-sm font-bold text-[var(--hc-text)] mt-1">Cardiology Unit 4A</div>
              </div>

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-primary)]">Healthcare Professional</span>
                <div className="flex items-center gap-3 mt-2">
                  <Image
                    alt="Dr. Sarah Jenkins"
                    className="w-10 h-10 object-cover rounded-[var(--radius-md)]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKZnYcR7GpVX28RJIrG-nm_5-n0U2i314IyfHzPHTJNch7EOXpCvNl4X3iLO1Hia2lr8uOSN50pRTcapUqEd45UhQmGgx1p0w7EeDI8Z3q0htXLvjMfBblX5a5-T8upGERFzeYTObzeeRXRau22BF4zL6hX3EmllQQ7t0GesGTlpB2W7RgdBm746RMrpEVz80Qj3BhKbIGHqWY_LCFEFEqhtU26LLp0LieLZRtdxrwq5_XNd-ENeP5AeWifjEts3O1awamtmUZlg"
                    width={1200} height={800}
                  />
                  <div>
                    <div className="text-sm font-bold text-[var(--hc-text)]">Dr. Sarah Jenkins</div>
                    <div className="text-[11px] text-[var(--hc-text-secondary)] font-medium">Senior Cardiologist</div>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-primary)]">Selected Slot</span>
                <div className="flex items-center gap-2 mt-2 bg-[var(--hc-surface-soft)] border border-[var(--hc-border-soft)] px-3 py-2 rounded-[var(--radius-md)] inline-flex">
                  <HcIcon name="calendar_today" className="w-4 h-4 text-[var(--hc-text-muted)]" />
                  <span className="text-xs font-bold text-[var(--hc-text)]">Oct 24, 2023</span>
                  <span className="text-slate-300">|</span>
                  <HcIcon name="schedule" className="w-4 h-4 text-[var(--hc-text-muted)]" />
                  <span className="text-xs font-bold text-[var(--hc-text)]">09:15 AM</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--hc-border-soft)]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-medium text-[var(--hc-text-secondary)]">Consultation Fee</span>
                <span className="text-lg font-black text-[var(--hc-text)]">$120.00</span>
              </div>
              <button className="w-full hc-button-primary flex items-center justify-center gap-2">
                <span>Continue to Patient Info</span>
                <HcIcon name="arrow_forward" className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-[var(--hc-text-muted)] mt-4 text-center font-medium">Insurance eligibility will be verified in the next step.</p>
            </div>
          </div>

          <div className="mt-4 p-5 bg-[var(--hc-surface-soft)] border border-slate-200 rounded-[var(--radius-lg)] flex items-start gap-4">
            <HcIcon name="help_outline" className="text-[var(--hc-text-muted)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[var(--hc-text-secondary)] mb-1">Need help?</div>
              <p className="text-[11px] text-[var(--hc-text-muted)] leading-relaxed font-medium">Contact the coordination desk at (555) 012-3456 for manual scheduling assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
