import { z } from "zod";

/** Validación en el borde (RULES.md #6): todo formulario valida con Zod. */

export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
});
export type EmailInput = z.infer<typeof emailSchema>;

export const createFamilySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre de familia es demasiado corto.")
    .max(60, "El nombre de familia es demasiado largo."),
});
export type CreateFamilyInput = z.infer<typeof createFamilySchema>;

export const joinFamilySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(6, "El código no es válido.")
    .max(12, "El código no es válido."),
});
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;

export const inviteRoleSchema = z.enum(["administrator", "parent", "caregiver", "guest"]);
export type InviteRoleInput = z.infer<typeof inviteRoleSchema>;
