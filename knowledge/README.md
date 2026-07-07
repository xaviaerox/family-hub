# knowledge/ — Fuente única de verdad del dominio médico

Esta carpeta es el único lugar donde se define contenido médico/nutricional.
Ningún dato médico se escribe directamente en un seed de base de datos, en un
componente, o en un prompt de IA: siempre se referencia desde aquí.

**Doble consumidor:**
1. **Base de datos** — los seeds de `food_items`, `allergens`, etc. se
   generan a partir de estos archivos, nunca al revés.
2. **Capa de IA** — el Knowledge layer de la IA (ver ARCHITECTURE.md) lee
   exclusivamente de aquí para responder, evitando alucinaciones fuera de lo
   ya validado y citado.

## Estructura

- `foods/` — un archivo por alimento: edad mínima, categoría, alérgenos
  asociados, fuente oficial.
- `allergens/` — los 14 alérgenos de declaración obligatoria EFSA, señales
  de reacción, protocolo de introducción.
- `feeding-guides/` — guías por rango de edad, citando OMS/AEP.
- `growth/` — curvas y criterios de crecimiento OMS (para el futuro módulo
  Crecimiento).
- `medical-sources/` — registro canónico de cada fuente oficial usada:
  nombre, organismo, URL, fecha de consulta, versión.
- `recommendations/` — reglas derivadas en formato consumible por el motor
  de reglas (ej. regla de los 3 días, edad mínima por alimento).
- `glossary/` — términos y definiciones, para consistencia entre módulos y
  entre lo que dice la UI y lo que dice la IA.

## Regla innegociable

Todo archivo de contenido médico debe citar su fuente en frontmatter,
referenciando una entrada de `medical-sources/`. Sin fuente, no se publica
(RULES.md #11).
