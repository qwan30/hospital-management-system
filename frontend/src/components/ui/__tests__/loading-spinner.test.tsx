import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingSpinner } from "../loading-spinner";

describe("LoadingSpinner", () => {
  it("renders with default size", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with aria-label for accessibility via role status", () => {
    render(<LoadingSpinner />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });

  it("renders with sr-only 'Loading...' text", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with message when provided", () => {
    render(<LoadingSpinner message="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeInTheDocument();
  });

  it("renders without message when not provided", () => {
    render(<LoadingSpinner />);
    expect(screen.queryByText("Fetching data...")).not.toBeInTheDocument();
  });

  it("renders with custom size prop (sm)", () => {
    render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with custom size prop (lg)", () => {
    render(<LoadingSpinner size="lg" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    const status = screen.getByRole("status");
    expect(status).toHaveClass("custom-class");
  });

  it("renders with message and custom className", () => {
    render(<LoadingSpinner message="Processing..." className="p-8" />);
    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("p-8");
  });
});
