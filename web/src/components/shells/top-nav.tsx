"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TopNavLink {
  label: string;
  href: string;
}

interface StaffTopNavProps {
  links?: TopNavLink[];
  profileImageSrc?: string;
}

const defaultStaffLinks: TopNavLink[] = [
  { label: "Dashboard", href: "/staff/dashboard" },
  { label: "Patients", href: "/staff/patients" },
  { label: "Queue", href: "/staff/queue" },
  { label: "Schedule", href: "/staff/schedule" },
  { label: "Inventory", href: "/staff/inventory" },
  { label: "Finance", href: "/staff/invoices" },
];

const defaultPortalLinks: TopNavLink[] = [
  { label: "Dashboard", href: "/portal/overview" },
  { label: "Appointments", href: "/portal/appointments" },
  { label: "Lab Results", href: "/portal/lab-results" },
  { label: "Messages", href: "/portal/messages" },
  { label: "Profile", href: "/portal/profile" },
];

export function StaffTopNav({ links, profileImageSrc }: StaffTopNavProps) {
  const pathname = usePathname();
  const navLinks = links || defaultStaffLinks;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex px-4 h-[48px] bg-[#161616] items-center">
      <Link
        href="/staff/dashboard"
        className="text-lg font-semibold tracking-tighter text-white uppercase font-sans antialiased"
      >
        HOSPITAL CORE
      </Link>
      <nav className="hidden md:flex h-full ml-12">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
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
      <div className="ml-auto flex items-center gap-4">
        <Link
          href="/staff/queue"
          className="text-gray-400 hover:text-white p-2 transition-colors"
          aria-label="Open staff alerts"
          title="Alerts"
        >
          <span className="material-symbols-outlined block">notifications</span>
        </Link>
        <Link
          href="/staff/schedule"
          className="text-gray-400 hover:text-white p-2 transition-colors"
          aria-label="Open schedule settings"
          title="Schedule settings"
        >
          <span className="material-symbols-outlined block">settings</span>
        </Link>
        <Link
          href="/staff/doctor/dashboard"
          className="w-8 h-8 bg-hms-surface-container-highest flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
          aria-label="Open staff profile"
          title="Staff profile"
        >
          {profileImageSrc ? (
            <Image
              alt="Administrator Profile"
              src={profileImageSrc}
              className="w-full h-full object-cover"
              width={1200}
              height={800}
            />
          ) : (
            <span className="material-symbols-outlined text-hms-on-surface-variant text-sm">
              account_circle
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function PortalTopNav({ links, profileImageSrc }: StaffTopNavProps) {
  const pathname = usePathname();
  const navLinks = links || defaultPortalLinks;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex px-4 h-[48px] bg-[#161616] items-center border-b-0 font-sans antialiased tracking-tight">
      <div className="flex items-center gap-8 w-full">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tighter text-white uppercase"
          aria-label="Back to home"
        >
          HOSPITAL CORE
        </Link>
        <nav className="hidden md:flex h-full items-center">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "h-full flex items-center px-4 transition-colors duration-150",
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
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/portal/messages"
            className="relative text-white hover:bg-gray-800 p-2 transition-colors"
            aria-label="Open notifications"
            title="Notifications"
          >
            <span className="material-symbols-outlined block">
              notifications
            </span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 bg-blue-500 ring-2 ring-[#161616]" />
          </Link>
          <Link
            href="/portal/profile#security-settings"
            className="text-white hover:bg-gray-800 p-2 transition-colors"
            aria-label="Open profile settings"
            title="Settings"
          >
            <span className="material-symbols-outlined block">settings</span>
          </Link>
          <Link
            href="/portal/profile"
            className="w-8 h-8 bg-hms-surface-container-highest overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all"
            aria-label="Open patient profile"
            title="Profile"
          >
            {profileImageSrc ? (
              <Image
                alt="Patient profile"
                src={profileImageSrc}
                className="w-full h-full object-cover"
                width={1200}
                height={800}
              />
            ) : (
              <span className="material-symbols-outlined text-hms-on-surface-variant">
                account_circle
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
