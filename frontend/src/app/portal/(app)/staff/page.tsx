import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";
import { Users, User, Clock } from "lucide-react";
import Link from "next/link";

export default function PortalStaffPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Assigned Staff"
          description="See the clinicians and coordinators connected to your upcoming visits and active care plan."
          className="mb-0"
        />
        <Link
          href="/portal/messages"
          className="hc-button-primary"
        >
          Message Care Team
        </Link>
      </div>

      <div className="hc-kpi-grid">
        <KpiCard
          label="Assigned Clinicians"
          value="04"
          helper="Across active care"
          tone="blue"
          icon={Users}
        />
        <KpiCard
          label="Primary Doctor"
          value="01"
          helper="Internal medicine"
          tone="teal"
          icon={User}
        />
        <KpiCard
          label="Response SLA"
          value="4h"
          helper="Business day"
          tone="purple"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <DataPanel>
            {[
              {
                eyebrow: "Primary physician",
                title: "Dr. Nguyen Van An",
                detail: "Internal Medicine. Assigned to allergy and respiratory follow-up.",
                status: "Primary",
              },
              {
                eyebrow: "Nursing coordinator",
                title: "Le Thi Cuc",
                detail: "Coordinates intake, vitals, and appointment preparation.",
                status: "Care team",
              },
              {
                eyebrow: "Billing desk",
                title: "Patient finance office",
                detail: "Handles invoice questions and insurance document routing.",
                status: "Support",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--hc-border-soft)] last:border-0 last:pb-0">
                <div>
                  <span className="text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest">{step.eyebrow}</span>
                  <h3 className="text-base font-bold text-[var(--hc-text)] mt-1">{step.title}</h3>
                  <p className="text-sm text-[var(--hc-text-secondary)] mt-1">{step.detail}</p>
                </div>
                <Badge variant="secondary">
                  {step.status}
                </Badge>
              </div>
            ))}
          </DataPanel>
        </div>

        <div className="lg:col-span-1">
          <DataPanel className="bg-white">
            <span className="text-[11px] font-bold text-[var(--hc-primary)] uppercase tracking-widest mb-4 block">Communication policy</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--hc-primary-bg)] text-[var(--hc-primary)] flex items-center justify-center">
                <HcIcon name="mail" className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-[var(--hc-text)]">Contact through secure messages</h3>
            </div>
            <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed">
              Direct staff contact details are limited for privacy. Messages route to the right queue with patient context attached.
            </p>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
