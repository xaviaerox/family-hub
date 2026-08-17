# TASKS.md

---

# Resumen

- **Total aproximado de tareas**: 21
- **Tareas pendientes**: 6
- **Tareas en progreso**: 0
- **Tareas bloqueadas**: 0
- **Tareas completadas**: 15
- **Tareas canceladas o descartadas**: 0
- **Fecha de última actualización**: 2026-08-17

---

# Tareas Activas

## TASK-016 — Verificación de Configuración Manual Supabase en Dashboard (`human`)

- **Estado**: PENDIENTE
- **Prioridad**: ALTA
- **Tipo**: INFRAESTRUCTURA
- **Creada**: 2026-08-12
- **Iniciada**: Desconocida
- **Completada**: Desconocida

### Contexto
Tras la unificación del esquema `family_hub` en el proyecto Supabase `human` (TASK-006 / ADR 0007), quedan dos pasos manuales que deben realizarse desde el Dashboard de Supabase para que las APIs y callbacks de autenticación funcionen correctamente en entorno real.

### Subtareas
- [ ] Añadir `family_hub` a "Exposed schemas" en Project Settings → API de `human`.
- [ ] Añadir la URL de callback de Family Hub a "Redirect URLs" en Authentication → URL Configuration de `human`.
- [ ] Probar el flujo completo e2e (login → onboarding → alimentación) contra el proyecto `human` real.

---

# Próximas Tareas

## TASK-017 — Módulo de Sueño (Sleep Tracker)

- **Estado**: PENDIENTE
- **Prioridad**: MEDIA
- **Tipo**: FEATURE
- **Creada**: 2026-08-17
- **Contexto**: Registro y seguimiento de tomas de sueño (siestas, sueño nocturno, despertares) y estadísticas básicas de descanso infantil.
- **Dependencias**: TASK-009 (Dashboard base & gestión de bebés).

## TASK-018 — Módulo de Diario e Hitos Diarios (Journal & Milestones)

- **Estado**: PENDIENTE
- **Prioridad**: MEDIA
- **Tipo**: FEATURE
- **Creada**: 2026-08-17
- **Contexto**: Registro diario de momentos especiales, fotos destacadas, notas familiares e hitos del desarrollo no clínicos.
- **Dependencias**: TASK-009.

## TASK-019 — Capa de Inteligencia Artificial Local (WebLLM sobre Knowledge)

- **Estado**: PENDIENTE
- **Prioridad**: BAJA
- **Tipo**: FEATURE
- **Creada**: 2026-08-17
- **Contexto**: Integración de motor IA cliente en navegador (WebLLM) sin coste ni API key externa sobre la base de conocimiento estructurada de `knowledge/`.
- **Dependencias**: TASK-001, TASK-004.

## TASK-020 — Compartición con Pediatras y Exportación Avanzada

- **Estado**: PENDIENTE
- **Prioridad**: BAJA
- **Tipo**: FEATURE
- **Creada**: 2026-08-17
- **Contexto**: Generación de informes resumidos descargables/compartibles para revisiones pediátricas con gráficas de percentiles e historial de inmunización/alimentación.
- **Dependencias**: TASK-008, TASK-012, TASK-013.

## TASK-021 — SaaS Multi-Familia & Self-Service Onboarding

- **Estado**: PENDIENTE
- **Prioridad**: BAJA
- **Tipo**: INFRAESTRUCTURA
- **Creada**: 2026-08-17
- **Contexto**: Onboarding avanzado self-service, gestión de organizaciones y planes (si aplica a futuro para la plataforma).
- **Dependencias**: TASK-003, TASK-006.

---

# Tareas Bloqueadas

*No existen tareas bloqueadas actualmente.*

---

# Deuda Técnica

## TASK-DT-001 — Optimización de Consultas RLS y Función `is_family_admin`

- **Estado**: PENDIENTE
- **Prioridad**: MEDIA
- **Tipo**: DEUDA_TÉCNICA
- **Creada**: 2026-08-10
- **Contexto**: Revisión periódica de políticas RLS y funciones PL/pgSQL en `family_hub_private` para asegurar rendimiento óptimo a medida que crezca el volumen de datos en `feeding_events` y `growth_measurements`.

---

# Bugs Conocidos

