import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AlertBanner } from "../alert-banner";

describe("AlertBanner", () => {
  it("renders with info severity", () => {
    render(<AlertBanner tone="info">Information message</AlertBanner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Information message")).toBeInTheDocument();
  });

  it("renders with success severity", () => {
    render(<AlertBanner tone="success">Success message</AlertBanner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("renders with warning severity", () => {
    render(<AlertBanner tone="warning">Warning message</AlertBanner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Warning message")).toBeInTheDocument();
  });

  it("renders with danger severity", () => {
    render(<AlertBanner tone="danger">Danger message</AlertBanner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Danger message")).toBeInTheDocument();
  });

  it("renders with title and children", () => {
    render(
      <AlertBanner tone="warning" title="Warning Title">
        Warning description
      </AlertBanner>,
    );

    expect(screen.getByText("Warning Title")).toBeInTheDocument();
    expect(screen.getByText("Warning description")).toBeInTheDocument();
  });

  it("renders without title when not provided", () => {
    render(<AlertBanner tone="info">Content only</AlertBanner>);
    expect(screen.getByText("Content only")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    render(
      <AlertBanner tone="danger" onRetry={() => {}}>
        Failed to load
      </AlertBanner>,
    );

    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const handleRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <AlertBanner tone="danger" onRetry={handleRetry}>
        Failed
      </AlertBanner>,
    );

    await user.click(screen.getByText("Try again"));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<AlertBanner tone="info">Info only</AlertBanner>);
    expect(screen.queryByText("Try again")).not.toBeInTheDocument();
  });

  it("dismisses the banner when dismiss button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AlertBanner tone="info" dismissible>
        Dismissible message
      </AlertBanner>,
    );

    expect(screen.getByText("Dismissible message")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Dismissible message")).not.toBeInTheDocument();
  });

  it("does not show dismiss button when dismissible is false", () => {
    render(<AlertBanner tone="info">Not dismissible</AlertBanner>);
    expect(screen.queryByLabelText("Dismiss")).not.toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(
      <AlertBanner tone="info" className="custom-class">
        Styled alert
      </AlertBanner>,
    );

    expect(screen.getByRole("alert")).toHaveClass("custom-class");
  });

  it("returns null after being dismissed", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <AlertBanner tone="success" dismissible>
        Dismiss this
      </AlertBanner>,
    );

    await user.click(screen.getByLabelText("Dismiss"));
    expect(container.innerHTML).toBe("");
  });
});
