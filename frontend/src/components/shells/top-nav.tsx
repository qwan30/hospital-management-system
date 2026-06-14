"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleHelp, Menu, Search, Settings, ShieldPlus, X } from "lucide-react";
import { filterNavigationLinks, type AppRole } from "@/lib/rbac";
import { useStoredRole } from "@/lib/use-stored-role";
import { cn } from "@/lib/utils";

export interface TopNavLink {
  label: string;
  href: string;
}

interface HcTopbarProps {
  links?: TopNavLink[];
  mobileLinks?: TopNavLink[];
  showModuleNav?: boolean;
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
  mobileLinks?: TopNavLink[];
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

function defaultLinksForScope(roleScope: HcTopbarProps["roleScope"]) {
  return roleScope === "patient" ? defaultPortalLinks : defaultStaffLinks;
}

export function HcTopbar({
  links,
  mobileLinks,
  showModuleNav = false,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = useStoredRole(roleScope);
  const defaultLinks = defaultLinksForScope(roleScope);
  const navLinks = showModuleNav ? filterNavigationLinks(links || defaultLinks, role) : [];
  const mobileNavLinks = filterNavigationLinks(mobileLinks || links || defaultLinks, role);
  const profile = profileForRole(role, roleScope, userName, userRole);
  const effectiveAlertCount = alertCount ?? profile.alertCount;
  const hasMobileNavigation = mobileNavLinks.length > 0;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--hc-topbar-h)] items-center justify-between border-b border-white/10 bg-[var(--hc-navy-950)] pl-4 pr-4 text-white shadow-sm md:left-[var(--hc-sidebar-w)] md:pl-7 md:pr-5">
      <div className="flex min-w-0 items-center gap-3">
        {hasMobileNavigation ? (
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-white/10 text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)] md:hidden"
            aria-controls="hc-auth-mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        ) : null}
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] text-[16px] font-bold leading-6 tracking-normal text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)] md:hidden"
          aria-label="Hospital Core home"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-white/5 text-[var(--hc-blue-500)]">
            <ShieldPlus className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden shrink-0 whitespace-nowrap min-[430px]:inline">HOSPITAL CORE</span>
        </Link>
      </div>

      <div className="hidden h-full min-w-0 flex-1 items-center justify-end lg:flex">
        {navLinks.length > 0 ? (
          <nav className="mr-6 flex h-full items-stretch gap-[18px]" aria-label="Module navigation">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={isActive ? "true" : undefined}
                  className={cn(
                    "relative flex h-full items-center px-2 text-sm font-semibold text-white/75 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)]",
                    isActive && "border-b-[3px] border-b-[var(--hc-blue-500)] text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
        <div className="relative mr-6 w-64 xl:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
          <input
            aria-label="Search across modules"
            type="text"
            placeholder="Search across modules..."
            className="h-9 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-10 text-sm text-white placeholder:text-white/40 transition-colors focus:border-[var(--hc-blue-500)] focus:bg-white/10 focus:outline-none"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1">
          <Link
            href={alertHref}
            className="relative grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)]"
            aria-label={alertLabel}
            title={alertLabel}
          >
            <Bell className="size-5" aria-hidden="true" />
            {effectiveAlertCount > 0 ? (
              <span className="absolute right-[6px] top-[7px] h-4 min-w-4 rounded-full bg-[var(--hc-danger)] px-1 text-center text-[10px] font-bold leading-4 text-white">
                {effectiveAlertCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={settingsHref}
            className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)]"
            aria-label={settingsLabel}
            title={settingsLabel}
          >
            <Settings className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href={supportHref || "/support"}
            className="hidden size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)] sm:grid"
            aria-label="Open support"
            title="Open support"
          >
            <CircleHelp className="size-5" aria-hidden="true" />
          </Link>
        </div>

        <Link
          href={profileHref}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 text-white transition hover:bg-[var(--hc-navy-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)] sm:pr-3"
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

      {isMobileMenuOpen && hasMobileNavigation ? (
        <div
          id="hc-auth-mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--hc-topbar-h)] z-50 bg-slate-950/50 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex max-h-full flex-col border-t border-white/10 bg-[var(--hc-navy-950)] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                Navigation
              </span>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-[var(--radius-md)] text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)]"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav
              className="grid max-h-[calc(100vh-var(--hc-topbar-h)-96px)] gap-1 overflow-y-auto pb-4"
              aria-label="Mobile module navigation"
            >
              {mobileNavLinks.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(link.href + "/");

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={isActive ? "true" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-[var(--radius-md)] px-4 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hc-navy-950)]",
                      isActive && "bg-white/10 text-white ring-1 ring-white/15",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function StaffTopNav({ links, mobileLinks, profileImageSrc }: StaffTopNavProps) {
  return (
    <HcTopbar
      links={links || defaultStaffLinks}
      mobileLinks={mobileLinks || links || defaultStaffLinks}
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

export function PortalTopNav({ links, mobileLinks, profileImageSrc }: StaffTopNavProps) {
  return (
    <HcTopbar
      links={links || defaultPortalLinks}
      mobileLinks={mobileLinks || links || defaultPortalLinks}
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
