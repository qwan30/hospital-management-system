"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleHelp, Search, Settings, ShieldPlus } from "lucide-react";
import { filterNavigationLinks, type AppRole } from "@/lib/rbac";
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
  supportHref?: string;
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

function profileForRole(
  role: AppRole | null,
  roleScope: HcTopbarProps["roleScope"],
  fallbackName: string,
  fallbackRole: string,
) {
  const profiles: Partial<Record<AppRole, { name: string; role: string; alertCount: number }>> = {
    ADMIN: { name: "Admin Ops", role: "Administrator", alertCount: 3 },
    DOCTOR: { name: "Dr. Rivera", role: "Cardiology", alertCount: 3 },
    NURSE: { name: "Nurse Sarah Chen", role: "Shift Lead - Ward 4C", alertCount: 3 },
    RECEPTIONIST: { name: "Reception Desk", role: "Front Office", alertCount: 2 },
    PHARMACIST: { name: "Pharmacy Desk", role: "Inventory Control", alertCount: 3 },
    ACCOUNTANT: { name: "Finance Ops", role: "Accounting", alertCount: 3 },
    PATIENT: { name: "Nguyen Thi Hoa", role: "Patient", alertCount: 1 },
  };

  return (
    (role ? profiles[role] : undefined) || {
      name: fallbackName || (roleScope === "patient" ? "Patient" : "Staff Ops"),
      role: fallbackRole || (roleScope === "patient" ? "Verified portal" : "Clinical team"),
      alertCount: roleScope === "patient" ? 1 : 2,
    }
  );
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
  alertCount,
  alertLabel = "Open notifications",
  settingsLabel = "Open settings",
  profileLabel = "Open profile",
  supportHref,
}: HcTopbarProps) {
  const pathname = usePathname();
  const role = useStoredRole(roleScope);
  const navLinks = filterNavigationLinks(links || defaultStaffLinks, role);
  const profile = profileForRole(role, roleScope, userName, userRole);
  const effectiveAlertCount = alertCount ?? profile.alertCount;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--hc-topbar-h)] items-center justify-between border-b border-white/10 bg-[var(--hc-navy-950)] pl-7 pr-5 text-white shadow-sm md:left-[var(--hc-sidebar-w)]">
      <div className="flex items-center gap-4">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-3 text-[18px] font-bold leading-6 tracking-normal text-white md:hidden"
          aria-label="Hospital Core home"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-white/5 text-[var(--hc-blue-500)]">
            <ShieldPlus className="size-5" aria-hidden="true" />
          </span>
          <span className="shrink-0 whitespace-nowrap">HOSPITAL CORE</span>
        </Link>
      </div>

      <div className="hidden h-full min-w-0 flex-1 items-center justify-between lg:flex">
        <nav className="flex h-full items-stretch gap-[18px]">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={isActive ? "true" : undefined}
                className={cn(
                  "relative flex h-full items-center px-2 text-sm font-semibold text-white/75 transition-colors duration-150 hover:text-white",
                  isActive && "text-white border-b-[3px] border-b-[var(--hc-blue-500)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="relative mr-6 w-64 xl:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search across modules..."
            className="h-9 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-10 text-sm text-white placeholder:text-white/40 transition-colors focus:border-[var(--hc-blue-500)] focus:bg-white/10 focus:outline-none"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50">
            ⌘/
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Link
            href={alertHref}
            className="relative grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label={alertLabel}
            title={alertLabel}
          >
            <Bell className="size-5" aria-hidden="true" />
            {effectiveAlertCount > 0 ? (
              <span className="absolute right-[6px] top-[7px] min-w-4 h-4 px-1 rounded-full bg-[var(--hc-danger)] text-center text-[10px] font-bold leading-4 text-white">
                {effectiveAlertCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={settingsHref}
            className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label={settingsLabel}
            title={settingsLabel}
          >
            <Settings className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href={supportHref || "/support"}
            className="hidden size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:grid"
            aria-label="Open support"
            title="Open support"
          >
            <CircleHelp className="size-5" aria-hidden="true" />
          </Link>
        </div>

        <Link
          href={profileHref}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-white transition hover:bg-[var(--hc-navy-900)]"
          aria-label={profileLabel}
          title={profileLabel}
        >
          <span className="grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--hc-surface-muted)] text-[13px] font-bold text-[var(--hc-navy-950)]">
            {profileImageSrc ? (
              <Image
                alt={profile.name}
                src={profileImageSrc}
                className="size-full object-cover"
                width={1200}
                height={800}
              />
            ) : (
              initialsFor(profile.name)
            )}
          </span>
          <span className="hidden text-left xl:block">
            <span className="block text-sm font-bold leading-[18px] text-white">{profile.name}</span>
            <span className="block text-xs leading-[16px] text-white/70">{profile.role}</span>
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
      supportHref="/staff/support"
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
      supportHref="/portal/support"
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
