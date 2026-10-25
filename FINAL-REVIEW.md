# Final architecture review and product benchmark

Reviewed 25 October 2026. Scope: the reusable web design system, the workshop, and the new React + TypeScript product screens. Native implementations are preserved without extension.

**Assessment:** this is a sound source-based foundation for a focused finance application. The current architecture supports composing new screens without putting application state into library components. It is not yet a packaged, independently released general-purpose library with the testing breadth of the projects below. No numeric “scalability score” is assigned: composition and verified boundaries are stronger evidence than component counts.

## Public-library benchmark

| Reference | Relevant principle | Our result |
| --- | --- | --- |
| [Radix composition](https://www.radix-ui.com/primitives/docs/guides/composition) | Preserve element semantics, event handling and refs when composing primitives. | HeroUI compound primitives are consumed directly. No generic wrapper/factory interferes with their behavior. Financial compositions accept explicit data and callbacks; result slots compose finance UI into chat. |
| [React Aria quality](https://react-aria.adobe.com/quality) | Keyboard/pointer behavior, focus, labeling, announcements, internationalization and broad assistive-technology testing all matter. | Upstream interaction primitives remain intact. Checked field labels/errors, modal focus, acknowledgement, navigation, and one chat announcement channel. The browser checks do not establish full screen-reader or locale coverage. |
| [Base UI accessibility](https://base-ui.com/react/overview/accessibility) | Library behavior must be complemented with application labels, visible focus and accessible visual design. | Explicit product labels, semantic navigation, keyboard skip link and focus recovery are part of the screen layer. Focus rings remain visible. |
| [shadcn/ui principles](https://ui.shadcn.com/docs) | Readable source, predictable composition and ownership of the top layer. | Components stay ordinary React/TypeScript. Stories, product fixtures, demo transport and screen state are separate. No schema engine, state framework or dependencies were added. |

These are comparisons of documented engineering practices, not a claim of feature or quality parity.

## Findings addressed in this pass

1. **Product entry isolation.** The catalog and product app now load through separate lazy entries. Workshop routes and source previews are not prerequisites for opening the product. Shared component CSS is imported once; a duplicate full stylesheet import discovered during the build review was removed.
2. **Import boundaries.** The existing graph test now rejects product-example imports as well as workshop/catalog data from reusable web/native entries. Product fixtures cannot silently become library dependencies.
3. **Application validation.** The web amount field accepts a specific error message. Over-balance and fee validation now set `aria-invalid` and link the actual field error, rather than reporting an unrelated decimal-precision message.
4. **Chat composition.** Seeded conversations open at the beginning of their content. Explicit sends/retries resume following the conversation. Product chat has one bounded message scroller and a reachable composer that does not cover result controls. Optional empty titles avoid duplicate assistant headings.
5. **Deterministic examples.** Tests catch the spending prompt returning the wrong result type, reconcile chart/category totals, verify combined search/filters, and check transfer limits. Monetary records retain integer minor units. The card spending meter is derived from the same transaction fixture.
6. **Transfer handoff.** The screen moves through details, review and a retained immutable receipt. Editing clears acknowledgement. Step changes explicitly move focus to the start of the new stage. All confirmation/download content states that this is a simulation.
7. **Verification on future changes.** A small GitHub Actions workflow runs clean install, token freshness, tests and the web production build. Its configuration is included; local results are recorded separately from hosted CI execution.
8. **Overlay composition.** Controlled product modals use the standalone HeroUI backdrop API rather than a trigger root without a trigger. This preserves focus handling and removes the PressResponder warning.
9. **Visual consistency.** Preview/app canvas now mixes existing surface/background roles into a very light neutral gray, removing the earlier dark-green mix. Existing typography, sharp radii, control padding and component colors remain.

## Mobile product screens

| Screen | Components reused | Working behavior |
| --- | --- | --- |
| Assistant | ChatThread, BalanceCard, AccountDetails, AmountInput, ExchangeQuote, MoneyText, Card, Modal | Structured account response; balance privacy; transfer navigation; receive/add account details and copy; conversion preview; follow-up prompts, stop and retry. |
| Spending | ChatThread, SpendingSummary, SegmentedControl, LineChart, TransactionList, Modal | Week/month totals and chart; category drill-down; chart text alternative; conversational follow-up. |
| Transfer | ChatThread, AmountInput, RecipientRow, ExchangeQuote, TransferReview, Receipt | Recipient selection, fee/balance validation, review/edit, acknowledgement, simulated confirmation and receipt download. |
| Activity | SearchField, SegmentedControl, TransactionList, EmptyState, Modal | Search plus income/outgoing/pending filters, resettable empty state, transaction details. |
| Cards | PaymentCard, LimitMeter, TransactionList | Masked card overview, computed monthly spending and recent payments. Reveal/freeze remain available in the library workshop; the final product screen intentionally omits them. |

`src/product/` owns fixtures, screen calculations, local response simulation and view state. Reusable components remain in `src/components/`, with shared models in `src/design-system/`. Up to five visited screens remain mounted to retain local drafts, filters and review state; nothing is persisted as financial state or sent to a server. The preview responder uses deterministic keyword routing, not an AI/backend service.

## Mobbin UX references

- [Cleo AI conversation](https://mobbin.com/screens/73d8bc4c-bc92-4520-9633-40e0f6f4bec5): a contextual financial summary, suggested replies and a persistent composer. Applied to the seeded check-in and direct task suggestions, while preserving our typography and shapes.
- [Origin assistant entry](https://mobbin.com/screens/c759f1aa-5c8a-46d2-a265-f2260a873275): question/task discovery alongside the composer. Applied to discoverable spending/card routes and structured follow-up responses.
- [Lloyds spending assistant](https://mobbin.com/screens/0b513db0-3b95-44c1-aa50-6ebd386b1c8a): a focused spending question, visible preparation status and anchored input. Applied to bounded conversations with operation status and cancellation.
- [Wise send-money flow](https://mobbin.com/flows/fa543ea2-2ac9-4172-ba87-239731b53716): the inspected amount screen makes source balance, exchange rate and received amount explicit before proceeding. Applied through the existing quote and transfer-review compositions.

References were examined through Mobbin MCP. No third-party screenshots or brand assets are bundled into the product.

## Remaining release work

- **Before distributing a public npm package:** define package exports, emitted type declarations, peer dependencies, CSS import requirements and a release/versioning policy. The repository currently ships a runnable application and reusable source entries.
- **Before claiming broad accessibility support:** add a repeatable browser interaction suite in CI and test VoiceOver/NVDA/TalkBack, zoom, large text and RTL. The current tests and manual checks cover specific behavior, not certification.
- **Before connecting real finance/AI services:** replace fixtures, rates and local responses; supply authenticated operations, server validation, idempotency, transfer state and actual failure handling. A UI snapshot is not a payment authorization record or proof of execution.
- **Performance:** the product-specific entry is small, but shared HeroUI code and the full component stylesheet still contribute to first load. Choose narrower style/component distribution only after measuring a real consuming application's budget. A catalog's chunk graph is not a consumer-library bundle benchmark.
- **Platform:** native source is unchanged in this pass. Existing native export results remain historical evidence; native runtime/assistive-technology verification is still outstanding.

See [VALIDATION.md](VALIDATION.md) for the checks actually performed, and [HANDOFF.md](HANDOFF.md) for the component contracts.
