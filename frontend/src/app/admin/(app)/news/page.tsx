"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminNewsArticle,
  listAdminNewsArticles,
  updateAdminNewsArticle,
  type AdminNewsArticleResponse,
  type AdminNewsArticleUpsertRequest,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Dialog } from "@/components/ui/dialog";
import { Newspaper, CalendarClock, Plus, Search, FileText, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsFormState {
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  active: boolean;
}

const emptyForm: NewsFormState = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  imageUrl: "",
  publishedAt: "",
  active: true,
};

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<AdminNewsArticleResponse[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ArticleStatus>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<AdminNewsArticleResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<NewsFormState>(emptyForm);

  const loadArticles = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const nextArticles = await listAdminNewsArticles();
      if (!isMounted()) {
        return;
      }
      setArticles(nextArticles);
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setArticles([]);
      setError(errorMessage(caught, "Unable to load news articles."));
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadArticles(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadArticles]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesQuery =
        !normalizedQuery ||
        [article.title, article.summary, article.slug]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const status = getArticleStatus(article);
      return matchesQuery && (statusFilter === "ALL" || status === statusFilter);
    });
  }, [articles, query, statusFilter]);

  const publishedCount = articles.filter((article) => getArticleStatus(article) === "Published").length;
  const scheduledCount = articles.filter((article) => getArticleStatus(article) === "Scheduled").length;
  const draftCount = articles.filter((article) => getArticleStatus(article) === "Draft").length;

  function openCreateForm() {
    setEditingArticle(null);
    setForm(emptyForm);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(article: AdminNewsArticleResponse) {
    setEditingArticle(article);
    setForm({
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content: article.content ?? "",
      imageUrl: article.imageUrl ?? "",
      publishedAt: toDateTimeLocal(article.publishedAt),
      active: true,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = toRequest(form);
    setFormError(null);
    setSuccess(null);

    if (!request.slug || !request.title || !request.summary) {
      setFormError("Slug, title, and summary are required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingArticle
        ? await updateAdminNewsArticle(editingArticle.id, request)
        : await createAdminNewsArticle(request);
      setSuccess(saved ? `Article ${saved.title} saved.` : "Article saved.");
      setIsFormOpen(false);
      setEditingArticle(null);
      setForm(emptyForm);
      await loadArticles();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save news article."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="COMMUNICATIONS"
        title="Hospital News"
        description="Internal Communications • Manage news, updates, and announcements."
        action={
          <button className="hc-button-primary flex items-center gap-2 h-10 px-5" onClick={openCreateForm} type="button">
            <Plus className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Create Article</span>
          </button>
        }
      />

      {error ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">
          {error}
        </div>
      ) : null}
      {formError ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-danger)] bg-[var(--hc-danger-bg)] p-4 text-sm font-medium text-[var(--hc-danger)]" role="alert">
          {formError}
        </div>
      ) : null}
      {success ? (
        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--hc-success)] bg-[var(--hc-success-bg)] p-4 text-sm font-medium text-[var(--hc-success)]" role="status">
          {success}
        </div>
      ) : null}

      <div className="hc-kpi-grid mb-6">
        <KpiCard label="PUBLISHED" value={publishedCount.toString()} icon={Newspaper} tone="green" helper="Live articles" />
        <KpiCard label="SCHEDULED" value={scheduledCount.toString()} icon={CalendarClock} tone="blue" helper="Pending publication" />
        <KpiCard label="DRAFTS" value={draftCount.toString()} icon={FileText} tone="amber" helper="Work in progress" />
        <KpiCard label="TOTAL" value={articles.length.toString()} icon={Newspaper} tone="teal" helper="All articles" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6 bg-[var(--hc-surface)] p-3 rounded-xl border border-[var(--hc-border-soft)] shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
          <input
            type="search"
            aria-label="Search news articles"
            placeholder="Search by title, summary, or slug..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]"
            onChange={(event) => setQuery(event.target.value)}
            value={query}
          />
        </div>

        <div className="flex-none">
          <select
            className="h-9 px-3 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] text-[var(--hc-text-secondary)]"
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | ArticleStatus)}
            value={statusFilter}
            aria-label="Filter news by status"
          >
            <option value="ALL">Status: All</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <button className="hc-button-secondary flex items-center gap-2 h-9 px-4 ml-auto">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 7.33333L8 10.6667M8 10.6667L4.66667 7.33333M8 10.6667V2" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold text-xs text-[var(--hc-text-secondary)]">Export CSV</span>
        </button>
      </div>

      <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading news articles...</div>
        ) : (
          <NewsTable articles={filteredArticles} isSaving={isSaving} onEdit={openEditForm} />
        )}
      </div>

      {isFormOpen ? (
        <Dialog isOpen={isFormOpen} title={editingArticle ? "Edit Article" : "Create Article"} onClose={() => setIsFormOpen(false)}>
          <ArticleForm form={form} isSaving={isSaving} onChange={setForm} onSubmit={handleSubmit} />
        </Dialog>
      ) : null}
    </div>
  );
}

