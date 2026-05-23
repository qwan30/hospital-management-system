import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicTopNav } from "../public-top-nav";

const navigationState = vi.hoisted(() => ({
  pathname: "/departments/cardiology",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

describe("PublicTopNav", () => {
  beforeEach(() => {
    navigationState.pathname = "/departments/cardiology";
  });

  it("renders all public navigation and auth entry links", () => {
    render(<PublicTopNav />);

    expect(screen.getByRole("link", { name: /hospital core/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /departments/i })).toHaveAttribute(
      "href",
      "/departments",
    );
    expect(screen.getByRole("link", { name: /book appointment/i })).toHaveAttribute(
      "href",
      "/booking",
    );
    expect(screen.getByRole("link", { name: /patient portal/i })).toHaveAttribute(
      "href",
      "/portal/login",
    );
    expect(screen.getByRole("link", { name: /staff login/i })).toHaveAttribute(
      "href",
      "/staff/login",
    );
  });

  it("marks nested public routes as active for their parent link", () => {
    render(<PublicTopNav />);

    const activeLink = screen.getByRole("link", { name: /departments/i });
    expect(activeLink).toHaveAttribute("data-active", "true");
    expect(activeLink.className).toContain("border-b-[3px]");
    expect(activeLink.className).toContain("text-white");
  });

  it("does not mark home active for non-home routes", () => {
    render(<PublicTopNav />);

    expect(screen.getByRole("link", { name: /home/i }).className).not.toContain(
      "border-b-[3px]",
    );
  });

  it("opens a mobile menu with public and portal links", async () => {
    render(<PublicTopNav />);

    await userEvent.click(screen.getByRole("button", { name: /open public navigation/i }));

    expect(screen.getByRole("dialog", { name: /public mobile navigation/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /patient portal/i }).at(-1)).toHaveAttribute(
      "href",
      "/portal/login",
    );
    expect(screen.getAllByRole("link", { name: /staff login/i }).at(-1)).toHaveAttribute(
      "href",
      "/staff/login",
    );
  });
});
