import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { getCorrectedAgeInDays } from "@/domain/baby/correctedAge";
import { checkMinimumAge, type MinimumAgeCheck } from "@/domain/feeding/minimumAge";
import { checkThreeDayRule, type ThreeDayRuleCheck } from "@/domain/feeding/threeDayRule";
import type { FeedingEvent, FoodItem } from "@/domain/feeding/types";

export interface FeedingRecommendation {
  ok: boolean;
  minimumAge: MinimumAgeCheck;
  threeDayRule: ThreeDayRuleCheck;
}

/**
 * Único punto que combina las tres reglas del motor de Alimentación
 * (edad mínima/corregida + regla de los 3 días). Cualquier pantalla que
 * necesite saber "¿puedo darle esto?" llama aquí, nunca reimplementa las
 * reglas por su cuenta.
 */
export async function getFeedingRecommendation(
  supabase: TypedSupabaseClient,
  input: { babyId: string; foodItemId: string; now?: Date },
): Promise<FeedingRecommendation | { error: string }> {
  const now = input.now ?? new Date();

  const { data: baby, error: babyError } = await supabase
    .from("babies")
    .select("birth_date, due_date")
    .eq("id", input.babyId)
    .single();
  if (babyError || !baby) return { error: "No se encontró el bebé." };

  const { data: candidateFoodRow, error: foodError } = await supabase
    .from("food_items")
    .select("id, name, min_age_days, food_allergens(allergen_id)")
    .eq("id", input.foodItemId)
    .single();
  if (foodError || !candidateFoodRow) return { error: "No se encontró el alimento." };

  const { data: pastEventsRaw, error: eventsError } = await supabase
    .from("feeding_events")
    .select("id, baby_id, food_item_id, occurred_at, reaction")
    .eq("baby_id", input.babyId)
    .is("deleted_at", null);
  if (eventsError) return { error: eventsError.message };

  const { data: allFoodsRaw, error: allFoodsError } = await supabase
    .from("food_items")
    .select("id, name, food_allergens(allergen_id)");
  if (allFoodsError) return { error: allFoodsError.message };

  const candidateFood: Pick<FoodItem, "id" | "name" | "allergenIds"> = {
    id: candidateFoodRow.id,
    name: candidateFoodRow.name,
    allergenIds: (candidateFoodRow.food_allergens ?? []).map((a) => a.allergen_id),
  };

  const allFoodsById = new Map(
    (allFoodsRaw ?? []).map((f) => [
      f.id,
      { id: f.id, name: f.name, allergenIds: (f.food_allergens ?? []).map((a) => a.allergen_id) },
    ]),
  );

  const pastEvents: FeedingEvent[] = (pastEventsRaw ?? []).map((e) => ({
    id: e.id,
    babyId: e.baby_id,
    foodItemId: e.food_item_id,
    occurredAt: new Date(e.occurred_at),
    reaction: e.reaction,
  }));

  const correctedAgeDays = getCorrectedAgeInDays({
    birthDate: new Date(baby.birth_date),
    dueDate: baby.due_date ? new Date(baby.due_date) : null,
    reference: now,
  });

  const minimumAge = checkMinimumAge({ minAgeDays: candidateFoodRow.min_age_days }, correctedAgeDays);
  const threeDayRule = checkThreeDayRule(candidateFood, pastEvents, allFoodsById, now);

  return {
    ok: minimumAge.ok && threeDayRule.ok,
    minimumAge,
    threeDayRule,
  };
}