*No existen bugs conocidos abiertos en este momento. Todos los bugs identificados durante el desarrollo de tareas anteriores han sido resueltos y registrados en el Historial de Tareas.*

---

# Ideas / Mejoras Futuras

- **Generador de Menús Pediátricos**: Creación de sugerencias de menú semanal basadas en los alimentos ya tolerados por el bebé.
- **Integración con Widgets PWA**: Registro por voz o atajos de widget en pantalla de inicio de teléfono móvil.
- **Sincronización Offline Avanzada**: Service Worker cache completo para registro en zonas sin cobertura con sincronización diferida (Background Sync API).

---

# Historial de Tareas

## TASK-015 — Visualización de "Primeros Alimentos" (Checklist & Cartel Poster)

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-08-11
- **Iniciada**: 2026-08-11
- **Completada**: 2026-08-12

### Descripción
El usuario solicitó una visualización genérica e interactiva tipo cartel/poster ("Primeros Alimentos") basada en una imagen de referencia, para ver de un vistazo los alimentos por probar con un círculo en blanco (⚪), probados con círculo semi relleno (🌓) y tolerados con círculo completo (🌑).

### Resultado
- **Dominio (`foodStatus.ts`)**: Creado el módulo de cálculo de estado de tolerancia de alimentos con pruebas unitarias (`foodStatus.test.ts`):
  - `untried`: 0 tomas (Círculo en blanco ⚪).
  - `trying`: 1-2 tomas sin reacción (Círculo semi relleno 🌓).
  - `tolerated`: 3+ tomas sin reacción (Círculo completo 🌑).
  - `reaction`: 1+ tomas con reacción (Icono/Círculo de alerta ⚠️).
- **Componentes de Presentación**:
  - `FoodStatusCircle.tsx`: Renderizador SVG de los estados de los círculos.
  - `FoodChecklistPoster.tsx`: Cartel interactivo y responsive con el diseño de la imagen de referencia (categorías Frutas, Verduras, Hidratos, Lácteos, Proteínas, Otros Sabores, Alérgenos, leyenda y recomendación "Inténtalo 5 veces").
  - `FeedingPageClient.tsx`: Integrado un selector de vista (Cartel Poster vs. Tarjetas Mosaico).

### Archivos creados / modificados
- [foodStatus.ts](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/domain/feeding/foodStatus.ts)
- [foodStatus.test.ts](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/domain/feeding/__tests__/foodStatus.test.ts)
- [FoodStatusCircle.tsx](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/presentation/components/feeding/FoodStatusCircle.tsx)
- [FoodChecklistPoster.tsx](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/presentation/components/feeding/FoodChecklistPoster.tsx)
- [listFeeding.ts](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/application/feeding/listFeeding.ts)
- [FeedingPageClient.tsx](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/presentation/components/feeding/FeedingPageClient.tsx)
- [CHANGELOG.md](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/CHANGELOG.md)

---

## TASK-014 — Edición de Tomas de Alimentos y Prevención de Duplicados

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-08-10
- **Iniciada**: 2026-08-10
- **Completada**: 2026-08-10

### Descripción
El usuario solicitó que las tomas de alimentos registradas ("hitos") se puedan editar con posterioridad para ajustar la reacción (por si aparece algún síntoma o alergia más tarde) o para añadir/modificar observaciones (por si olvidó incluir algún detalle). También se identificaron alimentos personalizados duplicados (por ejemplo, "Sandia"), requiriendo consolidación y mecanismos para evitar duplicados en el futuro.

### Resultado
- **Zod Schema**: Definido `updateFeedingEventSchema` para validar la edición (`eventId` UUID, `reaction` enum, `notes` string opcional).
- **Aplicación**: Añadido el caso de uso `updateFeedingEvent.ts` para persistir los cambios en la tabla `feeding_events` de Supabase.
- **Consultas**: Modificada la capa de consulta `listFeeding.ts` para incluir el `id` del evento en cada `FeedingHistoryEntry`.
- **Interfaz (UI)**:
  - Botones de edición en "Últimas Tomas" e "Historial de Tomas" en modal de alimento.
  - Edit Modal con selector visual de reacciones (Ninguna, Leve, Moderada, Grave) y observaciones.
  - Sincronización local reactiva (`handleUpdated`) que recalcula el estado de tolerancia del alimento y los alérgenos sin forzar recarga.
