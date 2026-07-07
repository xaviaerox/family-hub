# ADR 0004: Flujo de alta de creator y redención de invitación por código

## Estado
Aceptado

## Contexto
Dos operaciones del flujo de Auth no encajan con el RLS estándar basado en
`private.is_family_member`:

1. El primer miembro de una familia (creator) no puede insertarse a sí
   mismo en `family_members`, porque la policy de gestión de miembros
   exige que ya exista un admin/creator — imposible en el primer alta.
2. Redimir un código de invitación exige leer una fila de
   `family_invites` de una familia a la que el usuario todavía no
   pertenece, y luego insertarse como miembro. Ambas acciones están
   bloqueadas por las policies estándar de aislamiento por familia.

## Decisión
1. Se añade una policy adicional y estrecha
   `family_members_insert_creator`: permite insertarse a uno mismo con
   `role = 'creator'` únicamente si la familia fue creada por ese mismo
   usuario (`families.created_by = auth.uid()`). No permite unirse a
   ninguna familia ajena.
2. Se centraliza toda la redención de invitaciones en una única función
   `security definer`, `public.accept_family_invite(_code text)`:
   - Valida código, expiración y que no esté ya usado.
   - Inserta la membresía con el rol definido en la invitación.
   - Marca el código como usado.
   - No expone ninguna otra operación ni tabla.
   - `search_path` fijado; `EXECUTE` revocado a `anon` (solo
     `authenticated` puede invocarla).

El linter de Supabase marca como WARN que `authenticated` pueda invocar
esta función `security definer` vía API pública. Es **intencional**: es
precisamente el mecanismo por el que el cliente redime un código. Se
documenta aquí como riesgo aceptado en vez de dejarlo como un WARN sin
explicar.

## Consecuencias
- Ninguna otra tabla ni función queda expuesta con privilegios elevados;
  la superficie de `security definer` se limita a esta única función,
  auditable de un vistazo.
- Patrón reutilizable: cualquier módulo futuro que necesite una acción
  "cruzar el límite de family_id antes de pertenecer a ella" (ej. aceptar
  una invitación de pediatra en el módulo de Compartición) debe seguir
  este mismo patrón: función estrecha, no relajar policies genéricas.
