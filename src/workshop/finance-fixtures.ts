/** Fictional data for the workshop only. Reusable components never import this module. */
import {
  createTransferQuote,
  confirmTransfer,
  dateValue,
} from "../design-system/finance-model.mjs";
import { parseMinor } from "../design-system/money.mjs";
import type {
  BankAccount,
  ChartPoint,
  Money,
  PaymentCardData,
  Recipient,
  TimelineStep,
  Transaction,
  TransferStatus,
} from "../design-system/finance-types";

export const demoCurrencies = [
  "USD",
  "GBP",
  "EUR",
  "INR",
  "JPY",
  "KWD",
] as const;
export const demoPeriods = ["Week", "Month"] as const;
export const demoAccount: BankAccount = {
  holder: "Alex Morgan",
  iban: "GB82 WEST 1234 5698 7654 32",
  bic: "WESTGB2L",
};
export const demoCard: PaymentCardData = {
  id: "demo-card-2841",
  brand: "Finance UI",
  maskedNumber: "•••• •••• •••• 2841",
  number: "4242 4242 4242 2841",
  cardholder: "Alex Morgan",
  expiry: "08/29",
  description: "Demo debit card",
};
export const demoTransactions: readonly Transaction[] = [
  {
    id: "tx-1",
    name: "Alex Morgan",
    initials: "AM",
    detail: "Transfer received · Today",
    amount: { minor: 245000, currency: "USD" },
    status: "completed",
  },
  {
    id: "tx-2",
    name: "North Studio",
    initials: "NS",
    detail: "Card payment · Today",
    amount: { minor: -12840, currency: "USD" },
    status: "completed",
  },
  {
    id: "tx-3",
    name: "Jamie Chen",
    initials: "JC",
    detail: "Bank transfer · Yesterday",
    amount: { minor: -50000, currency: "USD" },
    status: "pending",
  },
  {
    id: "tx-4",
    name: "Spotify",
    initials: "S",
    detail: "Subscription · Yesterday",
    amount: { minor: -1099, currency: "USD" },
    status: "completed",
  },
];
export function demoBalance(currency: string): Money {
  const balances: Record<string, number> = {
    USD: 1284500,
    GBP: 1073200,
    EUR: 1180000,
    INR: 108892300,
    JPY: 1926750,
    KWD: 3945000,
  };
  return { minor: balances[currency] ?? 0, currency };
}
export function demoRecipient(currency = "GBP"): Recipient {
  return {
    id: `recipient-jamie-${currency}`,
    name: "Jamie Chen",
    initials: "JC",
    accountCurrency: currency,
    accountLast4: "2841",
  };
}
export function demoQuote(amount: string, currency: string) {
  return createTransferQuote({
    id: `demo-${currency}-${amount}`,
    send: { minor: parseMinor(amount, currency) ?? 0, currency },
    fee: { minor: 250, currency },
    to: currency === "GBP" ? "EUR" : "GBP",
    rate: { numerator: currency === "GBP" ? 119 : 83, denominator: 100 },
    expiresAt: null,
  });
}
export function demoReceipt(currency = "USD") {
  const quote = demoQuote("1000", currency);
  return confirmTransfer(
    quote,
    demoRecipient(quote.receive.currency),
    Date.UTC(2026, 9, 25, 10, 42),
  );
}
export function demoTimeline(
  status: TransferStatus,
  recipientName = "Jamie",
): readonly TimelineStep[] {
  return [
    {
      id: "created",
      label: "Transfer created",
      detail: "Today, 10:42 AM",
      status: "completed",
    },
    {
      id: "processing",
      label:
        status === "failed" ? "Transfer needs attention" : "Money on its way",
      detail:
        status === "failed"
          ? "Try another funding method."
          : status === "completed"
            ? "Completed at 10:43 AM."
            : "Processing with the recipient’s bank.",
      status:
        status === "failed"
          ? "failed"
          : status === "completed"
            ? "completed"
            : "current",
    },
    {
      id: "received",
      label:
        status === "completed"
          ? `Received by ${recipientName}`
          : "Estimated arrival",
      detail:
        status === "completed"
          ? "Today, 10:44 AM"
          : "Usually within a few minutes.",
      status: status === "completed" ? "completed" : "upcoming",
    },
  ];
}
export function demoSpending(period: string, currency: string) {
  const values =
    period === "Week"
      ? [120, 180, 90, 230, 160, 310, 260]
      : [540, 700, 620, 810, 760, 980, 870];
  const labels =
    period === "Week"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const points: ChartPoint[] = values.map((value, index) => ({
    label: labels[index],
    value,
  }));
  return {
    amount: { minor: period === "Week" ? 135000 : 598000, currency },
    points,
    description: `${period === "Week" ? "This week" : "This month"} · 12% less than last period`,
  };
}
export function demoDates() {
  const today = new Date(),
    later = new Date(today);
  later.setDate(later.getDate() + 3);
  return { min: dateValue(today), initial: dateValue(later) };
}
export function demoStatus(state: string): TransferStatus {
  return state === "completed" || state === "default"
    ? "completed"
    : state === "error"
      ? "failed"
      : "pending";
}
