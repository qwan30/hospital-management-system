"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getNewsArticle, type NewsArticleResponse } from "@/lib/public-api";
import { HcIcon } from "@/components/ui/hc-icon";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_NEWS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDTB9qdGsTuPH1B-DmoNJdYl3BxfyAJW1x84Mk4q-PUqIw_tAo5NwffwHDxkWrVx83W-uY4jBuQVgCAYc1WARbmYH67HPoLfxTjBI4PJwXQ1sVXaCTxH-by5rgXC258yN8uXVwYXLxnHZyIMlkVfL6dTKxs8c4jUrNJQ1hgoKt_6V09-l0VUpb_HqmKuuZDrKhn1qUIC9e5aiPnzoKeg1sGjFj_GoqbxiNUbUiBrERNNtwKsSGiWWTNIB31oI7OeNn6j3Mt6mokaQ";

function formatPublishedDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function NewsArticleDetailPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam ?? "";

  const [article, setArticle] = useState<NewsArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadArticle(articleSlug: string) {
    if (!articleSlug) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNewsArticle(articleSlug);
      setArticle(data);
    } catch (err) {
      setArticle(null);
      setError(
        err instanceof Error
          ? err.message
          : "The requested news article could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;
    if (slug) {
      getNewsArticle(slug)
        .then((data) => {
          if (isActive) {
            setArticle(data);
            setError(null);
          }
        })
        .catch((err) => {
          if (isActive) {
            setArticle(null);
            setError(
              err instanceof Error
                ? err.message
                : "The requested news article could not be loaded.",
            );
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isActive = false;
    };
  }, [slug]);

  return (
    <main className="min-h-screen bg-[var(--hc-background)] pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-[var(--hc-border-soft)] py-4 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[var(--hc-primary)] transition">
            Home
          </Link>
          <HcIcon name="chevron_right" className="text-sm" />
          <Link href="/news" className="hover:text-[var(--hc-primary)] transition">
            News
          </Link>
          <HcIcon name="chevron_right" className="text-sm" />
          <span className="text-slate-800 truncate max-w-[200px] sm:max-w-md">
            {article?.title || slug}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-10">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--hc-primary)] hover:underline"
          >
            <HcIcon name="arrow_back" className="text-base" />
            Back to All News
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 md:p-12 space-y-6 shadow-sm">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-10 w-3/4 rounded" />
            <Skeleton className="w-full aspect-[2/1] rounded-[var(--radius-lg)]" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>
          </div>
        ) : error ? (
          <div
            className="border border-red-200 rounded-[var(--radius-xl)] bg-red-50 p-12 flex flex-col items-center justify-center text-center my-8 shadow-sm"
            role="alert"
          >
            <HcIcon name="error_outline" className="text-4xl text-red-500 mb-4" />
            <h2 className="mb-2 text-xl font-bold tracking-tight text-red-900">
              Article not found
            </h2>
            <p className="mb-6 text-sm text-red-700 font-medium max-w-md">{error}</p>
            <div className="flex gap-4">
              <button
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
                onClick={() => void loadArticle(slug)}
                type="button"
              >
                <HcIcon name="refresh" className="text-base" />
                Retry
              </button>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-red-300 bg-white px-6 py-2.5 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50 transition"
              >
                Return to News
              </Link>
            </div>
          </div>
        ) : article ? (
          <article className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] overflow-hidden shadow-sm">
            {/* Featured Image */}
            <div className="relative w-full aspect-[2/1] bg-slate-100">
              <Image
                src={article.imageUrl || DEFAULT_NEWS_IMAGE}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>

            {/* Article Content Header */}
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-widest bg-blue-50 text-[var(--hc-primary)] px-3 py-1 rounded-full border border-blue-100">
                  Clinical News
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {formatPublishedDate(article.publishedAt)}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--hc-text)] tracking-tight mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Summary lead */}
              {article.summary ? (
                <div className="text-lg md:text-xl font-medium text-[var(--hc-text-secondary)] leading-relaxed mb-8 border-l-4 border-[var(--hc-primary)] pl-5 py-1 bg-slate-50 rounded-r-lg">
                  {article.summary}
                </div>
              ) : null}

              {/* Article Main Body */}
              <div className="prose prose-slate max-w-none text-[var(--hc-text)] leading-relaxed font-sans text-base space-y-6 pt-4 border-t border-slate-100">
                {article.content ? (
                  article.content
                    .split("\n\n")
                    .map((paragraph, index) => (
                      <p key={index} className="text-slate-700 leading-relaxed text-base">
                        {paragraph}
                      </p>
                    ))
                ) : (
                  <p className="text-slate-500 italic">No additional body content provided.</p>
                )}
              </div>

              {/* Footer / Back link */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition"
                >
                  <HcIcon name="arrow_back" className="text-sm" />
                  All Articles
                </Link>

                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-primary)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[var(--hc-blue-700)] transition"
                >
                  Book Consultation
                  <HcIcon name="arrow_forward" className="text-sm" />
                </Link>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </main>
  );
}
