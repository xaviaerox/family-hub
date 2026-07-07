import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";
import { inviteRoleSchema } from "@/shared/schemas/family";
import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from "@/domain/family/invite";

export interface CreateInviteResult {
  ok: boolean;
  code?: string;
  error?: string;
}

/**
 * Genera un código de invitación aleatorio (efecto -> vive en application,
 * no en domain) y lo persiste. La policy `family_invites_insert_admins`
 * (ADR 0004) garantiza que solo creator/administrator puedan llegar aquí
 * con éxito; este caso de uso no necesita reimplementar esa comprobación.
 */
export async function createInvite(
  supabase: TypedSupabaseClient,
  input: { familyId: string; role: string; createdBy: string },
): Promise<CreateInviteResult> {
  const parsedRole = inviteRoleSchema.safeParse(input.role);
  if (!parsedRole.success) {
    return { ok: false, error: "Rol de invitación inválido." };
  }

  const code = generateInviteCode();

  const { error } = await supabase.from("family_invites").insert({
    family_id: input.familyId,
    code,
    role: parsedRole.data,
    created_by: input.createdBy,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, code };
}

function generateInviteCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(INVITE_CODE_LENGTH));
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[bytes[i]! % INVITE_CODE_ALPHABET.length];
  }
  return code;
}
