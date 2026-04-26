import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-hms-surface text-hms-on-surface flex items-center justify-center p-8">
      <section className="w-full max-w-lg border border-hms-outline-variant bg-hms-surface-container-lowest p-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-hms-primary">lock</span>
          <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        </div>
        <p className="mt-4 text-sm text-hms-on-surface-variant">
          Your current role is not authorized to open this workspace.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/staff/login"
            className="bg-hms-primary-container px-4 py-3 text-sm font-semibold text-white"
          >
            Staff login
          </Link>
          <Link
            href="/portal/login"
            className="bg-hms-surface-container px-4 py-3 text-sm font-semibold text-hms-on-surface"
          >
            Patient login
          </Link>
        </div>
      </section>
    </main>
  );
}
