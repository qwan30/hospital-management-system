import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortalSideNav } from "../side-nav";

const navigationState = vi.hoisted(() => ({
  pathname: "/portal/appointments",
}));

const roleState = vi.hoisted(() => ({
  role: "PATIENT" as string | null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

vi.mock("@/lib/use-stored-role", () => ({
  useStoredRole: () => roleState.role,
}));

describe("PortalSideNav", () => {
  beforeEach(() => {
    navigationState.pathname = "/portal/appointments";
    roleState.role = "PATIENT";
  });

  it("renders the patient portal navigation set", () => {
    render(<PortalSideNav />);

    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute(
      "href",
      "/portal/overview",
    );
    expect(screen.getByRole("link", { name: /appointments/i })).toHaveAttribute(
      "href",
      "/portal/appointments",
    );
    expect(screen.getByRole("link", { name: /lab results/i })).toHaveAttribute(
      "href",
      "/portal/lab-results",
    );
    expect(screen.getByRole("link", { name: /messages/i })).toHaveAttribute(
      "href",
      "/portal/messages",
    );
  });

  it("marks the active portal side navigation item", () => {
    render(<PortalSideNav />);

    const activeLink = screen.getByRole("link", { name: /appointments/i });
    expect(activeLink).toHaveAttribute("data-active", "true");
    expect(activeLink.className).toContain("border-l-4");
    expect(activeLink.className).toContain("text-[var(--hc-blue-600)]");
  });

  it("renders portal CTA and support/logout destinations", () => {
    render(<PortalSideNav />);

    expect(screen.getByRole("link", { name: /book appointment/i })).toHaveAttribute(
      "href",
      "/booking",
    );
    expect(screen.getByRole("link", { name: /support/i })).toHaveAttribute(
      "href",
      "/portal/support",
    );
    expect(screen.getByRole("link", { name: /logout/i })).toHaveAttribute(
      "href",
      "/portal/login",
    );
  });
});
