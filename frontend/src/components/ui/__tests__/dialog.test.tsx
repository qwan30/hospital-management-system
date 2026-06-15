import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
