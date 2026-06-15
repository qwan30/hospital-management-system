import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RouteErrorState } from "../route-error-state";

describe("RouteErrorState", () => {
  it("renders error message in an alert role", () => {
    render(
      <RouteErrorState
        title="Page Not Found"
        description="The requested page could not be found."
        primaryHref="/dashboard"
        primaryLabel="Go to Dashboard"
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(screen.getByText("The requested page could not be found.")).toBeInTheDocument();
  });

  it("renders primary action link with correct href", () => {
    render(
      <RouteErrorState
        title="Error"
        description="Something went wrong."
        primaryHref="/home"
        primaryLabel="Go Home"
      />,
    );

    const link = screen.getByText("Go Home");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/home");
  });

  it("renders retry button when onRetry is provided", () => {
    const handleRetry = vi.fn();

    render(
      <RouteErrorState
        title="Error"
        description="Failed to load."
        primaryHref="/"
        primaryLabel="Back"
        onRetry={handleRetry}
      />,
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <RouteErrorState
        title="Error"
        description="Failed."
        primaryHref="/"
        primaryLabel="Back"
        onRetry={handleRetry}
      />,
    );

    await user.click(screen.getByText("Try Again"));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is undefined", () => {
    render(
      <RouteErrorState
        title="Error"
        description="Failed."
        primaryHref="/"
        primaryLabel="Back"
      />,
    );

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("renders secondary action link when provided", () => {
    render(
      <RouteErrorState
        title="Error"
        description="Failed."
        primaryHref="/"
        primaryLabel="Home"
        secondaryHref="/contact"
        secondaryLabel="Contact Support"
      />,
    );

    const link = screen.getByText("Contact Support");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/contact");
  });

  it("does not render secondary link when not provided", () => {
    render(
      <RouteErrorState
        title="Error"
        description="Failed."
        primaryHref="/"
        primaryLabel="Back"
      />,
    );

    expect(screen.queryByText("Contact Support")).not.toBeInTheDocument();
  });

  it("uses custom retry label when retryLabel is provided", () => {
    render(
      <RouteErrorState
        title="Error"
        description="Failed."
        primaryHref="/"
        primaryLabel="Back"
        onRetry={() => {}}
        retryLabel="Reload"
      />,
    );

    expect(screen.getByText("Reload")).toBeInTheDocument();
  });

  it("handles very long error descriptions", () => {
    const longDescription = "E".repeat(500);

    render(
      <RouteErrorState
        title="Long Error"
        description={longDescription}
        primaryHref="/"
        primaryLabel="Back"
      />,
    );

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });
});
