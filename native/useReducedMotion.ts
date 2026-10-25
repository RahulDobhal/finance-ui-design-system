import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
/** Start with motion disabled until the platform preference is known. */
export function useReducedMotion() {
  const [value, setValue] = useState(true);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setValue(v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setValue,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return value;
}
