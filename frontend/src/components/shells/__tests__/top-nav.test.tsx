import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HcTopbar, PortalTopNav, StaffTopNav } from "../top-nav";

const navigationState = vi.hoisted(() => ({
  pathname: "/staff/dashboard",
}));

const roleState = vi.hoisted(() => ({
  staffRole: "NURSE" as string | null,
  patientRole: "PATIENT" as string | null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

vi.mock("@/lib/use-stored-role", () => ({
  useStoredRole: (scope: "staff" | "patient") =>
    scope === "staff" ? roleState.staffRole : roleState.patientRole,
}));

describe("StaffTopNav", () => {
  beforeEach(() => {
    navigationState.pathname = "/staff/queue";
    roleState.staffRole = "NURSE";
  });

  it("filters staff mobile navigation by stored role", async () => {
    render(<StaffTopNav />);

    await userEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/staff/dashboard",
    );
    expect(screen.getByRole("link", { name: /queue/i })).toHaveAttribute(
      "href",
      "/staff/queue",
    );
    expect(screen.queryByRole("link", { name: /inventory/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /finance/i })).not.toBeInTheDocument();
  });

  it("marks the active staff mobile navigation link", async () => {
    render(<StaffTopNav />);

    await userEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    const activeLink = screen.getByRole("link", { name: /queue/i });
    expect(activeLink).toHaveAttribute("data-active", "true");
    expect(activeLink.className).toContain("bg-white/10");
    expect(activeLink.className).toContain("text-white");
  });

  it("does not duplicate module links in the desktop topbar by default", () => {
    render(<StaffTopNav />);

    expect(screen.queryByRole("navigation", { name: /module navigation/i })).not.toBeInTheDocument();
  });

  it("keeps staff utility links available", () => {
    roleState.staffRole = "ACCOUNTANT";

    render(<StaffTopNav />);

    expect(screen.getByLabelText(/open staff alerts/i)).toHaveAttribute(
      "href",
      "/staff/queue",
    );
    expect(screen.getByLabelText(/open schedule settings/i)).toHaveAttribute(
      "href",
      "/staff/schedule",
    );
    expect(screen.getByLabelText(/open staff profile/i)).toHaveAttribute(
      "href",
      "/staff/doctor/dashboard",
    );
  });

  it("falls back to staff profile copy and hides the badge when alert count is zero", () => {
    roleState.staffRole = null;

    render(
      <HcTopbar
        links={[{ label: "Patients", href: "/staff/patients" }]}
        roleScope="staff"
        homeHref="/staff/dashboard"
        alertHref="/staff/queue"
        settingsHref="/staff/schedule"
        profileHref="/staff/profile"
        userName=""
        userRole=""
        alertCount={0}
      />,
    );

    expect(screen.getByText("Staff Ops")).toBeInTheDocument();
    expect(screen.getByText("Clinical team")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("marks subroutes as active for allowed staff links", () => {
    roleState.staffRole = "ADMIN";
    navigationState.pathname = "/staff/patients/active";

    render(
      <HcTopbar
        links={[{ label: "Patients", href: "/staff/patients" }]}
        showModuleNav
        roleScope="staff"
        homeHref="/staff/dashboard"
        alertHref="/staff/queue"
        settingsHref="/staff/schedule"
        profileHref="/staff/profile"
        userName="Staff User"
        userRole="Clinical team"
      />,
    );

    expect(screen.getByRole("link", { name: /patients/i })).toHaveAttribute("data-active", "true");
  });

  it("renders image profiles and configured support targets", () => {
    roleState.staffRole = "ADMIN";

    render(
      <HcTopbar
        links={[]}
        roleScope="staff"
        homeHref="/staff/dashboard"
        alertHref="/staff/queue"
        settingsHref="/staff/schedule"
        profileHref="/staff/profile"
        supportHref="/staff/support"
        userName="Fallback User"
        userRole="Fallback Role"
        profileImageSrc="/staff-bg.png"
      />,
    );

    expect(screen.getByAltText("Admin Ops")).toBeInTheDocument();
    expect(screen.getByLabelText(/open support/i)).toHaveAttribute("href", "/staff/support");
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});

describe("PortalTopNav", () => {
  beforeEach(() => {
    navigationState.pathname = "/portal/messages";
    roleState.patientRole = "PATIENT";
  });

  it("renders patient portal mobile navigation links for a patient session", async () => {
    render(<PortalTopNav />);

    await userEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    expect(screen.getByRole("link", { name: /appointments/i })).toHaveAttribute(
      "href",
      "/portal/appointments",
    );
    expect(screen.getByRole("link", { name: /messages/i })).toHaveAttribute(
      "href",
      "/portal/messages",
    );
    expect(screen.getByRole("link", { name: /^profile$/i })).toHaveAttribute(
      "href",
      "/portal/profile",
    );
  });

  it("marks active portal links and exposes portal utility targets", async () => {
    render(<PortalTopNav />);

    await userEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));

    const activeLink = screen.getByRole("link", { name: /messages/i });
    expect(activeLink).toHaveAttribute("data-active", "true");
    expect(activeLink.className).toContain("bg-white/10");
    expect(activeLink.className).toContain("text-white");
    expect(screen.getByLabelText(/open notifications/i)).toHaveAttribute(
      "href",
      "/portal/messages",
    );
    expect(screen.getByLabelText(/open profile settings/i)).toHaveAttribute(
      "href",
      "/portal/profile#security-settings",
    );
    expect(screen.getByLabelText(/open patient profile/i)).toHaveAttribute(
      "href",
      "/portal/profile",
    );
  });

  it("falls back to patient profile copy when no portal role is stored", () => {
    roleState.patientRole = null;

    render(<PortalTopNav />);

    expect(screen.getByText("Patient")).toBeInTheDocument();
    expect(screen.getByText("Verified portal")).toBeInTheDocument();
  });
});
