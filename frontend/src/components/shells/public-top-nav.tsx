"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowRight, ChevronDown, Menu, UserRound, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[64px] items-center border-b border-border bg-white px-4 font-sans antialiased text-foreground md:px-6">
      <div className="flex min-w-0 w-full items-center gap-4 md:gap-8">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          aria-controls="hc-public-mobile-menu"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close public navigation" : "Open public navigation"}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          {isMobileMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] text-[16px] font-bold uppercase leading-6 tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-[18px]"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-border bg-muted/50 text-[var(--hc-blue-500)]">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span className="shrink-0 whitespace-nowrap">HOSPITAL CORE</span>
        </Link>

        {/* Desktop nav links */}
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
                  "flex h-full items-center px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-b-[3px] border-[var(--hc-blue-500)] text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right-side CTA */}
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
          <Link
            href="/portal/login"
            className="hidden rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
          >
            Patient Portal
          </Link>
          <Link
            href="/staff/login"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-blue-600)] px-4 text-xs font-bold text-white shadow-[var(--shadow-blue)] transition hover:bg-[var(--hc-blue-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-sm"
          >
            <UserRound className="size-3.5" aria-hidden="true" />
            Staff Login
            {pathname === "/booking" ? (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-3.5" aria-hidden="true" />
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen ? (
        <div
          id="hc-public-mobile-menu"
          className="fixed inset-x-0 top-[64px] z-50 border-t border-border bg-white px-4 py-4 shadow-2xl md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Public mobile navigation"
        >
          <nav className="grid gap-1" aria-label="Public mobile links">
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
                    "flex min-h-12 items-center rounded-[var(--radius-md)] px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isActive && "bg-muted text-foreground ring-1 ring-border",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border pt-3 min-[420px]:grid-cols-2">
              <Link
                href="/portal/login"
                className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-border px-4 text-sm font-bold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Patient Portal
              </Link>
              <Link
                href="/staff/login"
                className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--hc-blue-600)] px-4 text-sm font-bold text-white shadow-[var(--shadow-blue)] transition hover:bg-[var(--hc-blue-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Staff Login
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
