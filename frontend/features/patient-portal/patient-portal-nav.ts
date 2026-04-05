import type { PatientPortalNavItem } from "../patient-portal-ui/patient-portal-ui";

export function buildPatientPortalNav(activeHref: string): readonly PatientPortalNavItem[] {
  return [
    { href: "/patient-portal", label: "Dashboard", active: activeHref === "/patient-portal" },
    {
      href: "/patient-portal/appointments",
      label: "My Appointments",
      active: activeHref === "/patient-portal/appointments"
    },
    {
      href: "/patient-portal/lab-results",
      label: "My Lab Results",
      active: activeHref === "/patient-portal/lab-results"
    },
    {
      href: "/patient-portal/messages",
      label: "Messages",
      active: activeHref === "/patient-portal/messages"
    },
    {
      href: "/patient-portal/profile",
      label: "Profile & Settings",
      active: activeHref === "/patient-portal/profile"
    }
  ] as const;
}
