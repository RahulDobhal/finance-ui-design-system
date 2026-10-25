import { useState } from "react";
import { View } from "react-native";
import { Button } from "../base";
import { FinanceText, useFinanceTheme } from "../finance";
import {
  ThinkingIndicator,
  ThinkingPanel,
  ResponseFeedback,
  AgentResponse,
  UserQuery,
  PromptInput,
  ChatThread,
} from "../chat";
import type { Activity, Feedback } from "../../src/design-system/chat";
import { tokens } from "../../src/design-system/tokens";
import { formatMoney } from "../../src/design-system/money.mjs";
import { useDemoChat } from "../../src/workshop/useDemoChat";
import {
  demoResponse,
  demoSuggestions,
  sampleSpending,
  sampleSpendingTotal,
  showsSpendingResult,
} from "../../src/workshop/chat-demo.mjs";
const sp = tokens.spacing;
const shape = {
  borderRadius: tokens.radius.md,
  borderCurve: "continuous" as const,
};

function SpendingTaskPreview() {
  const [expanded, setExpanded] = useState(false);
  const c = useFinanceTheme();
  return (
    <View
      style={[
        shape,
        { gap: sp[3], padding: sp[3], backgroundColor: c["surface-secondary"] },
      ]}
    >
      <View style={{ gap: sp[1] }}>
        <FinanceText kind="label">Spending review</FinanceText>
        <FinanceText kind="body-small" tone="muted">
          Sample transactions · ready to review
        </FinanceText>
      </View>
      <View
        style={[
          shape,
          { gap: sp[2], padding: sp[4], backgroundColor: c.surface },
        ]}
      >
        <FinanceText kind="body-small" tone="muted">
          Total outgoings
        </FinanceText>
        <FinanceText kind="title">
          {formatMoney(sampleSpendingTotal, sampleSpending.currency)}
        </FinanceText>
        {expanded && (
          <View style={{ gap: sp[3], marginTop: sp[3] }}>
            {sampleSpending.items.map(({ id, label, minor }) => (
              <View
                key={id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: sp[3],
                }}
              >
                <FinanceText kind="body-small">{label}</FinanceText>
                <FinanceText
                  kind="body-small"
                  style={{ fontFamily: tokens.font.nativeMono }}
                >
                  {formatMoney(minor, sampleSpending.currency)}
                </FinanceText>
              </View>
            ))}
          </View>
        )}
      </View>
      <Button
        variant="tertiary"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide breakdown" : "View breakdown"}
      </Button>
    </View>
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
        <View style={{ gap: sp[3] }}>
          <FinanceText kind="title">What would you like to review?</FinanceText>
          <FinanceText kind="body-small" tone="muted">
            Review your spending, understand a transfer, or plan your next move.
          </FinanceText>
          {demoSuggestions.map((prompt) => (
            <Button
              variant="tertiary"
              key={prompt}
              onPress={() => demo.setDraft(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </View>
      }
      renderResult={(_, index) =>
        showsSpendingResult(demo.thread.messages[index - 1]?.text || "") ? (
          <SpendingTaskPreview />
        ) : null
      }
    />
  );
}

export function NativeChatStory({
  name,
  state,
}: {
  name: string;
  state: string;
}) {
  const [draft, setDraft] = useState(""),
    [feedback, setFeedback] = useState<Feedback>(null),
    [done, setDone] = useState(false);
  const activity = (
    ["default", "expanded", "collapsed"].includes(state) ? "analyzing" : state
  ) as Activity;
  const retry = () => setDone(true);
  switch (name) {
    case "ThinkingIndicator":
      return <ThinkingIndicator state={done ? "completed" : activity} />;
    case "ThinkingPanel":
      return (
        <ThinkingPanel
          state={done ? "completed" : activity}
          defaultExpanded={state === "expanded"}
          onRetry={retry}
        />
      );
    case "ResponseFeedback":
      return (
        <ResponseFeedback
          value={feedback}
          onChange={setFeedback}
          disabled={state === "disabled"}
        />
      );
    case "AgentResponse":
      return (
        <AgentResponse
          state={
            done
              ? "completed"
              : ["writing", "stopped", "error"].includes(state)
                ? (state as "writing" | "stopped" | "error")
                : "completed"
          }
          onRetry={retry}
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
              : state === "sending"
                ? "sending"
                : state === "error"
                  ? "error"
                  : "sent"
          }
          onRetry={retry}
        >
          How much did I spend this week?
        </UserQuery>
      );
    case "PromptInput":
      return (
        <PromptInput
          value={draft}
          onChange={setDraft}
          onSend={() => {
            setDraft("");
            setDone(true);
          }}
          onStop={retry}
          mode={state === "compact" ? "compact" : "spacious"}
          state={
            done
              ? "default"
              : ["generating", "error", "disabled"].includes(state)
                ? (state as "generating" | "error" | "disabled")
                : "default"
          }
        />
      );
    case "ChatThread":
      return <DemoChatThread simulateError={state === "error"} />;
    default:
      return null;
  }
}
