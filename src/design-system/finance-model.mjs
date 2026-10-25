// @ts-check
import { currencyDigits, makeQuote, parseMinor } from "./money.mjs";
/** @typedef {import('./finance-types').Money} Money */
/** @typedef {import('./finance-types').TransferQuote} TransferQuote */
/** @typedef {import('./finance-types').Recipient} Recipient */
/** @typedef {import('./finance-types').TransferSnapshot} TransferSnapshot */

/** @param {Money} amount */
export function assertMoney(amount) {
  if (
    !Number.isSafeInteger(amount.minor) ||
    !/^[A-Z]{3}$/.test(amount.currency)
  )
    throw new TypeError(
      "Money requires safe integer minor units and an uppercase currency code",
    );
  currencyDigits(amount.currency);
}
/** @param {{id: string, send: Money, fee: Money, to: string, rate: {numerator: number, denominator: number}, expiresAt: number | null}} input
 * @returns {TransferQuote}
 */
export function createTransferQuote({ id, send, fee, to, rate, expiresAt }) {
  assertMoney(send);
  assertMoney(fee);
  if (
    !id ||
    send.currency !== fee.currency ||
    (expiresAt !== null && !Number.isFinite(expiresAt))
  )
    throw new TypeError(
      "Quote requires an ID, matching fee currency and valid expiry",
    );
  const result = makeQuote(send.minor, {
    from: send.currency,
    to,
    feeMinor: fee.minor,
    rateNumerator: rate.numerator,
    rateDenominator: rate.denominator,
  });
  const receive = { minor: result.receiveMinor, currency: to };
  assertMoney(receive);
  return Object.freeze({
    id,
    send: Object.freeze({ ...send }),
    fee: Object.freeze({ ...fee }),
    receive: Object.freeze(receive),
    rate: Object.freeze({ ...rate }),
    expiresAt,
    valid: result.valid,
  });
}
/** Rejects inconsistent or expired externally supplied quotes before confirmation.
 * @param {TransferQuote} quote
 * @param {Recipient} [recipient]
 * @param {number} [now]
 * @returns {string | null}
 */
export function quoteProblem(quote, recipient, now = Date.now()) {
  try {
    if (!Number.isFinite(now)) return "Invalid confirmation time.";
    const expected = createTransferQuote({
      ...quote,
      to: quote.receive.currency,
    });
    if (!quote.valid || !expected.valid) return "Amount must exceed the fee.";
    if (expected.receive.minor !== quote.receive.minor)
      return "Quote amounts do not match the rate.";
    if (quote.expiresAt !== null && quote.expiresAt <= now)
      return "This quote has expired. Request a new quote.";
    if (
      recipient &&
      (!recipient.id ||
        !recipient.name ||
        !recipient.accountLast4 ||
        recipient.accountCurrency !== quote.receive.currency)
    )
      return "The recipient account does not match this quote.";
    return null;
  } catch {
    return "This quote is invalid. Request a new quote.";
  }
}
/** Values are part of the key: reusing a quote ID cannot retain old acknowledgement.
 * @param {TransferQuote} quote
 * @param {Recipient} recipient
 */
export function reviewIdentity(quote, recipient) {
  return JSON.stringify([quote, recipient]);
}
/** @param {TransferQuote} quote @param {Recipient} recipient @param {number} [now]
 * @returns {TransferSnapshot}
 */
export function confirmTransfer(quote, recipient, now = Date.now()) {
  const problem = quoteProblem(quote, recipient, now);
  if (problem) throw new TypeError(problem);
  return Object.freeze({
    quote: createTransferQuote({ ...quote, to: quote.receive.currency }),
    recipient: Object.freeze({ ...recipient }),
    confirmedAt: now,
  });
}
/** @param {string} value @param {string} key @param {string} currency */
export function nextAmount(value, key, currency) {
  if (key === "⌫") return value.slice(0, -1) || "0";
  if (!/^[0-9.]$/.test(key)) return value;
  if (key === "." && (currencyDigits(currency) === 0 || value.includes(".")))
    return value;
  const next =
    ((value === "0" || value === "") && key !== "." ? "" : value || "0") + key;
  return parseMinor(next, currency) === null ? value : next;
}
/** null is an explicit indeterminate progress state. @param {number | null} value */
export function boundedProgress(value) {
  return value === null || !Number.isFinite(value)
    ? null
    : Math.min(100, Math.max(0, value));
}
/** @param {Money} used @param {Money} limit */
export function limitProgress(used, limit) {
  assertMoney(used);
  assertMoney(limit);
  if (used.currency !== limit.currency || used.minor < 0 || limit.minor <= 0)
    throw new TypeError(
      "Limit requires a positive limit and nonnegative usage in the same currency",
    );
  return Math.min(100, (used.minor / limit.minor) * 100);
}
/** @param {readonly import('./finance-types').ChartPoint[]} points */
export function chartGeometry(points) {
  if (points.some((point) => !Number.isFinite(point.value)))
    throw new TypeError("Chart values must be finite");
  const min = Math.min(0, ...points.map((point) => point.value));
  const max = Math.max(0, ...points.map((point) => point.value));
  const range = max - min || 1;
  return points.map((point, index) => ({
    x:
      points.length === 1
        ? 155
        : 8 + (index / Math.max(1, points.length - 1)) * 294,
    y: 130 - ((point.value - min) / (range * 1.15)) * 110,
  }));
}
/** Convert a local calendar date without UTC timezone shifts. @param {string} value */
export function localDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new TypeError("Date must be YYYY-MM-DD");
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    throw new TypeError("Invalid calendar date");
  return date;
}
/** @param {Date} date */
export function dateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** This interval control uses safe integers; fractional values need a decimal field.
 * @param {{value: number, min: number, max: number, step: number}} input
 */
export function assertStepper({ value, min, max, step }) {
  if (
    ![value, min, max, step].every(Number.isSafeInteger) ||
    step <= 0 ||
    min > max ||
    value < min ||
    value > max
  )
    throw new RangeError(
      "Stepper requires a positive integer step and a safe integer value within its bounds",
    );
}
