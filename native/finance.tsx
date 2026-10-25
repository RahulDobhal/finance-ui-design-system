import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  type TextProps,
} from "react-native";
import {
  Button,
  Card,
  Input,
  Label,
  TextField,
  FieldError,
  Select,
  Avatar,
  Switch,
  Checkbox,
  Slider,
} from "./base";
import { useUniwind } from "uniwind";
import Svg, { Polyline, Line, Circle } from "react-native-svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import { tokens } from "../src/design-system/tokens";
import {
  formatMoney,
  parseMinor,
  currencyDigits,
} from "../src/design-system/money.mjs";

import {
  boundedProgress,
  assertStepper,
  chartGeometry,
  confirmTransfer,
  dateValue,
  limitProgress,
  localDate,
  nextAmount,
  reviewIdentity,
} from "../src/design-system/finance-model.mjs";
import { useQuoteProblem } from "../src/design-system/useQuoteProblem";
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
} from "../src/design-system/finance-types";

type Theme = typeof tokens.themes.light | typeof tokens.themes.dark;
const sp = tokens.spacing,
  rad = tokens.radius;
export function useFinanceTheme(): Theme {
  const { theme } = useUniwind();
  return theme === "dark" ? tokens.themes.dark : tokens.themes.light;
}
export function FinanceText({
  tone = "foreground",
  kind = "body",
  style,
  ...props
}: TextProps & { tone?: keyof Theme; kind?: keyof typeof tokens.typography }) {
  const c = useFinanceTheme(),
    t = tokens.typography[kind];
  return (
    <Text
      {...props}
      style={[
        {
          color: c[tone],
          fontFamily:
            t.weight === 600
              ? "Inter_600SemiBold"
              : t.weight === 500
                ? "Inter_500Medium"
                : "Inter_400Regular",
          fontSize: t.size,
          lineHeight: t.lineHeight,
          fontWeight: String(t.weight) as "400" | "500" | "600",
          letterSpacing: t.letterSpacing,
        },
        style,
      ]}
    />
  );
}
function Stack({ children }: { children: React.ReactNode }) {
  return <View style={{ gap: sp[4] }}>{children}</View>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <View style={s.row}>{children}</View>;
}
export function MoneyText({
  minor,
  currency,
  locale = "en-US",
  hidden = false,
  signed = false,
  large = false,
}: {
  minor: number;
  currency: string;
  locale?: string;
  hidden?: boolean;
  signed?: boolean;
  large?: boolean;
}) {
  return (
    <FinanceText
      kind={large ? "balance" : "body"}
      tone={signed && minor > 0 ? "success" : "foreground"}
      accessibilityLabel={hidden ? "Balance hidden" : undefined}
      style={{
        fontVariant: ["tabular-nums"],
        fontFamily: large ? "Inter_500Medium" : "GeistMono_400Regular",
      }}
    >
      {hidden ? "••••••" : formatMoney(minor, currency, locale, signed)}
    </FinanceText>
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
      value={{ value, label: value }}
      onValueChange={(v) => v && onChange(v.value)}
      isDisabled={disabled}
    >
      <Select.Trigger
        accessibilityLabel={label}
        style={
          size === "sm"
            ? {
                minHeight: 40,
                paddingVertical: 10,
                paddingLeft: 15,
                paddingRight: 10,
                gap: sp[1],
              }
            : undefined
        }
      >
        <Select.Value placeholder="Choose a currency" />
        <Select.TriggerIndicator
          iconProps={{
            size:
              size === "sm"
                ? tokens.typography.label.lineHeight
                : tokens.typography.body.lineHeight,
          }}
        />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="dialog">
          <Select.Close />
          <Select.ListLabel>{label}</Select.ListLabel>
          {currencies.map((c) => (
            <Select.Item key={c} value={c} label={c}>
              <Select.ItemLabel />
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
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
  label = "You send",
}: AmountInputProps) {
  const invalid =
    error || (value !== "" && parseMinor(value, currency) === null);
  return (
    <Card>
      <Stack>
        <Row>
          <FinanceText tone="muted" kind="body-small">
            {label}
          </FinanceText>
          <CurrencySelector
            size="sm"
            value={currency}
            onChange={onCurrency}
            currencies={currencies}
            disabled={disabled}
          />
        </Row>
        <TextField isDisabled={disabled} isInvalid={invalid}>
          <Label>Amount</Label>
          <Input
            value={value}
            onChangeText={onChange}
            keyboardType={
              currencyDigits(currency) === 0 ? "number-pad" : "decimal-pad"
            }
            accessibilityLabel={label}
            style={{
              fontSize: tokens.typography.balance.size,
              fontFamily: "Inter_500Medium",
              textAlign: "right",
              backgroundColor: "transparent",
              minHeight: 64,
              fontVariant: ["tabular-nums"],
            }}
          />
          <FieldError>
            Enter up to {currencyDigits(currency)} decimal places.
          </FieldError>
        </TextField>
        {availableBalance && (
          <FinanceText kind="caption" tone="muted">
            Available balance{" "}
            {formatMoney(availableBalance.minor, availableBalance.currency)}
          </FinanceText>
        )}
      </Stack>
    </Card>
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
  const c = useFinanceTheme();
  const actions = [
    { icon: "↗", label: "Transfer", onPress: onTransfer },
    { icon: "↓", label: "Request", onPress: onRequest },
    { icon: "+", label: "Add", onPress: onAdd },
    { icon: "↔", label: "Convert", onPress: onConvert },
  ];
  return (
    <Card
      style={{
        padding: 0,
        gap: 0,
        overflow: "hidden",
        borderRadius: rad.lg,
        borderCurve: "continuous",
      }}
    >
      <View style={{ padding: sp[5], gap: sp[2], backgroundColor: c.surface }}>
        <Row>
          <FinanceText kind="label">Total balance</FinanceText>
          <Button
            variant="ghost"
            size="sm"
            accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
            onPress={() => onHiddenChange(!hidden)}
          >
            {hidden ? "Show" : "Hide"}
          </Button>
        </Row>
        <MoneyText {...balance} hidden={hidden} large />
        {description && (
          <FinanceText tone="muted" kind="caption">
            {description}
          </FinanceText>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: c["accent-soft-foreground"],
          padding: sp[2],
          gap: sp[1],
        }}
      >
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            isDisabled={!action.onPress}
            onPress={action.onPress}
            style={{
              flex: 1,
              flexDirection: "column",
              gap: sp[2],
              paddingVertical: sp[3],
              paddingHorizontal: sp[1],
            }}
          >
            <FinanceText tone="accent-soft" kind="label">
              {action.icon}
            </FinanceText>
            <FinanceText tone="accent-soft" kind="caption">
              {action.label}
            </FinanceText>
          </Button>
        ))}
      </View>
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
      <Avatar alt={item.name} size="sm">
        <Avatar.Fallback>
          {item.initials ||
            item.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
        </Avatar.Fallback>
      </Avatar>
      <View style={{ flex: 1, gap: sp[1] }}>
        <FinanceText kind="label">{item.name}</FinanceText>
        <FinanceText kind="caption" tone="muted">
          {item.detail}
        </FinanceText>
      </View>
      <View style={{ alignItems: "flex-end", gap: sp[1] }}>
        <MoneyText {...item.amount} signed />
        {item.status !== "completed" && (
          <FinanceText
            kind="caption"
            tone={item.status === "failed" ? "danger" : "warning"}
          >
            {item.status === "pending" ? "Pending" : "Failed"}
          </FinanceText>
        )}
      </View>
    </>
  );
  const style = [s.row, { paddingVertical: sp[4], minHeight: 64 }];
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item.id)}
      style={style}
    >
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
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
    <Stack>
      {items.map((item) => (
        <TransactionRow key={item.id} item={item} onPress={onItemPress} />
      ))}
    </Stack>
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
  const c = useFinanceTheme();
  const content = (
    <>
      <Avatar alt={recipient.name}>
        <Avatar.Fallback>
          {recipient.initials ||
            recipient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
        </Avatar.Fallback>
      </Avatar>
      <View style={{ flex: 1, gap: sp[1] }}>
        <FinanceText kind="label">{recipient.name}</FinanceText>
        <FinanceText kind="caption" tone="muted">
          {recipient.accountCurrency} account · •• {recipient.accountLast4}
        </FinanceText>
      </View>
      {selected && <FinanceText tone="success">✓</FinanceText>}
    </>
  );
  const style = [
    s.row,
    {
      padding: sp[3],
      borderRadius: rad.md,
      backgroundColor: selected ? c["accent-soft"] : c.surface,
    },
  ];
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={style}
    >
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}

export function AccountDetails({ account, onCopy }: AccountDetailsProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null),
    [error, setError] = useState("");
  return (
    <Card>
      <Stack>
        <FinanceText kind="subtitle">Account details</FinanceText>
        {[
          ["Account holder", account.holder],
          ["IBAN", account.iban],
          ["BIC / SWIFT", account.bic],
        ].map(([label, value]) => (
          <View key={label} style={{ gap: sp[1] }}>
            <FinanceText kind="caption" tone="muted">
              {label}
            </FinanceText>
            <FinanceText selectable>{value}</FinanceText>
          </View>
        ))}
        {onCopy && (
          <Button
            variant="secondary"
            onPress={async () => {
              try {
                await onCopy(account.iban);
                setCopiedValue(account.iban);
                setError("");
              } catch {
                setError("Unable to copy. Select the displayed IBAN to copy.");
              }
            }}
          >
            {copiedValue === account.iban ? "IBAN copied ✓" : "Copy IBAN"}
          </Button>
        )}
        {!!error && (
          <FinanceText accessibilityRole="alert" tone="danger" kind="caption">
            {error}
          </FinanceText>
        )}
      </Stack>
    </Card>
  );
}

