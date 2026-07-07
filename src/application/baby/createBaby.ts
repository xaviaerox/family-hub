import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { createBabySchema } from "@/shared/schemas/baby";

export interface CreateBabyResult {
  ok: boolean;
  babyId?: string;
  error?: string;
}

export async function createBaby(
  supabase: TypedSupabaseClient,
  input: { familyId: string; firstName: string; birthDate: string; dueDate?: string | null; photoUrl?: string | null; province?: string | null },
): Promise<CreateBabyResult> {
  const parsed = createBabySchema.safeParse({
    firstName: input.firstName,
    birthDate: input.birthDate,
    dueDate: input.dueDate || null,
    photoUrl: input.photoUrl || null,
    province: input.province || null,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { data, error } = await supabase
    .from("babies")
    .insert({
      family_id: input.familyId,
      first_name: parsed.data.firstName,
      birth_date: parsed.data.birthDate.toISOString().slice(0, 10),
      due_date: parsed.data.dueDate ? parsed.data.dueDate.toISOString().slice(0, 10) : null,
      photo_url: parsed.data.photoUrl || null,
      province: parsed.data.province || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "No se pudo crear el bebé." };
  }

  return { ok: true, babyId: data.id };
}
