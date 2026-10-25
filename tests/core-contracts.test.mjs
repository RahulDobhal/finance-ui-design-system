import test from "node:test";
import assert from "node:assert/strict";
import {
  parseMinor,
  formatMoney,
  makeQuote,
  contrast,
} from "../src/design-system/money.mjs";
import { initialChat, chatReducer } from "../src/design-system/chat-state.mjs";

test("money parsing preserves every digit at the safe-integer boundary", () => {
  for (const [currency, digits] of [
    ["JPY", 0],
    ["USD", 2],
    ["KWD", 3],
  ]) {
    const scale = 10n ** BigInt(digits);
    for (
      let n = BigInt(Number.MAX_SAFE_INTEGER) - 100n;
      n <= BigInt(Number.MAX_SAFE_INTEGER) + 2n;
      n++
    ) {
      const value = `${n / scale}${digits ? "." + String(n % scale).padStart(digits, "0") : ""}`;
      assert.equal(
        parseMinor(value, currency),
        n <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(n) : null,
        value,
      );
    }
  }
});

test("formatting preserves cents and currency precision at large magnitudes", () => {
  assert.equal(formatMoney(Number.MAX_SAFE_INTEGER), "$90,071,992,547,409.91");
  assert.equal(
    formatMoney(-Number.MAX_SAFE_INTEGER),
    "-$90,071,992,547,409.91",
  );
  assert.equal(
    formatMoney(Number.MAX_SAFE_INTEGER, "KWD"),
    "KWD\u00a09,007,199,254,740.991",
  );
  assert.equal(
    formatMoney(Number.MAX_SAFE_INTEGER, "JPY"),
    "¥9,007,199,254,740,991",
  );
  assert.equal(
    formatMoney(Number.MAX_SAFE_INTEGER, "USD", "de-DE"),
    "90.071.992.547.409,91\u00a0$",
  );
});

test("normal formatting retains Intl locale, currency and sign behavior", () => {
  for (const currency of ["USD", "EUR", "JPY", "KWD"])
    for (const locale of ["en-US", "de-DE", "ar-EG", "hi-IN"])
      for (const signed of [false, true])
        for (const minor of [-123456, -99, -1, 0, 1, 99, 123456]) {
          const formatter = new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            signDisplay: signed ? "exceptZero" : "auto",
          });
          const digits = formatter.resolvedOptions().maximumFractionDigits;
          assert.equal(
            formatMoney(minor, currency, locale, signed),
            formatter.format(minor / 10 ** digits),
          );
        }
});

test("quotes reject non-finite, unsafe and invalid rate inputs", () => {
  const pricing = {
    from: "USD",
    to: "GBP",
    feeMinor: 250,
    rateNumerator: 83,
    rateDenominator: 100,
  };
  for (const amount of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => makeQuote(amount, pricing), TypeError);
  for (const options of [
    { feeMinor: -1 },
    { rateDenominator: 0 },
    { rateNumerator: 0 },
  ])
    assert.throws(() => makeQuote(1000, { ...pricing, ...options }), TypeError);
  assert.throws(
    () =>
      makeQuote(Number.MAX_SAFE_INTEGER, {
        ...pricing,
        feeMinor: 0,
        rateNumerator: 2,
        rateDenominator: 1,
      }),
    RangeError,
  );
  assert.equal(
    makeQuote(1, {
      ...pricing,
      feeMinor: 0,
      rateNumerator: 1,
      rateDenominator: 2,
    }).receiveMinor,
    1,
  );
});

test("contrast rejects invalid colors rather than reporting NaN or a partial ratio", () => {
  assert.equal(contrast("#000000", "#FFFFFF"), 21);
  for (const color of ["#fff", "#000000ff", "red", "#xyzxyz", "000000"])
    assert.throws(() => contrast(color, "#ffffff"), TypeError);
});

test("chat transitions leave frozen inputs untouched and reject stale events", () => {
  const state = Object.freeze({ ...initialChat, messages: Object.freeze([]) });
  const sent = chatReducer(state, { type: "send", text: "First" });
  Object.freeze(sent.messages[0]);
  Object.freeze(sent.messages);
  Object.freeze(sent);
  const failed = chatReducer(sent, { type: "fail", id: sent.requestId });
  const retried = chatReducer(failed, { type: "retry" });
  assert.equal(
    chatReducer(retried, { type: "fail", id: sent.requestId }),
    retried,
  );
  assert.equal(
    chatReducer(retried, {
      type: "stage",
      id: sent.requestId,
      stage: "writing",
    }),
    retried,
  );
  const done = chatReducer(retried, {
    type: "complete",
    id: retried.requestId,
    text: "Answer",
  });
  const next = chatReducer(done, { type: "send", text: "Second" });
  assert.deepEqual(
    next.messages.map((message) => message.id),
    ["user-1", "agent-2", "user-3"],
  );
  assert.equal(state.messages.length, 0);
  assert.equal(sent.messages.length, 1);
  assert.equal(chatReducer(done, { type: "retry" }), done);
  assert.equal(chatReducer(done, { type: "stop" }), done);
});
