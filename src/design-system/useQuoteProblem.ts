import { useEffect, useState } from "react";
import { quoteProblem } from "./finance-model.mjs";
import type { Recipient, TransferQuote } from "./finance-types";

/** Update expiry feedback while a review stays open; confirmation also checks the current time. */
export function useQuoteProblem(quote: TransferQuote, recipient?: Recipient) {
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    if (quote.expiresAt === null) return;
    const remaining = quote.expiresAt - Date.now();
    if (remaining <= 0) return;
    const timeout = setTimeout(
      () => setClock(Date.now()),
      Math.min(remaining, 2147483647),
    );
    return () => clearTimeout(timeout);
  }, [quote.expiresAt, clock]);
  return quoteProblem(quote, recipient);
}
