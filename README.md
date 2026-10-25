# Finance UI 0.2

A composable finance design system built around HeroUI Native 1.0.11, with a Storybook-like browser workshop and a separate runnable Expo native catalog.

See [HANDOFF.md](HANDOFF.md) for the new visual contract, chat states, platform guidance and geometry limitations.

## Open the workshop

The local preview is at **http://localhost:5188**.

```sh
npm ci
npm run dev
```

The browser contains 8 foundation pages, 39 audited HeroUI primitive stories, 18 finance component stories, 8 extended primitive stories, 7 chat stories, 6 composed UI patterns, a finance coverage audit and three Mobbin references.

Use the navigation search, light/dark toggle, applicable story controls, source view, token mapping and interaction log. Export tokens downloads the canonical source including semantic aliases. All payments, balances, exchange rates, account details and identities are fictional demo data.

## Pass 1 visual refinement

The system now has 25 semantic color roles per theme, tone-based surfaces, sharp component corners, 12/18 px icon/text padding, and simplified hover/pressed states. Finance layouts and chat interactions follow the latest supplied references. See [HANDOFF.md](HANDOFF.md) for the visual contract and [VALIDATION.md](VALIDATION.md) for checks.

## Architecture

```text
src/design-system/tokens.json       Canonical primitives, aliases and scales
scripts/resolve-tokens.mjs          Alias resolver with cycle/missing checks
scripts/build-tokens.mjs            Platform token generation
src/design-system/tokens.ts         Generated resolved TypeScript tokens
src/design-system/generated.css     Generated browser theme
src/native/theme.css               Generated HeroUI Native theme
src/data/catalog.ts                Inventory, mappings, compositions and audit
src/components/finance.tsx          Browser finance implementations
src/components/BaseStory.tsx        HeroUI React adapters for native concepts
native/base.ts                     39 HeroUI Native compound-component exports
native/finance.tsx                 26 real native finance/extension components
native/chat.tsx                    7 chat components and native stories
src/components/chat.tsx            Browser chat components
src/design-system/chat-state.mjs   Shared cancellable conversation state
HANDOFF.md                        Visual contracts and platform guidance audit
VALIDATION.md                     Current verification evidence
native/App.tsx                     Runnable native extension catalog
tests/money.test.mjs                Financial arithmetic, aliases and contrast
FINANCE-AUDIT.md                   Scope, gaps and benchmark observations
```

Edit the token source, then run `npm run tokens`. Semantic colors reference primitive palette values with `{primitives.forest.700}` syntax. The generator resolves the references for both platforms; missing and circular references fail. Never hand-edit generated files.

The layer order is primitives → semantic roles → HeroUI theme → reusable components → finance compositions → patterns. The mappings in `catalog.ts` document the contract. Upstream compound APIs remain available, rather than being hidden behind a large prop abstraction.

## Native catalog

HeroUI Native officially does not recommend web use. Consequently, the browser workshop uses **HeroUI React 3.2.6**, with the shared semantic theme. It is an interaction and design reference, not a native runtime emulator. The `native/` project uses **real HeroUI Native** and has no HeroUI Pro dependency.

```sh
cd native
npm ci
npm start
```

Open the Expo development URL on an appropriately configured device or simulator. For a development build with native dependencies, use Expo's normal `run:ios` or `run:android` workflow after installing the platform toolchain. No Expo account, EAS project, signing credentials or deployment was configured for this deliverable.

Native catalog components are exported individually from `native/finance.tsx` and `native/chat.tsx`; the catalog exposes all 33 additions. All 39 audited upstream families are re-exported in `native/base.ts`. Inter and Geist Mono are bundled for the browser and loaded through Expo Font in the native catalog. Large balances use Inter; smaller monetary values use Geist Mono.

## Finance contracts

- Store amounts as safe integer minor units. `parseMinor` rejects negative values, exponent notation, unsupported decimal precision and unsafe integers. JPY uses 0 decimal places, USD/GBP/EUR/INR 2, KWD 3.
- Demo quotes subtract an included fixed fee, perform rational arithmetic with `BigInt`, and round once to the receiving currency's minor units. These are illustrative rates, not market data or financial advice.
- Acknowledgement gates confirmation. An entered amount is retained in the resulting demo receipt. No action calls a payment service.
- Mask balances and payment-card numbers explicitly. The sample card number is test data.
- Status uses words and supporting icons, never color alone. Charts include text data. Key normal-text pairs meet WCAG AA in both themes. Shared touch minimum is 48 points/dp; numeric keypad targets are 64 points.

## Validation

`npm test` checks currency precision, formatting, integer FX rounding, safe input handling, token alias resolution, shared theme keys, contrast and scale constraints. `npm run build` typechecks and builds the browser catalog.

Native checks: `cd native && npm run typecheck`, `npm run bundle:ios`, and `npm run bundle:android`.

Browser QA rendered all 72 component stories and the 6 pattern pages. Interactions checked include currency selection, balance masking, card freeze/reveal, transfer acknowledgement, amount-preserving confirmation, theme switching and responsive layout. Reference images were downloaded from the Mobbin-provided high-resolution URLs and retained locally with canonical citations.

**Verification boundary:** native TypeScript and platform bundling pass; iOS/Android device rendering, assistive-technology behavior, keyboard/gesture behavior and platform-native date picker behavior remain unverified because this machine has no configured simulator. Run the native catalog before adopting components in production.

The native Expo toolchain currently reports transitive dependency advisories for node-forge and zod. npm's suggested Expo downgrade is not an appropriate automatic fix; dependencies were not force-downgraded. These are recorded as a toolchain follow-up, independent of the local UI demonstrations.

## Sources

- [HeroUI Native catalog](https://heroui.com/en/docs/native/components)
- [HeroUI Native theming](https://heroui.com/en/docs/native/getting-started/theming)
- [HeroUI Native installation and web limitation](https://heroui.com/en/docs/native/getting-started/quick-start)
- [HeroUI Native Pro catalog](https://heroui.pro/docs/native/components)
- [Wise home reference on Mobbin](https://mobbin.com/screens/7e0d7d7a-a184-42f0-87dc-6be74cf68a2a)
- [Wise transfer reference on Mobbin](https://mobbin.com/screens/370316cc-c8c1-4555-9d6f-22be23213dae)
- [Revolut transfer reference on Mobbin](https://mobbin.com/screens/b7a4d4f5-b5a7-4f95-a39e-84e7a258996c)

Visual references for this pass: [HextaUI Chat Thread](https://hextaui.com/blocks/chat-thread) and [Razorpay Blade](https://blade.razorpay.com/), plus the three user-provided finance images.
