import { useState } from "react";
import { Card, Label, Modal, SearchField } from "@heroui/react";
import {
  EmptyState,
  MoneyText,
  SegmentedControl,
  TransactionList,
} from "../index";
import { transactions } from "./fixtures";
import { filterActivity } from "./model";

export function ActivityScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = transactions.find((item) => item.id === selectedId);
  const rows = filterActivity(transactions, query, filter);
  return (
    <div className="product-activity stack">
      <SearchField value={query} onChange={setQuery}>
        <Label>Find a transaction</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Name, category or payment" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <SegmentedControl
        label="Transaction filter"
        options={["All", "Money in", "Money out", "Pending"]}
        value={filter}
        onChange={setFilter}
      />
      <Card className="product-activity-list">
        <div className="row between">
          <h2>October 2026</h2>
          <span role="status" className="micro muted">
            {rows.length} {rows.length === 1 ? "transaction" : "transactions"}
          </span>
        </div>
        {rows.length ? (
          <TransactionList items={rows} onItemPress={setSelectedId} />
        ) : (
          <EmptyState
            title="No matches"
            description="Try a different name or clear your filters."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery("");
              setFilter("All");
            }}
          />
        )}
      </Card>
      <Modal.Backdrop
        isDismissable
        isOpen={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <Modal.Container placement="bottom">
          <Modal.Dialog className="product-dialog">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Transaction details</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {selected && (
                <div className="stack">
                  <div className="product-detail-avatar">
                    {selected.initials}
                  </div>
                  <h3>{selected.name}</h3>
                  <MoneyText
                    {...selected.amount}
                    signed
                    className="title-number"
                  />
                  <dl className="product-detail-list">
                    <div>
                      <dt>Status</dt>
                      <dd>
                        {selected.status === "pending"
                          ? "Pending"
                          : "Completed"}
                      </dd>
                    </div>
                    <div>
                      <dt>Category</dt>
                      <dd>{selected.category}</dd>
                    </div>
                    <div>
                      <dt>Date</dt>
                      <dd>{selected.day} October 2026</dd>
                    </div>
                    <div>
                      <dt>Reference</dt>
                      <dd className="money">
                        DEMO-{selected.id.toUpperCase()}
                      </dd>
                    </div>
                  </dl>
                  <p className="small muted">
                    {selected.status === "pending"
                      ? "The merchant has authorized this payment. It has not settled yet."
                      : "This payment is complete in your sample account."}
                  </p>
                </div>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
