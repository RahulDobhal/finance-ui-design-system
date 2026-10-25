# HeroUI Native finance audit

Audited 25 October 2026 against the public native component catalogs and installed `heroui-native@1.0.11` types. Counts here refer to the 39 documented catalog families, not every low-level export, compound part or variant. Mobbin references were inspected visually through its MCP tools.

## Conclusion

HeroUI Native core is a useful foundation for forms, selection, overlays and general layouts. It is not a complete finance domain kit. The additions in this release cover everyday wallets, remittance, transaction history, card controls, spending summaries and identity-status UI. They do not implement real financial services, lending or trading.

## Foundations

The canonical token source has a primitive palette and 25 semantic roles per theme: shared surfaces and foregrounds, actions, focus, status, five chart series and the overlay scrim. Non-color scales include 10 typography roles sharing 5 sizes and 3 weights, 11 spacing steps, 7 radius values, motion duration/easing, opacity, touch targets and layer order. Decorative elevation is disabled; library compatibility aliases do not add independent semantic colors.

Typography uses bundled Inter and Geist Mono: Inter for UI and large balances, Geist Mono for smaller numeric values. A 4-point spacing base and 48-point/dp shared minimum touch target underpin the component mappings. Semantic aliases generate both web variables and native CSS; reusable native additions read spacing, typography and radius directly from the generated TypeScript tokens.

## Existing HeroUI core

| Category | Existing families |
| --- | --- |
| Actions | Button, CloseButton, LinkButton, PressableFeedback |
| Forms and fields | Input, InputGroup, InputOTP, SearchField, TextArea, TextField, ControlField, Label, Description, FieldError |
| Choice and controls | Checkbox, RadioGroup, Switch, Slider, Select, TagGroup |
| Surfaces and content | Card, Surface, Avatar, Chip, ListGroup, Typography, Separator |
| Navigation and disclosure | Accordion, Tabs, ScrollShadow |
| Overlays | BottomSheet, Dialog, Menu, Popover |
| Feedback | Alert, Toast, Skeleton, SkeletonGroup, Spinner |

Upstream APIs are preserved. The browser displays supported HeroUI React counterparts. Some concepts have different browser anatomy: BottomSheet → Modal bottom placement, Dialog → Modal, Menu → Dropdown, ListGroup → composed list, ControlField → Checkbox/field composition, and PressableFeedback → a pressable Button. These adapters validate browser interactions, not native implementation details.

## Missing from core: implemented additions

| Addition | Built from | Finance use case |
| --- | --- | --- |
| MoneyText | Typography + shared integer-money utility | Correct currency precision, signed amounts, private balances |
| CurrencySelector | Select + Label | Explicit currency selection |
| AmountInput | TextField, Input, Label, FieldError, CurrencySelector | Transfer and conversion amount entry |
| BalanceCard | Card, MoneyText, Button | Account overview and privacy toggle |
| TransactionRow | Avatar, typography, signed money, pressable row | Received, spent and pending activity |
| TransactionList | TransactionRow, Separator, EmptyState | Repeated activity and empty-state handling |
| RecipientRow | Avatar, pressable row, typography | Recipient identity and account currency |
| AccountDetails | Card, typography, clipboard action | Bank details and copy feedback |
| FeeBreakdown | MoneyText, Separator, typography | Included fees and exact total deduction |
| ExchangeQuote | Card, MoneyText, shared quote function | Send/receive amounts, currency and rate disclosure |
| TransferTimeline | Typography, status, step structure | Created, processing, received or needs-attention states |
| PaymentCard | Card, Button, Switch | Mask/reveal test details and freeze controls |
| SpendingSummary | Card, LineChart, SegmentedControl, MoneyText | Period comparison and spending trends |
| LimitMeter | Slider, MoneyText | Used and remaining transfer limits |
| VerificationStatus | Card, status text, Button | Not verified, in review, verified, needs attention |
| TransferReview | RecipientRow, ExchangeQuote, FeeBreakdown, ConfirmationAction | Explicit review before demo confirmation |
| EmptyState | Surface, typography, Button | Missing activity with a useful next action |
| Receipt | Card, MoneyText, TransferTimeline | Completed/pending transfer confirmation |

