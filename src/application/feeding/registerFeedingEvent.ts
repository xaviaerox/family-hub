import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { registerFeedingEventSchema } from "@/shared/schemas/feeding";

export interface RegisterFeedingEventResult {
  ok: boolean;
  eventId?: string;
  error?: string;
}

/**
 * Registra el evento. El motor de reglas (getFeedingRecommendation) es un
 * paso previo e independiente: esta función no lo invoca ni lo repite,
 * porque la decisión de "avisar pero dejar decidir a los padres" pertenece
 * a la pantalla (VISIÓN DEL PRODUCTO: nunca obligar), no a esta capa.
 */
export async function registerFeedingEvent(
  supabase: TypedSupabaseClient,
  input: {
    babyId: string;
    foodItemId: string;
    occurredAt: Date;
    reaction?: "none" | "mild" | "moderate" | "severe";
    notes?: string;
    createdBy: string;
  },
): Promise<RegisterFeedingEventResult> {
  const parsed = registerFeedingEventSchema.safeParse({
    babyId: input.babyId,
    foodItemId: input.foodItemId,
    occurredAt: input.occurredAt,
    reaction: input.reaction ?? "none",
    notes: input.notes,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { data, error } = await supabase
    .from("feeding_events")
    .insert({
      baby_id: parsed.data.babyId,
      food_item_id: parsed.data.foodItemId,
      occurred_at: parsed.data.occurredAt.toISOString(),
      reaction: parsed.data.reaction,
      notes: parsed.data.notes ?? null,
      created_by: input.createdBy,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "No se pudo registrar." };
  }

  return { ok: true, eventId: data.id };
}
