import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartPlaceholder } from "../chart-placeholder";

describe("ChartPlaceholder", () => {
  it("renders with default title", () => {
    render(<ChartPlaceholder />);
    expect(screen.getByText("Chart Data")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(<ChartPlaceholder title="Revenue Chart" />);
    expect(screen.getByText("Revenue Chart")).toBeInTheDocument();
  });

  it("renders with description when provided", () => {
    render(<ChartPlaceholder title="Chart" description="Monthly revenue breakdown" />);
    expect(screen.getByText("Monthly revenue breakdown")).toBeInTheDocument();
  });

  it("renders without description when not provided", () => {
    render(<ChartPlaceholder title="Chart" />);
    expect(screen.queryByText("Monthly revenue breakdown")).not.toBeInTheDocument();
  });

  it("renders with null title gracefully without crashing", () => {
    // @ts-expect-error - testing null title at runtime
    const { container } = render(<ChartPlaceholder title={null} />);
    const h3 = container.querySelector("h3");
    expect(h3).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(<ChartPlaceholder className="custom-class" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-class");
  });

  it("renders day labels (Mon-Sun)", () => {
    render(<ChartPlaceholder />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("renders y-axis labels", () => {
    render(<ChartPlaceholder />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders period filter buttons", () => {
    render(<ChartPlaceholder />);
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  it("renders legend items", () => {
    render(<ChartPlaceholder />);
    expect(screen.getByText("Current Period")).toBeInTheDocument();
    expect(screen.getByText("Previous Period")).toBeInTheDocument();
  });
});
