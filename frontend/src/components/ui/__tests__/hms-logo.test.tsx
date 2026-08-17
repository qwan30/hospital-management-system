import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HmsLogo } from "../hms-logo";

describe("HmsLogo", () => {
  it("renders the canonical Hospital Core brand name and icon", () => {
    render(<HmsLogo />);

    const link = screen.getByRole("link", { name: /Hospital Core home/i });
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveTextContent("HOSPITAL CORE");
  });

  it("supports custom href and hidden text mode", () => {
    render(<HmsLogo href="/staff/dashboard" showText={false} aria-label="Staff Home" />);

    const link = screen.getByRole("link", { name: /Staff Home/i });
    expect(link).toHaveAttribute("href", "/staff/dashboard");
    expect(link).not.toHaveTextContent("HOSPITAL CORE");
  });
});
