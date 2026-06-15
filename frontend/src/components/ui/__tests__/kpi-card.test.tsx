import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KpiCard } from "../kpi-card";

describe("KpiCard", () => {
  it("renders with label and value", () => {
    render(<KpiCard label="Total Patients" value={1250} />);

    expect(screen.getByText("Total Patients")).toBeInTheDocument();
    expect(screen.getByText("1250")).toBeInTheDocument();
  });

  it("renders with helper text", () => {
    render(<KpiCard label="Revenue" value="$50,000" helper="+12% from last month" />);

    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$50,000")).toBeInTheDocument();
    expect(screen.getByText("+12% from last month")).toBeInTheDocument();
  });

  it("renders with null value gracefully", () => {
    render(<KpiCard label="Pending" value={null} />);

    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders with zero value", () => {
    render(<KpiCard label="Zero Count" value={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders with loading state (skeleton without text)", () => {
    const { container } = render(<KpiCard label="Loading" value={100} isLoading />);

    // Loading state renders skeleton structure without text
    const skeletonSection = container.querySelector('[aria-hidden="true"]');
    expect(skeletonSection).toBeInTheDocument();
    // The normal label and value should not be rendered
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    expect(screen.queryByText("100")).not.toBeInTheDocument();
  });

  it("renders with very long label text", () => {
    const longLabel = "This is an extremely long label that should still render correctly without breaking the layout";
    render(<KpiCard label={longLabel} value={42} />);

    expect(screen.getByText(longLabel)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders with different tones", () => {
    const tones = ["blue", "green", "amber", "red", "purple", "teal"] as const;

    for (const tone of tones) {
      const { unmount } = render(<KpiCard label={tone} value={100} tone={tone} />);
      expect(screen.getByText(tone)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders with custom className", () => {
    render(<KpiCard label="Styled" value="X" className="custom-class" />);

    const section = screen.getByText("Styled").closest("section");
    expect(section).toHaveClass("custom-class");
  });

  it("renders with ReactNode value", () => {
    render(<KpiCard label="Complex" value={<span>Node Value</span>} />);

    expect(screen.getByText("Node Value")).toBeInTheDocument();
  });
});
