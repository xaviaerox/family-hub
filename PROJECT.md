# PROJECT.md — Family Hub

## Visión
Plataforma familiar (PWA) que empieza con un único módulo, Alimentación
Complementaria, construida desde el día 1 para escalar a más módulos
(Crecimiento, Vacunas, Medicación, Sueño, Diario, Desarrollo, IA,
Biblioteca, Compartición con Pediatras) y a miles de familias.

## Filosofía
- Reduce carga mental, no la añade.
- Sencilla, rápida, fiable, privada.
- Basada en evidencia científica citada.
- Funciona completamente sin IA; la IA es un complemento opcional.

## Estado actual
**Fase:** Módulo Alimentación funcional + unificación de infraestructura.

Family Hub vive dentro del proyecto Supabase **`human`** (schema
`family_hub`, aislado de `public`), no en un proyecto propio — ver
ADR 0007. Esto elimina el límite de proyectos gratuitos y el riesgo de
pausar/reanudar (ADR 0006).

Entregado hasta ahora:
- Auth (magic link), creación/unión de familia por código.
- Dashboard base mobile-first, alta de bebés.
- Módulo Alimentación: catálogo de 20 alimentos + 14 alérgenos EFSA,
  motor de reglas (edad mínima/corregida + regla de los 3 días),
  registro rápido y estadísticas básicas.
- 16 tests automatizados sobre el dominio crítico.
- Iconos PWA reales.

## Próximo módulo
Alimentación Complementaria: `food_items`, `allergens`, `feeding_events`,
motor de reglas (3 días, alérgenos, edad mínima/corregida).
