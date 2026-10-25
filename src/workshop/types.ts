export type Section =
  | "Foundations"
  | "Primitives"
  | "Finance"
  | "Extensions"
  | "Chat"
  | "Patterns"
  | "Audit"
  | "References";

// Workshop controls only; reusable components expose their own focused props.
export type StoryProps = {
  currency: string;
  setCurrency: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  state: string;
  notify: (message: string) => void;
  hidden: boolean;
  setHidden: (value: boolean) => void;
  size: "sm" | "md" | "lg";
  variant: string;
};
