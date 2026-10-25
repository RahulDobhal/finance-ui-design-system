import { createTransferQuote } from "../design-system/finance-model.mjs";
import { parseMinor } from "../design-system/money.mjs";
import type { ActivityItem } from "./fixtures";
import type { ChatMessage, ChatState } from "../design-system/chat";
import { initialChat } from "../design-system/chat-state.mjs";

export const productScreens = [
  "Assistant",
  "Spending",
  "Transfer",
  "Activity",
  "Cards",
] as const;
export type ProductScreen = (typeof productScreens)[number];
export type ConversationScreen = Exclude<ProductScreen, "Activity" | "Cards">;
export type ResultKind = "overview" | "spending" | "transfer" | "activity";
export function replyFor(text: string): { text: string; result?: ResultKind } {
  if (/send|transfer|jamie|sam|fee|convert/i.test(text))
    return {
      text: "Of course. Choose a recipient and amount below. I’ll show you the fee and what arrives before you confirm.",
      result: "transfer",
    };
  if (/spend|spent|where.*money|budget|subscription|categor/i.test(text))
    return {
      text: "Here’s where your money went in October. Your biggest category is home. Open a category to see the details.",
      result: "spending",
    };
  if (/transaction|activity|payment|history/i.test(text))
    return {
      text: "Here are your latest transactions. Select a payment to inspect its status and details.",
      result: "activity",
    };
  if (/balance|overview|check|money|bill/i.test(text))
    return {
      text: "You’re all caught up. You have $12,845 available, with $969.99 in bills coming up. Here’s the picture.",
      result: "overview",
    };
  return {
    text: "I can help you explore this sample account. Ask about your balance, spending, transactions, or preparing a transfer. This interactive preview uses fictional data.",
  };
}
export function startingConversation(screen: ConversationScreen): ChatState {
  const prompt =
    screen === "Spending"
      ? "Where did my money go this month?"
      : screen === "Transfer"
        ? "Help me send money to Jamie."
        : "Give me a quick money check-in.";
  const reply = replyFor(prompt);
  return {
    ...initialChat,
    status: "completed",
    stage: "completed",
    messages: [
      { id: "seed-user", role: "user", text: prompt },
      { id: "seed-agent", role: "agent", text: reply.text },
    ],
  };
}
export function resultForMessage(
  messages: readonly ChatMessage[],
  index: number,
) {
  const prompt = messages
    .slice(0, index)
    .reverse()
    .find((message) => message.role === "user");
  return prompt ? replyFor(prompt.text).result : undefined;
}
export function spendingSummary(
  items: readonly ActivityItem[],
  period: string,
) {
  const rows = items.filter(
    (item) =>
      item.amount.minor < 0 &&
      item.status !== "failed" &&
      (period !== "Week" || item.day >= 19),
  );
  const total = rows.reduce((sum, item) => sum - item.amount.minor, 0);
  const categories = [...new Set(rows.map((item) => item.category))]
    .map((name) => ({
      name,
      minor: rows
        .filter((item) => item.category === name)
        .reduce((sum, item) => sum - item.amount.minor, 0),
    }))
    .sort((a, b) => b.minor - a.minor);
  const starts =
    period === "Week" ? [19, 20, 21, 22, 23, 24, 25] : [1, 8, 15, 22];
  const points = starts.map((day, i) => ({
    label: `${day} Oct`,
    value:
      rows
        .filter((item) => item.day >= day && item.day < (starts[i + 1] ?? 32))
        .reduce((sum, item) => sum - item.amount.minor, 0) / 100,
  }));
  return { rows, total, categories, points };
}
export function filterActivity(
  items: readonly ActivityItem[],
  query: string,
  filter: string,
) {
  const needle = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      `${item.name} ${item.detail} ${item.category}`
        .toLowerCase()
        .includes(needle) &&
      (filter === "All" ||
        (filter === "Money in" && item.amount.minor > 0) ||
        (filter === "Money out" && item.amount.minor < 0) ||
        (filter === "Pending" && item.status === "pending")),
  );
}
export function previewQuote(
  amount: string,
  recipientId: string,
  available: number,
) {
  const minor = parseMinor(amount, "USD");
  if (minor === null || minor <= 250)
    return {
      error: "Enter an amount greater than the $2.50 fee.",
      quote: null,
    };
  if (minor > available)
    return {
      error: "This amount exceeds your available balance.",
      quote: null,
    };
  const quote = createTransferQuote({
    id: `preview-${recipientId}-${minor}`,
    send: { minor, currency: "USD" },
    fee: { minor: 250, currency: "USD" },
    to: "GBP",
    rate: { numerator: 83, denominator: 100 },
    expiresAt: null,
  });
  return { error: null, quote };
}
