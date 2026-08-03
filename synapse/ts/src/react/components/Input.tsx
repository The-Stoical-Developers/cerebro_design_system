import * as React from "react";
import { cn } from "../../lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
