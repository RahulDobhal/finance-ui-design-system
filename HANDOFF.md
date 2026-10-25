# Finance UI 0.2 — design and engineering handoff

Updated 25 October 2026. The local workshop is http://localhost:5188. This release restyles the existing finance library and adds conversational UI. It contains 72 component stories (39 HeroUI adapters + 18 finance + 8 extensions + 7 chat) and 6 composed patterns.

## Visual contract

| Foundation | Decision | Implementation |
| --- | --- | --- |
| Primary | Green `#71ef8a`, near-black text | `accent` / `accent-foreground`, both modes |
| Secondary | Near-black in light mode; light in dark mode | `secondary` / `secondary-foreground`; no decorative border |
| Neutral action | Gray, with theme-specific foreground | HeroUI `tertiary`, backed by `surface-tertiary` / `foreground` |
| Surfaces | White content on a gray canvas; charcoal equivalents in dark mode | Background tones create distinction; no decorative outlines or shadows |
| Corners | Controls 6; fields/messages 8; cards/composers 10; dialogs 10; menus 8; native overlays 12 | `radius.sm/md/lg/xl` |
| Smoothing | Design handoff value **100%** | `shape.cornerSmoothing = 1`; see platform geometry limitation below |
| Typography | **12, 14, 16, 24, 32** | Ten semantic roles share these five sizes |
| Weight | **400, 500, 600** | Regular body, medium labels/numbers, semibold headings |
| Padding | Controls: 12 px vertical/icon side, 18 px text side; cards 16 | Text edge = 1.5× vertical padding. 24 px control icons make the optical inset equal on three sides. |
| Spacing | 4-point rhythm; 16 within groups, 24–32 between sections | Existing generous composition spacing retained |
| Touch | Shared minimum 48; iOS reference 44; Android reference 48 | Minimum size, not fixed height, for scalable content |
| Motion | 120 ms feedback; 180 ms disclosure; 240 ms larger transitions | Short fades/color changes; no decorative entrance choreography |

Inter is bundled on web and loaded through Expo Font on native. Geist Mono is used for small amounts, account references and numeric controls; large balances stay in Inter with tabular figures. Money retains safe integer minor units. Body text is a custom 16 pt native style, not a claim to use Apple's default 17 pt body style. Font scaling remains enabled, with no multiplier cap.

**Corner geometry limitation:** a Figma 100% smoothing value is not a portable CSS/RN radius. The browser uses `corner-shape: squircle` where supported and ordinary rounded corners otherwise. Native surfaces use `borderCurve: continuous` on iOS; Android uses the small rounded radius fallback. These are visually related, not pixel-identical Figma paths. Exact cross-platform geometry would require a shared SVG/path renderer; this release does not claim that parity. Avatars, close buttons, tabs and action targets follow the same small square/squircle corners. Only intrinsic radio/status indicators retain circular geometry. Device hardware in the catalog is a viewport illustration, not a product component.

## Where to change things

- `src/design-system/tokens.json`: canonical palette, semantic aliases, sizes, weights, padding, shape and motion.
- `scripts/build-tokens.mjs`: generates `tokens.ts`, browser `generated.css`, and `src/native/theme.css`. Tailwind's type aliases come from the same typography roles.
- `src/design-system/components.css`: browser HeroUI bindings and platform target/reduced-motion rules.
- `src/components/finance.tsx` / `native/finance.tsx`: finance and extension components.
- `src/components/chat.tsx` / `native/chat.tsx`: chat primitives and the composed thread.
- `src/design-system/chat-state.mjs`: shared conversation state reducer and explicitly fictional demo data.
- `src/data/catalog.ts`: inventory, compositions, token mappings, descriptions and story states.

Edit tokens, run `npm run tokens`, then build and test. Do not edit generated files. Reuse semantic roles; do not introduce literal colors, independent font sizes, new weights or pill corners in component code. `noUnusedLocals` and `noUnusedParameters` are enabled in both TypeScript projects.

## Chat component contracts

| Component | States and behavior |
| --- | --- |
| ThinkingIndicator | Thinking, searching, analyzing, writing, completed, stopped, error; text remains present without animation |
| ThinkingPanel | Collapsed/expanded; operation summary; error message and optional retry; no private reasoning content |
| ResponseFeedback | Controlled `like` / `dislike` / `null`; mutually exclusive; repeat action clears; disabled state |
| AgentResponse | Content, writing/interrupted/stopped/completed; copy feedback; optional retry; response feedback |
| UserQuery | Sent/sending/error; optional retry; long text wraps and preserves line breaks |
| PromptInput | Spacious start, compact follow-up; empty/filled/focus/disabled/generating/error; send/stop; draft survives error |
| ChatThread | Composes the above; local progress simulation; request identity guards cancellation and stale completions; retry keeps one user query |

Web composer: Enter sends, Shift+Enter adds a line; IME composition does not accidentally send. Native composer: the software keyboard inserts new lines, and an explicit Send action submits. Both disable empty submissions and keep Stop separate from Send. A thread becomes compact after its first query. Autoscroll follows new content only while the reader is near the end; it does not force a reader who scrolled up back to the bottom.

The workshop's error thread fails its first run, then succeeds when retried. Feedback is local component state, not a durable server record. No model, banking, search or financial service is connected. The progress labels are demonstrations, not claims that an external search happened. Supply real operation events in a product integration.

## Platform guidance audit

