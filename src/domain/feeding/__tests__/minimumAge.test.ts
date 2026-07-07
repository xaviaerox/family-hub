import { describe, it, expect } from "vitest";
import { checkMinimumAge } from "../minimumAge";

describe("checkMinimumAge", () => {
  it("ok=false y calcula días restantes si aún no llega a la edad mínima", () => {
    const result = checkMinimumAge({ minAgeDays: 180 }, 150);
    expect(result.ok).toBe(false);
    expect(result.daysRemaining).toBe(30);
  });

  it("ok=true exactamente en la edad mínima", () => {
    const result = checkMinimumAge({ minAgeDays: 180 }, 180);
    expect(result.ok).toBe(true);
    expect(result.daysRemaining).toBe(0);
  });

  it("ok=true por encima de la edad mínima", () => {
    const result = checkMinimumAge({ minAgeDays: 180 }, 200);
    expect(result.ok).toBe(true);
    expect(result.daysRemaining).toBe(0);
  });
});
