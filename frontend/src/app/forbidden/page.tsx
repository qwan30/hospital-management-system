import Link from "next/link";

import { HcIcon } from "@/components/ui/hc-icon";
export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-hc-surface text-hc-on-surface flex items-center justify-center p-8">
      <section className="w-full max-w-lg border border-hc-outline-variant bg-hc-surface-container-lowest p-8">
        <div className="flex items-center gap-3">
          <HcIcon name="lock" className="text-hc-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        </div>
        <p className="mt-4 text-sm text-hc-on-surface-variant">
          Your current role is not authorized to open this workspace.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/staff/login"
            className="bg-hc-primary-container px-4 py-3 text-sm font-semibold text-white"
          >
            Staff login
          </Link>
          <Link
            href="/portal/login"
            className="bg-hc-surface-container px-4 py-3 text-sm font-semibold text-hc-on-surface"
          >
            Patient login
          </Link>
        </div>
      </section>
    </main>
  );
}
