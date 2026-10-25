# Finance UI

A composable finance design system built around HeroUI Native 1.0.11, with a browser workshop using HeroUI React 3.2.6 and an Expo native catalog.

## Run

```sh
npm ci
npm run dev
```

Open **http://localhost:5188**. The workshop contains 8 foundation pages, 72 component stories and 6 composed patterns, plus the finance audit and Mobbin references. Use light/dark mode, story controls, token mappings, deferred source previews and interaction logs. All displayed financial records and actions are demonstrations.

```sh
cd native
npm ci
npm start
```

The native catalog needs a configured Expo device/simulator. No backend, signing, account creation or deployment is included.

## Use the system

Web: import components/types from `src/index.ts` and import `src/components/styles.css` once. Native: import from `native/components.ts` with the provider/theme/font setup shown in `native/App.tsx`. These entries exclude the workshop and its fixtures.

```tsx
import { BalanceCard } from './src';
import './src/components/styles.css';

<BalanceCard
  balance={{ minor: 1284500, currency: 'USD' }}
  hidden={hidden}
  onHiddenChange={setHidden}
  onTransfer={openTransfer}
  onRequest={openRequest}
  onAdd={openDeposit}
  onConvert={openConversion}
/>
```

`TransferReview` accepts a quote and recipient and emits an immutable reviewed snapshot. Supply that snapshot and the application’s actual transfer status to `Receipt`. Fees, currencies, rates and expiry are explicit; the components never execute payments. `ChatThread` is controlled through messages, draft, status and callbacks, with a result slot for composed financial UI.

The [handoff](HANDOFF.md) explains public contracts, usage boundaries, visual rules and native integration. [FINANCE-AUDIT.md](FINANCE-AUDIT.md) lists coverage and remaining domain gaps. [prompt.md](prompt.md) preserves the supplied project and side-chat prompts.

## Structure

```text
src/index.ts                    Web product entry
src/components/                 Reusable web finance/chat UI and CSS
src/design-system/              Tokens, types and shared financial/chat logic
src/workshop/                   Browser stories, fixtures, shell pages and demo hooks
src/data/catalog.ts             Catalog metadata and benchmark references
native/components.ts            Native product entry
native/finance.tsx, chat.tsx     Native renderers sharing contracts and pure logic
native/workshop/                Native story adapters
scripts/                        Token generation and read-only freshness check
tests/                          Financial, chat, token and import-boundary regressions
```

Tokens flow from primitives → 25 semantic roles → HeroUI themes → components → compositions. Edit `src/design-system/tokens.json`, then run `npm run tokens`. Generated outputs are shared by both platforms. Inter and Geist Mono are bundled. Components retain upstream HeroUI compound APIs; no additional state or component-schema framework is required.

## Validation

```sh
npm run tokens:check
npm test
npm run build
npm --prefix native run typecheck
```

Tests cover safe integer money, explicit quotes and expiry, immutable snapshots, acknowledgement identity, keypad precision, cancellation/retry, token contracts and library/workshop separation. See [VALIDATION.md](VALIDATION.md) for browser interaction evidence and platform limits.

Branches: `visual-refactor` preserves the visual work; `code-scalability` builds on it with the reusable component and workshop separation. Both contain the prompt history.
