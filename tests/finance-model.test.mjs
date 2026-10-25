import test from "node:test";
import assert from "node:assert/strict";
import {
  boundedProgress,
  assertStepper,
  chartGeometry,
  confirmTransfer,
  createTransferQuote,
  dateValue,
  limitProgress,
  localDate,
  nextAmount,
  quoteProblem,
  reviewIdentity,
} from "../src/design-system/finance-model.mjs";
import { makeQuote } from "../src/design-system/money.mjs";

const recipient = {
  id: "recipient-1",
  name: "Jamie",
  accountCurrency: "GBP",
  accountLast4: "2841",
};
const input = {
  id: "quote-1",
  send: { minor: 100000, currency: "USD" },
  fee: { minor: 250, currency: "USD" },
  to: "GBP",
  rate: { numerator: 83, denominator: 100 },
  expiresAt: 2000,
};

test("quote pricing is explicit, currencies stay attached, and invalid models cannot confirm", () => {
  assert.throws(() => makeQuote(100000), TypeError);
  const quote = createTransferQuote(input);
  assert.deepEqual(quote.receive, { minor: 82793, currency: "GBP" });
  assert.equal(
    quote.send.minor,
    quote.fee.minor + (quote.send.minor - quote.fee.minor),
  );
  assert.equal(quoteProblem(quote, recipient, 1000), null);
  assert.throws(
    () =>
      createTransferQuote({ ...input, fee: { minor: 250, currency: "EUR" } }),
    TypeError,
  );
  for (const invalid of [
    { ...quote, valid: false },
    { ...quote, receive: { minor: quote.receive.minor + 1, currency: "GBP" } },
    { ...quote, rate: { numerator: Infinity, denominator: 1 } },
    { ...quote, expiresAt: NaN },
    { ...quote, fee: { minor: 250, currency: "EUR" } },
  ])
    assert.throws(() => confirmTransfer(invalid, recipient, 1000), TypeError);
  assert.throws(
    () =>
      confirmTransfer(quote, { ...recipient, accountCurrency: "EUR" }, 1000),
    TypeError,
  );
});

test("confirmation checks the current expiry boundary and makes a deeply frozen independent snapshot", () => {
  const quote = createTransferQuote(input);
  assert.equal(quoteProblem(quote, recipient, 1999), null);
  assert.match(quoteProblem(quote, recipient, 2000), /expired/);
  assert.throws(() => confirmTransfer(quote, recipient, 2000), /expired/);
  const mutableQuote = {
    ...quote,
    send: { ...quote.send },
    fee: { ...quote.fee },
    receive: { ...quote.receive },
    rate: { ...quote.rate },
  };
  const mutableRecipient = { ...recipient };
  const transfer = confirmTransfer(mutableQuote, mutableRecipient, 1000);
  mutableQuote.send.minor = 999999;
  mutableRecipient.name = "Changed";
  assert.equal(transfer.quote.send.minor, 100000);
  assert.equal(transfer.recipient.name, "Jamie");
  for (const object of [
    transfer,
    transfer.quote,
    transfer.quote.send,
    transfer.quote.fee,
    transfer.quote.receive,
    transfer.quote.rate,
    transfer.recipient,
  ])
    assert.equal(Object.isFrozen(object), true);
  assert.throws(() => {
    transfer.quote.send.minor = 1;
  }, TypeError);
});

test("review identity changes for recipient, amount, currency, fee, rate and expiry even when quote ID is reused", () => {
  const quote = createTransferQuote(input),
    original = reviewIdentity(quote, recipient);
  for (const update of [
    { ...quote, send: { ...quote.send, minor: 100001 } },
    { ...quote, send: { ...quote.send, currency: "EUR" } },
    { ...quote, fee: { ...quote.fee, minor: 251 } },
    { ...quote, rate: { numerator: 84, denominator: 100 } },
    { ...quote, expiresAt: 3000 },
  ])
    assert.notEqual(reviewIdentity(update, recipient), original);
  assert.notEqual(
    reviewIdentity(quote, { ...recipient, id: "recipient-2" }),
    original,
  );
  assert.notEqual(
    reviewIdentity(quote, { ...recipient, accountLast4: "1234" }),
    original,
  );
});

test("keypad shares precise editing rules for two-, zero- and three-decimal currencies", () => {
  assert.equal(nextAmount("", "5", "USD"), "5");
  assert.equal(nextAmount("", ".", "USD"), "0.");
  assert.equal(nextAmount("0", "5", "USD"), "5");
  assert.equal(nextAmount("1.23", "4", "USD"), "1.23");
  assert.equal(nextAmount("1.23", "4", "KWD"), "1.234");
  assert.equal(nextAmount("1", ".", "JPY"), "1");
  assert.equal(nextAmount("1.2", ".", "USD"), "1.2");
  assert.equal(nextAmount("1.2", "⌫", "USD"), "1.");
  assert.equal(nextAmount("1", "⌫", "USD"), "0");
  assert.equal(nextAmount("90071992547409.9", "2", "USD"), "90071992547409.9");
  assert.equal(nextAmount("1", "e", "USD"), "1");
});

test("progress and chart values stay finite for empty, zero, negative and invalid data", () => {
  for (const value of [null, NaN, Infinity, -Infinity])
    assert.equal(boundedProgress(value), null);
  assert.equal(boundedProgress(-1), 0);
  assert.equal(boundedProgress(110), 100);
  assert.equal(
    limitProgress(
      { minor: 150, currency: "USD" },
      { minor: 100, currency: "USD" },
    ),
    100,
  );
  assert.throws(
    () =>
      limitProgress(
        { minor: 1, currency: "USD" },
        { minor: 100, currency: "EUR" },
      ),
    TypeError,
  );
  assert.throws(
    () =>
      limitProgress(
        { minor: 1, currency: "USD" },
        { minor: 0, currency: "USD" },
      ),
    TypeError,
  );
  assert.deepEqual(chartGeometry([]), []);
  for (const values of [[0], [0, 0], [-3, 0, 6]])
    for (const point of chartGeometry(
      values.map((value, index) => ({ label: String(index), value })),
    ))
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
  assert.throws(
    () => chartGeometry([{ label: "Invalid", value: NaN }]),
    TypeError,
  );
});

test("calendar values round-trip in local time and reject impossible dates", () => {
  assert.equal(dateValue(localDate("2026-10-25")), "2026-10-25");
  assert.equal(dateValue(localDate("2028-02-29")), "2028-02-29");
  for (const value of [
    "2026-02-29",
    "2026-13-01",
    "2026-00-01",
    "2026-01-00",
    "10/25/2026",
  ])
    assert.throws(() => localDate(value), TypeError);
});

test("integer steppers reject fractional, nonfinite and out-of-range values", () => {
  assert.doesNotThrow(() =>
    assertStepper({ value: 3, min: 1, max: 12, step: 2 }),
  );
  for (const patch of [
    { value: 0 },
    { value: 13 },
    { value: 1.5 },
    { step: 0 },
    { step: -1 },
    { step: 0.5 },
    { step: Infinity },
    { max: NaN },
    { min: 13 },
  ])
    assert.throws(
      () => assertStepper({ value: 3, min: 1, max: 12, step: 1, ...patch }),
      RangeError,
    );
});
