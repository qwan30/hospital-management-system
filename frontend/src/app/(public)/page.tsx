import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bed,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  ClipboardList,
  Database,
  FileText,
  FlaskConical,
  HeartPulse,
  LockKeyhole,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";

const metrics = [
  {
    label: "System Uptime",
    value: "99.99%",
    delta: "+0.01% vs last 30 days",
    icon: Activity,
  },
  {
    label: "Daily Transactions",
    value: "42K+",
    delta: "+18.4% vs last 30 days",
    icon: BarChart3,
  },
  {
    label: "Verified Providers",
    value: "1,284",
    delta: "+7.2% vs last 30 days",
    icon: UserCheck,
  },
  {
    label: "Clinical Accuracy",
    value: "99.7%",
    delta: "+0.3% vs last 30 days",
    icon: ShieldCheck,
  },
];

const commandMetrics = [
  {
    label: "Appointment Queue",
    value: "Active",
    meta: "Real-time triage",
    icon: CalendarDays,
  },
  {
    label: "Triage Status",
    value: "Live",
    meta: "Priority-based routing",
    icon: HeartPulse,
  },
  {
    label: "Room Utilization",
    value: "Tracked",
    meta: "Bed management system",
    icon: Bed,
  },
  {
    label: "SLA Compliance",
    value: "Monitored",
    meta: "Continuous auditing",
    icon: CheckCircle2,
  },
];

const patientRows = [
  ["Patient A. Smith", "MRN-74281", "Check-in", "OPD - Cardiology", "12 min"],
  ["Patient M. Chen", "MRN-81562", "In Consultation", "OPD - Cardiology", "5 min"],
  ["Patient E. Rodriguez", "MRN-90317", "Diagnostics", "Radiology", "18 min"],
  ["Patient J. Lee", "MRN-66431", "Pharmacy", "Pharmacy", "8 min"],
  ["Patient O. Martinez", "MRN-22109", "Discharge Prep", "3B - Room 312", "15 min"],
];

const workflowCards = [
  {
    title: "Patient Portal",
    badge: "Active",
    icon: CircleUserRound,
    primary: "Patient Dashboard",
    detail: "Personal health records",
    action: "View My Records",
    rows: [
      "View upcoming appointments",
      "Access lab results and reports",
      "Secure messaging with care team",
    ],
  },
  {
    title: "Doctor Console",
    badge: "Clinical",
    icon: Stethoscope,
    primary: "Clinical Workstation",
    detail: "Patient management",
    action: "Open Doctor Console",
    rows: [
      "Morning rounds - consult patients",
      "Review lab results and imaging",
      "Prescribe and document encounters",
    ],
  },
  {
    title: "Department Coordination",
    badge: "Operations",
    icon: Building2,
    primary: "Bed Management",
    detail: "Real-time availability",
    action: "Open Department View",
    rows: [
      "Team Members: active shift tracking",
      "Today's Cases: department workload",
      "Pending Tasks: prioritized queue",
    ],
  },
];

const modules = [
  { label: "EHR", icon: ClipboardList },
  { label: "Labs", icon: FlaskConical },
  { label: "Pharmacy", icon: Pill },
  { label: "Billing", icon: FileText },
  { label: "Analytics", icon: BarChart3 },
  { label: "Secure DB", icon: Database },
];

