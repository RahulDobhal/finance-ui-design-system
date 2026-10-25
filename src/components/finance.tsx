import { useState, useId } from "react";
import {
  Button,
  Card,
  Input,
  Label,
  TextField,
  Select,
  ListBox,
  Avatar,
  Switch,
  Checkbox,
  Chip,
  Slider,
} from "@heroui/react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Check,
  ChevronRight,
  LockKeyhole,
  Snowflake,
  CreditCard,
  CircleCheck,
  Clock3,
  TriangleAlert,
  ArrowRight,
  X,
  Delete,
  ShieldCheck,
  Wallet,
  Download,
} from "lucide-react";
import {
  currencyDigits,
  formatMoney,
  parseMinor,
} from "../design-system/money.mjs";
import {
  boundedProgress,
  assertStepper,
  chartGeometry,
  confirmTransfer,
  limitProgress,
  nextAmount,
  reviewIdentity,
} from "../design-system/finance-model.mjs";
import { useQuoteProblem } from "../design-system/useQuoteProblem";
import type {
  AccountDetailsProps,
  AmountInputProps,
  BalanceCardProps,
  ChartPoint,
  ConfirmationActionProps,
  CurrencySelectorProps,
  DatePickerProps,
  LimitMeterProps,
  PaymentCardProps,
  ReceiptProps,
  Recipient,
  SegmentedControlProps,
  SpendingSummaryProps,
  StepperProps,
  TimelineStep,
  Transaction,
  TransferQuote,
  TransferReviewProps,
  VerificationState,
} from "../design-system/finance-types";

export function MoneyText({
  minor,
  currency,
  locale = "en-US",
  signed = false,
  hidden = false,
  className = "",
}: {
  minor: number;
  currency: string;
  locale?: string;
  signed?: boolean;
  hidden?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`money ${signed && minor > 0 ? "positive" : ""} ${className}`}
      aria-label={hidden ? "Balance hidden" : undefined}
    >
      {hidden ? "••••••" : formatMoney(minor, currency, locale, signed)}
    </span>
  );
}

