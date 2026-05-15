import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { HcIcon } from "@/components/ui/hc-icon";
import { CheckCircle2, FileText, Users } from "lucide-react";
import Link from "next/link";

export default function PatientAdmitPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Admission And Booking"
          description="Start a new visit request, review intake requirements, and prepare the documents needed before arrival."
          className="mb-0"
        />
        <Link 
          href="/booking"
          className="hc-button-primary"
        >
          Start Booking
        </Link>
      </div>

      <div className="hc-kpi-grid">
        <KpiCard
          label="Intake Steps"
          value="04"
          helper="Symptoms to confirmation"
          tone="blue"
          icon={CheckCircle2}
        />
        <KpiCard
          label="Documents"
          value="03"
          helper="ID, insurance, records"
          tone="teal"
          icon={FileText}
        />
        <KpiCard
          label="Queue Status"
          value="Low"
          helper="Today"
          tone="green"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[var(--hc-surface-soft)] rounded-[var(--radius-lg)] p-6 space-y-6 border border-[var(--hc-border)] shadow-[var(--shadow-card)]">
            {[
              {
                eyebrow: "Step 1",
                title: "Describe symptoms and care need",
                detail: "The booking workflow estimates duration and routes the visit to a department.",
                status: "Required",
              },
              {
                eyebrow: "Step 2",
                title: "Select department and doctor",
                detail: "Available slots are shown after the clinical intake details are complete.",
                status: "Required",
              },
              {
                eyebrow: "Step 3",
                title: "Confirm patient contact details",
                detail: "Use the same email and phone number linked to your portal profile.",
                status: "Required",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--hc-border-soft)] last:border-0 last:pb-0">
                <div>
                  <span className="text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest">{step.eyebrow}</span>
                  <h3 className="text-base font-bold text-[var(--hc-text)] mt-1">{step.title}</h3>
                  <p className="text-sm text-[var(--hc-text-secondary)] mt-1">{step.detail}</p>
                </div>
                <span className="hc-badge bg-[var(--hc-surface-soft)] border border-[var(--hc-border)] text-[var(--hc-text-secondary)] whitespace-nowrap">
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 border border-[var(--hc-border)] shadow-[var(--shadow-card)]">
            <span className="text-[11px] font-bold text-[var(--hc-blue-600)] uppercase tracking-widest mb-4 block">Front desk checklist</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                <HcIcon name="info" className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-[var(--hc-text)]">Bring records on arrival</h3>
            </div>
            <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed">
              Carry a government ID, insurance card, medication list, and any outside lab or imaging results related to the visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
