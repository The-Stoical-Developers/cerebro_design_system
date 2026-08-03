import * as React from "react";
import { cn } from "../../lib/cn";
import { tone, type ToneKey } from "../../tokens";

export interface MetricCellProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  tone?: ToneKey;
}

export function MetricCell({ label, value, tone: toneProp, className, ...props }: MetricCellProps) {
  const t = toneProp ? tone(toneProp) : null;
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-stroke bg-white p-3 shadow-default dark:border-strokedark dark:bg-boxdark",
        className
      )}
      {...props}
    >
      <span className="font-mono text-xs uppercase tracking-wider text-body dark:text-bodydark">
        {label}
      </span>
      <span
        className="text-xl font-semibold"
        style={t ? { color: t.color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
