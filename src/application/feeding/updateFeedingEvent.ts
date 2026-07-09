import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { updateFeedingEventSchema } from "@/shared/schemas/feeding";

export interface UpdateFeedingEventResult {
  ok: boolean;
  error?: string;
}

/**
 * Actualiza un evento de alimentación (toma) existente.
 * Permite cambiar la reacción y añadir/modificar las observaciones.
 */
export async function updateFeedingEvent(
  supabase: TypedSupabaseClient,
  input: {
    eventId: string;
    reaction: "none" | "mild" | "moderate" | "severe";
    notes?: string | null;
  },
): Promise<UpdateFeedingEventResult> {
  const parsed = updateFeedingEventSchema.safeParse({
    eventId: input.eventId,
    reaction: input.reaction,
    notes: input.notes,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase
    .from("feeding_events")
    .update({
      reaction: parsed.data.reaction,
      notes: parsed.data.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.eventId);

  if (error) {
    return { ok: false, error: error.message ?? "No se pudo actualizar." };
  }

  return { ok: true };
}
