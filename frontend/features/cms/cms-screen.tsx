"use client";

import { useEffect, useEffectEvent, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AdminRouteGuard } from "../auth/admin-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import {
  CalendarGlyph,
  ClipboardGlyph,
  HomeGlyph,
  SearchGlyph,
  WorkspaceAction,
  WorkspaceBadge,
  WorkspaceMetricCard,
  WorkspaceMetricGrid,
  WorkspacePageIntro,
  WorkspacePanel,
  WorkspaceShell,
  type WorkspaceNavItem
} from "../workspace-ui/workspace-ui";
import styles from "./cms-screen.module.css";

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

type PublicContent = {
  readonly contentId: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly imageUrl: string | null;
  readonly publishedAt: string | null;
  readonly active: boolean;
};

type NewsArticle = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string | null;
  readonly content: string | null;
  readonly imageUrl: string | null;
  readonly publishedAt: string | null;
};

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Overview", href: "#overview", active: true, icon: <HomeGlyph /> },
  { label: "Sections", href: "#sections", icon: <ClipboardGlyph /> },
  { label: "News", href: "#news", icon: <CalendarGlyph /> },
  { label: "Monitoring", href: "/admin-monitoring", icon: <SearchGlyph /> }
] as const;

export function CmsScreen() {
  return (
    <AdminRouteGuard
      fallback={
        <CmsState
          title="Checking CMS access"
          description="Restoring the admin session before loading editable public content."
        />
      }
      forbiddenFallback={
        <CmsState
          title="Admin access required"
          description="Only admin sessions can manage homepage sections and public content."
        />
      }
    >
      <CmsContent />
    </AdminRouteGuard>
  );
}

