import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "../pagination";

describe("Pagination", () => {
  it("renders navigation with aria-label", () => {
    render(<Pagination />);
    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
  });

  it("renders previous and next links", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders page links", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("marks active page with aria-current", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText("1")).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current on non-active links", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText("2")).not.toHaveAttribute("aria-current");
  });

  it("renders ellipsis with sr-only text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText("More pages")).toBeInTheDocument();
  });

  it("renders previous link with custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" className="custom-class" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const link = screen.getByLabelText("Go to previous page");
    expect(link.className).toContain("custom-class");
  });

  it("renders next link with custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#" className="custom-class" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const link = screen.getByLabelText("Go to next page");
    expect(link.className).toContain("custom-class");
  });

  it("renders pagination with custom className on nav", () => {
    render(<Pagination className="custom-class" />);
    expect(screen.getByRole("navigation", { name: "pagination" })).toHaveClass("custom-class");
  });
});
