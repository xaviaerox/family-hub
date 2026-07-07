# CHANGELOG.md

## [0.13.0] - Tarea 13: Persistencia de Vacunas, Creador de Alimentos e Hitos OMS
### Añadido
- **Persistencia de Vacunas**: Creada la tabla `vaccine_logs` en Supabase con políticas RLS e integrada sincronización en tiempo real en la cartilla de inmunización de Salud.
- **Hitos del Desarrollo (OMS)**: Añadida pestaña de "Desarrollo" en Crecimiento con 10 hitos clave de la OMS, cálculo de fecha estimada según edad cronológica o corregida, y guardado persistente en `development_milestone_logs`.
- **Rastreador Clínico de Alérgenos**: Diseñado un bloque interactivo en Alimentación que computa el estado (Probado, Reacción, Pendiente) de los 14 alérgenos principales regulados por la EFSA.
- **Alimentos Personalizados**: Creado un modal para dar de alta alimentos privados en el catálogo familiar vinculándolos a alérgenos, con soporte automático en la base de datos `food_items` filtrada por `family_id`.

## [0.12.0] - Tarea 12: Módulo de Crecimiento y Percentiles OMS
### Añadido
- **Base de Datos**: Creada la tabla `growth_measurements` en Supabase con políticas RLS para persistir los registros de peso, talla y perímetro cefálico de forma aislada por familia.
- **Modelo de Percentiles OMS**: Programado un modelo matemático de interpolación lineal para estimar percentiles clínicos de la OMS en caliente para bebés de 0 a 12 meses.
- **Gráfica Dinámica SVG**: Desarrollada una curva de desarrollo interactiva y autoadaptable en SVG puro que grafica los percentiles de referencia (p3, p50, p97) y dibuja la curva de crecimiento real del bebé seleccionado.
- **Edad Corregida vs Cronológica**: Incorporado soporte en la gráfica y el cálculo de percentiles para corregir la edad en bebés nacidos prematuros (basándose en la FPP / `due_date`), ofreciendo un interruptor de activación.
- **Formulario e Historial**: Añadido soporte para registrar nuevas mediciones, editarlas o borrarlas con visualización en un listado histórico detallado con indicación del percentil exacto.

## [0.11.0] - Tarea 11: Regionalización por Provincias y Vacunación Personalizada
### Añadido
- **Base de Datos**: Añadida la columna `province` a la tabla `babies` en Supabase para asociar a los bebés con su provincia de vacunación.
- **Selector de Provincias**: Creado un catálogo oficial de las 52 provincias de España en `src/shared/constants/provinces.ts` e integrado un selector dropdown estilizado en los formularios de alta y de edición de bebés.
- **Cartilla de Vacunación Inteligente**: Reescrito el módulo de Salud (`health/page.tsx`) para:
  - Permitir alternar dinámicamente entre bebés de la familia utilizando sus avatares individuales.
  - Mostrar un banner con la provincia asignada al bebé para ajustar sus recomendaciones oficiales.
  - Calcular la fecha estimada exacta de administración de cada vacuna (a los 2, 4, 11 y 12 meses) basándose en la fecha de nacimiento real de cada bebé.

## [0.10.0] - Tarea 10: Sistema de Fotos y Avatares de Bebés
### Añadido
- **Base de Datos**: Migrada la tabla `babies` en Supabase con la columna `photo_url` para almacenar URLs de fotos y presets de avatares.
- **Componente BabyAvatar**: Implementado un selector y renderizador circular con presets vectoriales de animales minimalistas y adorables (Koala 🐨, Panda 🐼, León 🦁, Oso 🐻, Conejo 🐰) en SVG puro y soporte para URLs de fotos personalizadas.
- **Formularios de Creación y Edición**: Integrado el selector visual de avatares/URLs de fotos tanto en el modal de edición de perfil como en el formulario de alta de nuevo bebé.

## [0.9.0] - Tarea 9: Reestructuración de Paneles y Gestión de Bebés
### Añadido
- **Reubicación de Invitaciones**: Trasladada la funcionalidad de generación de códigos de invitación (`InviteGenerator`) de la pantalla de inicio ("Hoy") a la pestaña de **Ajustes**, restringida por roles administrativos.
- **Home de Alta Fidelidad ("Hoy")**: Creado `DashboardClient` para presentar una lista premium de bebés con avatares de iniciales en degradados pastel, cálculo automático de edad exacta en años/meses/días a partir de la fecha de nacimiento y barra de progreso cuantitativa de alimentación.
- **Edición y Borrado Seguro**: Añadido un botón de configuración `⚙️` en cada tarjeta de bebé para actualizar el nombre y la fecha de nacimiento en caliente en Supabase, y soporte de borrado lógico (`deleted_at = now()`) protegido con un modal de confirmación clínica.

