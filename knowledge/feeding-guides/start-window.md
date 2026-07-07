---
type: feeding-guide
source_id: aep-espghan-oms-2024
---

# Ventana de inicio de la alimentación complementaria

Según la postura conjunta AEP (Comité de Nutrición y Lactancia Materna) /
SEGHNP, adhiriéndose a las matizaciones de ESPGHAN y otras 10 sociedades
pediátricas internacionales a la guía OMS 2023: la alimentación
complementaria no debe introducirse antes de los 4 meses de vida (17
semanas) ni retrasarse más allá de los 6 meses.

**Aplicación en `food_items.min_age_days`:** el valor por defecto para
alimentos sin restricción específica adicional es **180 días** (~6 meses),
salvo que una fuente concreta indique otra cosa para ese alimento. Ningún
alimento del catálogo inicial se marca con `min_age_days` inferior a 120
días (17 semanas), como línea roja absoluta.

Para bebés prematuros, esta ventana se aplica sobre la **edad corregida**,
no la edad cronológica (ver `src/domain/baby/correctedAge.ts`).
