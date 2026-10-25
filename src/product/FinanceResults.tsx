import { useState } from "react";
import { Button, Card, Modal } from "@heroui/react";
import { ArrowRight, CalendarDays, ChevronRight, Plus } from "lucide-react";
import {
  AccountDetails,
  AmountInput,
  ExchangeQuote,
  BalanceCard,
  MoneyText,
  SpendingSummary,
  TransactionList,
} from "../index";
import { balance, transactions, upcoming } from "./fixtures";
import { previewQuote, spendingSummary, type ProductScreen } from "./model";

export function OverviewResult({
  navigate,
}: {
  navigate: (screen: ProductScreen) => void;
}) {
  const [hidden, setHidden] = useState(false);
  const [action, setAction] = useState<"request" | "add" | "convert" | null>(
    null,
  );
  return (
    <div className="product-result stack" aria-label="Account overview">
      <BalanceCard
        balance={balance}
        hidden={hidden}
        onHiddenChange={setHidden}
        description="Available in your USD account"
        onTransfer={() => navigate("Transfer")}
        onConvert={() => setAction("convert")}
        onRequest={() => setAction("request")}
        onAdd={() => setAction("add")}
      />
      <Card className="product-upcoming">
        <div className="row between">
          <h3>Coming up</h3>
          <CalendarDays className="muted" aria-hidden="true" />
        </div>
        {upcoming.map((bill) => (
          <div className="row between" key={bill.name}>
            <span>
              <strong>{bill.name}</strong>
              <small>{bill.date} · Scheduled</small>
            </span>
            <MoneyText {...bill.amount} />
          </div>
        ))}
      </Card>
      <Button
        type="button"
        variant="tertiary"
        className="full"
        onPress={() => navigate("Activity")}
      >
        View all activity
        <ArrowRight />
      </Button>
      <Modal.Backdrop
        isDismissable
        isOpen={action !== null}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="product-dialog">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {action === "convert"
                  ? "Convert between balances"
                  : action === "request"
                    ? "Receive money"
                    : "Add money by bank transfer"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {action === "convert" ? (
                <ConversionPreview />
              ) : (
                <>
                  <p className="small muted">
                    Use your account details to receive a transfer. These are
                    sample details for the preview.
                  </p>
                  <AccountDetails
                    account={{
                      holder: "Alex Morgan",
                      iban: "GB82 WEST 1234 5698 7654 32",
                      bic: "NWBKGB2L",
                    }}
                    onCopy={(value) => navigator.clipboard.writeText(value)}
                  />
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                className="full"
                onPress={() => setAction(null)}
              >
                Done
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}

function ConversionPreview() {
  const [amount, setAmount] = useState("100.00");
  const { quote, error } = previewQuote(
    amount,
    "own-gbp-balance",
    balance.minor,
  );
  return (
    <div className="stack">
      <p className="small muted">
        Preview USD to GBP for your own balances. No conversion is executed.
      </p>
      <AmountInput
        value={amount}
        onChange={setAmount}
        currency="USD"
        onCurrency={() => {}}
        currencies={["USD"]}
        availableBalance={balance}
        label="Convert from USD"
        error={!!error}
        errorMessage={error || undefined}
      />
      {quote && <ExchangeQuote quote={quote} />}
      <p className="micro muted">
        Illustrative rate. The displayed fee is included in your USD amount.
      </p>
    </div>
  );
}

export function SpendingResult() {
  const [period, setPeriod] = useState("Month");
  const [category, setCategory] = useState<string | null>(null);
  const summary = spendingSummary(transactions, period);
  const selected = summary.categories.find((item) => item.name === category);
  return (
    <div className="product-result stack" aria-label="Spending insight">
      <SpendingSummary
        amount={{ minor: summary.total, currency: "USD" }}
        period={period}
        onPeriodChange={(value) => {
          setPeriod(value);
          setCategory(null);
        }}
        periods={["Week", "Month"]}
        points={summary.points}
        description={
          period === "Week"
            ? "19–25 October · includes pending purchases"
            : "1–25 October · includes pending purchases"
        }
      />
      <Card className="product-categories">
        <div className="row between">
          <h3>By category</h3>
          <span className="micro muted">Tap to explore</span>
        </div>
        {summary.categories.map((item, index) => (
          <button
            className="product-category"
            type="button"
            key={item.name}
            onClick={() => setCategory(item.name)}
            aria-label={`View ${item.name} transactions`}
          >
            <span className="product-category-track" aria-hidden="true">
              <span
                style={{
                  width: `${(item.minor / summary.total) * 100}%`,
                  background: `var(--chart-${(index % 5) + 1})`,
                }}
              />
            </span>
            <span>{item.name}</span>
            <MoneyText minor={item.minor} currency="USD" />
            <ChevronRight aria-hidden="true" />
          </button>
        ))}
      </Card>
      <Modal.Backdrop
        isDismissable
        isOpen={!!selected}
        onOpenChange={(open) => {
          if (!open) setCategory(null);
        }}
      >
        <Modal.Container placement="bottom">
          <Modal.Dialog className="product-dialog">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{selected?.name}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {selected && (
                <>
                  <MoneyText
                    minor={selected.minor}
                    currency="USD"
                    className="title-number"
                  />
                  <TransactionList
                    items={summary.rows.filter(
                      (item) => item.category === selected.name,
                    )}
                  />
                </>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}

export function RecentActivityResult({
  navigate,
}: {
  navigate: (screen: ProductScreen) => void;
}) {
  return (
    <Card className="product-result stack">
      <h3>Recent activity</h3>
      <TransactionList items={transactions.slice(0, 4)} />
      <Button
        type="button"
        variant="tertiary"
        onPress={() => navigate("Activity")}
      >
        Search all activity
        <Plus />
      </Button>
    </Card>
  );
}
