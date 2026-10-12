/**
 * Design token helpers of the Synapse design system (@cerebro/synapse).
 *
 * ToneKey  – colour palette identifiers used by Badge, MetricCell, etc.
 * DotStatus – semantic states used by StatusDot.
 * tone()   – maps a ToneKey to concrete colour values.
 *
 * Tone values are NOT defined here: they come from the Style Dictionary
 * output (generated/tokens/synapse_tones.ts, built from
 * tokens/components/tones.json), which is the single source of truth.
 */
import { SynapseTones } from "../generated/tokens/synapse_tones.js";

export const TONE_KEYS = [
  "emerald",
  "cyan",
  "amber",
  "red",
  "violet",
  "sky",
  "rose",
  "indigo",
  "orange",
] as const;

export type ToneKey = (typeof TONE_KEYS)[number];

export const DOT_STATUSES = ["idle", "queued", "running", "done", "error"] as const;

export type DotStatus = (typeof DOT_STATUSES)[number];

export function isDotStatus(value: unknown): value is DotStatus {
  return typeof value === "string" && (DOT_STATUSES as readonly string[]).includes(value);
}

export interface ToneValues {
  color: string;
  bg: string;
  ring: string;
}

function generatedTone(key: ToneKey): ToneValues {
  return {
    color: SynapseTones[`${key}Color`],
    bg: SynapseTones[`${key}Bg`],
    ring: SynapseTones[`${key}Ring`],
  };
}

/** Concrete (light) colour values for a tone, from the generated tokens. */
export function tone(key: ToneKey): ToneValues {
  return (TONE_KEYS as readonly string[]).includes(key) ? generatedTone(key) : generatedTone("cyan");
}

/**
 * Theme-aware tone values: references to the `--tone-*` CSS custom
 * properties emitted in synapse_theme.css (so `.dark` overrides apply),
 * with the generated value as fallback when the theme CSS is not loaded.
 */
export function toneVars(key: ToneKey): ToneValues {
  const k = (TONE_KEYS as readonly string[]).includes(key) ? key : "cyan";
  const fb = generatedTone(k);
  return {
    color: `var(--tone-${k}-color, ${fb.color})`,
    bg: `var(--tone-${k}-bg, ${fb.bg})`,
    ring: `var(--tone-${k}-ring, ${fb.ring})`,
  };
}
