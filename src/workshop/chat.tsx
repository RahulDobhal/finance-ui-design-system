import { useId, useState } from "react";
import { Button } from "@heroui/react";
import { ChartNoAxesColumn, ChevronDown } from "lucide-react";
import {
  ThinkingIndicator,
  ThinkingPanel,
  ResponseFeedback,
  AgentResponse,
  UserQuery,
  PromptInput,
  ChatThread,
} from "../components/chat";
import type { Activity, Feedback, PromptState } from "../design-system/chat";
import { formatMoney } from "../design-system/money.mjs";
import type { StoryProps } from "./types";
import { useDemoChat } from "./useDemoChat";
import {
  demoResponse,
  demoSuggestions,
  sampleSpending,
  sampleSpendingTotal,
  showsSpendingResult,
} from "./chat-demo.mjs";
import "./chat.css";

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
        <strong>
          {formatMoney(sampleSpendingTotal, sampleSpending.currency)}
        </strong>
        {expanded && (
          <dl id={detailsId} className="chat-task-breakdown">
            {sampleSpending.items.map((item) => (
              <div key={item.id}>
                <dt>{item.label}</dt>
                <dd>{formatMoney(item.minor, sampleSpending.currency)}</dd>
              </div>
            ))}
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

export function DemoChatThread({
  simulateError = false,
}: {
  simulateError?: boolean;
}) {
  const demo = useDemoChat(simulateError);
  return (
    <ChatThread
      messages={demo.thread.messages}
      status={demo.thread.status}
      activity={demo.thread.stage}
      draft={demo.draft}
      onDraftChange={demo.setDraft}
      onSend={demo.send}
      onStop={demo.stop}
      onRetry={demo.retry}
      title="Finance assistant"
      subtitle="Local demo"
      emptyState={
        <div className="chat-empty">
          <h3>What would you like to review?</h3>
          <p className="muted small">
            Review your spending, understand a transfer, or plan your next move.
          </p>
          <div className="chat-suggestions">
            {demoSuggestions.map((prompt) => (
              <Button
                variant="ghost"
                key={prompt}
                onPress={() => demo.setDraft(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      }
      renderResult={(_, index) =>
        showsSpendingResult(demo.thread.messages[index - 1]?.text || "") ? (
          <SpendingTaskPreview />
        ) : null
      }
    />
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
        >
          {demoResponse}
        </AgentResponse>
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
      return <DemoChatThread simulateError={p.state === "error"} />;
    default:
      return null;
  }
}
