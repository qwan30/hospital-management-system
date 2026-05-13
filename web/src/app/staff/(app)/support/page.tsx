import Link from "next/link";

const supportQueues = [
  ["Clinical application", "4 open", "Median response 8m"],
  ["Access and roles", "2 open", "Median response 12m"],
  ["Infrastructure", "1 open", "On-call active"],
];

export default function StaffSupportPage() {
  return (
    <div className="p-8 space-y-8">
      <header className="border-b-2 border-hms-surface-container-highest pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-hms-primary">
          Staff Support
        </p>
        <h1 className="mt-2 text-4xl font-light tracking-tight text-hms-on-surface">
          Operations Help Desk
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-hms-on-surface-variant">
          Route workflow issues, access requests, and production support needs to the
          correct operations queue.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {supportQueues.map(([title, count, detail]) => (
          <div key={title} className="bg-hms-surface-container-low p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
              {title}
            </p>
            <p className="mt-4 text-4xl font-light text-hms-primary-container">
              {count}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-hms-on-surface-variant">
              {detail}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-hms-surface-container-lowest p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-hms-on-surface-variant">
            Open Request
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <input
              aria-label="Station or staff ID"
              className="bg-hms-surface-container-low border-0 border-b-2 border-hms-outline px-4 py-3 text-sm outline-none focus:border-hms-primary focus:ring-0"
              placeholder="Station or staff ID"
              type="text"
            />
            <select
              aria-label="Support category"
              className="bg-hms-surface-container-low border-0 border-b-2 border-hms-outline px-4 py-3 text-sm outline-none focus:border-hms-primary focus:ring-0"
            >
              <option>Clinical application</option>
              <option>Access and roles</option>
              <option>Infrastructure</option>
            </select>
            <textarea
              aria-label="Support issue or request"
              className="min-h-32 bg-hms-surface-container-low border-0 border-b-2 border-hms-outline px-4 py-3 text-sm outline-none focus:border-hms-primary focus:ring-0 md:col-span-2"
              placeholder="Describe the issue or request"
            />
          </div>
          <button className="mt-6 inline-flex h-12 items-center bg-hms-primary-container px-8 text-sm font-semibold text-white hover:bg-hms-primary">
            Submit Request
          </button>
        </div>

        <aside className="bg-hms-on-background p-8 text-white">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-70">
            Critical Escalation
          </h2>
          <p className="mt-6 text-2xl font-light leading-tight">
            For patient-safety blocking issues, page the active clinical command desk.
          </p>
          <Link
            href="/staff/queue"
            className="mt-8 inline-flex h-12 items-center border border-white px-6 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-hms-on-background"
          >
            Open Queue Board
          </Link>
        </aside>
      </section>
    </div>
  );
}
