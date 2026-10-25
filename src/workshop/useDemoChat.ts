import { useEffect, useReducer, useRef, useState } from "react";
import { chatReducer, initialChat } from "../design-system/chat-state.mjs";
import { startDemoResponse } from "./chat-demo.mjs";

/** Shared by both catalogs; consumers provide their own transport to ChatThread. */
export function useDemoChat(simulateError = false) {
  const [thread, dispatch] = useReducer(chatReducer, initialChat);
  const [draft, setDraft] = useState("");
  const failedOnce = useRef(false);
  useEffect(() => {
    if (thread.status !== "generating") return;
    return startDemoResponse({
      requestId: thread.requestId,
      fail: simulateError && !failedOnce.current,
      onEvent: (event) => {
        if (event.type === "fail") failedOnce.current = true;
        dispatch(event);
      },
    });
  }, [thread.status, thread.requestId, simulateError]);
  function send() {
    if (!draft.trim() || thread.status === "generating") return;
    dispatch({ type: "send", text: draft });
    setDraft("");
  }
  return {
    thread,
    draft,
    setDraft,
    send,
    stop: () => dispatch({ type: "stop" }),
    retry: () => dispatch({ type: "retry" }),
  };
}
