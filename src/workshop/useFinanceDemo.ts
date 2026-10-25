import { useState } from "react";
import type { TransferSnapshot } from "../design-system/finance-types";
import { demoDates } from "./finance-fixtures";

/** State belongs to the demo host, not to exported financial components. */
export function useFinanceDemo() {
  const [selected, setSelected] = useState(false);
  const [period, setPeriod] = useState("Week");
  const [populated, setPopulated] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [used, setUsed] = useState(650000);
  const [date, setDate] = useState(() => demoDates().initial);
  const [interval, setInterval] = useState(1);
  const [requested, setRequested] = useState(false);
  const [transfer, setTransfer] = useState<TransferSnapshot | null>(null);
  return {
    selected,
    setSelected,
    period,
    setPeriod,
    populated,
    setPopulated,
    frozen,
    setFrozen,
    used,
    setUsed,
    date,
    setDate,
    interval,
    setInterval,
    requested,
    setRequested,
    transfer,
    setTransfer,
  };
}
