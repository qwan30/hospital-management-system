"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CircleHelp, LogOut, Menu, Search, Settings, ShieldPlus, User, X } from "lucide-react";
import { filterNavigationLinks, type AppRole } from "@/lib/rbac";
import { useStoredRole } from "@/lib/use-stored-role";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hc-theme") || "light";
    }
    return "light";
  });

  const applyTheme = (selectedTheme: string) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else if (selectedTheme === "light") {
      root.classList.remove("dark");
    } else {
      // System default
      if (typeof window.matchMedia === "function") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemPrefersDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } else {
        root.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("hc-theme") || "light";
    setTimeout(() => {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }, 0);
  }, []);
  const role = useStoredRole(roleScope);
  const defaultLinks = defaultLinksForScope(roleScope);
  const navLinks = showModuleNav ? filterNavigationLinks(links || defaultLinks, role) : [];
  const mobileNavLinks = filterNavigationLinks(mobileLinks || links || defaultLinks, role);
  const profile = profileForRole(role, roleScope, userName, userRole);
  void alertHref;
  void settingsHref;
  const effectiveAlertCount = alertCount ?? profile.alertCount;
  const hasMobileNavigation = mobileNavLinks.length > 0;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--hc-topbar-h)] items-center justify-between border-b border-border bg-[var(--hc-surface)] pl-4 pr-4 text-foreground md:left-[var(--hc-sidebar-w)] md:pl-7 md:pr-5">
      <div className="flex min-w-0 items-center gap-3">
        {hasMobileNavigation ? (
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
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
          className="flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] text-[16px] font-bold leading-6 tracking-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          aria-label="Hospital Core home"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-border bg-muted/50 text-[var(--hc-blue-500)]">
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
                    "relative flex h-full items-center px-2 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive && "border-b-[3px] border-b-[var(--hc-blue-500)] text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
        <div className="relative mr-6 w-64 xl:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            aria-label="Search across modules"
            type="text"
            placeholder="Search across modules..."
            className="h-9 w-full rounded-md border border-input bg-muted pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-[var(--hc-blue-500)] focus:bg-muted focus:outline-none"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger
              className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={alertLabel}
              title={alertLabel}
            >
              <Bell className="size-5" aria-hidden="true" />
              {effectiveAlertCount > 0 ? (
                <span className="absolute right-[6px] top-[7px] h-4 min-w-4 rounded-full bg-[var(--hc-danger)] px-1 text-center text-[10px] font-bold leading-4 text-white">
                  {effectiveAlertCount}
                </span>
              ) : null}
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] sm:w-[420px]">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {effectiveAlertCount > 0
                    ? `You have ${effectiveAlertCount} unread notification${effectiveAlertCount !== 1 ? "s" : ""}.`
                    : "No new notifications."}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-3">
                {effectiveAlertCount > 0 ? (
                  <>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">New patient admitted</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Patient #1042 has been admitted to Ward 4C. Please review the intake form.
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--hc-blue-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--hc-blue-600)]">New</span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">10 minutes ago</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">Lab results ready</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            CBC panel for Patient #88219 is available for review.
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--hc-blue-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--hc-blue-600)]">New</span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">1 hour ago</p>
                    </div>
                    <div className="rounded-lg border border-border p-4 opacity-60">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">Inventory alert</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Paracetamol 500mg stock below reorder threshold.
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">3 hours ago</p>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <Bell className="mx-auto size-10 text-muted-foreground/40" aria-hidden="true" />
                    <p className="mt-3 text-sm text-muted-foreground">All caught up!</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">No new notifications at this time.</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <button
            type="button"
            onClick={() => {
              setShowSettingsModal(true);
            }}
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={settingsLabel}
            title={settingsLabel}
          >
            <Settings className="size-5" aria-hidden="true" />
          </button>
          <Link
            href={supportHref || "/support"}
            className="hidden size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:grid"
            aria-label="Open support"
            title="Open support"
          >
            <CircleHelp className="size-5" aria-hidden="true" />
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:pr-3"
            aria-label={profileLabel}
            title={profileLabel}
          >
            <span className="grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--hc-surface-muted)] text-[13px] font-bold text-[var(--hc-primary)]">
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
              <span className="block text-sm font-bold leading-[18px] text-foreground">{profile.name}</span>
              <span className="block text-xs leading-[16px] text-muted-foreground">{profile.role}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                if (roleScope === "patient") {
                  router.push(profileHref);
                } else {
                  setShowProfileModal(true);
                }
              }}
            >
              <User className="size-4" aria-hidden="true" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => router.push(roleScope === "patient" ? "/portal/login" : "/staff/login")}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isMobileMenuOpen && hasMobileNavigation ? (
        <div
          id="hc-auth-mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--hc-topbar-h)] z-50 bg-black/20 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex max-h-full flex-col border-t border-border bg-[var(--hc-surface)] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Navigation
              </span>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-[var(--radius-md)] text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                      "flex min-h-12 items-center rounded-[var(--radius-md)] px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive && "bg-muted text-foreground ring-1 ring-border",
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-6 shadow-[var(--shadow-card)] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] transition"
              aria-label="Close profile"
            >
              <X className="size-5" />
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <span className="grid size-16 place-items-center overflow-hidden rounded-full bg-[var(--hc-primary-bg)] text-2xl font-bold text-[var(--hc-primary)] mb-4">
                {initialsFor(profile.name)}
              </span>
              <h3 className="text-xl font-bold text-[var(--hc-text)]">{profile.name}</h3>
              <p className="text-sm font-semibold text-[var(--hc-primary)] mt-1">{profile.role}</p>

              <div className="w-full mt-6 space-y-4 text-left border-t border-[var(--hc-border-soft)] pt-4">
                <div>
                  <span className="text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-wider block">Username / Email</span>
                  <span className="text-sm font-medium text-[var(--hc-text)]">
                    {role === "ADMIN" ? "admin@hospital.vn" :
                     role === "DOCTOR" ? "doctor1@hospital.vn" :
                     role === "NURSE" ? "nurse@hospital.vn" :
                     role === "RECEPTIONIST" ? "receptionist@hospital.vn" :
                     role === "PHARMACIST" ? "pharmacist@hospital.vn" :
                     role === "ACCOUNTANT" ? "accountant@hospital.vn" :
                     "staff@hospital.vn"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-wider block">Session Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--hc-success-bg)] text-[var(--hc-success)] uppercase mt-1">
                    <span className="size-1.5 rounded-full bg-[var(--hc-success)] animate-pulse" />
                    Active Session
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-wider block">Access Permissions</span>
                  <span className="text-xs font-medium text-[var(--hc-text-secondary)] mt-1 block">
                    {role === "ADMIN" ? "Full administrative access across clinical, billing, and system settings modules." : "Standard clinical and operational access within assigned department."}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="hc-button-primary w-full py-2.5 text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-[var(--hc-surface)] p-6 shadow-[var(--shadow-card)] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] transition"
              aria-label="Close settings"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold text-[var(--hc-text)] mb-4">User Settings</h3>

            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-[var(--hc-text)]">Auto-refresh Dashboard</label>
                  <p className="text-xs text-[var(--hc-text-secondary)]">Automatically reload data tables every 30s</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-[var(--hc-border)] text-[var(--hc-primary)] focus:ring-[var(--hc-primary)]"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[var(--hc-border-soft)] pt-4">
                <div>
                  <label className="text-sm font-bold text-[var(--hc-text)]">Desktop Notifications</label>
                  <p className="text-xs text-[var(--hc-text-secondary)]">Show notifications for urgent patient requests</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-[var(--hc-border)] text-[var(--hc-primary)] focus:ring-[var(--hc-primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[var(--hc-border-soft)] pt-4">
                <label className="text-sm font-bold text-[var(--hc-text)]">UI Theme</label>
                <select
                  className="hc-input h-9 text-xs mt-1"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2 rounded-md border border-[var(--hc-border)] bg-[var(--hc-surface)] text-xs font-bold text-[var(--hc-text)] hover:bg-[var(--hc-surface-soft)] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("hc-theme", theme);
                  applyTheme(theme);
                  alert("Settings saved successfully!");
                  setShowSettingsModal(false);
                }}
                className="flex-1 hc-button-primary py-2 text-center"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
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
      alertHref=""
      settingsHref="/staff/settings"
      supportHref="/staff/support"
      profileHref="/staff/profile"
      userName="Staff Ops"
      userRole="Clinical team"
      profileImageSrc={profileImageSrc}
      alertLabel="Open notifications"
      settingsLabel="Open settings"
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
      alertHref=""
      settingsHref="/portal/settings"
      supportHref="/portal/support"
      profileHref="/portal/profile"
      userName="Patient"
      userRole="Verified portal"
      profileImageSrc={profileImageSrc}
      alertCount={1}
      alertLabel="Open notifications"
      settingsLabel="Open settings"
      profileLabel="Open patient profile"
    />
  );
}
