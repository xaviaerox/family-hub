import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

/**
 * Botón base del design system. Cualquier módulo futuro reutiliza este
 * componente en vez de estilar botones ad-hoc (RULES.md #3/#4).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-card px-5 py-3.5 text-[15px] font-medium transition-opacity active:opacity-70 disabled:opacity-40",
          variant === "primary" && "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
          variant === "secondary" &&
            "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white",
          variant === "ghost" && "bg-transparent text-neutral-600 dark:text-neutral-300",
          className,
        )}
        {...props}
      >
        {isLoading ? "Cargando…" : children}
      </button>
    );
  },
);
Button.displayName = "Button";
