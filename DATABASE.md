# DATABASE.md

## ⚠️ Ubicación actual del proyecto (leer primero)
Family Hub **ya no vive en un proyecto Supabase propio**. Desde la
unificación (ADR 0007), todo su esquema vive en el schema **`family_hub`**
(+ `family_hub_private` para RLS) dentro del proyecto **`human`**,
completamente aislado del schema `public` de esa app. El antiguo proyecto
standalone `family-hub` queda pausado permanentemente como referencia
histórica.

Dos configuraciones manuales únicas, hechas una vez en el Dashboard de
Supabase del proyecto `human` (no reproducibles por migración SQL):
1. `family_hub` añadido a "Exposed schemas" (Project Settings → API).
2. URL de callback de esta app en "Redirect URLs" (Authentication → URL
   Configuration).

## Convenciones (aplican a toda tabla, de cualquier módulo)
- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` (vía trigger `set_updated_at`)
- `deleted_at timestamptz` (soft delete cuando aplique)
- RLS habilitado siempre, usando `is_family_member(family_id)` (ADR 0002)

## Esquema núcleo (migración `0001_init_core_schema.sql`)

### `families`
Unidad de aislamiento (tenant). `created_by` referencia `auth.users`.

### `family_members`
Relación usuario–familia. `role`: `creator | administrator | parent |
caregiver | guest`. Único por `(family_id, user_id)`.

### `family_invites`
Invitación por código, con expiración (`expires_at`, 7 días por defecto) y
registro de uso (`used_by`, `used_at`).

### `babies`
`due_date` nullable: si es posterior a `birth_date`, el bebé se considera
prematuro y las reglas médicas deben usar edad corregida
(`src/domain/baby/correctedAge.ts`).

## Función núcleo: `private.is_family_member(_family_id uuid)`
`security definer`, `stable`, `search_path` fijado. Vive en el esquema
`private` (no expuesto por PostgREST — ver ADR 0003), por lo que no es
invocable vía API pública, solo utilizable dentro de policies. Comprueba
membresía activa (`deleted_at is null`) en `family_members`. Toda tabla
nueva de cualquier módulo reutiliza esta función en su policy RLS; no se
reimplementa.

## Convenciones de RLS y rendimiento (ver ADR 0003)
- Cualquier policy que necesite `auth.uid()` directamente (fuera de
  `private.is_family_member`) debe escribirse como `(select auth.uid())`
  para evitar reevaluación fila a fila.
- Toda columna de clave foránea se indexa en la misma migración que la
  introduce.

## Proyecto Supabase real
- Family Hub vive dentro de **`human`** (`eu-west-1`, org `Xaviaerox`),
  schema `family_hub` / `family_hub_private`. Ver ADR 0007.
- El proyecto standalone `family-hub` (usado en Tareas 1-5) queda pausado
  permanentemente, ya no se usa.
- `get_advisors` (security y performance) del proyecto `human`: ningún
  aviso nuevo achacable a `family_hub` tras la unificación.

## Pendiente (próximos módulos)
- Tablas de Crecimiento, Vacunas, Sueño, Medicación, Diario, Desarrollo —
  se añadirán aquí en el momento en que se implementen, no antes.

## Módulo Alimentación (migraciones 0003, 0003b, 0004)

### `allergens` / `food_items` / `food_allergens`
Catálogo de referencia **no tenant-scoped** (mismo para todas las
familias). Solo lectura para el cliente (`select` si `auth.uid()` no es
null); se gestionan exclusivamente vía migraciones, poblados
exactamente desde `knowledge/allergens/efsa-14.md` y
`knowledge/foods/starter-catalog.md`. `source_id` referencia una entrada
de `knowledge/medical-sources/sources.md`.

### `feeding_events`
Tenant-scoped indirectamente vía `baby_id → babies.family_id` (no
denormalizado). RLS: `private.is_family_member((select family_id from
babies where babies.id = feeding_events.baby_id))`.

### ⚠️ Riesgo de infraestructura (ver ADR 0006)
Se ha observado que pausar/reanudar `family-hub` borra el esquema
completo. Verificar siempre con `pg_tables`/`pg_type` (no solo
`list_tables`, que puede dar una lectura obsoleta justo tras reanudar) al
empezar a trabajar, y reaplicar `supabase/migrations/` si hace falta.
