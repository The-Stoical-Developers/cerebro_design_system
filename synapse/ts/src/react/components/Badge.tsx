import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { tone, type ToneKey } from "../../tokens";

// CVA shim kept for consumers that import badgeVariants directly.
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-black hover:bg-secondary/80",
        destructive:
          "border-transparent bg-danger text-white hover:bg-danger/80",
        outline: "text-body dark:text-bodydark",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Design-system tone — overrides variant when provided. */
  tone?: ToneKey;
}

function Badge({ className, variant, tone: toneProp, style, ...props }: BadgeProps) {
  if (toneProp) {
    const t = tone(toneProp);
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-[7px] py-[2px]",
          "font-mono text-[0.6rem] uppercase tracking-wider",
          className
        )}
        style={{ color: t.color, background: t.bg, boxShadow: t.ring, ...style }}
        {...props}
      />
    );
  }
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      style={style}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
