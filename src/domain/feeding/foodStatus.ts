/**
 * Estado de tolerancia de un alimento en la alimentación complementaria.
 * - untried: No probado (0 tomas) -> Círculo en blanco ⚪
 * - trying: En proceso / Probando (1 a 2 tomas sin reacción) -> Círculo semi relleno 🌓
 * - tolerated: Probado y tolerado (3+ tomas sin reacción) -> Círculo completo 🌑
 * - reaction: Reacción leve/moderada/grave detectada -> Alerta / Círculo especial ⚠️
 */
export type FoodToleranceStatus = "untried" | "trying" | "tolerated" | "reaction";

export interface FeedingHistoryItem {
  reaction: "none" | "mild" | "moderate" | "severe";
}

export function calculateFoodStatus(history: FeedingHistoryItem[]): FoodToleranceStatus {
  if (!history || history.length === 0) {
    return "untried";
  }

  const hasReaction = history.some((h) => h.reaction !== "none");
  if (hasReaction) {
    return "reaction";
  }

  if (history.length >= 3) {
    return "tolerated";
  }

  return "trying";
}
