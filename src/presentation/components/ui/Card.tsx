import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-neutral-200/60 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
      {...props}
    />
  );
}
