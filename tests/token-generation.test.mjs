import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const project = new URL("../", import.meta.url);
const generatedFiles = [
  "src/design-system/generated.css",
  "src/design-system/tokens.ts",
  "src/native/theme.css",
];

test("token validation rejects stale and missing artifacts without rewriting them", (t) => {
  const fixture = fs.mkdtempSync(
    path.join(os.tmpdir(), "finance-token-check-"),
  );
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  for (const file of [
    "scripts/build-tokens.mjs",
    "scripts/resolve-tokens.mjs",
    "src/design-system/tokens.json",
    ...generatedFiles,
  ]) {
    const destination = path.join(fixture, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(new URL(file, project), destination);
  }
  const run = (...args) =>
    spawnSync(process.execPath, ["scripts/build-tokens.mjs", ...args], {
      cwd: fixture,
      encoding: "utf8",
    });
  const before = generatedFiles.map((file) => ({
    contents: fs.readFileSync(path.join(fixture, file), "utf8"),
    modified: fs.statSync(path.join(fixture, file)).mtimeMs,
  }));
  const initial = run("--check");
  assert.equal(initial.status, 0, initial.stderr);

  const source = path.join(fixture, "src/design-system/tokens.json");
  const tokens = JSON.parse(fs.readFileSync(source, "utf8"));
  tokens.typography.label.lineHeight += 1;
  fs.writeFileSync(source, JSON.stringify(tokens));
  const stale = run("--check");
  assert.equal(stale.status, 1);
  for (const [index, file] of generatedFiles.entries()) {
    assert.ok(stale.stderr.includes(path.basename(file)), stale.stderr);
    assert.equal(
      fs.readFileSync(path.join(fixture, file), "utf8"),
      before[index].contents,
    );
    assert.equal(
      fs.statSync(path.join(fixture, file)).mtimeMs,
      before[index].modified,
    );
  }

  const generated = run();
  assert.equal(generated.status, 0, generated.stderr);
  const current = run("--check");
  assert.equal(current.status, 0, current.stderr);
  const missing = path.join(fixture, generatedFiles[0]);
  fs.unlinkSync(missing);
  const absent = run("--check");
  assert.equal(absent.status, 1);
  assert.equal(fs.existsSync(missing), false);
});
