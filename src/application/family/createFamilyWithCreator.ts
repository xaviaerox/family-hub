import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { createFamilySchema } from "@/shared/schemas/family";

export interface CreateFamilyResult {
  ok: boolean;
  familyId?: string;
  error?: string;
}

/**
 * Crea una familia y da de alta al usuario actual como 'creator'.
 * Dos inserts separados (no una función RPC) porque ambos están cubiertos
 * por policies RLS explícitas y auditables por separado
 * (ver ADR 0004: family_members_insert_creator). Si el segundo insert
 * fallara, la familia queda creada pero sin miembros: se limpia (best
 * effort) para no dejar registros huérfanos visibles al usuario.
 */
export async function createFamilyWithCreator(
  supabase: TypedSupabaseClient,
  input: { name: string; userId: string },
): Promise<CreateFamilyResult> {
  const parsed = createFamilySchema.safeParse({ name: input.name });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Nombre inválido." };
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({ name: parsed.data.name, created_by: input.userId })
    .select("id")
    .single();

  if (familyError || !family) {
    return { ok: false, error: familyError?.message ?? "No se pudo crear la familia." };
  }

  const { error: memberError } = await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: input.userId,
    role: "creator",
  });

  if (memberError) {
    await supabase.from("families").delete().eq("id", family.id);
    return { ok: false, error: memberError.message };
  }

  return { ok: true, familyId: family.id };
}
