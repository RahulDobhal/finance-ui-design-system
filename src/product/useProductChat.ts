import { useEffect, useReducer, useState } from "react";
import { chatReducer } from "../design-system/chat-state.mjs";
import {
  replyFor,
  startingConversation,
  type ConversationScreen,
} from "./model";

// Local demo transport only. Existing shared reducer owns cancellation and stale events.
export function useProductChat(screen: ConversationScreen) {
  const [chat, dispatch] = useReducer(
    chatReducer,
    screen,
    startingConversation,
  );
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (chat.status !== "generating") return;
    const id = chat.requestId;
    const prompt =
      [...chat.messages].reverse().find((message) => message.role === "user")
        ?.text || "";
    const stage = window.setTimeout(
      () => dispatch({ type: "stage", id, stage: "analyzing" }),
      400,
    );
    const complete = window.setTimeout(
      () => dispatch({ type: "complete", id, text: replyFor(prompt).text }),
      1200,
    );
    return () => {
      clearTimeout(stage);
      clearTimeout(complete);
    };
  }, [chat.status, chat.requestId, chat.messages]);
  function send() {
    if (!draft.trim() || chat.status === "generating") return;
    dispatch({ type: "send", text: draft });
    setDraft("");
  }
  return {
    chat,
    draft,
    setDraft,
    send,
    stop: () => dispatch({ type: "stop" }),
    retry: () => dispatch({ type: "retry" }),
  };
}
