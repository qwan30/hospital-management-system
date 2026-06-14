const sections = [
  {
    title: "Access Control",
    body: "Protected workspaces require authenticated sessions and role checks before showing staff, admin, or patient-specific data.",
  },
  {
    title: "Audit Logging",
    body: "Sensitive operational actions are recorded so administrators can investigate access changes, queue actions, release-demo activity, and support escalations.",
  },
  {
    title: "Encryption And Session Safety",
    body: "The application is designed for HTTPS deployments, secure cookies or bearer sessions, and least-privilege API responses that expose only required fields.",
  },
  {
    title: "Incident Reporting",
    body: "Suspicious access, incorrect permissions, or suspected record exposure should be reported immediately to hospital operations and security administrators.",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-hc-surface px-6 py-24 text-hc-text">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-hc-primary">
          Security Audit
        </p>
        <h1 className="mb-6 text-4xl font-light tracking-tight sm:text-5xl">
          Security Controls
        </h1>
        <p className="max-w-3xl text-sm font-medium leading-7 text-hc-text-secondary">
          Hospital Core protects clinical and operational workspaces with
          authenticated access, role-aware route guards, audit trails, and
          careful data exposure for patient-facing routes.
        </p>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[var(--radius-lg)] border border-[var(--hc-border-soft)] bg-white p-6 shadow-sm"
            >
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--hc-text)]">
                {section.title}
              </h2>
              <p className="text-sm font-medium leading-7 text-hc-text-secondary">
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
