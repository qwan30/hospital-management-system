"use client";

import { useEffect, useState } from "react";
import { PatientRouteGuard } from "../auth/patient-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import { WorkspaceAction, WorkspaceBadge } from "../workspace-ui/workspace-ui";
import { buildPatientPortalNav } from "./patient-portal-nav";
import { PatientPortalCard, PatientPortalShell } from "../patient-portal-ui/patient-portal-ui";
import { PatientPortalRouteState } from "./patient-portal-route-state";
import styles from "./patient-portal-screen.module.css";

type PortalMessageThread = {
  readonly threadId: string;
  readonly subject: string;
  readonly channel: string;
  readonly unreadCount: number;
  readonly lastMessagePreview: string | null;
  readonly updatedAt: string;
  readonly messages: readonly {
    readonly messageId: string;
    readonly senderRole: string;
    readonly body: string;
    readonly createdAt: string;
  }[];
};

export function PatientMessagesScreen() {
  return (
    <PatientRouteGuard
      fallback={<PatientPortalRouteState title="Checking patient access" description="Restoring your session before loading messages." />}
      forbiddenFallback={<PatientPortalRouteState title="Patient access required" description="This route is reserved for authenticated patient sessions." />}
    >
      <PatientMessagesContent />
    </PatientRouteGuard>
  );
}

function PatientMessagesContent() {
  const { apiFetch, logout } = useAuth();
  const [threads, setThreads] = useState<readonly PortalMessageThread[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void apiFetch<PortalMessageThread[]>("/patient-portal/messages", { scope: "patient" })
      .then(setThreads)
      .catch((error) => setErrorMessage(toMessage(error)));
  }, [apiFetch]);

  return (
    <PatientPortalShell
      navItems={buildPatientPortalNav("/patient-portal/messages")}
      subtitle="Patient messages"
      title="Messages Center"
      topbarAction={
        <WorkspaceAction
          onClick={() => {
            void logout("patient").then(() => {
              window.location.assign("/patient-login");
            });
          }}
          tone="secondary"
        >
          Sign out
        </WorkspaceAction>
      }
    >
      {errorMessage ? <div className={styles.notice}>{errorMessage}</div> : null}
      <div className={styles.messageList}>
        {threads.map((thread) => (
          <PatientPortalCard key={thread.threadId} eyebrow={thread.channel} title={thread.subject}>
            <div className={styles.messageThread}>
              <div>
                <div className={styles.meta}>{new Date(thread.updatedAt).toLocaleString("en-GB")}</div>
                <p className={styles.bodyText}>{thread.lastMessagePreview || "No message preview available."}</p>
              </div>
              <WorkspaceBadge tone={thread.unreadCount > 0 ? "amber" : "green"}>
                {thread.unreadCount} unread
              </WorkspaceBadge>
            </div>
            <div className={styles.list}>
              {thread.messages.map((message) => (
                <div key={message.messageId} className={styles.listCard}>
                  <div className={styles.primaryText}>{message.senderRole}</div>
                  <div className={styles.meta}>{new Date(message.createdAt).toLocaleString("en-GB")}</div>
                  <p className={styles.bodyText}>{message.body}</p>
                </div>
              ))}
            </div>
          </PatientPortalCard>
        ))}
      </div>
    </PatientPortalShell>
  );
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load messages right now.";
}
