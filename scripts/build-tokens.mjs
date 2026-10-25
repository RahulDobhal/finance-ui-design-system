import fs from "node:fs";
import { resolveTokens } from "./resolve-tokens.mjs";
const t = resolveTokens(
  JSON.parse(
    fs.readFileSync(
      new URL("../src/design-system/tokens.json", import.meta.url),
    ),
  ),
);
// HeroUI compatibility bindings are derived from the 25 public color roles.
// They are implementation aliases, not additional product tokens.
function libraryBindings(mode) {
  const onStatus = mode === "dark" ? "var(--background)" : "var(--surface)";
  return `
  color-scheme: ${mode};
  --default: var(--surface-tertiary); --default-foreground: var(--foreground);
  --default-soft: var(--surface-secondary); --default-soft-foreground: var(--foreground);
  --field-background: var(--surface-secondary); --field-foreground: var(--foreground); --field-placeholder: var(--muted);
  --border: transparent; --separator: var(--surface-tertiary); --field-border: transparent; --field-border-hover: transparent; --field-border-focus: transparent;
  --border-width: 0px; --border-width-field: 0px;
  --surface-foreground: var(--foreground); --surface-secondary-foreground: var(--foreground); --surface-tertiary-foreground: var(--foreground);
  --overlay-foreground: var(--foreground); --segment: var(--surface); --segment-foreground: var(--foreground);
  --success-foreground: ${onStatus}; --warning-foreground: ${onStatus}; --danger-foreground: ${onStatus};
  --success-soft-foreground: var(--success); --warning-soft-foreground: var(--warning); --danger-soft-foreground: var(--danger);
  --state-ink: ${mode === "dark" ? "white" : "black"};
  --accent-hover: color-mix(in srgb, var(--accent) 90%, black);
  --default-hover: color-mix(in srgb, var(--surface-tertiary) 90%, var(--state-ink));
  --field-background-hover: color-mix(in srgb, var(--surface-secondary) 90%, var(--state-ink));
  --field-background-focus: var(--surface-secondary);
  --danger-hover: color-mix(in srgb, var(--danger) 90%, ${mode === "dark" ? "white" : "black"});
  --danger-soft-hover: color-mix(in srgb, var(--danger-soft) 90%, var(--danger));
  --surface-shadow: none; --field-shadow: none; --overlay-shadow: none;
`;
}

const dir = new URL("../src/design-system/", import.meta.url);
let css =
  "/* Generated from tokens.json. Run npm run tokens after editing. */\n";
for (const [theme, values] of Object.entries(t.themes)) {
  css += `${theme === "light" ? ":root, " : ""}[data-theme="${theme}"] {\n`;
  for (const [k, v] of Object.entries(values)) css += `  --${k}: ${v};\n`;
  css += libraryBindings(theme) + "}\n";
}
css += ":root {\n --device-hardware: " + t.primitives.neutral["950"] + ";\n";
for (const group of ["spacing", "radius", "border", "touch", "padding"])
  for (const [k, v] of Object.entries(t[group]))
    css += ` --${group}-${k}: ${v}px;\n`;
for (const [k, v] of Object.entries(t.elevation))
  css += ` --elevation-${k}: ${v};\n`;
for (const [k, v] of Object.entries(t.motion))
  css += ` --motion-${k}: ${typeof v === "number" ? v + "ms" : v};\n`;
for (const [k, v] of Object.entries(t.typography))
  css += ` --type-${k}-size: ${v.size / 16}rem; --type-${k}-line: ${v.lineHeight / 16}rem; --type-${k}-weight: ${v.weight}; --type-${k}-tracking: ${v.letterSpacing}px;\n`;
css += ` --font-sans: ${t.font.web}; --font-mono: ${t.font.mono}; --radius: ${t.radius.md}px; --radius-field: ${t.radius.md}px; --field-radius: ${t.radius.md}px; --disabled-opacity: ${t.opacity.disabled};\n}\n`;
const typeScale = {
  xs: "caption",
  sm: "body-small",
  base: "body",
  lg: "body",
  xl: "title",
  "2xl": "title",
  "3xl": "display",
  "4xl": "display",
};
function typeTheme(native = false) {
  return (
    "@theme { " +
    Object.entries(typeScale)
      .map(([key, role]) => {
        const value = t.typography[role];
        return `--text-${key}: ${native ? value.size + "px" : value.size / 16 + "rem"}; --text-${key}--line-height: ${value.lineHeight / value.size};`;
      })
      .join(" ") +
    ` --font-weight-normal: ${t.weights.regular}; --font-weight-medium: ${t.weights.medium}; --font-weight-semibold: ${t.weights.semibold}; --font-weight-bold: ${t.weights.semibold}; }\n`
  );
}
css += typeTheme();
let native =
  "/* Generated from shared tokens.json. Import AFTER heroui-native/styles. */\n@layer theme {\n";
