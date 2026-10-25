// @ts-check

/** @typedef {"thinking" | "searching" | "analyzing" | "writing" | "completed" | "stopped" | "error"} Activity */
/** @typedef {{id: string, role: "user" | "agent", text: string}} ChatMessage */
/** @typedef {{messages: ChatMessage[], status: "idle" | "generating" | "completed" | "stopped" | "error", requestId: number, stage: Activity}} ChatState */
/**
 * @typedef {({type: "send", text: string} |
 * {type: "stage", id: number, stage: Activity} |
 * {type: "complete", id: number, text: string} |
 * {type: "fail", id: number} |
 * {type: "stop"} | {type: "retry"})} ChatAction
 */

/** Public operation status only; never private chain-of-thought. */
export const activityLabels = {
  thinking: "Thinking",
  searching: "Searching",
  analyzing: "Analyzing",
  writing: "Writing response",
  completed: "Completed",
  stopped: "Stopped",
  error: "Couldn’t finish",
};
/** @type {Activity[]} */
export const activitySteps = ["thinking", "searching", "analyzing", "writing"];
export const demoResponse =
  "Your sample transactions include transfers, card payments and subscriptions. Review the transaction list to see amounts and dates. This is a local interface demo; no account data was accessed.";
/** @type {ChatState} */
export const initialChat = {
  messages: [],
  status: "idle",
  requestId: 0,
  stage: "thinking",
};
/**
 * Request ids prevent a delayed completion from resurrecting a stopped/retried run.
 * This reducer is pure: transports, timers and rendering belong to its callers.
 * @param {ChatState} state
 * @param {ChatAction} action
 * @returns {ChatState}
 */
export function chatReducer(state, action) {
  switch (action.type) {
    case "send": {
      const text = action.text.trim();
      if (!text || state.status === "generating") return state;
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: `user-${state.requestId + 1}`, role: "user", text },
        ],
        status: "generating",
        stage: "thinking",
        requestId: state.requestId + 1,
      };
    }
    case "stage":
      return state.status === "generating" &&
        action.id === state.requestId &&
        activitySteps.includes(action.stage)
        ? { ...state, stage: action.stage }
        : state;
    case "complete":
      return state.status === "generating" && action.id === state.requestId
        ? {
            ...state,
            status: "completed",
            stage: "completed",
            messages: [
              ...state.messages,
              {
                id: `agent-${state.requestId}`,
                role: "agent",
                text: action.text,
              },
            ],
          }
        : state;
    case "fail":
      return state.status === "generating" && action.id === state.requestId
        ? { ...state, status: "error", stage: "error" }
        : state;
    case "stop":
      return state.status === "generating"
        ? { ...state, status: "stopped", stage: "stopped" }
        : state;
    case "retry":
      return ["error", "stopped"].includes(state.status)
        ? {
            ...state,
            status: "generating",
            stage: "thinking",
            requestId: state.requestId + 1,
          }
        : state;
    default:
      return state;
  }
}
