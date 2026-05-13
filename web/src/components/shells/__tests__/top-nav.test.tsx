import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalTopNav, StaffTopNav } from "../top-nav";

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

  it("filters staff top navigation by stored role", () => {
    render(<StaffTopNav />);

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

  it("marks the active staff top navigation link", () => {
    render(<StaffTopNav />);

    const activeLink = screen.getByRole("link", { name: /queue/i });
    expect(activeLink.className).toContain("border-b-2");
    expect(activeLink.className).toContain("text-white");
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
});

describe("PortalTopNav", () => {
  beforeEach(() => {
    navigationState.pathname = "/portal/messages";
    roleState.patientRole = "PATIENT";
  });

  it("renders patient portal navigation links for a patient session", () => {
    render(<PortalTopNav />);

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

  it("marks active portal links and exposes portal utility targets", () => {
    render(<PortalTopNav />);

    const activeLink = screen.getByRole("link", { name: /messages/i });
    expect(activeLink.className).toContain("border-b-2");
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
});
