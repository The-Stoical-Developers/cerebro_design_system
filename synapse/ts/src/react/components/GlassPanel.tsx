import * as React from "react";
import { cn } from "../../lib/cn";
import { tone, type ToneKey } from "../../tokens";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, applies a softer/lighter surface style. */
  soft?: boolean;
  /** Applies a tinted border/background matching the given tone. */
  tone?: ToneKey;
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, soft, tone: toneProp, style, ...props }, ref) => {
    let extraStyle: React.CSSProperties = {};
    if (toneProp) {
      const t = tone(toneProp);
      extraStyle = { borderColor: t.color, boxShadow: t.ring };
    }
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark",
          soft && "border-stroke/60 bg-whiten dark:border-strokedark/60 dark:bg-boxdark-2",
          "p-4",
          className
        )}
        style={{ ...extraStyle, ...style }}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
