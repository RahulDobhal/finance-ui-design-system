import type { ReactNode } from "react";
import { activityLabels } from "./chat-state.mjs";
import type { ChatMessage, ChatState } from "./chat-state.mjs";

export type { ChatMessage, ChatState };
export type Activity = keyof typeof activityLabels;
export type Feedback = "like" | "dislike" | null;
export type PromptState = "default" | "generating" | "error" | "disabled";

/** Rendering only. The application owns messages, transport and draft state. */
export type ChatThreadProps = {
  messages: readonly ChatMessage[];
  status: ChatState["status"];
  activity?: Activity;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  emptyState?: ReactNode;
  renderResult?: (message: ChatMessage, index: number) => ReactNode;
};
