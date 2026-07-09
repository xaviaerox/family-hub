import { z } from "zod";

export const registerFeedingEventSchema = z.object({
  babyId: z.string().uuid(),
  foodItemId: z.string().uuid(),
  occurredAt: z.coerce.date(),
  reaction: z.enum(["none", "mild", "moderate", "severe"]).default("none"),
  notes: z.string().trim().max(500).optional(),
});
export type RegisterFeedingEventInput = z.infer<typeof registerFeedingEventSchema>;

export const updateFeedingEventSchema = z.object({
  eventId: z.string().uuid(),
  reaction: z.enum(["none", "mild", "moderate", "severe"]),
  notes: z.string().trim().max(500).optional().nullable(),
});
export type UpdateFeedingEventInput = z.infer<typeof updateFeedingEventSchema>;