export function CurrencySelector({
  value,
  onChange,
  currencies,
  label = "Currency",
  disabled = false,
  size = "md",
}: CurrencySelectorProps) {
  return (
    <Select
      aria-label={label}
      value={value}
      onChange={(v) => v && onChange(String(v))}
      isDisabled={disabled}
      className={`currency-select currency-select--${size}`}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover
        className={size === "sm" ? "currency-menu--sm" : undefined}
      >
        <ListBox>
          {currencies.map((c) => (
            <ListBox.Item key={c} id={c} textValue={c}>
              {c}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export function AmountInput({
  value,
  onChange,
  currency,
  onCurrency,
  currencies,
  availableBalance,
  disabled = false,
  error = false,
  errorMessage,
  label = "You send",
}: AmountInputProps & { errorMessage?: string }) {
  const id = useId();
  const invalid =
    error || (value !== "" && parseMinor(value, currency) === null);
  const help = invalid || availableBalance;
  return (
    <div className={`amount-box ${invalid ? "invalid" : ""}`}>
      <div className="row between">
        <label htmlFor={id} className="muted small">
          {label}
        </label>
        <CurrencySelector
          size="sm"
          value={currency}
          onChange={onCurrency}
          currencies={currencies}
          disabled={disabled}
        />
      </div>
      <input
        id={id}
        inputMode={currencyDigits(currency) === 0 ? "numeric" : "decimal"}
        autoComplete="off"
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={help ? id + "-help" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="amount-input"
      />
      {help && (
        <div id={id + "-help"} className="small muted">
          {invalid ? (
            <span className="danger">
              {errorMessage ||
                `Enter an amount with up to ${currencyDigits(currency)} decimal places.`}
            </span>
          ) : (
            availableBalance && (
              <>
                Available balance{" "}
                <b>
                  {formatMoney(
                    availableBalance.minor,
                    availableBalance.currency,
                  )}
                </b>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function BalanceCard({
  balance,
  hidden,
  onHiddenChange,
  onTransfer,
  onRequest,
  onAdd,
  onConvert,
  description,
}: BalanceCardProps) {
  return (
    <Card className="balance-card">
      <div className="balance-overview">
        <div className="row between">
          <span className="balance-label">Total balance</span>
          <Button
            type="button"
            variant="ghost"
            isIconOnly
            aria-label={hidden ? "Show balance" : "Hide balance"}
            onPress={() => onHiddenChange(!hidden)}
          >
            {hidden ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        <MoneyText {...balance} hidden={hidden} className="balance-amount" />
        {description && <span className="small muted">{description}</span>}
      </div>
      <div className="balance-actions" aria-label="Balance actions">
        <Button
          type="button"
          variant="ghost"
          onPress={onTransfer}
          isDisabled={!onTransfer}
        >
          <ArrowUpRight />
          Transfer
        </Button>
        <Button
          type="button"
          variant="ghost"
          onPress={onRequest}
          isDisabled={!onRequest}
        >
          <ArrowDownLeft />
          Request
        </Button>
        <Button
          type="button"
          variant="ghost"
          onPress={onAdd}
          isDisabled={!onAdd}
        >
          <Plus />
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          onPress={onConvert}
          isDisabled={!onConvert}
        >
          <ArrowLeftRight />
          Convert
        </Button>
      </div>
    </Card>
  );
}

export function TransactionRow({
  item,
  onPress,
}: {
  item: Transaction;
  onPress?: (id: string) => void;
}) {
  const content = (
    <>
      <Avatar size="sm">
        <Avatar.Fallback>
          {item.initials ||
            item.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
        </Avatar.Fallback>
      </Avatar>
      <span className="row-copy">
        <strong>{item.name}</strong>
        <span>{item.detail}</span>
      </span>
      <span className="align-right">
        <MoneyText {...item.amount} signed />
        {item.status !== "completed" && (
          <span
            className={`status-text ${item.status === "failed" ? "danger" : "warning"}`}
          >
            {item.status === "failed" ? "Failed" : "Pending"}
          </span>
        )}
      </span>
      {onPress && <ChevronRight className="muted" aria-hidden="true" />}
    </>
  );
  return onPress ? (
    <button
      type="button"
      className="transaction-row"
      onClick={() => onPress(item.id)}
    >
      {content}
    </button>
  ) : (
    <div className="transaction-row">{content}</div>
  );
}

export function TransactionList({
  items,
  onItemPress,
  onEmptyAction,
}: {
  items: readonly Transaction[];
  onItemPress?: (id: string) => void;
  onEmptyAction?: () => void;
}) {
  return items.length ? (
    <div>
      {items.map((item) => (
        <TransactionRow key={item.id} item={item} onPress={onItemPress} />
      ))}
    </div>
  ) : (
    <EmptyState onAction={onEmptyAction} />
  );
}

export function RecipientRow({
  recipient,
  selected = false,
  onPress,
}: {
  recipient: Recipient;
  selected?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Avatar>
        <Avatar.Fallback>
          {recipient.initials ||
            recipient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
        </Avatar.Fallback>
      </Avatar>
      <span className="row-copy">
        <strong>{recipient.name}</strong>
        <span>
          {recipient.accountCurrency} account · •• {recipient.accountLast4}
        </span>
      </span>
      {selected ? (
        <CircleCheck aria-hidden="true" />
      ) : onPress ? (
        <ChevronRight aria-hidden="true" />
      ) : null}
    </>
  );
  return onPress ? (
    <button
      type="button"
      className={`recipient-row ${selected ? "selected" : ""}`}
      aria-pressed={selected}
      onClick={onPress}
    >
      {content}
    </button>
  ) : (
    <div className={`recipient-row ${selected ? "selected" : ""}`}>
      {content}
    </div>
  );
}

export function AccountDetails({ account, onCopy }: AccountDetailsProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function copy() {
    try {
      await onCopy?.(account.iban);
      setCopiedValue(account.iban);
      setError("");
    } catch {
      setError("Unable to copy. Select the displayed IBAN to copy.");
    }
  }
  return (
    <Card className="bank-details">
      <div className="row between">
        <h3>Account details</h3>
        {onCopy && (
          <Button
            type="button"
            variant="ghost"
            isIconOnly
            aria-label={
              copiedValue === account.iban ? "IBAN copied" : "Copy IBAN"
            }
            onPress={copy}
          >
            {copiedValue === account.iban ? <Check /> : <Copy />}
          </Button>
        )}
      </div>
      <dl>
        <div>
          <dt>Account holder</dt>
          <dd>{account.holder}</dd>
        </div>
        <div>
          <dt>IBAN</dt>
          <dd className="iban">{account.iban}</dd>
        </div>
        <div>
          <dt>BIC / SWIFT</dt>
          <dd>{account.bic}</dd>
        </div>
      </dl>
      {error && (
        <p role="alert" className="danger small">
          {error}
        </p>
      )}
    </Card>
  );
}

export function FeeBreakdown({ quote }: { quote: TransferQuote }) {
  return (
    <div className="fee-breakdown">
      <div>
        <span>Amount converted</span>
        <MoneyText
          minor={Math.max(0, quote.send.minor - quote.fee.minor)}
          currency={quote.send.currency}
        />
      </div>
      <div>
        <span>Fee included</span>
        <MoneyText {...quote.fee} />
      </div>
      <div className="fee-total">
        <strong>Total deducted</strong>
        <MoneyText {...quote.send} />
      </div>
    </div>
  );
}

export function ExchangeQuote({ quote }: { quote: TransferQuote }) {
  const problem = useQuoteProblem(quote);
  return (
    <Card className="quote-card">
      <div className="row between">
        <span className="small muted">Recipient gets</span>
        <span className="pill">{quote.receive.currency}</span>
      </div>
      <MoneyText {...quote.receive} className="quote-amount" />
      <div className="row small muted">
        <ArrowLeftRight />
        {quote.rate.numerator / quote.rate.denominator} {quote.receive.currency}{" "}
        per {quote.send.currency}
      </div>
      <div className="rule" />
      <div className="row between small">
        <span>Fee included in send amount</span>
        <MoneyText {...quote.fee} />
      </div>
      {problem && <p className="danger small">{problem}</p>}
    </Card>
  );
}

export function TransferTimeline({
  steps,
}: {
  steps: readonly TimelineStep[];
}) {
  return (
    <ol className="transfer-timeline">
      {steps.map((step) => (
        <li
          key={step.id}
          className={
            step.status === "completed"
              ? "done"
              : step.status === "current" || step.status === "failed"
                ? "current"
                : ""
          }
          aria-current={step.status === "current" ? "step" : undefined}
        >
          <span className="timeline-node" aria-hidden="true">
            {step.status === "completed" ? (
              <Check />
            ) : step.status === "failed" ? (
              <X />
            ) : (
              <span />
            )}
          </span>
          <div>
            <strong>{step.label}</strong>
            <span className="sr-only"> {step.status}</span>
            <p>{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function PaymentCard(props: PaymentCardProps) {
  return <PaymentCardContent key={JSON.stringify(props.card)} {...props} />;
}
function PaymentCardContent({
  card,
  frozen,
  onFrozenChange,
  disabled = false,
}: PaymentCardProps) {
  const [reveal, setReveal] = useState(false);
  return (
    <div className="payment-card-story stack">
      <div className={`payment-card ${frozen ? "frozen" : ""}`}>
        <div className="row between">
          <span className="card-brand">{card.brand}</span>
          {frozen ? <Snowflake /> : <CreditCard />}
        </div>
        <div className="card-number">
          {reveal && card.number ? card.number : card.maskedNumber}
        </div>
        <div className="row between card-details">
          <div>
            <span className="micro">Cardholder</span>
            <strong>{card.cardholder}</strong>
          </div>
          <div>
            <span className="micro">Valid thru</span>
            <strong>{card.expiry}</strong>
          </div>
        </div>
        <span className="card-status">
          {frozen ? "Frozen" : "Active"}
          {card.description && ` · ${card.description}`}
        </span>
      </div>
      {onFrozenChange && (
        <div className="row between">
          <span className="small">Freeze card</span>
          <Toggle
            label="Freeze card"
            selected={frozen}
            onChange={onFrozenChange}
            disabled={disabled}
          />
        </div>
      )}
      {card.number && (
        <Button
          type="button"
          variant="secondary"
          isDisabled={disabled}
          onPress={() => setReveal(!reveal)}
        >
          {reveal ? <EyeOff /> : <Eye />}
          {reveal ? "Hide" : "Reveal"} number
        </Button>
      )}
    </div>
  );
}

export function LineChart({
  points,
  label = "Trend",
}: {
  points: readonly ChartPoint[];
  label?: string;
}) {
  const coords = chartGeometry(points);
  const summary = points.map((p) => `${p.label}: ${p.value}`).join(", ");
  return (
    <div className="chart">
      <svg
        viewBox="0 0 310 150"
        role="img"
        aria-label={`${label}. ${summary || "No data"}`}
      >
        <path
          d="M8 40H302 M8 85H302 M8 130H302"
          stroke="var(--surface-tertiary)"
          fill="none"
        />
        <polyline
          points={coords.map((p) => `${p.x},${p.y}`).join(" ")}
          stroke="var(--chart-1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--chart-1)" />
        ))}
      </svg>
      <div className="row between micro muted">
        {points.map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
      <details className="chart-data micro">
        <summary>View chart data</summary>
        {summary || "No data"}
      </details>
    </div>
  );
}

export function SegmentedControl({
  value,
  onChange,
  options,
  label = "View selection",
  disabled = false,
}: SegmentedControlProps) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <Button
          type="button"
          key={o}
          variant="ghost"
          aria-pressed={value === o}
          isDisabled={disabled}
          className={value === o ? "active" : ""}
          onPress={() => onChange(o)}
        >
          {o}
        </Button>
      ))}
    </div>
  );
}

export function SpendingSummary({
  amount,
  period,
  onPeriodChange,
  periods,
  points,
  description,
}: SpendingSummaryProps) {
  return (
    <Card className="spending-card">
      <div className="spending-heading">
        <h3>Spending</h3>
        <SegmentedControl
          value={period}
          onChange={onPeriodChange}
          options={periods}
          label="Spending period"
        />
      </div>
      <MoneyText {...amount} className="title-number" />
      {description && <span className="small muted">{description}</span>}
      <LineChart points={points} label={`${period} spending`} />
    </Card>
  );
}

export function ProgressMeter({
  value,
  label = "Progress",
}: {
  value: number | null;
  label?: string;
}) {
  const bounded = boundedProgress(value);
  return (
    <div className="stack-sm">
      <div className="row between small">
        <span>{label}</span>
        <strong>
          {bounded === null ? "In progress" : `${Math.round(bounded)}%`}
        </strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={bounded ?? undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={bounded === null ? "In progress" : undefined}
      >
        <span style={{ width: `${bounded ?? 0}%` }} />
      </div>
    </div>
  );
}

export function LimitMeter({
  used,
  limit,
  onUsedChange,
  label = "Monthly transfer limit",
  step = 1,
}: LimitMeterProps) {
  const progress = limitProgress(used, limit);
  return (
    <Card className="stack">
      <h3>{label}</h3>
      <div className="row">
        <MoneyText {...used} />
        <span className="muted small">
          of {formatMoney(limit.minor, limit.currency)}
        </span>
      </div>
      <ProgressMeter value={progress} label={label} />
      <p className="small muted">
        {formatMoney(Math.max(0, limit.minor - used.minor), limit.currency)}{" "}
        remaining
      </p>
      {onUsedChange && (
        <Slider
          aria-label="Adjust used limit"
          value={used.minor}
          onChange={(v) => onUsedChange(Number(v))}
          minValue={0}
          maxValue={limit.minor}
          step={step}
          className="full"
        >
          <Label>Adjust used limit</Label>
          <Slider.Output>
            {formatMoney(used.minor, used.currency)}
          </Slider.Output>
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      )}
    </Card>
  );
}

export function VerificationStatus({
  status,
  onAction,
  description,
}: {
  status: VerificationState;
  onAction?: () => void;
  description?: string;
}) {
  const done = status === "verified",
    error = status === "failed",
    pending = status === "pending";
  return (
    <Card className="verification">
      <span className="round-icon">
        {done ? <ShieldCheck /> : error ? <TriangleAlert /> : <LockKeyhole />}
      </span>
      <h3>
        {done
          ? "Identity verified"
          : error
            ? "We couldn’t verify your details"
            : pending
              ? "Verification submitted"
              : "Verify your identity"}
      </h3>
      {description && <p className="muted small">{description}</p>}
      <Chip size="sm" color={done ? "success" : error ? "danger" : "warning"}>
        {done
          ? "Verified"
          : error
            ? "Action needed"
            : pending
              ? "In review"
              : "Not verified"}
      </Chip>
      {!done && !pending && onAction && (
        <Button type="button" onPress={onAction}>
          {error ? "Try again" : "Start verification"}
          <ArrowRight />
        </Button>
      )}
    </Card>
  );
}

export function ConfirmationAction(props: ConfirmationActionProps) {
  return <ConfirmationContent key={props.reviewKey} {...props} />;
}
function ConfirmationContent({
  onConfirm,
  reviewKey,
  disabled = false,
  label = "Confirm transfer",
  description,
}: ConfirmationActionProps) {
  const [acknowledgedKey, setAcknowledgedKey] = useState<string | null>(null);
  const ack = acknowledgedKey === reviewKey;
  return (
    <div className="confirmation-action stack">
      <Checkbox
        aria-label="I have checked the recipient and amount"
        isSelected={ack}
        onChange={(selected) => setAcknowledgedKey(selected ? reviewKey : null)}
        isDisabled={disabled}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Label>I’ve checked the recipient and amount</Label>
        </Checkbox.Content>
      </Checkbox>
      <Button
        type="button"
        className="full"
        isDisabled={!ack || disabled}
        onPress={() => {
          if (ack && !disabled) onConfirm();
        }}
      >
        {label}
        <ArrowUpRight />
      </Button>
      {description && <p className="micro muted center">{description}</p>}
    </div>
  );
}

export function TransferReview({
  quote,
  recipient,
  onConfirm,
  disabled = false,
  confirmLabel,
  description,
}: TransferReviewProps) {
  const identity = reviewIdentity(quote, recipient);
  const [failure, setFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const problem = useQuoteProblem(quote, recipient);
  function confirm() {
    try {
      const snapshot = confirmTransfer(quote, recipient);
      setFailure(null);
      onConfirm(snapshot);
    } catch (error) {
      setFailure({
        key: identity,
        message:
          error instanceof Error
            ? error.message
            : "Unable to confirm this transfer.",
      });
    }
  }
  return (
    <Card className="transfer-review stack">
      <h3>Review transfer</h3>
      <RecipientRow recipient={recipient} selected />
      <ExchangeQuote quote={quote} />
      <FeeBreakdown quote={quote} />
      <ConfirmationAction
        reviewKey={identity}
        disabled={disabled || !!problem}
        onConfirm={confirm}
        label={confirmLabel}
        description={description}
      />
      {(problem || failure?.key === identity) && (
        <p className="danger small" role="alert">
          {problem || failure?.message}
        </p>
      )}
    </Card>
  );
}

export function EmptyState({
  onAction,
  title = "No transactions yet",
  description = "Your transactions will appear here.",
  actionLabel = "Add transaction",
}: {
  onAction?: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state">
      <span className="round-icon">
        <Wallet />
      </span>
      <h3>{title}</h3>
      <p className="muted small">{description}</p>
      {onAction && (
        <Button type="button" variant="secondary" onPress={onAction}>
          <Plus />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function Receipt({
  transfer,
  status,
  reference,
  steps,
  onDownload,
}: ReceiptProps) {
  const done = status === "completed";
  return (
    <Card className="receipt stack">
      <div className="receipt-heading">
        <span className="round-icon">
          {done ? (
            <CircleCheck />
          ) : status === "failed" ? (
            <TriangleAlert />
          ) : (
            <Clock3 />
          )}
        </span>
        <span className="small muted">Transfer receipt</span>
      </div>
      <h3>
        {done
          ? "Transfer complete"
          : status === "failed"
            ? "Transfer failed"
            : "Transfer in progress"}
      </h3>
      <MoneyText {...transfer.quote.send} className="quote-amount" />
      <p className="muted small">
        To {transfer.recipient.name}
        {reference && ` · reference ${reference}`}
      </p>
      {steps && (
        <>
          <div className="rule" />
          <TransferTimeline steps={steps} />
        </>
      )}
      {onDownload && (
        <Button type="button" variant="secondary" onPress={onDownload}>
          <Download />
          Download receipt
        </Button>
      )}
    </Card>
  );
}

export function NumericKeypad({
  value,
  onChange,
  currency,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  disabled?: boolean;
}) {
  return (
    <div className="keypad">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map(
        (key) => (
          <Button
            type="button"
            key={key}
            variant="ghost"
            isDisabled={
              disabled || (key === "." && currencyDigits(currency) === 0)
            }
            aria-label={
              key === "⌫" ? "Backspace" : key === "." ? "Decimal point" : key
            }
            onPress={() => onChange(nextAmount(value, key, currency))}
          >
            {key === "⌫" ? <Delete /> : key}
          </Button>
        ),
      )}
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  label = "Scheduled transfer date",
  disabled = false,
}: DatePickerProps) {
  const id = useId();
  return (
    <TextField className="stack-sm" isDisabled={disabled}>
      <Label>{label}</Label>
      <Input
        type="date"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={id}
      />
      <span id={id} className="small muted">
        {value ? "Scheduled for " + value : "Choose a transfer date"}
      </span>
    </TextField>
  );
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label = "Interval",
  description,
  disabled = false,
}: StepperProps) {
  assertStepper({ value, min, max, step });
  const id = useId();
  return (
    <div className="stack-sm">
      <label htmlFor={id}>{label}</label>
      <div className="row">
        <Button
          type="button"
          variant="tertiary"
          isIconOnly
          aria-label={`Decrease ${label}`}
          isDisabled={disabled || value <= min}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          −
        </Button>
        <Input
          id={id}
          aria-describedby={description ? id + "-description" : undefined}
          className="stepper-input"
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={String(value)}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (
              e.target.value &&
              Number.isSafeInteger(n) &&
              n >= min &&
              n <= max
            )
              onChange(n);
          }}
        />
        <Button
          type="button"
          variant="tertiary"
          isIconOnly
          aria-label={`Increase ${label}`}
          isDisabled={disabled || value >= max}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          +
        </Button>
      </div>
      {description && (
        <span id={id + "-description"} className="small muted">
          {description}
        </span>
      )}
    </div>
  );
}

export function DataTable({
  items,
  label = "Recent transactions",
}: {
  items: readonly Transaction[];
  label?: string;
}) {
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th scope="col">Transaction</th>
            <th scope="col">Status</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <th scope="row">{item.name}</th>
              <td>
                <span
                  className={`small ${item.status === "pending" ? "warning" : item.status === "failed" ? "danger" : "positive"}`}
                >
                  {item.status === "completed"
                    ? "Completed"
                    : item.status === "pending"
                      ? "Pending"
                      : "Failed"}
                </span>
              </td>
              <td>
                <MoneyText {...item.amount} signed />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Toggle({
  selected,
  onChange,
  label,
  disabled = false,
}: {
  selected: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Switch
      isSelected={selected}
      onChange={onChange}
      isDisabled={disabled}
      aria-label={label}
    >
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}
