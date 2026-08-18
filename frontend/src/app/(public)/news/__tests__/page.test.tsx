import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewsListPage from "../page";
import {
  listNews,
  getArchivedNews,
  type NewsArticleResponse,
  type NewsPageResponse,
} from "@/lib/public-api";

vi.mock("@/lib/public-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/public-api")>(
    "@/lib/public-api",
  );
  return {
    ...actual,
    listNews: vi.fn(),
    getArchivedNews: vi.fn(),
  };
});

const mockArticles: NewsArticleResponse[] = [
  {
    id: "news-1",
    slug: "robotic-surgery-wing",
    title: "Expansion of Robotic Surgery Wing",
    summary: "Integrating next generation haptic units.",
    content: "Full content about robotic surgery.",
    imageUrl: "https://example.com/image1.jpg",
    publishedAt: "2026-10-20T10:00:00Z",
  },
  {
    id: "news-2",
    slug: "patient-experience",
    title: "Patient Experience Reimagined",
    summary: "New architectural standards across North Wing.",
    content: "Full content about patient experience.",
    imageUrl: "https://example.com/image2.jpg",
    publishedAt: "2026-10-15T10:00:00Z",
  },
];

const mockArchive: NewsPageResponse = {
  content: [
    {
      id: "archive-1",
      slug: "global-symposium-2024",
      title: "Annual HMS Global Symposium",
      summary: "Key findings from global health summit.",
      content: "Archive content.",
      imageUrl: null,
      publishedAt: "2026-10-08T10:00:00Z",
    },
  ],
  totalPages: 1,
  totalElements: 1,
  number: 0,
  size: 6,
  first: true,
  last: true,
};

describe("NewsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listNews).mockResolvedValue(mockArticles);
    vi.mocked(getArchivedNews).mockResolvedValue(mockArchive);
  });

  it("loads and displays featured and recent news articles with working links", async () => {
    render(<NewsListPage />);

    expect(
      await screen.findByRole("heading", { name: "Expansion of Robotic Surgery Wing" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Patient Experience Reimagined")).toBeInTheDocument();

    const featuredLink = screen.getByRole("link", { name: /read full article/i });
    expect(featuredLink).toHaveAttribute("href", "/news/robotic-surgery-wing");

    const recentLink = screen.getByRole("link", { name: /read article/i });
    expect(recentLink).toHaveAttribute("href", "/news/patient-experience");
  });

  it("shows error alert on API failure and allows retry", async () => {
    vi.mocked(listNews)
      .mockRejectedValueOnce(new Error("Hospital news server offline"))
      .mockResolvedValueOnce(mockArticles);

    render(<NewsListPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Hospital news server offline");

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await userEvent.click(retryBtn);

    expect(
      await screen.findByRole("heading", { name: "Expansion of Robotic Surgery Wing" }),
    ).toBeInTheDocument();
  });

  it("renders clean empty state when no articles are published", async () => {
    vi.mocked(listNews).mockResolvedValueOnce([]);

    render(<NewsListPage />);

    expect(await screen.findByText(/no news articles published yet/i)).toBeInTheDocument();
  });

  it("opens archive modal and loads archived news", async () => {
    render(<NewsListPage />);

    await screen.findByRole("heading", { name: "Expansion of Robotic Surgery Wing" });

    const archiveBtn = screen.getByRole("button", { name: /browse news archive/i });
    await userEvent.click(archiveBtn);

    expect(await screen.findByText("Hospital News Archive")).toBeInTheDocument();
    expect(await screen.findByText("Annual HMS Global Symposium")).toBeInTheDocument();
    expect(vi.mocked(getArchivedNews)).toHaveBeenCalledWith(0, 6);
  });
});
