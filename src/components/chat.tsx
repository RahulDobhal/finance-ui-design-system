import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { Button } from "@heroui/react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Search,
  Square,
  ThumbsDown,
  ThumbsUp,
  X,
  RotateCcw,
  ChartNoAxesColumn,
  Circle,
} from "lucide-react";
import {
  activityLabels,
  activitySteps,
  chatAnnouncement,
} from "../design-system/chat-state.mjs";
import type {
  Activity,
  Feedback,
  PromptState,
  ChatThreadProps,
} from "../design-system/chat";
export type { ChatThreadProps } from "../design-system/chat";

export function ThinkingIndicator({
  state = "thinking",
  announce = true,
}: {
  state?: Activity;
  announce?: boolean;
}) {
  const Icon =
    state === "searching"
      ? Search
      : state === "analyzing"
        ? ChartNoAxesColumn
        : state === "completed"
          ? Check
          : state === "error"
            ? X
            : state === "stopped"
              ? Square
              : Circle;
  const active = activitySteps.includes(state);
  return (
    <span
      className={`thinking-indicator ${active ? "is-active" : ""}`}
      role={announce ? "status" : undefined}
      aria-live={announce ? "polite" : undefined}
    >
      <Icon size={20} aria-hidden="true" />
      <span>{activityLabels[state]}</span>
      {active && (
        <span className="activity-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </span>
  );
}

export function ThinkingPanel({
  state = "analyzing",
  defaultExpanded = false,
  onRetry,
  announce = true,
}: {
  state?: Activity;
  defaultExpanded?: boolean;
  onRetry?: () => void;
  announce?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const id = useId();
  const current = state === "completed" ? 4 : activitySteps.indexOf(state);
  return (
    <section className="thinking-panel">
      <button
        className="thinking-toggle"
        type="button"
        aria-label={`${activityLabels[state]}, activity summary`}
        aria-expanded={expanded}
        aria-controls={expanded ? id : undefined}
        onClick={() => setExpanded(!expanded)}
      >
        <ThinkingIndicator
          state={state}
          announce={announce && state !== "error"}
        />
        <ChevronDown
          size={20}
          className={expanded ? "is-expanded" : ""}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <div id={id} className="thinking-details">
          {current < 0 ? (
            <p className="small muted">
              Run ended before a response was ready.
            </p>
          ) : (
            <ol>
              {activitySteps.slice(0, current + 1).map((step, index) => (
                <li key={step} className={index < current ? "is-complete" : ""}>
                  <span aria-hidden="true">
                    {index < current ? (
                      <Check size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </span>
                  <span>{activityLabels[step as Activity]}</span>
                  <span className="muted">
                    {index < current
                      ? "Done"
                      : index === current
                        ? "In progress"
                        : "Not started"}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="micro muted">Shows operation status only.</p>
        </div>
      )}
      {state === "error" && (
        <div className="thinking-error" role={announce ? "alert" : undefined}>
          <span>Connection interrupted. Your query is saved.</span>
          {onRetry && (
            <Button type="button" variant="tertiary" onPress={onRetry}>
              <RotateCcw size={20} />
              Retry
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

export function ResponseFeedback({
  value,
  onChange,
  disabled = false,
}: {
  value: Feedback;
  onChange: (value: Feedback) => void;
  disabled?: boolean;
}) {
  return (
    <div className="response-feedback" role="group" aria-label="Rate response">
      {(["like", "dislike"] as const).map((choice) => (
        <Button
          type="button"
          key={choice}
          isIconOnly
          variant="ghost"
          aria-label={choice === "like" ? "Like response" : "Dislike response"}
          aria-pressed={value === choice}
          isDisabled={disabled}
          className={value === choice ? "feedback-selected" : ""}
          onPress={() => onChange(value === choice ? null : choice)}
        >
          {choice === "like" ? (
            <ThumbsUp size={16} />
          ) : (
            <ThumbsDown size={16} />
          )}
        </Button>
      ))}
    </div>
  );
}

export function AgentResponse({
  children,
  state = "completed",
  onRetry,
  announce = true,
}: {
  children: React.ReactNode;
  state?: "completed" | "writing" | "error" | "stopped";
  onRetry?: () => void;
  announce?: boolean;
}) {
  return (
    <article
      className="agent-response"
      aria-label="Agent response"
      aria-busy={state === "writing"}
    >
      <div className="response-body">
        {typeof children === "string"
          ? String(children)
              .split("\n\n")
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)
          : children}
      </div>
      {state === "writing" && (
        <ThinkingIndicator state="writing" announce={announce} />
      )}
      {state === "error" && (
        <div role={announce ? "alert" : undefined} className="danger small">
          <p>Response interrupted.</p>
          {onRetry && (
            <Button type="button" variant="tertiary" onPress={onRetry}>
              Retry response
            </Button>
          )}
        </div>
      )}
      {state === "stopped" && (
        <p className="small muted" role={announce ? "status" : undefined}>
          Response stopped
        </p>
      )}
    </article>
  );
}

export function UserQuery({
  children,
  state = "sent",
  onRetry,
}: {
  children: React.ReactNode;
  state?: "sent" | "sending" | "error";
  onRetry?: () => void;
}) {
  return (
    <div className="user-query-group">
      <span className="sr-only">You</span>
      <div className="user-query">{children}</div>
      {state !== "sent" && (
        <div
          className="query-status small"
          role={state === "error" ? "alert" : "status"}
        >
          {state === "sending" ? "Sending…" : "Not sent"}
          {state === "error" && onRetry && (
            <Button type="button" variant="tertiary" onPress={onRetry}>
              Retry query
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function PromptInput({
  value,
  onChange,
  onSend,
  onStop,
  mode = "spacious",
  state = "default",
  error = "Couldn’t send. Your draft is saved.",
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  mode?: "spacious" | "compact";
  state?: PromptState;
  error?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const id = useId();
  const localInput = useRef<HTMLTextAreaElement>(null);
  const input = inputRef || localInput;
  useLayoutEffect(() => {
    const resize = () => {
      const element = input.current;
      if (!element) return;
      element.style.height = "0px";
      element.style.height =
        Math.min(
          240,
          Math.max(mode === "spacious" ? 72 : 48, element.scrollHeight),
        ) + "px";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value, mode, input]);
  const generating = state === "generating",
    disabled = state === "disabled";
  function send() {
    if (!generating && !disabled && value.trim()) {
      onSend();
      input.current?.focus({ preventScroll: true });
    }
  }
  return (
    <form
      className={`prompt-input ${mode} ${state === "error" ? "has-error" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Message
      </label>
      <textarea
        ref={input}
        id={id}
        rows={mode === "spacious" ? 3 : 1}
        placeholder={
          mode === "spacious" ? "Ask about your finances…" : "Ask a follow-up…"
        }
        value={value}
        disabled={disabled}
        aria-invalid={state === "error"}
        aria-describedby={state === "error" ? id + "-error" : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !e.nativeEvent.isComposing &&
            !generating &&
            !disabled
          ) {
            e.preventDefault();
            send();
          }
        }}
      />
      <div className="prompt-toolbar">
        <span className="micro muted">
          {generating
            ? "Response in progress"
            : disabled
              ? "Messaging unavailable"
              : mode === "spacious"
                ? "Enter to send · Shift + Enter ↵"
                : "Enter to send"}
        </span>
        {generating ? (
          <Button
            key="stop"
            type="button"
            isIconOnly
            variant="secondary"
            aria-label="Stop response"
            isDisabled={!onStop}
            onPress={() => {
              onStop?.();
              input.current?.focus({ preventScroll: true });
            }}
          >
            <Square size={16} />
          </Button>
        ) : (
          <Button
            key="send"
            type="submit"
            isIconOnly
            aria-label={state === "error" ? "Retry message" : "Send message"}
            isDisabled={disabled || !value.trim()}
          >
            <ArrowUp size={18} />
          </Button>
        )}
      </div>
      {state === "error" && (
        <p id={id + "-error"} role="alert" className="small danger">
          {error}
        </p>
      )}
    </form>
  );
}

export function ChatThread({
  messages,
  status,
  activity = "thinking",
  draft,
  onDraftChange,
  onSend,
  onStop,
  onRetry,
  title = "Assistant",
  subtitle,
  emptyState,
  renderResult,
}: ChatThreadProps) {
  const messageList = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const follow = useRef(true);
  const currentActivity =
    status === "error" || status === "stopped" || status === "completed"
      ? status
      : activity;
  const announcement = chatAnnouncement(status, currentActivity, messages);
  useEffect(() => {
    if (follow.current)
      messageList.current?.scrollTo({
        top: messageList.current.scrollHeight,
        behavior: "instant",
      });
  }, [messages, activity]);
  function retry() {
    onRetry?.();
    input.current?.focus({ preventScroll: true });
    follow.current = true;
  }
  return (
    <section className="chat-thread" aria-label="Conversation">
      <div className="thread-heading">
        <h3>{title}</h3>
        {subtitle && <span className="micro muted">{subtitle}</span>}
      </div>
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
      <div
        className="thread-messages"
        ref={messageList}
        role="log"
        aria-label="Messages"
        aria-live="off"
        onScroll={(event) => {
          const el = event.currentTarget;
          follow.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 60;
        }}
      >
        {!messages.length && emptyState}
        {messages.map((message, index) =>
          message.role === "user" ? (
            <UserQuery key={message.id}>{message.text}</UserQuery>
          ) : (
            <div className="thread-response" key={message.id}>
              <AgentResponse announce={false}>{message.text}</AgentResponse>
              {renderResult?.(message, index)}
            </div>
          ),
        )}
        {["generating", "error", "stopped"].includes(status) && (
          <ThinkingPanel
            state={currentActivity}
            onRetry={onRetry ? retry : undefined}
            announce={false}
          />
        )}
        {status === "stopped" && onRetry && (
          <Button type="button" variant="tertiary" onPress={retry}>
            Try again
          </Button>
        )}
      </div>
      <PromptInput
        inputRef={input}
        value={draft}
        onChange={onDraftChange}
        onSend={() => {
          follow.current = true;
          onSend();
        }}
        onStop={onStop}
        mode={messages.length ? "compact" : "spacious"}
        state={status === "generating" ? "generating" : "default"}
      />
    </section>
  );
}
