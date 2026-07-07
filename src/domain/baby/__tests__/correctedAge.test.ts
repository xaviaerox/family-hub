import { describe, it, expect } from "vitest";
import {
  getCorrectedAgeInDays,
  getChronologicalAgeInDays,
  isPrematureBirth,
} from "../correctedAge";

describe("correctedAge", () => {
  it("usa edad cronológica cuando no hay due_date (no prematuro)", () => {
    const birthDate = new Date("2026-01-01");
    const reference = new Date("2026-07-01"); // 181 días después
    const age = getCorrectedAgeInDays({ birthDate, dueDate: null, reference });
    expect(age).toBe(181);
  });

  it("usa edad cronológica cuando due_date es igual a birth_date (a término)", () => {
    const birthDate = new Date("2026-01-01");
    const reference = new Date("2026-07-01");
    const age = getCorrectedAgeInDays({ birthDate, dueDate: birthDate, reference });
    expect(age).toBe(181);
  });

  it("usa edad corregida (desde due_date) cuando el bebé es prematuro", () => {
    const birthDate = new Date("2026-01-01");
    const dueDate = new Date("2026-02-01"); // nació 31 días antes de lo previsto
    const reference = new Date("2026-07-01");
    const age = getCorrectedAgeInDays({ birthDate, dueDate, reference });
    // Edad cronológica sería 181, edad corregida debe ser 31 días menos
    expect(age).toBe(150);
  });

  it("detecta correctamente si el nacimiento fue prematuro", () => {
    const birthDate = new Date("2026-01-01");
    expect(isPrematureBirth(birthDate, new Date("2026-02-01"))).toBe(true);
    expect(isPrematureBirth(birthDate, new Date("2026-01-01"))).toBe(false);
    expect(isPrematureBirth(birthDate, new Date("2025-12-01"))).toBe(false);
    expect(isPrematureBirth(birthDate, null)).toBe(false);
  });

  it("calcula edad cronológica simple correctamente", () => {
    const birthDate = new Date("2026-01-01");
    const reference = new Date("2026-01-11");
    expect(getChronologicalAgeInDays(birthDate, reference)).toBe(10);
  });
});
