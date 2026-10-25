# Finance UI handoff

The design system has separate reusable web/native entries and a local workshop. Financial data and transport belong to the consuming application. The workshop uses fictional records and simulated actions.

## Entries

| Use | Entry |
| --- | --- |
| Web components and public types | `src/index.ts` |
| Web fonts, theme and component styles | `src/components/styles.css` |
| Native components and public types | `native/components.ts` |
| Native theme | `src/native/theme.css`, imported by `native/global.css` |
| Shared financial contracts | `src/design-system/finance-types.ts` |
| Shared chat contracts | `src/design-system/chat.ts` |
| Token source | `src/design-system/tokens.json` |
| Browser workshop | `src/App.tsx`, `src/workshop/` |
| Native workshop | `native/App.tsx`, `native/workshop/` |

Import the web stylesheet once. It provides design-system typography/reset rules but does not include the workshop sidebar, phone frames, preview layouts or viewport-height constraints. The browser workshop additionally imports `src/styles.css` and workshop chat examples. Native consumers use HeroUINativeProvider, Uniwind and the included Expo font setup. Shared hooks resolve to native React through the native Metro configuration.

## Visual contracts

- 25 semantic color roles in both modes. HeroUI compatibility variables are generated aliases.
- Filled surfaces distinguish cards and fields. Checkbox/radio outlines and keyboard focus rings are functional boundaries. Intentional scroll shadows remain.
- Inter for UI and large balances; Geist Mono for smaller money values and account references. Five type sizes, three weights.
- Icon frames match adjacent line heights: 20 px for labels, 24 px for body text, and the relevant heading line height.
- Default buttons: 48 px target, 14 px vertical/icon-side padding, 21 px text-side padding. Fields use 12/18 px. The compact currency trigger is 88 × 40 px on web; larger controls remain available.
- Sharp corners: 4 px detail, 6 px controls, 8 px fields, 10–12 px surfaces/overlays. Radio/status indicators retain intrinsic circular geometry.
- Hover mixes 10%; press mixes 16%. Focus stays explicit. Reduced motion disables custom animations.
- Quiet balance region and stronger green action row. Chat responses omit redundant identity/reaction/copy controls, and accept embedded result content.

CSS squircle support and iOS continuous curves are related fallbacks, not identical Figma paths. Android uses small rounded corners. Browser previews use HeroUI React; they do not establish native rendering parity.

## Financial data flow

Every `Money` value carries integer `minor` units and `currency`. Lists take stable transaction IDs and per-row money; selecting a display currency cannot relabel stored records. Data tables intentionally remain small record tables, without speculative virtualization or sorting APIs.

`createTransferQuote` requires explicit send, fee, destination currency and rational rate, plus an ID and expiry (or explicit `null`). Reusable components have no pricing defaults. `FeeBreakdown`, `ExchangeQuote` and `TransferReview` consume the same quote.

`TransferReview` validates the model and recipient, updates expiry feedback, and rechecks the current time at confirmation. Changing reviewed data clears acknowledgement, including an A→B→A change. `onConfirm` receives a deeply frozen `TransferSnapshot`. The application owns submission state and payment execution, then supplies the result status to `Receipt`. A snapshot is evidence of the reviewed data, not proof of payment. Receipt data does not read live editor controls.

Bank details, payment card state, balances, verification state, dates, chart data, spending periods and limits are supplied through explicit props. Account copy, card freeze, verification, download and selection actions call application callbacks. Payment-card reveal resets when card data changes. Stepper intervals require safe integer values and positive integer steps. Nonfinite progress uses an indeterminate state; invalid chart/limit data is rejected.

## Chat data flow

`ChatThread` takes `messages`, `status`, `activity`, `draft`, `onDraftChange`, `onSend`, and optional stop/retry callbacks. The application owns the transport. `renderResult(message, index)` composes a financial result after an assistant response; `emptyState` supplies onboarding content. There is no simulated network or demo data in reusable components.

Web/native workshops share `useDemoChat` and the same cancellable simulated response controller. The reducer rejects stale events. The composer preserves a next-turn draft while a response is generating, supports IME and multiline entry, and restores focus only after an explicit action. A single announcement channel per thread avoids duplicate screen-reader output. Actual VoiceOver/TalkBack behavior still needs device QA.

## Workshop architecture

The shell owns navigation/theme/notifications. Foundations, story controls, patterns, and reference pages are separate modules. `StoryProps` exists only for workshop controls. All source excerpts are dynamically imported when Usage example is opened. Product imports cannot pull in workshop fixtures or the opposite platform renderer; an import-boundary test enforces this.

`useFinanceDemo` holds controlled catalog state, including the confirmed snapshot. Fixtures are shared across platform stories. Financial calculations and keypad editing remain pure shared functions; platform rendering is separate. No routing/state framework, schema engine or universal component factory was added.

## Checks and remaining integration

Run `npm run tokens:check`, `npm test`, `npm run build`, and `npm --prefix native run typecheck`. Run `npm run tokens` only when changing tokens; check mode fails on stale outputs without rewriting them. Native exports use a Node version supported by Expo (Node 24.14.0 was used here).

See [VALIDATION.md](VALIDATION.md) for actual evidence. Native device QA, RTL/localization, large text, keyboard/safe-area behavior, gestures and assistive technology remain integration checks. Financial authorization, real payments, KYC, authentication and live rates are application services. The full workshop still produces a Vite chunk-size warning; product consumers import the reusable entries rather than the catalog.

References: the supplied finance and chat images, [HextaUI Chat Thread](https://hextaui.com/blocks/chat-thread), [Razorpay Blade](https://blade.razorpay.com/), and the Mobbin observations in [FINANCE-AUDIT.md](FINANCE-AUDIT.md). Prompt history is in [prompt.md](prompt.md).
