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
import { DataPanel } from "@/components/ui/data-panel";
import { Dialog } from "@/components/ui/dialog";
import { Newspaper, CalendarClock, Edit3, Plus, Search, FileText } from "lucide-react";

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
    <div className="p-8 pb-20">
      <PageHeader
        title="Hospital News"
        description="Internal Communications • Manage news and updates"
        action={
          <button className="hc-button-primary flex items-center gap-2" onClick={openCreateForm} type="button">
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

      <div className="hc-kpi-grid mb-8">
        <KpiCard label="Published" value={publishedCount.toString()} icon={Newspaper} tone="green" />
        <KpiCard label="Scheduled" value={scheduledCount.toString()} icon={CalendarClock} tone="blue" />
        <KpiCard label="Drafts" value={draftCount.toString()} icon={FileText} tone="amber" />
      </div>

      <DataPanel
        title="News Articles"
        action={
          <div className="flex items-center gap-4">
            <select
              aria-label="Filter news by status"
              className="hc-input py-2 text-xs w-48"
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | ArticleStatus)}
              value={statusFilter}
            >
              <option value="ALL">Status: All</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Draft">Draft</option>
            </select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] w-4 h-4" />
              <input
                className="hc-input pl-9 py-2 text-xs w-full"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search news..."
                type="search"
                value={query}
              />
            </div>
          </div>
        }
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-[var(--hc-text-secondary)]">Loading news articles...</div>
        ) : (
          <NewsTable articles={filteredArticles} isSaving={isSaving} onEdit={openEditForm} />
        )}

        <div className="flex items-center justify-between p-4 bg-[var(--hc-surface-soft)] border-t border-[var(--hc-border-soft)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            Showing {filteredArticles.length} of {articles.length} articles
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
            Pagination is not exposed by the current admin news API
          </span>
        </div>
      </DataPanel>

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
            <th>Title & Summary</th>
            <th>Slug</th>
            <th>Publish Date</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>
                <div className="font-semibold text-[var(--hc-text)] text-sm">{article.title}</div>
                <div className="text-xs text-[var(--hc-text-secondary)] mt-1">{article.summary}</div>
              </td>
              <td className="text-sm text-[var(--hc-text-secondary)] font-mono">{article.slug}</td>
              <td className="text-sm text-[var(--hc-text-secondary)]">{formatDate(article.publishedAt)}</td>
              <td>
                <StatusBadge status={getArticleStatus(article)} />
              </td>
              <td className="text-right">
                <button
                  className="hc-button-secondary py-1.5 px-3 text-[11px]"
                  disabled={isSaving}
                  onClick={() => onEdit(article)}
                  type="button"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const className =
    status === "Published"
      ? "bg-[var(--hc-success-bg)] text-[var(--hc-success)] border-[var(--hc-success-bg)]"
      : status === "Scheduled"
        ? "bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] border-[var(--hc-blue-50)]"
        : "bg-[var(--hc-surface-soft)] text-[var(--hc-text)] border-[var(--hc-border-soft)]";

  return <span className={`hc-badge ${className}`}>{status}</span>;
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
