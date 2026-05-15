import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";
import { MessageSquare, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export default function PatientSupportPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Support"
          description="Route non-urgent care, billing, portal access, and scheduling questions to the right hospital desk."
          className="mb-0"
        />
        <Link 
          href="/portal/messages"
          className="hc-button-primary"
        >
          Open Messages
        </Link>
      </div>

      <div className="hc-kpi-grid">
        <KpiCard
          label="Average Response"
          value="4h"
          helper="Business day"
          tone="blue"
          icon={MessageSquare}
        />
        <KpiCard
          label="Open Threads"
          value="03"
          helper="Secure inbox"
          tone="teal"
          icon={MessageCircle}
        />
        <KpiCard
          label="Urgent Line"
          value="24/7"
          helper="Call reception"
          tone="amber"
          icon={Phone}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <DataPanel>
            {[
              {
                eyebrow: "Clinical support",
                title: "Questions about labs or medication",
                detail: "Use secure messages so the care team can review the right record context.",
                status: "Messages",
              },
              {
                eyebrow: "Scheduling desk",
                title: "Appointment changes",
                detail: "Review upcoming visits and request a reschedule from appointments.",
                status: "Appointments",
              },
              {
                eyebrow: "Billing desk",
                title: "Insurance or invoice questions",
                detail: "Send invoice references and payer details for faster review.",
                status: "Billing",
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
          </DataPanel>
        </div>
        
        <div className="lg:col-span-1">
          <DataPanel className="bg-white">
            <span className="text-[11px] font-bold text-[var(--hc-red-600)] uppercase tracking-widest mb-4 block">Safety notice</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--hc-red-50)] text-[var(--hc-red-600)] flex items-center justify-center">
                <HcIcon name="warning" className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-[var(--hc-text)]">Emergency guidance</h3>
            </div>
            <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed">
              The portal is not monitored for emergencies. For urgent symptoms, call local emergency services or the hospital emergency desk directly.
            </p>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