export default function PublicHomePage() {
  return (
    <main className="bg-[#f8fbff] text-[#0f172a]">
      <section className="relative overflow-hidden bg-[#020817] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_46%,rgba(14,165,233,0.28),transparent_34%),radial-gradient(circle_at_28%_70%,rgba(37,99,235,0.16),transparent_30%)]" />
        <div className="relative mx-auto grid min-h-[720px] max-w-[1440px] grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-9">
          <div className="max-w-[610px]">
            <div className="mb-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-hc-cyan">
              <span className="flex size-5 items-center justify-center rounded-[6px] bg-hc-cyan/15 text-hc-cyan">
                <ShieldCheck className="size-3.5" />
              </span>
              Clinical Operations Platform
            </div>
            <h1 className="max-w-[680px] text-[50px] font-semibold leading-[0.98] tracking-normal text-white sm:text-[58px]">
              <span className="whitespace-nowrap">Engineering-grade</span>{" "}
              healthcare precision at scale.
            </h1>
            <p className="mt-7 max-w-[590px] text-[15px] leading-7 text-slate-300">
              HOSPITAL CORE provides a deterministic clinical environment. We
              treat hospital management as a high-precision engineering problem,
              delivering zero-latency patient data and architectural integrity
              for modern medicine.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-[6px] bg-hc-primary px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.34)] transition hover:bg-hc-blue-500"
              >
                Commence Operations
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/security"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-[6px] border border-white/18 bg-white/[0.03] px-6 text-sm font-semibold text-slate-100 transition hover:border-hc-cyan/60 hover:bg-hc-cyan/10"
              >
                <FileText className="size-4" />
                Technical Documentation
              </Link>
            </div>
          </div>

          <HeroClinicalConsole />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-6 py-8 lg:px-9">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="px-6 py-20 lg:px-9">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-12 lg:grid-cols-[0.38fr_0.62fr]">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-hc-primary">
              Operations Command Center
            </p>
            <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-normal text-slate-950">
              Real-time clinical operations. Deterministic outcomes.
            </h2>
            <p className="mt-5 max-w-[460px] text-sm leading-7 text-slate-600">
              Observe and manage hospital performance in real time. Every
              transaction, resource, and patient interaction is tracked with
              precision to ensure reliability, compliance, and exceptional
              patient care.
            </p>
            <div className="mt-10 space-y-6">
              <ValuePoint
                icon={ClipboardList}
                title="Live operational telemetry"
                text="Real-time visibility into hospital performance and SLAs"
              />
              <ValuePoint
                icon={ShieldCheck}
                title="Deterministic workflow engine"
                text="Standardized, auditable clinical and administrative flows"
              />
              <ValuePoint
                icon={LockKeyhole}
                title="Secure, compliant infrastructure"
                text="Role-based access for protected healthcare operations"
              />
              <ValuePoint
                icon={BarChart3}
                title="Data-driven decisions"
                text="Actionable insights from unified clinical and operational data"
              />
            </div>
          </div>

          <CommandCenterPanel />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-16 lg:px-9">
        <div className="mx-auto max-w-[1360px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-hc-primary">
            Patient and Provider Workflows
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {workflowCards.map((card) => (
              <WorkflowCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-9">
        <div className="mx-auto max-w-[1360px] rounded-[8px] border border-hc-blue-500/70 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-hc-primary">
              Appointment Booking & Verification
            </p>
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">
              System Monitoring
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.3fr_0.22fr_0.27fr_0.21fr]">
            <BookingWidget />
            <VerificationList />
            <SecureExchangeCard />
            <MonitoringCard />
          </div>
        </div>
      </section>

      <section className="bg-[#031023] px-6 py-12 text-white lg:px-9">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 lg:grid-cols-[0.46fr_0.54fr] lg:items-center">
          <div>
            <h2 className="text-[30px] font-semibold leading-tight tracking-normal">
              Built for modern medicine. Engineered for reliability.
            </h2>
            <p className="mt-4 max-w-[520px] text-sm leading-6 text-slate-300">
              HOSPITAL CORE delivers the precision, security, and performance
              healthcare organizations demand.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
            <Link
              href="/booking"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-[6px] bg-hc-primary px-8 text-sm font-semibold text-white transition hover:bg-hc-blue-500"
            >
              Book Appointment
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/staff/login"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-[6px] border border-white/24 px-8 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Staff Login
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}

function HeroClinicalConsole() {
  return (
    <div className="relative min-h-[560px]">
      <HeartbeatLine />
      <div className="absolute left-[4%] top-[5%] w-[30%] rounded-[8px] border border-hc-cyan/45 bg-slate-950/72 p-4 shadow-[0_18px_50px_rgba(8,145,178,0.14)] backdrop-blur">
        <PanelTitle>Patient Queue</PanelTitle>
        <QueueRow name="Patient A.S." status="Check-in" time="08:15 AM" />
        <QueueRow name="Patient M.C." status="Consult" time="09:30 AM" />
        <QueueRow name="Patient E.R." status="Ready" time="09:45 AM" />
        <div className="mt-3 text-right text-[10px] text-slate-400">
          View all queue {">"}
        </div>
      </div>
      <div className="absolute left-[37%] top-[5%] w-[38%] rounded-[8px] border border-hc-cyan/55 bg-slate-950/76 p-5 backdrop-blur">
        <PanelTitle>Today's Appointments</PanelTitle>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-4xl font-semibold text-white">24</div>
            <div className="mt-1 text-xs text-slate-400">
              Total Appointments
            </div>
            <div className="mt-2 text-xs text-emerald-300">
              +12% vs yesterday
            </div>
          </div>
          <div className="grid size-20 place-items-center rounded-full border-[10px] border-hc-blue-500 border-l-hc-cyan text-center text-[11px] font-bold text-white">
            68%
          </div>
        </div>
        <MiniBars className="mt-5 h-16" />
      </div>
      <div className="absolute right-0 top-[9%] w-[23%] rounded-[8px] border border-hc-cyan/45 bg-slate-950/72 p-5 text-center backdrop-blur">
        <PanelTitle>Provider Verified</PanelTitle>
        <ShieldCheck className="mx-auto mt-4 size-16 text-hc-cyan" />
        <div className="mt-4 text-sm font-semibold text-white">
          Clinical Staff
        </div>
        <div className="text-xs text-slate-400">Cardiology</div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-[6px] bg-hc-cyan/12 px-3 py-2 text-[11px] font-semibold text-cyan-200">
          Credential Verified
          <BadgeCheck className="size-3" />
        </div>
      </div>
      <div className="absolute left-[4%] top-[36%] w-[58%] rounded-[8px] border border-hc-cyan/45 bg-slate-950/78 p-5 backdrop-blur">
        <PanelTitle>Patient Record</PanelTitle>
        <div className="mt-4 grid grid-cols-[0.72fr_0.28fr] gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-hc-cyan/16 text-cyan-200">
                P.A.
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Patient Record
                </div>
                <div className="text-[11px] text-slate-400">
                  MRN-74281 - 34 y - F
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200">
              <span>Overview</span>
              <span className="text-slate-500">History</span>
              <span className="text-slate-500">Labs</span>
              <span className="text-slate-500">Imaging</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-[11px] text-slate-300">
              <span>
                Diagnosis
                <br />
                <strong className="text-white">Essential Hypertension</strong>
              </span>
              <span>
                Last Visit
                <br />
                <strong className="text-white">May 12, 2024</strong>
              </span>
              <span>
                Allergies
                <br />
                <strong className="text-white">Penicillin</strong>
              </span>
              <span>
                Next Appointment
                <br />
                <strong className="text-white">May 28, 10:30 AM</strong>
              </span>
            </div>
          </div>
          <div className="relative min-h-[150px] rounded-[8px] border border-hc-cyan/25 bg-hc-cyan/5">
            <div className="absolute inset-4 rounded-full border border-hc-cyan/20" />
            <HeartPulse className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-hc-cyan/55" />
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-[44%] w-[34%] rounded-[8px] border border-hc-cyan/45 bg-slate-950/78 p-5 backdrop-blur">
        <PanelTitle>System Uptime</PanelTitle>
        <div className="mt-4 text-4xl font-semibold">99.99%</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-300" />
          All Systems Operational
        </div>
        <Sparkline className="mt-7 h-16 text-blue-300" />
      </div>
      <div className="absolute bottom-[4%] left-[18%] right-[6%] flex items-center justify-between">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.label}
              className="flex h-[86px] w-[92px] flex-col items-center justify-center gap-3 rounded-[8px] border border-hc-cyan/45 bg-slate-950/70 text-[10px] font-semibold uppercase text-slate-200 backdrop-blur"
            >
              <Icon className="size-6 text-hc-cyan" />
              {module.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
}: (typeof metrics)[number]) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-12 place-items-center rounded-full bg-hc-primary-bg text-hc-primary">
          <Icon className="size-5" />
        </div>
        <Sparkline className="mt-8 h-8 w-20 text-blue-400" />
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-[34px] font-semibold leading-none text-slate-950">
        {value}
      </div>
      <p className="mt-3 text-xs text-hc-success">{delta}</p>
    </div>
  );
}

