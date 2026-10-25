import { useId, useRef, useState, useEffect } from "react";
import { Button, Card } from "@heroui/react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import {
  AmountInput,
  ExchangeQuote,
  Receipt,
  RecipientRow,
  TransferReview,
  type TransferSnapshot,
} from "../index";
import { balance, recipients } from "./fixtures";
import { previewQuote } from "./model";

export function TransferFlow() {
  const [amount, setAmount] = useState("250.00");
  const [recipientId, setRecipientId] = useState(recipients[0].id);
  const [step, setStep] = useState<"edit" | "review" | "receipt">("edit");
  const [confirmed, setConfirmed] = useState<TransferSnapshot | null>(null);
  const recipient = recipients.find((item) => item.id === recipientId)!;
  const { error, quote } = previewQuote(amount, recipientId, balance.minor);
  const focusTarget = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const id = useId();
  useEffect(() => {
    if (previousStep.current !== step) {
      focusTarget.current?.focus({ preventScroll: true });
      focusTarget.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    }
    previousStep.current = step;
  }, [step]);
  function confirm(snapshot: TransferSnapshot) {
    setConfirmed(snapshot);
    setStep("receipt");
  }
  function download() {
    if (!confirmed) return;
    const text = `DEMO TRANSFER — no money moved\nTo: ${confirmed.recipient.name}\nSend: ${confirmed.quote.send.minor / 100} USD\nReceive: ${confirmed.quote.receive.minor / 100} GBP\nFee: ${confirmed.quote.fee.minor / 100} USD\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "demo-transfer-receipt.txt";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div
      className="product-result product-transfer stack"
      aria-label="Prepare a transfer"
    >
      <ol className="product-steps" aria-label="Transfer progress">
        {["Details", "Review", "Receipt"].map((label, index) => (
          <li
            key={label}
            aria-current={
              index === ["edit", "review", "receipt"].indexOf(step)
                ? "step"
                : undefined
            }
          >
            <span>
              {index < ["edit", "review", "receipt"].indexOf(step) ? (
                <Check aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <div
        ref={focusTarget}
        tabIndex={-1}
        className="product-flow-stage"
        aria-label={
          step === "edit"
            ? "Transfer details"
            : step === "review"
              ? "Review transfer"
              : "Demo receipt"
        }
      >
        {step === "edit" ? (
          <Card className="stack">
            <div>
              <h3>Who are you sending to?</h3>
              <p className="small muted">Choose a saved recipient</p>
            </div>
            <div role="group" aria-label="Recipient">
              {recipients.map((item) => (
                <RecipientRow
                  key={item.id}
                  recipient={item}
                  selected={recipientId === item.id}
                  onPress={() => setRecipientId(item.id)}
                />
              ))}
            </div>
            <AmountInput
              value={amount}
              onChange={setAmount}
              currency="USD"
              onCurrency={() => {}}
              currencies={["USD"]}
              availableBalance={balance}
              error={!!error}
              errorMessage={error || undefined}
            />
            {error ? (
              <span id={id} role="status" className="sr-only">
                {error}
              </span>
            ) : (
              quote && <ExchangeQuote quote={quote} />
            )}
            <p className="small muted row">
              <ShieldCheck aria-hidden="true" />
              Illustrative rate · $2.50 fee included
            </p>
            <Button
              type="button"
              className="full"
              isDisabled={!!error}
              aria-describedby={error ? id : undefined}
              onPress={() => setStep("review")}
            >
              Review transfer
              <ArrowRight />
            </Button>
          </Card>
        ) : step === "review" && quote ? (
          <div className="stack">
            <Button
              type="button"
              variant="ghost"
              className="product-back"
              onPress={() => setStep("edit")}
            >
              <ArrowLeft />
              Edit details
            </Button>
            <TransferReview
              quote={quote}
              recipient={recipient}
              onConfirm={confirm}
              confirmLabel="Confirm demo transfer"
              description="Preview only. No money will move."
            />
          </div>
        ) : (
          confirmed && (
            <div className="stack">
              <p className="product-confirmation" role="status">
                <Check aria-hidden="true" />
                Demo transfer confirmed. No money moved.
              </p>
              <Receipt
                transfer={confirmed}
                status="completed"
                reference="PREVIEW-1025"
                steps={[
                  {
                    id: "reviewed",
                    label: "Details confirmed",
                    detail: "Recipient and amount checked by you",
                    status: "completed",
                  },
                  {
                    id: "simulated",
                    label: "Preview complete",
                    detail: "A real transfer would be submitted here",
                    status: "completed",
                  },
                ]}
                onDownload={download}
              />
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setConfirmed(null);
                  setStep("edit");
                }}
              >
                Prepare another transfer
                <ArrowRight />
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
