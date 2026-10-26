import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

test("web builds preserve native source previews without installing Expo", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "finance-source-preview-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "native"));
  fs.writeFileSync(
    path.join(root, "native/tsconfig.json"),
    JSON.stringify({ extends: "expo/tsconfig.base" }),
  );
  const source = 'export function Example() { return <Text>£12.50</Text>; }\n';
  fs.writeFileSync(path.join(root, "native/example.tsx"), source);
  fs.writeFileSync(
    path.join(root, "entry.ts"),
    'import source from "./native/example.tsx?raw";\nexport const preview: string = source;',
  );
  const result = await build({
    configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
    root,
    logLevel: "silent",
    build: {
      write: false,
      minify: false,
      lib: { entry: path.join(root, "entry.ts"), formats: ["es"] },
    },
  });
  const output = (Array.isArray(result) ? result[0] : result).output;
  const entry = output.find((chunk) => chunk.type === "chunk" && chunk.isEntry);
  assert.ok(entry, "The source preview has a loadable web entry");
  const module = await import(
    "data:text/javascript;base64," + Buffer.from(entry.code).toString("base64")
  );
  assert.equal(module.preview, source);
});
