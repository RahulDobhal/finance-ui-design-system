import { useState } from "react";
import * as H from "@heroui/react";
import { ArrowUpRight, Info } from "lucide-react";
import {
  CurrencySelector,
  RecipientRow,
  Toggle,
  TransactionList,
  type StoryProps,
} from "./finance";

// Browser adapters use the supported HeroUI React counterparts. Native exports live in native/base.ts.
export function BaseStory({ name, p }: { name: string; p: StoryProps }) {
  const [value, setValue] = useState(""),
    [checked, setChecked] = useState(true),
    [tab, setTab] = useState("activity");
  const disabled = p.state === "disabled";
  const field = (
    <H.TextField
      isDisabled={disabled}
      isInvalid={p.state === "error"}
      className="stack-sm"
    >
      <H.Label>Account name</H.Label>
      <H.Input
        placeholder="e.g. Everyday account"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <H.Description>Only you can see this name.</H.Description>
      {p.state === "error" && (
        <H.FieldError>Enter an account name.</H.FieldError>
      )}
    </H.TextField>
  );
  switch (name) {
    case "Button":
    case "LinkButton":
    case "PressableFeedback":
      return (
        <div className="stack">
          <div className="row wrap">
            <H.Button
              size={p.size}
              variant={
                p.variant === "ghost"
                  ? "ghost"
                  : p.variant === "secondary"
                    ? "secondary"
                    : p.variant === "tertiary"
                      ? "tertiary"
                      : "primary"
              }
              isDisabled={disabled || p.state === "loading"}
              onPress={() => p.notify("Primary button pressed")}
            >
              {p.state === "loading" ? (
                <H.Spinner size="sm" />
              ) : (
                <ArrowUpRight size={16} />
              )}
              Send money
            </H.Button>
            <H.Button
              size={p.size}
              variant="secondary"
              isDisabled={disabled}
              onPress={() => p.notify("Secondary button pressed")}
            >
              Add money
            </H.Button>
            <H.Button
              size={p.size}
              variant="tertiary"
              isDisabled={disabled}
              onPress={() => p.notify("Gray button pressed")}
            >
              Save draft
            </H.Button>
            <H.Button
              size={p.size}
              variant="ghost"
              isDisabled={disabled}
              onPress={() => p.notify("Ghost button pressed")}
            >
              Cancel
            </H.Button>
          </div>
          <H.Button
            variant="danger"
            isDisabled={disabled}
            onPress={() => p.notify("Destructive demo action selected")}
          >
            Remove recipient
          </H.Button>
        </div>
      );
    case "Accordion":
      return (
        <H.Accordion className="full">
          <H.Accordion.Item id="fees">
            <H.Accordion.Heading>
              <H.Accordion.Trigger>
                How do transfer fees work?
                <H.Accordion.Indicator />
              </H.Accordion.Trigger>
            </H.Accordion.Heading>
            <H.Accordion.Panel>
              <H.Accordion.Body>
                Every fee is shown before you confirm. This catalog uses
                illustrative amounts.
              </H.Accordion.Body>
            </H.Accordion.Panel>
          </H.Accordion.Item>
          <H.Accordion.Item id="time">
            <H.Accordion.Heading>
              <H.Accordion.Trigger>
                When will my transfer arrive?
                <H.Accordion.Indicator />
              </H.Accordion.Trigger>
            </H.Accordion.Heading>
            <H.Accordion.Panel>
              <H.Accordion.Body>
                Arrival depends on the currency, funding method and receiving
                bank.
              </H.Accordion.Body>
            </H.Accordion.Panel>
          </H.Accordion.Item>
        </H.Accordion>
      );
    case "Alert":
      return (
        <H.Alert
          status={
            p.state === "error"
              ? "danger"
              : p.state === "completed"
                ? "success"
                : "warning"
          }
        >
          <H.Alert.Indicator />
          <H.Alert.Content>
            <H.Alert.Title>
              {p.state === "error"
                ? "Transfer needs attention"
                : "Review your account details"}
            </H.Alert.Title>
            <H.Alert.Description>
              Check the recipient’s details before confirming your transfer.
            </H.Alert.Description>
          </H.Alert.Content>
        </H.Alert>
      );
    case "Avatar":
      return (
        <div className="row">
          <H.Avatar size="sm">
            <H.Avatar.Fallback>AM</H.Avatar.Fallback>
          </H.Avatar>
          <H.Avatar>
            <H.Avatar.Fallback>JC</H.Avatar.Fallback>
          </H.Avatar>
          <H.Avatar size="lg">
            <H.Avatar.Fallback>NS</H.Avatar.Fallback>
          </H.Avatar>
        </div>
      );
    case "BottomSheet":
    case "Dialog":
      return (
        <H.Modal>
          <H.Button isDisabled={disabled}>
            Open {name === "BottomSheet" ? "bottom sheet" : "dialog"}
          </H.Button>
          <H.Modal.Backdrop isDismissable>
            <H.Modal.Container
              placement={name === "BottomSheet" ? "bottom" : "center"}
            >
              <H.Modal.Dialog>
                <H.Modal.CloseTrigger />
                <H.Modal.Header>
                  <H.Modal.Heading>Confirm recipient</H.Modal.Heading>
                </H.Modal.Header>
                <H.Modal.Body>
                  <RecipientRow
                    selected
                    onPress={() => p.notify("Jamie Chen selected")}
                  />
                  <p className="small muted">
                    Double-check bank details before sending.
                  </p>
                </H.Modal.Body>
                <H.Modal.Footer>
                  <H.Button onPress={() => p.notify("Recipient confirmed")}>
                    Confirm recipient
                  </H.Button>
                </H.Modal.Footer>
              </H.Modal.Dialog>
            </H.Modal.Container>
          </H.Modal.Backdrop>
        </H.Modal>
      );
    case "Card":
      return (
        <H.Card className="full">
          <H.Card.Header>
            <H.Card.Title>Everyday account</H.Card.Title>
            <H.Card.Description>
              Your daily spending, in one place.
            </H.Card.Description>
          </H.Card.Header>
          <H.Card.Content>
            <div className="title-number">$12,845.00</div>
          </H.Card.Content>
          <H.Card.Footer>
            <H.Button onPress={() => p.notify("Account opened")}>
              View account
              <ArrowUpRight size={16} />
            </H.Button>
          </H.Card.Footer>
        </H.Card>
      );
    case "Checkbox":
    case "ControlField":
      return (
        <H.Checkbox
          isSelected={checked}
          onChange={setChecked}
          isDisabled={disabled}
        >
          <H.Checkbox.Content>
            <H.Checkbox.Control>
              <H.Checkbox.Indicator />
            </H.Checkbox.Control>
            <H.Label>Send me transfer notifications</H.Label>
          </H.Checkbox.Content>
        </H.Checkbox>
      );
    case "Chip":
      return (
        <div className="row wrap">
          {(["success", "warning", "danger", "accent"] as const).map((c, i) => (
            <H.Chip color={c} key={c}>
              {["Completed", "Pending", "Failed", "Scheduled"][i]}
            </H.Chip>
          ))}
        </div>
      );
    case "CloseButton":
      return (
        <div className="row between full">
          <span>Account information</span>
          <H.CloseButton
            isDisabled={disabled}
            onPress={() => p.notify("Close pressed")}
          />
        </div>
      );
    case "Input":
    case "TextField":
      return field;
    case "InputGroup":
      return (
        <H.TextField isDisabled={disabled} className="stack-sm">
          <H.Label>Transfer amount</H.Label>
          <H.InputGroup>
            <H.InputGroup.Prefix>$</H.InputGroup.Prefix>
            <H.InputGroup.Input
              aria-label="Transfer amount"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
            />
            <H.InputGroup.Suffix>USD</H.InputGroup.Suffix>
          </H.InputGroup>
          <H.Description>
            Currency adornments stay beside the value.
          </H.Description>
        </H.TextField>
      );
    case "Description":
      return (
        <div className="stack-sm">
          <H.Label>Transfer reference</H.Label>
          <H.Description>
            Use a reference the recipient will recognize.
          </H.Description>
        </div>
      );
    case "FieldError":
      return (
        <H.TextField isInvalid className="stack-sm">
          <H.Label>Account number</H.Label>
          <H.Input
            value={value || "123"}
            onChange={(e) => setValue(e.target.value)}
          />
          <H.FieldError>Enter a valid account number.</H.FieldError>
        </H.TextField>
      );
    case "InputOTP":
      return (
        <div className="stack">
          <H.Label>Enter your 6-digit code</H.Label>
          <H.InputOTP
            maxLength={6}
            value={value}
            onChange={setValue}
            isDisabled={disabled}
            aria-label="Verification code"
          >
            <H.InputOTP.Group>
              {Array.from({ length: 6 }, (_, i) => (
                <H.InputOTP.Slot key={i} index={i} />
              ))}
            </H.InputOTP.Group>
          </H.InputOTP>
          <span className="small muted">
            {value.length === 6
              ? "Demo code entered."
              : "A demo code field; no SMS is sent."}
          </span>
        </div>
      );
    case "Label":
      return (
        <H.Label>
          Account holder name <span className="danger">*</span>
        </H.Label>
      );
    case "ListGroup":
      return (
        <TransactionList
          currency={p.currency}
          onPress={() => p.notify("Transaction selected")}
        />
      );
    case "Menu":
      return (
        <H.Dropdown>
          <H.Button variant="secondary">Account actions</H.Button>
          <H.Dropdown.Popover>
            <H.Dropdown.Menu
              onAction={(key) => p.notify(String(key) + " selected")}
            >
              <H.Dropdown.Item id="Account details">
                Account details
              </H.Dropdown.Item>
              <H.Dropdown.Item id="Statements">
                Download statement
              </H.Dropdown.Item>
              <H.Dropdown.Item id="Rename">Rename account</H.Dropdown.Item>
            </H.Dropdown.Menu>
          </H.Dropdown.Popover>
        </H.Dropdown>
      );
    case "Popover":
      return (
        <H.Popover>
          <H.Button variant="secondary">
            <Info size={16} />
            About fees
          </H.Button>
          <H.Popover.Content>
            <H.Popover.Arrow />
            <H.Popover.Dialog>
              <H.Popover.Heading>Transparent pricing</H.Popover.Heading>
              <p className="small">
                You always see the total fee before confirming.
              </p>
            </H.Popover.Dialog>
          </H.Popover.Content>
        </H.Popover>
      );
    case "RadioGroup":
      return (
        <H.RadioGroup
          value={value || "bank"}
          onChange={setValue}
          isDisabled={disabled}
        >
          <H.Label>Pay with</H.Label>
          {[
            ["bank", "Bank transfer"],
            ["card", "Debit card"],
          ].map(([id, label]) => (
            <H.Radio key={id} value={id}>
              <H.Radio.Content>
                <H.Radio.Control>
                  <H.Radio.Indicator />
                </H.Radio.Control>
                <H.Label>{label}</H.Label>
              </H.Radio.Content>
            </H.Radio>
          ))}
        </H.RadioGroup>
      );
    case "ScrollShadow":
      return (
        <H.ScrollShadow className="scroll-demo">
          <TransactionList
            currency={p.currency}
            onPress={() => p.notify("Transaction selected")}
          />
          <TransactionList
            currency={p.currency}
            onPress={() => p.notify("Transaction selected")}
          />
        </H.ScrollShadow>
      );
    case "Slider":
      return (
        <H.Slider defaultValue={65} isDisabled={disabled} className="full">
          <H.Label>Spending limit</H.Label>
          <H.Slider.Output />
          <H.Slider.Track>
            <H.Slider.Fill />
            <H.Slider.Thumb />
          </H.Slider.Track>
        </H.Slider>
      );
    case "SearchField":
      return (
        <H.SearchField
          value={value}
          onChange={setValue}
          isDisabled={disabled}
          className="full"
        >
          <H.Label>Search transactions</H.Label>
          <H.SearchField.Group>
            <H.SearchField.SearchIcon />
            <H.SearchField.Input placeholder="Search name or reference" />
            <H.SearchField.ClearButton />
          </H.SearchField.Group>
          <H.Description>
            {value ? `Searching for “${value}”` : "Try searching for Jamie."}
          </H.Description>
        </H.SearchField>
      );
    case "Select":
      return (
        <CurrencySelector
          value={p.currency}
          onChange={p.setCurrency}
          disabled={disabled}
        />
      );
    case "Separator":
      return (
        <div className="stack full">
          <span>Transfer amount</span>
          <H.Separator />
          <span>Transfer fee</span>
        </div>
      );
    case "Skeleton":
    case "SkeletonGroup":
      return (
        <div className="stack full">
          <H.Skeleton className="skeleton-line" />
          <H.Skeleton className="skeleton-line short" />
          <H.Skeleton className="skeleton-block" />
        </div>
      );
    case "Spinner":
      return (
        <div className="row">
          <H.Spinner size="sm" />
          <H.Spinner />
          <H.Spinner size="lg" />
          <span className="muted small">Processing transfer…</span>
        </div>
      );
    case "Surface":
      return (
        <H.Surface className="surface-demo stack">
          <h3>A quiet surface</h3>
          <p className="muted">
            The foundation underneath cards and grouped content.
          </p>
        </H.Surface>
      );
    case "Switch":
      return (
        <div className="row between full">
          <H.Label>Allow online payments</H.Label>
          <Toggle
            label="Allow online payments"
            selected={checked}
            onChange={setChecked}
            disabled={disabled}
          />
        </div>
      );
    case "Tabs":
      return (
        <H.Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(String(key))}
          className="full"
        >
          <H.Tabs.ListContainer>
            <H.Tabs.List aria-label="Account view">
              <H.Tabs.Tab id="activity">
                Activity
                <H.Tabs.Indicator />
              </H.Tabs.Tab>
              <H.Tabs.Tab id="details">
                Details
                <H.Tabs.Indicator />
              </H.Tabs.Tab>
            </H.Tabs.List>
          </H.Tabs.ListContainer>
          <H.Tabs.Panel id="activity">
            <TransactionList
              currency={p.currency}
              onPress={() => p.notify("Transaction selected")}
            />
          </H.Tabs.Panel>
          <H.Tabs.Panel id="details">
            <p>GBP account · ending 2841</p>
          </H.Tabs.Panel>
        </H.Tabs>
      );
    case "TagGroup":
      return (
        <H.TagGroup selectionMode="multiple">
          <H.Label>Transaction categories</H.Label>
          <H.TagGroup.List>
            {["Shopping", "Transfers", "Income"].map((t) => (
              <H.Tag key={t} id={t}>
                {t}
              </H.Tag>
            ))}
          </H.TagGroup.List>
        </H.TagGroup>
      );
    case "Typography":
      return (
        <div className="stack">
          <h1 className="type-title">Money, made clear.</h1>
          <p className="type-body">
            A readable foundation for everyday finance.
          </p>
          <span className="type-caption muted">Updated a moment ago</span>
        </div>
      );
    case "TextArea":
      return (
        <H.TextField className="stack-sm">
          <H.Label>Payment note</H.Label>
          <H.TextArea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="What’s this payment for?"
            disabled={disabled}
          />
        </H.TextField>
      );
    case "Toast":
      return (
        <H.Button
          onPress={() => p.notify("Account details copied successfully")}
        >
          Show toast notification
        </H.Button>
      );
    default:
      return <p>No browser adapter available.</p>;
  }
}
