const sections = [
  {
    title: "Portal Usage",
    body: "The portal supports appointment review, medical record access, billing references, support guidance, and care-team communication for verified users.",
  },
  {
    title: "Clinical Limitations",
    body: "Portal content is not emergency guidance and does not replace direct evaluation by a clinician. Urgent symptoms should be escalated through hospital emergency channels.",
  },
  {
    title: "User Responsibilities",
    body: "Users must keep credentials secure, provide accurate contact information, and report suspicious access or incorrect record details to hospital staff.",
  },
  {
    title: "Escalation And Support",
    body: "Questions about appointments, access, billing references, or care instructions should be routed through the support center or the hospital reception desk.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-hc-surface px-6 py-24 text-hc-text">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-hc-primary">
          Portal Use
        </p>
        <h1 className="mb-6 text-4xl font-light tracking-tight sm:text-5xl">
          Terms of Service
        </h1>
        <p className="max-w-3xl text-sm font-medium leading-7 text-hc-text-secondary">
          Hospital Core provides digital access to selected hospital services and
          records. The service is intended for verified patients, authorized
          staff, and operational users working inside approved hospital workflows.
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
