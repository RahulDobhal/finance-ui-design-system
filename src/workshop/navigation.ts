import {
  Layers3,
  Palette,
  Type,
  Ruler,
  Radius,
  Box,
  Zap,
  ShieldCheck,
} from "lucide-react";
import {
  foundationNames,
  baseNames,
  financeNames,
  extensionNames,
  chatNames,
  patternNames,
} from "../data/catalog";
import type { Section } from "./types";
export const iconMap: Record<string, typeof Palette> = {
  Overview: Layers3,
  Colors: Palette,
  Typography: Type,
  Spacing: Ruler,
  Radius: Radius,
  Elevation: Box,
  Motion: Zap,
  Accessibility: ShieldCheck,
};
export const groups: [Section, string[]][] = [
  ["Foundations", foundationNames],
  ["Primitives", baseNames],
  ["Finance", financeNames],
  ["Extensions", extensionNames],
  ["Chat", chatNames],
  ["Patterns", patternNames],
];
export const fromHash = () => {
  try {
    const [s, n] = decodeURIComponent(location.hash.slice(1)).split("/");
    const valid =
      groups.some(([group, names]) => group === s && names.includes(n)) ||
      (s === "Audit" && n === "Finance coverage") ||
      (s === "References" && n === "Benchmarks");
    return valid ? [s, n] : ["Foundations", "Overview"];
  } catch {
    return ["Foundations", "Overview"];
  }
};
