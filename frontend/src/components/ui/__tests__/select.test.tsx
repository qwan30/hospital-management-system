import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../select";


describe("Select", () => {
  it("renders trigger with placeholder text", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Choose">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>,
    );

    expect(screen.getByLabelText("Choose")).toBeInTheDocument();
  });

  it("renders all option items inside content", () => {
    render(
      <Select defaultOpen>
        <SelectTrigger aria-label="Options">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
          <SelectItem value="b">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("renders with custom className on trigger", () => {
    render(
      <Select>
        <SelectTrigger className="custom-class" aria-label="Trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </Select>,
    );

    expect(screen.getByLabelText("Trigger")).toHaveClass("custom-class");
  });

  it("handles onValueChange callback", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select onValueChange={handleChange}>
        <SelectTrigger aria-label="Pick">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">Option X</SelectItem>
        </SelectContent>
      </Select>,
    );

    await user.click(screen.getByLabelText("Pick"));
    await user.click(screen.getByText("Option X"));

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe("x");
  });
});
