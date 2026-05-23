const sections = [
  {
    title: "Data We Collect",
    body: "Hospital Core stores information needed to identify patients, schedule appointments, deliver care, process billing references, and keep clinical records accurate.",
  },
  {
    title: "How Data Is Used",
    body: "Data is used for care coordination, patient portal access, appointment preparation, operational reporting, support requests, and legally required audit activity.",
  },
  {
    title: "Retention And Access",
    body: "Clinical and operational records are retained according to hospital policy and applicable law. Access is limited by role, session scope, and patient relationship.",
  },
  {
    title: "Patient Rights And Contact",
    body: "Patients may ask the hospital privacy office for record access, correction guidance, portal support, and questions about how their information is handled.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-hc-surface px-6 py-24 text-hc-text">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-hc-primary">
          Patient Data
        </p>
        <h1 className="mb-6 text-4xl font-light tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="max-w-3xl text-sm font-medium leading-7 text-hc-text-secondary">
          Hospital Core limits patient and staff data to verified users, care
          teams, and operational workflows required to provide clinical service.
          Sensitive records are protected through role-based access, audit logs,
          and secure communication channels.
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
