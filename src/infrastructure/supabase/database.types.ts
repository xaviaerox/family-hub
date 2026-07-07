/**
 * Tipos generados desde el esquema real del proyecto Supabase `human`
 * (eu-west-1), schema `family_hub` — Family Hub vive aquí desde la
 * unificación de proyectos (ver ADR 0007). NO editar a mano.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  family_hub: {
    Tables: {
      allergens: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          source_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          source_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          source_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      babies: {
        Row: {
          birth_date: string
          created_at: string
          deleted_at: string | null
          due_date: string | null
          family_id: string
          first_name: string
          id: string
          updated_at: string
          photo_url: string | null
          province: string | null
        }
        Insert: {
          birth_date: string
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          family_id: string
          first_name: string
          id?: string
          updated_at?: string
          photo_url?: string | null
          province?: string | null
        }
        Update: {
          birth_date?: string
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          family_id?: string
          first_name?: string
          id?: string
          updated_at?: string
          photo_url?: string | null
          province?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "babies_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string
          deleted_at: string | null
          expires_at: string
          family_id: string
          id: string
          role: Database["family_hub"]["Enums"]["family_role"]
          updated_at: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          expires_at?: string
          family_id: string
          id?: string
          role?: Database["family_hub"]["Enums"]["family_role"]
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          expires_at?: string
          family_id?: string
          id?: string
          role?: Database["family_hub"]["Enums"]["family_role"]
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          deleted_at: string | null
          family_id: string
          id: string
          invited_by: string | null
          role: Database["family_hub"]["Enums"]["family_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          family_id: string
          id?: string
          invited_by?: string | null
          role?: Database["family_hub"]["Enums"]["family_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          family_id?: string
          id?: string
          invited_by?: string | null
          role?: Database["family_hub"]["Enums"]["family_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_events: {
        Row: {
          baby_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          food_item_id: string
          id: string
          notes: string | null
          occurred_at: string
          photo_url: string | null
          reaction: Database["family_hub"]["Enums"]["reaction_severity"]
          updated_at: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          food_item_id: string
          id?: string
          notes?: string | null
          occurred_at?: string
          photo_url?: string | null
          reaction?: Database["family_hub"]["Enums"]["reaction_severity"]
          updated_at?: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          food_item_id?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          photo_url?: string | null
          reaction?: Database["family_hub"]["Enums"]["reaction_severity"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_events_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_events_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
        ]
      }
      food_allergens: {
        Row: {
          allergen_id: string
          food_item_id: string
        }
        Insert: {
          allergen_id: string
          food_item_id: string
        }
        Update: {
          allergen_id?: string
          food_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_allergens_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
        ]
      }
      food_items: {
        Row: {
          category: string
          created_at: string
          deleted_at: string | null
          id: string
          min_age_days: number
          name: string
          source_id: string
          updated_at: string
          family_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          min_age_days: number
          name: string
          source_id: string
          updated_at?: string
          family_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          min_age_days?: number
          name?: string
          source_id?: string
          updated_at?: string
          family_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_measurements: {
        Row: {
          baby_id: string
          created_at: string
          deleted_at: string | null
          head_circumference_cm: number | null
          height_cm: number | null
          id: string
          measured_at: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          baby_id: string
          created_at?: string
          deleted_at?: string | null
          head_circumference_cm?: number | null
          height_cm?: number | null
          id?: string
          measured_at: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          baby_id?: string
          created_at?: string
          deleted_at?: string | null
          head_circumference_cm?: number | null
          height_cm?: number | null
          id?: string
          measured_at?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_measurements_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccine_logs: {
        Row: {
          baby_id: string
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          administered_at: string
          updated_at: string
          vaccine_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          administered_at: string
          updated_at?: string
          vaccine_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          administered_at?: string
          updated_at?: string
          vaccine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccine_logs_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
      development_milestone_logs: {
        Row: {
          baby_id: string
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          achieved_at: string
          updated_at: string
          milestone_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          achieved_at: string
          updated_at?: string
          milestone_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          achieved_at?: string
          updated_at?: string
          milestone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_milestone_logs_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_family_invite: { Args: { _code: string }; Returns: string }
    }
    Enums: {
      family_role: "creator" | "administrator" | "parent" | "caregiver" | "guest"
      reaction_severity: "none" | "mild" | "moderate" | "severe"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/** Alias único: usar SIEMPRE este tipo en vez de repetir el nombre del schema en cada archivo. */
export type TypedSupabaseClient = import("@supabase/supabase-js").SupabaseClient<
  Database,
  "family_hub"
>;