export function FeeBreakdown({ quote }: { quote: TransferQuote }) {
  const rows = [
    {
      label: "Amount converted",
      amount: {
        minor: Math.max(0, quote.send.minor - quote.fee.minor),
        currency: quote.send.currency,
      },
    },
    { label: "Fee included", amount: quote.fee },
    { label: "Total deducted", amount: quote.send },
  ];
  return (
    <Stack>
      {rows.map((row) => (
        <Row key={row.label}>
          <FinanceText kind="body-small" tone="muted">
            {row.label}
          </FinanceText>
          <MoneyText {...row.amount} />
        </Row>
      ))}
    </Stack>
  );
}

export function ExchangeQuote({ quote }: { quote: TransferQuote }) {
  const problem = useQuoteProblem(quote);
  return (
    <Card>
      <Stack>
        <FinanceText tone="muted">Recipient gets</FinanceText>
        <MoneyText {...quote.receive} large />
        <FinanceText kind="caption" tone="muted">
          {quote.rate.numerator / quote.rate.denominator}{" "}
          {quote.receive.currency} per {quote.send.currency}
        </FinanceText>
        <Row>
          <FinanceText kind="caption">Fee included</FinanceText>
          <MoneyText {...quote.fee} />
        </Row>
        {problem && (
          <FinanceText kind="caption" tone="danger">
            {problem}
          </FinanceText>
        )}
      </Stack>
    </Card>
  );
}

