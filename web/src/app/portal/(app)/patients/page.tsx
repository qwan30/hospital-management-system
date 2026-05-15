import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";
import { FolderHeart, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PortalPatientsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Patient Profile Access"
          description="Review the patient record connected to this portal session and the household contacts authorized for care coordination."
          className="mb-0"
        />
        <Link 
          href="/portal/profile"
          className="hc-button-primary"
        >
          Edit Profile
        </Link>
      </div>

      <div className="hc-kpi-grid">
        <KpiCard
          label="Linked Records"
          value="01"
          helper="Primary patient"
          tone="blue"
          icon={FolderHeart}
        />
        <KpiCard
          label="Care Contacts"
          value="02"
          helper="Authorized"
          tone="teal"
          icon={Phone}
        />
        <KpiCard
          label="Consent Status"
          value="On"
          helper="Portal sharing"
          tone="purple"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <DataPanel>
            {[
              {
                eyebrow: "Primary record",
                title: "Sarah Jenkins",
                detail: "Portal-visible summary with appointments, labs, messages, and billing.",
                status: "Active",
              },
              {
                eyebrow: "Emergency contact",
                title: "Sarah Jenkins-Vance",
                detail: "Phone and relationship details are managed in patient profile.",
                status: "Verified",
              },
              {
                eyebrow: "Care team",
                title: "Internal Medicine",
                detail: "Clinical messages are routed through the assigned care coordination team.",
                status: "Assigned",
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
            <span className="text-[11px] font-bold text-[var(--hc-blue-600)] uppercase tracking-widest mb-4 block">Privacy controls</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                <HcIcon name="policy" className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-[var(--hc-text)]">Household access policy</h3>
            </div>
            <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed">
              Additional patient records require identity verification and explicit consent before they can appear in this portal.
            </p>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
