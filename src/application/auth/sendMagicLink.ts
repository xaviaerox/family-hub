import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { emailSchema } from "@/shared/schemas/family";

export interface SendMagicLinkResult {
  ok: boolean;
  error?: string;
}

/**
 * Envía un magic link al email indicado. No requiere contraseña: el padre
 * solo necesita pulsar el enlace que le llega al correo (filosofía de
 * mínima fricción, RULES.md / VISIÓN DEL PRODUCTO).
 */
export async function sendMagicLink(
  supabase: TypedSupabaseClient,
  input: { email: string; redirectTo: string },
): Promise<SendMagicLinkResult> {
  const parsed = emailSchema.safeParse({ email: input.email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email inválido." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: input.redirectTo },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
