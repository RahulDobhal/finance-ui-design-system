import { useState, lazy, Suspense } from "react";
import {
  Box,
  Code2,
  Layers3,
  Smartphone,
  Monitor,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import {
  baseNames,
  extensionNames,
  chatNames,
  chatStates,
  componentTokens,
  compositions,
} from "../data/catalog";
import { BaseStory } from "./BaseStory";
import { FinanceStory } from "./finance";
import { ChatStory } from "./chat";
import type { Section, StoryProps } from "./types";
const Usage = lazy(() => import("./Usage"));
export function StoryPanel({
  name,
  section,
  p,
  logs,
  navigate,
  setState,
  setSize,
  setVariant,
}: {
  name: string;
  section: Section;
  p: StoryProps;
  logs: string[];
  navigate: (s: Section, n: string) => void;
  setState: (value: string) => void;
  setSize: (value: "sm" | "md" | "lg") => void;
  setVariant: (value: string) => void;
}) {
  const {
    currency,
    setCurrency,
    amount,
    setAmount,
    state,
    notify,
    setHidden,
    size,
    variant,
  } = p;
  const [tab, setTab] = useState("Preview"),
    [device, setDevice] = useState("mobile"),
    [reset, setReset] = useState(0);
  const mapping =
    section === "Primitives"
      ? componentTokens[name] || []
      : Array.from(
          new Set(
            (compositions[name] || []).flatMap(
              (n) =>
                componentTokens[n] || ["foreground", "spacing.4", "radius.lg"],
            ),
          ),
        );
  return (
    <>
      <div className="story-tabs">
        {["Preview", "Usage example", "Token mapping"].map((t) => (
          <button
            type="button"
            key={t}
            aria-pressed={tab === t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t === "Preview" ? (
              <Box size={14} />
            ) : t === "Usage example" ? (
              <Code2 size={14} />
            ) : (
              <Layers3 size={14} />
            )}{" "}
            {t}
          </button>
        ))}
        <span className="tab-spacer" />
        <span className="micro muted">
          {section === "Primitives"
            ? "HeroUI React adapter"
            : "Shared contract · browser implementation"}
        </span>
      </div>
      <div className="story-layout">
        <section className="story-canvas">
          <div className="canvas-toolbar">
            <span className="small muted">
              {name} / {state}
            </span>
            <div className="row">
              <button
                type="button"
                className={`icon-button ${device === "mobile" ? "selected" : ""}`}
                aria-label="Mobile preview width"
                aria-pressed={device === "mobile"}
                onClick={() => setDevice("mobile")}
              >
                <Smartphone size={16} />
              </button>
              <button
                type="button"
                className={`icon-button ${device === "wide" ? "selected" : ""}`}
                aria-label="Wide preview width"
                aria-pressed={device === "wide"}
                onClick={() => setDevice("wide")}
              >
                <Monitor size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Reset component"
                onClick={() => {
                  setReset((v) => v + 1);
                  setState(
                    section === "Chat" ? chatStates[name][0] : "default",
                  );
                  setAmount("1000.00");
                  setCurrency("USD");
                  setHidden(false);
                  notify("Component reset");
                }}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
          {tab === "Preview" ? (
            <div className={`story-stage ${device}`} key={name + reset}>
              <div
                className={`story-instance ${size} ${section === "Chat" ? "chat-instance" : ""}`}
              >
                {state === "loading" && section !== "Chat" ? (
                  <div
                    className="stack full"
                    role="status"
                    aria-label="Loading component"
                  >
                    <div className="loading-line" />
                    <div className="loading-line short" />
                    <div className="loading-block" />
                  </div>
                ) : section === "Primitives" ? (
                  <BaseStory name={name} p={p} />
                ) : section === "Chat" ? (
                  <ChatStory key={state} name={name} p={p} />
                ) : (
                  <FinanceStory name={name} p={p} />
                )}
              </div>
            </div>
          ) : tab === "Usage example" ? (
            <Suspense
              fallback={
                <p role="status" className="code-panel">
                  Loading source…
                </p>
              }
            >
              <Usage name={name} section={section} notify={notify} />
            </Suspense>
          ) : (
            <div className="mapping-panel">
              <h3>Semantic token contract</h3>
              <p className="small muted">
                These roles flow from the shared token source into the HeroUI
                theme.
              </p>
              <div className="token-chips">
                {mapping.map((k) => (
                  <code key={k}>{k}</code>
                ))}
              </div>
              <h3>Composed from</h3>
              <div className="composition-chain">
                {(compositions[name] || [name]).map((n, i) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() =>
                      navigate(
                        baseNames.includes(n)
                          ? "Primitives"
                          : extensionNames.includes(n)
                            ? "Extensions"
                            : chatNames.includes(n)
                              ? "Chat"
                              : "Finance",
                        n,
                      )
                    }
                  >
                    {i > 0 && <PlusMark />}
                    {n}
                    <ArrowUpRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="canvas-foot">
            <ShieldCheck size={13} />
            <span>
              Browser interaction preview. Native runtime verification is
              tracked separately.
            </span>
          </div>
        </section>
        <aside className="controls">
          <div className="controls-title">
            <SlidersHorizontal size={15} />
            <h3>Playground</h3>
          </div>
          <p className="small muted">Change the props. See the result.</p>
          <Control label="State">
            <select
              aria-label="Story state"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {(section === "Chat"
                ? chatStates[name]
                : [
                    "default",
                    "loading",
                    ...(name === "TransactionList" ? ["empty"] : []),
                    ...([
                      "Input",
                      "TextField",
                      "AmountInput",
                      "FieldError",
                      "VerificationStatus",
                      "Alert",
                      "TransferTimeline",
                    ].includes(name)
                      ? ["error"]
                      : []),
                    ...([
                      "TransferTimeline",
                      "Receipt",
                      "VerificationStatus",
                      "Alert",
                    ].includes(name)
                      ? ["pending", "completed"]
                      : []),
                    ...([
                      "Button",
                      "Input",
                      "TextField",
                      "AmountInput",
                      "CurrencySelector",
                      "Select",
                      "Checkbox",
                      "Switch",
                      "Slider",
                      "InputOTP",
                      "TransferReview",
                      "ConfirmationAction",
                      "SearchField",
                      "TextArea",
                    ].includes(name)
                      ? ["disabled"]
                      : []),
                  ]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Control>
          {[
            "MoneyText",
            "CurrencySelector",
            "AmountInput",
            "BalanceCard",
            "FeeBreakdown",
            "ExchangeQuote",
            "SpendingSummary",
            "LimitMeter",
            "TransferReview",
            "Receipt",
            "NumericKeypad",
            "Select",
          ].includes(name) && (
            <Control label="Currency">
              <select
                aria-label="Story currency"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setAmount("1000");
                }}
              >
                {["USD", "GBP", "EUR", "INR", "JPY", "KWD"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Control>
          )}
          {[
            "MoneyText",
            "AmountInput",
            "FeeBreakdown",
            "ExchangeQuote",
            "TransferReview",
            "NumericKeypad",
            "Receipt",
          ].includes(name) && (
            <Control label="Amount">
              <input
                aria-label="Story amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
              />
            </Control>
          )}
          {["Button", "LinkButton", "PressableFeedback"].includes(name) && (
            <>
              <Control label="Size">
                <select
                  aria-label="Story size"
                  value={size}
                  onChange={(e) =>
                    setSize(e.target.value as "sm" | "md" | "lg")
                  }
                >
                  {["sm", "md", "lg"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Control>
              <Control label="Variant">
                <select
                  aria-label="Story variant"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                >
                  {["primary", "secondary", "tertiary", "ghost"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Control>
            </>
          )}
          <div className="control-note">
            <Code2 size={15} />
            <p>
              Native source uses <code>heroui-native</code>. This browser uses
              its supported React counterpart.
            </p>
          </div>
          <div className="events">
            <h4>
              Interaction log <span>{logs.length}</span>
            </h4>
            {logs.length ? (
              logs.slice(0, 4).map((l, i) => <p key={i}>{l}</p>)
            ) : (
              <p className="muted">
                Interact with a component to see its events here.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
const PlusMark = () => <span className="muted">+</span>;
function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="prop-control">
      <span>{label}</span>
      {children}
    </label>
  );
}
