import * as F from "../components/finance";
import { formatMoney, parseMinor } from "../design-system/money.mjs";
import type { TransferSnapshot } from "../design-system/finance-types";
import type { StoryProps } from "./types";
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
} from "./finance-fixtures";
import { useFinanceDemo } from "./useFinanceDemo";

export function downloadDemoReceipt(transfer: TransferSnapshot) {
  const { quote, recipient } = transfer;
  const text = `DEMO RECEIPT\nReference: ${quote.id}\n${formatMoney(quote.send.minor, quote.send.currency)} to ${recipient.name}\nStatus: Completed\nNo money moved.`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "demo-transfer-receipt.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function FinanceStory({ name, p }: { name: string; p: StoryProps }) {
  const d = useFinanceDemo();
  const minor = parseMinor(p.amount, p.currency) ?? 0;
  const quote = demoQuote(p.amount, p.currency),
    recipient = demoRecipient(quote.receive.currency);
  const disabled = p.state === "disabled";
  const notifySelection = (id: string) =>
    p.notify(`Transaction ${id} selected`);
  const dates = demoDates();
  switch (name) {
    case "MoneyText":
      return (
        <div className="stack center">
          <F.MoneyText
            minor={minor}
            currency={p.currency}
            hidden={p.hidden}
            className="balance-amount"
          />
          <F.MoneyText minor={-minor} currency={p.currency} signed />
          <F.MoneyText minor={minor} currency={p.currency} signed />
          <span className="micro muted">
            Tabular figures · integer minor units
          </span>
        </div>
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
        <div className="stack">
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
        </div>
      );
    case "BalanceCard":
      return (
        <F.BalanceCard
          balance={demoBalance(p.currency)}
          hidden={p.hidden}
          onHiddenChange={p.setHidden}
          description={`Available across your ${p.currency} accounts`}
          onTransfer={() =>
            p.notify(
              "Send money action · open the Send money pattern to try the full flow",
            )
          }
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
            await navigator.clipboard.writeText(value);
            p.notify("IBAN copied to clipboard");
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
          onDownload={() => downloadDemoReceipt(d.transfer!)}
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
    case "Receipt": {
      const transfer = demoReceipt(p.currency);
      return (
        <F.Receipt
          transfer={transfer}
          status={demoStatus(p.state)}
          reference="FIN-2026-1042"
          steps={demoTimeline(demoStatus(p.state))}
          onDownload={() => downloadDemoReceipt(transfer)}
        />
      );
    }
    case "NumericKeypad":
      return (
        <div className="stack">
          <F.MoneyText
            currency={p.currency}
            minor={minor}
            className="balance-amount"
          />
          <F.NumericKeypad
            value={p.amount}
            onChange={p.setAmount}
            currency={p.currency}
            disabled={disabled}
          />
        </div>
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
