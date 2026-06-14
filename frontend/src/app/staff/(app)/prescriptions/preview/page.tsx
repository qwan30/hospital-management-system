import Image from "next/image";

import { HcIcon } from "@/components/ui/hc-icon";

export default function PrescriptionPreviewPage() {
  return (
    <>
      <main className="flex h-[calc(100vh-64px)]">
        <h1 className="sr-only">Prescription Preview</h1>

        {/* Document Sidebar (Info Panels) */}
        <aside className="hidden md:flex w-80 flex-col bg-[var(--hc-sidebar-bg)] border-r border-[var(--hc-border-soft)] p-8 gap-8 overflow-y-auto">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mb-3 block">
              Patient Details
            </span>
            <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-6 space-y-4 shadow-sm">
              <div>
                <p className="text-[10px] text-[var(--hc-text-muted)] font-bold uppercase tracking-widest">Name</p>
                <p className="text-sm font-bold text-[var(--hc-text)]">Jonathan H. Miller</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--hc-text-muted)] font-bold uppercase tracking-widest">ID Number</p>
                <p className="text-sm font-bold text-[var(--hc-text)]">HMS-8829-01</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--hc-text-muted)] font-bold uppercase tracking-widest">Date of Issue</p>
                <p className="text-sm font-bold text-[var(--hc-text)]">October 24, 2023</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mb-3 block">
              Clinical Context
            </span>
            <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-6 shadow-sm">
              <p className="text-[10px] text-[var(--hc-text-muted)] font-bold uppercase tracking-widest mb-2">Diagnosis</p>
              <p className="text-sm leading-relaxed text-[var(--hc-text-secondary)] font-medium">
                Chronic Hypertension Stage II with secondary implications of Type 2 Diabetes Mellitus.
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-[var(--hc-surface-soft)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-6 flex items-start gap-4 shadow-sm">
              <HcIcon name="verified" className="text-blue-600 shrink-0 w-6 h-6" />
              <div>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Digital Signature</p>
                <p className="text-xs font-bold text-[var(--hc-text)] mt-1">Verified by Dr. Sarah Chen</p>
              </div>
            </div>
          </div>
        </aside>

        {/* PDF Viewer Canvas */}
        <section className="flex-1 bg-[var(--hc-background)] p-4 md:p-12 overflow-y-auto flex justify-center">
          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] shadow-md w-full max-w-[816px] min-h-[1056px] p-16 flex flex-col relative overflow-hidden">
            {/* Monochromatic Edge Marking */}
            <div className="absolute right-0 top-0 h-full w-2 bg-[var(--hc-primary)]"></div>

            {/* PDF Header */}
            <div className="flex justify-between items-start mb-16 relative z-10 border-b border-[var(--hc-border-soft)] pb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--hc-text)] mb-2">HMS Precision</h2>
                <p className="text-[10px] text-[var(--hc-text-muted)] tracking-widest font-bold uppercase">
                  UNIT 04 - CLINICAL CARE INFRASTRUCTURE
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mb-1">Prescription No.</p>
                <p className="text-sm font-bold font-mono text-[var(--hc-text)]">RX-2023-449102</p>
              </div>
            </div>

            {/* Prescription Content */}
            <div className="space-y-12 relative z-10">
              {/* Patient & Doctor */}
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4 bg-[var(--hc-surface-muted)] p-6 rounded-[var(--radius-lg)] border border-[var(--hc-border-soft)]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] border-b border-[var(--hc-border-soft)] pb-2">
                    Practitioner
                  </h3>
                  <div className="pt-2">
                    <p className="text-base font-bold text-[var(--hc-text)] mb-1">Dr. Sarah Chen, MD</p>
                    <p className="text-xs text-[var(--hc-text-muted)] font-mono mb-1">License: #99201-B</p>
                    <p className="text-xs text-[var(--hc-text-muted)]">Internal Medicine</p>
                  </div>
                </div>
                <div className="space-y-4 bg-[var(--hc-surface-muted)] p-6 rounded-[var(--radius-lg)] border border-[var(--hc-border-soft)]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] border-b border-[var(--hc-border-soft)] pb-2">
                    Recipient
                  </h3>
                  <div className="pt-2">
                    <p className="text-base font-bold text-[var(--hc-text)] mb-1">Jonathan H. Miller</p>
                    <p className="text-xs text-[var(--hc-text-muted)] font-mono mb-1">DOB: 12/04/1978</p>
                    <p className="text-xs text-[var(--hc-text-muted)]">Weight: 84kg</p>
                  </div>
                </div>
              </div>

              {/* Medication List */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] border-b border-[var(--hc-border-soft)] pb-2">
                  Prescribed Medication
                </h3>
                <div className="space-y-6 pt-2">
                  {/* Item 1 */}
                  <div className="flex gap-6 items-start border border-[var(--hc-border-soft)] p-6 rounded-[var(--radius-lg)] shadow-sm bg-[var(--hc-surface)]">
                    <HcIcon name="medical_services" className="text-[var(--hc-primary)] w-8 h-8 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <p className="text-lg font-bold text-[var(--hc-text)]">Lisinopril 20mg Tablet</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest bg-[var(--hc-surface-soft)] text-[var(--hc-text-muted)] px-3 py-1 rounded-[var(--radius-sm)]">Qty: 90 Days</p>
                      </div>
                      <p className="text-sm text-[var(--hc-text-secondary)] font-medium italic mb-4">
                        Sig: Take 1 tablet by mouth daily for hypertension.
                      </p>
                      <div className="bg-[var(--hc-warning-bg)] border border-[var(--hc-warning)]/20 p-4 rounded-[var(--radius-md)]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-warning)] mb-1">
                          Pharmacist Note
                        </p>
                        <p className="text-xs font-medium text-[var(--hc-warning)]">
                          Do not discontinue abruptly. Monitor blood pressure weekly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex gap-6 items-start border border-[var(--hc-border-soft)] p-6 rounded-[var(--radius-lg)] shadow-sm bg-[var(--hc-surface)]">
                    <HcIcon name="medication" className="text-[var(--hc-primary)] w-8 h-8 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <p className="text-lg font-bold text-[var(--hc-text)]">Metformin HCl 500mg ER</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest bg-[var(--hc-surface-soft)] text-[var(--hc-text-muted)] px-3 py-1 rounded-[var(--radius-sm)]">Qty: 180 Tabs</p>
                      </div>
                      <p className="text-sm text-[var(--hc-text-secondary)] font-medium italic mb-4">
                        Sig: Take 2 tablets by mouth with dinner.
                      </p>
                      <div className="bg-[var(--hc-surface-muted)] border border-[var(--hc-border-soft)] p-4 rounded-[var(--radius-md)]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mb-1">
                          Pharmacist Note
                        </p>
                        <p className="text-xs font-medium text-[var(--hc-text-muted)]">
                          Extended release formula. Do not crush or chew tablets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Instructions */}
              <div className="bg-[var(--hc-surface-soft)] border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] p-8">
                <h3 className="text-[10px] font-bold uppercase mb-4 tracking-widest text-[var(--hc-text)]">
                  Follow-up Protocols
                </h3>
                <ul className="text-sm space-y-3 list-disc list-inside text-[var(--hc-text-secondary)] font-medium">
                  <li>Repeat blood panel required in 30 days.</li>
                  <li>Monitor daily sodium intake below 2300mg.</li>
                  <li>Schedule next consultation for physical assessment.</li>
                </ul>
              </div>
            </div>

            {/* PDF Footer & Signature */}
            <div className="mt-auto pt-16 flex justify-between items-end relative z-10 border-t border-[var(--hc-border-soft)]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">Date of Authorization</p>
                <p className="text-xs font-bold font-mono text-[var(--hc-text)]">2023.10.24 at 14:32:00 GMT</p>
                <div className="w-48 h-[1px] bg-[var(--hc-border-soft)] mt-8"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)] mt-2">Hospital Stamp / Digital ID</p>
              </div>
              <div className="flex flex-col items-center">
                <Image
                  alt="Doctor Signature"
                  className="w-24 h-12 mix-blend-multiply opacity-80 mb-2"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2_WJCiHfQ1tH5s5AvN3gEYvHuuOAYGJ7RwnYAIqnTBQeAgFAIqNW2ks9Kw8qn5zvYC2IjHQ79efobopfnS39OwHemQbgNrpymLYIUqC651Qgy3fwWwhJSfKmc60uU4Z2olOYvy2Xo6NxGzGYHQa8t_AWNQruYrwJC7n762e7g0nZw4vScxD5i09VzQ8M377wk5sgRkxteJ1DiRAKzl7By_U9Bs2lt0yIq08J6gEPHmr-7Fu7VWiW_4nZa_O3IfsmOR-xWf-wUhw"
                  width={1200}
                  height={800}
                />
                <div className="w-64 h-[1px] bg-[var(--hc-text)]"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text)] mt-3">Authorized Signatory: Sarah Chen, MD</p>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Action Tool (Contextual) */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
          <button aria-label="Zoom prescription in" className="w-12 h-12 rounded-full bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] shadow-md flex items-center justify-center hover:bg-[var(--hc-surface-muted)] transition-colors cursor-pointer">
            <HcIcon name="zoom_in" className="text-[var(--hc-text-secondary)] w-5 h-5" />
          </button>
          <button aria-label="Zoom prescription out" className="w-12 h-12 rounded-full bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] shadow-md flex items-center justify-center hover:bg-[var(--hc-surface-muted)] transition-colors cursor-pointer">
            <HcIcon name="zoom_out" className="text-[var(--hc-text-secondary)] w-5 h-5" />
          </button>
          <button aria-label="Share prescription" className="w-12 h-12 rounded-full bg-[var(--hc-primary)] text-white shadow-md flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-blue">
            <HcIcon name="share" className="w-5 h-5" />
          </button>
        </div>
      </main>
    </>
  );
}
