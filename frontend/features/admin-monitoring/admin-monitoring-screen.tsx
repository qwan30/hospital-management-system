"use client";

import {
  useEffect,
  useEffectEvent,
  useState,
  type ChangeEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react";
import { useSearchParams } from "next/navigation";
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
import styles from "./admin-monitoring-screen.module.css";

type AdminStats = {
  readonly totalUsers: number;
  readonly activeDoctors: number;
  readonly totalDepartments: number;
  readonly todayAppointments: number;
  readonly paidInvoices: number;
  readonly unpaidInvoices: number;
};

type MonitoringSnapshot = {
  readonly generatedAt: string;
  readonly uptimeSeconds: number;
  readonly healthy: boolean;
  readonly activeAlerts: number;
  readonly databaseStatus: string;
  readonly queueStatus: string;
};

type AuditLog = {
  readonly auditLogId: string;
  readonly actorName: string | null;
  readonly actorRole: string | null;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: string;
};

type AssistantModeMetric = {
  readonly mode: "docs" | "patient" | "hybrid";
  readonly p95LatencyMs: number;
};

type AssistantMonitoringSnapshot = {
  readonly generatedAt: string;
  readonly modeMetrics: readonly AssistantModeMetric[];
  readonly refusalRate: number;
  readonly authFailureCount: number;
  readonly feedbackHelpfulRate: number;
  readonly topCitedDocuments: readonly string[];
};

type KnowledgeDocument = {
  readonly documentId: string;
  readonly documentKey: string;
  readonly title: string;
  readonly category: string;
  readonly status: "DRAFT" | "ACTIVE" | "REVOKED";
  readonly version: string | null;
  readonly owner: string | null;
  readonly effectiveDate: string | null;
  readonly tags: readonly string[];
  readonly sourceFilename: string | null;
  readonly sourcePath: string;
  readonly summary: string | null;
  readonly updatedAt: string;
  readonly latestIngestionStage: string | null;
};

type KnowledgeChunk = {
  readonly chunkId: string;
  readonly heading: string;
  readonly referenceKey: string;
  readonly content: string;
};

type KnowledgeDocumentDetail = {
  readonly document: KnowledgeDocument;
  readonly chunks: readonly KnowledgeChunk[];
};

type KnowledgeIngestion = {
  readonly ingestionId: string;
  readonly documentId: string;
  readonly stage: string;
  readonly errorMessage: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly updatedAt: string;
};

type UploadDraft = {
  readonly category: string;
  readonly effectiveDate: string;
  readonly file: File | null;
  readonly owner: string;
  readonly summary: string;
  readonly tags: string;
  readonly title: string;
  readonly version: string;
};

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Overview", href: "#overview", active: true, icon: <HomeGlyph /> },
  { label: "Audit", href: "#audit", icon: <ClipboardGlyph /> },
  { label: "Knowledge", href: "#knowledge", icon: <SearchGlyph /> },
  { label: "CMS", href: "/cms", icon: <CalendarGlyph /> }
] as const;

const initialUploadDraft: UploadDraft = {
  category: "policy",
  effectiveDate: "",
  file: null,
  owner: "Operations",
  summary: "",
  tags: "",
  title: "",
  version: "1.0"
};

export function AdminMonitoringScreen() {
  return (
    <AdminRouteGuard
      fallback={
        <MonitoringState
          title="Checking admin access"
          description="Restoring the session required for system monitoring."
        />
      }
      forbiddenFallback={
        <MonitoringState
          title="Admin access required"
          description="Only admin sessions can access system monitoring and audit visibility."
        />
      }
    >
      <AdminMonitoringContent />
    </AdminRouteGuard>
  );
}

