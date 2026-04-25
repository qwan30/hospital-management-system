"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <header className="fixed top-0 left-0 right-0 z-50 flex px-3 sm:px-4 h-[48px] bg-[#161616] items-center font-sans antialiased tracking-tight">
      <div className="flex items-center gap-3 md:gap-8 w-full min-w-0">
        <Link
          href="/"
          className="shrink-0 text-base sm:text-lg font-semibold tracking-tighter text-white uppercase"
        >
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
                className={cn(
                  "h-full flex items-center px-4 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "text-white border-b-2 border-blue-600"
                    : "text-gray-400 hover:bg-gray-800"
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
            className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
          >
            Patient Portal
          </Link>
          <Link
            href="/staff/login"
            className="shrink-0 bg-hms-primary-container text-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold hover:bg-hms-primary transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </header>
  );
}