## [0.8.0] - Tarea 8: Rigor Médico, Navegación y Exportación
### Añadido
- **Rigor Médico Estricto**: Registradas 5 nuevas fuentes pediátricas y clínicas oficiales en `sources.md` y catalogados en la base de datos alimentos específicos con edades mínimas estrictas (Miel y espinacas a los 12 meses, frutos secos enteros a los 5 años, pez espada a los 10 años).
- **Exportación en PDF**: Botón de exportación e implementación de maquetación CSS de impresión (`print:block`) A4 con una tabla clínica detallada del progreso del bebé.
- **Botonera Inferior Ampliada**: Expandido `BottomNav` a 5 secciones principales (Hoy, Alimentación, Crecimiento, Salud, Ajustes) con iconos de `lucide-react`.
- **Prototipos Interactivos de Crecimiento y Salud**: Creadas las rutas `/dashboard/growth` (curvas percentiles interactiva SVG) y `/dashboard/health` (calendario vacunal interactivo para España).
- **Ajustes Estéticos**: Rediseñado el sistema de iconos reemplazando todos los emojis de alimentos, alérgenos, PDF y reacciones por iconos minimalistas y estilizados de Lucide en tarjetas, formularios y modales, y añadidas transiciones fluidas.

## [0.7.0] - Tarea 7: Panel de Alimentación Completo y Premium
### Añadido
- **Ampliación del catálogo de alimentos**: Agregados 12 nuevos alimentos (frutas, verduras, cereales y proteínas) y vinculados a sus respectivos alérgenos.
- **Selector de reacciones y notas**: Integrado picker de reacciones visual con emojis y campo de observaciones de texto en `QuickFeedingForm`.
- **Mapa de Alimentos interactivo**: Grid organizado por pestañas de categorías con semáforo de estado de tolerancia reactivo en tiempo real (🟢 Tolerado, 🟡 Alerta Leve, 🔴 Alergia, ⚪ Pendiente).
- **Modal de Detalle e Historial**: Drawer deslizable que muestra detalles de alérgenos, edad mínima y una línea de tiempo cronológica con notas/observaciones por alimento.
- **Indicadores y Estadísticas**: Dashboard visual con barras de progreso para alimentos introducidos y alérgenos de la EFSA probados.

### Corregido
- **Bucle RLS y recursión infinita**: Convertida la función `is_family_member` de `language sql` a `plpgsql` para evitar la inlining estática del query planner. Creada la función `is_family_admin` para aislar subconsultas y resolver la recursión infinita en las políticas de inserción de miembros.

## [0.6.0] - Tarea 6: Unificación dentro del proyecto `human`
### Cambiado
- Family Hub deja de tener proyecto Supabase propio. Vive en el schema
  `family_hub` (+ `family_hub_private`) dentro de `human`.
- Cliente Supabase (browser/server/middleware) reapuntado a `human`, con
  `db.schema: "family_hub"` configurado explícitamente.
- `database.types.ts` reestructurado bajo la clave `family_hub`; nuevo
  alias `TypedSupabaseClient` usado en toda la capa de aplicación.

### Añadido
- `docs/adr/0007-unify-into-human-project.md`.
- Migraciones `0005_unify_into_human_family_hub_schema.sql` y
  `0006_seed_family_hub_catalog.sql` (reflejan el estado real dentro de
  `human`). Las migraciones 0001-0004 quedan como histórico del proyecto
  standalone, ahora pausado permanentemente.

### Verificado
- `human` sin cambios: conteos de filas idénticos antes/después.
- `get_advisors`: sin avisos nuevos atribuibles a `family_hub`.
- `tsc --noEmit`, `next lint`, `next build`: en verde contra el proyecto
  `human`.

### Pendiente (manual, fuera de alcance de las herramientas usadas)
- Añadir `family_hub` a "Exposed schemas" en el Dashboard de `human`.
- Añadir la URL de callback de Family Hub a "Redirect URLs" en el
  Dashboard de `human`.

## [0.5.0] - Tarea 5: iconos PWA, tests, estadísticas básicas
### Añadido
- Iconos PWA reales (192/512/512-maskable/apple-touch-icon).
- Suite de tests (Vitest) para todo el dominio de Alimentación y edad
  corregida: 16 tests.