- **Validación anti-duplicados**: Comprobación insensible a acentos/mayúsculas en cliente.
- **Migración DDL Supabase**: Creada migración `0007_prevent_duplicate_food_items.sql` (índice único compuesto `(family_id, name)`).
- **Limpieza de "Sandia"**: Ejecutado script de limpieza SQL en Supabase para borrar la sandía inactiva junto con su toma inicial redundante.

### Archivos creados / modificados
- [feeding.ts](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/shared/schemas/feeding.ts)
- [updateFeedingEvent.ts](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/application/feeding/updateFeedingEvent.ts)
- [listFeeding.ts](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/application/feeding/listFeeding.ts)
- [FeedingPageClient.tsx](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/presentation/components/feeding/FeedingPageClient.tsx)
- [0007_prevent_duplicate_food_items.sql](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/supabase/migrations/0007_prevent_duplicate_food_items.sql)
- [CHANGELOG.md](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/CHANGELOG.md)

---

## TASK-013 — Persistencia de Vacunas, Creador de Alimentos e Hitos OMS

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-08-09
- **Iniciada**: 2026-08-09
- **Completada**: 2026-08-09

### Descripción
Crear persistencia real para vacunas registradas en la cartilla de inmunización, catálogo de hitos de desarrollo OMS con estimación por edad corregida/cronológica y modal de creación de alimentos personalizados vinculados a alérgenos.

### Resultado
- Tabla `vaccine_logs` en Supabase con RLS y sync en tiempo real en la cartilla de inmunización de Salud.
- Pestaña de "Desarrollo" en Crecimiento con 10 hitos clave de la OMS, cálculo de fecha estimada según edad cronológica o corregida, y guardado persistente en `development_milestone_logs`.
- Rastreador clínico de alérgenos que computa el estado (Probado, Reacción, Pendiente) de los 14 alérgenos principales regulados por la EFSA.
- Alta de alimentos personalizados vinculados a alérgenos guardados en `food_items` por `family_id`.

---

## TASK-012 — Módulo de Crecimiento y Percentiles OMS

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-08-08
- **Iniciada**: 2026-08-08
- **Completada**: 2026-08-08

### Descripción
Implementar el módulo de crecimiento infantil con cálculo de percentiles clínicos OMS (peso, talla, perímetro cefálico) y gráfica interactiva SVG autoadaptable.

### Resultado
- Tabla `growth_measurements` en Supabase con políticas RLS por familia.
- Modelo matemático de interpolación lineal para estimar percentiles clínicos OMS en caliente (0 a 12 meses).
- Gráfica dinámica SVG pura que grafica percentiles de referencia (p3, p50, p97) y dibuja la curva de crecimiento real del bebé seleccionado.
- Soporte para corregir la edad en bebés nacidos prematuros (FPP / `due_date`) con interruptor de activación.
- Formulario de alta, edición y borrado de mediciones en listado histórico.

---

## TASK-011 — Regionalización por Provincias y Vacunación Personalizada

- **Estado**: COMPLETADA
- **Prioridad**: MEDIA
- **Tipo**: FEATURE
- **Creada**: 2026-08-07
- **Iniciada**: 2026-08-07
- **Completada**: 2026-08-07

### Descripción
Añadir soporte regional para el calendario vacunal de las 52 provincias españolas y cálculo personalizado de fechas estimadas por bebé.

### Resultado
- Columna `province` en la tabla `babies` en Supabase.
- Catálogo oficial de las 52 provincias de España en `src/shared/constants/provinces.ts` e selector dropdown en formularios de bebé.
- Cartilla de vacunación inteligente en Salud con conmutación entre bebés de la familia por avatar y estimación exacta de fechas de administración (a los 2, 4, 11 y 12 meses).

---

## TASK-010 — Sistema de Fotos y Avatares de Bebés

- **Estado**: COMPLETADA
- **Prioridad**: MEDIA
- **Tipo**: FEATURE
- **Creada**: 2026-08-06
- **Iniciada**: 2026-08-06
- **Completada**: 2026-08-06

### Descripción
Añadir soporte para personalizar el perfil visual del bebé mediante foto propia o avatares vectoriales de animales.

