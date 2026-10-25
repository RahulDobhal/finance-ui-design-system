import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { resolveTokens } from "../scripts/resolve-tokens.mjs";
import { contrast } from "../src/design-system/money.mjs";
const read = (p) =>
  fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const js = ts.transpileModule(read("src/data/catalog.ts"), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const catalog = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);
const t = resolveTokens(JSON.parse(read("src/design-system/tokens.json")));
const additions = [
  ...catalog.financeNames,
  ...catalog.extensionNames,
  ...catalog.chatNames,
];
const all = [...catalog.baseNames, ...additions];
function parse(path) {
  return ts.createSourceFile(
    path,
    read(path),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}
function exports(path) {
  return parse(path)
    .statements.filter(
      (n) =>
        ts.isFunctionDeclaration(n) &&
        n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword),
    )
    .map((n) => n.name.text);
}
function cases(path) {
  const out = [];
  function visit(n) {
    if (ts.isCaseClause(n) && ts.isStringLiteral(n.expression))
      out.push(n.expression.text);
    ts.forEachChild(n, visit);
  }
  visit(parse(path));
  return out;
}
test("every catalog entry has an implementation, story and resolvable composition", () => {
  assert.equal(new Set(all).size, all.length);
  const web = exports("src/components/finance.tsx").concat(
    exports("src/components/chat.tsx"),
  );
  const native = exports("native/finance.tsx").concat(
    exports("native/chat.tsx"),
  );
  const storyCases = (directory) =>
    fs
      .readdirSync(new URL("../" + directory, import.meta.url))
      .filter((file) => file.endsWith(".tsx"))
      .flatMap((file) => cases(directory + "/" + file));
  const webCases = storyCases("src/workshop");
  const nativeCases = storyCases("native/workshop");
  for (const n of additions) {
    assert.ok(web.includes(n), "Web export: " + n);
    assert.ok(native.includes(n), "Native export: " + n);
    assert.ok(webCases.includes(n), "Web story: " + n);
    assert.ok(nativeCases.includes(n), "Native story: " + n);
    assert.ok(catalog.compositions[n]?.length, "Composition: " + n);
  }
  for (const n of catalog.baseNames)
    assert.ok(
      cases("src/workshop/BaseStory.tsx").includes(n),
      "Core adapter: " + n,
    );
  for (const [name, children] of Object.entries(catalog.compositions))
    for (const child of children)
      assert.ok(all.includes(child), `${name} refers to missing ${child}`);
});
test("exported UI components are either in the catalog or consumed helpers", () => {
  const support = [
    "FinanceStory",
    "ChatStory",
    "NativeChatStory",
    "Toggle",
    "FinanceText",
    "useFinanceTheme",
  ];
  for (const path of [
    "src/components/finance.tsx",
    "src/components/chat.tsx",
    "native/finance.tsx",
    "native/chat.tsx",
  ])
    for (const name of exports(path))
      assert.ok(
        additions.includes(name) || support.includes(name),
        "Unregistered export: " + name,
      );
});
test("type, radius and touch contracts match the restyle", () => {
  assert.deepEqual(
    [...new Set(Object.values(t.typography).map((v) => v.size))].sort(
      (a, b) => a - b,
    ),
    [12, 14, 16, 24, 32],
  );
  assert.deepEqual(
    [...new Set(Object.values(t.typography).map((v) => v.weight))].sort(),
    [400, 500, 600],
  );
  assert.equal(t.shape.cornerSmoothing, 1);
  assert.equal(t.radius.sm, 6);
  assert.equal(t.radius.md, 8);
  assert.equal(t.radius.lg, 10);
  assert.ok(t.touch.minimum >= 48);
  assert.equal(t.padding.card, 16);
});
test("action, chat and secondary text pairs meet AA in both themes", () => {
  for (const [mode, c] of Object.entries(t.themes))
    for (const [fg, bg] of [
      ["secondary-foreground", "secondary"],
      ["foreground", "surface-tertiary"],
      ["foreground", "surface-secondary"],
      ["muted", "surface-secondary"],
      ["muted", "surface-secondary"],
      ["accent-foreground", "accent"],
      ["accent-soft-foreground", "accent-soft"],
    ])
      assert.ok(
        contrast(c[fg], c[bg]) >= 4.5,
        `${mode} ${fg}/${bg}: ${contrast(c[fg], c[bg])}`,
      );
});
test("handwritten styles contain no raw color literals or independent font sizes", () => {
  for (const path of [
    "src/styles.css",
    "src/product/product.css",
    "src/components/styles.css",
    "src/components/finance.css",
    "src/workshop/chat.css",
    "src/components/chat.css",
    "src/design-system/components.css",
  ]) {
    const s = read(path);
    assert.equal(
      (s.match(/#[\da-f]{3,8}\b/gi) || []).length,
      0,
      path + " raw color",
    );
    assert.equal(
      (s.match(/font-size\s*:\s*\d+(?:\.\d+)?px/g) || []).length,
      0,
      path + " raw size",
    );
    assert.equal(
      (s.match(/font-weight\s*:\s*(?:[1-3]00|[7-9]00|550|650)/g) || []).length,
      0,
      path + " unexpected weight",
    );
  }
});
