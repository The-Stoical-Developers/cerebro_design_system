import * as React from "react";
import { cn } from "../../lib/cn";
import { isDotStatus, type DotStatus } from "../../tokens";

const DOT_CLASSES: Record<DotStatus, string> = {
  idle: "bg-gray-400",
  queued: "bg-warning",
  running: "bg-secondary animate-pulse",
  done: "bg-success",
  error: "bg-danger",
};

/** Rendered for values outside DotStatus: visibly different from idle. */
const UNKNOWN_CLASS = "bg-transparent border border-dashed border-gray-400";

const warned = new Set<string>();

function warnUnknown(status: string) {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") return;
  if (warned.has(status)) return;
  warned.add(status);
  // eslint-disable-next-line no-console
  console.warn(`[synapse] StatusDot: unknown status "${status}"; expected one of idle|queued|running|done|error`);
}

export interface StatusDotProps {
  /** A DotStatus. Other strings are accepted but rendered as "unknown". */
  status?: DotStatus | string;
  /** Diameter in pixels (default 8). */
  size?: number;
  className?: string;
}

export function StatusDot({ status = "idle", size = 8, className }: StatusDotProps) {
  const known = isDotStatus(status);
  if (!known) warnUnknown(String(status));
  const cls = known ? DOT_CLASSES[status] : UNKNOWN_CLASS;
  return (
    <span
      data-status={known ? status : "unknown"}
      data-raw-status={known ? undefined : String(status)}
      className={cn("inline-block shrink-0 rounded-full", cls, className)}
      style={{ width: size, height: size }}
    />
  );
}
