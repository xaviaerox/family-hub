/**
 * Dominio puro de Alimentación. Sin dependencias de Supabase ni React
 * (RULES.md #2).
 */

export type ReactionSeverity = "none" | "mild" | "moderate" | "severe";

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  minAgeDays: number;
  allergenIds: string[];
}

export interface FeedingEvent {
  id: string;
  babyId: string;
  foodItemId: string;
  occurredAt: Date;
  reaction: ReactionSeverity;
}
