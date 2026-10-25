import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
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
  Separator,
  Slider,
} from "./base";
import { useUniwind } from "uniwind";
import Svg, { Polyline, Line, Circle } from "react-native-svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Clipboard from "expo-clipboard";
import { tokens } from "../src/design-system/tokens";
import {
  formatMoney,
  parseMinor,
  currencyDigits,
  makeQuote,
} from "../src/design-system/money.mjs";

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
  minor = 1284500,
  currency = "USD",
  hidden = false,
  signed = false,
  large = false,
}: {
  minor?: number;
  currency?: string;
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
      {hidden ? "••••••" : formatMoney(minor, currency, "en-US", signed)}
    </FinanceText>
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
      value={{ value, label: value }}
      onValueChange={(v) => v && onChange(v.value)}
      isDisabled={disabled}
    >
      <Select.Trigger accessibilityLabel="Currency" style={size === "sm" ? { minHeight: 40, paddingVertical: 10, paddingLeft: 15, paddingRight: 10, gap: sp[1] } : undefined}>
        <Select.Value placeholder="Choose an option" />
        <Select.TriggerIndicator iconProps={{ size: size === "sm" ? tokens.typography.label.lineHeight : tokens.typography.body.lineHeight }} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="dialog">
          <Select.Close />
          <Select.ListLabel>Select currency</Select.ListLabel>
          {["USD", "GBP", "EUR", "INR", "JPY", "KWD"].map((c) => (
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
  disabled = false,
  forceError = false,
}: {
  value: string;
  onChange: (v: string) => void;
  currency: string;
  onCurrency: (v: string) => void;
  disabled?: boolean;
  forceError?: boolean;
}) {
  const invalid = forceError || parseMinor(value, currency) === null;
  return (
    <Card>
      <Stack>
        <Row>
          <FinanceText tone="muted" kind="body-small">
            You send
          </FinanceText>
          <CurrencySelector
            size="sm"
            value={currency}
            onChange={onCurrency}
            disabled={disabled}
          />
        </Row>
        <TextField isDisabled={disabled} isInvalid={invalid}>
          <Label>Amount</Label>
          <Input
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            accessibilityLabel="Send amount"
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
        <FinanceText kind="caption" tone="muted">
          Illustrative amount. No money moves.
        </FinanceText>
      </Stack>
    </Card>
  );
}
export function BalanceCard({
  currency = "USD",
  onSend = () => {},
}: {
  currency?: string;
  onSend?: () => void;
}) {
  const [hidden, setHidden] = useState(false),
    c = useFinanceTheme();
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
            onPress={() => setHidden(!hidden)}
          >
            {hidden ? "Show" : "Hide"}
          </Button>
        </Row>
        <FinanceText
          kind="balance"
          accessibilityLabel={hidden ? "Balance hidden" : undefined}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {hidden ? "••••••" : formatMoney(1284500, currency)}
        </FinanceText>
        <FinanceText tone="muted" kind="caption">
          Available across your {currency} accounts
        </FinanceText>
      </View>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: c["accent-soft-foreground"],
          padding: sp[2],
          gap: sp[1],
        }}
      >
        {[
          ["↗", "Transfer"],
          ["↓", "Request"],
          ["+", "Add"],
          ["↔", "Convert"],
        ].map(([icon, label]) => (
          <Button
            key={label}
            variant="ghost"
            onPress={() =>
              label === "Transfer"
                ? onSend()
                : Alert.alert(
                    label,
                    "Demo action selected. No money will move.",
                  )
            }
            style={{
              flex: 1,
              flexDirection: "column",
              gap: sp[2],
              paddingVertical: sp[3],
              paddingHorizontal: sp[1],
            }}
          >
            <FinanceText tone="accent-soft" kind="title">
              {icon}
            </FinanceText>
            <FinanceText tone="accent-soft" kind="caption">
              {label}
            </FinanceText>
          </Button>
        ))}
      </View>
    </Card>
  );
}
const txs = [
  {
    name: "Alex Morgan",
    detail: "Transfer received",
    minor: 245000,
    status: "Completed",
  },
  {
    name: "North Studio",
    detail: "Card payment",
    minor: -12840,
    status: "Completed",
  },
  {
    name: "Jamie Chen",
    detail: "Bank transfer",
    minor: -50000,
    status: "Pending",
  },
];
export function TransactionRow({
  item = txs[0],
  currency = "USD",
  onPress = () => {},
}: {
  item?: (typeof txs)[number];
  currency?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.row, { paddingVertical: sp[4], minHeight: 64 }]}
    >
      <Avatar alt={item.name} size="sm">
        <Avatar.Fallback>
          {item.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar.Fallback>
      </Avatar>
      <View style={{ flex: 1, gap: sp[1] }}>
        <FinanceText kind="label">{item.name}</FinanceText>
        <FinanceText kind="caption" tone="muted">
          {item.detail} · {item.status}
        </FinanceText>
      </View>
      <MoneyText minor={item.minor} currency={currency} signed />
    </Pressable>
  );
}
export function TransactionList({
  currency = "USD",
  empty = false,
}: {
  currency?: string;
  empty?: boolean;
}) {
  const [added, setAdded] = useState(false);
  if (empty && !added) return <EmptyState onAction={() => setAdded(true)} />;
  return (
    <View>
      {txs.map((t, i) => (
        <View key={t.name}>
          <TransactionRow
            currency={currency}
            item={t}
            onPress={() =>
              Alert.alert(
                t.name,
                `${t.status}: ${formatMoney(t.minor, currency)}`,
              )
            }
          />
          {i < txs.length - 1 && <Separator />}
        </View>
      ))}
    </View>
  );
}
export function RecipientRow({
  selected = false,
  onPress = () => {},
  accountCurrency = "GBP",
}: {
  selected?: boolean;
  onPress?: () => void;
  accountCurrency?: string;
}) {
  const c = useFinanceTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        s.row,
        {
          borderWidth: 0,
          borderColor: selected ? c.accent : c["surface-tertiary"],
          borderRadius: rad.md,
          borderCurve: "continuous",
          padding: sp[4],
          minHeight: 64,
        },
      ]}
    >
      <Avatar alt="Jamie Chen">
        <Avatar.Fallback>JC</Avatar.Fallback>
      </Avatar>
      <View style={{ flex: 1 }}>
        <FinanceText kind="label">Jamie Chen</FinanceText>
        <FinanceText kind="caption" tone="muted">
          {accountCurrency} account · ending 2841
        </FinanceText>
      </View>
      <FinanceText>{selected ? "✓" : "›"}</FinanceText>
    </Pressable>
  );
}
export function AccountDetails() {
  const [copied, setCopied] = useState(false);
  return (
    <Card>
      <Stack>
        <FinanceText kind="subtitle">Account details</FinanceText>
        {[
          ["Account holder", "Alex Morgan"],
          ["IBAN", "GB82 WEST 1234 5698 7654 32"],
          ["BIC / SWIFT", "WESTGB2L"],
        ].map(([a, b]) => (
          <View key={a} style={{ gap: sp[1] }}>
            <FinanceText kind="caption" tone="muted">
              {a}
            </FinanceText>
            <FinanceText selectable>{b}</FinanceText>
          </View>
        ))}
        <Button
          variant="secondary"
          onPress={async () => {
            await Clipboard.setStringAsync("GB82 WEST 1234 5698 7654 32");
            setCopied(true);
          }}
        >
          {copied ? "IBAN copied ✓" : "Copy IBAN"}
        </Button>
      </Stack>
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
  return (
    <Stack>
      {[
        ["Amount converted", Math.max(0, minor - 250)],
        ["Fee included", Math.min(minor, 250)],
        ["Total deducted", minor],
      ].map(([a, b]) => (
        <Row key={a}>
          <FinanceText kind="body-small" tone="muted">
            {a}
          </FinanceText>
          <MoneyText currency={currency} minor={Number(b)} />
        </Row>
      ))}
      <FinanceText kind="caption" tone="muted">
        Illustrative fixed fee; no live pricing.
      </FinanceText>
    </Stack>
  );
}
export function ExchangeQuote({
  amount = "1000.00",
  currency = "USD",
}: {
  amount?: string;
  currency?: string;
}) {
  const to = currency === "GBP" ? "EUR" : "GBP",
    q = makeQuote(parseMinor(amount, currency) ?? 0, {
      from: currency,
      to,
      rateNumerator: currency === "GBP" ? 119 : 83,
      feeMinor: 250,
    });
  return (
    <Card>
      <Stack>
        <FinanceText tone="muted">Recipient gets</FinanceText>
        <MoneyText minor={q.receiveMinor} currency={to} large />
        <FinanceText kind="caption" tone="muted">
          {currency === "GBP" ? "1.19" : "0.83"} {to} per {currency} · demo rate
        </FinanceText>
        <Separator />
        <Row>
          <FinanceText kind="caption">Fee included</FinanceText>
          <MoneyText minor={q.feeMinor} currency={currency} />
        </Row>
        {!q.valid && (
          <FinanceText kind="caption" tone="danger">
            Amount must exceed the fee.
          </FinanceText>
        )}
      </Stack>
    </Card>
  );
}
export function TransferTimeline({ status = "pending" }: { status?: string }) {
  const done = status === "completed",
    failed = status === "error",
    c = useFinanceTheme();
  return (
    <Stack>
      {[
        "Transfer created",
        failed ? "Transfer needs attention" : "Money on its way",
        done ? "Received by Jamie" : "Estimated arrival",
      ].map((label, i) => (
        <View key={label} style={{ flexDirection: "row", gap: sp[3] }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: rad.sm,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                i === 0 || done ? c["accent-soft"] : c["surface-secondary"],
            }}
          >
            <FinanceText tone={i === 0 || done ? "success" : "muted"}>
              {i === 0 || done ? "✓" : "·"}
            </FinanceText>
          </View>
          <View style={{ flex: 1, gap: sp[1] }}>
            <FinanceText kind="label">{label}</FinanceText>
            <FinanceText kind="caption" tone="muted">
              {i === 0
                ? "Today, 10:42 AM"
                : i === 1
                  ? failed
                    ? "Try another funding method."
                    : done
                      ? "Completed at 10:43 AM."
                      : "Processing with the recipient’s bank."
                  : done
                    ? "Today, 10:44 AM"
                    : "Usually within a few minutes."}
            </FinanceText>
          </View>
        </View>
      ))}
    </Stack>
  );
}
export function PaymentCard() {
  const [frozen, setFrozen] = useState(false),
    [reveal, setReveal] = useState(false),
    c = useFinanceTheme();
  return (
    <Stack>
      <Card
        style={{
          backgroundColor: frozen ? c["surface-secondary"] : c["accent-soft"],
          padding: tokens.padding.card,
          gap: sp[6],
          opacity: 1,
        }}
      >
        <Row>
          <FinanceText tone="accent-soft-foreground" kind="subtitle">
            Finance UI
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
          {reveal ? "4242 4242 4242 2841" : "•••• •••• •••• 2841"}
        </FinanceText>
        <Row>
          <FinanceText tone="muted" kind="caption">
            Alex Morgan
          </FinanceText>
          <FinanceText tone="muted" kind="caption">
            08/29
          </FinanceText>
        </Row>
        <FinanceText tone="muted" kind="caption">
          Demo debit card
        </FinanceText>
      </Card>
      <Row>
        <FinanceText>Freeze card</FinanceText>
        <Switch
          hitSlop={12}
          accessibilityLabel="Freeze card"
          isSelected={frozen}
          onSelectedChange={setFrozen}
        />
      </Row>
      <Button variant="secondary" onPress={() => setReveal(!reveal)}>
        {reveal ? "Hide" : "Reveal"} demo number
      </Button>
    </Stack>
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
  const c = useFinanceTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      style={{
        flexDirection: "row",
        gap: sp[1],
        padding: sp[1],
        borderRadius: rad.md,
        backgroundColor: c["surface-secondary"],
      }}
    >
      {options.map((o) => (
        <Button
          key={o}
          variant="ghost"
          accessibilityRole="radio"
          accessibilityState={{ checked: value === o }}
          onPress={() => onChange(o)}
          style={{
            flex: 1,
            borderRadius: rad.xs,
            backgroundColor: value === o ? c.surface : "transparent",
          }}
        >
          <FinanceText kind="label">{o}</FinanceText>
        </Button>
      ))}
    </View>
  );
}
export function LineChart({ period = "Week" }: { period?: string }) {
  const c = useFinanceTheme(),
    data =
      period === "Week"
        ? [120, 180, 90, 230, 160, 310, 260]
        : [540, 700, 620, 810, 760, 980, 870],
    max = Math.max(...data) * 1.15;
  return (
    <View
      accessible
      accessibilityLabel={`${period} spending. Values: ${data.join(", ")}`}
    >
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
          points={data
            .map((n, i) => `${i * 48 + 8},${130 - (n / max) * 110}`)
            .join(" ")}
          stroke={c["chart-1"]}
          strokeWidth={3}
          fill="none"
        />
        {data.map((n, i) => (
          <Circle
            key={i}
            cx={i * 48 + 8}
            cy={130 - (n / max) * 110}
            r={3}
            fill={c["chart-1"]}
          />
        ))}
      </Svg>
      <FinanceText kind="caption" tone="muted">
        {data.join(" · ")}
      </FinanceText>
    </View>
  );
}
export function SpendingSummary({ currency = "USD" }: { currency?: string }) {
  const [p, setP] = useState("Week");
  return (
    <Card>
      <Stack>
        <Row>
          <FinanceText kind="subtitle">Spending</FinanceText>
          <SegmentedControl value={p} onChange={setP} />
        </Row>
        <MoneyText
          minor={p === "Week" ? 135000 : 598000}
          currency={currency}
          large
        />
        <FinanceText kind="caption" tone="muted">
          {p === "Week" ? "This week" : "This month"} · 12% less than last
          period
        </FinanceText>
        <LineChart period={p} />
      </Stack>
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
  const c = useFinanceTheme(),
    v = Math.max(0, Math.min(100, value));
  return (
    <Stack>
      <Row>
        <FinanceText kind="label">{label}</FinanceText>
        <FinanceText kind="label">{v}%</FinanceText>
      </Row>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: v }}
        style={{
          height: 8,
          borderRadius: rad.xs,
          backgroundColor: c["surface-tertiary"],
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 8,
            width: `${v}%`,
            backgroundColor: c["chart-1"],
            borderRadius: rad.xs,
          }}
        />
      </View>
    </Stack>
  );
}
export function LimitMeter({ currency = "USD" }: { currency?: string }) {
  const [v, setV] = useState(65);
  return (
    <Card>
      <Stack>
        <FinanceText kind="subtitle">Monthly transfer limit</FinanceText>
        <Row>
          <MoneyText minor={v * 10000} currency={currency} />
          <FinanceText tone="muted" kind="caption">
            of {formatMoney(1000000, currency)}
          </FinanceText>
        </Row>
        <ProgressMeter value={v} />
        <FinanceText kind="caption" tone="muted">
          {formatMoney((100 - v) * 10000, currency)} remaining
        </FinanceText>
        <Slider
          value={v}
          onChange={(value) => setV(Number(value))}
          minValue={0}
          maxValue={100}
          accessibilityLabel="Adjust used limit"
        >
          <Label>Adjust used limit</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </Stack>
    </Card>
  );
}
export function VerificationStatus({
  status = "default",
}: {
  status?: string;
}) {
  const [requested, setRequested] = useState(false),
    done = status === "completed";
  return (
    <Card>
      <Stack>
        <FinanceText kind="subtitle">
          {done
            ? "Identity verified"
            : requested
              ? "Verification submitted"
              : status === "error"
                ? "Verification needs attention"
                : "Verify your identity"}
        </FinanceText>
        <FinanceText kind="body-small" tone="muted">
          {done
            ? "Your demo account is ready."
            : requested
              ? "Demo status: in review. No documents were uploaded."
              : "Confirm your details to unlock higher transfer limits."}
        </FinanceText>
        {!done && !requested && (
          <Button onPress={() => setRequested(true)}>
            Start demo verification
          </Button>
        )}
      </Stack>
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
    <Stack>
      <View style={{ flexDirection: "row", gap: sp[3], alignItems: "center" }}>
        <Checkbox
          hitSlop={12}
          accessibilityLabel="I have checked the recipient and amount"
          isSelected={ack}
          onSelectedChange={setAck}
          isDisabled={disabled}
        />
        <FinanceText kind="body-small" style={{ flex: 1 }}>
          I’ve checked the recipient and amount
        </FinanceText>
      </View>
      <Button isDisabled={!ack || disabled} onPress={onConfirm}>
        Confirm demo transfer
      </Button>
      <FinanceText kind="caption" tone="muted">
        Demo only. No money will move.
      </FinanceText>
    </Stack>
  );
}
export function TransferReview({
  amount = "1000.00",
  currency = "USD",
}: {
  amount?: string;
  currency?: string;
}) {
  const [sent, setSent] = useState(false),
    minor = parseMinor(amount, currency);
  return sent ? (
    <Receipt currency={currency} minor={minor ?? 0} />
  ) : (
    <Card>
      <Stack>
        <FinanceText kind="subtitle">Review transfer</FinanceText>
        <RecipientRow
          selected
          accountCurrency={currency === "GBP" ? "EUR" : "GBP"}
        />
        <ExchangeQuote amount={amount} currency={currency} />
        <FeeBreakdown minor={minor ?? 0} currency={currency} />
        <ConfirmationAction
          disabled={minor === null || minor <= 250}
          onConfirm={() => setSent(true)}
        />
      </Stack>
    </Card>
  );
}
export function EmptyState({ onAction = () => {} }: { onAction?: () => void }) {
  return (
    <View
      style={{ gap: sp[4], alignItems: "center", padding: tokens.padding.card }}
    >
      <FinanceText kind="subtitle">No transactions yet</FinanceText>
      <FinanceText tone="muted" kind="body-small">
        Transactions will appear here.
      </FinanceText>
      <Button variant="secondary" onPress={onAction}>
        Add demo transaction
      </Button>
    </View>
  );
}
export function Receipt({
  currency = "USD",
  status = "completed",
  minor = 100000,
}: {
  currency?: string;
  status?: string;
  minor?: number;
}) {
  return (
    <Card>
      <Stack>
        <FinanceText kind="subtitle">
          {status === "completed"
            ? "Transfer complete"
            : "Transfer in progress"}
        </FinanceText>
        <MoneyText minor={minor} currency={currency} large />
        <FinanceText tone="muted" kind="caption">
          To Jamie Chen · FIN-2026-1042
        </FinanceText>
        <Separator />
        <TransferTimeline status={status} />
      </Stack>
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
  onChange: (v: string) => void;
  currency?: string;
  disabled?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: sp[2] }}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => (
        <Button
          key={k}
          isDisabled={disabled}
          variant="tertiary"
          style={{
            width: "31%",
            flexGrow: 1,
            minHeight: 64,
            borderRadius: rad.sm,
          }}
          accessibilityLabel={
            k === "⌫" ? "Backspace" : k === "." ? "Decimal point" : k
          }
          onPress={() => {
            if (k === "⌫") return onChange(value.slice(0, -1) || "0");
            if (
              k === "." &&
              (value.includes(".") || currencyDigits(currency) === 0)
            )
              return;
            const next = (value === "0" && k !== "." ? "" : value) + k;
            if (parseMinor(next, currency) !== null) onChange(next);
          }}
        >
          <FinanceText kind="title">{k}</FinanceText>
        </Button>
      ))}
    </View>
  );
}
export function DatePicker() {
  const [date, setDate] = useState(new Date(2026, 9, 28)),
    [open, setOpen] = useState(false);
  return (
    <Stack>
      <FinanceText kind="label">Scheduled transfer date</FinanceText>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        {date.toLocaleDateString()}
      </Button>
      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          minimumDate={new Date(2026, 9, 25)}
          onChange={(_, d) => {
            if (Platform.OS === "android") setOpen(false);
            if (d) setDate(d);
          }}
        />
      )}
      {open && Platform.OS === "ios" && (
        <Button onPress={() => setOpen(false)}>Done</Button>
      )}
    </Stack>
  );
}
export function Stepper() {
  const [v, setV] = useState(1);
  return (
    <Stack>
      <FinanceText kind="label">Recurring interval, months</FinanceText>
      <Row>
        <Button
          accessibilityLabel="Decrease interval"
          variant="secondary"
          isDisabled={v <= 1}
          onPress={() => setV(v - 1)}
        >
          −
        </Button>
        <FinanceText accessibilityLiveRegion="polite">{v}</FinanceText>
        <Button
          accessibilityLabel="Increase interval"
          variant="secondary"
          isDisabled={v >= 12}
          onPress={() => setV(v + 1)}
        >
          +
        </Button>
      </Row>
      <FinanceText tone="muted" kind="caption">
        Every {v} {v === 1 ? "month" : "months"}
      </FinanceText>
    </Stack>
  );
}
export function DataTable({ currency = "USD" }: { currency?: string }) {
  const c = useFinanceTheme();
  return (
    <ScrollView horizontal>
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
        {txs.map((t) => (
          <View
            key={t.name}
            accessible
            accessibilityLabel={`${t.name}, ${t.status}, ${formatMoney(t.minor, currency)}`}
            style={s.row}
          >
            <FinanceText kind="body-small" style={{ width: 160 }}>
              {t.name}
            </FinanceText>
            <FinanceText kind="body-small" style={{ width: 100 }}>
              {t.status}
            </FinanceText>
            <MoneyText minor={t.minor} currency={currency} signed />
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
