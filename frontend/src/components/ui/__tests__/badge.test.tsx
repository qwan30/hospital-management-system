import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with default variant when no variant is specified", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders with each variant without crashing", () => {
    const variants = [
      "default",
      "secondary",
      "success",
      "warning",
      "danger",
      "info",
      "purple",
      "destructive",
      "outline",
      "ghost",
      "link",
    ] as const;

    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders with custom className applied", () => {
    render(<Badge className="custom-class">Styled</Badge>);
    const badge = screen.getByText("Styled");
    expect(badge.className).toContain("custom-class");
  });

  it("renders gracefully without children", () => {
    const { container } = render(<Badge />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("renders with additional HTML props", () => {
    render(<Badge aria-label="status-label">Labeled</Badge>);
    expect(screen.getByLabelText("status-label")).toBeInTheDocument();
  });
});
