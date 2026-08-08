import React from "react";
import type { FoodToleranceStatus } from "@/domain/feeding/foodStatus";

interface FoodStatusCircleProps {
  status: FoodToleranceStatus | "accepted" | "mild" | "severe";
  size?: number;
  className?: string;
}

export function FoodStatusCircle({ status, size = 18, className = "" }: FoodStatusCircleProps) {
  // Normalize legacy status names
  const normalizedStatus: FoodToleranceStatus =
    status === "accepted"
      ? "tolerated"
      : status === "mild" || status === "severe"
      ? "reaction"
      : status;

  if (normalizedStatus === "trying") {
    // 🌓 Circulo semi relleno (Half filled: left half filled, right half outline)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 text-amber-500 dark:text-amber-400 ${className}`}
        aria-label="Alimento probando (1-2 tomas)"
      >
        <path d="M12 2.5a9.5 9.5 0 0 0 0 19V2.5z" fill="currentColor" />
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (normalizedStatus === "tolerated") {
    // 🌑 Circulo completo (Full circle: fully filled)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 text-emerald-600 dark:text-emerald-400 ${className}`}
        aria-label="Alimento probado y tolerado"
      >
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  if (normalizedStatus === "reaction") {
    // ⚠️ Reacción / Alerta
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 text-rose-500 dark:text-rose-400 ${className}`}
        aria-label="Reacción o alerta detectada"
      >
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="12" y1="7.5" x2="12" y2="12.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.25" fill="currentColor" />
      </svg>
    );
  }

  // Default: ⚪ Circulo en blanco (Outline only: untried)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 text-neutral-300 dark:text-neutral-600 ${className}`}
      aria-label="Alimento no probado"
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
