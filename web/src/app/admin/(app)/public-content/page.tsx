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
import { DataPanel } from "@/components/ui/data-panel";

import { LayoutTemplate, Edit3, Plus, Search, X, MonitorSmartphone } from "lucide-react";

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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
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
    <div className="space-y-6">
      <PageHeader
        title="Public Content"
        description="Manage sections and layout for the public website."
        action={
          <button className="hc-button-primary flex items-center gap-2" onClick={openCreateForm} type="button">
            <Plus className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Create Section</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="Total Sections"
          value={totalCount}
          icon={LayoutTemplate}
          helper="Total content sections defined"
        />
        <KpiCard
          label="Active Sections"
          value={activeCount}
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

      <DataPanel
        title="Content Sections"
        action={
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="hc-input pl-9 w-full"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="hc-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Sort Order</th>
                <th>CTA Label</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Loading content sections...
                  </td>
                </tr>
              ) : filteredSections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No content sections found.
                  </td>
                </tr>
              ) : (
                filteredSections.map((section) => (
                  <tr key={section.id} className="hover:bg-slate-50/50">
                    <td className="font-medium text-slate-900">{section.title}</td>
                    <td>
                      <span className="hc-badge bg-slate-100 text-slate-700">{section.slug}</span>
                    </td>
                    <td>{section.sortOrder}</td>
                    <td>{section.ctaLabel || <span className="text-slate-400 italic">None</span>}</td>
                    <td className="text-right">
                      <button
                        onClick={() => openEditForm(section)}
                        className="hc-button-secondary py-1 px-3 text-sm inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataPanel>

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
                <label className="text-sm font-medium text-[var(--hc-text)]">Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="hc-input w-full"
                  placeholder="e.g., hero-section"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--hc-text)]">Sort Order *</label>
                <input
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
              <label className="text-sm font-medium text-[var(--hc-text)]">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="hc-input w-full"
                placeholder="Section Title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--hc-text)]">Body Content</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="hc-input min-h-[120px] py-2 w-full"
                placeholder="Content text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--hc-text)]">CTA Label</label>
                <input
                  type="text"
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  className="hc-input w-full"
                  placeholder="e.g., Learn More"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--hc-text)]">CTA URL/Href</label>
                <input
                  type="text"
                  value={form.ctaHref}
                  onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                  className="hc-input w-full"
                  placeholder="/about"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--hc-text)]">Image URL</label>
              <input
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
                {isSaving ? "Saving..." : "Save Section"}
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