export function TransferTimeline({
  steps,
}: {
  steps: readonly TimelineStep[];
}) {
  const c = useFinanceTheme();
  return (
    <Stack>
      {steps.map((step) => (
        <View key={step.id} style={{ flexDirection: "row", gap: sp[3] }}>
          <View
            accessible={false}
            style={{
              width: 32,
              height: 32,
              borderRadius: rad.sm,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                step.status === "completed"
                  ? c["accent-soft"]
                  : c["surface-secondary"],
            }}
          >
            <FinanceText
              tone={
                step.status === "completed"
                  ? "success"
                  : step.status === "failed"
                    ? "danger"
                    : "muted"
              }
            >
              {step.status === "completed"
                ? "✓"
                : step.status === "failed"
                  ? "×"
                  : "·"}
            </FinanceText>
          </View>
          <View style={{ flex: 1, gap: sp[1] }}>
            <FinanceText
              kind="label"
              accessibilityLabel={`${step.label}, ${step.status}`}
            >
              {step.label}
            </FinanceText>
            <FinanceText kind="caption" tone="muted">
              {step.detail}
            </FinanceText>
          </View>
        </View>
      ))}
    </Stack>
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
  const [reveal, setReveal] = useState(false),
    c = useFinanceTheme();
  return (
    <Stack>
      <Card
        style={{
          backgroundColor: frozen ? c["surface-secondary"] : c["accent-soft"],
          padding: tokens.padding.card,
          gap: sp[6],
        }}
      >
        <Row>
          <FinanceText tone="accent-soft-foreground" kind="subtitle">
            {card.brand}
          </FinanceText>
          <FinanceText tone="muted">{frozen ? "Frozen" : "Active"}</FinanceText>
        </Row>
        <FinanceText
          tone="accent-soft-foreground"
          kind="subtitle"
          style={{
            fontVariant: ["tabular-nums"],
            fontFamily: "GeistMono_400Regular",
          }}
        >
          {reveal && card.number ? card.number : card.maskedNumber}
        </FinanceText>
        <Row>
          <FinanceText tone="muted" kind="caption">
            {card.cardholder}
          </FinanceText>
          <FinanceText tone="muted" kind="caption">
            {card.expiry}
          </FinanceText>
        </Row>
        {card.description && (
          <FinanceText tone="muted" kind="caption">
            {card.description}
          </FinanceText>
        )}
      </Card>
      {onFrozenChange && (
        <Row>
          <FinanceText>Freeze card</FinanceText>
          <Switch
            accessibilityLabel="Freeze card"
            isSelected={frozen}
            onSelectedChange={onFrozenChange}
            isDisabled={disabled}
          />
        </Row>
      )}
      {card.number && (
        <Button
          variant="secondary"
          isDisabled={disabled}
          onPress={() => setReveal(!reveal)}
        >
          {reveal ? "Hide" : "Reveal"} number
        </Button>
      )}
    </Stack>
  );
}

export function SegmentedControl({
  value,
  onChange,
  options,
  label = "View selection",
  disabled = false,
}: SegmentedControlProps) {
  const c = useFinanceTheme();
  return (
    <View
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        gap: sp[1],
        padding: sp[1],
        borderRadius: rad.md,
        backgroundColor: c["surface-secondary"],
      }}
    >
      {options.map((option) => (
        <Button
          key={option}
          variant="ghost"
          accessibilityRole="button"
          accessibilityState={{ selected: value === option, disabled }}
          isDisabled={disabled}
          onPress={() => onChange(option)}
          style={{
            flex: 1,
            borderRadius: rad.xs,
            backgroundColor: value === option ? c.surface : "transparent",
          }}
        >
          <FinanceText kind="label">{option}</FinanceText>
        </Button>
      ))}
    </View>
  );
}

