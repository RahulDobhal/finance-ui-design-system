import { ArrowUpRight, ChartNoAxesColumn, CreditCard } from "lucide-react";
import { ChatThread } from "../index";
import {
  OverviewResult,
  SpendingResult,
  RecentActivityResult,
} from "./FinanceResults";
import { TransferFlow } from "./TransferFlow";
import { useProductChat } from "./useProductChat";
import {
  resultForMessage,
  type ConversationScreen as Conversation,
  type ProductScreen,
} from "./model";

export function ConversationScreen({
  screen,
  navigate,
}: {
  screen: Conversation;
  navigate: (screen: ProductScreen) => void;
}) {
  const { chat, draft, setDraft, send, stop, retry } = useProductChat(screen);
  return (
    <div className="product-conversation">
      {screen === "Assistant" && (
        <div className="product-suggestions" aria-label="Suggested tasks">
          <button type="button" onClick={() => navigate("Spending")}>
            <ChartNoAxesColumn aria-hidden="true" />
            <span>Explore spending</span>
            <ArrowUpRight aria-hidden="true" />
          </button>
          <button type="button" onClick={() => navigate("Cards")}>
            <CreditCard aria-hidden="true" />
            <span>View my card</span>
            <ArrowUpRight aria-hidden="true" />
          </button>
        </div>
      )}
      <ChatThread
        title=""
        messages={chat.messages}
        status={chat.status}
        activity={chat.stage}
        draft={draft}
        onDraftChange={setDraft}
        onSend={send}
        onStop={stop}
        onRetry={retry}
        renderResult={(_, index) => {
          const result = resultForMessage(chat.messages, index);
          return result === "overview" ? (
            <OverviewResult navigate={navigate} />
          ) : result === "spending" ? (
            <SpendingResult />
          ) : result === "transfer" ? (
            <TransferFlow />
          ) : result === "activity" ? (
            <RecentActivityResult navigate={navigate} />
          ) : null;
        }}
      />
    </div>
  );
}
