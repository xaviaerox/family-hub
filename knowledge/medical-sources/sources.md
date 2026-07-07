---
type: source-registry
---

# Registro de fuentes oficiales

Cada fuente usada en cualquier archivo de `knowledge/` debe estar registrada
aquí con un `id` único, referenciado desde el frontmatter del archivo que la
cita y desde la columna `source_id` de `food_items`/`allergens` en BD.

| id | organismo | título / documento | url | fecha de consulta |
|----|-----------|---------------------|-----|--------------------|
| `aep-recomendaciones-ac` | Asociación Española de Pediatría (Comité de Lactancia Materna y Comité de Nutrición) | Recomendaciones de la AEP sobre alimentación complementaria | https://www.aeped.es/publicaciones/protocolos/recomendaciones-aep-sobre-alimentacion | 2026-07-05 |
| `aep-espghan-oms-2024` | AEP (CNyLM) + SEGHNP, adhiriéndose a ESPGHAN | Matizaciones a la guía OMS 2023 de alimentación complementaria (6-23 meses): no antes de 4 meses (17 semanas) ni después de 6 meses | https://www.aeped.es/noticias/aep-se-suma-sociedad-europea-gastroenterologia-hepatologia-y-nutricion-pediatrica-matizar-tres | 2026-07-05 |
| `efsa-reglamento-1169-2011` | EFSA / Reglamento (UE) 1169/2011, Anexo II | Lista de los 14 alérgenos de declaración obligatoria | https://eur-lex.europa.eu/legal-content/ES/ALL/?uri=celex%3A32011R1169 | 2026-07-05 |
| `aesan-nitratos-2020` | AESAN | Recomendaciones de consumo de espinacas y acelgas por nitratos | https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/detalle/nitratos.htm | 2026-07-07 |
| `aep-miel-botulismo` | AEPED | Riesgo de botulismo infantil por consumo de miel en menores de 1 año | https://www.aeped.es/comite-nutricion-y-lactancia-materna/miel-y-botulismo | 2026-07-07 |
| `aep-leche-entera` | AEPED | Introducción de la leche entera de vaca a partir de los 12 meses | https://www.aeped.es/nutricion/leche-vaca | 2026-07-07 |
| `aep-atragantamiento` | AEPED | Prevención de atragantamiento por frutos secos enteros en menores de 5 años | https://www.aeped.es/prevencion-accidentes/frutos-secos | 2026-07-07 |
| `aesan-mercurio-2019` | AESAN | Recomendaciones de consumo de pescado por presencia de mercurio | https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/detalle/mercurio.htm | 2026-07-07 |

> Pendiente de ampliar con fuentes específicas por alimento (OMS, Ministerio
> de Sanidad) a medida que se añadan más ítems al catálogo. Ningún alimento
> se añade a `food_items` sin un `source_id` válido de esta tabla
> (RULES.md #11).

