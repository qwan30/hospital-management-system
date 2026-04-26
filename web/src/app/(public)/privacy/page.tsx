export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-hms-surface px-6 py-20 text-hms-on-surface">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-hms-primary">
          Patient Data
        </p>
        <h1 className="mb-6 text-5xl font-light tracking-tight">
          Privacy Policy
        </h1>
        <p className="max-w-2xl text-sm font-medium leading-7 text-hms-on-surface-variant">
          Hospital Management System limits portal data to verified users, care
          teams, and operational workflows required to provide clinical service.
          Sensitive records are handled through role-based access, audit logs,
          and secure patient communication channels.
        </p>
      </div>
    </main>
  );
}
