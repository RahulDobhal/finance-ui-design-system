import test from "node:test";
import assert from "node:assert/strict";
import {
  chatAnnouncement,
  chatReducer,
  initialChat,
} from "../src/design-system/chat-state.mjs";
import { startDemoResponse } from "../src/workshop/chat-demo.mjs";

test("demo transport advances stages in order and completes once with the same request identity", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const events = [];
  const cancel = startDemoResponse({
    requestId: 12,
    fail: false,
    onEvent: (event) => events.push(event),
  });
  t.mock.timers.tick(899);
  assert.deepEqual(events, []);
  t.mock.timers.tick(1);
  assert.deepEqual(events, [{ type: "stage", id: 12, stage: "searching" }]);
  t.mock.timers.tick(2700);
  assert.deepEqual(
    events.map((event) => (event.type === "stage" ? event.stage : event.type)),
    ["searching", "analyzing", "writing", "complete"],
  );
  assert.ok(events.every((event) => event.id === 12));
  cancel();
  t.mock.timers.tick(3600);
  assert.equal(events.length, 4);
});

test("cleanup cancels outstanding work and retry uses a new request without duplicating the query", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let thread = chatReducer(initialChat, {
    type: "send",
    text: "Review my spending",
  });
  const apply = (event) => {
    thread = chatReducer(thread, event);
  };
  const cancel = startDemoResponse({
    requestId: thread.requestId,
    fail: false,
    onEvent: apply,
  });
  t.mock.timers.tick(900);
  thread = chatReducer(thread, { type: "stop" });
  cancel();
  t.mock.timers.tick(6000);
  assert.equal(thread.status, "stopped");
  assert.equal(thread.messages.length, 1);
  thread = chatReducer(thread, { type: "retry" });
  startDemoResponse({
    requestId: thread.requestId,
    fail: false,
    onEvent: apply,
  });
  t.mock.timers.tick(3600);
  assert.equal(thread.status, "completed");
  assert.deepEqual(
    thread.messages.map((message) => message.role),
    ["user", "agent"],
  );
});

test("failed demo transport emits no answer and preserves its query", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let thread = chatReducer(initialChat, { type: "send", text: "Check fees" });
  startDemoResponse({
    requestId: thread.requestId,
    fail: true,
    onEvent: (event) => {
      thread = chatReducer(thread, event);
    },
  });
  t.mock.timers.tick(3600);
  assert.equal(thread.status, "error");
  assert.deepEqual(
    thread.messages.map((message) => message.text),
    ["Check fees"],
  );
});

test("thread announcements describe one public update and never repeat the user's query as the response", () => {
  const messages = [
    { id: "a1", role: "agent", text: "Your total is ready." },
    { id: "u2", role: "user", text: "Next query" },
  ];
  assert.equal(chatAnnouncement("idle", "thinking", []), "");
  assert.equal(
    chatAnnouncement("generating", "searching", messages),
    "Searching",
  );
  assert.equal(
    chatAnnouncement("completed", "completed", messages),
    "Your total is ready.",
  );
  assert.equal(
    chatAnnouncement("stopped", "writing", messages),
    "Response stopped.",
  );
  assert.equal(
    chatAnnouncement("error", "writing", messages),
    "Response interrupted. Your query is saved.",
  );
});