type ArticleStatus = "Published" | "Scheduled" | "Draft";

function NewsTable({
  articles,
  isSaving,
  onEdit,
}: {
  articles: AdminNewsArticleResponse[];
  isSaving: boolean;
  onEdit: (article: AdminNewsArticleResponse) => void;
}) {
  if (articles.length === 0) {
    return <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">No news articles match the current filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="hc-table">
        <thead>
          <tr>
            <th className="w-[30%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                TITLE & SUMMARY <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[20%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                SLUG <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[20%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                PUBLISH DATE <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[15%]">
              <div className="flex items-center gap-2 cursor-pointer group">
                STATUS <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-[var(--hc-text-muted)] transition-colors" />
              </div>
            </th>
            <th className="w-[15%] text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="group hover:bg-[var(--hc-background)] transition-colors">
              <td>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--hc-surface-soft)] flex items-center justify-center shrink-0 border border-slate-200">
                    <Newspaper className="w-5 h-5 text-[var(--hc-text-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-sm font-bold text-[var(--hc-text)] truncate">{article.title}</div>
                    <div className="text-xs text-[var(--hc-text-secondary)] line-clamp-1 mt-0.5" title={article.summary}>{article.summary}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-sm font-medium text-[var(--hc-text-secondary)] font-mono">{article.slug}</div>
              </td>
              <td>
                <div className="text-sm font-medium text-[var(--hc-text)]">{formatDate(article.publishedAt)}</div>
              </td>
              <td>
                <StatusBadge status={getArticleStatus(article)} />
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="h-8 px-3 text-xs font-semibold text-[var(--hc-blue-600)] bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-surface-soft)] hover:border-slate-300 transition-colors disabled:opacity-50"
                    disabled={isSaving}
                    onClick={() => onEdit(article)}
                    aria-label={`Edit ${article.title}`}
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)]">
        <span className="text-xs text-[var(--hc-text-secondary)] font-medium">
          Showing 1 to {articles.length} of {articles.length} articles
        </span>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] text-[var(--hc-text-muted)] hover:bg-[var(--hc-surface-soft)] disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--hc-blue-600)] text-white text-xs font-medium">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-[var(--hc-surface)] text-[var(--hc-text-muted)] hover:bg-[var(--hc-surface-soft)] disabled:opacity-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleForm({
  form,
  isSaving,
  onChange,
  onSubmit,
}: {
  form: NewsFormState;
  isSaving: boolean;
  onChange: (form: NewsFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-5">
        <FormInput label="Slug" onChange={(value) => onChange({ ...form, slug: value })} required value={form.slug} />
        <FormInput label="Title" onChange={(value) => onChange({ ...form, title: value })} required value={form.title} />
      </div>
      <FormTextArea label="Summary" onChange={(value) => onChange({ ...form, summary: value })} required value={form.summary} />
      <FormTextArea label="Content" onChange={(value) => onChange({ ...form, content: value })} value={form.content} />
      <FormInput label="Image URL" onChange={(value) => onChange({ ...form, imageUrl: value })} value={form.imageUrl} />

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">Publish Date</label>
          <input
            className="hc-input w-full"
            onChange={(event) => onChange({ ...form, publishedAt: event.target.value })}
            type="datetime-local"
            value={form.publishedAt}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text)]">
            <input
              checked={form.active}
              className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--hc-border-soft)] text-[var(--hc-blue-600)] focus:ring-[var(--hc-blue-500)]"
              onChange={(event) => onChange({ ...form, active: event.target.checked })}
              type="checkbox"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--hc-border-soft)]">
        <button className="hc-button-primary disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save Article"}
        </button>
      </div>
    </form>
  );
}

function FormInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">{label}</label>
      <input
        aria-label={label}
        className="hc-input w-full"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
    </div>
  );
}

function FormTextArea({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">{label}</label>
      <textarea
        aria-label={label}
        className="hc-input w-full"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={3}
        value={value}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  if (status === "Published") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--hc-success)] bg-[var(--hc-success-bg)] text-[var(--hc-success)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--hc-success)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Published</span>
      </div>
    );
  } else if (status === "Scheduled") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--hc-blue-500)] bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)]">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--hc-blue-500)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Scheduled</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-300 bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)]">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Draft</span>
    </div>
  );
}



function toRequest(form: NewsFormState): AdminNewsArticleUpsertRequest {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    summary: form.summary.trim(),
    content: nullableText(form.content),
    imageUrl: nullableText(form.imageUrl),
    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
    active: form.active,
  };
}

function getArticleStatus(article: AdminNewsArticleResponse): ArticleStatus {
  if (!article.publishedAt) {
    return "Draft";
  }

  return new Date(article.publishedAt).getTime() > Date.now() ? "Scheduled" : "Published";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}
