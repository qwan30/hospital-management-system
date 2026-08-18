import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewsArticleDetailPage from "../page";
import { getNewsArticle, type NewsArticleResponse } from "@/lib/public-api";

vi.mock("@/lib/public-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/public-api")>(
    "@/lib/public-api",
  );
  return {
    ...actual,
    getNewsArticle: vi.fn(),
  };
});

const mockArticle: NewsArticleResponse = {
  id: "news-1",
  slug: "robotic-surgery-wing",
  title: "Expansion of Robotic Surgery Wing",
  summary: "Integrating next generation haptic units.",
  content: "Paragraph 1 about surgical units.\n\nParagraph 2 about patient safety.",
  imageUrl: "https://example.com/image1.jpg",
  publishedAt: "2026-10-20T10:00:00Z",
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "robotic-surgery-wing" }),
}));

describe("NewsArticleDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNewsArticle).mockResolvedValue(mockArticle);
  });

  it("loads and displays the article details with content paragraphs", async () => {
    render(<NewsArticleDetailPage />);

    expect(
      await screen.findByRole("heading", { name: "Expansion of Robotic Surgery Wing" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Integrating next generation haptic units.")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 1 about surgical units.")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 2 about patient safety.")).toBeInTheDocument();
  });

  it("shows error alert if article is not found", async () => {
    vi.mocked(getNewsArticle).mockRejectedValueOnce(new Error("Article not found"));

    render(<NewsArticleDetailPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Article not found");
  });
});
