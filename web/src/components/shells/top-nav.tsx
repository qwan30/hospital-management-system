"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, ShieldPlus } from "lucide-react";
import { filterNavigationLinks } from "@/lib/rbac";
import { useStoredRole } from "@/lib/use-stored-role";
import { cn } from "@/lib/utils";

export interface TopNavLink {
  label: string;
  href: string;
}

interface HcTopbarProps {
  links?: TopNavLink[];
  roleScope: "staff" | "patient";
  homeHref: string;
  alertHref: string;
  settingsHref: string;
  profileHref: string;
  userName: string;
  userRole: string;
  profileImageSrc?: string;
  alertCount?: number;
  alertLabel?: string;
  settingsLabel?: string;
  profileLabel?: string;
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

export const defaultAdminTopLinks: TopNavLink[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Departments", href: "/admin/departments" },
  { label: "Schedule", href: "/admin/appointments" },
  { label: "Rooms", href: "/admin/rooms" },
  { label: "Staff", href: "/admin/users" },
  { label: "Audit", href: "/admin/audit-logs" },
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function HcTopbar({
  links,
  roleScope,
  homeHref,
  alertHref,
  settingsHref,
  profileHref,
  userName,
  userRole,
  profileImageSrc,
  alertCount = 2,
  alertLabel = "Open notifications",
  settingsLabel = "Open settings",
  profileLabel = "Open profile",
}: HcTopbarProps) {
  const pathname = usePathname();
  const role = useStoredRole(roleScope);
  const navLinks = filterNavigationLinks(links || defaultStaffLinks, role);

  return (
    <header className="fixed inset-x-0 top-0 z-50 grid h-[var(--hc-topbar-h)] grid-cols-[minmax(0,1fr)_auto] items-center border-b border-white/10 bg-[var(--hc-navy-950)] px-4 text-white shadow-[0_10px_32px_rgba(6,23,53,0.22)] md:grid-cols-[var(--hc-sidebar-w)_minmax(0,1fr)_auto] md:px-7">
      <Link
        href={homeHref}
        className="flex min-w-0 items-center gap-3 text-[18px] font-bold leading-6 tracking-normal text-white"
        aria-label="Hospital Core home"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-white/15 bg-white/10 text-[var(--hc-blue-500)]">
          <ShieldPlus className="size-5" aria-hidden="true" />
        </span>
        <span className="truncate">HOSPITAL CORE</span>
      </Link>

      <nav className="hidden h-full min-w-0 items-stretch gap-4 lg:flex">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              data-active={isActive ? "true" : undefined}
              className={cn(
                "flex h-full items-center border-b-[3px] border-transparent px-2 text-sm font-semibold text-white/75 transition-colors duration-150 hover:text-white",
                isActive && "border-[var(--hc-blue-500)] text-white",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href={alertHref}
          className="relative grid size-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
          aria-label={alertLabel}
          title={alertLabel}
        >
          <Bell className="size-5" aria-hidden="true" />
          {alertCount > 0 ? (
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-[var(--hc-danger)] px-1 text-center text-[10px] font-bold leading-4 text-white ring-2 ring-[var(--hc-navy-950)]">
              {alertCount}
            </span>
          ) : null}
        </Link>
        <Link
          href={settingsHref}
          className="grid size-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
          aria-label={settingsLabel}
          title={settingsLabel}
        >
          <Settings className="size-5" aria-hidden="true" />
        </Link>
        <Link
          href={profileHref}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-white transition hover:bg-white/10"
          aria-label={profileLabel}
          title={profileLabel}
        >
          <span className="grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[13px] font-bold text-[var(--hc-navy-950)]">
            {profileImageSrc ? (
              <Image
                alt={userName}
                src={profileImageSrc}
                className="size-full object-cover"
                width={1200}
                height={800}
              />
            ) : (
              initialsFor(userName)
            )}
          </span>
          <span className="hidden text-left leading-tight xl:block">
            <span className="block text-sm font-bold">{userName}</span>
            <span className="block text-xs text-white/70">{userRole}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

export function StaffTopNav({ links, profileImageSrc }: StaffTopNavProps) {
  return (
    <HcTopbar
      links={links || defaultStaffLinks}
      roleScope="staff"
      homeHref="/staff/dashboard"
      alertHref="/staff/queue"
      settingsHref="/staff/schedule"
      profileHref="/staff/doctor/dashboard"
      userName="Staff Ops"
      userRole="Clinical team"
      profileImageSrc={profileImageSrc}
      alertLabel="Open staff alerts"
      settingsLabel="Open schedule settings"
      profileLabel="Open staff profile"
    />
  );
}

export function PortalTopNav({ links, profileImageSrc }: StaffTopNavProps) {
  return (
    <HcTopbar
      links={links || defaultPortalLinks}
      roleScope="patient"
      homeHref="/"
      alertHref="/portal/messages"
      settingsHref="/portal/profile#security-settings"
      profileHref="/portal/profile"
      userName="Patient"
      userRole="Verified portal"
      profileImageSrc={profileImageSrc}
      alertCount={1}
      alertLabel="Open notifications"
      settingsLabel="Open profile settings"
      profileLabel="Open patient profile"
    />
  );
}
