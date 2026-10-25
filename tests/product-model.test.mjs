import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const compile = async (path) => {
  const source = new URL("../" + path, import.meta.url);
  const js = ts
    .transpileModule(fs.readFileSync(source, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replace(
      /from ["']([^"']+)["']/g,
      (_, name) => `from ${JSON.stringify(new URL(name, source).href)}`,
    );
  return import(
    `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
  );
};
const {
  startingConversation,
  resultForMessage,
  spendingSummary,
  filterActivity,
  previewQuote,
} = await compile("src/product/model.ts");
const { transactions, balance } = await compile("src/product/fixtures.ts");

test("each seeded conversation produces its intended embedded UI", () => {
  for (const [screen, result] of [
    ["Assistant", "overview"],
    ["Spending", "spending"],
    ["Transfer", "transfer"],
  ]) {
    const state = startingConversation(screen);
    assert.equal(state.messages.length, 2);
    assert.equal(resultForMessage(state.messages, 1), result);
  }
});
test("spending chart, categories and total reconcile and exclude income", () => {
  const month = spendingSummary(transactions, "Month");
  const week = spendingSummary(transactions, "Week");
  for (const summary of [month, week]) {
    assert.equal(
      summary.categories.reduce((sum, item) => sum + item.minor, 0),
      summary.total,
    );
    assert.equal(
      Math.round(
        summary.points.reduce((sum, item) => sum + item.value, 0) * 100,
      ),
      summary.total,
    );
    assert.ok(summary.rows.every((item) => item.amount.minor < 0));
  }
  assert.ok(week.total < month.total);
  assert.ok(week.rows.every((item) => item.day >= 19));
  assert.ok(week.rows.some((item) => item.status === "pending"));
});
test("search and filters combine without mutating the transaction records", () => {
  const before = JSON.stringify(transactions);
  assert.equal(
    filterActivity(transactions, "  spotify ", "Money out")[0].id,
    "spotify",
  );
  assert.equal(filterActivity(transactions, "spotify", "Money in").length, 0);
  assert.ok(
    filterActivity(transactions, "", "Pending").every(
      (item) => item.status === "pending",
    ),
  );
  assert.equal(JSON.stringify(transactions), before);
});
test("transfer validation rejects invalid precision, fees and insufficient funds", () => {
  for (const value of ["", "-1", "2.50", "0", "12.345", "12845.01", "1e5"]) {
    assert.ok(previewQuote(value, "jamie", balance.minor).error, value);
  }
  const { quote, error } = previewQuote("250.00", "jamie", balance.minor);
  assert.equal(error, null);
  assert.equal(quote.send.minor, 25000);
  assert.equal(quote.fee.minor, 250);
  assert.equal(quote.receive.minor, 20543);
  assert.notEqual(
    quote.id,
    previewQuote("250.00", "sam", balance.minor).quote.id,
  );
});
