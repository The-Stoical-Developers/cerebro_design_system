/**
 * Design token helpers of the Synapse design system (@cerebro/synapse).
 *
 * ToneKey  – colour palette identifiers used by Badge, MetricCell, etc.
 * DotStatus – semantic states used by StatusDot.
 * tone()   – maps a ToneKey to concrete colour values.
 */

export type ToneKey =
  | "emerald"
  | "cyan"
  | "amber"
  | "red"
  | "violet"
  | "sky"
  | "rose"
  | "indigo"
  | "orange";

export type DotStatus = "idle" | "queued" | "running" | "done" | "error";

export interface ToneValues {
  color: string;
  bg: string;
  ring: string;
}

const TONE_MAP: Record<ToneKey, ToneValues> = {
  emerald: {
    color: "#059669",
    bg: "oklch(0.97 0.03 160)",
    ring: "inset 0 0 0 1px oklch(0.85 0.09 160)",
  },
  cyan: {
    color: "#0891b2",
    bg: "oklch(0.97 0.03 210)",
    ring: "inset 0 0 0 1px oklch(0.85 0.06 210)",
  },
  amber: {
    color: "#b45309",
    bg: "oklch(0.97 0.06 80)",
    ring: "inset 0 0 0 1px oklch(0.85 0.1 80)",
  },
  red: {
    color: "#dc2626",
    bg: "oklch(0.97 0.03 25)",
    ring: "inset 0 0 0 1px oklch(0.85 0.08 25)",
  },
  violet: {
    color: "#7c3aed",
    bg: "oklch(0.97 0.03 290)",
    ring: "inset 0 0 0 1px oklch(0.85 0.07 290)",
  },
  sky: {
    color: "#0284c7",
    bg: "oklch(0.97 0.03 225)",
    ring: "inset 0 0 0 1px oklch(0.85 0.06 225)",
  },
  rose: {
    color: "#e11d48",
    bg: "oklch(0.97 0.03 10)",
    ring: "inset 0 0 0 1px oklch(0.85 0.07 10)",
  },
  indigo: {
    color: "#4f46e5",
    bg: "oklch(0.97 0.02 265)",
    ring: "inset 0 0 0 1px oklch(0.85 0.07 265)",
  },
  orange: {
    color: "#ea580c",
    bg: "oklch(0.97 0.05 55)",
    ring: "inset 0 0 0 1px oklch(0.85 0.1 55)",
  },
};

export function tone(key: ToneKey): ToneValues {
  return TONE_MAP[key] ?? TONE_MAP.cyan;
}
