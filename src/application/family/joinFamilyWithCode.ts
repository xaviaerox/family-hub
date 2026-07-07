import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { joinFamilySchema } from "@/shared/schemas/family";

export interface JoinFamilyResult {
  ok: boolean;
  familyId?: string;
  error?: string;
}

/**
 * Redime un código de invitación llamando al único RPC autorizado a
 * cruzar el límite de aislamiento entre familias (ver ADR 0004). Este
 * caso de uso no reimplementa validación de expiración/uso: esa lógica
 * vive exclusivamente en la función de base de datos para que no pueda
 * haber una segunda versión desincronizada en el cliente.
 */
export async function joinFamilyWithCode(
  supabase: TypedSupabaseClient,
  input: { code: string },
): Promise<JoinFamilyResult> {
  const parsed = joinFamilySchema.safeParse({ code: input.code });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Código inválido." };
  }

  const { data, error } = await supabase.rpc("accept_family_invite", {
    _code: parsed.data.code,
  });

  if (error) {
    const message = error.message.includes("INVALID_OR_EXPIRED_INVITE")
      ? "Este código no es válido o ha caducado."
      : error.message;
    return { ok: false, error: message };
  }

  return { ok: true, familyId: data as unknown as string };
}
