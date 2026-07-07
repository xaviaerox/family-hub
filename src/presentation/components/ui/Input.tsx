import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-card border border-neutral-200 bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-500",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
