import type { FeedingEvent, FoodItem } from "./types";

export const THREE_DAY_RULE_WINDOW_DAYS = 3;

export interface ThreeDayRuleCheck {
  ok: boolean;
  /** Alimentos alergénicos introducidos por primera vez dentro de la ventana, que motivan esperar. */
  conflictingFoodNames: string[];
  waitUntil: Date | null;
}

/**
 * Regla de los tres días: si un alimento tiene algún alérgeno, no debe ser
 * la primera vez que el bebé prueba un alimento alergénico si ya probó
 * otro por primera vez en los últimos 3 días — para poder atribuir
 * cualquier reacción a un único alimento nuevo.
 *
 * Alimentos ya tolerados (no es su primera vez) no cuentan para el
 * cómputo: la regla es solo sobre introducciones nuevas.
 */
export function checkThreeDayRule(
  candidateFood: Pick<FoodItem, "id" | "name" | "allergenIds">,
  allPastEvents: FeedingEvent[],
  allFoodsById: Map<string, Pick<FoodItem, "id" | "name" | "allergenIds">>,
  now: Date,
): ThreeDayRuleCheck {
  const candidateHasAllergens = candidateFood.allergenIds.length > 0;
  const isFirstExposureToCandidate = !allPastEvents.some(
    (e) => e.foodItemId === candidateFood.id,
  );

  if (!candidateHasAllergens || !isFirstExposureToCandidate) {
    return { ok: true, conflictingFoodNames: [], waitUntil: null };
  }

  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - THREE_DAY_RULE_WINDOW_DAYS);

  const firstExposureFoodIds = new Set<string>();
  const seenFoodIds = new Set<string>();
  const conflicting: { name: string; occurredAt: Date }[] = [];

  // Recorremos eventos ordenados cronológicamente para saber qué evento es
  // "primera vez" de cada alimento.
  const sorted = [...allPastEvents].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

  for (const event of sorted) {
    const isFirst = !seenFoodIds.has(event.foodItemId);
    seenFoodIds.add(event.foodItemId);

    if (
      isFirst &&
      event.foodItemId !== candidateFood.id &&
      event.occurredAt.getTime() >= windowStart.getTime() &&
      event.occurredAt.getTime() <= now.getTime()
    ) {
      const food = allFoodsById.get(event.foodItemId);
      if (food && food.allergenIds.length > 0) {
        firstExposureFoodIds.add(food.id);
        conflicting.push({ name: food.name, occurredAt: event.occurredAt });
      }
    }
  }

  if (conflicting.length === 0) {
    return { ok: true, conflictingFoodNames: [], waitUntil: null };
  }

  const mostRecent = conflicting.reduce((latest, c) =>
    c.occurredAt.getTime() > latest.occurredAt.getTime() ? c : latest,
  );
  const waitUntil = new Date(mostRecent.occurredAt);
  waitUntil.setDate(waitUntil.getDate() + THREE_DAY_RULE_WINDOW_DAYS);

  return {
    ok: false,
    conflictingFoodNames: conflicting.map((c) => c.name),
    waitUntil,
  };
}
