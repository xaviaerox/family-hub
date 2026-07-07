import { describe, it, expect } from "vitest";
import { summarizeFeedingProgress } from "../progressSummary";
import type { FeedingEvent } from "../types";

function makeEvent(foodItemId: string, occurredAt: string): FeedingEvent {
  return { id: `e-${foodItemId}-${occurredAt}`, babyId: "b1", foodItemId, occurredAt: new Date(occurredAt), reaction: "none" };
}

describe("summarizeFeedingProgress", () => {
  it("cuenta alimentos únicos, no eventos totales", () => {
    const events = [
      makeEvent("f1", "2026-07-01"),
      makeEvent("f1", "2026-07-02"),
      makeEvent("f2", "2026-07-03"),
    ];
    const summary = summarizeFeedingProgress(events);
    expect(summary.totalFoodsIntroduced).toBe(2);
    expect(summary.totalEvents).toBe(3);
  });

  it("devuelve el evento más reciente", () => {
    const events = [makeEvent("f1", "2026-07-01"), makeEvent("f2", "2026-07-05")];
    const summary = summarizeFeedingProgress(events);
    expect(summary.lastEventAt?.toISOString().slice(0, 10)).toBe("2026-07-05");
  });

  it("maneja lista vacía sin errores", () => {
    const summary = summarizeFeedingProgress([]);
    expect(summary.totalFoodsIntroduced).toBe(0);
    expect(summary.totalEvents).toBe(0);
    expect(summary.lastEventAt).toBeNull();
  });
});
