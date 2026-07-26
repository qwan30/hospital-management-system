import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "../dialog";

describe("Dialog", () => {
  it("renders content when open", () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Test Dialog">
        <p>Dialog content</p>
      </Dialog>,
    );

    expect(screen.getByRole("heading", { name: "Test Dialog" })).toBeInTheDocument();
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
  });

  it("does not render visible content when closed", () => {
    render(
      <Dialog isOpen={false} onClose={() => {}} title="Hidden Dialog">
        <p>Hidden content</p>
      </Dialog>,
    );

    // When closed, the content is wrapped in a hidden div
    const hiddenDiv = screen.getByTestId("dialog-hidden");
    expect(hiddenDiv).toBeInTheDocument();
    expect(hiddenDiv).toHaveAttribute("aria-hidden", "true");
    // The heading is not visible in the document
    expect(screen.queryByRole("heading", { name: "Hidden Dialog" })).not.toBeInTheDocument();
  });

  it("renders hidden placeholder when closed with data-testid", () => {
    render(
      <Dialog isOpen={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Dialog>,
    );

    expect(screen.getByTestId("dialog-hidden")).toBeInTheDocument();
  });

  it("exposes itself as a modal dialog labelled by its title", async () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Accessible Dialog" description="Some detail">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // Screen readers must announce the dialog by its heading, not read the whole subtree.
    expect(dialog).toHaveAccessibleName("Accessible Dialog");
    expect(dialog).toHaveAccessibleDescription("Some detail");
  });

  it("closes on Escape", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog isOpen={true} onClose={handleClose} title="Escapable">
        <p>Content</p>
      </Dialog>,
    );

    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not listen for Escape while closed", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog isOpen={false} onClose={handleClose} title="Closed">
        <p>Content</p>
      </Dialog>,
    );

    await user.keyboard("{Escape}");
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("keeps Tab focus inside the dialog", async () => {
    const user = userEvent.setup();

    render(
      <Dialog isOpen={true} onClose={() => {}} title="Trapped">
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>,
    );

    const closeButton = screen.getByLabelText("Close dialog");
    const last = screen.getByRole("button", { name: "Last" });

    // Forward past the final control must wrap to the start, never escape to the page behind.
    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(closeButton);

    // And backwards from the first control wraps to the end.
    closeButton.focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it("restores focus to the previously focused element on close", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open dialog</button>
          <Dialog isOpen={open} onClose={() => setOpen(false)} title="Restores">
            <p>Content</p>
          </Dialog>
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Open dialog" });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    // Losing your place in the page after closing a dialog is a keyboard-user trap.
    expect(document.activeElement).toBe(trigger);
  });

  it("calls onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog isOpen={true} onClose={handleClose} title="Closable Dialog">
        <p>Content</p>
      </Dialog>,
    );

    await user.click(screen.getByLabelText("Close dialog"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders with description when provided", () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Dialog" description="This is a description">
        <p>Content</p>
      </Dialog>,
    );

    expect(screen.getByText("This is a description")).toBeInTheDocument();
  });

  it("renders without description when not provided", () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Dialog">
        <p>Content</p>
      </Dialog>,
    );

    expect(screen.getByRole("heading", { name: "Dialog" })).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Styled" className="custom-class">
        <p>Content</p>
      </Dialog>,
    );

    expect(screen.getByRole("heading", { name: "Styled" })).toBeInTheDocument();
  });

  it("renders children content when open", () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} title="Test">
        <button type="button">Action</button>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
