import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Copy } from "lucide-react";
export default function Usage({
  name,
  section,
  notify,
}: {
  name: string;
  section: string;
  notify: (v: string) => void;
}) {
  const core = section === "Primitives";
  const [moduleSource, setModuleSource] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    if (core) return;
    let active = true;
    setModuleSource("");
    setLoadFailed(false);
    const source =
      section === "Chat"
        ? import("../../native/chat.tsx?raw")
        : import("../../native/finance.tsx?raw");
    source
      .then((module) => {
        if (active) setModuleSource(module.default);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [section, core]);
  const start = moduleSource.indexOf("export function " + name + "(");
  const next = moduleSource.indexOf("\nexport ", start + 1);
  const source =
    start >= 0 ? moduleSource.slice(start, next >= 0 ? next : undefined) : "";
  const code = core
    ? `import { ${name} } from 'heroui-native';\n\n// Preserve the upstream compound API.\n// Semantic roles come from the generated native theme.\n// All 39 audited exports: native/base.ts\n\n// Component reference:\nhttps://heroui.com/en/docs/native/components/${name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`
    : source;
  return (
    <div className="code-panel">
      <div className="row between">
        <span className="small muted">
          {core
            ? "Native import guide"
            : section === "Chat"
              ? "Actual source · native/chat.tsx"
              : "Actual source · native/finance.tsx"}
        </span>
        <Button
          isDisabled={!core && !moduleSource}
          size="sm"
          variant="ghost"
          onPress={() =>
            navigator.clipboard
              .writeText(code)
              .then(() => notify("Source copied"))
              .catch(() => notify("Select the source to copy it"))
          }
        >
          <Copy size={14} />
          Copy
        </Button>
      </div>
      <pre>
        {core || moduleSource
          ? code
          : loadFailed
            ? "Source could not be loaded. Reopen this tab to retry."
            : "Loading source…"}
      </pre>
      <p className="small muted">
        {core
          ? "The browser story uses the supported HeroUI React counterpart."
          : "The excerpt shares imports and helpers with the rest of the native module."}{" "}
        The complete project includes the typed source and runnable Expo
        catalog.
      </p>
    </div>
  );
}