| Supporting primitive | Purpose | Core/Pro distinction |
| --- | --- | --- |
| NumericKeypad | Currency-aware digits, decimal point and backspace | Not supplied by the audited core |
| DatePicker | Scheduled transfer date | Pro has date/calendar families; this release uses platform-native/HTML date adapters |
| ProgressMeter | Labeled percentage and accessible progress state | A purpose-built simple extension, not a Pro progress dependency |
| LineChart | Trend line and text data alternative | Native chart families exist in Pro; this implementation uses SVG |
| SegmentedControl | Single selection between periods | Composed from core buttons; Pro also has Segment |
| Stepper | Bounded numeric interval | Number controls exist in Pro; this uses core Button/Input patterns |
| DataTable | Readable compact transaction records | Table exists in Pro; this implements a small records table |
| ConfirmationAction | Acknowledgement plus gated action | Finance interaction composition rather than an upstream component |

All 26 additions have browser stories and native implementations. Native and browser presentation differ where platform conventions warrant it. For example, the web Receipt story downloads a text file through an application callback; the native story displays the confirmation without a download action.

## Benchmark observations and applications

**[Wise account overview](https://mobbin.com/screens/7e0d7d7a-a184-42f0-87dc-6be74cf68a2a):** the inspected screen places Send/Add money/Request near the top, uses currency/account surfaces and repeatable transaction rows, and limits bottom navigation. Applied through BalanceCard, quick actions and TransactionRow/List. We did not reproduce Wise's brand or promotional illustrations.

**[Wise transfer quote](https://mobbin.com/screens/370316cc-c8c1-4555-9d6f-22be23213dae):** send and receive amounts remain explicit; currency controls sit close to values; funding method, arrival and total fees appear before progression. Applied through AmountInput, CurrencySelector, ExchangeQuote, FeeBreakdown and TransferReview. The workshop supplies illustrative fixed rates; reusable components require an explicit quote from the application.

**[Revolut transfer tracking](https://mobbin.com/screens/b7a4d4f5-b5a7-4f95-a39e-84e7a258996c):** a pending transfer has sequential progress, followed by reference and bank details. Applied through TransferTimeline, AccountDetails and Receipt, with text distinguishing pending, completed and failed states.

## Composed UI patterns

1. Account overview: balance privacy, quick actions and recent activity.
2. Send money: enter amount → inspect illustrative quote → review recipient/fees → acknowledge → demo receipt.
3. Transaction details: transfer progress plus bank details.
4. Card controls: masked test card, reveal and local freeze state.
5. Identity verification: status and a local submit/retry action; no upload or KYC provider.

## Remaining scope

- Investing: holdings, order tickets, market-data charts, candlesticks and order books.
- Lending: APR and cost disclosures, loan schedules, repayment plans and collections states.
- Deeper budgeting: category donut/bar visualizations, category editing and budget drill-down.
- Complex scheduling: recurring-payment management, holidays and multi-time-zone cutoff rules.
- Bank linking, live exchange rates, real payments, card issuing, KYC/document capture, authentication and biometric services require integrations. A UI status component is not an implementation of those services.
- Production data tables may need sorting, filtering, pagination, export permissions and virtualization.
- Locale/RTL, dynamic type, screen-reader navigation, safe areas, gesture conflicts and keyboard/date-picker behavior require testing on iOS and Android devices. The browser adapter cannot establish native parity.

The audit and corresponding stories are also available in the workshop under **Finance coverage** and **Mobbin benchmarks**.

## October 25 restyle and chat extension

The 0.2 revision adds 7 chat components: ThinkingIndicator, ThinkingPanel, ResponseFeedback, AgentResponse, UserQuery, PromptInput and ChatThread. Every addition has a browser story and native implementation. A sixth pattern composes the chat thread. Total inventory: 72 component stories and 6 patterns.

Pass 1 uses green primary buttons, contrasting secondary buttons, neutral filled surfaces and sharp corners. Default buttons use a 20 px icon/label line height with 14/21 px icon/text-side padding; fields use 12/18 px. The balance area is quiet while the action area carries the stronger green. Chat follows the supplied references, with compact progress disclosures and embedded results.

Pass 2 separates reusable components from workshop stories and fixtures. Small explicit props replace workshop-wide dependencies. A shared quote feeds fees, review and confirmation; an immutable snapshot feeds receipts. Transaction rows carry their own currency and stable IDs. Controlled chat exposes application callbacks and result composition; shared pure logic handles quote validation, keypad editing and chat state. The workshop shell is split by responsibility and loads source excerpts on demand. No new framework or dependency was added.

See [HANDOFF.md](HANDOFF.md) for public contracts and integration limits, and [VALIDATION.md](VALIDATION.md) for the 38-test suite, browser checks and native export evidence.