- Estadísticas básicas de alimentación (conteos, sin gráficas).
- 5 alimentos más en el catálogo (20 en total).

### Corregido
- ADR 0006 actualizado: el riesgo de "pérdida de esquema" al pausar/
  reanudar `family-hub` se ha rebajado tras confirmarse que un tercer
  incidente fue un falso positivo de lectura obsoleta, no una pérdida real.

### Verificado
- `vitest run` (16/16), `tsc --noEmit`, `next lint`, `next build`: todos
  en verde.

## [0.4.0] - Tarea 4: Módulo Alimentación (catálogo + motor de reglas)
### Añadido
- Esquema `allergens`, `food_items`, `food_allergens`, `feeding_events` con
  RLS y catálogo inicial de 15 alimentos poblado desde `knowledge/`.
- Motor de reglas de dominio: edad mínima/corregida y regla de los 3 días.
- Registro rápido de alimentación con aviso (no bloqueo) de reglas.
- Alta de bebé (`/dashboard/babies/new`), prerrequisito no construido aún.
- `docs/adr/0006-pause-resume-schema-reset-risk.md`.

### Corregido
- Dos policies RLS permisivas duplicadas en `family_members` INSERT
  (arrastrado de la Tarea 3, no detectado hasta revisar performance
  advisors en esta tarea) consolidadas en una.

### ⚠️ Riesgo detectado
- Pausar/reanudar `family-hub` borra el esquema de la base de datos. Ver
  ADR 0006. Mitigado por ahora (migraciones reaplicables), pero pendiente
  de resolver antes de tener datos reales de usuarios.

### Verificado
- `tsc --noEmit`, `next lint`, `next build`: en verde. `get_advisors`
  (security/performance) limpios salvo el WARN ya aceptado (ADR 0004).

## [0.3.0] - Tarea 3: Auth (magic link) + invitación por código + Dashboard base
### Añadido
- Auth sin contraseña vía magic link (`signInWithOtp`).
- Flujo de onboarding: crear familia o unirse con código.
- Migración `0002_auth_family_invite_flow.sql`: policy de alta de
  creator, policies de invitación refinadas, función
  `accept_family_invite` (security definer acotado).
- Dashboard base mobile-first con navegación inferior y generación de
  invitaciones.
- ADR 0004 (flujo de invitación), ADR 0005 (versión fijada de supabase-js).

### Corregido
- Incompatibilidad de tipos entre `supabase-js@2.110` y
  `@supabase/ssr@0.5.2`: versiones fijadas a `2.45.4` / `0.5.2`.

### Verificado
- `tsc --noEmit`, `next lint`, `next build`: todos en verde sobre código
  real, no solo revisión estática.

## [0.2.0] - Tarea 2: Proyecto Supabase real + hardening
### Añadido
- Proyecto Supabase real `family-hub` creado en `eu-west-1`, aislado de
  cualquier otro proyecto de la organización.
- Migración núcleo aplicada en producción.
- `src/infrastructure/supabase/database.types.ts`: tipos TS generados
  desde el esquema real.
- `.env.example` (sin secretos).
- ADR 0003: hardening de seguridad y rendimiento.

### Cambiado
- `is_family_member` movida a esquema `private` (no expuesta por API).
- Policies con `auth.uid()` directo optimizadas a `(select auth.uid())`.
- Añadidos índices en todas las columnas de clave foránea del esquema núcleo.

### Seguridad
- `get_advisors` (security): 0 avisos tras esta tarea (antes: 4 WARN).
- `get_advisors` (performance): 0 avisos WARN (antes: 3 WARN + 7 INFO de
  índice faltante).

## [0.1.0] - Tarea 1: Setup inicial
### Añadido
- Esqueleto Next.js + TypeScript + Tailwind + shadcn (config) + next-pwa.
- `RULES.md` con las 13 reglas innegociables del proyecto.
- Migración `0001_init_core_schema.sql`: `families`, `family_members`,
  `family_invites`, `babies`, función `is_family_member()`, RLS en todas
  las tablas, triggers de `updated_at`.
- `src/domain/baby/correctedAge.ts`: cálculo de edad corregida para
  prematuros, reutilizable por todos los módulos médicos futuros.
- `src/domain/family/types.ts`: tipos y permisos por rol.
- Esqueleto `knowledge/` con README, registro de fuentes y glosario.
- ADR 0001 (uso de ADRs) y ADR 0002 (patrón RLS multi-tenant).
- Documentación viva: `PROJECT.md`, `ARCHITECTURE.md`, `DATABASE.md`,
  `ROADMAP.md`, `TASKS.md`.
