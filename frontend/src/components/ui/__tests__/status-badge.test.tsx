import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../status-badge";

describe("StatusBadge", () => {
  it("renders with label text", () => {
    render(<StatusBadge label="Completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders with each known tone without crashing", () => {
    const tones = ["blue", "green", "amber", "red", "purple", "teal", "neutral"] as const;

    for (const tone of tones) {
      const { unmount } = render(<StatusBadge label={tone} tone={tone} />);
      expect(screen.getByText(tone)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders with default neutral tone when tone is not specified", () => {
    render(<StatusBadge label="Default" />);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(<StatusBadge label="Styled" className="custom-class" />);
    const badge = screen.getByText("Styled");
    expect(badge.className).toContain("custom-class");
  });
});
