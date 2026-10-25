import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  parseMinor,
  formatMoney,
  makeQuote,
  currencyDigits,
  contrast,
} from "../src/design-system/money.mjs";
import { resolveTokens } from "../scripts/resolve-tokens.mjs";
const t = resolveTokens(
  JSON.parse(
    fs.readFileSync(
      new URL("../src/design-system/tokens.json", import.meta.url),
    ),
  ),
);
test("currency precision covers two, zero and three decimal currencies", () => {
  assert.equal(parseMinor("0.10", "USD"), 10);
  assert.equal(parseMinor("1000", "JPY"), 1000);
  assert.equal(parseMinor("1.234", "KWD"), 1234);
  assert.equal(parseMinor("1.234", "USD"), null);
  assert.equal(parseMinor("1.1", "JPY"), null);
  assert.equal(parseMinor("-1", "USD"), null);
  assert.equal(parseMinor("1e3", "USD"), null);
  assert.equal(parseMinor("", "USD"), null);
  assert.equal(parseMinor("900719925474099100", "USD"), null);
});
test("money formatting preserves stored minor units", () => {
  assert.equal(formatMoney(1234, "USD"), "$12.34");
  assert.equal(formatMoney(1000, "JPY"), "¥1,000");
  assert.equal(currencyDigits("KWD"), 3);
  assert.throws(() => formatMoney(1.5, "USD"));
});
test("quotes subtract included fees and round once in integer arithmetic", () => {
  assert.deepEqual(makeQuote(100000), {
    sendMinor: 100000,
    feeMinor: 250,
    receiveMinor: 82793,
    from: "USD",
    to: "GBP",
    valid: true,
  });
  assert.equal(makeQuote(200).valid, false);
  assert.equal(makeQuote(200).receiveMinor, 0);
  assert.equal(
    makeQuote(1000, {
      from: "JPY",
      to: "GBP",
      feeMinor: 0,
      rateNumerator: 1,
      rateDenominator: 100,
    }).receiveMinor,
    1000,
  );
  assert.throws(() => makeQuote(-1));
});
test("both themes share the same semantic contract", () =>
  assert.deepEqual(
    Object.keys(t.themes.light).sort(),
    Object.keys(t.themes.dark).sort(),
  ));
test("all key normal-text color pairings meet WCAG AA", () => {
  for (const [name, c] of Object.entries(t.themes)) {
    for (const [fg, bg] of [
      ["foreground", "background"],
      ["muted", "surface"],
      ["accent-foreground", "accent"],
      ["surface", "success"],
      ["surface", "warning"],
      ["surface", "danger"],
      ["foreground", "surface-secondary"],
      ["muted", "surface-secondary"],
    ])
      assert.ok(
        contrast(c[fg], c[bg]) >= 4.5,
        `${name} ${fg} on ${bg}: ${contrast(c[fg], c[bg])}`,
      );
  }
});
test("touch targets and type scale have explicit constraints", () => {
  assert.ok(t.touch.minimum >= 44);
  for (const style of Object.values(t.typography))
    assert.ok(style.lineHeight >= style.size);
  assert.equal(t.spacing["4"], 16);
});

test("aliases resolve and reject missing or circular references", () => {
  assert.equal(
    resolveTokens({ raw: "#fff", semantic: "{raw}" }).semantic,
    "#fff",
  );
  assert.throws(() => resolveTokens({ a: "{b}", b: "{a}" }), /Circular/);
  assert.throws(() => resolveTokens({ a: "{missing}" }), /Unknown/);
});
