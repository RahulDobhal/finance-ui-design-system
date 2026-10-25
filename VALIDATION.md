# Validation — visual refinement and code scalability

Verified 25 October 2026 against `code-scalability`, which builds on the separately pushed `visual-refactor` branch.

| Check | Result |
| --- | --- |
| Generated token freshness (`tokens:check`) | Pass; read-only check |
| Automated tests | **38 passed, 0 failed** |
| Browser strict TypeScript and production build | Pass; full-workshop chunk-size warning remains |
| Native TypeScript | Pass |
| Expo iOS export | Pass; 2,038 modules, Hermes bundle, five bundled fonts |
| Expo Android export | Pass; 2,046 modules, Hermes bundle, five bundled fonts |
| Desktop render and horizontal-overflow checks | **86/86**: 72 stories, 8 foundations, 6 patterns |
| Narrow light-theme story checks | **72/72** at 390 CSS px |
| Narrow dark-theme story checks | **72/72** at 390 CSS px |
| Public semantic color contract | **25 roles per theme** |
| Native device runtime, assistive technology and geometry parity | Not verified |

## Visual and interaction checks

- Inspected representative light and dark layouts, including filled fields, sharper menus, radio/checkbox labels, overlays, finance cards and chat. The full sweeps verify rendering and horizontal overflow; they do not establish every state of every component.
- Accordion label and icon frames measure 20 px. Button icon frames match the 20 px label line height; default leading-icon buttons use 14 px icon/vertical and 21 px text-side padding. Embedded currency selection measures 88 × 40 px. Menu item corners measure 4 px.
- Radio labels align with their controls and select correctly. Unchecked confirmation boxes use a light surface and muted outline. Preview surfaces have a subtle green-gray tint.
- Transfer confirmation is disabled until acknowledgement. Changing the amount clears it; returning to the original amount does not restore the earlier acknowledgement. After confirmation, changing amount and currency leaves the receipt's original reviewed money unchanged.
- Dialog and bottom-sheet focus enter their overlay; Escape closes them and returns focus to the trigger. Mobile navigation focuses search when opened; Escape closes it and restores the navigation-toggle focus.
- Chat supports send, cancellation and retry while preserving a next-turn draft. Stop does not submit that draft. Retry restores composer focus; completion does not steal focus from another control. The response omits redundant assistant identity and reaction/copy controls. Embedded result disclosures remain interactive.
- Usage example opens the actual native component excerpt on demand, without requiring the source modules in the initial workshop bundle.
- Temporary browser viewport overrides were reset after checks.

## Automated regression coverage

Tests exercise safe integer money and currency precision; explicit quote arithmetic, expiry and recipient validation; immutable reviewed snapshots and acknowledgement identity; keypad editing; progress, chart and stepper validation; chat cancellation, stale events, retry and draft preservation; form submit/Stop rendering; token contracts, aliases, contrast and padding; registry references; and product import boundaries.

Token check mode is tested against stale and missing output files and must leave both bytes and modification times unchanged. The import-boundary check walks public entries and rejects workshop fixtures and the opposite platform renderer.

## Build observations

The web entry is approximately 737 kB before gzip (226 kB gzip). Usage and native source excerpts are separate deferred chunks. The full workshop still exceeds Vite's default chunk warning threshold. No dependencies were added for the scalability refactor.

Native exports were run with Node 24.14.0. They validate Metro resolution and compilation, not device behavior. The shared React dependency resolves to the native installation while nested Expo dependencies retain normal resolution.

## Review artifacts

- [Account overview](review/code-scalability-account.jpg)
- [Chat conversation](review/code-scalability-chat.jpg)
- [Browser render checks](review/code-scalability-checks.json)

## Limits and integration work

No simulator/device session is configured. VoiceOver/TalkBack, large text, RTL/localization, native keyboard obstruction, safe areas, gestures, date-picker behavior and actual native hit regions still need iOS and Android device testing. Browser previews use HeroUI React adapters rather than the HeroUI Native runtime.

The UI is prepared for application-owned data and callbacks. Financial authorization, payment execution, live rates, authentication and KYC are not implemented. Quote confirmation emits reviewed data, not proof of payment; the application supplies the receipt status. Chat transport remains application-owned; only the workshop simulates responses.

Dependency advisories noted before these passes were not resolved by this refactor. No deployment or service/account configuration was performed.
