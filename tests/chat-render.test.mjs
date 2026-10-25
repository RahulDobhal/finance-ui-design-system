import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Compile the real TSX with existing project tooling; no DOM/testing dependency.
const sourceUrl = new URL("../src/components/chat.tsx", import.meta.url);
const output = ts
  .transpileModule(fs.readFileSync(sourceUrl, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  })
  .outputText.replace(
    /from ["']([^"']+)["']/g,
    (_, specifier) =>
      `from ${JSON.stringify(specifier.startsWith(".") ? new URL(specifier, sourceUrl).href : import.meta.resolve(specifier))}`,
  );
const { PromptInput, ChatThread } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
);
const noop = () => {};

function button(markup, label) {
  return [...markup.matchAll(/<button\b[^>]*>/g)]
    .map((match) => match[0])
    .find((tag) => tag.includes(`aria-label="${label}"`));
}

test("a generating composer exposes a non-submit Stop action while retaining an editable next draft", () => {
  const markup = renderToStaticMarkup(
    createElement(PromptInput, {
      value: "Next question",
      onChange: noop,
      onSend: noop,
      onStop: noop,
      state: "generating",
    }),
  );
  assert.match(button(markup, "Stop response") || "", /type="button"/);
  assert.doesNotMatch(markup.match(/<textarea\b[^>]*>/)?.[0] || "", /disabled/);
  assert.match(markup, /Next question<\/textarea>/);
  assert.equal(button(markup, "Send message"), undefined);
});

test("only the send action submits and empty submissions are disabled", () => {
  const render = (value) =>
    renderToStaticMarkup(
      createElement(PromptInput, { value, onChange: noop, onSend: noop }),
    );
  assert.match(button(render("Ready"), "Send message") || "", /type="submit"/);
  assert.doesNotMatch(
    button(render("Ready"), "Send message") || "",
    /disabled/,
  );
  assert.match(button(render(" "), "Send message") || "", /disabled/);
});

test("a thread has one live announcement channel while its message log remains readable", () => {
  const markup = renderToStaticMarkup(
    createElement(ChatThread, {
      messages: [{ id: "u1", role: "user", text: "Check fees" }],
      status: "generating",
      activity: "searching",
      draft: "",
      onDraftChange: noop,
      onSend: noop,
      onStop: noop,
    }),
  );
  assert.equal((markup.match(/role="status"/g) || []).length, 1);
  assert.match(markup, /role="log"[^>]*aria-live="off"/);
  assert.match(markup, /Check fees/);
});
