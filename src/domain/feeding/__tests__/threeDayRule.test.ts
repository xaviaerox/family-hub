import { describe, it, expect } from "vitest";
import { checkThreeDayRule } from "../threeDayRule";
import type { FeedingEvent, FoodItem } from "../types";

function food(id: string, name: string, allergenIds: string[]): Pick<FoodItem, "id" | "name" | "allergenIds"> {
  return { id, name, allergenIds };
}

function event(foodItemId: string, daysAgo: number, now: Date): FeedingEvent {
  const occurredAt = new Date(now);
  occurredAt.setDate(occurredAt.getDate() - daysAgo);
  return { id: `evt-${foodItemId}-${daysAgo}`, babyId: "baby-1", foodItemId, occurredAt, reaction: "none" };
}

describe("checkThreeDayRule", () => {
  const now = new Date("2026-07-06T12:00:00Z");

  it("ok=true si el alimento candidato no tiene alérgenos", () => {
    const candidate = food("f-pear", "Pera", []);
    const result = checkThreeDayRule(candidate, [], new Map(), now);
    expect(result.ok).toBe(true);
  });

  it("ok=true si el alimento ya fue introducido antes (no es primera vez)", () => {
    const candidate = food("f-egg", "Huevo", ["a-eggs"]);
    const events = [event("f-egg", 10, now)];
    const foodsById = new Map([[candidate.id, candidate]]);
    const result = checkThreeDayRule(candidate, events, foodsById, now);
    expect(result.ok).toBe(true);
  });

  it("ok=false si otro alimento alergénico se introdujo por primera vez hace 2 días", () => {
    const candidate = food("f-fish", "Pescado", ["a-fish"]);
    const otherFood = food("f-egg", "Huevo", ["a-eggs"]);
    const events = [event("f-egg", 2, now)];
    const foodsById = new Map([
      [candidate.id, candidate],
      [otherFood.id, otherFood],
    ]);

    const result = checkThreeDayRule(candidate, events, foodsById, now);
    expect(result.ok).toBe(false);
    expect(result.conflictingFoodNames).toContain("Huevo");
    expect(result.waitUntil).not.toBeNull();
  });

  it("ok=true si el conflicto ocurrió hace más de 3 días", () => {
    const candidate = food("f-fish", "Pescado", ["a-fish"]);
    const otherFood = food("f-egg", "Huevo", ["a-eggs"]);
    const events = [event("f-egg", 5, now)];
    const foodsById = new Map([
      [candidate.id, candidate],
      [otherFood.id, otherFood],
    ]);

    const result = checkThreeDayRule(candidate, events, foodsById, now);
    expect(result.ok).toBe(true);
  });

  it("ok=true si el otro alimento introducido reciente NO tiene alérgenos", () => {
    const candidate = food("f-fish", "Pescado", ["a-fish"]);
    const otherFood = food("f-banana", "Plátano", []);
    const events = [event("f-banana", 1, now)];
    const foodsById = new Map([
      [candidate.id, candidate],
      [otherFood.id, otherFood],
    ]);

    const result = checkThreeDayRule(candidate, events, foodsById, now);
    expect(result.ok).toBe(true);
  });
});
