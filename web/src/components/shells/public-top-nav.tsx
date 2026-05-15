"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShieldPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Departments", href: "/departments" },
  { label: "Doctors", href: "/doctors" },
  { label: "News", href: "/news" },
  { label: "Book Appointment", href: "/booking" },
];

export function PublicTopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[64px] items-center border-b border-white/10 bg-[var(--hc-navy-950)]/95 px-4 font-sans antialiased shadow-[0_12px_40px_rgba(6,23,53,0.26)] backdrop-blur md:px-6">
      <div className="flex min-w-0 w-full items-center gap-4 md:gap-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-base font-bold text-white uppercase"
        >
          <span className="grid size-9 place-items-center rounded-[10px] border border-white/15 bg-white/10 text-[var(--hc-blue-500)]">
            <ShieldPlus className="size-5" aria-hidden="true" />
          </span>
          HOSPITAL CORE
        </Link>
        <nav className="hidden md:flex h-full items-center">
          {publicLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={isActive ? "true" : undefined}
                className={cn(
                  "flex h-full items-center px-4 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "border-b-[3px] border-[var(--hc-blue-500)] text-white"
                    : "text-slate-300 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
          <Link
            href="/portal/login"
            className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-white sm:inline-flex"
          >
            Patient Portal
          </Link>
          <Link
            href="/staff/login"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-blue-600)] px-4 text-xs font-bold text-white shadow-[var(--shadow-blue)] transition hover:bg-[var(--hc-blue-700)] sm:text-sm"
          >
            Staff Login
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
