import { Card } from "@heroui/react";
import { LimitMeter, PaymentCard, TransactionList } from "../index";
import { transactions } from "./fixtures";

export function CardsScreen() {
  const cardTransactions = transactions.filter(
    (item) => item.amount.minor < 0 && item.category !== "Home",
  );
  const spent = cardTransactions.reduce(
    (total, item) => total - item.amount.minor,
    0,
  );
  return (
    <div className="product-cards stack">
      <PaymentCard
        card={{
          id: "everyday",
          brand: "Everyday debit",
          maskedNumber: "•••• •••• •••• 4281",
          cardholder: "Alex Morgan",
          expiry: "10/29",
          description: "Virtual card",
        }}
        frozen={false}
      />
      <LimitMeter
        used={{ minor: spent, currency: "USD" }}
        limit={{ minor: 250000, currency: "USD" }}
        label="Monthly card spending"
      />
      <Card className="stack">
        <h3>Recent card activity</h3>
        <TransactionList items={cardTransactions.slice(0, 4)} />
      </Card>
    </div>
  );
}
