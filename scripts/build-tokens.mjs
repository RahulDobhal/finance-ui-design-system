import fs from 'node:fs';
import {resolveTokens} from './resolve-tokens.mjs';
const t = resolveTokens(JSON.parse(fs.readFileSync(new URL('../src/design-system/tokens.json', import.meta.url))));
const dir = new URL('../src/design-system/', import.meta.url);
let css = '/* Generated from tokens.json. Run npm run tokens after editing. */\n';
for(const [theme, values] of Object.entries(t.themes)) {
  css += `${theme==='light'?':root, ':''}[data-theme="${theme}"] {\n`;
  for(const [k,v] of Object.entries(values)) css += `  --${k}: ${v};\n`;
  css += '  --surface-foreground: var(--foreground); --surface-secondary-foreground: var(--foreground); --surface-tertiary-foreground: var(--foreground); --segment: var(--surface); --segment-foreground: var(--foreground);\n}\n';
}
css += ':root {\n --device-hardware: '+t.primitives.neutral['950']+';\n';
for (const group of ['spacing','radius','border','touch','padding']) for(const [k,v] of Object.entries(t[group])) css += ` --${group}-${k}: ${v}px;\n`;
for(const [k,v] of Object.entries(t.elevation)) css += ` --elevation-${k}: ${v};\n`;
for(const [k,v] of Object.entries(t.motion)) css += ` --motion-${k}: ${typeof v==='number'?v+'ms':v};\n`;
for(const [k,v] of Object.entries(t.typography)) css += ` --type-${k}-size: ${v.size/16}rem; --type-${k}-line: ${v.lineHeight/16}rem; --type-${k}-weight: ${v.weight}; --type-${k}-tracking: ${v.letterSpacing}px;\n`;
css += ` --font-sans: ${t.font.web}; --radius: ${t.radius.md}px; --radius-field: ${t.radius.md}px; --field-radius: ${t.radius.md}px; --disabled-opacity: ${t.opacity.disabled};\n}\n`;
css += '@theme { --text-xs: .75rem; --text-sm: .875rem; --text-base: 1rem; --text-lg: 1rem; --text-xl: 1.5rem; --text-2xl: 1.5rem; --text-3xl: 2rem; --text-4xl: 2rem; --font-weight-normal: 400; --font-weight-medium: 500; --font-weight-semibold: 600; --font-weight-bold: 600; }\n';
fs.writeFileSync(new URL('generated.css',dir),css);
fs.writeFileSync(new URL('tokens.ts',dir),'// Generated from tokens.json\nexport const tokens = '+JSON.stringify(t,null,2)+' as const;\n');
let native='/* Generated from shared tokens.json. Import AFTER heroui-native/styles. */\n@layer theme {\n';
for(const [theme,values] of Object.entries(t.themes)) {native+=` @variant ${theme} {\n`;for(const [k,v] of Object.entries(values))native+=`  --${k}: ${v};\n`;native+='  --surface-foreground: var(--foreground); --surface-secondary-foreground: var(--foreground); --surface-tertiary-foreground: var(--foreground); --segment: var(--surface); --segment-foreground: var(--foreground);\n }\n';}
native+=`}\n@theme { --spacing: ${t.spacing['1']}px; --radius: ${t.radius.sm}px; --field-radius: ${t.radius.md}px; --radius-panel: ${t.radius.lg}px; }\n`;
native+=`@theme { --text-xs: 12px; --text-sm: 14px; --text-base: 16px; --text-lg: 16px; --text-xl: 24px; --text-2xl: 24px; --text-3xl: 32px; --text-4xl: 32px; --font-weight-bold: 600; }
@layer components {
 .surface__root, .surface__background { border-radius: ${t.radius.lg}px; }
 .card__root { padding: ${t.padding.card}px; }
 .button__root { min-height: ${t.touch.minimum}px; height: auto; min-width: ${t.touch.minimum}px; padding-inline: ${t.padding.controlX}px; padding-block: ${t.padding.controlY}px; }
 .button__root, .button__background { border-radius: ${t.radius.sm}px; }
 .button__root--variant-secondary, .button__background--variant-secondary { background-color: var(--secondary); border-color: var(--secondary-border); border-width: 1px; }
 .button__label--variant-secondary { color: var(--secondary-foreground); }
 .button__root--variant-tertiary { background-color: var(--default); }
 .button__label { font-size: 14px; font-weight: 500; }
 .input__root, .select__trigger, .text-area__root { min-height: ${t.touch.minimum}px; border-radius: ${t.radius.md}px; }
 .chip__root { border-radius: ${t.radius.xs}px; }
}
`;
fs.writeFileSync(new URL('../native/theme.css',dir),native);
console.log('Generated web CSS, TypeScript tokens and HeroUI Native theme.');
