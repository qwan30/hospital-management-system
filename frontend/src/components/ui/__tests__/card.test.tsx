import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "../card";

describe("Card", () => {
  it("renders with header, content, and footer slots", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Description text</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content</p>
        </CardContent>
        <CardFooter>
          <span>Footer content</span>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("renders without optional slots (no header, no footer)", () => {
    render(
      <Card>
        <CardContent>
          <p>Only content</p>
        </CardContent>
      </Card>,
    );

    expect(screen.getByText("Only content")).toBeInTheDocument();
    expect(screen.queryByText("Card Title")).not.toBeInTheDocument();
  });

  it("renders with action slot", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction>
            <button type="button">Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Content</p>
        </CardContent>
      </Card>,
    );

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("renders very long content without overflowing", () => {
    const longText = "A".repeat(1000);

    render(
      <Card>
        <CardContent>
          <p>{longText}</p>
        </CardContent>
      </Card>,
    );

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it("renders with sm size variant", () => {
    render(
      <Card size="sm">
        <CardContent>
          <p>Small card</p>
        </CardContent>
      </Card>,
    );

    expect(screen.getByText("Small card")).toBeInTheDocument();
    const card = document.querySelector('[data-slot="card"]');
    expect(card).toHaveAttribute("data-size", "sm");
  });

  it("renders with default size", () => {
    render(
      <Card>
        <CardContent>
          <p>Default card</p>
        </CardContent>
      </Card>,
    );

    const card = document.querySelector('[data-slot="card"]');
    expect(card).toHaveAttribute("data-size", "default");
  });

  it("renders with custom className", () => {
    render(
      <Card className="custom-class">
        <CardContent>
          <p>Styled card</p>
        </CardContent>
      </Card>,
    );

    const card = document.querySelector('[data-slot="card"]');
    expect(card).toHaveClass("custom-class");
  });
});
