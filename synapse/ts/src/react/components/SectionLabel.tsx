import * as React from "react";
import { cn } from "../../lib/cn";

export interface SectionLabelProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const SectionLabel = React.forwardRef<HTMLHeadingElement, SectionLabelProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-body dark:text-bodydark",
        className
      )}
      {...props}
    />
  )
);
SectionLabel.displayName = "SectionLabel";

export { SectionLabel };
