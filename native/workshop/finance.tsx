import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as F from "../finance";
import { parseMinor } from "../../src/design-system/money.mjs";
import { tokens } from "../../src/design-system/tokens";
import type { StoryProps } from "../../src/workshop/types";
import {
  demoAccount,
  demoBalance,
  demoCard,
  demoCurrencies,
  demoDates,
  demoPeriods,
  demoQuote,
  demoReceipt,
  demoRecipient,
  demoSpending,
  demoStatus,
  demoTimeline,
  demoTransactions,
} from "../../src/workshop/finance-fixtures";
import { useFinanceDemo } from "../../src/workshop/useFinanceDemo";

export function NativeFinanceStory({
  name,
  p,
}: {
  name: string;
  p: StoryProps;
}) {
  const d = useFinanceDemo(),
    minor = parseMinor(p.amount, p.currency) ?? 0;
  const quote = demoQuote(p.amount, p.currency),
    recipient = demoRecipient(quote.receive.currency),
    disabled = p.state === "disabled";
  const dates = demoDates(),
    notifySelection = (id: string) => p.notify(`Transaction ${id} selected`);
  switch (name) {
    case "MoneyText":
      return (
        <View style={{ gap: tokens.spacing[3] }}>
          <F.MoneyText
            minor={minor}
            currency={p.currency}
            hidden={p.hidden}
            large
          />
          <F.MoneyText minor={-minor} currency={p.currency} signed />
          <F.MoneyText minor={minor} currency={p.currency} signed />
        </View>
      );
    case "CurrencySelector":
      return (
        <F.CurrencySelector
          value={p.currency}
          onChange={p.setCurrency}
          currencies={demoCurrencies}
          disabled={disabled}
        />
      );
    case "AmountInput":
      return (
        <View style={{ gap: tokens.spacing[4] }}>
          <F.AmountInput
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
            onCurrency={p.setCurrency}
            currencies={demoCurrencies}
            availableBalance={demoBalance(p.currency)}
            error={p.state === "error"}
            disabled={disabled}
          />
          <F.NumericKeypad
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
            disabled={disabled}
          />
        </View>
      );
    case "BalanceCard":
      return (
        <F.BalanceCard
          balance={demoBalance(p.currency)}
          hidden={p.hidden}
          onHiddenChange={p.setHidden}
          description={`Available across your ${p.currency} accounts`}
          onTransfer={() => p.notify("Transfer · demo action")}
          onRequest={() => p.notify("Request money · demo action")}
          onAdd={() => p.notify("Add money · demo action")}
          onConvert={() => p.notify("Convert currency · demo action")}
        />
      );
    case "TransactionRow":
      return (
        <F.TransactionRow
          item={demoTransactions[0]}
          onPress={notifySelection}
        />
      );
    case "TransactionList":
      return (
        <F.TransactionList
          items={p.state === "empty" && !d.populated ? [] : demoTransactions}
          onItemPress={notifySelection}
          onEmptyAction={() => d.setPopulated(true)}
        />
      );
    case "RecipientRow":
      return (
        <F.RecipientRow
          recipient={recipient}
          selected={d.selected}
          onPress={() => d.setSelected(!d.selected)}
        />
      );
    case "AccountDetails":
      return (
        <F.AccountDetails
          account={demoAccount}
          onCopy={async (value) => {
            await Clipboard.setStringAsync(value);
            p.notify("IBAN copied");
          }}
        />
      );
    case "FeeBreakdown":
      return <F.FeeBreakdown quote={quote} />;
    case "ExchangeQuote":
      return <F.ExchangeQuote quote={quote} />;
    case "TransferTimeline":
      return <F.TransferTimeline steps={demoTimeline(demoStatus(p.state))} />;
    case "PaymentCard":
      return (
        <F.PaymentCard
          card={demoCard}
          frozen={d.frozen}
          onFrozenChange={(value) => {
            d.setFrozen(value);
            p.notify(value ? "Demo card frozen" : "Demo card unfrozen");
          }}
          disabled={disabled}
        />
      );
    case "SpendingSummary":
      return (
        <F.SpendingSummary
          {...demoSpending(d.period, p.currency)}
          period={d.period}
          onPeriodChange={d.setPeriod}
          periods={demoPeriods}
        />
      );
    case "LimitMeter":
      return (
        <F.LimitMeter
          used={{ minor: d.used, currency: p.currency }}
          limit={{ minor: 1000000, currency: p.currency }}
          onUsedChange={d.setUsed}
          step={10000}
        />
      );
    case "VerificationStatus":
      return (
        <F.VerificationStatus
          status={
            p.state === "completed"
              ? "verified"
              : p.state === "error"
                ? "failed"
                : d.requested
                  ? "pending"
                  : "unverified"
          }
          description={
            d.requested
              ? "Demo submitted. No documents were uploaded."
              : "Confirm your details to unlock higher transfer limits."
          }
          onAction={() => {
            d.setRequested(true);
            p.notify("Demo verification submitted");
          }}
        />
      );
    case "TransferReview":
      return d.transfer ? (
        <F.Receipt
          transfer={d.transfer}
          status="completed"
          reference={d.transfer.quote.id}
          steps={demoTimeline("completed", d.transfer.recipient.name)}
        />
      ) : (
        <F.TransferReview
          quote={quote}
          recipient={recipient}
          disabled={disabled}
          confirmLabel="Confirm demo transfer"
          description="Demo only. No money will move."
          onConfirm={(transfer) => {
            d.setTransfer(transfer);
            p.notify("Demo transfer confirmed");
          }}
        />
      );
    case "EmptyState":
      return d.populated ? (
        <F.TransactionList
          items={demoTransactions}
          onItemPress={notifySelection}
        />
      ) : (
        <F.EmptyState
          onAction={() => d.setPopulated(true)}
          actionLabel="Add demo transaction"
          description="Add a transaction to see spending and transfers in one place."
        />
      );
    case "Receipt":
      return (
        <F.Receipt
          transfer={demoReceipt(p.currency)}
          status={demoStatus(p.state)}
          reference="FIN-2026-1042"
          steps={demoTimeline(demoStatus(p.state))}
        />
      );
    case "NumericKeypad":
      return (
        <View style={{ gap: tokens.spacing[4] }}>
          <F.MoneyText currency={p.currency} minor={minor} large />
          <F.NumericKeypad
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
            disabled={disabled}
          />
        </View>
      );
    case "DatePicker":
      return (
        <F.DatePicker
          value={d.date}
          onChange={d.setDate}
          min={dates.min}
          disabled={disabled}
        />
      );
    case "ProgressMeter":
      return (
        <F.ProgressMeter
          value={p.state === "completed" ? 100 : 65}
          label="Monthly limit"
        />
      );
    case "LineChart":
      return (
        <F.LineChart
          points={demoSpending("Week", p.currency).points}
          label="Week spending"
        />
      );
    case "SegmentedControl":
      return (
        <F.SegmentedControl
          value={d.period}
          onChange={d.setPeriod}
          options={demoPeriods}
          disabled={disabled}
        />
      );
    case "Stepper":
      return (
        <F.Stepper
          value={d.interval}
          onChange={d.setInterval}
          min={1}
          max={12}
          label="Recurring interval, months"
          description={`Every ${d.interval} ${d.interval === 1 ? "month" : "months"}`}
          disabled={disabled}
        />
      );
    case "DataTable":
      return <F.DataTable items={demoTransactions} />;
    case "ConfirmationAction":
      return (
        <F.ConfirmationAction
          reviewKey="demo-confirmation"
          disabled={disabled}
          onConfirm={() => p.notify("Demo action confirmed · no money moved")}
          label="Confirm demo transfer"
          description="Demo only. No money will move."
        />
      );
    default:
      return null;
  }
}
