import { z } from "zod";

export const createBabySchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio.").max(50),
  birthDate: z.coerce.date(),
  dueDate: z.coerce.date().nullable().optional(),
  photoUrl: z.string().trim().nullable().optional(),
  province: z.string().trim().nullable().optional(),
});
export type CreateBabyInput = z.infer<typeof createBabySchema>;
