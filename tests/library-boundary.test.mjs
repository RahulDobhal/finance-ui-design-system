import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const options = {
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowJs: true,
  jsx: ts.JsxEmit.ReactJSX,
};

// Follow relative imports and re-exports, so a helper cannot silently reintroduce
// workshop fixtures or the other renderer into a product entry.
function dependencies(entry, seen = new Set()) {
  const filename = path.resolve(root, entry);
  if (seen.has(filename)) return seen;
  seen.add(filename);
  const file = ts.createSourceFile(
    filename,
    fs.readFileSync(filename, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    let specifier;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      specifier = node.moduleSpecifier.text;
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0])
    )
      specifier = node.arguments[0].text;
    if (specifier?.startsWith(".")) {
      assert.ok(
        !specifier.includes("?raw"),
        `Product entry imports source text: ${specifier}`,
      );
      const resolved = ts.resolveModuleName(
        specifier,
        filename,
        options,
        ts.sys,
      ).resolvedModule;
      assert.ok(
        resolved,
        `Unresolved local module ${specifier} in ${filename}`,
      );
      const relative = path.relative(root, resolved.resolvedFileName);
      assert.ok(
        !/(^|\/)(workshop|data|product)(\/|$)/.test(relative),
        `Product depends on demo/catalog module: ${relative}`,
      );
      dependencies(relative, seen);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return seen;
}

test("web and native product entries have no workshop dependencies or opposite renderer", () => {
  const web = dependencies("src/index.ts");
  assert.ok(
    [...web].every((file) => !file.startsWith(path.join(root, "native"))),
    "Web imports native renderer",
  );
  const native = dependencies("native/components.ts");
  assert.ok(
    [...native].every(
      (file) => !file.startsWith(path.join(root, "src/components")),
    ),
    "Native imports DOM renderer",
  );
});

test("product CSS excludes workshop layout and viewport ownership", () => {
  const css = fs.readFileSync(
    path.join(root, "src/components/finance.css"),
    "utf8",
  );
  assert.doesNotMatch(css, /\.(?:workshop|sidebar|phone-screen|story-stage)\b/);
  assert.doesNotMatch(css, /100dvh/);
});
