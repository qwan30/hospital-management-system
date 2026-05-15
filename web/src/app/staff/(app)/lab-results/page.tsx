import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { FileText, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const labReports = [
  {
    id: "LR-2024-8821",
    patient: "Sarah J. Miller",
    test: "Complete Blood Count",
    status: "Critical review",
    issued: "Today 10:42",
    href: "/staff/lab-results/1",
  },
  {
    id: "LR-2024-8817",
    patient: "Marcus V. Thorne",
    test: "Metabolic Panel",
    status: "Verified",
    issued: "Today 09:15",
    href: "/staff/lab-results/1",
  },
  {
    id: "LR-2024-8809",
    patient: "Elena Rodriguez",
    test: "Lipid Profile",
    status: "Pending sign-off",
    issued: "Yesterday 16:30",
    href: "/staff/lab-results/1",
  },
];

export default function StaffLabResultsPage() {
  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Laboratory Results"
        description="Review patient diagnostics, escalation status, and pending lab sign-off."
        action={
          <Link href="/staff/lab-results/1" className="hc-button-primary">
            Open Latest Report
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <KpiCard
          label="Open Reports"
          value="18"
          icon={FileText}
          helper="5 require review"
          tone="blue"
        />
        <KpiCard
          label="Critical Flags"
          value="03"
          icon={AlertTriangle}
          helper="2 new today"
          tone="red"
        />
        <KpiCard
          label="Avg Turnaround"
          value="42m"
          icon={Clock}
          helper="within SLA"
          tone="teal"
        />
        <KpiCard
          label="Verified Today"
          value="64"
          icon={CheckCircle}
          helper="+14 vs yesterday"
          tone="green"
        />
      </section>

      <DataPanel title="Recent Lab Reports">
        <div className="overflow-x-auto">
          <table className="hc-table w-full">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Patient</th>
                <th>Test</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {labReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-[var(--hc-blue-600)]">
                        {report.id}
                      </span>
                      <span className="mt-1 text-[10px] uppercase tracking-widest text-[var(--hc-text-secondary)]">
                        {report.issued}
                      </span>
                    </div>
                  </td>
                  <td className="font-medium text-[var(--hc-text)]">{report.patient}</td>
                  <td className="text-[var(--hc-text-secondary)]">{report.test}</td>
                  <td>
                    <StatusBadge
                      label={report.status}
                      type={
                        report.status === "Critical review"
                          ? "danger"
                          : report.status === "Verified"
                          ? "success"
                          : "neutral"
                      }
                    />
                  </td>
                  <td className="text-right">
                    <Link
                      href={report.href}
                      className="text-xs font-bold uppercase tracking-widest text-[var(--hc-blue-600)] hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}

function StatusBadge({ label, type }: { label: string; type: "success" | "danger" | "neutral" }) {
  const styles = {
    danger: "bg-[#FFF5F5] text-[var(--hc-danger)] border-[var(--hc-danger-bg)]",
    success: "bg-[var(--hc-success-bg)] text-[var(--hc-success)] border-[var(--hc-success-bg)]",
    neutral: "bg-[var(--hc-surface-container-low)] text-[var(--hc-text-secondary)] border-[var(--hc-border-soft)]",
  };

  return (
    <span className={`hc-badge ${styles[type]}`}>
      {label}
    </span>
  );
}
