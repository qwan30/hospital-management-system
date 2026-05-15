import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffSideNav } from "../side-nav";

const navigationState = vi.hoisted(() => ({
  pathname: "/staff/dashboard",
}));
const roleState = vi.hoisted(() => ({
  role: "NURSE" as string | null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

vi.mock("@/lib/use-stored-role", () => ({
  useStoredRole: () => roleState.role,
}));

describe("StaffSideNav", () => {
  beforeEach(() => {
    navigationState.pathname = "/staff/dashboard";
    roleState.role = "NURSE";
  });

  it("filters staff navigation links by the stored role", () => {
    render(<StaffSideNav />);

    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute(
      "href",
      "/staff/dashboard",
    );
    expect(screen.getByRole("link", { name: /queue board/i })).toHaveAttribute(
      "href",
      "/staff/queue",
    );
    expect(screen.queryByRole("link", { name: /inventory/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /billing/i })).not.toBeInTheDocument();
  });

  it("keeps support and logout links available for every staff role", () => {
    roleState.role = "ACCOUNTANT";

    render(<StaffSideNav />);

    expect(screen.getByRole("link", { name: /support/i })).toHaveAttribute(
      "href",
      "/staff/support",
    );
    expect(screen.getByRole("link", { name: /logout/i })).toHaveAttribute(
      "href",
      "/auth/logout",
    );
  });

  it("marks the active link from the current pathname", () => {
    navigationState.pathname = "/staff/queue";

    render(<StaffSideNav />);

    const activeLink = screen.getByRole("link", { name: /queue board/i });
    expect(activeLink).toHaveAttribute("data-active", "true");
    expect(activeLink.className).toContain("border-l-4");
    expect(activeLink.className).toContain("text-[var(--hc-blue-600)]");
  });

  it("does not render the CTA when the current role cannot access the CTA target", () => {
    roleState.role = "ACCOUNTANT";

    render(<StaffSideNav />);

    const aside = screen.getByRole("complementary");
    expect(
      within(aside).queryByRole("link", { name: /admit patient/i }),
    ).not.toBeInTheDocument();
  });
});
