import type { StaffRole } from "../auth/auth.types";

export type InternalAssistantMode = "docs" | "patient" | "hybrid";

export type InternalAssistantScope = "docs" | "patient" | "hybrid" | "refused";

export type InternalAssistantCitation = {
  readonly title: string;
  readonly sourceType: string;
  readonly excerpt?: string | null;
  readonly deepLink?: string | null;
  readonly sourceId?: string | null;
  readonly referenceId?: string | null;
};

export type InternalAssistantConversationItem = {
  readonly role: "user" | "assistant";
  readonly content: string;
};

export type InternalAssistantMessageRequest = {
  readonly appointmentId?: string | null;
  readonly conversation?: readonly InternalAssistantConversationItem[];
  readonly message: string;
  readonly mode: InternalAssistantMode;
  readonly patientId?: string | null;
};

export type InternalAssistantMessageResponse = {
  readonly answer: string;
  readonly citations: readonly InternalAssistantCitation[];
  readonly deepLinks: readonly string[];
  readonly suggestions: readonly string[];
  readonly messageId?: string | null;
  readonly sessionId?: string | null;
  readonly scope: InternalAssistantScope;
};

export type InternalAssistantRole = Exclude<StaffRole, "ACCOUNTANT">;

export type InternalAssistantContext = {
  readonly appointmentId?: string | null;
  readonly appointmentLabel?: string | null;
  readonly mode?: InternalAssistantMode;
  readonly patientId?: string | null;
  readonly patientLabel?: string | null;
  readonly role: InternalAssistantRole;
  readonly title: string;
  readonly summary: string;
};
