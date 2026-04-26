"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { filterNavigationLinks } from "@/lib/rbac";
import { useStoredRole } from "@/lib/use-stored-role";
import { cn } from "@/lib/utils";

interface SideNavLink {
  label: string;
  href: string;
  icon: string;
}

interface StaffSideNavProps {
  title?: string;
  subtitle?: string;
  links?: SideNavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

const defaultLinks: SideNavLink[] = [
  { label: "Overview", href: "/staff/dashboard", icon: "dashboard" },
  { label: "Patient Records", href: "/staff/patients", icon: "assignment" },
  { label: "Queue Board", href: "/staff/queue", icon: "format_list_numbered" },
  { label: "Scheduling", href: "/staff/schedule", icon: "calendar_today" },
  { label: "Appointments", href: "/staff/booking", icon: "event_available" },
  { label: "Inventory", href: "/staff/inventory", icon: "inventory_2" },
  { label: "Diagnostics", href: "/staff/lab-results", icon: "biotech" },
  { label: "Billing", href: "/staff/invoices", icon: "payments" },
];

export function StaffSideNav({
  title = "Clinical Suite",
  subtitle = "Standard Access",
  links,
  ctaLabel = "Admit Patient",
  ctaHref = "/staff/booking",
}: StaffSideNavProps) {
  const pathname = usePathname();
  const role = useStoredRole("staff");
  const navLinks = filterNavigationLinks(links || defaultLinks, role);

  return (
    <aside className="fixed left-0 top-[48px] bottom-0 hidden md:flex flex-col w-64 bg-[#f4f4f4] border-r-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-hms-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-hms-on-surface-variant">
              account_circle
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-normal text-hms-on-surface">
              {title}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-hms-on-surface-variant">
              {subtitle}
            </div>
          </div>
        </div>
        <Link
          href={ctaHref}
          className="w-full bg-hms-primary-container text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-hms-primary transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {ctaLabel}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center h-[48px] px-6 text-sm font-medium transition-all duration-75",
                isActive
                  ? "bg-white text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-200"
              )}
            >
              <span className="material-symbols-outlined mr-3">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-hms-surface-container">
        <Link
          href="/staff/support"
          className="text-gray-700 hover:bg-gray-200 flex items-center h-[48px] px-6 text-sm font-medium transition-all"
        >
          <span className="material-symbols-outlined mr-3">help</span>
          Support
        </Link>
        <Link
          href="/auth/logout"
          className="text-gray-700 hover:bg-gray-200 flex items-center h-[48px] px-6 text-sm font-medium transition-all"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          Logout
        </Link>
      </div>
    </aside>
  );
}

export function PortalSideNav({
  title = "Clinical Suite",
  subtitle = "Standard Access",
  links,
  ctaLabel = "Book Appointment",
  ctaHref = "/booking",
}: StaffSideNavProps) {
  const pathname = usePathname();
  const role = useStoredRole("patient");
  const navLinks = filterNavigationLinks(links || [
    { label: "Overview", href: "/portal/overview", icon: "dashboard" },
    { label: "Electronic Records", href: "/portal/records", icon: "assignment" },
    { label: "Appointments", href: "/portal/appointments", icon: "calendar_today" },
    { label: "Pharmacy", href: "/portal/pharmacy", icon: "medical_services" },
    { label: "Lab Results", href: "/portal/lab-results", icon: "biotech" },
    { label: "Billing", href: "/portal/billing", icon: "payments" },
    { label: "Messages", href: "/portal/messages", icon: "mail" },
    { label: "Profile", href: "/portal/profile", icon: "account_circle" },
  ], role);

  return (
    <aside className="fixed left-0 top-[48px] bottom-0 hidden md:flex flex-col w-64 bg-[#f4f4f4] dark:bg-[#262626] border-r-0 rounded-none text-sm font-medium tracking-normal">
      <div className="p-6 flex flex-col gap-1">
        <h2 className="text-hms-on-surface font-semibold text-base">{title}</h2>
        <p className="text-hms-on-surface-variant text-xs">{subtitle}</p>
      </div>
      <nav className="flex-1">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center h-[48px] px-4 transition-all duration-75",
                isActive
                  ? "bg-white dark:bg-[#393939] text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <span className="material-symbols-outlined mr-3">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-6 border-t border-hms-outline-variant/10">
        <Link
          href={ctaHref}
          className="w-full bg-hms-primary-container text-white h-12 flex items-center justify-center gap-2 font-semibold hover:bg-hms-primary transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          {ctaLabel}
        </Link>
      </div>
      <div className="mt-auto pb-4">
        <Link
          href="/portal/support"
          className="text-gray-500 flex items-center h-[40px] px-4 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined mr-3">help</span>
          Support
        </Link>
        <Link
          href="/portal/login"
          className="text-gray-500 flex items-center h-[40px] px-4 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          Logout
        </Link>
      </div>
    </aside>
  );
}
