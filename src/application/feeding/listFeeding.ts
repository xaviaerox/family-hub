import type { TypedSupabaseClient } from "@/infrastructure/supabase/database.types";

export interface Allergen {
  name: string;
  slug: string;
}

export interface FeedingHistoryEntry {
  occurredAt: string;
  reaction: string;
  notes: string | null;
}

export interface FoodOption {
  id: string;
  name: string;
  category: string;
  minAgeDays: number;
  allergens: Allergen[];
  status: "untried" | "accepted" | "mild" | "severe";
  history: FeedingHistoryEntry[];
}

export async function listFoodOptions(
  supabase: TypedSupabaseClient,
  babyId?: string,
): Promise<FoodOption[]> {
  let familyId: string | null = null;
  if (babyId) {
    const { data: baby } = await supabase
      .from("babies")
      .select("family_id")
      .eq("id", babyId)
      .maybeSingle();
    if (baby) {
      familyId = baby.family_id;
    }
  }

  let query = supabase
    .from("food_items")
    .select(`
      id,
      name,
      category,
      min_age_days,
      family_id,
      food_allergens (
        allergens (
          name,
          slug
        )
      )
    `)
    .is("deleted_at", null);

  if (familyId) {
    query = query.or(`family_id.is.null,family_id.eq.${familyId}`);
  } else {
    query = query.is("family_id", null);
  }

  const { data: foodItems } = await query
    .order("category")
    .order("name");

  if (!foodItems) return [];

  let eventsMap: Record<string, FeedingHistoryEntry[]> = {};
  if (babyId) {
    const { data: events } = await supabase
      .from("feeding_events")
      .select("food_item_id, occurred_at, reaction, notes")
      .eq("baby_id", babyId)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false });

    if (events) {
      for (const e of events) {
        const arr = eventsMap[e.food_item_id] ?? [];
        arr.push({
          occurredAt: e.occurred_at,
          reaction: e.reaction,
          notes: e.notes,
        });
        eventsMap[e.food_item_id] = arr;
      }
    }
  }

  return foodItems.map((item) => {
    const history = eventsMap[item.id] ?? [];
    
    let status: FoodOption["status"] = "untried";
    const latest = history[0];
    if (latest) {
      const latestReaction = latest.reaction;
      if (latestReaction === "none") {
        status = "accepted";
      } else if (latestReaction === "mild") {
        status = "mild";
      } else {
        status = "severe";
      }
    }

    const allergens: Allergen[] = [];
    if (Array.isArray(item.food_allergens)) {
      for (const fa of item.food_allergens) {
        if (fa && fa.allergens) {
          const rawAllergen = fa.allergens as unknown as { name: string; slug: string };
          allergens.push({
            name: rawAllergen.name,
            slug: rawAllergen.slug,
          });
        }
      }
    }

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      minAgeDays: item.min_age_days,
      allergens,
      status,
      history,
    };
  });
}

export interface RecentFeedingEvent {
  id: string;
  occurredAt: string;
  reaction: string;
  notes: string | null;
  foodItemId: string;
  foodName: string;
}

export async function listRecentFeedingEvents(
  supabase: TypedSupabaseClient,
  babyId: string,
  limit = 20,
): Promise<RecentFeedingEvent[]> {
  const { data } = await supabase
    .from("feeding_events")
    .select("id, occurred_at, reaction, notes, food_item_id, food_items(name)")
    .eq("baby_id", babyId)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((e) => ({
    id: e.id,
    occurredAt: e.occurred_at,
    reaction: e.reaction,
    notes: e.notes,
    foodItemId: e.food_item_id,
    foodName: (e.food_items as unknown as { name: string } | null)?.name ?? "—",
  }));
}
