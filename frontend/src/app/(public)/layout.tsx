"use client";

import { usePathname } from "next/navigation";
import { PublicTopNav } from "@/components/shells/public-top-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showCompactFooter = pathname !== "/";

  return (
    <div className="min-h-screen bg-hc-surface text-hc-on-surface antialiased">
      <PublicTopNav />
      <main className="pt-[64px]">{children}</main>
      {showCompactFooter ? (
        <footer className="mt-auto flex min-h-[48px] w-full flex-col gap-3 border-t border-border bg-white px-4 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="text-foreground">
            (c) 2024 HOSPITAL CORE | ARCHITECTURAL PRECISION
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <a className="transition-colors hover:text-foreground" href="/privacy">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-foreground" href="/terms">
              Terms of Service
            </a>
            <a className="transition-colors hover:text-foreground" href="/security">
              Security Audit
            </a>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
