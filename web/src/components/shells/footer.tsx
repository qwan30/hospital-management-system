import Link from "next/link";

export function HmsFooter() {
  return (
    <footer className="min-h-[48px] bg-[var(--hc-navy-950)] flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-white">
        © 2024 HOSPITAL MANAGEMENT SYSTEM | ARCHITECTURAL PRECISION
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <Link
          href="/privacy"
          className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          Terms of Service
        </Link>
        <Link
          href="/security"
          className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          Security Audit
        </Link>
      </div>
    </footer>
  );
}
