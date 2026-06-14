"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX,
  CircleHelp,
  ClipboardList,
  DollarSign,
  DoorOpen,
  Headphones,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListOrdered,
  LogOut,
  Mail,
  Microscope,
  MonitorCog,
  Newspaper,
  Package,
  Pill,
  Plus,
  ReceiptText,
  ShieldPlus,
  Stethoscope,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { filterNavigationLinks, getRouteDecision } from "@/lib/rbac";
import { useStoredRole } from "@/lib/use-stored-role";
import { cn } from "@/lib/utils";

export interface SideNavLink {
  label: string;
  href: string;
  icon?: string;
}

interface HcSidebarProps {
  title?: string;
  subtitle?: string;
  roleScope: "staff" | "patient";
  links?: SideNavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  supportHref?: string;
  supportLabel?: string;
  logoutHref?: string;
  statusTitle?: string;
  statusDescription?: string;
}

interface StaffSideNavProps {
  title?: string;
  subtitle?: string;
  links?: SideNavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

const iconMap: Record<string, LucideIcon> = {
  account_circle: UserRound,
  activity: Activity,
  apartment: Building2,
  assignment: ClipboardList,
  badge: BadgeCheck,
  biotech: Microscope,
  calendar_today: CalendarDays,
  contact_support: Headphones,
  dashboard: LayoutDashboard,
  dollar_sign: DollarSign,
  event_available: CalendarCheck,
  event_busy: CalendarX,
  event_repeat: CalendarClock,
  format_list_numbered: ListOrdered,
  help: CircleHelp,
  history: History,
  inventory_2: Package,
  mail: Mail,
  medical_services: Stethoscope,
  meeting_room: DoorOpen,
  newspaper: Newspaper,
  payments: WalletCards,
  pill: Pill,
  receipt_long: ReceiptText,
  support: LifeBuoy,
  users: Users,
  view_timeline: MonitorCog,
};

export const defaultStaffSideLinks: SideNavLink[] = [
  { label: "Overview", href: "/staff/dashboard", icon: "dashboard" },
  { label: "Patient Records", href: "/staff/patients", icon: "assignment" },
  { label: "Queue Board", href: "/staff/queue", icon: "format_list_numbered" },
  { label: "Scheduling", href: "/staff/schedule", icon: "calendar_today" },
  { label: "Appointments", href: "/staff/booking", icon: "event_available" },
  { label: "Inventory", href: "/staff/inventory", icon: "inventory_2" },
  { label: "Diagnostics", href: "/staff/lab-results", icon: "biotech" },
  { label: "Billing", href: "/staff/invoices", icon: "payments" },
];

export const defaultPortalSideLinks: SideNavLink[] = [
  { label: "Overview", href: "/portal/overview", icon: "dashboard" },
  { label: "Electronic Records", href: "/portal/records", icon: "assignment" },
  { label: "Appointments", href: "/portal/appointments", icon: "calendar_today" },
  { label: "Pharmacy", href: "/portal/pharmacy", icon: "medical_services" },
  { label: "Lab Results", href: "/portal/lab-results", icon: "biotech" },
  { label: "Billing", href: "/portal/billing", icon: "payments" },
  { label: "Messages", href: "/portal/messages", icon: "mail" },
  { label: "Profile", href: "/portal/profile", icon: "account_circle" },
];

export const defaultAdminSideLinks: SideNavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/departments", label: "Departments", icon: "apartment" },
  { href: "/admin/appointments", label: "Appointments", icon: "calendar_today" },
  { href: "/admin/schedule-templates", label: "Templates", icon: "event_repeat" },
  { href: "/admin/special-closures", label: "Closures", icon: "event_busy" },
  { href: "/admin/slots", label: "Slots", icon: "view_timeline" },
  { href: "/admin/rooms", label: "Rooms", icon: "meeting_room" },
  { href: "/admin/users", label: "Staff", icon: "badge" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/admin/pricing", label: "Pricing", icon: "dollar_sign" },
  { href: "/admin/monitoring", label: "Monitoring", icon: "activity" },
  { href: "/admin/support", label: "Support", icon: "contact_support" },
  { href: "/admin/news", label: "News", icon: "newspaper" },
  { href: "/admin/public-content", label: "Content", icon: "receipt_long" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "history" },
];

function iconFor(icon?: string) {
  if (!icon) {
    return ClipboardList;
  }

  return iconMap[icon] || ClipboardList;
}

export function HcSidebar({
  title = "Clinical Suite",
  subtitle = "Standard Access",
  roleScope,
  links,
  ctaLabel,
  ctaHref,
  supportHref,
  supportLabel = "Support",
  logoutHref,
  statusTitle = "System status",
  statusDescription = "Core services online",
}: HcSidebarProps) {
  const pathname = usePathname();
  const role = useStoredRole(roleScope);
  const navLinks = filterNavigationLinks(links || defaultStaffSideLinks, role);
  const canUseCta = ctaHref ? getRouteDecision(ctaHref, role).allowed : false;

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-50 hidden w-[var(--hc-sidebar-w)] flex-col border-r border-[var(--hc-border)] bg-[var(--hc-sidebar-bg)] md:flex">
      <div className="flex h-[var(--hc-topbar-h)] items-center px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 text-[18px] font-bold leading-6 tracking-normal text-[var(--hc-text)]"
          aria-label="Hospital Core home"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[var(--hc-border)] bg-[var(--hc-surface-soft)] text-[var(--hc-blue-600)]">
            <ShieldPlus className="size-5" aria-hidden="true" />
          </span>
          <span className="shrink-0 whitespace-nowrap">HOSPITAL CORE</span>
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-[18px] pb-[22px]">
        <div className="mb-[18px] flex items-center gap-3">
          <div className="grid size-[54px] shrink-0 place-items-center rounded-[var(--radius-lg)] border border-[var(--hc-border)] bg-white text-[var(--hc-navy-800)] shadow-[var(--shadow-xs)]">
            <ShieldPlus className="size-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold leading-[18px] text-[var(--hc-text)]">
              {title}
            </div>
            <div className="truncate text-xs font-bold uppercase leading-4 tracking-[0.02em] text-[var(--hc-blue-600)]">
              {subtitle}
            </div>
          </div>
        </div>

        {canUseCta && ctaLabel && ctaHref ? (
          <Link
            href={ctaHref}
            className="mb-[22px] inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-blue-600)] px-4 text-sm font-bold text-white shadow-[var(--shadow-blue)] transition hover:-translate-y-px hover:bg-[var(--hc-blue-700)]"
          >
            <Plus className="size-[18px]" aria-hidden="true" />
            {ctaLabel}
          </Link>
        ) : null}

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = iconFor(link.icon);

            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={isActive ? "true" : undefined}
                className={cn(
                  "group relative flex h-12 items-center gap-[14px] px-4 text-sm font-medium text-[var(--hc-text)] transition-colors duration-150 hover:bg-[var(--hc-surface-soft)] hover:text-[var(--hc-blue-600)]",
                  isActive &&
                    "bg-[var(--hc-blue-50)] font-bold text-[var(--hc-blue-600)] hover:bg-[var(--hc-blue-50)] hover:text-[var(--hc-blue-600)] border-l-4 border-l-[var(--hc-blue-600)]",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0 text-[var(--hc-text-secondary)] transition-colors group-hover:text-[var(--hc-blue-600)]",
                    isActive && "text-[var(--hc-blue-600)] group-hover:text-[var(--hc-blue-600)]",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--hc-border-soft)] p-[18px]">
        <div className="mb-3 grid gap-1">
          {supportHref ? (
            <Link
              href={supportHref}
              className="flex h-10 items-center gap-3 px-2 text-sm font-medium text-[var(--hc-text-secondary)] transition hover:bg-[var(--hc-surface-soft)] hover:text-[var(--hc-blue-600)]"
            >
              <LifeBuoy className="size-5" aria-hidden="true" />
              {supportLabel}
            </Link>
          ) : null}
          {logoutHref ? (
            <Link
              href={logoutHref}
              className="flex h-10 items-center gap-3 px-2 text-sm font-medium text-[var(--hc-text-secondary)] transition hover:bg-[var(--hc-surface-soft)] hover:text-[var(--hc-danger)]"
            >
              <LogOut className="size-5" aria-hidden="true" />
              Logout
            </Link>
          ) : null}
        </div>
        <div className="flex min-h-[86px] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--hc-border)] bg-white p-4 shadow-[var(--shadow-xs)]">
          <span className="size-2.5 rounded-full bg-[var(--hc-success)]" />
          <span className="min-w-0">
            <span className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--hc-text)]">
              {statusTitle}
            </span>
            <span className="block text-xs leading-5 text-[var(--hc-text-secondary)]">
              {statusDescription}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
}

export function StaffSideNav({
  title = "Clinical Suite",
  subtitle = "Standard Access",
  links,
  ctaLabel = "Admit Patient",
  ctaHref = "/staff/booking",
}: StaffSideNavProps) {
  return (
    <HcSidebar
      title={title}
      subtitle={subtitle}
      roleScope="staff"
      links={links || defaultStaffSideLinks}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      supportHref="/staff/support"
      logoutHref="/auth/logout"
    />
  );
}

export function PortalSideNav({
  title = "Clinical Suite",
  subtitle = "Standard Access",
  links,
  ctaLabel = "Book Appointment",
  ctaHref = "/booking",
}: StaffSideNavProps) {
  return (
    <HcSidebar
      title={title}
      subtitle={subtitle}
      roleScope="patient"
      links={links || defaultPortalSideLinks}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      supportHref="/portal/support"
      logoutHref="/portal/login"
      statusTitle="Portal status"
      statusDescription="Secure patient access"
    />
  );
}
