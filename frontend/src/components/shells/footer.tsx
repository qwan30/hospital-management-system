import Link from "next/link";

export function HmsFooter() {
  return (
    <footer className="min-h-[48px] border-t border-border bg-white flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        © 2024 HOSPITAL MANAGEMENT SYSTEM | ARCHITECTURAL PRECISION
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <Link
          href="/privacy"
          className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Terms of Service
        </Link>
        <Link
          href="/security"
          className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Security Audit
        </Link>
      </div>
    </footer>
  );
}
