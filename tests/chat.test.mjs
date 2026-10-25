import test from "node:test";
import assert from "node:assert/strict";
import { chatReducer, initialChat } from "../src/design-system/chat-state.mjs";
test("empty and duplicate in-flight submissions do not create messages", () => {
  assert.equal(
    chatReducer(initialChat, { type: "send", text: "  " }),
    initialChat,
  );
  const s = chatReducer(initialChat, {
    type: "send",
    text: "  Show spending  ",
  });
  assert.equal(s.messages[0].text, "Show spending");
  assert.equal(chatReducer(s, { type: "send", text: "Duplicate" }), s);
});
test("stop and retry ignore late responses and do not duplicate the user query", () => {
  const sent = chatReducer(initialChat, {
    type: "send",
    text: "Show spending",
  });
  const stopped = chatReducer(sent, { type: "stop" });
  assert.equal(
    chatReducer(stopped, {
      type: "complete",
      id: sent.requestId,
      text: "Late response",
    }),
    stopped,
  );
  const retried = chatReducer(stopped, { type: "retry" });
  assert.equal(retried.messages.length, 1);
  assert.equal(
    chatReducer(retried, {
      type: "complete",
      id: sent.requestId,
      text: "Old run",
    }),
    retried,
  );
  const done = chatReducer(retried, {
    type: "complete",
    id: retried.requestId,
    text: "New response",
  });
  assert.equal(done.messages.length, 2);
  assert.equal(done.messages[1].text, "New response");
  assert.equal(
    chatReducer(done, {
      type: "complete",
      id: retried.requestId,
      text: "Duplicate",
    }),
    done,
  );
});
test("failure retains query, retry advances request identity, and invalid stages are ignored", () => {
  const sent = chatReducer(initialChat, { type: "send", text: "Check fees" });
  assert.equal(
    chatReducer(sent, {
      type: "stage",
      id: sent.requestId,
      stage: "fabricated",
    }),
    sent,
  );
  const failed = chatReducer(sent, { type: "fail", id: sent.requestId });
  assert.equal(failed.status, "error");
  assert.equal(failed.messages[0].text, "Check fees");
  assert.equal(
    chatReducer(failed, { type: "retry" }).requestId,
    sent.requestId + 1,
  );
});