function CmsContent() {
  const { apiFetch, logout, session } = useAuth();
  const [sections, setSections] = useState<readonly ContentSection[]>([]);
  const [publicContent, setPublicContent] = useState<readonly PublicContent[]>([]);
  const [news, setNews] = useState<readonly NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userName = session?.fullName ?? "Admin";

  const featuredSections = useMemo(
    () => [...sections].sort((left, right) => left.sortOrder - right.sortOrder).slice(0, 4),
    [sections]
  );

  const loadCms = useEffectEvent(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [sectionResponse, publicContentResponse, newsResponse] = await Promise.all([
        apiFetch<ContentSection[]>("/admin/content/sections"),
        apiFetch<PublicContent[]>("/admin/public-content"),
        apiFetch<NewsArticle[]>("/admin/news")
      ]);
      setSections(sectionResponse);
      setPublicContent(publicContentResponse);
      setNews(newsResponse);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  });

  useEffect(() => {
    void loadCms("initial");
  }, []);

  async function handleLogout() {
    await logout("staff");
    window.location.assign("/login");
  }

  if (loading) {
    return (
      <CmsFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadCms("refresh");
        }}
        refreshing={refreshing}
        userName={userName}
      >
        <CmsState
          title="Loading content workspace"
          description="Fetching homepage sections, public content cards, and news entries."
        />
      </CmsFrame>
    );
  }

  if (errorMessage && sections.length === 0 && publicContent.length === 0 && news.length === 0) {
    return (
      <CmsFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadCms("refresh");
        }}
        refreshing={refreshing}
        userName={userName}
      >
        <CmsState title="Unable to load CMS workspace" description={errorMessage} />
      </CmsFrame>
    );
  }

  return (
    <CmsFrame
      onLogout={handleLogout}
      onRefresh={() => {
        void loadCms("refresh");
      }}
      refreshing={refreshing}
      userName={userName}
    >
      <WorkspacePageIntro
        eyebrow="Content operations"
        title="Hospital CMS"
        summary="Organize homepage sections, inspect the public publishing queue, and route editors directly into detailed section editing without leaving the internal workspace."
        aside={
          <>
            <WorkspaceBadge tone="cyan">{sections.length} sections</WorkspaceBadge>
            <WorkspaceBadge tone="green">{publicContent.length} public cards</WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="cyan"
          label="Content sections"
          value={sections.length.toString().padStart(2, "0")}
          description="Reusable homepage blocks currently configured by admins."
        />
        <WorkspaceMetricCard
          accent="green"
          label="Active public content"
          value={publicContent.filter((entry) => entry.active).length.toString().padStart(2, "0")}
          description="Published content cards still visible on the public site."
        />
        <WorkspaceMetricCard
          accent="amber"
          label="News entries"
          value={news.length.toString().padStart(2, "0")}
          description="News posts available to editors for release cadence planning."
        />
        <WorkspaceMetricCard
          accent="slate"
          label="Editor routes"
          value={featuredSections.length.toString().padStart(2, "0")}
          description="Prioritized section entry points surfaced for direct editing."
        />
      </WorkspaceMetricGrid>

      {errorMessage ? <div className={styles.notice}>{errorMessage}</div> : null}

      <div className={styles.grid}>
        <WorkspacePanel
          aside={<WorkspaceBadge tone="cyan">Homepage sections</WorkspaceBadge>}
          eyebrow="Structure"
          title="Section inventory"
        >
          <div className={styles.sectionList} id="sections">
            {featuredSections.map((section) => (
              <Link
                key={section.id}
                className={styles.sectionCard}
                href={`/cms/sections/${section.id}`}
              >
                <div>
                  <div className={styles.sectionTitle}>{section.title}</div>
                  <div className={styles.sectionMeta}>
                    {section.slug} · Sort order {section.sortOrder}
                  </div>
                </div>
                <WorkspaceBadge tone="navy">Open editor</WorkspaceBadge>
              </Link>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          aside={<WorkspaceBadge tone="green">Public content</WorkspaceBadge>}
          eyebrow="Publishing queue"
          title="Public cards and announcements"
        >
          <div className={styles.cardGrid}>
            {publicContent.map((entry) => (
              <article key={entry.contentId} className={styles.publishCard}>
                <div className={styles.sectionTitle}>{entry.title}</div>
                <div className={styles.sectionMeta}>{entry.slug}</div>
                <p className={styles.cardBody}>{entry.summary || entry.body || "No summary yet."}</p>
                <WorkspaceBadge tone={entry.active ? "green" : "amber"}>
                  {entry.active ? "Active" : "Draft"}
                </WorkspaceBadge>
              </article>
            ))}
          </div>
        </WorkspacePanel>
      </div>

      <WorkspacePanel
        aside={<WorkspaceBadge tone="amber">News desk</WorkspaceBadge>}
        eyebrow="Editorial"
        title="News and content feed"
      >
        <div className={styles.newsList} id="news">
          {news.map((entry) => (
            <article key={entry.id} className={styles.newsItem}>
              <div>
                <div className={styles.sectionTitle}>{entry.title}</div>
                <div className={styles.sectionMeta}>
                  {entry.slug} · {entry.publishedAt ? formatDate(entry.publishedAt) : "Not published"}
                </div>
              </div>
              <p className={styles.cardBody}>{entry.summary || entry.content || "No summary yet."}</p>
            </article>
          ))}
        </div>
      </WorkspacePanel>
    </CmsFrame>
  );
}

type CmsFrameProps = {
  readonly children: ReactNode;
  readonly onLogout: () => Promise<void>;
  readonly onRefresh: () => void;
  readonly refreshing: boolean;
  readonly userName: string;
};

function CmsFrame({
  children,
  onLogout,
  onRefresh,
  refreshing,
  userName
}: CmsFrameProps) {
  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="CMS"
      meta="Content workspace · Homepage sections · News desk"
      navItems={navItems}
      userName={userName}
      userRole="Content admin"
      topbarLead={
        <div className={styles.toolbarCard}>
          <SearchGlyph />
          <div>
            <div className={styles.toolbarLabel}>Publishing readiness</div>
            <div className={styles.toolbarValue}>
              Review the public surface before switching into a detailed section editor.
            </div>
          </div>
        </div>
      }
      topbarActions={
        <>
          <WorkspaceAction onClick={onRefresh} tone="secondary">
            {refreshing ? "Refreshing..." : "Refresh content"}
          </WorkspaceAction>
          <WorkspaceAction href="/admin-monitoring" tone="ghost">
            Open monitoring
          </WorkspaceAction>
        </>
      }
      sidebarFooter={
        <WorkspaceAction
          ariaLabel="Sign out from CMS workspace"
          onClick={() => {
            void onLogout();
          }}
          tone="primary"
        >
          Sign out
        </WorkspaceAction>
      }
    >
      {children}
    </WorkspaceShell>
  );
}

function CmsState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <div className={styles.stateEyebrow}>Content workspace</div>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{description}</p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load CMS data right now.";
}
