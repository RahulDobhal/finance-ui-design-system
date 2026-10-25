# Pass 1 validation

Verified 25 October 2026 against the refined local source. This is the visual-refinement pass; the separate code-quality/scalability review is pending.

| Check | Result |
| --- | --- |
| Browser strict TypeScript and production build | Pass; catalog chunk-size warning remains |
| Automated tests | **21 passed, 0 failed** |
| Native TypeScript | Pass |
| Expo iOS export | Pass; 2,030 modules, Hermes bundle, five bundled font assets |
| Expo Android export | Pass; 2,038 modules, Hermes bundle, five bundled font assets |
| Desktop component render/overflow checks | **72/72** |
| Mobile component render/overflow checks | **72/72** at 390 CSS px, in light and dark themes |
| Foundation pages | **8/8** render |
| Composed patterns | **6/6** render |
| Public semantic color contract | **25 roles per theme** |
| Native device runtime and geometry parity | Not verified |

## Visual and interaction evidence

- Inspected buttons, filled fields/selects, search, accordions, checkbox, sheet/dialog layout, balance/payment/spending cards, calculator, segmented controls, timeline, table and chat in the browser. Checked representative light and dark layouts; the recorded 72-story sweeps check rendering and horizontal overflow, not every state of every component.
- The balance overview uses a quiet surface with a stronger green Transfer/Request/Add/Convert area. Avatars, tabs, menus and close targets follow the sharp corner contract.
- Button padding follows 12 px vertical/icon-side and 18 px text-side at the default size, with 24 px icons. Inter and Geist Mono load from bundled assets. Focus outlines and intentional scroll shadows remain.
- Confirmation stays disabled until its checkbox is selected, then opens the demo receipt. Labels sit beside the checkbox.
- The shared HeroUI Slider accepts keyboard ArrowRight: the limit changed from 65 to 66, with the remaining amount updating to $3,400.
- Search feedback updates while typing. Month selection updates spending to $5,980.
- Chat starter prompts populate the composer; sending creates a user message and progresses to a response. Stop and retry remain available. Like followed by dislike leaves only dislike selected; copy changes the action to “Response copied.”
- Expanded thinking shows completed/current stages with aligned statuses. User messages, open assistant content and the filled composer were inspected at narrow and desktop widths.
- Temporary browser viewport overrides were reset after testing.

## Automated coverage

Tests cover currency precision and safe-integer boundaries; integer quote arithmetic; equivalent theme contracts; key text contrast; token aliases and cycles; five type sizes and three weights; radius/padding/touch constraints; registered exports, stories and composition references; absence of raw hex colors/independent pixel font sizes in handwritten styles; and chat submission, cancellation, retry, stale completion and immutable-state handling.

## Review artifacts

- [Account overview](review/pass1-account.jpg)
- [Chat conversation](review/pass1-chat.jpg)
- [Browser render checks](review/pass1-browser-checks.json)

## Limits

No simulator/device session is configured. VoiceOver/TalkBack, largest font settings, native keyboard obstruction, gestures, date-picker behavior and actual native hit regions still need iOS and Android device testing. The browser uses HeroUI React adapters, not the HeroUI Native runtime. Bundling does not establish native visual parity. Chat and financial actions are local demonstrations.

Vite reports a chunk-size warning for the full workshop. Previously noted Expo dependency advisories were not resolved by this visual pass. No deployment, account setup or publication was performed.
