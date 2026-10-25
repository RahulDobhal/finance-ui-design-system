// @ts-check
import { activitySteps } from "../design-system/chat-state.mjs";

export const demoResponse =
  "Your sample transactions include transfers, card payments and subscriptions. Review the transaction list to see amounts and dates. This is a local interface demo; no account data was accessed.";
export const demoSuggestions = ["Review my spending", "Explain transfer fees"];
export const sampleSpending = {
  currency: "USD",
  items: [
    { id: "transfers", label: "Transfers", minor: 50000 },
    { id: "cards", label: "Card payments", minor: 12840 },
    { id: "subscriptions", label: "Subscriptions", minor: 1099 },
  ],
};
export const sampleSpendingTotal = sampleSpending.items.reduce(
  (sum, item) => sum + item.minor,
  0,
);

/** @param {string} query */
export function showsSpendingResult(query) {
  return /spend|transaction|review/i.test(query);
}

/**
 * Local workshop transport. Cleanup cancels all stages and the final response.
 * @param {{requestId: number, fail: boolean, onEvent: (event: import("../design-system/chat-state.mjs").ChatAction) => void}} options
 * @returns {() => void}
 */
export function startDemoResponse({ requestId, fail, onEvent }) {
  const timers = activitySteps
    .slice(1)
    .map((stage, index) =>
      setTimeout(
        () => onEvent({ type: "stage", id: requestId, stage }),
        (index + 1) * 900,
      ),
    );
  timers.push(
    setTimeout(
      () =>
        onEvent(
          fail
            ? { type: "fail", id: requestId }
            : { type: "complete", id: requestId, text: demoResponse },
        ),
      3600,
    ),
  );
  return () => timers.forEach(clearTimeout);
}
