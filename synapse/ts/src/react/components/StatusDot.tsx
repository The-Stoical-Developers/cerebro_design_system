import * as React from "react";
import { cn } from "../../lib/cn";
import type { DotStatus } from "../../tokens";

const DOT_CLASSES: Record<DotStatus, string> = {
  idle: "bg-gray-400",
  queued: "bg-warning",
  running: "bg-secondary animate-pulse",
  done: "bg-success",
  error: "bg-danger",
};

export interface StatusDotProps {
  status?: DotStatus | string;
  /** Diameter in pixels (default 8). */
  size?: number;
  className?: string;
}

export function StatusDot({ status = "idle", size = 8, className }: StatusDotProps) {
  const cls = DOT_CLASSES[(status as DotStatus)] ?? DOT_CLASSES.idle;
  return (
    <span
      className={cn("inline-block shrink-0 rounded-full", cls, className)}
      style={{ width: size, height: size }}
    />
  );
}
