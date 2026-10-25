// @ts-check

/** @param {string} code */
export const currencyDigits = (code) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
  }).resolvedOptions().maximumFractionDigits ?? 2;
/**
 * Parse an unsigned, ungrouped decimal amount. Invalid user input returns null.
 * @param {string | number} value
 * @param {string} [currency]
 * @returns {number | null}
 */
export function parseMinor(value, currency = "USD") {
  const precision = currencyDigits(currency);
  const text = String(value).trim();
  if (
    !new RegExp(`^\\d+(?:\\.\\d{0,${precision}})?$`).test(text) ||
    (precision === 0 && text.includes("."))
  )
    return null;
  const [whole, fraction = ""] = text.split(".");
  const result =
    BigInt(whole) * 10n ** BigInt(precision) +
    BigInt(fraction.padEnd(precision, "0") || "0");
  return result <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(result) : null;
}
/**
 * Format exact minor units without rounding them through a floating-point major value.
 * @param {number} minor
 * @param {string} [currency]
 * @param {string} [locale]
 * @param {boolean} [signed]
 */
export function formatMoney(
  minor,
  currency = "USD",
  locale = "en-US",
  signed = false,
) {
  if (!Number.isSafeInteger(minor))
    throw new TypeError("Money must use safe integer minor units");
  const digits = currencyDigits(currency);
  const scale = 10n ** BigInt(digits);
  const amount = BigInt(minor);
  const whole = amount / scale;
  const remainder = amount < 0n ? -(amount % scale) : amount % scale;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    signDisplay: signed && minor !== 0 ? "always" : "auto",
  });
  const fraction = new Intl.NumberFormat(locale, {
    useGrouping: false,
    minimumIntegerDigits: Math.max(1, digits),
  }).format(remainder);
  // Preserve the sign when the magnitude is smaller than one major unit.
  const integral = minor < 0 && whole === 0n ? -0 : whole;
  return formatter.formatToParts(integral)
    .map((part) => part.type === "fraction" ? fraction : part.value)
    .join("");
}
/**
 * Fee-inclusive quote with a rational FX rate and half-up rounding at the output.
 * Invalid inputs throw; amounts at or below the fee produce an invalid quote.
 * @param {number} sendMinor
 * @param {{feeMinor?: number, rateNumerator?: number, rateDenominator?: number, from?: string, to?: string}} [options]
 */
export function makeQuote(
  sendMinor,
  {
    feeMinor = 250,
    rateNumerator = 83,
    rateDenominator = 100,
    from = "USD",
    to = "GBP",
  } = {},
) {
  if (
    ![sendMinor, feeMinor, rateNumerator, rateDenominator].every(
      Number.isSafeInteger,
    ) ||
    sendMinor < 0 ||
    feeMinor < 0 ||
    rateNumerator <= 0 ||
    rateDenominator <= 0
  )
    throw new TypeError("Invalid quote inputs");
  const net = Math.max(0, sendMinor - feeMinor);
  const numerator =
    BigInt(net) * BigInt(rateNumerator) * 10n ** BigInt(currencyDigits(to));
  const denominator =
    BigInt(rateDenominator) * 10n ** BigInt(currencyDigits(from));
  const received = Number((numerator + denominator / 2n) / denominator);
  if (!Number.isSafeInteger(received))
    throw new RangeError("Quote exceeds safe integer range");
  return {
    sendMinor,
    feeMinor,
    receiveMinor: received,
    from,
    to,
    valid: sendMinor > feeMinor,
  };
}
/**
 * Contrast ratio for opaque six-digit sRGB colors. Not an alpha compositor.
 * @param {string} a
 * @param {string} b
 */
export function contrast(a, b) {
  /** @param {string} h */
  const lum = (h) => {
    if (!/^#[\da-f]{6}$/i.test(h))
      throw new TypeError("Contrast requires six-digit hex colors");
    const v = [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)]
      .map((x) => parseInt(x, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const x = lum(a),
    y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
