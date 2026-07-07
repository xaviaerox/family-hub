# ADR 0003: Hardening de seguridad y rendimiento del esquema núcleo

## Estado
Aceptado

## Contexto
Al crear el proyecto real en Supabase y ejecutar el linter de la
plataforma sobre la migración `0001_init_core_schema.sql`, aparecieron
avisos legítimos:

- La función `is_family_member` era invocable directamente vía API pública
  (`/rest/v1/rpc/is_family_member`) tanto por `anon` como por
  `authenticated`, y tenía `search_path` mutable.
- Tres policies RLS llamaban a `auth.uid()` directamente, lo que Postgres
  reevalúa fila a fila en vez de una sola vez por consulta.
- Las columnas de claves foráneas (`family_id`, `created_by`, `invited_by`,
  `user_id`, `used_by`) no tenían índice de cobertura.

Ninguno de estos problemas es aceptable en una plataforma que debe escalar
a miles de familias (ver VISIÓN DEL PRODUCTO).

## Decisión
1. `is_family_member` se mueve al esquema `private` (no expuesto por
   PostgREST) y se le fija `search_path` explícito. Deja de ser invocable
   vía API pública, pero sigue siendo utilizable desde cualquier policy.
2. Toda policy que necesite `auth.uid()` directamente (no a través de
   `private.is_family_member`) debe envolverlo como `(select auth.uid())`
   para que el planificador lo evalúe una sola vez por consulta, no por
   fila.
3. Toda columna de clave foránea se indexa en la misma migración que la
   crea, nunca como tarea "para después".

## Consecuencias
- Cero avisos de seguridad en `get_advisors` tras esta migración.
- Este patrón (esquema `private` para funciones de RLS, `(select auth.*())`,
  índice en cada FK) se convierte en la plantilla obligatoria para todo
  módulo futuro (Alimentación, Vacunas, Sueño...), documentada aquí para
  no tener que redescubrirlo cada vez.