function CommandCenterPanel() {
  return (
    <div className="rounded-[8px] border border-hc-blue-500 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-hc-primary">
            Operations Command Center
          </h3>
          <span className="rounded-[6px] bg-hc-success-bg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
            Live
          </span>
        </div>
        <span className="text-xs text-slate-500">
          Facility: Central Hospital
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {commandMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-[8px] border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {metric.label}
                </p>
                <Icon className="size-4 text-hc-blue-500" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-slate-950">
                {metric.value}
              </div>
              <p className="mt-1 text-xs text-slate-500">{metric.meta}</p>
              <Sparkline className="mt-4 h-8 text-blue-400" />
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[0.72fr_0.28fr]">
        <div className="rounded-[8px] border border-slate-200 p-4">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Live Patient Flow
          </p>
          <div className="overflow-hidden rounded-[6px] border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">MRN</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3">Wait</th>
                  <th className="px-3 py-3">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patientRows.map((row) => (
                  <tr key={row[1]}>
                    {row.map((cell, index) => (
                      <td key={`${row[1]}-${index}`} className="px-3 py-3">
                        {cell}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-hc-success">On Track</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid gap-4">
          <SideStat
            title="Staff On Duty"
            items={[
              "12 Doctors",
              "18 Nurses",
              "7 Technicians",
              "5 Admin Staff",
            ]}
          />
          <SideStat
            title="Live SLA Status"
            items={[
              "Response Time 12 min",
              "Check-in Time 8.6 min",
              "Consultation Time 22.4 min",
              "Discharge Time 18.7 min",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function WorkflowCard({
  title,
  badge,
  icon: Icon,
  primary,
  detail,
  rows,
  action,
}: (typeof workflowCards)[number]) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-600">
          {title}
        </h3>
        <span className="rounded-[6px] bg-hc-success-bg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
          {badge}
        </span>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-full bg-hc-primary-bg text-hc-primary">
          <Icon className="size-7" />
        </div>
        <div>
          <div className="font-semibold text-slate-950">{primary}</div>
          <div className="text-xs text-slate-500">{detail}</div>
        </div>
      </div>
      <div className="mt-6 space-y-3 text-xs text-slate-600">
        {rows.map((row) => (
          <div
            key={row}
            className="flex items-center gap-3 rounded-[6px] bg-slate-50 px-3 py-2"
          >
            <CheckCircle2 className="size-4 shrink-0 text-hc-blue-500" />
            <span>{row}</span>
          </div>
        ))}
      </div>
      <Link
        href={title === "Patient Portal" ? "/portal/login" : "/staff/login"}
        className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-hc-blue-500 px-4 text-sm font-semibold text-hc-primary transition hover:bg-hc-primary-bg"
      >
        {action}
        <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}

function BookingWidget() {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-hc-primary">
        Book Appointment
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <FormField label="Department" value="Cardiology" />
        <FormField label="Doctor" value="Dr. James Wilson" />
        <FormField label="Date" value="May 28, 2024" />
        <FormField label="Time" value="10:30 AM" />
      </div>
      <Link
        href="/booking"
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-hc-primary text-sm font-semibold text-white transition hover:bg-hc-blue-500"
      >
        Book Appointment
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function VerificationList() {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-hc-primary">
        Provider Verification
      </h3>
      <div className="mt-5 space-y-4 text-xs">
        {[
          "Medical License Verified",
          "Board Certification",
          "Hospital Privileges",
          "Insurance Approved",
        ].map((item) => (
          <div key={item} className="flex gap-3">
            <CheckCircle2 className="size-4 shrink-0 text-hc-success" />
            <div>
              <div className="font-semibold text-slate-800">{item}</div>
              <div className="text-slate-500">
                Credential active and monitored
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/doctors"
        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-hc-primary"
      >
        View Full Credentials
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function SecureExchangeCard() {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-hc-primary">
        Secure Data Exchange
      </h3>
      <div className="mt-5 flex gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full bg-hc-primary-bg text-hc-primary">
          <LockKeyhole className="size-8" />
        </div>
        <p className="text-xs leading-6 text-slate-600">
          All patient data is encrypted in transit and at rest. HIPAA-compliant
          infrastructure with end-to-end security.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[6px] border border-emerald-300 bg-hc-success-bg px-3 py-3 text-center text-xs font-semibold text-emerald-800">
          HIPAA Compliant
        </div>
        <div className="rounded-[6px] border border-hc-cyan bg-cyan-50 px-3 py-3 text-center text-xs font-semibold text-cyan-800">
          SOC 2 Type II
        </div>
      </div>
      <Link
        href="/security"
        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-hc-primary"
      >
        Security Details
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function MonitoringCard() {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-hc-primary">
        System Monitoring
      </h3>
      <div className="mt-5 space-y-5">
        <MonitorRow
          label="Uptime"
          value="99.99%"
          note="All Systems Operational"
        />
        <MonitorRow
          label="Transactions (24h)"
          value="42,384"
          note="+18.4% vs yesterday"
        />
        <MonitorRow
          label="Avg Response Time"
          value="120ms"
          note="15% vs yesterday"
        />
      </div>
      <Link
        href="/security"
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-hc-primary"
      >
        View System Status
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function HomeFooter() {
  const columns = [
    [
      "Departments",
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "Pediatrics",
      "Radiology",
    ],
    [
      "Doctors",
      "Find a Doctor",
      "Our Specialists",
      "Doctor Directory",
      "Consultations",
    ],
    ["News", "Hospital News", "Health Insights", "Events", "Press Releases"],
  ];

  return (
    <footer className="bg-[#020817] px-6 py-12 text-white lg:px-9">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.55fr_0.7fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[6px] border border-blue-400 text-blue-400">
              <Activity className="size-5" />
            </span>
            <span className="text-lg font-bold">HOSPITAL CORE</span>
          </div>
          <p className="mt-5 max-w-[310px] text-sm leading-6 text-slate-400">
            Engineering-grade healthcare platform for modern hospitals.
            Precision today, better outcomes tomorrow.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {columns.map(([title, ...links]) => (
            <div key={title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                {title}
              </h3>
              <div className="mt-5 space-y-3 text-sm text-slate-400">
                {links.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 border-l border-white/10 pl-8">
          <FooterAction
            href="/portal/login"
            icon={CircleUserRound}
            title="Patient Portal"
            text="Access your health information"
          />
          <FooterAction
            href="/staff/login"
            icon={LockKeyhole}
            title="Staff Login"
            text="Secure staff access"
          />
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1360px] flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>(c) 2024 HOSPITAL CORE. All rights reserved.</span>
        <span>Made with precision for clinical teams.</span>
      </div>
    </footer>
  );
}

function ValuePoint({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Activity;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-hc-primary-bg text-hc-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function SideStat({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[8px] border border-slate-200 p-4">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <div className="space-y-3 text-xs text-slate-600">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between gap-3">
            <span>{item}</span>
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterAction({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: typeof Activity;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-[8px] border border-white/10 p-4 transition hover:bg-white/5"
    >
      <div className="grid size-9 place-items-center rounded-[6px] border border-blue-400/50 text-blue-300">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
          {title}
        </div>
        <div className="mt-1 text-xs text-slate-400">{text}</div>
      </div>
    </Link>
  );
}

function QueueRow({
  name,
  status,
  time,
}: {
  name: string;
  status: string;
  time: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-[6px] bg-white/5 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-full bg-hc-cyan/18 text-[10px] text-cyan-200">
          {name.slice(0, 1)}
        </span>
        <span className="text-[11px] text-slate-200">{name}</span>
      </div>
      <span className="rounded-[4px] bg-hc-blue-500/20 px-2 py-1 text-[9px] font-bold uppercase text-cyan-200">
        {status}
      </span>
      <span className="text-[10px] text-slate-500">{time}</span>
    </div>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
      {children}
    </p>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-slate-600">{label}</span>
      <span className="mt-1 flex h-10 items-center justify-between rounded-[6px] border border-slate-200 bg-white px-3 text-slate-700">
        {value}
        <span className="text-slate-400">⌄</span>
      </span>
    </label>
  );
}

function MonitorRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-lg font-semibold text-slate-950">{value}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-hc-success">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {note}
      </div>
    </div>
  );
}

function Sparkline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 24L12 21L20 23L29 16L38 18L47 12L56 17L65 9L74 14L83 8L92 13L101 10L118 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniBars({ className }: { className?: string }) {
  return (
    <div className={`${className ?? ""} flex items-end gap-2`}>
      {[24, 42, 30, 54, 36, 48, 28, 58, 40, 50, 34, 62, 45, 56].map(
        (height, index) => (
          <span
            key={`${height}-${index}`}
            className="w-full rounded-t-[3px] bg-hc-cyan/80"
            style={{ height: `${height}px` }}
          />
        ),
      )}
    </div>
  );
}

function HeartbeatLine() {
  return (
    <svg
      className="absolute left-[18%] top-[31%] h-[160px] w-[56%] text-hc-cyan/70"
      viewBox="0 0 700 160"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 92H250L270 92L288 52L310 130L333 92H700"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="333" cy="92" r="4" fill="currentColor" />
    </svg>
  );
}
