import Link from "next/link";

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
      <header className="flex flex-col gap-2 border-b-2 border-hms-surface-container-highest pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-hms-primary">
          Diagnostics Workspace
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-hms-on-surface">
              Laboratory Results
            </h1>
            <p className="mt-2 text-sm text-hms-on-surface-variant">
              Review patient diagnostics, escalation status, and pending lab sign-off.
            </p>
          </div>
          <Link
            href="/staff/lab-results/1"
            className="inline-flex h-12 items-center justify-center bg-hms-primary-container px-6 text-sm font-semibold text-white transition-colors hover:bg-hms-primary"
          >
            Open Latest Report
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-0 md:grid-cols-4">
        {[
          ["Open Reports", "18", "5 require review"],
          ["Critical Flags", "03", "2 new today"],
          ["Avg Turnaround", "42m", "within SLA"],
          ["Verified Today", "64", "+14 vs yesterday"],
        ].map(([label, value, detail]) => (
          <div
            key={label}
            className="bg-hms-surface-container-low p-6 border-r border-hms-surface"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-hms-on-surface-variant">
              {label}
            </p>
            <p className="mt-3 text-4xl font-light text-hms-primary-container">
              {value}
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
              {detail}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-hms-surface-container-lowest">
        <div className="grid grid-cols-[1.1fr_1fr_1fr_0.8fr_0.6fr] bg-hms-surface-container-high px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
          <span>Report ID</span>
          <span>Patient</span>
          <span>Test</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-hms-surface-container">
          {labReports.map((report) => (
            <div
              key={report.id}
              className="grid grid-cols-[1.1fr_1fr_1fr_0.8fr_0.6fr] items-center px-6 py-5 text-sm hover:bg-hms-surface-container-low"
            >
              <div>
                <p className="font-mono text-xs font-bold text-hms-primary">
                  {report.id}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-hms-on-surface-variant">
                  {report.issued}
                </p>
              </div>
              <span className="font-semibold">{report.patient}</span>
              <span>{report.test}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-hms-on-surface-variant">
                {report.status}
              </span>
              <Link
                href={report.href}
                className="text-right text-xs font-bold uppercase tracking-widest text-hms-primary hover:underline"
              >
                Review
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
