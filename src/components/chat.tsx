import {
  useEffect,
  useLayoutEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";
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
  chatReducer,
  demoResponse,
  initialChat,
} from "../design-system/chat-state.mjs";
import type { StoryProps } from "./finance";

type Activity = keyof typeof activityLabels;
type Feedback = "like" | "dislike" | null;
type PromptState = "default" | "generating" | "error" | "disabled";

export function ThinkingIndicator({
  state = "thinking",
}: {
  state?: Activity;
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
      role="status"
      aria-live="polite"
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
}: {
  state?: Activity;
  defaultExpanded?: boolean;
  onRetry?: () => void;
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
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <ThinkingIndicator state={state} />
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
        <div className="thinking-error" role="alert">
          <span>Connection interrupted. Your query is saved.</span>
          {onRetry && (
            <Button variant="tertiary" onPress={onRetry}>
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
}: {
  children?: React.ReactNode;
  state?: "completed" | "writing" | "error" | "stopped";
  onRetry?: () => void;
}) {
  return (
    <article
      className="agent-response"
      aria-label="Agent response"
      aria-busy={state === "writing"}
    >
      <div className="response-body">
        {typeof (children || demoResponse) === "string"
          ? String(children || demoResponse)
              .split("\n\n")
              .map((paragraph, index) => <p key={index}>{paragraph}</p>)
          : children}
      </div>
      {state === "writing" && <ThinkingIndicator state="writing" />}
      {state === "error" && (
        <div role="alert" className="danger small">
          <p>Response interrupted.</p>
          {onRetry && (
            <Button variant="tertiary" onPress={onRetry}>
              Retry response
            </Button>
          )}
        </div>
      )}
      {state === "stopped" && (
        <p className="small muted" role="status">
          Response stopped
        </p>
      )}
    </article>
  );
}

function SpendingTaskPreview() {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  return (
    <section className="chat-task" aria-label="Sample spending review">
      <div className="chat-task-heading">
        <ChartNoAxesColumn aria-hidden="true" />
        <div>
          <h4>Spending review</h4>
          <p className="small muted">Sample transactions · ready to review</p>
        </div>
      </div>
      <div className="chat-task-summary">
        <span className="small muted">Total outgoings</span>
        <strong>$639.39</strong>
        {expanded && (
          <dl id={detailsId} className="chat-task-breakdown">
            <div>
              <dt>Transfers</dt>
              <dd>$500.00</dd>
            </div>
            <div>
              <dt>Card payments</dt>
              <dd>$128.40</dd>
            </div>
            <div>
              <dt>Subscriptions</dt>
              <dd>$10.99</dd>
            </div>
          </dl>
        )}
      </div>
      <Button
        variant="tertiary"
        aria-expanded={expanded}
        aria-controls={expanded ? detailsId : undefined}
        onPress={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide breakdown" : "View breakdown"}
        <ChevronDown className={expanded ? "is-expanded" : ""} />
      </Button>
    </section>
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
            <Button variant="tertiary" onPress={onRetry}>
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
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  mode?: "spacious" | "compact";
  state?: PromptState;
  error?: string;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
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
  }, [value, mode]);
  const generating = state === "generating",
    disabled = state === "disabled";
  return (
    <form
      className={`prompt-input ${mode} ${state === "error" ? "has-error" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!generating && !disabled && value.trim()) onSend();
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
        disabled={disabled || generating}
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
            if (value.trim()) onSend();
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
                : "Local demo"}
        </span>
        {generating ? (
          <Button
            isIconOnly
            variant="secondary"
            aria-label="Stop response"
            isDisabled={!onStop}
            onPress={onStop}
          >
            <Square size={16} />
          </Button>
        ) : (
          <Button
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
  simulateError = false,
}: {
  simulateError?: boolean;
}) {
  const [thread, dispatch] = useReducer(chatReducer, initialChat);
  const [draft, setDraft] = useState("");
  const failedOnce = useRef(false);
  const messages = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  useEffect(() => {
    if (thread.status !== "generating") return;
    const timers = activitySteps
      .slice(1)
      .map((stage, index) =>
        setTimeout(
          () => dispatch({ type: "stage", id: thread.requestId, stage }),
          (index + 1) * 900,
        ),
      );
    timers.push(
      setTimeout(() => {
        if (simulateError && !failedOnce.current) {
          failedOnce.current = true;
          dispatch({ type: "fail", id: thread.requestId });
        } else
          dispatch({
            type: "complete",
            id: thread.requestId,
            text: demoResponse,
          });
      }, 3600),
    );
    return () => timers.forEach(clearTimeout);
  }, [thread.status, thread.requestId, simulateError]);
  useEffect(() => {
    if (follow.current)
      messages.current?.scrollTo({
        top: messages.current.scrollHeight,
        behavior: "instant",
      });
  }, [thread.messages, thread.stage]);
  function send() {
    if (!draft.trim() || thread.status === "generating") return;
    dispatch({ type: "send", text: draft });
    setDraft("");
    follow.current = true;
  }
  return (
    <section
      className="chat-thread"
      aria-label="Conversation"
      aria-busy={thread.status === "generating"}
    >
      <div className="thread-heading">
        <h3>Finance assistant</h3>
        <span className="micro muted">Local demo</span>
      </div>
      <div
        className="thread-messages"
        ref={messages}
        role="log"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions"
        onScroll={(e) => {
          const el = e.currentTarget;
          follow.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 60;
        }}
      >
        {!thread.messages.length && (
          <div className="chat-empty">
            <h3>What would you like to review?</h3>
            <p className="muted small">
              Review your spending, understand a transfer, or plan your next
              move.
            </p>
            <div className="chat-suggestions">
              {["Review my spending", "Explain transfer fees"].map((prompt) => (
                <Button
                  variant="ghost"
                  key={prompt}
                  onPress={() => setDraft(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
        {thread.messages.map(
          (message: { id: string; role: string; text: string }, index) =>
            message.role === "user" ? (
              <UserQuery key={message.id}>{message.text}</UserQuery>
            ) : (
              <div className="thread-response" key={message.id}>
                <AgentResponse>{message.text}</AgentResponse>
                {/spend|transaction|review/i.test(
                  thread.messages[index - 1]?.text || "",
                ) && <SpendingTaskPreview />}
              </div>
            ),
        )}
        {["generating", "error", "stopped"].includes(thread.status) && (
          <ThinkingPanel
            state={thread.stage as Activity}
            onRetry={() => dispatch({ type: "retry" })}
          />
        )}
        {thread.status === "stopped" && (
          <Button
            variant="tertiary"
            onPress={() => dispatch({ type: "retry" })}
          >
            Try again
          </Button>
        )}
      </div>
      <PromptInput
        value={draft}
        onChange={setDraft}
        onSend={send}
        onStop={() => dispatch({ type: "stop" })}
        mode={thread.messages.length ? "compact" : "spacious"}
        state={thread.status === "generating" ? "generating" : "default"}
      />
    </section>
  );
}

export function ChatStory({ name, p }: { name: string; p: StoryProps }) {
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [done, setDone] = useState(false);
  const activity = (
    p.state === "default" || p.state === "collapsed" || p.state === "expanded"
      ? "analyzing"
      : p.state
  ) as Activity;
  const onRetry = () => {
    setDone(true);
    p.notify("Retried locally");
  };
  switch (name) {
    case "ThinkingIndicator":
      return <ThinkingIndicator state={done ? "completed" : activity} />;
    case "ThinkingPanel":
      return (
        <ThinkingPanel
          state={done ? "completed" : activity}
          defaultExpanded={p.state === "expanded"}
          onRetry={onRetry}
        />
      );
    case "ResponseFeedback":
      return (
        <ResponseFeedback
          value={feedback}
          onChange={(v) => {
            setFeedback(v);
            p.notify(v ? v + " selected" : "Feedback cleared");
          }}
          disabled={p.state === "disabled"}
        />
      );
    case "AgentResponse":
      return (
        <AgentResponse
          state={
            done
              ? "completed"
              : ["writing", "error", "stopped"].includes(p.state)
                ? (p.state as "writing" | "error" | "stopped")
                : "completed"
          }
          onRetry={onRetry}
        />
      );
    case "UserQuery":
      return (
        <UserQuery
          state={
            done
              ? "sent"
              : p.state === "error"
                ? "error"
                : p.state === "sending"
                  ? "sending"
                  : "sent"
          }
          onRetry={onRetry}
        >
          How much did I spend this week?
        </UserQuery>
      );
    case "PromptInput":
      return (
        <PromptInput
          value={draft}
          onChange={setDraft}
          mode={p.state === "compact" ? "compact" : "spacious"}
          state={
            done
              ? "default"
              : ["generating", "error", "disabled"].includes(p.state)
                ? (p.state as PromptState)
                : "default"
          }
          onStop={() => {
            setDone(true);
            p.notify("Response stopped");
          }}
          onSend={() => {
            setDraft("");
            setDone(true);
            p.notify("Message submitted locally");
          }}
        />
      );
    case "ChatThread":
      return <ChatThread simulateError={p.state === "error"} />;
    default:
      return null;
  }
}
