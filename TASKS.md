# TASKS.md

## Tarea 6 — Unificación: Family Hub pasa a vivir dentro de `human` ✅ COMPLETADA

### Contexto
El usuario confirmó que las mismas familias usarán `human` y Family Hub,
y que no le importa compartir el mismo pool de usuarios. Pidió unificar
ambos proyectos en uno solo sin arriesgar en absoluto los datos reales de
`human` (5 perfiles, 1 familia, cientos de eventos, app en producción).

### Resumen
Todo el esquema de Family Hub se trasladó a un schema propio
(`family_hub` + `family_hub_private`) dentro del proyecto Supabase
`human`, sin tocar nada del schema `public` de esa app. Verificado antes
y después con conteos de filas idénticos y `get_advisors` sin avisos
nuevos. El código de la app se reapuntó al proyecto `human` con el schema
`family_hub` configurado explícitamente en el cliente Supabase.

### Verificaciones de seguridad realizadas ANTES de tocar nada
- Comprobación de schemas existentes en `human`: sin colisión.
- Comprobación de tipos enum en `public`: sin colisión (`human` ya tenía
  sus propias tablas `families`/`family_invites` en `public`, de ahí que
  un schema separado fuera obligatorio, no una preferencia).
- Conteo de filas de las tablas de `human` antes de migrar.

### Verificaciones DESPUÉS de migrar
- Mismos conteos de filas exactos en `human`.
- `get_advisors` (security y performance): todos los avisos preexistentes
  son de `public` (de `human`, no introducidos por esta tarea); los únicos
  ítems de `family_hub` son `INFO` de índice sin uso (normal, tablas
  recién creadas).
- `tsc --noEmit`, `next lint`, `next build`: todos en verde, apuntando ya
  al proyecto `human`.

### Archivos modificados
`src/infrastructure/supabase/{client,server,middleware,database.types}.ts`
(schema `family_hub` configurado explícitamente; alias `TypedSupabaseClient`
para no repetirlo en cada archivo), toda `src/application/**` actualizada
al nuevo alias, `.env.example`, `docs/adr/0007-*.md`,
`supabase/migrations/0005_*.sql` y `0006_*.sql` (nuevas, reflejan el
estado real dentro de `human`; 0001-0004 quedan como histórico del
proyecto standalone, ya pausado).

### Pasos manuales pendientes (el usuario debe hacerlos en el Dashboard)
1. Añadir `family_hub` a "Exposed schemas" en Project Settings → API de
   `human`.
2. Añadir la URL de callback de Family Hub a "Redirect URLs" en
   Authentication → URL Configuration de `human`.

Sin estos dos pasos, la app no funcionará aunque el código y el esquema
estén listos.

### Decisiones tomadas
- Proyecto standalone `family-hub` pausado permanentemente (no borrado,
  por si hace falta consultarlo), ya no se reanuda.
- Regla de memoria actualizada: ya no hace falta pausar nada — `human` y
  `Aerogym` quedan siempre activos sin conflicto de cupo.
- Patrón "schema propio + `_private` para RLS" documentado como estándar
  reutilizable para cualquier convivencia futura de proyectos.

### Próximo paso recomendado
Confirmar contigo que has completado los 2 pasos manuales del Dashboard,
y probar el flujo completo (login → onboarding → alimentación) contra el
proyecto `human` real. Después, seguir con el siguiente módulo del
ROADMAP.

---

## Tarea 5 — Iconos PWA, tests automatizados, estadísticas básicas ✅ COMPLETADA

### Contexto
El usuario decidió no pausar `Aerogym`/`human` ni pasar a plan de pago;
la solución propuesta para el riesgo del ADR 0006 (cuenta Supabase nueva
y separada) queda pendiente de que el usuario cree esa cuenta. Mientras
tanto, se avanzó en tareas no bloqueantes ya identificadas como pendientes.

### ⚠️ Actualización importante del ADR 0006
Al investigar a fondo un tercer incidente de "esquema aparentemente
vacío" tras reanudar `family-hub`, se confirmó que **no hubo pérdida
real**: todas las tablas, las 12 policies RLS (sin duplicados) y los
datos existentes seguían intactos. Los incidentes previos eran, con alta
probabilidad, el mismo fenómeno: una lectura obsoleta justo tras
reanudar, no una pérdida real de esquema. **Esto rebaja significativamente
la severidad del riesgo** — la propuesta de crear una cuenta Supabase
nueva sigue siendo válida como solución definitiva y más tranquila, pero
ya no es urgente: el patrón actual (pausar/reanudar) parece más seguro de
lo que se pensó en la Tarea 4.

### Resumen
- **Iconos PWA reales**: generados en 4 tamaños (192, 512, 512 maskable,
  apple-touch-icon), referenciados en `manifest.json` y en los metadatos
  de Next.js. Ya no queda `icons: []` vacío.
