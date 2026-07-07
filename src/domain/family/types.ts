/**
 * Tipos de dominio para Family. Sin dependencias de Supabase ni de React
 * (RULES.md #2): esto es dominio puro, no infraestructura ni presentación.
 */

export type FamilyRole = "creator" | "administrator" | "parent" | "caregiver" | "guest";

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyRole;
  invitedBy: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

/** Permisos derivados del rol. Vive aquí, no repartido en componentes. */
export function canManageMembers(role: FamilyRole): boolean {
  return role === "creator" || role === "administrator";
}

export function canEditData(role: FamilyRole): boolean {
  return role !== "guest";
}
