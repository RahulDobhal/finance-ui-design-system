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
  makeQuote,
} from "../design-system/money.mjs";
import { transactions } from "../data/catalog";

export type StoryProps = {
  currency: string;
  setCurrency: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  state: string;
  notify: (s: string) => void;
  hidden: boolean;
  setHidden: (v: boolean) => void;
  size: "sm" | "md" | "lg";
  variant: string;
};
const codes = ["USD", "GBP", "EUR", "INR", "JPY", "KWD"];
export function MoneyText({
  minor = 1284500,
  currency = "USD",
  signed = false,
  hidden = false,
  className = "",
}: {
  minor?: number;
  currency?: string;
  signed?: boolean;
  hidden?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`money ${signed && minor > 0 ? "positive" : ""} ${className}`}
      aria-label={hidden ? "Balance hidden" : undefined}
    >
      {hidden ? "••••••" : formatMoney(minor, currency, "en-US", signed)}
    </span>
  );
}
export function CurrencySelector({
  value,
  onChange,
  disabled = false,
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <Select
      aria-label="Currency"
      value={value}
      onChange={(v) => v && onChange(String(v))}
      isDisabled={disabled}
      className={`currency-select currency-select--${size}`}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className={size === "sm" ? "currency-menu--sm" : undefined}>
        <ListBox>
          {codes.map((c) => (
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
  disabled = false,
  error = false,
  label = "You send",
}: {
  value: string;
  onChange: (v: string) => void;
  currency: string;
  onCurrency: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
  label?: string;
}) {
  const id = useId();
  const invalid = error || parseMinor(value, currency) === null;
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
          disabled={disabled}
        />
      </div>
      <input
        id={id}
        aria-label={label}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={invalid ? id + "-error" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="amount-input"
      />
      <div className="small muted">
        {invalid ? (
          <span id={id + "-error"} role="alert" className="danger">
            Enter an amount with up to {currencyDigits(currency)} decimal
            places.
          </span>
        ) : (
          <>
            Available balance <b>{formatMoney(1284500, currency)}</b>
          </>
        )}
      </div>
    </div>
  );
}
export function BalanceCard({
  currency,
  hidden,
  setHidden,
  onSend,
  notify = () => {},
}: Pick<StoryProps, "currency" | "hidden" | "setHidden"> & {
  onSend: () => void;
  notify?: StoryProps["notify"];
}) {
  return (
    <Card className="balance-card">
      <div className="balance-overview">
        <div className="row between">
          <span className="balance-label">Total balance</span>
          <Button
            variant="ghost"
            isIconOnly
            aria-label={hidden ? "Show balance" : "Hide balance"}
            onPress={() => setHidden(!hidden)}
          >
            {hidden ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        <MoneyText
          currency={currency}
          hidden={hidden}
          className="balance-amount"
        />
        <span className="small muted">
          Available across your {currency} accounts
        </span>
      </div>
      <div className="balance-actions" aria-label="Balance actions">
        <Button variant="ghost" onPress={onSend}>
          <ArrowUpRight />
          Transfer
        </Button>
        <Button
          variant="ghost"
          onPress={() => notify("Request money · demo action")}
        >
          <ArrowDownLeft />
          Request
        </Button>
        <Button
          variant="ghost"
          onPress={() => notify("Add money · demo action")}
        >
          <Plus />
          Add
        </Button>
        <Button
          variant="ghost"
          onPress={() => notify("Convert currency · demo action")}
        >
          <ArrowLeftRight />
          Convert
        </Button>
      </div>
    </Card>
  );
}
export function TransactionRow({
  item = transactions[0],
  currency,
  onPress,
}: {
  item?: (typeof transactions)[number];
  currency: string;
  onPress: () => void;
}) {
  return (
    <button className="transaction-row" onClick={onPress}>
      <Avatar size="sm">
        <Avatar.Fallback>{item.initials}</Avatar.Fallback>
      </Avatar>
      <span className="row-copy">
        <strong>{item.name}</strong>
        <span>{item.detail}</span>
      </span>
      <span className="align-right">
        <MoneyText minor={item.minor} currency={currency} signed />
        {item.status === "Pending" && (
          <span className="status-text warning">Pending</span>
        )}
      </span>
      <ChevronRight size={15} className="muted" />
    </button>
  );
}
export function TransactionList({
  currency,
  empty = false,
  onPress,
}: {
  currency: string;
  empty?: boolean;
  onPress: () => void;
}) {
  return empty ? (
    <EmptyState onAction={onPress} />
  ) : (
    <div>
      {transactions.map((t) => (
        <TransactionRow
          key={t.name}
          item={t}
          currency={currency}
          onPress={onPress}
        />
      ))}
    </div>
  );
}
export function RecipientRow({
  selected = false,
  onPress,
  accountCurrency = "GBP",
}: {
  selected?: boolean;
  onPress: () => void;
  accountCurrency?: string;
}) {
  return (
    <button
      className={`recipient-row ${selected ? "selected" : ""}`}
      onClick={onPress}
    >
      <Avatar>
        <Avatar.Fallback>JC</Avatar.Fallback>
      </Avatar>
      <span className="row-copy">
        <strong>Jamie Chen</strong>
        <span>{accountCurrency} account · •• 2841</span>
      </span>
      {selected ? <CircleCheck size={20} /> : <ChevronRight size={18} />}
    </button>
  );
}
export function AccountDetails({ notify }: Pick<StoryProps, "notify">) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText("GB82 WEST 1234 5698 7654 32");
      setCopied(true);
      notify("IBAN copied to clipboard");
    } catch {
      notify("Clipboard unavailable. Select the displayed IBAN to copy.");
    }
  }
  return (
    <Card className="bank-details">
      <div className="row between">
        <h3>Account details</h3>
        <Button
          variant="ghost"
          isIconOnly
          aria-label="Copy IBAN"
          onPress={copy}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </Button>
      </div>
      <dl>
        <div>
          <dt>Account holder</dt>
          <dd>Alex Morgan</dd>
        </div>
        <div>
          <dt>IBAN</dt>
          <dd className="iban">GB82 WEST 1234 5698 7654 32</dd>
        </div>
        <div>
          <dt>BIC / SWIFT</dt>
          <dd>WESTGB2L</dd>
        </div>
      </dl>
    </Card>
  );
}
export function FeeBreakdown({
  minor = 100000,
  currency = "USD",
}: {
  minor?: number;
  currency?: string;
}) {
  const fee = 250;
  return (
    <div className="fee-breakdown">
      <div>
        <span>Amount converted</span>
        <MoneyText minor={Math.max(0, minor - fee)} currency={currency} />
      </div>
      <div>
        <span>Fee included</span>
        <MoneyText minor={Math.min(minor, fee)} currency={currency} />
      </div>
      <div className="fee-total">
        <strong>Total deducted</strong>
        <MoneyText minor={minor} currency={currency} />
      </div>
      <p className="micro muted">Illustrative fixed fee. No live pricing.</p>
    </div>
  );
}
export function ExchangeQuote({
  amount,
  currency,
}: Pick<StoryProps, "amount" | "currency">) {
  const minor = parseMinor(amount, currency);
  const to = currency === "GBP" ? "EUR" : "GBP";
  const quote = makeQuote(minor ?? 0, {
    feeMinor: 250,
    rateNumerator: currency === "GBP" ? 119 : 83,
    from: currency,
    to,
  });
  return (
    <Card className="quote-card">
      <div className="row between">
        <span className="small muted">Recipient gets</span>
        <span className="pill">{to}</span>
      </div>
      <MoneyText
        minor={quote.receiveMinor}
        currency={to}
        className="quote-amount"
      />
      <div className="row small muted">
        <ArrowLeftRight size={14} />
        {currency === "GBP" ? "1.19" : "0.83"} {to} per {currency} · demo rate
      </div>
      <div className="rule" />
      <div className="row between small">
        <span>Fee included in send amount</span>
        <MoneyText minor={quote.feeMinor} currency={currency} />
      </div>
      {!quote.valid && (
        <p className="danger small" role="alert">
          Amount must exceed the demo fee.
        </p>
      )}
      <p className="micro muted">Fixed illustrative quote · not live FX</p>
    </Card>
  );
}
export function TransferTimeline({ state = "pending" }: { state?: string }) {
  const complete = state === "completed";
  const failed = state === "error";
  return (
    <ol className="transfer-timeline">
      {[
        "Transfer created",
        failed ? "Transfer needs attention" : "Money on its way",
        complete ? "Received by Jamie" : "Estimated arrival",
      ].map((s, i) => (
        <li
          key={s}
          className={i === 0 || complete ? "done" : i === 1 ? "current" : ""}
        >
          <span className="timeline-node">
            {i === 0 || complete ? (
              <Check size={12} />
            ) : failed && i === 1 ? (
              <X size={12} />
            ) : (
              <span />
            )}
          </span>
          <div>
            <strong>{s}</strong>
            <p>
              {i === 0
                ? "Today, 10:42 AM"
                : i === 1
                  ? failed
                    ? "Try another funding method."
                    : complete
                      ? "Completed at 10:43 AM."
                      : "Processing with the recipient’s bank."
                  : complete
                    ? "Today, 10:44 AM"
                    : "Usually within a few minutes."}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
export function PaymentCard({ notify }: Pick<StoryProps, "notify">) {
  const [frozen, setFrozen] = useState(false),
    [reveal, setReveal] = useState(false);
  return (
    <div className="payment-card-story stack">
      <div className={`payment-card ${frozen ? "frozen" : ""}`}>
        <div className="row between">
          <span className="card-brand">Finance UI</span>
          {frozen ? <Snowflake size={22} /> : <CreditCard size={22} />}
        </div>
        <div className="card-number">
          {reveal ? "4242 4242 4242 2841" : "••••  ••••  ••••  2841"}
        </div>
        <div className="row between card-details">
          <div>
            <span className="micro">Cardholder</span>
            <strong>Alex Morgan</strong>
          </div>
          <div>
            <span className="micro">Valid thru</span>
            <strong>08/29</strong>
          </div>
        </div>
        <span className="card-status">
          {frozen ? "Frozen" : "Active"} · Demo debit card
        </span>
      </div>
      <div className="row between">
        <span className="small">Freeze card</span>
        <Toggle
          label="Freeze card"
          selected={frozen}
          onChange={(v) => {
            setFrozen(v);
            notify(v ? "Demo card frozen" : "Demo card unfrozen");
          }}
        />
      </div>
      <Button variant="secondary" onPress={() => setReveal(!reveal)}>
        {reveal ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
        {reveal ? "Hide" : "Reveal"} demo number
      </Button>
    </div>
  );
}
export function LineChart({ period = "Week" }: { period?: string }) {
  const data =
    period === "Week"
      ? [120, 180, 90, 230, 160, 310, 260]
      : [540, 700, 620, 810, 760, 980, 870];
  const max = Math.max(...data) * 1.15;
  const points = data
    .map((n, i) => `${i * 48 + 8},${130 - (n / max) * 110}`)
    .join(" ");
  return (
    <div className="chart">
      <svg
        viewBox="0 0 310 150"
        role="img"
        aria-label={`${period} spending trend. Values: ${data.join(", ")}.`}
      >
        <path
          d="M8 40H302 M8 85H302 M8 130H302"
          stroke="var(--surface-tertiary)"
          fill="none"
        />
        <polyline
          points={points}
          stroke="var(--chart-1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((n, i) => (
          <circle
            key={i}
            cx={i * 48 + 8}
            cy={130 - (n / max) * 110}
            r="3"
            fill="var(--chart-1)"
          />
        ))}
      </svg>
      <div className="row between micro muted">
        {(period === "Week"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]
        ).map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <details className="chart-data micro">
        <summary>View chart data</summary>
        {data.join(" · ")}
      </details>
    </div>
  );
}
export function SegmentedControl({
  value,
  onChange,
  options = ["Week", "Month"],
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <div className="segmented" role="group" aria-label="View selection">
      {options.map((o) => (
        <Button
          key={o}
          variant="ghost"
          aria-pressed={value === o}
          className={value === o ? "active" : ""}
          onPress={() => onChange(o)}
        >
          {o}
        </Button>
      ))}
    </div>
  );
}
export function SpendingSummary({ currency }: Pick<StoryProps, "currency">) {
  const [period, setPeriod] = useState("Week");
  return (
    <Card className="spending-card">
      <div className="spending-heading">
        <h3>Spending</h3>
        <SegmentedControl value={period} onChange={setPeriod} />
      </div>
      <MoneyText
        minor={period === "Week" ? 135000 : 598000}
        currency={currency}
        className="title-number"
      />
      <span className="small muted">
        {period === "Week" ? "This week" : "This month"} ·{" "}
        <span className="positive">12% less</span> than last period
      </span>
      <LineChart period={period} />
    </Card>
  );
}
export function ProgressMeter({
  value = 65,
  label = "Monthly limit",
}: {
  value?: number;
  label?: string;
}) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div className="stack-sm">
      <div className="row between small">
        <span>{label}</span>
        <strong>{bounded}%</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={bounded}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}
export function LimitMeter({ currency }: Pick<StoryProps, "currency">) {
  const [value, setValue] = useState(65);
  return (
    <Card className="stack">
      <h3>Monthly transfer limit</h3>
      <div className="row">
        <MoneyText minor={value * 10000} currency={currency} />
        <span className="muted small">of {formatMoney(1000000, currency)}</span>
      </div>
      <ProgressMeter value={value} />
      <p className="small muted">
        {formatMoney((100 - value) * 10000, currency)} remaining
      </p>
      <Slider
        aria-label="Adjust used limit"
        value={value}
        onChange={(v) => setValue(Number(v))}
        minValue={0}
        maxValue={100}
        className="full"
      >
        <Label>Adjust used limit</Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
    </Card>
  );
}
export function VerificationStatus({
  state = "default",
  notify,
}: Pick<StoryProps, "state" | "notify">) {
  const [requested, setRequested] = useState(false);
  const done = state === "completed",
    error = state === "error";
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
            : requested
              ? "Verification submitted"
              : "Verify your identity"}
      </h3>
      <p className="muted small">
        {done
          ? "Your demo account is ready to use."
          : requested
            ? "The demo is now in review. No documents were uploaded."
            : "Confirm your details to unlock higher transfer limits."}
      </p>
      <Chip size="sm" color={done ? "success" : error ? "danger" : "warning"}>
        {done
          ? "Verified"
          : error
            ? "Action needed"
            : requested
              ? "In review"
              : "Not verified"}
      </Chip>
      {!done && !requested && (
        <Button
          onPress={() => {
            setRequested(true);
            notify("Demo verification submitted");
          }}
        >
          {error ? "Try again" : "Start demo verification"}
          <ArrowRight size={15} />
        </Button>
      )}
    </Card>
  );
}
export function ConfirmationAction({
  onConfirm,
  disabled = false,
}: {
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [ack, setAck] = useState(false);
  return (
    <div className="confirmation-action stack">
      <Checkbox
        aria-label="I have checked the recipient and amount"
        isSelected={ack}
        onChange={setAck}
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
        className="full"
        isDisabled={!ack || disabled}
        onPress={onConfirm}
      >
        Confirm demo transfer
        <ArrowUpRight size={16} />
      </Button>
      <p className="micro muted center">Demo only. No money will move.</p>
    </div>
  );
}
export function TransferReview(p: StoryProps) {
  const [sent, setSent] = useState(false);
  const minor = parseMinor(p.amount, p.currency);
  if (sent)
    return (
      <Receipt currency={p.currency} minor={minor ?? 0} state="completed" />
    );
  return (
    <Card className="transfer-review stack">
      <h3>Review transfer</h3>
      <RecipientRow
        selected
        accountCurrency={p.currency === "GBP" ? "EUR" : "GBP"}
        onPress={() => p.notify("Jamie Chen · account ending 2841")}
      />
      <ExchangeQuote amount={p.amount} currency={p.currency} />
      <FeeBreakdown currency={p.currency} minor={minor ?? 0} />
      <ConfirmationAction
        disabled={p.state === "disabled" || minor === null || minor <= 250}
        onConfirm={() => {
          setSent(true);
          p.notify("Demo transfer confirmed");
        }}
      />
    </Card>
  );
}
export function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="empty-state">
      <span className="round-icon">
        <Wallet />
      </span>
      <h3>No transactions yet</h3>
      <p className="muted small">
        Your money, in motion. Add a transaction to see spending and transfers
        in one place.
      </p>
      <Button variant="secondary" onPress={onAction}>
        <Plus size={16} />
        Add demo transaction
      </Button>
    </div>
  );
}
export function Receipt({
  currency,
  state = "completed",
  minor = 100000,
}: {
  currency: string;
  state?: string;
  minor?: number;
}) {
  const done = state === "completed";
  return (
    <Card className="receipt stack">
      <div className="receipt-heading">
        <span className="round-icon">
          {done ? <CircleCheck /> : <Clock3 />}
        </span>
        <span className="small muted">Transfer receipt</span>
      </div>
      <h3>{done ? "Transfer complete" : "Transfer in progress"}</h3>
      <MoneyText minor={minor} currency={currency} className="quote-amount" />
      <p className="muted small">To Jamie Chen · reference FIN-2026-1042</p>
      <div className="rule" />
      <TransferTimeline state={state} />
      <Button
        variant="secondary"
        onPress={() => {
          const text = `DEMO RECEIPT\nReference: FIN-2026-1042\n${formatMoney(minor, currency)} to Jamie Chen\nStatus: ${done ? "Completed" : "Pending"}\nNo money moved.`;
          const url = URL.createObjectURL(
            new Blob([text], { type: "text/plain" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "demo-transfer-receipt.txt";
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        <Download size={16} />
        Download demo receipt
      </Button>
    </Card>
  );
}
export function NumericKeypad({
  value,
  onChange,
  currency = "USD",
  disabled = false,
}: {
  value: string;
  onChange: (s: string) => void;
  currency?: string;
  disabled?: boolean;
}) {
  return (
    <div className="keypad">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => (
        <Button
          key={k}
          variant="ghost"
          isDisabled={disabled}
          aria-label={k === "⌫" ? "Backspace" : k === "." ? "Decimal point" : k}
          onPress={() => {
            if (k === "⌫") return onChange(value.slice(0, -1) || "0");
            if (
              k === "." &&
              (currencyDigits(currency) === 0 || value.includes("."))
            )
              return;
            const next = (value === "0" && k !== "." ? "" : value) + k;
            if (parseMinor(next, currency) !== null) onChange(next);
          }}
        >
          {k === "⌫" ? <Delete size={22} /> : k}
        </Button>
      ))}
    </div>
  );
}
export function DatePicker() {
  const [value, setValue] = useState("2026-10-28");
  return (
    <TextField className="stack-sm">
      <Label>Scheduled transfer date</Label>
      <Input
        type="date"
        min="2026-10-25"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className="small muted">
        {value ? "Scheduled for " + value : "Choose a transfer date"}
      </span>
    </TextField>
  );
}
export function Stepper() {
  const [v, setV] = useState(1);
  return (
    <div className="stack-sm">
      <Label>Recurring interval, months</Label>
      <div className="row">
        <Button
          variant="tertiary"
          isIconOnly
          aria-label="Decrease interval"
          isDisabled={v <= 1}
          onPress={() => setV(v - 1)}
        >
          −
        </Button>
        <Input
          aria-label="Interval"
          className="stepper-input"
          type="number"
          min={1}
          max={12}
          value={String(v)}
          onChange={(e) => {
            const n = +e.target.value;
            if (Number.isInteger(n) && n >= 1 && n <= 12) setV(n);
          }}
        />
        <Button
          variant="tertiary"
          isIconOnly
          aria-label="Increase interval"
          isDisabled={v >= 12}
          onPress={() => setV(v + 1)}
        >
          +
        </Button>
      </div>
      <span className="small muted">
        Every {v} {v === 1 ? "month" : "months"}
      </span>
    </div>
  );
}
export function DataTable({ currency }: Pick<StoryProps, "currency">) {
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">Recent transactions</caption>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.name}>
              <th scope="row">{t.name}</th>
              <td>
                <span
                  className={`small ${t.status === "Pending" ? "warning" : "positive"}`}
                >
                  {t.status}
                </span>
              </td>
              <td>
                <MoneyText minor={t.minor} currency={currency} signed />
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

export function FinanceStory({ name, p }: { name: string; p: StoryProps }) {
  const [selected, setSelected] = useState(false),
    [period, setPeriod] = useState("Week"),
    [empty, setEmpty] = useState(false);
  const minor = parseMinor(p.amount, p.currency) ?? 0;
  switch (name) {
    case "MoneyText":
      return (
        <div className="stack center">
          <MoneyText
            minor={minor}
            currency={p.currency}
            hidden={p.hidden}
            className="balance-amount"
          />
          <MoneyText minor={-minor} currency={p.currency} signed />
          <MoneyText minor={minor} currency={p.currency} signed />
          <span className="micro muted">
            Tabular figures · integer minor units
          </span>
        </div>
      );
    case "CurrencySelector":
      return (
        <CurrencySelector
          value={p.currency}
          onChange={p.setCurrency}
          disabled={p.state === "disabled"}
        />
      );
    case "AmountInput":
      return (
        <div className="stack">
          <AmountInput
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
            onCurrency={p.setCurrency}
            error={p.state === "error"}
            disabled={p.state === "disabled"}
          />
          <NumericKeypad
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
            disabled={p.state === "disabled"}
          />
        </div>
      );
    case "BalanceCard":
      return (
        <BalanceCard
          {...p}
          onSend={() =>
            p.notify(
              "Send money action · open the Send money pattern to try the full flow",
            )
          }
        />
      );
    case "TransactionRow":
      return (
        <TransactionRow
          currency={p.currency}
          onPress={() =>
            p.notify("Alex Morgan · transfer received · completed")
          }
        />
      );
    case "TransactionList":
      return (
        <TransactionList
          currency={p.currency}
          empty={p.state === "empty" && !empty}
          onPress={() => {
            setEmpty(true);
            p.notify("Transaction selected");
          }}
        />
      );
    case "RecipientRow":
      return (
        <RecipientRow
          selected={selected}
          onPress={() => setSelected(!selected)}
        />
      );
    case "AccountDetails":
      return <AccountDetails {...p} />;
    case "FeeBreakdown":
      return <FeeBreakdown minor={minor} currency={p.currency} />;
    case "ExchangeQuote":
      return <ExchangeQuote {...p} />;
    case "TransferTimeline":
      return <TransferTimeline state={p.state} />;
    case "PaymentCard":
      return <PaymentCard {...p} />;
    case "SpendingSummary":
      return <SpendingSummary {...p} />;
    case "LimitMeter":
      return <LimitMeter {...p} />;
    case "VerificationStatus":
      return <VerificationStatus {...p} />;
    case "TransferReview":
      return <TransferReview {...p} />;
    case "EmptyState":
      return empty ? (
        <TransactionList
          currency={p.currency}
          onPress={() => p.notify("Demo transaction selected")}
        />
      ) : (
        <EmptyState onAction={() => setEmpty(true)} />
      );
    case "Receipt":
      return (
        <Receipt
          currency={p.currency}
          minor={minor}
          state={p.state === "default" ? "completed" : p.state}
        />
      );
    case "NumericKeypad":
      return (
        <div className="stack">
          <MoneyText
            currency={p.currency}
            minor={minor}
            className="balance-amount"
          />
          <NumericKeypad
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
            disabled={p.state === "disabled"}
          />
        </div>
      );
    case "DatePicker":
      return <DatePicker />;
    case "ProgressMeter":
      return <ProgressMeter value={p.state === "completed" ? 100 : 65} />;
    case "LineChart":
      return <LineChart />;
    case "SegmentedControl":
      return <SegmentedControl value={period} onChange={setPeriod} />;
    case "Stepper":
      return <Stepper />;
    case "DataTable":
      return <DataTable {...p} />;
    case "ConfirmationAction":
      return (
        <ConfirmationAction
          disabled={p.state === "disabled"}
          onConfirm={() => p.notify("Demo action confirmed · no money moved")}
        />
      );
    default:
      return null;
  }
}