- **Tests automatizados** (Vitest) para todo el dominio crítico: edad
  corregida, edad mínima, regla de los 3 días, resumen de progreso — 16
  tests, todos en verde.
- **Estadísticas básicas de alimentación** (Fase 1 del ROADMAP): conteo
  de alimentos distintos introducidos y total de tomas, en la propia
  página de Alimentación. Sin gráficas ni complejidad añadida.
- **Catálogo ampliado** de 15 a 20 alimentos (5 nuevos, misma fuente ya
  citada, sin alérgenos nuevos).

### Archivos creados/modificados
`public/icons/*.png`, `public/manifest.json`, `src/app/layout.tsx`,
`vitest.config.ts`, `package.json` (script `test`),
`src/domain/{baby,feeding}/__tests__/*.test.ts`,
`src/domain/feeding/progressSummary.ts`,
`src/presentation/components/feeding/FeedingPageClient.tsx` (resumen),
`src/application/feeding/listFeeding.ts` (añadido `foodItemId`),
`knowledge/foods/starter-catalog.md` (ampliado),
`supabase/migrations/0004_seed_allergens_and_food_items.sql` (sincronizado),
`docs/adr/0006-*.md` (corregido).

### Decisiones tomadas
- Antes de reaplicar migraciones ante una lectura "vacía", ahora se
  verifica con varias fuentes (`pg_tables`, `pg_policies`, conteo real)
  antes de concluir nada — evita el riesgo de reinsertar datos ya
  existentes (estuvo a punto de pasar en esta misma tarea).
- Estadísticas deliberadamente mínimas: solo conteos, sin gráficas.

### Verificación realizada
- `npx vitest run` → 16/16 tests en verde.
- `npx tsc --noEmit`, `npx next lint`, `npx next build` → todos en verde.
- Catálogo verificado en BD: 20 alimentos, sin duplicados.

### Próximo paso recomendado
Sigue pendiente, a decisión del usuario: crear una cuenta Supabase nueva
para `family-hub` (ya no urgente, pero sigue siendo la solución más
tranquila a largo plazo). Después: siguiente módulo del ROADMAP
(Crecimiento u otro), aplicando siempre las 5 preguntas de RULES.md #13.

---

## Tarea 4 — Módulo Alimentación: catálogo + motor de reglas ✅ COMPLETADA

### ⚠️ Aviso importante (leer antes de la próxima tarea)
Se ha confirmado que **pausar y reanudar `family-hub` borra el esquema de
la base de datos** (no es comportamiento estándar de Supabase, pero se ha
observado dos veces de forma verificada). Mientras no haya datos reales
de usuarios, el impacto es bajo porque las migraciones se reaplican desde
`supabase/migrations/`, pero es un riesgo real que hay que resolver antes
de tener datos de producción. Ver ADR 0006 para el detalle completo.
**Recomendación:** valorar dejar de pausar `family-hub` en cuanto haya
datos reales que importe conservar, incluso si eso implica revisar el
límite de proyectos gratuitos con el usuario en ese momento.

### Resumen
Catálogo maestro de alimentos y alérgenos (poblado exactamente desde
`knowledge/`, con fuentes oficiales citadas y verificadas por búsqueda:
AEP/SEGHNP/ESPGHAN y Reglamento UE 1169/2011), motor de reglas de dominio
(edad mínima/corregida + regla de los 3 días), y UI de registro rápido +
alta de bebé (necesaria para que el módulo tenga sentido, no estaba
construida aún). Verificado con `tsc --noEmit`, `next lint` y
`next build` reales.

### Archivos creados
**Dominio:** `src/domain/feeding/{types,minimumAge,threeDayRule}.ts`
**Aplicación:** `src/application/feeding/{getFeedingRecommendation,
registerFeedingEvent,listFeeding}.ts`, `src/application/baby/createBaby.ts`
**Presentación:** `src/app/dashboard/babies/new`,
`src/app/dashboard/feeding/[babyId]`,
`src/presentation/components/feeding/{QuickFeedingForm,FeedingPageClient}.tsx`
**Conocimiento:** `knowledge/allergens/efsa-14.md`,
`knowledge/feeding-guides/start-window.md`,
`knowledge/foods/starter-catalog.md`; `knowledge/medical-sources/sources.md`
actualizado con URLs reales verificadas.
**Base de datos:** migraciones `0003_feeding_module_schema.sql`,
`0003b_consolidate_family_members_insert_policy.sql`,
`0004_seed_allergens_and_food_items.sql`; `docs/adr/0006-*.md`.

### Decisiones tomadas
- Motor de reglas **avisa, no bloquea**: coherente con "nunca obligar
  información innecesaria" — los padres deciden con el aviso delante.
- `feeding_events` aislado vía subconsulta a `babies.family_id` (no
  denormalizado), evitando complejidad de sincronización adicional.
