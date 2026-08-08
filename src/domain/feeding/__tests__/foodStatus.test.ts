import { describe, it, expect } from "vitest";
import { calculateFoodStatus } from "../foodStatus";

describe("calculateFoodStatus", () => {
  it("debe retornar 'untried' si no hay tomas registradas", () => {
    expect(calculateFoodStatus([])).toBe("untried");
  });

  it("debe retornar 'trying' si hay 1 o 2 tomas sin reacción", () => {
    expect(calculateFoodStatus([{ reaction: "none" }])).toBe("trying");
    expect(calculateFoodStatus([{ reaction: "none" }, { reaction: "none" }])).toBe("trying");
  });

  it("debe retornar 'tolerated' si hay 3 o más tomas sin reacción", () => {
    expect(
      calculateFoodStatus([
        { reaction: "none" },
        { reaction: "none" },
        { reaction: "none" },
      ])
    ).toBe("tolerated");

    expect(
      calculateFoodStatus([
        { reaction: "none" },
        { reaction: "none" },
        { reaction: "none" },
        { reaction: "none" },
      ])
    ).toBe("tolerated");
  });

  it("debe retornar 'reaction' si al menos una toma registró alguna reacción", () => {
    expect(calculateFoodStatus([{ reaction: "mild" }])).toBe("reaction");
    expect(
      calculateFoodStatus([
        { reaction: "none" },
        { reaction: "severe" },
        { reaction: "none" },
      ])
    ).toBe("reaction");
  });
});