| Guideline | Source-backed requirement | Implemented / remaining validation |
| --- | --- | --- |
| iOS touch | Apple recommends 44 × 44 pt controls | Shared 48 minimum; small custom native controls add hit slop. Verify final layouts with VoiceOver/device audit. |
| Android touch | Android recommends 48 × 48 dp targets | Buttons/fields/custom chat targets use 48 minimum. Confirm hit bounds, overlap and upstream primitives on device. |
| Text enlargement | Apple recommends supporting at least 200%; Android supports font scaling | Web type uses rem, native text scaling enabled, content uses min heights and wrapping. Largest Dynamic Type/font scale is not device-verified. |
| Contrast | Text needs sufficient foreground/background contrast | Automated tests verify key normal-text pairs at ≥4.5:1 in both modes, including chat, secondary buttons and muted labels. |
| Motion | Purposeful motion, support reduced motion | Browser media query disables custom motion; native preference hook updates HeroUI's `disable-all` setting and activity animation. Device preference behavior remains unverified. |
| Semantics | Controls need readable labels, roles and state | Feedback exposes pressed/selected state; disclosure exposes expanded state; errors/status are announced; chart data has text alternatives. VoiceOver/TalkBack QA is still required. |
| Layout / keyboard | Fit the viewport, accommodate safe areas and keyboard | Responsive browser layout; native safe-area and keyboard-avoiding container; multiline prompt. Native keyboard, gesture and screen-size QA remains open. |

Primary references checked for this revision:

- [Apple UI design tips: target sizes, legibility and layout](https://developer.apple.com/design/tips/)
- [Apple HIG accessibility: scaling, contrast and controls](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple HIG motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Android accessible defaults and 48 dp targets](https://developer.android.com/develop/ui/compose/accessibility/api-defaults)
- [Android app accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/apps)
- [React Native AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo)

Pass 1 references: the user's three attached finance UI images, including the reversed Wallet balance/action hierarchy; [HextaUI Chat Thread](https://hextaui.com/blocks/chat-thread) and its live preview for compact activity disclosures, open assistant responses, user bubbles and a docked composer; [Razorpay Blade](https://blade.razorpay.com/) for the consistency of amount, field, status and composition contracts. Their visual branding was not imported.

## Code and coverage audit

The static inventory audit confirms each of the 33 additions has browser and native exports, reachable stories in both catalogs, and a composition contract. The 39 upstream families have browser adapters. Every composition dependency resolves. Exported helpers are accounted for; no unregistered custom UI export was found. This is a bounded source audit, not a claim that arbitrary runtime branches are all covered.

Cleanup includes unused imports, readable source formatting, unique amount-field IDs, disabled keypad propagation in the browser, state reset across chat stories, semantic secondary-button colors, and token-driven type aliases. Existing financial arithmetic tests remain in place. Chat tests cover duplicate submit, cancellation, stale completion, retry identity and error retention. Handwritten styles are checked for raw hex colors, independent pixel font sizes and extra weights.

## Release checks and limits

Run from the project root:

```sh
npm ci
npm run tokens
npm run build
npm test
npm run dev
```

For native:

```sh
cd native
npm ci
npm run typecheck
npm run bundle:ios
npm run bundle:android
npm start
```

Use a Node version supported by Expo (this machine's exports use Node 24.14.0). Native bundling and TypeScript checks do not establish device parity. Before a production release, verify the native catalog on iOS and Android, especially VoiceOver/TalkBack, 200% text, reduced motion, IME/multiline entry, keyboard obstruction, target bounds, focus order, overlays and date picker behavior.

Browser QA and final build results are recorded in `VALIDATION.md`. The full catalog bundle includes all upstream demos and source excerpts, so Vite warns about its chunk size; a consuming product should import only the components it needs. Previously recorded Expo toolchain dependency advisories are not resolved by this UI restyle. No account setup, deployment or publication was performed.

## Pass 1 refinement — 25 October 2026

The public color contract now contains **25 roles per theme**. Field, balance, directional-money, user-message and border-specific roles were consolidated into shared surfaces, foregrounds and status roles. Required HeroUI CSS names are generated compatibility aliases, not additional independently themed colors. Hover mixes 10% of an appropriate foreground/black/white into the base; pressed mixes 16%. Focus remains a visible outline for keyboard access.

The balance composition uses a quiet light balance region and a stronger green action row. Transfer, Request, Add and Convert share that row, removing duplicated account-home actions. Payment cards, quotes, fee totals, receipts and empty states use the same surface and spacing rules. The amount entry and equal-width keypad form a calculator; the limit meter composes the shared HeroUI Slider.

Checkbox labels are now inside the interactive content wrapper. Sheets and dialogs share aligned headings/close targets, 24 px section spacing and 16 px body spacing. Select values and indicators align centrally; search label/field/helper gaps are 8 px. Accordion padding is compact with 8 px between items. Segmented controls, tabs, avatars and menus use sharp corners. Scroll shadows are retained.

Chat progress is an inline disclosure with completed/current operation rows. User messages use quiet filled bubbles; assistant content stays open with a small identity label and copy/feedback actions. The composer has filled surfaces, responsive compact mode, visible focus, send/stop and retained error behavior. This pass changes visual contracts and repairs their layout defects; the separately requested code-quality/scalability pass remains a later review.

## Visual follow-up

Icon frames follow the adjacent line height: 20 px for button/accordion labels, 24 px for body fields, and the corresponding heading line height when paired with a heading. Default buttons remain 48 px tall, with derived 14 px icon/vertical padding and 21 px text-side padding. The embedded currency selector has an explicit compact 88 × 40 px browser trigger; full-size selectors remain available. Checkbox/radio outlines are functional control boundaries, with light interiors. Menu hover corners use 4 px radii. The phone preview uses a subtle green-gray background.

Agent responses omit redundant identity and reaction/copy actions. The chat composition includes an embedded spending-review result with an expandable breakdown, following the latest supplied chat reference. `prompt.md` contains the available project prompts and the subsequently supplied code-review side-chat prompt verbatim.
