"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import { WorkspaceBadge, WorkspacePanel } from "../workspace-ui/workspace-ui";
import styles from "./internal-assistant-panel.module.css";
import type {
  InternalAssistantCitation,
  InternalAssistantContext,
  InternalAssistantConversationItem,
  InternalAssistantMessageRequest,
  InternalAssistantMessageResponse,
  InternalAssistantMode
} from "./internal-assistant.types";

type InternalAssistantPanelProps = InternalAssistantContext & {
  readonly assistantId?: string;
  readonly className?: string;
};

type AssistantMessage = InternalAssistantConversationItem & {
  readonly meta: string;
};

export function InternalAssistantPanel({
  appointmentId,
  appointmentLabel,
  assistantId = "assistant",
  className,
  mode: initialMode,
  patientId,
  patientLabel,
  role,
  summary,
  title
}: InternalAssistantPanelProps) {
  const { apiFetch, session } = useAuth();
  const [composerValue, setComposerValue] = useState("");
  const [conversation, setConversation] = useState<readonly AssistantMessage[]>([]);
  const [activeMode, setActiveMode] = useState<InternalAssistantMode>(
    initialMode ?? defaultMode(role, patientId, appointmentId)
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contextNotice, setContextNotice] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<InternalAssistantMessageResponse | null>(null);
  const previousContextKeyRef = useRef<string | null>(null);

  const hasSelectedContext = patientId != null || appointmentId != null;
  const contextKey = buildContextKey(role, patientId, appointmentId);

  useEffect(() => {
    const nextMode = initialMode ?? defaultMode(role, patientId, appointmentId);

    if (previousContextKeyRef.current != null && previousContextKeyRef.current !== contextKey) {
      setContextNotice(buildContextSwitchNotice(role, patientId, appointmentId, patientLabel, appointmentLabel));
    } else {
      setContextNotice(null);
    }

    previousContextKeyRef.current = contextKey;
    setActiveMode(nextMode);
    setConversation([]);
    setLastResponse(null);
    setErrorMessage(null);
    setComposerValue("");
  }, [appointmentId, contextKey, initialMode, patientId, role]);

  useEffect(() => {
    if (role === "ADMIN") {
      setActiveMode("docs");
    }
  }, [role]);

  const availableModes = modeAvailability(role, hasSelectedContext);
  const contextBadges = buildContextBadges(session?.fullName, patientLabel, appointmentLabel);
  const assistantSessionId = lastResponse?.sessionId;
  const assistantMessageId = lastResponse?.messageId;
  const threadLabel = buildThreadLabel(role, patientId, appointmentId, patientLabel, appointmentLabel);
  const canUsePatientContext = role !== "ADMIN" && hasSelectedContext;
  const refused = lastResponse?.scope === "refused";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = composerValue.trim();
    if (!message || loading) {
      return;
    }

    const request: InternalAssistantMessageRequest = {
      appointmentId,
      conversation: conversation.map(({ content, role: entryRole }) => ({
        content,
        role: entryRole
      })),
      message,
      mode: activeMode,
      patientId
    };

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiFetch<InternalAssistantMessageResponse>("/internal-assistant/messages", {
        body: request,
        method: "POST",
        scope: "staff"
      });

      const nextConversation: readonly AssistantMessage[] = [
        ...conversation,
        { content: message, meta: "User", role: "user" },
        { content: response.answer, meta: "Assistant", role: "assistant" }
      ];

      setConversation(nextConversation);
      setLastResponse(response);
      setComposerValue("");
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const assistantState = lastResponse?.scope ?? activeMode;

  return (
    <section className={className} id={assistantId}>
      <WorkspacePanel
        eyebrow="Internal clinical assistant"
        title="Assistant workspace"
        aside={
          <WorkspaceBadge tone={assistantStateTone(assistantState)}>
            {assistantState.toUpperCase()}
          </WorkspaceBadge>
        }
      >
        <div className={styles.shell}>
          <div className={styles.header}>
            <div>
              <div className={styles.eyebrow}>Protected workspace</div>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.summary}>{summary}</p>
            </div>
            <div className={styles.contextRow}>
              {contextBadges.map((badge) => (
                <span
                  key={badge}
                  className={badge.startsWith("No") ? styles.contextBadgeMuted : styles.contextBadge}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.contextBanner}>
            <div>
              <div className={styles.contextBannerLabel}>
                {hasSelectedContext ? "Selected patient thread" : "Docs-only thread"}
              </div>
              <div className={styles.contextBannerText}>
                {buildContextBannerText(role, patientLabel, appointmentLabel, hasSelectedContext)}
              </div>
            </div>
            <div className={styles.contextBannerMeta}>Thread placeholder: {threadLabel}</div>
          </div>

          {contextNotice ? <div className={styles.notice}>{contextNotice}</div> : null}

          <div className={styles.modeRow} role="tablist" aria-label="Assistant mode">
            {availableModes.map((mode) => (
              <button
                key={mode}
                aria-pressed={mode === activeMode}
                className={
                  mode === activeMode
                    ? styles.modeButtonActive
                    : role === "ADMIN" && mode !== "docs"
                      ? styles.modeButtonDisabled
                      : styles.modeButton
                }
                disabled={role === "ADMIN" && mode !== "docs"}
                onClick={() => setActiveMode(mode)}
                type="button"
              >
                {modeLabel(mode)}
              </button>
            ))}
          </div>

          <form className={styles.composer} onSubmit={handleSubmit}>
            <textarea
              aria-label="Internal assistant message"
              className={styles.textarea}
              disabled={loading}
              onChange={(event) => setComposerValue(event.target.value)}
              placeholder={
                canUsePatientContext
                  ? "Ask about the current patient, chart, prescriptions, lab results, or internal SOPs."
                  : "Ask about internal SOPs, guidelines, or other approved documents."
              }
              value={composerValue}
            />

            <div className={styles.composerFooter}>
              <div className={styles.hint}>
                Answers are read-only. Patient mode stays within the selected chart context.
              </div>
              <button className={styles.submitButton} disabled={loading} type="submit">
                {loading ? "Thinking..." : "Send"}
              </button>
            </div>
          </form>

          {errorMessage ? <div className={`${styles.notice} ${styles.error}`}>{errorMessage}</div> : null}

          {conversation.length > 0 ? (
            <div className={styles.conversation}>
              <div className={styles.conversationTitle}>Conversation</div>
              {conversation.map((message, index) => (
                <article
                  key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
                  className={`${styles.message} ${
                    message.role === "user" ? styles.messageUser : styles.messageAssistant
                  }`}
                >
                  <div className={styles.messageMeta}>
                    <span>{message.meta}</span>
                    <span>{message.role === "user" ? "Request" : "Response"}</span>
                  </div>
                  <div className={styles.messageBody}>{message.content}</div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              Conversation history will appear here after the first query.
            </div>
          )}

          {lastResponse ? (
            <div className={styles.resultGrid}>
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <div className={styles.sectionLabel}>Latest answer</div>
                  <span className={styles.scopeBadge}>{lastResponse.scope}</span>
                </div>
                {refused ? (
                  <div className={styles.refusalNotice}>
                    The assistant could not produce a safe answer for this context.
                  </div>
                ) : null}
                <div className={styles.answer}>{lastResponse.answer}</div>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.sectionLabel}>Citations</div>
                {lastResponse.citations.length > 0 ? (
                  <div className={styles.citationList}>
                    {lastResponse.citations.map((citation, index) => (
                      <CitationCard key={`${citation.title}-${index}`} citation={citation} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>The response did not include citations.</div>
                )}
              </div>

              <div className={styles.resultCard}>
                <div className={styles.sectionLabel}>Session and feedback</div>
                <div className={styles.sessionStack}>
                  <div className={styles.sessionBlock}>
                    <div className={styles.sessionLabel}>Session</div>
                    <div className={styles.sessionValue}>
                      {assistantSessionId ? `Backend session id: ${assistantSessionId}` : "Backend session id pending"}
                    </div>
                    <div className={styles.sessionHint}>Thread placeholder: {threadLabel}</div>
                  </div>
                  <div className={styles.sessionBlock}>
                    <div className={styles.sessionLabel}>Message</div>
                    <div className={styles.sessionValue}>
                      {assistantMessageId
                        ? `Message id: ${assistantMessageId}`
                        : "Message id will appear after the backend adds it"}
                    </div>
                    <div className={styles.feedbackHint}>
                      {assistantMessageId
                        ? "Feedback controls can attach to this response."
                        : "Helpful / not helpful controls stay disabled until the backend returns a message id."}
                    </div>
                    <div className={styles.feedbackActions}>
                      <button className={styles.feedbackButton} disabled={!assistantMessageId} type="button">
                        Helpful
                      </button>
                      <button className={styles.feedbackButton} disabled={!assistantMessageId} type="button">
                        Not helpful
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {lastResponse.deepLinks.length > 0 ? (
                <div className={styles.resultCard}>
                  <div className={styles.sectionLabel}>Deep links</div>
                  <div className={styles.linkList}>
                    {lastResponse.deepLinks.map((link) => (
                      <a key={link} className={styles.linkCard} href={link}>
                        <span className={styles.linkText}>{link}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {lastResponse.suggestions.length > 0 ? (
                <div className={styles.resultCard}>
                  <div className={styles.sectionLabel}>Suggestions</div>
                  <div className={styles.suggestionList}>
                    {lastResponse.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        className={styles.suggestionButton}
                        onClick={() => setComposerValue(suggestion)}
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </WorkspacePanel>
    </section>
  );
}

function CitationCard({ citation }: { readonly citation: InternalAssistantCitation }) {
  return (
    <article className={styles.citationCard}>
      <div className={styles.citationTitle}>{citation.title}</div>
      {citation.excerpt ? <div className={styles.citationExcerpt}>{citation.excerpt}</div> : null}
      {citation.deepLink ? (
        <a className={styles.citationLink} href={citation.deepLink}>
          {citation.deepLink}
        </a>
      ) : null}
    </article>
  );
}

function defaultMode(
  role: InternalAssistantContext["role"],
  patientId?: string | null,
  appointmentId?: string | null
): InternalAssistantMode {
  if (role === "ADMIN") {
    return "docs";
  }

  if (patientId || appointmentId) {
    return "hybrid";
  }

  return "docs";
}

function modeAvailability(
  role: InternalAssistantContext["role"],
  hasSelectedContext: boolean
): readonly InternalAssistantMode[] {
  if (role === "ADMIN") {
    return ["docs"];
  }

  if (hasSelectedContext) {
    return ["docs", "patient", "hybrid"];
  }

  return ["docs"];
}

function modeLabel(mode: InternalAssistantMode) {
  switch (mode) {
    case "docs":
      return "Docs";
    case "patient":
      return "Patient";
    case "hybrid":
      return "Hybrid";
  }
}

function assistantStateTone(scope: InternalAssistantMessageResponse["scope"]) {
  switch (scope) {
    case "docs":
      return "cyan";
    case "patient":
      return "green";
    case "hybrid":
      return "navy";
    case "refused":
      return "red";
  }
}

function buildContextBadges(
  userName: string | undefined,
  patientLabel?: string | null,
  appointmentLabel?: string | null
) {
  return [
    userName ? `Signed in as ${userName}` : "Signed in user",
    patientLabel ? `Patient: ${patientLabel}` : "No patient selected",
    appointmentLabel ? `Appointment: ${appointmentLabel}` : "No appointment selected"
  ];
}

function buildContextKey(
  role: InternalAssistantContext["role"],
  patientId?: string | null,
  appointmentId?: string | null
) {
  return [role, patientId ?? "", appointmentId ?? ""].join("|");
}

function buildContextBannerText(
  role: InternalAssistantContext["role"],
  patientLabel?: string | null,
  appointmentLabel?: string | null,
  hasSelectedContext?: boolean
) {
  if (role === "ADMIN") {
    return "Admin accounts stay docs-only until the backend adds selected-patient audit support.";
  }

  if (!hasSelectedContext) {
    return "No patient context is selected. The assistant is limited to docs mode until a chart or appointment is opened.";
  }

  const contextParts = [patientLabel, appointmentLabel].filter((part): part is string => Boolean(part));
  if (contextParts.length > 0) {
    return `This thread is pinned to ${contextParts.join(" / ")}. Switching context starts a separate thread.`;
  }

  return "This thread is pinned to the selected patient context. Switching context starts a separate thread.";
}

function buildThreadLabel(
  role: InternalAssistantContext["role"],
  patientId?: string | null,
  appointmentId?: string | null,
  patientLabel?: string | null,
  appointmentLabel?: string | null
) {
  const parts = [role.toLowerCase()];

  if (patientLabel) {
    parts.push(patientLabel);
  } else if (patientId) {
    parts.push(`patient ${patientId}`);
  }

  if (appointmentLabel) {
    parts.push(appointmentLabel);
  } else if (appointmentId) {
    parts.push(`appointment ${appointmentId}`);
  }

  return parts.join(" / ");
}

function buildContextSwitchNotice(
  role: InternalAssistantContext["role"],
  patientId?: string | null,
  appointmentId?: string | null,
  patientLabel?: string | null,
  appointmentLabel?: string | null
) {
  const threadLabel = buildThreadLabel(role, patientId, appointmentId, patientLabel, appointmentLabel);
  return `Context switched. A separate thread was started for ${threadLabel}.`;
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to contact the internal assistant right now.";
}
