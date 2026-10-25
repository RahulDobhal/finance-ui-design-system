import { useState } from "react";
import { Button } from "@heroui/react";
import {
  ArrowRight,
  Home,
  CreditCard,
  Users,
  Grid2X2,
  ShieldCheck,
} from "lucide-react";
import { quoteProblem } from "../design-system/finance-model.mjs";
import type { TransferSnapshot } from "../design-system/finance-types";
import {
  BalanceCard,
  TransactionList,
  AmountInput,
  ExchangeQuote,
  TransferReview,
  TransferTimeline,
  Receipt,
  AccountDetails,
} from "../components/finance";
import { DemoChatThread } from "./chat";
import type { StoryProps } from "./types";
import {
  demoBalance,
  demoCurrencies,
  demoTransactions,
  demoQuote,
  demoRecipient,
  demoTimeline,
  demoAccount,
} from "./finance-fixtures";
import { FinanceStory, downloadDemoReceipt } from "./finance";
export function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone">
      <div className="phone-status">
        <b>9:41</b>
        <span className="phone-island" />
        <span>▴ ▴ ▰</span>
      </div>
      <div className="phone-screen">{children}</div>
      <div className="phone-home" />
    </div>
  );
}
export function AccountHome({
  p,
  onSend,
}: {
  p: StoryProps;
  onSend: () => void;
}) {
  const [active, setActive] = useState("Home");
  return (
    <div className="account-home">
      <div className="row between account-greeting">
        <div>
          <span className="small muted">Good morning,</span>
          <h3>Alex Morgan</h3>
        </div>
        <button
          type="button"
          className="profile-avatar"
          onClick={() => p.notify("Demo profile · Alex Morgan")}
        >
          AM
        </button>
      </div>
      <BalanceCard
        balance={demoBalance(p.currency)}
        hidden={p.hidden}
        onHiddenChange={p.setHidden}
        description={`Available across your ${p.currency} accounts`}
        onTransfer={onSend}
        onRequest={() => p.notify("Request money · demo action")}
        onAdd={() => p.notify("Add money · demo action")}
        onConvert={() => p.notify("Convert currency · demo action")}
      />
      <div className="row between activity-heading">
        <h3>Recent activity</h3>
        <button
          type="button"
          className="text-link"
          onClick={() => p.notify("Showing all four demo transactions")}
        >
          See all
        </button>
      </div>
      <TransactionList
        items={demoTransactions}
        onItemPress={() => p.notify("Transaction details selected")}
      />
      <div className="phone-nav">
        {[
          [Home, "Home"],
          [CreditCard, "Cards"],
          [Users, "Recipients"],
          [Grid2X2, "More"],
        ].map(([Icon, label]) => {
          const I = Icon as typeof Home;
          return (
            <button
              type="button"
              key={String(label)}
              className={active === label ? "active" : ""}
              onClick={() => {
                setActive(String(label));
                p.notify(String(label) + " demo navigation");
              }}
            >
              <I size={18} />
              <span>{String(label)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function Pattern({ name, p }: { name: string; p: StoryProps }) {
  const [step, setStep] = useState(0);
  const [transfer, setTransfer] = useState<TransferSnapshot | null>(null);
  const quote = demoQuote(p.amount, p.currency);
  const recipient = demoRecipient(quote.receive.currency);
  if (name === "Chat conversation")
    return (
      <div className="chat-pattern">
        <DemoChatThread />
      </div>
    );
  return (
    <div className="pattern-layout">
      <Phone>
        {name === "Account overview" ? (
          <AccountHome
            p={p}
            onSend={() =>
              p.notify("Choose Send money from the Patterns navigation")
            }
          />
        ) : (
          <div className="pattern-screen">
            <button
              type="button"
              className="text-link"
              onClick={() => setStep(Math.max(0, step - 1))}
            >
              ← Back
            </button>
            <h2>{name}</h2>
            {name === "Send money" ? (
              step === 0 ? (
                <div className="stack">
                  <AmountInput
                    currencies={demoCurrencies}
                    availableBalance={demoBalance(p.currency)}
                    value={p.amount}
                    onChange={p.setAmount}
                    currency={p.currency}
                    onCurrency={p.setCurrency}
                  />
                  <ExchangeQuote quote={quote} />
                  <Button
                    isDisabled={!!quoteProblem(quote, recipient)}
                    onPress={() => setStep(1)}
                  >
                    Review transfer
                    <ArrowRight size={16} />
                  </Button>
                  <p className="micro muted center">
                    Fixed demo rates · no real payments
                  </p>
                </div>
              ) : transfer ? (
                <Receipt
                  transfer={transfer}
                  status="completed"
                  reference={transfer.quote.id}
                  steps={demoTimeline("completed", transfer.recipient.name)}
                  onDownload={() => downloadDemoReceipt(transfer)}
                />
              ) : (
                <TransferReview
                  quote={quote}
                  recipient={recipient}
                  onConfirm={setTransfer}
                  confirmLabel="Confirm demo transfer"
                  description="Demo only. No money will move."
                />
              )
            ) : name === "Transaction details" ? (
              <div className="stack">
                <h3>Transfer to Jamie Chen</h3>
                <TransferTimeline steps={demoTimeline("pending")} />
                <AccountDetails
                  account={demoAccount}
                  onCopy={(value) => navigator.clipboard.writeText(value)}
                />
              </div>
            ) : name === "Card controls" ? (
              <FinanceStory name="PaymentCard" p={p} />
            ) : (
              <FinanceStory name="VerificationStatus" p={p} />
            )}
          </div>
        )}
      </Phone>
      <aside className="pattern-notes">
        <span className="section-label">Built from</span>
        <h2>Component composition</h2>
        <p className="muted">
          {name === "Send money"
            ? "Edit an amount, review the demo quote, acknowledge the recipient details and confirm. All values remain local."
            : name === "Account overview"
              ? "Balance, privacy, quick actions and transaction history share the same component contracts."
              : "Try the controls in the mobile viewport. Changes are local demo state."}
        </p>
        <div className="token-chips">
          {(name === "Send money"
            ? [
                "AmountInput",
                "CurrencySelector",
                "ExchangeQuote",
                "TransferReview",
                "ConfirmationAction",
              ]
            : name === "Account overview"
              ? ["BalanceCard", "TransactionList", "MoneyText"]
              : name === "Card controls"
                ? ["PaymentCard", "Switch", "Button"]
                : name === "Identity verification"
                  ? ["VerificationStatus", "Alert", "Button"]
                  : ["TransferTimeline", "AccountDetails"]
          ).map((n) => (
            <code key={n}>{n}</code>
          ))}
        </div>
        <div className="control-note">
          <ShieldCheck size={17} />
          <p>
            Illustrative UI only. No bank connection, live rates, identity
            service or payment processing.
          </p>
        </div>
      </aside>
    </div>
  );
}
