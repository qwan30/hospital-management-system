import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminNewsPage from "../page";
import {
  createAdminNewsArticle,
  listAdminNewsArticles,
  updateAdminNewsArticle,
  type AdminNewsArticleResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createAdminNewsArticle: vi.fn(),
    listAdminNewsArticles: vi.fn(),
    updateAdminNewsArticle: vi.fn(),
  };
});

const articles: AdminNewsArticleResponse[] = [
  {
    id: "article-1",
    slug: "visiting-hours",
    title: "Updated Visiting Hours",
    summary: "New visiting hour guidance",
    content: "Full article body",
    imageUrl: null,
    publishedAt: "2020-01-01T00:00:00.000Z",
  },
  {
    id: "article-2",
    slug: "draft-wellness",
    title: "Staff Wellness Draft",
    summary: "Draft wellness update",
    content: null,
    imageUrl: null,
    publishedAt: null,
  },
];

describe("AdminNewsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAdminNewsArticles).mockResolvedValue(articles);
    vi.mocked(createAdminNewsArticle).mockResolvedValue(articles[0]);
    vi.mocked(updateAdminNewsArticle).mockResolvedValue({ ...articles[0], title: "Updated Visiting Hours v2" });
  });

  it("loads real news articles without static fallback rows", async () => {
    render(<AdminNewsPage />);

    expect(screen.getByText(/loading news articles/i)).toBeInTheDocument();
    expect(await screen.findByText("Updated Visiting Hours")).toBeInTheDocument();
    expect(screen.getByText("Staff Wellness Draft")).toBeInTheDocument();
    expect(screen.queryByText("New Oncology Wing Opening Ceremony")).not.toBeInTheDocument();
    expect(listAdminNewsArticles).toHaveBeenCalledOnce();
  });

  it("filters articles by search and status", async () => {
    render(<AdminNewsPage />);

    await screen.findByText("Updated Visiting Hours");
    fireEvent.change(screen.getByRole("searchbox", { name: /search news articles/i }), {
      target: { value: "wellness" },
    });

    expect(screen.getByText("Staff Wellness Draft")).toBeInTheDocument();
    expect(screen.queryByText("Updated Visiting Hours")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/filter news by status/i), {
      target: { value: "Published" },
    });

    expect(screen.getByText(/no news articles match/i)).toBeInTheDocument();
  });

  it("creates and updates articles with the backend request shape", async () => {
    render(<AdminNewsPage />);

    await screen.findByText("Updated Visiting Hours");
    await userEvent.click(screen.getByRole("button", { name: /create article/i }));
    fireEvent.change(screen.getByLabelText("Slug"), {
      target: { value: "lab-expansion" },
    });
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Lab Expansion" },
    });
    fireEvent.change(screen.getByLabelText("Summary"), {
      target: { value: "Expanded lab hours" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save article/i }));

    await waitFor(() => {
      expect(createAdminNewsArticle).toHaveBeenCalledWith({
        slug: "lab-expansion",
        title: "Lab Expansion",
        summary: "Expanded lab hours",
        content: null,
        imageUrl: null,
        publishedAt: null,
        active: true,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: /edit updated visiting hours/i }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated Visiting Hours v2" },
    });
    await userEvent.click(screen.getByRole("button", { name: /save article/i }));

    await waitFor(() => {
      expect(updateAdminNewsArticle).toHaveBeenCalledWith(
        "article-1",
        expect.objectContaining({ title: "Updated Visiting Hours v2" }),
      );
    });
  }, 10_000);

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listAdminNewsArticles).mockResolvedValueOnce([]);

    const { unmount } = render(<AdminNewsPage />);

    expect(await screen.findByText(/no news articles match/i)).toBeInTheDocument();
    expect(screen.queryByText("Annual Medical Research Symposium 2024")).not.toBeInTheDocument();

    unmount();
    vi.mocked(listAdminNewsArticles).mockRejectedValueOnce(new Error("Content access denied"));

    render(<AdminNewsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Content access denied");
  });
});
