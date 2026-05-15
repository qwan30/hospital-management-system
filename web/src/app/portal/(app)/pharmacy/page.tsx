import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";
import { Pill, RefreshCw, Store } from "lucide-react";
import Link from "next/link";

export default function PatientPharmacyPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Pharmacy"
          description="Review active prescriptions, renewal status, and pickup instructions shared by the clinical team."
          className="mb-0"
        />
        <Link 
          href="/portal/messages"
          className="hc-button-primary"
        >
          Request Renewal
        </Link>
      </div>

      <div className="hc-kpi-grid">
        <KpiCard
          label="Active Prescriptions"
          value="06"
          helper="Current regimen"
          tone="blue"
          icon={Pill}
        />
        <KpiCard
          label="Renewals"
          value="02"
          helper="Awaiting care team"
          tone="teal"
          icon={RefreshCw}
        />
        <KpiCard
          label="Pickup Window"
          value="24h"
          helper="North wing pharmacy"
          tone="purple"
          icon={Store}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <DataPanel>
            {[
              {
                eyebrow: "Daily medication",
                title: "Lisinopril 10mg",
                detail: "One tablet each morning. Renewal confirmed through Nov 24.",
                status: "Active",
              },
              {
                eyebrow: "Supplement",
                title: "Vitamin D 2,000 IU",
                detail: "Added after latest lab review. Available over the counter.",
                status: "New",
              },
              {
                eyebrow: "Respiratory",
                title: "Albuterol inhaler",
                detail: "Bring current inhaler list to the next follow-up appointment.",
                status: "Review",
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
            <span className="text-[11px] font-bold text-[var(--hc-blue-600)] uppercase tracking-widest mb-4 block">Patient safety protocol</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                <HcIcon name="info" className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-[var(--hc-text)]">Medication questions stay in messages</h3>
            </div>
            <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed">
              Prescription changes require clinical review. Use secure messages for renewals, side effect questions, or pharmacy transfer requests.
            </p>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
