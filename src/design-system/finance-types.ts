/** Platform-independent data contracts. Amounts always carry their currency. */
export type Money = Readonly<{ minor: number; currency: string }>;
export type TransferStatus = "pending" | "completed" | "failed";
export type Transaction = Readonly<{
  id: string;
  name: string;
  detail: string;
  amount: Money;
  status: TransferStatus;
  initials?: string;
}>;
export type Recipient = Readonly<{
  id: string;
  name: string;
  accountCurrency: string;
  accountLast4: string;
  initials?: string;
}>;
export type BankAccount = Readonly<{
  holder: string;
  iban: string;
  bic: string;
}>;
export type PaymentCardData = Readonly<{
  id: string;
  brand: string;
  maskedNumber: string;
  number?: string;
  cardholder: string;
  expiry: string;
  description?: string;
}>;
export type TransferQuote = Readonly<{
  id: string;
  send: Money;
  fee: Money;
  receive: Money;
  rate: Readonly<{ numerator: number; denominator: number }>;
  expiresAt: number | null;
  valid: boolean;
}>;
/** A reviewed snapshot, not evidence that a payment executed. */
export type TransferSnapshot = Readonly<{
  quote: TransferQuote;
  recipient: Recipient;
  confirmedAt: number;
}>;
export type TimelineStep = Readonly<{
  id: string;
  label: string;
  detail: string;
  status: "completed" | "current" | "upcoming" | "failed";
}>;
export type ChartPoint = Readonly<{ label: string; value: number }>;
export type VerificationState =
  "unverified" | "pending" | "verified" | "failed";

export type CurrencySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  currencies: readonly string[];
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
};
export type AmountInputProps = {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  onCurrency: (currency: string) => void;
  currencies: readonly string[];
  availableBalance?: Money;
  disabled?: boolean;
  error?: boolean;
  label?: string;
};
export type BalanceCardProps = {
  balance: Money;
  hidden: boolean;
  onHiddenChange: (hidden: boolean) => void;
  onTransfer?: () => void;
  onRequest?: () => void;
  onAdd?: () => void;
  onConvert?: () => void;
  description?: string;
};
export type AccountDetailsProps = {
  account: BankAccount;
  onCopy?: (value: string) => Promise<void> | void;
};
export type PaymentCardProps = {
  card: PaymentCardData;
  frozen: boolean;
  onFrozenChange?: (frozen: boolean) => void;
  disabled?: boolean;
};
export type SegmentedControlProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  label?: string;
  disabled?: boolean;
};
export type SpendingSummaryProps = {
  amount: Money;
  period: string;
  onPeriodChange: (period: string) => void;
  periods: readonly string[];
  points: readonly ChartPoint[];
  description?: string;
};
export type LimitMeterProps = {
  used: Money;
  limit: Money;
  onUsedChange?: (minor: number) => void;
  label?: string;
  step?: number;
};
export type ConfirmationActionProps = {
  onConfirm: () => void;
  reviewKey: string;
  disabled?: boolean;
  label?: string;
  description?: string;
};
export type TransferReviewProps = {
  quote: TransferQuote;
  recipient: Recipient;
  onConfirm: (transfer: TransferSnapshot) => void;
  disabled?: boolean;
  confirmLabel?: string;
  description?: string;
};
export type ReceiptProps = {
  transfer: TransferSnapshot;
  status: TransferStatus;
  reference?: string;
  steps?: readonly TimelineStep[];
  onDownload?: () => void;
};
export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  label?: string;
  disabled?: boolean;
};
export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
};
