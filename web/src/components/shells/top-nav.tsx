"use client";

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
  { label: "Inventory", href: "/staff/inventory" },
  { label: "Staff", href: "/staff/users" },
];

const defaultPortalLinks: TopNavLink[] = [
  { label: "Dashboard", href: "/portal/overview" },
  { label: "Patients", href: "/portal/patients" },
  { label: "Inventory", href: "/portal/inventory" },
  { label: "Staff", href: "/portal/staff" },
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
        <button className="text-gray-400 hover:text-white p-2 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-gray-400 hover:text-white p-2 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 bg-hms-surface-container-highest flex items-center justify-center overflow-hidden">
          {profileImageSrc ? (
            <img
              alt="Administrator Profile"
              src={profileImageSrc}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-hms-on-surface-variant text-sm">
              account_circle
            </span>
          )}
        </div>
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
          href="/portal/overview"
          className="text-lg font-semibold tracking-tighter text-white uppercase"
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
          <span className="material-symbols-outlined text-white cursor-pointer hover:bg-gray-800 p-2">
            notifications
          </span>
          <span className="material-symbols-outlined text-white cursor-pointer hover:bg-gray-800 p-2">
            settings
          </span>
          <div className="w-8 h-8 bg-hms-surface-container-highest overflow-hidden">
            {profileImageSrc ? (
              <img
                alt="Administrator Profile"
                src={profileImageSrc}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-hms-on-surface-variant">
                account_circle
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
