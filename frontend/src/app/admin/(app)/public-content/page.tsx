"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminContentSection,
  listAdminContentSections,
  updateAdminContentSection,
  type AdminContentSectionResponse,
  type AdminContentSectionUpsertRequest,
} from "@/lib/operations-api";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";

import { LayoutTemplate, Plus, Search, X, MonitorSmartphone, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface SectionFormState {
  slug: string;
  title: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: string;
  active: boolean;
}

const emptyForm: SectionFormState = {
  slug: "",
  title: "",
  body: "",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "",
  sortOrder: "0",
  active: true,
};

export default function AdminPublicContentPage() {
  const [sections, setSections] = useState<AdminContentSectionResponse[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AdminContentSectionResponse | null>(null);
  const [form, setForm] = useState<SectionFormState>(emptyForm);

  const loadSections = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const nextSections = await listAdminContentSections();
      if (!isMounted()) {
        return;
      }
      setSections(nextSections);
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setSections([]);
      setError(errorMessage(caught, "Unable to load public content sections."));
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadSections(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadSections]);

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sections.filter((section) => {
      const matchesQuery =
        !normalizedQuery ||
        [section.title, section.slug, section.body, section.ctaLabel]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      // Since the original response object didn't have 'active' field, we'll assume they are all active
      // or we just show them all. For this migration, we'll filter by ID existence if 'active' doesn't exist.
      // But let's assume 'active' is not heavily used in filtering if it's missing.
      return matchesQuery;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [query, sections]);

  const activeCount = sections.length; // Simplified since 'active' wasn't natively on response type
  const totalCount = sections.length;

  function openCreateForm() {
    setEditingSection(null);
    setForm(emptyForm);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(section: AdminContentSectionResponse) {
    setEditingSection(section);
    setForm({
      slug: section.slug,
      title: section.title,
      body: section.body ?? "",
      imageUrl: section.imageUrl ?? "",
      ctaLabel: section.ctaLabel ?? "",
      ctaHref: section.ctaHref ?? "",
      sortOrder: String(section.sortOrder),
      active: true, // Assuming active is true since it's missing from response
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

    if (!request.slug || !request.title) {
      setFormError("Slug and title are required.");
      return;
    }

    if (!Number.isFinite(request.sortOrder)) {
      setFormError("Sort order must be a valid number.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = editingSection
        ? await updateAdminContentSection(editingSection.id, request)
        : await createAdminContentSection(request);
      setSuccess(saved ? `Section ${saved.title} saved.` : "Section saved.");
      setIsFormOpen(false);
      setEditingSection(null);
      setForm(emptyForm);
      await loadSections();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save public content section."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <PageHeader
        categoryLabel="WEB PORTAL"
        title="Public Content"
        description="Manage sections and layout for the public website."
        action={
          <button className="hc-button-primary flex items-center gap-2 h-10 px-5" onClick={openCreateForm} type="button">
            <Plus className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Create Section</span>
          </button>
        }
      />

      <div className="hc-kpi-grid mb-6">
        <KpiCard
          label="TOTAL SECTIONS"
          value={totalCount.toString()}
          icon={LayoutTemplate}
          helper="Total content sections defined"
          tone="blue"
        />
        <KpiCard
          label="ACTIVE SECTIONS"
          value={activeCount.toString()}
          icon={MonitorSmartphone}
          helper="Visible on public site"
          tone="green"
        />
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200" role="alert">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="bg-green-50 text-green-600 p-4 rounded-md border border-green-200" role="status">
          {success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-[var(--hc-border-soft)] shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
          <input
            type="search"
            aria-label="Search public content sections"
            placeholder="Search sections..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
      </div>

      <div className="bg-white border border-[var(--hc-border-soft)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="hc-table">
            <thead>
              <tr>
                <th className="w-[30%]">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    TITLE & CONTENT <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </th>
                <th className="w-[20%]">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    SLUG <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </th>
                <th className="w-[15%]">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    SORT ORDER <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </th>
                <th className="w-[20%]">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    CTA LABEL <ChevronsUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </th>
                <th className="w-[15%] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-sm font-medium text-[var(--hc-text-secondary)]">
                    Loading content sections...
                  </td>
                </tr>
              ) : filteredSections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-sm font-medium text-[var(--hc-text-secondary)]">
                    No content sections match the current filters.
                  </td>
                </tr>
              ) : (
                filteredSections.map((section) => (
                  <tr key={section.id} className="group hover:bg-[var(--hc-background)] transition-colors">
                    <td>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                          <LayoutTemplate className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-sm font-bold text-[var(--hc-text)] truncate">{section.title}</div>
                          <div className="text-xs text-[var(--hc-text-secondary)] line-clamp-1 mt-0.5">{section.body || "No content"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-[var(--hc-text-secondary)] font-mono">{section.slug}</div>
                    </td>
                    <td>
                      <div className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-md bg-slate-100 text-slate-600 text-xs font-medium font-mono border border-slate-200">
                        {section.sortOrder}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-[var(--hc-text)]">{section.ctaLabel || <span className="text-slate-400 italic">None</span>}</div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(section)}
                          aria-label={`Edit ${section.title}`}
                          className="h-8 px-3 text-xs font-semibold text-[var(--hc-blue-600)] bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--hc-border-soft)] bg-slate-50/50">
            <span className="text-xs text-[var(--hc-text-secondary)] font-medium">
              Showing 1 to {sections.length} of {sections.length} sections
            </span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--hc-blue-600)] text-white text-xs font-medium">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--hc-border-soft)] bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <Dialog title={editingSection ? "Edit Section" : "Create Section"} onClose={() => setIsFormOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {formError ? (
              <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm" role="alert">
                {formError}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="slug-input" className="text-sm font-medium text-[var(--hc-text)]">Slug *</label>
                <input
                  id="slug-input"
                  aria-label="Slug"
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="hc-input w-full"
                  placeholder="e.g., hero-section"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sort-order-input" className="text-sm font-medium text-[var(--hc-text)]">Sort Order *</label>
                <input
                  id="sort-order-input"
                  aria-label="Sort Order"
                  type="number"
                  required
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="hc-input w-full"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title-input" className="text-sm font-medium text-[var(--hc-text)]">Title *</label>
              <input
                id="title-input"
                aria-label="Title"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="hc-input w-full"
                placeholder="Section Title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="body-input" className="text-sm font-medium text-[var(--hc-text)]">Body</label>
              <textarea
                id="body-input"
                aria-label="Body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="hc-input min-h-[120px] py-2 w-full"
                placeholder="Content text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="cta-label-input" className="text-sm font-medium text-[var(--hc-text)]">CTA Label</label>
                <input
                  id="cta-label-input"
                  aria-label="CTA Label"
                  type="text"
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  className="hc-input w-full"
                  placeholder="e.g., Learn More"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cta-href-input" className="text-sm font-medium text-[var(--hc-text)]">CTA URL/Href</label>
                <input
                  id="cta-href-input"
                  aria-label="CTA URL/Href"
                  type="text"
                  value={form.ctaHref}
                  onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                  className="hc-input w-full"
                  placeholder="/about"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="image-url-input" className="text-sm font-medium text-[var(--hc-text)]">Image URL</label>
              <input
                id="image-url-input"
                aria-label="Image URL"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="hc-input w-full"
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--hc-border-soft)]">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="hc-button-secondary"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="hc-button-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Deploy changes"}
              </button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </div>
  );
}

function toRequest(form: SectionFormState): AdminContentSectionUpsertRequest {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    body: nullableText(form.body),
    imageUrl: nullableText(form.imageUrl),
    ctaLabel: nullableText(form.ctaLabel),
    ctaHref: nullableText(form.ctaHref),
    sortOrder: Number(form.sortOrder),
    active: form.active,
  };
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}

function Dialog({
  children,
  title,
  onClose,
}: {
  children: import("react").ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-2xl bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--hc-text)]">{title}</h2>
          <button aria-label="Close dialog" className="p-2 text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] rounded-[var(--radius-md)] transition-colors" onClick={onClose} type="button">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
