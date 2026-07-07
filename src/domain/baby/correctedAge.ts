/**
 * Cálculo de edad corregida para prematuros.
 *
 * Punto único de verdad reutilizado por Alimentación, Vacunas, Crecimiento
 * y Desarrollo. Nunca debe reimplementarse en un módulo concreto (RULES.md #4).
 *
 * Referencia clínica: la edad corregida se calcula a partir de la fecha
 * probable de parto (due_date), no de la fecha de nacimiento real, cuando
 * el nacimiento fue prematuro. Ver knowledge/medical-sources para la fuente
 * oficial de este criterio antes de aplicarlo a una regla médica concreta.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface CorrectedAgeInput {
  birthDate: Date;
  dueDate: Date | null;
  reference: Date;
}

/**
 * Devuelve la edad corregida en días respecto a `reference`.
 * Si no hay dueDate, o dueDate es igual o posterior a birthDate (no prematuro
 * en términos de corrección), se usa la edad cronológica real.
 */
export function getCorrectedAgeInDays({
  birthDate,
  dueDate,
  reference,
}: CorrectedAgeInput): number {
  const isPremature = dueDate !== null && dueDate.getTime() > birthDate.getTime();
  const baseline = isPremature ? dueDate! : birthDate;
  const diffMs = reference.getTime() - baseline.getTime();
  return Math.floor(diffMs / MS_PER_DAY);
}

export function getChronologicalAgeInDays(birthDate: Date, reference: Date): number {
  return Math.floor((reference.getTime() - birthDate.getTime()) / MS_PER_DAY);
}

export function isPrematureBirth(birthDate: Date, dueDate: Date | null): boolean {
  return dueDate !== null && dueDate.getTime() > birthDate.getTime();
}