function AdminMonitoringContent() {
  const { apiFetch, logout, session } = useAuth();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [snapshot, setSnapshot] = useState<MonitoringSnapshot | null>(null);
  const [assistantMonitoring, setAssistantMonitoring] = useState<AssistantMonitoringSnapshot | null>(null);
  const [auditLogs, setAuditLogs] = useState<readonly AuditLog[]>([]);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<readonly KnowledgeDocument[]>([]);
  const [selectedKnowledgeDocumentId, setSelectedKnowledgeDocumentId] = useState<string | null>(null);
  const [selectedKnowledgeDetail, setSelectedKnowledgeDetail] = useState<KnowledgeDocumentDetail | null>(null);
  const [selectedKnowledgeIngestion, setSelectedKnowledgeIngestion] = useState<KnowledgeIngestion | null>(null);
  const [uploadDraft, setUploadDraft] = useState<UploadDraft>(initialUploadDraft);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [knowledgeBusy, setKnowledgeBusy] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userName = session?.fullName ?? "Admin";
  const highlightedChunkRef = searchParams.get("chunkRef");

  const loadKnowledgeDetail = useEffectEvent(async (documentId: string) => {
    try {
      const [detailResponse, ingestionResponse] = await Promise.all([
        apiFetch<KnowledgeDocumentDetail>(`/admin/knowledge-documents/${documentId}`),
        apiFetch<KnowledgeIngestion | null>(`/admin/knowledge-documents/${documentId}/ingestion`)
      ]);
      setSelectedKnowledgeDetail(detailResponse);
      setSelectedKnowledgeIngestion(ingestionResponse);
    } catch (error) {
      setErrorMessage(toMessage(error));
    }
  });

  const loadDashboard = useEffectEvent(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [
        statsResponse,
        monitoringResponse,
        auditResponse,
        knowledgeResponse,
        assistantMonitoringResponse
      ] = await Promise.all([
        apiFetch<AdminStats>("/admin/stats"),
        apiFetch<MonitoringSnapshot>("/admin/monitoring"),
        apiFetch<AuditLog[]>("/admin/audit-logs?limit=8"),
        apiFetch<KnowledgeDocument[]>("/admin/knowledge-documents"),
        apiFetch<AssistantMonitoringSnapshot>("/admin/monitoring/internal-assistant")
      ]);

      setStats(statsResponse);
      setSnapshot(monitoringResponse);
      setAuditLogs(auditResponse);
      setKnowledgeDocuments(knowledgeResponse);
      setAssistantMonitoring(assistantMonitoringResponse);
      setErrorMessage(null);

      const requestedDocumentId = searchParams.get("documentId");
      const nextDocumentId =
        requestedDocumentId ??
        selectedKnowledgeDocumentId ??
        knowledgeResponse[0]?.documentId ??
        null;
      setSelectedKnowledgeDocumentId(nextDocumentId);
      if (nextDocumentId) {
        await loadKnowledgeDetail(nextDocumentId);
      } else {
        setSelectedKnowledgeDetail(null);
        setSelectedKnowledgeIngestion(null);
      }
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
    void loadDashboard("initial");
  }, []);

  async function handleKnowledgeAction(
    documentId: string,
    action: "activate" | "revoke" | "reindex"
  ) {
    setKnowledgeBusy(`${action}:${documentId}`);
    try {
      await apiFetch<KnowledgeDocument>(`/admin/knowledge-documents/${documentId}/${action}`, {
        method: "POST"
      });
      await loadDashboard("refresh");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setKnowledgeBusy(null);
    }
  }

  async function handleKnowledgeUpload() {
    if (!uploadDraft.file) {
      setErrorMessage("Choose a knowledge document before uploading.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", uploadDraft.file);
      formData.set("title", uploadDraft.title);
      formData.set("category", uploadDraft.category);
      formData.set("summary", uploadDraft.summary);
      formData.set("version", uploadDraft.version);
      formData.set("owner", uploadDraft.owner);
      formData.set("tags", uploadDraft.tags);
      if (uploadDraft.effectiveDate) {
        formData.set("effectiveDate", uploadDraft.effectiveDate);
      }

      const response = await apiFetch<KnowledgeDocument>("/admin/knowledge-documents", {
        body: formData,
        method: "POST"
      });
      setUploadDraft(initialUploadDraft);
      setSelectedKnowledgeDocumentId(response.documentId);
      await loadDashboard("refresh");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    await logout("staff");
    window.location.assign("/login");
  }

  if (loading) {
    return (
      <MonitoringFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadDashboard("refresh");
        }}
        refreshing={refreshing}
        userName={userName}
      >
        <MonitoringState
          title="Loading monitoring workspace"
          description="Fetching admin stats, health snapshot, audit activity, and knowledge documents."
        />
      </MonitoringFrame>
    );
  }

  if (errorMessage && !stats && !snapshot) {
    return (
      <MonitoringFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadDashboard("refresh");
        }}
        refreshing={refreshing}
        userName={userName}
      >
        <MonitoringState title="Unable to load monitoring" description={errorMessage} />
      </MonitoringFrame>
    );
  }

  return (
    <MonitoringFrame
      onLogout={handleLogout}
      onRefresh={() => {
        void loadDashboard("refresh");
      }}
      refreshing={refreshing}
      userName={userName}
    >
      <WorkspacePageIntro
        eyebrow="Admin control room"
        title="System monitoring"
        summary="Keep operating health, audit visibility, assistant quality, and the internal knowledge base in one admin workspace."
        aside={
          <>
            <WorkspaceBadge tone={snapshot?.healthy ? "green" : "red"}>
              {snapshot?.healthy ? "Healthy" : "Needs attention"}
            </WorkspaceBadge>
            <WorkspaceBadge tone="navy">
              {snapshot?.activeAlerts ?? 0} active alerts
            </WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="cyan"
          label="Staff users"
          value={padMetric(stats?.totalUsers ?? 0)}
          description={`${stats?.activeDoctors ?? 0} active doctors across the hospital workspace`}
        />
        <WorkspaceMetricCard
          accent="green"
          label="Today appointments"
          value={padMetric(stats?.todayAppointments ?? 0)}
          description="Operational volume snapshot pulled from the admin stats service."
        />
        <WorkspaceMetricCard
          accent="amber"
          label="Assistant refusal"
          value={formatPercent(assistantMonitoring?.refusalRate ?? 0)}
          description={`${assistantMonitoring?.authFailureCount ?? 0} auth failures and ${formatPercent(assistantMonitoring?.feedbackHelpfulRate ?? 0)} helpful feedback`}
        />
        <WorkspaceMetricCard
          accent={snapshot?.healthy ? "slate" : "red"}
          label="Knowledge docs"
          value={padMetric(knowledgeDocuments.length)}
          description={`Queue ${snapshot?.queueStatus ?? "unknown"} · Database ${snapshot?.databaseStatus ?? "unknown"}`}
        />
      </WorkspaceMetricGrid>

      {errorMessage ? <div className={styles.notice}>{errorMessage}</div> : null}

      <div className={styles.grid}>
        <WorkspacePanel
          aside={<WorkspaceBadge tone="cyan">Live health</WorkspaceBadge>}
          eyebrow="Availability"
          title="Runtime monitoring snapshot"
        >
          <div className={styles.healthGrid} id="overview">
            <article className={styles.healthCard}>
              <div className={styles.healthLabel}>Uptime</div>
              <div className={styles.healthValue}>
                {formatDuration(snapshot?.uptimeSeconds ?? 0)}
              </div>
              <div className={styles.healthMeta}>
                Generated {snapshot ? formatDateTime(snapshot.generatedAt) : "just now"}
              </div>
            </article>
            <article className={styles.healthCard}>
              <div className={styles.healthLabel}>Assistant p95</div>
              <div className={styles.healthValue}>
                {formatLatency(assistantMonitoring?.modeMetrics ?? [])}
              </div>
              <div className={styles.healthMeta}>
                Top cited: {(assistantMonitoring?.topCitedDocuments ?? []).slice(0, 2).join(" · ") || "No citations yet"}
              </div>
            </article>
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          aside={<WorkspaceBadge tone="amber">Audit stream</WorkspaceBadge>}
          eyebrow="Governance"
          title="Recent audit activity"
        >
          <div className={styles.auditList} id="audit">
            {auditLogs.map((entry) => (
              <article key={entry.auditLogId} className={styles.auditItem}>
                <div className={styles.auditHead}>
                  <div>
                    <div className={styles.auditTitle}>{entry.action}</div>
                    <div className={styles.auditMeta}>
                      {(entry.actorName || "System actor")} · {entry.actorRole || "SYSTEM"}
                    </div>
                  </div>
                  <WorkspaceBadge tone="slate">{entry.entityType}</WorkspaceBadge>
                </div>
                <div className={styles.auditTime}>{formatDateTime(entry.createdAt)}</div>
              </article>
            ))}
            {auditLogs.length === 0 ? (
              <p className={styles.emptyCopy}>No audit activity is available for the current filter.</p>
            ) : null}
          </div>
        </WorkspacePanel>
      </div>

      <div className={styles.knowledgeLayout} id="knowledge">
        <WorkspacePanel
          aside={<WorkspaceBadge tone="navy">Knowledge base</WorkspaceBadge>}
          eyebrow="Internal assistant"
          title="Knowledge documents"
        >
          <div className={styles.knowledgePanel}>
            <div className={styles.knowledgeList}>
              {knowledgeDocuments.map((document) => {
                const active = document.documentId === selectedKnowledgeDocumentId;
                return (
                  <button
                    key={document.documentId}
                    className={active ? styles.knowledgeItemActive : styles.knowledgeItem}
                    onClick={() => {
                      setSelectedKnowledgeDocumentId(document.documentId);
                      void loadKnowledgeDetail(document.documentId);
                    }}
                    type="button"
                  >
                    <div className={styles.knowledgeItemHead}>
                      <div>
                        <div className={styles.knowledgeItemTitle}>{document.title}</div>
                        <div className={styles.knowledgeItemMeta}>
                          {document.category} · {document.version || "Unversioned"}
                        </div>
                      </div>
                      <WorkspaceBadge tone={statusTone(document.status)}>
                        {document.status}
                      </WorkspaceBadge>
                    </div>
                    <div className={styles.knowledgeItemSummary}>
                      {document.summary || document.sourceFilename || document.documentKey}
                    </div>
                    <div className={styles.knowledgeItemFooter}>
                      <span>{document.latestIngestionStage || "No ingestion"}</span>
                      <span>{formatDateTime(document.updatedAt)}</span>
                    </div>
                  </button>
                );
              })}
              {knowledgeDocuments.length === 0 ? (
                <p className={styles.emptyCopy}>No knowledge documents have been uploaded yet.</p>
              ) : null}
            </div>

            <div className={styles.knowledgeDetail}>
              {selectedKnowledgeDetail ? (
                <>
                  <div className={styles.knowledgeDetailHeader}>
                    <div>
                      <div className={styles.knowledgeItemTitle}>{selectedKnowledgeDetail.document.title}</div>
                      <div className={styles.knowledgeItemMeta}>
                        {selectedKnowledgeDetail.document.owner || "No owner"} · {selectedKnowledgeDetail.document.documentKey}
                      </div>
                    </div>
                    <div className={styles.knowledgeActions}>
                      <WorkspaceAction
                        onClick={() => {
                          void handleKnowledgeAction(selectedKnowledgeDetail.document.documentId, "activate");
                        }}
                        tone="secondary"
                      >
                        {knowledgeBusy === `activate:${selectedKnowledgeDetail.document.documentId}` ? "Activating..." : "Activate"}
                      </WorkspaceAction>
                      <WorkspaceAction
                        onClick={() => {
                          void handleKnowledgeAction(selectedKnowledgeDetail.document.documentId, "revoke");
                        }}
                        tone="ghost"
                      >
                        {knowledgeBusy === `revoke:${selectedKnowledgeDetail.document.documentId}` ? "Revoking..." : "Revoke"}
                      </WorkspaceAction>
                      <WorkspaceAction
                        onClick={() => {
                          void handleKnowledgeAction(selectedKnowledgeDetail.document.documentId, "reindex");
                        }}
                        tone="primary"
                      >
                        {knowledgeBusy === `reindex:${selectedKnowledgeDetail.document.documentId}` ? "Re-indexing..." : "Re-index"}
                      </WorkspaceAction>
                    </div>
                  </div>

                  <div className={styles.knowledgeMetaGrid}>
                    <div>
                      <span>Status</span>
                      <strong>{selectedKnowledgeDetail.document.status}</strong>
                    </div>
                    <div>
                      <span>Ingestion</span>
                      <strong>{selectedKnowledgeIngestion?.stage || selectedKnowledgeDetail.document.latestIngestionStage || "Unknown"}</strong>
                    </div>
                    <div>
                      <span>Effective</span>
                      <strong>{selectedKnowledgeDetail.document.effectiveDate || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Tags</span>
                      <strong>{selectedKnowledgeDetail.document.tags.join(", ") || "No tags"}</strong>
                    </div>
                  </div>

                  <div className={styles.chunkList}>
                    {selectedKnowledgeDetail.chunks.map((chunk) => (
                      <article
                        key={chunk.chunkId}
                        className={
                          chunk.referenceKey === highlightedChunkRef
                            ? styles.chunkCardHighlighted
                            : styles.chunkCard
                        }
                      >
                        <div className={styles.chunkHeading}>{chunk.heading}</div>
                        <div className={styles.chunkReference}>{chunk.referenceKey}</div>
                        <p className={styles.chunkContent}>{chunk.content}</p>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <p className={styles.emptyCopy}>
                  Select a document to inspect metadata, ingestion state, and indexed chunks.
                </p>
              )}
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          aside={<WorkspaceBadge tone="green">Upload</WorkspaceBadge>}
          eyebrow="Knowledge operations"
          title="Add or refresh a document"
        >
          <div className={styles.uploadForm}>
            <label className={styles.field}>
              <span>Title</span>
              <input
                onChange={(event) => setUploadDraft((current) => ({ ...current, title: event.target.value }))}
                value={uploadDraft.title}
              />
            </label>
            <label className={styles.field}>
              <span>Category</span>
              <input
                onChange={(event) => setUploadDraft((current) => ({ ...current, category: event.target.value }))}
                value={uploadDraft.category}
              />
            </label>
            <label className={styles.field}>
              <span>Version</span>
              <input
                onChange={(event) => setUploadDraft((current) => ({ ...current, version: event.target.value }))}
                value={uploadDraft.version}
              />
            </label>
            <label className={styles.field}>
              <span>Owner</span>
              <input
                onChange={(event) => setUploadDraft((current) => ({ ...current, owner: event.target.value }))}
                value={uploadDraft.owner}
              />
            </label>
            <label className={styles.field}>
              <span>Effective date</span>
              <input
                onChange={(event) => setUploadDraft((current) => ({ ...current, effectiveDate: event.target.value }))}
                type="date"
                value={uploadDraft.effectiveDate}
              />
            </label>
            <label className={styles.field}>
              <span>Tags</span>
              <input
                onChange={(event) => setUploadDraft((current) => ({ ...current, tags: event.target.value }))}
                placeholder="lab result, portal, workflow"
                value={uploadDraft.tags}
              />
            </label>
            <label className={styles.fieldWide}>
              <span>Summary</span>
              <textarea
                onChange={(event) => setUploadDraft((current) => ({ ...current, summary: event.target.value }))}
                rows={3}
                value={uploadDraft.summary}
              />
            </label>
            <label className={styles.fieldWide}>
              <span>Document file</span>
              <input onChange={handleFileSelect(setUploadDraft)} type="file" />
            </label>
            <div className={styles.uploadHint}>
              Upload `.md`, `.markdown`, or `.txt` documents. New uploads start as `DRAFT` until activated.
            </div>
            <WorkspaceAction onClick={handleKnowledgeUpload} tone="primary">
              {uploading ? "Uploading..." : "Upload document"}
            </WorkspaceAction>
          </div>
        </WorkspacePanel>
      </div>
    </MonitoringFrame>
  );
}

type MonitoringFrameProps = {
  readonly children: ReactNode;
  readonly onLogout: () => Promise<void>;
  readonly onRefresh: () => void;
  readonly refreshing: boolean;
  readonly userName: string;
};

function MonitoringFrame({
  children,
  onLogout,
  onRefresh,
  refreshing,
  userName
}: MonitoringFrameProps) {
  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="Admin Monitoring"
      meta="Administrative control room · Health checks · Audit visibility"
      navItems={navItems}
      userName={userName}
      userRole="System admin"
      topbarLead={
        <div className={styles.toolbarCard}>
          <SearchGlyph />
          <div>
            <div className={styles.toolbarLabel}>System heartbeat</div>
            <div className={styles.toolbarValue}>
              Operating health, assistant quality, and knowledge readiness in one view.
            </div>
          </div>
        </div>
      }
      topbarActions={
        <>
          <WorkspaceAction onClick={onRefresh} tone="secondary">
            {refreshing ? "Refreshing..." : "Refresh snapshot"}
          </WorkspaceAction>
          <WorkspaceAction href="/cms" tone="ghost">
            Open CMS
          </WorkspaceAction>
        </>
      }
      sidebarFooter={
        <WorkspaceAction
          ariaLabel="Sign out from admin monitoring"
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

function MonitoringState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <div className={styles.stateEyebrow}>System monitoring</div>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{description}</p>
      </div>
    </div>
  );
}

function handleFileSelect(setUploadDraft: Dispatch<SetStateAction<UploadDraft>>) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    setUploadDraft((current) => ({
      ...current,
      file: event.target.files?.[0] ?? null
    }));
  };
}

function padMetric(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatLatency(metrics: readonly AssistantModeMetric[]) {
  if (metrics.length === 0) {
    return "0 ms";
  }
  return metrics.map((entry) => `${entry.mode}: ${entry.p95LatencyMs}ms`).join(" · ");
}

function statusTone(status: KnowledgeDocument["status"]) {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "REVOKED":
      return "red";
    case "DRAFT":
    default:
      return "amber";
  }
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load admin monitoring right now.";
}
