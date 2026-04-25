import Link from "next/link";

export function HmsFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[48px] bg-[#161616] flex items-center justify-between px-8 z-50">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-white">
        © 2024 HOSPITAL MANAGEMENT SYSTEM | ARCHITECTURAL PRECISION
      </div>
      <div className="flex gap-8">
        <Link
          href="/privacy"
          className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          Terms of Service
        </Link>
        <Link
          href="/security"
          className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          Security Audit
        </Link>
      </div>
    </footer>
  );
}