- `food_items`/`allergens` son catálogo compartido (no tenant-scoped),
  de solo lectura para el cliente — se gestionan solo vía migraciones.
- **Hallazgo de rendimiento arrastrado de la Tarea 3:** dos policies
  permisivas duplicadas en el INSERT de `family_members` (no se revisó
  `get_advisors` de performance entonces). Consolidadas en una sola.
- **Hallazgo de infraestructura:** ver aviso arriba y ADR 0006.
- Se añadió alta de bebé (`/dashboard/babies/new`), no estaba en el plan
  original de esta tarea pero es un prerrequisito real sin el cual
  Alimentación no se puede usar.

### Verificación realizada
- `npm install`, `npx tsc --noEmit` → 0 errores.
- `npx next lint` → 0 warnings/errores.
- `npx next build` → 9 rutas compiladas correctamente.
- Migraciones aplicadas sobre el proyecto real; `get_advisors` security
  → solo el WARN ya aceptado (ADR 0004); performance → 0 WARN (antes 5).
- Catálogo verificado por consulta SQL directa tras el seed (15
  alimentos, alérgenos correctamente relacionados).

### Próximo paso recomendado
**Tarea 5**: antes de seguir sumando módulos, resolver o mitigar el riesgo
del ADR 0006 (posiblemente dejando de pausar `family-hub` a partir de
ahora, a decidir con el usuario). Después: estadísticas básicas de
alimentación (fase 1 del ROADMAP) o el siguiente módulo (Crecimiento),
aplicando siempre las 5 preguntas de RULES.md #13 antes de empezar.

---

## Tarea 3 — Auth (magic link) + invitación por código + Dashboard base ✅ COMPLETADA

### Resumen
Auth sin contraseña (magic link), flujo completo de creación de familia y
unión mediante código de invitación, y un Dashboard base mobile-first con
navegación inferior. Verificado con `tsc --noEmit`, `next lint` y
`next build` reales, no solo revisión visual del código.

### Archivos creados
**Dominio:** `src/domain/family/invite.ts`
**Aplicación:** `src/application/auth/sendMagicLink.ts`,
`src/application/family/createFamilyWithCreator.ts`,
`src/application/family/createInvite.ts`,
`src/application/family/joinFamilyWithCode.ts`
**Infraestructura:** `src/infrastructure/supabase/client.ts`, `server.ts`,
`middleware.ts`, `database.types.ts` (actualizado)
**Presentación:** `src/app/login`, `src/app/auth/callback`,
`src/app/onboarding`, `src/app/dashboard` (layout + page + settings),
componentes `Button`, `Input`, `Card`, `BottomNav`, `InviteGenerator`,
`SignOutButton`
**Raíz:** `middleware.ts`, `src/app/layout.tsx`, `page.tsx`,
`globals.css`, `postcss.config.js`, `public/manifest.json`, `.eslintrc.json`
**Base de datos:** migración `0002_auth_family_invite_flow.sql` aplicada
en el proyecto real; `docs/adr/0004-invite-redemption-flow.md`,
`docs/adr/0005-pin-supabase-js-version.md`

### Decisiones tomadas
- Magic link en vez de contraseña: menos fricción, coherente con "≤3
  pulsaciones" y "sin leer instrucciones".
- Alta del creator resuelta con una policy adicional estrecha, no un RPC
  (ADR 0004); redención de invitación sí requiere `security definer`
  acotado, documentado y auditado.
- `NAV_ITEMS` del dashboard limitado a lo que existe hoy (Hoy, Ajustes);
  no se añadió "Bebés" aunque la tabla ya existe, porque su UI no es
  parte de esta tarea (evita funcionalidad "porque sí").
- **Hallazgo real durante la verificación:** `npm install` con rangos
  `^` rompía la compatibilidad de tipos entre `supabase-js` y
  `@supabase/ssr`. Se fijaron versiones exactas compatibles (ADR 0005).
- Gestión de proyectos Supabase: se pausó `Aerogym` solo durante el
  trabajo en `family-hub`; al cerrar la tarea, `family-hub` vuelve a
  quedar pausado y `Aerogym` + `human` quedan **activos**, como pediste
  que sea la norma permanente para toda tarea futura.

### Verificación realizada (no solo generación de código)
- `npm install` real, `npx tsc --noEmit` → 0 errores.
- `npx next lint` → 0 warnings/errores.
- `npx next build` → build de producción completo, 7 rutas compiladas,
  service worker PWA generado correctamente.
- Migración aplicada sobre el proyecto Supabase real; `get_advisors`
  (security) → 0 avisos tras el hardening de `accept_family_invite`.

