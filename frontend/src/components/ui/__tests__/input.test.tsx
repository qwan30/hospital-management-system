import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../input";

describe("Input", () => {
  it("renders with placeholder text", () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("renders as disabled", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("renders with aria-invalid in error state", () => {
    render(<Input aria-invalid="true" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("handles onChange callback", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} placeholder="Type here" />);
    await user.type(screen.getByPlaceholderText("Type here"), "a");

    expect(handleChange).toHaveBeenCalled();
  });

  it("renders with aria-label", () => {
    render(<Input aria-label="Search input" />);
    expect(screen.getByLabelText("Search input")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(<Input className="custom-class" placeholder="Styled" />);
    expect(screen.getByPlaceholderText("Styled")).toHaveClass("custom-class");
  });

  it("renders with different type attribute", () => {
    render(<Input type="password" aria-label="Password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("renders an input element via role query", () => {
    render(<Input aria-label="Generic input" />);
    // Input with type=text has role textbox
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
