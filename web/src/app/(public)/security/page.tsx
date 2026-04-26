export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-hms-surface px-6 py-20 text-hms-on-surface">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-hms-primary">
          Security Audit
        </p>
        <h1 className="mb-6 text-5xl font-light tracking-tight">
          Security Controls
        </h1>
        <p className="max-w-2xl text-sm font-medium leading-7 text-hms-on-surface-variant">
          Protected clinical workspaces use authenticated access, role checks,
          audit logging, and least-privilege data exposure. Patient-facing routes
          are designed to show only the record context appropriate for the active
          portal account.
        </p>
      </div>
    </main>
  );
}