### Resultado
- Columna `photo_url` en la tabla `babies` en Supabase.
- Componente `BabyAvatar` con presets vectoriales SVG de animales (Koala 🐨, Panda 🐼, León 🦁, Oso 🐻, Conejo 🐰) y soporte para URLs de fotos personalizadas.
- Integración en modal de edición de perfil y formulario de alta de nuevo bebé.

---

## TASK-009 — Reestructuración de Paneles y Gestión de Bebés

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-08-05
- **Iniciada**: 2026-08-05
- **Completada**: 2026-08-05

### Descripción
Crear pantalla principal ("Hoy") con visualización avanzada de bebés, edad exacta y barra de progreso cuantitativo de alimentación, además de edición y borrado lógico seguro.

### Resultado
- Reubicación de la generación de códigos de invitación (`InviteGenerator`) a la pestaña de Ajustes (restringido por rol administrativo).
- Home de alta fidelidad ("Hoy") con `DashboardClient`, avatares pastel, cálculo automático de edad exacta en años/meses/días y barra de progreso de alimentación.
- Configuración `⚙️` en tarjetas de bebé para actualización en caliente de nombre/nacimiento y borrado lógico seguro (`deleted_at = now()`) protegido con confirmación.

---

## TASK-008 — Rigor Médico, Navegación y Exportación

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-08-04
- **Iniciada**: 2026-08-04
- **Completada**: 2026-08-04

### Descripción
Incorporar rigor médico acreditado en `sources.md`, exportación en PDF para informes clínicos y ampliar la navegación inferior a 5 secciones principales.

### Resultado
- 5 nuevas fuentes pediátricas y clínicas oficiales registradas en `sources.md` (edades mínimas estrictas: Miel/espinacas 12m, frutos secos enteros 5a, pez espada 10a).
- Exportación PDF A4 maquetada mediante CSS de impresión (`print:block`) para informes clínicos.
- Botonera inferior (`BottomNav`) ampliada a 5 secciones (Hoy, Alimentación, Crecimiento, Salud, Ajustes) con iconos Lucide.
- Reemplazo de emojis por iconos minimalistas de Lucide en tarjetas y formularios.

---

## TASK-007 — Panel de Alimentación Completo y Premium

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-08-03
- **Iniciada**: 2026-08-03
- **Completada**: 2026-08-03

### Descripción
Diseñar e implementar la experiencia completa de Alimentación Complementaria con catálogo categorizado por pestañas, semáforo de tolerancia, drawer de detalles y corrección de bucle RLS.

### Resultado
- Catálogo ampliado a 12 nuevos alimentos y semáforo visual de tolerancia (🟢 Tolerado, 🟡 Alerta Leve, 🔴 Alergia, ⚪ Pendiente).
- Selector de reacciones visuales y observaciones en `QuickFeedingForm`.
- Drawer deslizable con detalles de alérgenos y línea de tiempo cronológica.
- Corrección de bucle de recursión RLS convirtiendo `is_family_member` a PL/pgSQL y creando `is_family_admin`.

---

## TASK-006 — Unificación: Family Hub pasa a vivir dentro de `human`

- **Estado**: COMPLETADA
- **Prioridad**: CRÍTICA
- **Tipo**: INFRAESTRUCTURA
- **Creada**: 2026-08-02
- **Iniciada**: 2026-08-02
- **Completada**: 2026-08-02

### Descripción
Unificar la infraestructura de Supabase trasladando todo el esquema de Family Hub a un schema aislado (`family_hub` + `family_hub_private`) dentro del proyecto Supabase en producción de `human`, eliminando el problema de límites de proyectos gratuitos y el riesgo de pausar/reanudar.

### Resultado
- Todo el esquema trasladado a `family_hub` en el proyecto `human` sin alterar `public`.
- Código de cliente Supabase actualizado con `db.schema: "family_hub"` y alias `TypedSupabaseClient`.
- ADR 0007 redactado y publicado.
- Verificación con conteos de filas idénticos y `get_advisors` limpio.

### Archivos modificados
- `src/infrastructure/supabase/{client,server,middleware,database.types}.ts`
- `docs/adr/0007-unify-into-human-project.md`
- `supabase/migrations/0005_unify_into_human_family_hub_schema.sql`
- `supabase/migrations/0006_seed_family_hub_catalog.sql`

---

## TASK-005 — Iconos PWA, Tests Automatizados y Estadísticas Básicas

