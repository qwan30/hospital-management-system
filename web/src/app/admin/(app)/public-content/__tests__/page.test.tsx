import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPublicContentPage from "../page";
import {
  createAdminContentSection,
  listAdminContentSections,
  updateAdminContentSection,
  type AdminContentSectionResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createAdminContentSection: vi.fn(),
    listAdminContentSections: vi.fn(),
    updateAdminContentSection: vi.fn(),
  };
});

const sections: AdminContentSectionResponse[] = [
  {
    id: "section-1",
    slug: "hero-landing",
    title: "Hero Landing",
    body: "Precision healthcare for every life.",
    imageUrl: null,
    ctaLabel: "Book now",
    ctaHref: "/booking",
    sortOrder: 1,
  },
  {
    id: "section-2",
    slug: "core-services",
    title: "Core Services",
    body: "Medical grid list",
    imageUrl: null,
    ctaLabel: null,
    ctaHref: null,
    sortOrder: 2,
  },
];

describe("AdminPublicContentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminContentSections).mockResolvedValue(sections);
    vi.mocked(createAdminContentSection).mockResolvedValue(sections[0]);
    vi.mocked(updateAdminContentSection).mockResolvedValue({ ...sections[0], title: "Hero Landing Updated" });
  });

  it("loads real content sections without static fallback rows", async () => {
    render(<AdminPublicContentPage />);

    expect(screen.getByText(/loading content sections/i)).toBeInTheDocument();
    expect(await screen.findAllByText("Hero Landing")).not.toHaveLength(0);
    expect(screen.getByText("Core Services")).toBeInTheDocument();
    expect(screen.queryByText("About MedCore")).not.toBeInTheDocument();
    expect(listAdminContentSections).toHaveBeenCalledOnce();
  });

  it("filters content sections by search text", async () => {
    render(<AdminPublicContentPage />);

    await screen.findAllByText("Hero Landing");
    fireEvent.change(screen.getByRole("searchbox", { name: /search public content sections/i }), {
      target: { value: "core" },
    });

    expect(screen.getByText("Core Services")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /hero landing/i })).not.toBeInTheDocument();
  });

  it("creates and updates sections with the backend request shape", async () => {
    render(<AdminPublicContentPage />);

    await screen.findAllByText("Hero Landing");
    await userEvent.click(screen.getByRole("button", { name: /create section/i }));
    fireEvent.change(screen.getByLabelText("Slug"), {
      target: { value: "contact-portal" },
    });
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Contact Portal" },
    });
    fireEvent.change(screen.getByLabelText("Body"), {
      target: { value: "Reach the hospital team." },
    });
    fireEvent.change(screen.getByLabelText("Sort Order"), {
      target: { value: "3" },
    });
    await userEvent.click(screen.getByRole("button", { name: /deploy changes/i }));

    await waitFor(() => {
      expect(createAdminContentSection).toHaveBeenCalledWith({
        slug: "contact-portal",
        title: "Contact Portal",
        body: "Reach the hospital team.",
        imageUrl: null,
        ctaLabel: null,
        ctaHref: null,
        sortOrder: 3,
        active: true,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: /edit hero landing/i }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Hero Landing Updated" },
    });
    await userEvent.click(screen.getByRole("button", { name: /deploy changes/i }));

    await waitFor(() => {
      expect(updateAdminContentSection).toHaveBeenCalledWith(
        "section-1",
        expect.objectContaining({ title: "Hero Landing Updated" }),
      );
    });
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminContentSections).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminPublicContentPage />);

    expect(await screen.findByText(/no content sections match/i)).toBeInTheDocument();
    expect(screen.queryByText("About MedCore")).not.toBeInTheDocument();

    unmount();
    vi.mocked(listAdminContentSections).mockRejectedValueOnce(new Error("Section access denied"));

    render(<AdminPublicContentPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Section access denied");
  });
});
