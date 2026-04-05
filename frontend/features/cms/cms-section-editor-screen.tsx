"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import Link from "next/link";
import { AdminRouteGuard } from "../auth/admin-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import { EditorCard, EditorShell } from "../editor-ui/editor-ui";
import { WorkspaceAction, WorkspaceBadge } from "../workspace-ui/workspace-ui";
import styles from "./cms-section-editor-screen.module.css";

type ContentSection = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly body: string | null;
  readonly imageUrl: string | null;
  readonly ctaLabel: string | null;
  readonly ctaHref: string | null;
  readonly sortOrder: number;
};

type EditableSection = {
  readonly slug: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly sortOrder: number;
  readonly active: boolean;
};

type CmsSectionEditorScreenProps = {
  readonly sectionId: string;
};

export function CmsSectionEditorScreen({ sectionId }: CmsSectionEditorScreenProps) {
  return (
    <AdminRouteGuard
      fallback={
        <EditorState
          title="Checking editor access"
          description="Restoring the admin session before loading the section editor."
        />
      }
      forbiddenFallback={
        <EditorState
          title="Admin access required"
          description="Only admin sessions can edit homepage sections."
        />
      }
    >
      <CmsSectionEditorContent sectionId={sectionId} />
    </AdminRouteGuard>
  );
}

function CmsSectionEditorContent({ sectionId }: CmsSectionEditorScreenProps) {
  const { apiFetch, logout, session } = useAuth();
  const [sections, setSections] = useState<readonly ContentSection[]>([]);
  const [formState, setFormState] = useState<EditableSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === sectionId) ?? null,
    [sectionId, sections]
  );

  const loadSection = useEffectEvent(async () => {
    setLoading(true);

    try {
      const sectionResponse = await apiFetch<ContentSection[]>("/admin/content/sections");
      setSections(sectionResponse);
      const matched = sectionResponse.find((section) => section.id === sectionId) ?? null;
      setFormState(
        matched
          ? {
              active: true,
              body: matched.body ?? "",
              ctaHref: matched.ctaHref ?? "",
              ctaLabel: matched.ctaLabel ?? "",
              imageUrl: matched.imageUrl ?? "",
              slug: matched.slug,
              sortOrder: matched.sortOrder,
              title: matched.title
            }
          : null
      );
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void loadSection();
  }, [sectionId]);

  async function handleSave() {
    if (!formState) {
      return;
    }

    setSaving(true);
    setSuccessMessage(null);

    try {
      await apiFetch(`/admin/content/sections/${sectionId}`, {
        body: formState,
        method: "PUT"
      });
      setSuccessMessage("Section changes saved.");
      await loadSection();
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout("staff");
    window.location.assign("/login");
  }

  if (loading) {
    return (
      <EditorState
        title="Loading section editor"
        description="Fetching the latest homepage section contract from the admin API."
      />
    );
  }

  if (!selectedSection || !formState) {
    return (
      <EditorState
        title="Section not found"
        description="The requested content block is not available in the current CMS dataset."
      />
    );
  }

  return (
    <EditorShell
      header={
        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>Website section editor</div>
            <h1 className={styles.title}>{selectedSection.title}</h1>
            <p className={styles.summary}>
              Edit the source content for this homepage block and keep the public CTA contract visible while you work.
            </p>
          </div>
          <div className={styles.headerActions}>
            <WorkspaceAction href="/cms" tone="secondary">
              Back to CMS
            </WorkspaceAction>
            <WorkspaceAction
              onClick={() => {
                void handleSave();
              }}
              tone="primary"
            >
              {saving ? "Saving..." : "Save section"}
            </WorkspaceAction>
            <WorkspaceAction
              onClick={() => {
                void handleLogout();
              }}
              tone="ghost"
            >
              Sign out
            </WorkspaceAction>
          </div>
        </div>
      }
      sidebar={
        <>
          <EditorCard eyebrow="Metadata" title="Section metadata">
            <div className={styles.sidebarList}>
              <div className={styles.sidebarItem}>
                <span>Slug</span>
                <strong>{formState.slug}</strong>
              </div>
              <div className={styles.sidebarItem}>
                <span>Sort order</span>
                <strong>{formState.sortOrder}</strong>
              </div>
              <div className={styles.sidebarItem}>
                <span>Editor</span>
                <strong>{session?.fullName ?? "Admin"}</strong>
              </div>
            </div>
          </EditorCard>
          <EditorCard eyebrow="Preview" title="CTA and summary">
            <div className={styles.previewTitle}>{formState.title}</div>
            <p className={styles.previewBody}>{formState.body || "No body copy yet."}</p>
            {formState.ctaLabel ? (
              <WorkspaceBadge tone="green">{formState.ctaLabel}</WorkspaceBadge>
            ) : null}
            {formState.ctaHref ? (
              <p className={styles.previewHref}>{formState.ctaHref}</p>
            ) : null}
          </EditorCard>
        </>
      }
    >
      <div className={styles.editorColumn}>
        {errorMessage ? <div className={styles.noticeDanger}>{errorMessage}</div> : null}
        {successMessage ? <div className={styles.noticeSuccess}>{successMessage}</div> : null}

        <EditorCard eyebrow="Content" title="Section content">
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Slug</span>
              <input
                onChange={(event) =>
                  setFormState((current) =>
                    current ? { ...current, slug: event.target.value } : current
                  )
                }
                type="text"
                value={formState.slug}
              />
            </label>
            <label className={styles.field}>
              <span>Title</span>
              <input
                onChange={(event) =>
                  setFormState((current) =>
                    current ? { ...current, title: event.target.value } : current
                  )
                }
                type="text"
                value={formState.title}
              />
            </label>
            <label className={styles.fieldWide}>
              <span>Body</span>
              <textarea
                onChange={(event) =>
                  setFormState((current) =>
                    current ? { ...current, body: event.target.value } : current
                  )
                }
                rows={8}
                value={formState.body}
              />
            </label>
          </div>
        </EditorCard>

        <EditorCard eyebrow="Actions" title="CTA and media contract">
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>CTA label</span>
              <input
                onChange={(event) =>
                  setFormState((current) =>
                    current ? { ...current, ctaLabel: event.target.value } : current
                  )
                }
                type="text"
                value={formState.ctaLabel}
              />
            </label>
            <label className={styles.field}>
              <span>CTA href</span>
              <input
                onChange={(event) =>
                  setFormState((current) =>
                    current ? { ...current, ctaHref: event.target.value } : current
                  )
                }
                type="text"
                value={formState.ctaHref}
              />
            </label>
            <label className={styles.fieldWide}>
              <span>Image URL</span>
              <input
                onChange={(event) =>
                  setFormState((current) =>
                    current ? { ...current, imageUrl: event.target.value } : current
                  )
                }
                type="text"
                value={formState.imageUrl}
              />
            </label>
          </div>
        </EditorCard>

        <EditorCard eyebrow="Navigation" title="Sibling sections">
          <div className={styles.linkList}>
            {sections.map((section) => (
              <Link
                key={section.id}
                className={section.id === sectionId ? styles.linkActive : styles.link}
                href={`/cms/sections/${section.id}`}
              >
                <span>{section.title}</span>
                <span>{section.slug}</span>
              </Link>
            ))}
          </div>
        </EditorCard>
      </div>
    </EditorShell>
  );
}

function EditorState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <div className={styles.eyebrow}>Website section editor</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.summary}>{description}</p>
      </div>
    </div>
  );
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load the section editor right now.";
}
