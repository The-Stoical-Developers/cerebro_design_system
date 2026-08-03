import * as React from "react";
import { cn } from "../../lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
