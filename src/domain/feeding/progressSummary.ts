import type { FeedingEvent } from "./types";

export interface FeedingProgressSummary {
  totalFoodsIntroduced: number;
  totalEvents: number;
  lastEventAt: Date | null;
}

/**
 * Resumen mínimo de progreso (Fase 1 del ROADMAP: "estadísticas básicas").
 * Deliberadamente simple: solo conteos, sin gráficas — ver RULES.md #13
 * (no añadir complejidad hasta que haya una necesidad real de más detalle).
 */
export function summarizeFeedingProgress(events: FeedingEvent[]): FeedingProgressSummary {
  const uniqueFoodIds = new Set(events.map((e) => e.foodItemId));
  const sorted = [...events].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  return {
    totalFoodsIntroduced: uniqueFoodIds.size,
    totalEvents: events.length,
    lastEventAt: sorted[0]?.occurredAt ?? null,
  };
}
