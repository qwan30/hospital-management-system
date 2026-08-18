"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCachedData } from "@/lib/use-cached-data";
import {
  listNews,
  getArchivedNews,
  type NewsArticleResponse,
} from "@/lib/public-api";
import { optimizeImageUrl } from "@/lib/image-utils";
import { HcIcon } from "@/components/ui/hc-icon";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=75";

function formatPublishedDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return dateStr;
  }
}

export default function NewsListPage() {
  const [archiveArticles, setArchiveArticles] = useState<NewsArticleResponse[]>([]);
  const [archivePage, setArchivePage] = useState(0);
  const [hasMoreArchive, setHasMoreArchive] = useState(true);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const {
    data: fetchedArticles,
    error,
    isLoading,
    mutate,
  } = useCachedData<NewsArticleResponse[]>("public:news", listNews, {
    ttlMs: 300000,
    persistKey: "news",
  });

  const articles = fetchedArticles ?? [];

  async function loadNews() {
    try {
      await mutate(true);
    } catch {
      // Error in state
    }
  }

  async function loadArchive(pageToLoad: number) {
    setIsLoadingArchive(true);
    try {
      const pageData = await getArchivedNews(pageToLoad, 6);
      if (pageToLoad === 0) {
        setArchiveArticles(pageData.content);
      } else {
        setArchiveArticles((prev) => [...prev, ...pageData.content]);
      }
      setArchivePage(pageToLoad);
      setHasMoreArchive(!pageData.last && pageData.totalPages > pageToLoad + 1);
    } catch {
      // Archive error handled silently or with status
    } finally {
      setIsLoadingArchive(false);
    }
  }

  function handleOpenArchive() {
    setIsArchiveOpen(true);
    if (archiveArticles.length === 0) {
      void loadArchive(0);
    }
  }

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <main className="min-h-screen bg-[var(--hc-background)] pb-24">
      {/* Header Section */}
      <header className="px-6 py-12 md:px-12 md:py-16 bg-white border-b border-[var(--hc-border-soft)]">
        <div className="max-w-7xl mx-auto">
          <p className="font-label text-xs font-semibold uppercase tracking-widest text-[var(--hc-primary)] mb-3">
            Journal &amp; Updates
          </p>
          <h1 className="font-headline text-4xl md:text-6xl font-light tracking-tight text-[var(--hc-text)] max-w-4xl">
            Advancing the frontier of <span className="font-semibold text-[var(--hc-primary)]">clinical excellence</span>.
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        {isLoading ? (
          <div className="space-y-12">
            {/* Featured Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm">
              <div className="lg:col-span-8 aspect-video">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="lg:col-span-4 p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-8 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
                <Skeleton className="h-10 w-36 rounded-[var(--radius-md)]" />
              </div>
            </div>

            {/* List Skeletons */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center"
                >
                  <Skeleton className="w-full md:w-56 aspect-[4/3] rounded-[var(--radius-lg)] shrink-0" />
                  <div className="flex-1 w-full space-y-3">
                    <Skeleton className="h-3 w-28 rounded" />
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-12 w-full rounded" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-[var(--radius-md)] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div
            className="border border-red-200 rounded-[var(--radius-xl)] bg-red-50 p-12 flex flex-col items-center justify-center text-center my-8"
            role="alert"
          >
            <HcIcon name="error_outline" className="text-4xl text-red-500 mb-4" />
            <h2 className="mb-2 text-xl font-bold tracking-tight text-red-900">
              News could not be loaded
            </h2>
            <p className="mb-6 text-sm text-red-700 font-medium max-w-md">{error}</p>
            <button
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
              onClick={() => void loadNews()}
              type="button"
            >
              <HcIcon name="refresh" className="text-base" />
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-white p-16 flex flex-col items-center justify-center text-center my-8 shadow-sm">
            <HcIcon name="article" className="text-4xl text-slate-300 mb-4" />
            <h2 className="mb-2 text-xl font-bold tracking-tight text-[var(--hc-text)]">
              No news articles published yet
            </h2>
            <p className="text-sm text-[var(--hc-text-secondary)] font-medium max-w-md mb-6">
              Our clinical research and hospital updates will appear here once published by the administration.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--hc-blue-700)] transition-colors"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured News Card */}
            {featuredArticle ? (
              <section aria-labelledby="featured-news-heading">
                <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="lg:col-span-8 relative aspect-video lg:aspect-auto min-h-[320px]">
                    <Image
                      className="w-full h-full object-cover"
                      alt={featuredArticle.title}
                      src={optimizeImageUrl(featuredArticle.imageUrl || DEFAULT_NEWS_IMAGE, { width: 1000, quality: 75 })}
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                  <div className="lg:col-span-4 p-8 md:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--hc-border-soft)] bg-white">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest bg-[var(--hc-primary)] text-white px-3 py-1 rounded-full mb-6 inline-block">
                        Featured Update
                      </span>
                      <p className="text-xs font-semibold text-slate-400 mb-2">
                        {formatPublishedDate(featuredArticle.publishedAt)}
                      </p>
                      <h2
                        id="featured-news-heading"
                        className="text-2xl md:text-3xl font-bold text-[var(--hc-text)] mb-4 leading-tight"
                      >
                        {featuredArticle.title}
                      </h2>
                      <p className="text-[var(--hc-text-secondary)] text-sm leading-relaxed mb-6 line-clamp-4 font-medium">
                        {featuredArticle.summary}
                      </p>
                    </div>
                    <Link
                      href={`/news/${encodeURIComponent(featuredArticle.slug)}`}
                      className="inline-flex items-center gap-2 font-semibold text-sm text-[var(--hc-primary)] hover:text-[var(--hc-blue-700)] transition-colors group"
                    >
                      Read Full Article
                      <HcIcon name="arrow_forward" className="text-base group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}

            {/* Remaining Articles List */}
            {remainingArticles.length > 0 ? (
              <section aria-label="Recent articles" className="space-y-6">
                <h3 className="text-xl font-bold text-[var(--hc-text)]">Recent Announcements</h3>
                <div className="grid grid-cols-1 gap-6">
                  {remainingArticles.map((article) => (
                    <article
                      key={article.id}
                      className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                    >
                      <div className="relative w-full md:w-56 aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden shrink-0 bg-slate-100">
                        <Image
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={article.title}
                          src={optimizeImageUrl(article.imageUrl || DEFAULT_NEWS_IMAGE, { width: 400, quality: 75 })}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 224px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-400 mb-2">
                          {formatPublishedDate(article.publishedAt)}
                        </p>
                        <h4 className="text-xl font-bold text-[var(--hc-text)] mb-3 leading-snug group-hover:text-[var(--hc-primary)] transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-sm text-[var(--hc-text-secondary)] font-medium line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>
                      <div className="shrink-0 w-full md:w-auto flex justify-end">
                        <Link
                          href={`/news/${encodeURIComponent(article.slug)}`}
                          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--hc-primary)] hover:bg-slate-50 transition-colors"
                        >
                          Read Article
                          <HcIcon name="arrow_forward" className="text-sm" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Archive Trigger Button */}
            <div className="flex justify-center pt-8">
              <button
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-text)] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-slate-800 transition-colors"
                onClick={handleOpenArchive}
                type="button"
              >
                <HcIcon name="inventory_2" className="text-base" />
                Browse News Archive
              </button>
            </div>
          </div>
        )}

        {/* Archive Modal / Drawer */}
        {isArchiveOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-modal-title"
          >
            <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--hc-border-soft)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-blue-50 text-[var(--hc-primary)]">
                    <HcIcon name="inventory_2" className="text-lg" />
                  </span>
                  <div>
                    <h3 id="archive-modal-title" className="text-lg font-bold text-[var(--hc-text)]">
                      Hospital News Archive
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Historical announcements and clinical updates</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-[var(--radius-md)] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  onClick={() => setIsArchiveOpen(false)}
                  aria-label="Close archive"
                >
                  <HcIcon name="close" className="text-lg" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingArchive && archiveArticles.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border border-slate-100 rounded-lg space-y-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-5 w-3/4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                      </div>
                    ))}
                  </div>
                ) : archiveArticles.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <HcIcon name="folder_open" className="text-4xl text-slate-300 mb-2" />
                    <p className="font-medium text-sm">No archived articles currently available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {archiveArticles.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 border border-[var(--hc-border-soft)] rounded-[var(--radius-lg)] hover:border-slate-300 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            {formatPublishedDate(item.publishedAt)}
                          </span>
                          <h4 className="font-bold text-base text-[var(--hc-text)] mb-1 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[var(--hc-text-secondary)] font-medium line-clamp-2">
                            {item.summary}
                          </p>
                        </div>
                        <Link
                          href={`/news/${encodeURIComponent(item.slug)}`}
                          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--hc-primary)] hover:underline"
                          onClick={() => setIsArchiveOpen(false)}
                        >
                          Read <HcIcon name="arrow_forward" className="text-sm" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {hasMoreArchive && archiveArticles.length > 0 ? (
                <div className="p-4 border-t border-[var(--hc-border-soft)] bg-slate-50 flex justify-center">
                  <button
                    type="button"
                    disabled={isLoadingArchive}
                    onClick={() => void loadArchive(archivePage + 1)}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[var(--hc-primary)] border border-[var(--hc-primary)] rounded-[var(--radius-md)] hover:bg-blue-50 transition"
                  >
                    {isLoadingArchive ? "Loading..." : "Load More Articles"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
