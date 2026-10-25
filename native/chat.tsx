import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Button } from "./base";
import { useReducedMotion } from "./useReducedMotion";
import { FinanceText, useFinanceTheme } from "./finance";
import { tokens } from "../src/design-system/tokens";
import {
  activityLabels,
  activitySteps,
  chatAnnouncement,
} from "../src/design-system/chat-state.mjs";

import type {
  Activity,
  Feedback,
  ChatThreadProps,
} from "../src/design-system/chat";
export type { ChatThreadProps } from "../src/design-system/chat";
const sp = tokens.spacing;
const shape = {
  borderRadius: tokens.radius.md,
  borderCurve: "continuous" as const,
};

export function ThinkingIndicator({
  state = "thinking",
  announce = true,
}: {
  state?: Activity;
  announce?: boolean;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !activitySteps.includes(state)) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [reduced, state, opacity]);
  return (
    <View
      accessibilityLiveRegion={announce ? "polite" : "none"}
      style={{
        flexDirection: "row",
        gap: sp[2],
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FinanceText tone="muted" kind="label">
        {activityLabels[state]}
      </FinanceText>
      {activitySteps.includes(state) && (
        <Animated.View accessible={false} style={{ opacity }}>
          <FinanceText tone="muted">···</FinanceText>
        </Animated.View>
      )}
    </View>
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
  const [expanded, setExpanded] = useState(defaultExpanded),
    c = useFinanceTheme();
  const current = state === "completed" ? 4 : activitySteps.indexOf(state);
  return (
    <View
      style={[
        shape,
        {
          borderWidth: 0,
          borderColor: c["surface-tertiary"],
          backgroundColor: c.surface,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${activityLabels[state]}, activity summary`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
        style={{
          padding: tokens.padding.compact,
          minHeight: tokens.touch.minimum,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: sp[3],
          alignItems: "center",
        }}
      >
        <ThinkingIndicator
          state={state}
          announce={announce && state !== "error"}
        />
        <FinanceText tone="muted">{expanded ? "−" : "+"}</FinanceText>
      </Pressable>
      {expanded && (
        <View
          style={{
            padding: sp[4],
            gap: sp[4],
            backgroundColor: c["surface-secondary"],
            borderRadius: tokens.radius.md,
          }}
        >
          {current < 0 ? (
            <FinanceText kind="caption" tone="muted">
              Run ended before a response was ready.
            </FinanceText>
          ) : (
            activitySteps.slice(0, current + 1).map((step, i) => (
              <View
                key={step}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: sp[3],
                  flexWrap: "wrap",
                }}
              >
                <FinanceText kind="caption">
                  {activityLabels[step as Activity]}
                </FinanceText>
                <FinanceText kind="caption" tone="muted">
                  {i < current
                    ? "Done"
                    : i === current
                      ? "In progress"
                      : "Not started"}
                </FinanceText>
              </View>
            ))
          )}
          <FinanceText kind="caption" tone="muted">
            Shows operation status only.
          </FinanceText>
        </View>
      )}
      {state === "error" && (
        <View style={{ padding: tokens.padding.compact, gap: sp[3] }}>
          <FinanceText
            kind="body-small"
            tone="danger"
            accessibilityRole={announce ? "alert" : undefined}
          >
            Connection interrupted. Your query is saved.
          </FinanceText>
          {onRetry && (
            <Button variant="tertiary" onPress={onRetry}>
              Retry
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

export function ResponseFeedback({
  value,
  onChange,
  disabled = false,
}: {
  value: Feedback;
  onChange: (v: Feedback) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", gap: sp[2], flexWrap: "wrap" }}>
      {(["like", "dislike"] as const).map((choice) => (
        <Button
          key={choice}
          variant={value === choice ? "tertiary" : "ghost"}
          isDisabled={disabled}
          accessibilityLabel={
            choice === "like" ? "Like response" : "Dislike response"
          }
          accessibilityState={{ selected: value === choice, disabled }}
          onPress={() => onChange(value === choice ? null : choice)}
        >
          {choice === "like" ? "Like" : "Dislike"}
          {value === choice ? " ✓" : ""}
        </Button>
      ))}
    </View>
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
  const c = useFinanceTheme();
  return (
    <View
      style={[
        shape,
        { gap: sp[3], backgroundColor: c["surface-secondary"], padding: sp[4] },
      ]}
    >
      <FinanceText selectable>{children}</FinanceText>
      {state === "writing" && (
        <ThinkingIndicator state="writing" announce={announce} />
      )}
      {state === "stopped" && (
        <FinanceText tone="muted" kind="caption">
          Response stopped
        </FinanceText>
      )}
      {state === "error" && (
        <>
          <FinanceText
            accessibilityRole={announce ? "alert" : undefined}
            tone="danger"
          >
            Response interrupted.
          </FinanceText>
          {onRetry && (
            <Button variant="tertiary" onPress={onRetry}>
              Retry response
            </Button>
          )}
        </>
      )}
    </View>
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
  const c = useFinanceTheme();
  return (
    <View style={{ alignSelf: "flex-end", maxWidth: "90%", gap: sp[2] }}>
      <View
        style={[
          shape,
          {
            backgroundColor: c["accent-soft"],
            padding: tokens.padding.compact,
          },
        ]}
      >
        <FinanceText selectable tone="accent-soft-foreground">
          {children}
        </FinanceText>
      </View>
      {state !== "sent" && (
        <FinanceText
          kind="caption"
          tone={state === "error" ? "danger" : "muted"}
          accessibilityLiveRegion="polite"
        >
          {state === "sending" ? "Sending…" : "Not sent"}
        </FinanceText>
      )}
      {state === "error" && onRetry && (
        <Button variant="tertiary" onPress={onRetry}>
          Retry query
        </Button>
      )}
    </View>
  );
}

export function PromptInput({
  value,
  onChange,
  onSend,
  onStop,
  mode = "spacious",
  state = "default",
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  mode?: "spacious" | "compact";
  state?: "default" | "generating" | "error" | "disabled";
  inputRef?: React.RefObject<React.ComponentRef<typeof TextInput> | null>;
}) {
  const localInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const input = inputRef || localInput;
  const c = useFinanceTheme(),
    [focused, setFocused] = useState(false),
    [contentHeight, setContentHeight] = useState(0),
    generating = state === "generating",
    disabled = state === "disabled";
  return (
    <View
      style={[
        shape,
        {
          padding: tokens.padding.compact,
          gap: sp[2],
          backgroundColor: c["surface-secondary"],
          borderWidth: focused ? 2 : 0,
          borderColor:
            state === "error"
              ? c.danger
              : focused
                ? c.focus
                : c["surface-tertiary"],
        },
      ]}
    >
      <TextInput
        ref={input}
        accessibilityLabel="Message"
        accessibilityHint="Write a message, then activate Send message."
        multiline
        editable={!disabled}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={
          mode === "spacious" ? "Ask about your finances…" : "Ask a follow-up…"
        }
        placeholderTextColor={c["muted"]}
        textAlignVertical="top"
        onContentSizeChange={(event) =>
          setContentHeight(event.nativeEvent.contentSize.height)
        }
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: tokens.typography.body.size,
          lineHeight: tokens.typography.body.lineHeight,
          color: c.foreground,
          minHeight: mode === "spacious" ? 72 : 48,
          height: Math.min(
            192,
            Math.max(mode === "spacious" ? 72 : 48, value ? contentHeight : 0),
          ),
          maxHeight: 192,
          padding: 0,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: sp[3],
          flexWrap: "wrap",
        }}
      >
        <FinanceText kind="caption" tone="muted">
          {generating
            ? "Response in progress"
            : disabled
              ? "Messaging unavailable"
              : "Write a message"}
        </FinanceText>
        {generating ? (
          <Button
            variant="secondary"
            isDisabled={!onStop}
            onPress={() => {
              onStop?.();
              input.current?.focus();
            }}
            accessibilityLabel="Stop response"
          >
            Stop
          </Button>
        ) : (
          <Button
            isDisabled={disabled || !value.trim()}
            onPress={() => {
              if (value.trim() && !disabled && !generating) {
                onSend();
                input.current?.focus();
              }
            }}
            accessibilityLabel={
              state === "error" ? "Retry message" : "Send message"
            }
          >
            {state === "error" ? "Retry" : "Send"} ↑
          </Button>
        )}
      </View>
      {state === "error" && (
        <FinanceText accessibilityRole="alert" tone="danger" kind="caption">
          Couldn’t send. Your draft is saved.
        </FinanceText>
      )}
    </View>
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
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const follow = useRef(true);
  const currentActivity =
    status === "error" || status === "stopped" || status === "completed"
      ? status
      : activity;
  const announcement = chatAnnouncement(status, currentActivity, messages);
  const previousAnnouncement = useRef(announcement);
  useEffect(() => {
    if (announcement && announcement !== previousAnnouncement.current)
      AccessibilityInfo.announceForAccessibility(announcement);
    previousAnnouncement.current = announcement;
  }, [announcement]);
  function retry() {
    onRetry?.();
    input.current?.focus();
    follow.current = true;
  }
  return (
    <View style={{ gap: sp[6] }}>
      <View style={{ gap: sp[1] }}>
        <FinanceText kind="subtitle">{title}</FinanceText>
        {subtitle && (
          <FinanceText kind="caption" tone="muted">
            {subtitle}
          </FinanceText>
        )}
      </View>
      <ScrollView
        ref={scroll}
        nestedScrollEnabled
        style={{ maxHeight: 420 }}
        contentContainerStyle={{ gap: sp[4] }}
        onContentSizeChange={() => {
          if (follow.current) scroll.current?.scrollToEnd({ animated: false });
        }}
        onScroll={(event) => {
          const n = event.nativeEvent;
          follow.current =
            n.contentSize.height -
              n.contentOffset.y -
              n.layoutMeasurement.height <
            60;
        }}
        scrollEventThrottle={100}
        keyboardShouldPersistTaps="handled"
      >
        {!messages.length && emptyState}
        {messages.map((message, index) =>
          message.role === "user" ? (
            <UserQuery key={message.id}>{message.text}</UserQuery>
          ) : (
            <View key={message.id} style={{ gap: sp[3] }}>
              <AgentResponse announce={false}>{message.text}</AgentResponse>
              {renderResult?.(message, index)}
            </View>
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
          <Button variant="tertiary" onPress={retry}>
            Try again
          </Button>
        )}
      </ScrollView>
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
    </View>
  );
}
