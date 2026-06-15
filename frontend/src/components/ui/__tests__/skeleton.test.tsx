import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("renders with default dimensions", () => {
    const { container } = render(<Skeleton />);
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
  });

  it("renders with custom className for width/height", () => {
    const { container } = render(<Skeleton className="h-4 w-48 rounded" />);
    const div = container.querySelector("div");
    expect(div).toHaveClass("h-4");
    expect(div).toHaveClass("w-48");
    expect(div).toHaveClass("rounded");
  });

  it("has aria-hidden attribute for accessibility", () => {
    const { container } = render(<Skeleton />);
    const div = container.querySelector("div");
    expect(div).toHaveAttribute("aria-hidden", "true");
  });

  it("renders multiple skeletons independently", () => {
    const { container } = render(
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>,
    );

    const skeletons = container.querySelectorAll("div[aria-hidden='true']");
    expect(skeletons.length).toBe(3);
  });

  it("renders with no className gracefully", () => {
    const { container } = render(<Skeleton />);
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
    expect(div?.className).toBeTruthy();
  });
});
