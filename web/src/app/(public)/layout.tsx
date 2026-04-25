"use client";

import { PublicTopNav } from "@/components/shells/public-top-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hms-surface text-hms-on-surface min-h-screen antialiased">
      <PublicTopNav />
      <main className="pt-[48px]">{children}</main>
      {/* Footer Shell - not fixed for public pages */}
      <footer className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 w-full min-h-[48px] bg-[#161616] text-[11px] font-semibold uppercase tracking-widest text-gray-500 mt-auto">
        <div className="text-white">
          © 2024 HOSPITAL MANAGEMENT SYSTEM | ARCHITECTURAL PRECISION
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <a
            className="hover:text-white transition-colors"
            href="/privacy"
          >
            Privacy Policy
          </a>
          <a
            className="hover:text-white transition-colors"
            href="/terms"
          >
            Terms of Service
          </a>
          <a
            className="hover:text-white transition-colors"
            href="/security"
          >
            Security Audit
          </a>
        </div>
      </footer>
    </div>
  );
}