### Próximo paso recomendado
**Tarea 4**: módulo Alimentación — esquema `food_items` / `allergens` /
`feeding_events`, poblado desde `knowledge/`, y motor de reglas (3 días,
alérgenos, edad mínima/corregida). Antes de empezarla, aplicar las 5
preguntas de RULES.md #13.

---

## Tarea 2 — Proyecto Supabase real, aislado, + hardening ✅ COMPLETADA

### Resumen
Se creó un proyecto Supabase **nuevo y aislado** (`family-hub`,
`eu-west-1`, organización `Xaviaerox`) exclusivamente para este producto,
sin tocar los proyectos existentes (`human`, `Aerogym`).

La organización tenía el límite de 2 proyectos gratuitos activos ya
ocupado por `human` y `Aerogym`. Por indicación explícita del usuario, se
pausó `Aerogym` **solo durante la creación y configuración** de
`family-hub`; al terminar esta tarea, `family-hub` se pausa y `Aerogym` se
reanuda, de modo que ambos proyectos existentes quedan exactamente como
estaban y `family-hub` permanece pausado hasta que se retome su desarrollo
(no consume el cupo gratuito mientras está pausado).

Se aplicó la migración núcleo de la Tarea 1 sobre el proyecto real y,
tras revisar `get_advisors`, se corrigieron todos los avisos de seguridad
y rendimiento detectados (ver ADR 0003).

### Archivos modificados
- `supabase/migrations/0001_init_core_schema.sql` — actualizado para
  reflejar exactamente el estado real hardened (esquema `private`,
  `(select auth.uid())`, índices FK).
- `src/infrastructure/supabase/database.types.ts` (nuevo) — tipos
  generados desde el esquema real.
- `.env.example` (nuevo).
- `docs/adr/0003-security-performance-hardening.md` (nuevo).
- `DATABASE.md`, `CHANGELOG.md` — actualizados.

### Decisiones tomadas
- `is_family_member` → `private.is_family_member`: no expuesta por API
  pública, solo usable en policies (ver ADR 0003).
- `auth.uid()` envuelto en `(select ...)` en toda policy que lo usa
  directamente, por rendimiento a escala.
- Índice de cobertura en toda FK del esquema núcleo.
- Gestión del límite de proyectos: pausar temporalmente en vez de
  eliminar o pagar Pro, ya que no había necesidad real de coste.

### Próximo paso recomendado
Antes de continuar con la Tarea 3 (Auth + invitación por código +
Dashboard base), hay que **reanudar** `family-hub` cuando quieras seguir
desarrollando (ahora mismo queda pausado y `Aerogym` reanudado, tal como
pediste). Aviso: reanudar `family-hub` sin pausar `Aerogym` u `human`
volvería a topar con el límite de 2 proyectos gratuitos activos.

---

## Tarea 1 — Setup del proyecto y esquema núcleo ✅ COMPLETADA

### Resumen
Creado el esqueleto base del proyecto (Next.js/TS/Tailwind/Supabase),
las reglas innegociables (`RULES.md`), el esquema núcleo multi-tenant
(`families`, `family_members`, `family_invites`, `babies`) con RLS
reutilizable, la función de dominio de edad corregida, y el esqueleto de
`knowledge/` como fuente única de verdad médica.

### Archivos creados
- `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`
- `RULES.md`
- `docs/adr/0001-record-architecture-decisions.md`
- `docs/adr/0002-multi-tenant-rls-pattern.md`
- `supabase/migrations/0001_init_core_schema.sql`
- `src/domain/baby/correctedAge.ts`
- `src/domain/family/types.ts`
- `knowledge/README.md`, `knowledge/medical-sources/sources.md`,
  `knowledge/glossary/glossary.md`
- `PROJECT.md`, `ARCHITECTURE.md`, `DATABASE.md`, `ROADMAP.md`,
  `CHANGELOG.md`

### Decisiones tomadas
- RLS resuelto con una única función `is_family_member()` (ADR 0002),
  no policies ad-hoc por tabla/módulo.
- Edad corregida centralizada en `domain/baby`, no repetida por módulo.
- IA por defecto: WebLLM (local, sin API key, sin coste), con interfaz
  `AIProvider` para poder añadir OpenRouter u otros después sin tocar
  el resto del proyecto.
- `knowledge/` como fuente única para seeds de BD y para el Knowledge
  layer de la IA — nunca se inventa contenido médico en otro sitio.

### Próximo paso recomendado
**Tarea 2**: Auth con Supabase (registro, login, creación de familia,
invitación por código) + Dashboard base mobile-first. Requiere aprobación
antes de iniciarse (RULES.md / regla de espera entre tareas).

---

## Pendientes (no iniciadas)
- Tarea 2: Auth + flujo de invitación + Dashboard base.
- Tarea 3: Módulo Alimentación — esquema `food_items`/`allergens`/`feeding_events`.
- Tarea 4: Motor de reglas de alimentación (3 días, alérgenos, edad mínima).
