import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";

describe("Avatar", () => {
  it("renders fallback when no image is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders with AvatarImage element and fallback", () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="User avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    // In jsdom, images are not loaded, so the fallback is shown
    expect(screen.getByText("JD")).toBeInTheDocument();
    // The avatar container is rendered
    expect(document.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
  });

  it("renders fallback when image fails to load in jsdom", () => {
    render(
      <Avatar>
        <AvatarImage src="/broken.jpg" alt="Broken" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );

    // In jsdom the image never loads, so fallback is always rendered
    expect(screen.getByText("FB")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(
      <Avatar className="custom-class">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    const avatar = document.querySelector('[data-slot="avatar"]');
    expect(avatar).toHaveClass("custom-class");
  });

  it("renders with different size variants", () => {
    const sizes = ["default", "sm", "lg"] as const;

    for (const size of sizes) {
      const { unmount } = render(
        <Avatar size={size}>
          <AvatarFallback>{size}</AvatarFallback>
        </Avatar>,
      );

      const avatar = document.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveAttribute("data-size", size);
      unmount();
    }
  });

  it("renders with custom className on fallback", () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">JD</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("JD")).toHaveClass("custom-fallback");
  });
});