- **Estado**: COMPLETADA
- **Prioridad**: MEDIA
- **Tipo**: TEST
- **Creada**: 2026-08-01
- **Iniciada**: 2026-08-01
- **Completada**: 2026-08-01

### Descripción
Generar conjunto completo de iconos PWA, implementar suite de tests unitarios/integración con Vitest para el dominio crítico y añadir estadísticas básicas de alimentación.

### Resultado
- Iconos PWA reales generados en 4 tamaños (192, 512, 512 maskable, apple-touch-icon) y configurados en `manifest.json`.
- 16 tests automatizados en Vitest para edad corregida, edad mínima, regla de 3 días y resumen de progreso (100% verde).
- Conteos de alimentos distintos introducidos y total de tomas en la UI de Alimentación.
- Catálogo ampliado de 15 a 20 alimentos.

---

## TASK-004 — Módulo Alimentación: Catálogo Maestro y Motor de Reglas

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-07-28
- **Iniciada**: 2026-07-28
- **Completada**: 2026-07-30

### Descripción
Crear el catálogo maestro de alimentos y alérgenos EFSA desde `knowledge/`, motor de reglas de dominio (edad mínima, edad corregida, regla de los 3 días) y UI de registro rápido más alta de bebé.

### Resultado
- Dominio `src/domain/feeding/` con motor de reglas no bloqueante.
- Tablas `allergens`, `food_items`, `food_allergens`, `feeding_events` creadas.
- Alta de bebé `/dashboard/babies/new`.
- Conocimiento certificado en `knowledge/allergens/efsa-14.md` y `knowledge/foods/starter-catalog.md`.
- ADR 0006 redactado.

---

## TASK-003 — Auth (Magic Link) + Invitación por Código + Dashboard Base

- **Estado**: COMPLETADA
- **Prioridad**: ALTA
- **Tipo**: FEATURE
- **Creada**: 2026-07-25
- **Iniciada**: 2026-07-25
- **Completada**: 2026-07-27

### Descripción
Implementar autenticación sin contraseña mediante Magic Link de Supabase Auth, flujo de creación de familia o unión por código de invitación de 6 caracteres y Dashboard base mobile-first.

### Resultado
- Login por Magic Link (`sendMagicLink.ts`).
- Creación de familia y redención de invitaciones (`accept_family_invite` RPC security definer).
- Navigation bar inferior (`BottomNav`) y Layout del Dashboard.
- ADR 0004 y ADR 0005.

---

## TASK-002 — Proyecto Supabase Real, Aislado + Hardening de Seguridad

- **Estado**: COMPLETADA
- **Prioridad**: CRÍTICA
- **Tipo**: INFRAESTRUCTURA
- **Creada**: 2026-07-22
- **Iniciada**: 2026-07-22
- **Completada**: 2026-07-24

### Descripción
Configurar el proyecto de Supabase standalone inicial, aplicar migración núcleo y realizar hardening de seguridad y rendimiento basándose en `get_advisors`.

### Resultado
- Esquema `private` creado para `is_family_member` (evita exposición en API pública).
- Optimización de `auth.uid()` a `(select auth.uid())` en políticas RLS.
- Índices de cobertura agregados en todas las FK del esquema núcleo.
- ADR 0003 publicado.

---

## TASK-001 — Setup Inicial del Proyecto y Esquema Núcleo Multi-Tenant

- **Estado**: COMPLETADA
- **Prioridad**: CRÍTICA
- **Tipo**: INFRAESTRUCTURA
- **Creada**: 2026-07-20
- **Iniciada**: 2026-07-20
- **Completada**: 2026-07-21

### Descripción
Inicialización del proyecto Next.js + TypeScript + Tailwind CSS + Supabase Client, definición de las 13 reglas innegociables (`RULES.md`), esquema núcleo multi-tenant (`families`, `family_members`, `family_invites`, `babies`), función de edad corregida y estructura del directorio `knowledge/`.

### Resultado
- Proyecto Next.js configurado con PWA y Tailwind.
- `RULES.md` redactado.
- Esquema núcleo DDL con RLS reutilizable.
- `src/domain/baby/correctedAge.ts` implementado.
- ADR 0001 y ADR 0002.
- Documentación inicial: `PROJECT.md`, `ARCHITECTURE.md`, `DATABASE.md`, `ROADMAP.md`, `CHANGELOG.md`.
