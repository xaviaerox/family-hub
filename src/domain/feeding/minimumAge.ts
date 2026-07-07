import type { FoodItem } from "./types";

export interface MinimumAgeCheck {
  ok: boolean;
  minAgeDays: number;
  ageDays: number;
  daysRemaining: number;
}

/**
 * Comprueba la edad mínima recomendada para un alimento. `ageDays` debe
 * calcularse ya con edad corregida cuando aplique
 * (ver src/domain/baby/correctedAge.ts) — esta función no lo recalcula,
 * solo compara, para no duplicar la lógica de corrección en dos sitios.
 */
export function checkMinimumAge(food: Pick<FoodItem, "minAgeDays">, ageDays: number): MinimumAgeCheck {
  const daysRemaining = Math.max(0, food.minAgeDays - ageDays);
  return {
    ok: ageDays >= food.minAgeDays,
    minAgeDays: food.minAgeDays,
    ageDays,
    daysRemaining,
  };
}