for (const [theme, values] of Object.entries(t.themes)) {
  native += ` @variant ${theme} {\n`;
  for (const [k, v] of Object.entries(values)) native += `  --${k}: ${v};\n`;
  native += libraryBindings(theme) + " }\n";
}
native += `}\n@theme { --spacing: ${t.spacing["1"]}px; --radius: ${t.radius.sm}px; --field-radius: ${t.radius.md}px; --radius-panel: ${t.radius.lg}px; --font-sans: Inter_400Regular; --font-mono: GeistMono_400Regular; }\n`;
native += typeTheme(true);
native += `@layer components {
 .surface__root, .surface__background { border-curve: continuous; border-radius: ${t.radius.lg}px; }
 .surface__root { padding: ${t.padding.card}px; box-shadow: none; }
 .button__root { min-height: ${t.touch.minimum}px; height: auto; min-width: ${t.touch.minimum}px; padding-inline: ${((t.touch.minimum - t.typography.label.lineHeight) / 2) * 1.5}px; padding-block: ${(t.touch.minimum - t.typography.label.lineHeight) / 2}px; gap: ${t.spacing[2]}px; }
 .button__root, .button__background { border-curve: continuous; border-radius: ${t.radius.sm}px; }
 .button__root--variant-secondary { background-color: var(--secondary); border-width: 0px; }
 .button__label--variant-secondary { color: var(--secondary-foreground); }
 .button__root--variant-tertiary { background-color: var(--default); }
 .button__label { font-size: ${t.typography.label.size}px; line-height: ${t.typography.label.lineHeight}px; font-weight: ${t.typography.label.weight}; }
 .input__input, .select__trigger--variant-default, .text-area__root { min-height: ${t.touch.minimum}px; border-radius: ${t.radius.md}px; }
 .input__input, .input__background, .select__trigger--variant-default, .select__trigger-background, .text-area__root { border-curve: continuous; }
 .select__content, .select__content-background, .select__dialog-content, .dialog__content, .dialog__content-background, .menu__content, .menu__content-background, .popover__content, .popover__content-background { border-radius: ${t.radius.xl}px; border-curve: continuous; }
 .chip__root { border-radius: ${t.radius.xs}px; }
 .avatar__root, .avatar__fallback-container, .close-button__root, .close-button__background, .tabs__list, .tabs__list-background, .tabs__scroll-view, .tabs__trigger, .tabs__indicator { border-radius: ${t.radius.sm}px; border-curve: continuous; }
 .input__input, .input__background, .select__trigger--variant-default, .text-area__root { border-width: 0px; background-color: var(--surface-secondary); box-shadow: none; }
 .alert__root, .alert__background { border-radius: ${t.radius.md}px; border-curve: continuous; }
 .accordion__root { gap: ${t.spacing[2]}px; }
 .accordion__indicator { width: ${t.typography.label.lineHeight}px; height: ${t.typography.label.lineHeight}px; }
 .select__trigger-indicator, .search-field__search-icon { width: ${t.typography.body.lineHeight}px; height: ${t.typography.body.lineHeight}px; }
 .accordion__trigger { padding: ${t.spacing[3]}px; min-height: ${t.touch.minimum}px; }
 .card__root { border-width: 0px; box-shadow: none; }
 .button__label, .label__text, .tabs__label { font-family: Inter_500Medium; }
 .input__input, .text-area__root, .description__text { font-family: Inter_400Regular; }
 .avatar__fallback-text { font-family: Inter_500Medium; }
 .bottom-sheet__content-background, .bottom-sheet__background { border-top-left-radius: ${t.radius.lg}px; border-top-right-radius: ${t.radius.lg}px; box-shadow: none; }
 .bottom-sheet__content-container { padding: ${t.spacing[6]}px; gap: ${t.spacing[4]}px; }
 .dialog__content { padding: ${t.spacing[6]}px; gap: ${t.spacing[4]}px; }
 .close-button__root { width: ${t.touch.minimum}px; height: ${t.touch.minimum}px; }
 .alert__root { box-shadow: none; background-color: var(--surface-secondary); }
 .alert__content { gap: ${t.spacing[1]}px; }
 .search-field__root { gap: ${t.spacing[2]}px; }
 .select__trigger--variant-default { padding: ${t.padding.controlY}px ${t.padding.controlX}px; align-items: center; }
 .tabs__trigger { padding: ${t.padding.controlY}px ${t.padding.controlX}px; min-height: ${t.touch.minimum}px; }
 .tabs__indicator--variant-primary { box-shadow: none; }
 .checkbox__root, .checkbox__indicator { border-radius: ${t.radius.xs}px; box-shadow: none; }
 .checkbox__root { background-color: var(--surface); border-width: ${t.border.hairline}px; border-color: var(--muted); }
 .menu__item, .select__item { border-radius: ${t.radius.sm}px; padding: ${t.spacing[3]}px; min-height: ${t.touch.minimum}px; }
 .button__root--variant-outline { border-width: 0px; background-color: var(--surface-tertiary); }
 .slider__track, .slider__track-background, .slider__fill, .slider__thumb-knob { border-radius: ${t.radius.xs}px; box-shadow: none; }
 .slider__output-text { font-family: GeistMono_400Regular; }



}
`;
const outputs = new Map([
  [new URL("generated.css", dir), css],
  [
    new URL("tokens.ts", dir),
    "// Generated from tokens.json\nexport const tokens = " +
      JSON.stringify(t, null, 2) +
      " as const;\n",
  ],
  [new URL("../native/theme.css", dir), native],
]);

if (process.argv.includes("--check")) {
  const stale = [...outputs].filter(
    ([file, contents]) =>
      !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== contents,
  );
  if (stale.length) {
    console.error(
      "Generated tokens are missing or stale:\n" +
        stale.map(([file]) => "- " + file.pathname).join("\n") +
        "\nRun npm run tokens and commit the generated files.",
    );
    process.exitCode = 1;
  } else {
    console.log("Generated tokens are up to date.");
  }
} else {
  for (const [file, contents] of outputs) fs.writeFileSync(file, contents);
  console.log("Generated web CSS, TypeScript tokens and HeroUI Native theme.");
}