export function LineChart({
  points,
  label = "Trend",
}: {
  points: readonly ChartPoint[];
  label?: string;
}) {
  const c = useFinanceTheme(),
    coords = chartGeometry(points),
    summary = points
      .map((point) => `${point.label}: ${point.value}`)
      .join(", ");
  return (
    <View accessible accessibilityLabel={`${label}. ${summary || "No data"}`}>
      <Svg width="100%" height={150} viewBox="0 0 310 150">
        {[40, 85, 130].map((y) => (
          <Line
            key={y}
            x1={8}
            y1={y}
            x2={302}
            y2={y}
            stroke={c["surface-tertiary"]}
          />
        ))}
        <Polyline
          points={coords.map((point) => `${point.x},${point.y}`).join(" ")}
          stroke={c["chart-1"]}
          strokeWidth={3}
          fill="none"
        />
        {coords.map((point, i) => (
          <Circle key={i} cx={point.x} cy={point.y} r={3} fill={c["chart-1"]} />
        ))}
      </Svg>
      <FinanceText kind="caption" tone="muted">
        {summary || "No data"}
      </FinanceText>
    </View>
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
    <Card>
      <Stack>
        <Row>
          <FinanceText kind="subtitle">Spending</FinanceText>
          <SegmentedControl
            value={period}
            onChange={onPeriodChange}
            options={periods}
            label="Spending period"
          />
        </Row>
        <MoneyText {...amount} large />
        {description && (
          <FinanceText kind="caption" tone="muted">
            {description}
          </FinanceText>
        )}
        <LineChart points={points} label={`${period} spending`} />
      </Stack>
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
  const c = useFinanceTheme(),
    bounded = boundedProgress(value);
  return (
    <Stack>
      <Row>
        <FinanceText kind="caption">{label}</FinanceText>
        <FinanceText kind="label">
          {bounded === null ? "In progress" : `${Math.round(bounded)}%`}
        </FinanceText>
      </Row>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={
          bounded === null
            ? { text: "In progress" }
            : { min: 0, max: 100, now: bounded }
        }
        style={{
          height: 8,
          borderRadius: rad.xs,
          backgroundColor: c["surface-tertiary"],
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${bounded ?? 0}%`,
            height: "100%",
            backgroundColor: c.accent,
            borderRadius: rad.xs,
          }}
        />
      </View>
    </Stack>
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
    <Card>
      <Stack>
        <FinanceText kind="subtitle">{label}</FinanceText>
        <Row>
          <MoneyText {...used} />
          <FinanceText tone="muted" kind="caption">
            of {formatMoney(limit.minor, limit.currency)}
          </FinanceText>
        </Row>
        <ProgressMeter value={progress} label={label} />
        <FinanceText tone="muted" kind="caption">
          {formatMoney(Math.max(0, limit.minor - used.minor), limit.currency)}{" "}
          remaining
        </FinanceText>
        {onUsedChange && (
          <Slider
            value={used.minor}
            onChange={(value) => onUsedChange(Number(value))}
            minValue={0}
            maxValue={limit.minor}
            step={step}
            accessibilityLabel="Adjust used limit"
          >
            <Label>Adjust used limit</Label>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>
        )}
      </Stack>
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
    <Card>
      <Stack>
        <FinanceText kind="subtitle">
          {done
            ? "Identity verified"
            : error
              ? "We couldn’t verify your details"
              : pending
                ? "Verification submitted"
                : "Verify your identity"}
        </FinanceText>
        {description && <FinanceText tone="muted">{description}</FinanceText>}
        <FinanceText
          kind="label"
          tone={done ? "success" : error ? "danger" : "warning"}
        >
          {done
            ? "Verified"
            : error
              ? "Action needed"
              : pending
                ? "In review"
                : "Not verified"}
        </FinanceText>
        {!done && !pending && onAction && (
          <Button onPress={onAction}>
            {error ? "Try again" : "Start verification"}
          </Button>
        )}
      </Stack>
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
  const [acknowledgedKey, setAcknowledgedKey] = useState<string | null>(null),
    ack = acknowledgedKey === reviewKey;
  return (
    <Stack>
      <Pressable
        accessible
        accessibilityRole="checkbox"
        accessibilityLabel="I have checked the recipient and amount"
        accessibilityState={{ checked: ack, disabled }}
        disabled={disabled}
        onPress={() => setAcknowledgedKey(ack ? null : reviewKey)}
        style={{
          flexDirection: "row",
          gap: sp[3],
          alignItems: "center",
          minHeight: tokens.touch.minimum,
        }}
      >
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Checkbox isSelected={ack} isDisabled={disabled} />
        </View>
        <FinanceText kind="body-small" style={{ flex: 1 }}>
          I’ve checked the recipient and amount
        </FinanceText>
      </Pressable>
      <Button
        isDisabled={!ack || disabled}
        onPress={() => {
          if (ack && !disabled) onConfirm();
        }}
      >
        {label}
      </Button>
      {description && (
        <FinanceText kind="caption" tone="muted">
          {description}
        </FinanceText>
      )}
    </Stack>
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
  const identity = reviewIdentity(quote, recipient),
    problem = useQuoteProblem(quote, recipient);
  const [failure, setFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);
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
    <Card>
      <Stack>
        <FinanceText kind="subtitle">Review transfer</FinanceText>
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
          <FinanceText accessibilityRole="alert" tone="danger" kind="caption">
            {problem || failure?.message}
          </FinanceText>
        )}
      </Stack>
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
    <Card>
      <Stack>
        <FinanceText kind="subtitle">{title}</FinanceText>
        <FinanceText tone="muted">{description}</FinanceText>
        {onAction && (
          <Button variant="secondary" onPress={onAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Card>
  );
}

export function Receipt({
  transfer,
  status,
  reference,
  steps,
  onDownload,
}: ReceiptProps) {
  return (
    <Card>
      <Stack>
        <FinanceText kind="caption" tone="muted">
          Transfer receipt
        </FinanceText>
        <FinanceText kind="subtitle">
          {status === "completed"
            ? "Transfer complete"
            : status === "failed"
              ? "Transfer failed"
              : "Transfer in progress"}
        </FinanceText>
        <MoneyText {...transfer.quote.send} large />
        <FinanceText tone="muted">
          To {transfer.recipient.name}
          {reference && ` · reference ${reference}`}
        </FinanceText>
        {steps && <TransferTimeline steps={steps} />}
        {onDownload && (
          <Button variant="secondary" onPress={onDownload}>
            Download receipt
          </Button>
        )}
      </Stack>
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
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp[2] }}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map(
        (key) => (
          <Button
            key={key}
            isDisabled={
              disabled || (key === "." && currencyDigits(currency) === 0)
            }
            variant="tertiary"
            style={{
              width: "31%",
              flexGrow: 1,
              minHeight: 64,
              borderRadius: rad.sm,
            }}
            accessibilityLabel={
              key === "⌫" ? "Backspace" : key === "." ? "Decimal point" : key
            }
            onPress={() => onChange(nextAmount(value, key, currency))}
          >
            <FinanceText kind="title">{key}</FinanceText>
          </Button>
        ),
      )}
    </View>
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
  const [open, setOpen] = useState(false);
  return (
    <Stack>
      <FinanceText kind="label">{label}</FinanceText>
      <Button
        variant="secondary"
        isDisabled={disabled}
        onPress={() => setOpen(true)}
      >
        {value
          ? localDate(value).toLocaleDateString()
          : "Choose a transfer date"}
      </Button>
      {open && (
        <DateTimePicker
          value={value ? localDate(value) : new Date()}
          mode="date"
          minimumDate={min ? localDate(min) : undefined}
          maximumDate={max ? localDate(max) : undefined}
          onChange={(event, date) => {
            if (Platform.OS === "android") setOpen(false);
            if (event.type === "set" && date) onChange(dateValue(date));
          }}
        />
      )}
      {open && Platform.OS === "ios" && (
        <Button onPress={() => setOpen(false)}>Done</Button>
      )}
    </Stack>
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
  return (
    <Stack>
      <FinanceText kind="label">{label}</FinanceText>
      <Row>
        <Button
          accessibilityLabel={`Decrease ${label}`}
          variant="secondary"
          isDisabled={disabled || value <= min}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          −
        </Button>
        <FinanceText accessibilityLiveRegion="polite">{value}</FinanceText>
        <Button
          accessibilityLabel={`Increase ${label}`}
          variant="secondary"
          isDisabled={disabled || value >= max}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          +
        </Button>
      </Row>
      {description && (
        <FinanceText tone="muted" kind="caption">
          {description}
        </FinanceText>
      )}
    </Stack>
  );
}

export function DataTable({
  items,
  label = "Recent transactions",
}: {
  items: readonly Transaction[];
  label?: string;
}) {
  const c = useFinanceTheme();
  return (
    <ScrollView horizontal accessibilityLabel={label}>
      <View style={{ minWidth: 480, gap: sp[3] }}>
        <View
          style={[
            s.row,
            {
              backgroundColor: c["surface-secondary"],
              padding: sp[3],
              borderTopLeftRadius: rad.md,
              borderTopRightRadius: rad.md,
            },
          ]}
        >
          <FinanceText kind="label" style={{ width: 160 }}>
            Transaction
          </FinanceText>
          <FinanceText kind="label" style={{ width: 100 }}>
            Status
          </FinanceText>
          <FinanceText kind="label">Amount</FinanceText>
        </View>
        {items.map((item) => (
          <View
            key={item.id}
            accessible
            accessibilityLabel={`${item.name}, ${item.status}, ${formatMoney(item.amount.minor, item.amount.currency)}`}
            style={s.row}
          >
            <FinanceText kind="body-small" style={{ width: 160 }}>
              {item.name}
            </FinanceText>
            <FinanceText kind="body-small" style={{ width: 100 }}>
              {item.status === "completed"
                ? "Completed"
                : item.status === "pending"
                  ? "Pending"
                  : "Failed"}
            </FinanceText>
            <MoneyText {...item.amount} signed />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export const financeComponents = {
  MoneyText,
  CurrencySelector,
  AmountInput,
  BalanceCard,
  TransactionRow,
  TransactionList,
  RecipientRow,
  AccountDetails,
  FeeBreakdown,
  ExchangeQuote,
  TransferTimeline,
  PaymentCard,
  SpendingSummary,
  LimitMeter,
  VerificationStatus,
  TransferReview,
  EmptyState,
  Receipt,
};
export const extensionComponents = {
  NumericKeypad,
  DatePicker,
  ProgressMeter,
  LineChart,
  SegmentedControl,
  Stepper,
  DataTable,
  ConfirmationAction,
};
const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: sp[3],
  },
});
