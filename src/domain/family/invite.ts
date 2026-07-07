/**
 * Dominio puro de invitaciones. Sin dependencias de Supabase ni React
 * (RULES.md #2). La generación de código vive en application/ porque
 * requiere una fuente de aleatoriedad (efecto, no dominio puro).
 */
import type { FamilyRole } from "./types";

export interface FamilyInvite {
  id: string;
  familyId: string;
  code: string;
  role: FamilyRole;
  createdBy: string;
  expiresAt: Date;
  usedBy: string | null;
  usedAt: Date | null;
}

export function isInviteExpired(invite: Pick<FamilyInvite, "expiresAt">, now: Date): boolean {
  return invite.expiresAt.getTime() <= now.getTime();
}

export function isInviteUsed(invite: Pick<FamilyInvite, "usedAt">): boolean {
  return invite.usedAt !== null;
}

export function canRedeemInvite(
  invite: Pick<FamilyInvite, "expiresAt" | "usedAt">,
  now: Date,
): boolean {
  return !isInviteExpired(invite, now) && !isInviteUsed(invite);
}

/** Formato de invitación pensado para escribirse/leerse a mano por SMS o WhatsApp: sin ambigüedad visual (sin 0/O, 1/I/L). */
export const INVITE_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const INVITE_CODE_LENGTH = 8;
