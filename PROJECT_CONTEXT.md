# PROJECT_CONTEXT.md

---

# Proyecto

- **Nombre**: Family Hub
- **Descripción**: Plataforma PWA mobile-first orientada a familias para la gestión clínica, seguimiento del desarrollo infantil (Alimentación Complementaria, Crecimiento/Percentiles OMS, Salud/Vacunas, Desarrollo e Hitos OMS) y coordinación familiar.
- **Objetivo principal**: Reducir la carga mental familiar centralizando el seguimiento pediátrico y del desarrollo en una aplicación web rápida, intuitiva, privada, accesible y respaldada por evidencia médica acreditada y citada.
- **Problema que resuelve**: Elimina la dispersión de datos sobre alimentación complementaria (alérgenos, regla de los 3 días, edad mínima), calendarios vacunales por comunidad autónoma, percentiles de crecimiento e hitos del desarrollo infantil que habitualmente se gestionan en notas de papel, chats o aplicaciones complejas e inseguras.
- **Usuarios objetivo**: Familias (padres, madres, cuidadores, administradores familiares) con bebés y niños pequeños en etapa de desarrollo y alimentación infantil.
- **Estado del proyecto**: En desarrollo activo. Fase 1 (Alimentación Complementaria) y Fase 2 (Crecimiento, Vacunas, Hitos OMS) funcionales y probadas.
- **Nivel de madurez**: Prototipo avanzado funcional / Pre-producción. Integrado y coexistiendo en la infraestructura Supabase de producción `human`.
- **Repositorio**: `xaviaerox/family-hub`
- **Versión actual**: 0.15.0
- **Última actualización**: 2026-08-17

---

# Visión General

- **Explicación de alto nivel del sistema**: Family Hub es una PWA (Progressive Web App) diseñada con enfoque mobile-first. Permite a las familias crear un espacio compartido ("Familia") donde registran a sus bebés y realizan un seguimiento coordinado de su desarrollo pediátrico.
- **Cómo funciona**: Un usuario se autentica vía Magic Link (sin contraseña) a través de Supabase Auth. Puede crear una nueva familia o unirse a una existente mediante un código único de 6 caracteres. Dentro del panel familiar, se gestionan los perfiles de los bebés y se accede a los módulos clínicos: Alimentación (semáforo de tolerancia, catálogo maestro de alérgenos EFSA y cartel poster interactivo "Primeros Alimentos"), Crecimiento (curvas percentiles OMS interpoladas en tiempo real con opción de edad corregida para prematuros), Salud (cartilla vacunal adaptada a las 52 provincias españolas con cálculo exacto de fechas) y Desarrollo (10 hitos clave OMS).
- **Qué hace**:
  - Autenticación passwordless segura mediante Magic Link.
  - Gestión multi-tenant basada en grupos familiares con roles (`creator`, `administrator`, `parent`, `caregiver`, `guest`).
  - Invitación de miembros mediante código de 6 caracteres con fecha de caducidad.
  - Registro de bebés con avatar vectorial de animales o foto personalizada, provincia vacunal y fecha de parto prevista (FPP) para prematuros.
  - Seguimiento de alimentación complementaria con catálogo de 181 alimentos, 14 alérgenos EFSA, motor de reglas (edad mínima, edad corregida, regla de los 3 días), semáforo visual (⚪ Untried, 🌓 Trying, 🌑 Tolerated, ⚠️ Reaction) y cartel poster "Primeros Alimentos".
  - Edición posterior de tomas de alimentos con reactividad en caliente y prevención de duplicados de alimentos personalizados.
  - Gráfica interactiva SVG de percentiles OMS de peso, talla y perímetro cefálico (p3, p50, p97) con cálculo de edad corregida.
  - Cartilla de vacunación con filtro regional por provincia de España y cálculo de fechas de dosis estimadas.
  - Registro de hitos del desarrollo de la OMS.
  - Exportación de informes pediátricos clínicos maquetados para impresión en PDF A4.
- **Qué no hace**:
  - No realiza diagnósticos médicos ni sustituye a la consulta con un pediatra u odontopediatra.
  - No requiere ni impone el uso de inteligencia artificial para sus funciones principales.
  - No comparte datos de salud entre distintas familias (aislamiento estricto por RLS).
- **Límites del proyecto**: El sistema opera exclusivamente dentro del alcance familiar autorizado por las políticas de seguridad RLS de Supabase. El catálogo médico general es global y de solo lectura; los alimentos personalizados y eventos son estrictamente de ámbito familiar.

---

# Arquitectura

## Descripción completa
Family Hub implementa una variante simplificada de Clean Architecture estructurada en capas desacopladas dentro del directorio `src/`. La regla fundamental de arquitectura es que la capa de presentación (`presentation/`) nunca contiene lógica de negocio y la capa de dominio (`domain/`) no posee dependencias externas (frameworks, librerías UI o cliente de base de datos).

## Diagrama ASCII de Arquitectura

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|  Next.js 14 App Router (src/app/) & React Components (presentation/)  |
|  (Pages, Layouts, DashboardClient, FeedingPageClient, Posters, SVG)   |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                         APPLICATION LAYER                             |
|       Casos de uso y orquestación (src/application/)                  |
|  (sendMagicLink, createBaby, listFeeding, registerFeedingEvent, etc.) |
+------------------+--------------------------------+-------------------+
                   |                                |
                   v                                v
+----------------------------------+  +---------------------------------+
|          DOMAIN LAYER            |  |      INFRASTRUCTURE LAYER       |
|  Entidades y reglas puras        |  |  Supabase SSR/Client, DB Schema |
|  (src/domain/)                   |  |  (src/infrastructure/)          |
|  - correctedAge                  |  |  - db.schema: 'family_hub'      |
|  - foodStatus / minimumAge       |  |  - TypedSupabaseClient          |
|  - threeDayRule / progressSummary|  |  - PostgreSQL + RLS             |
+----------------------------------+  +---------------------------------+
                                                    |
                                                    v
                                      +---------------------------------+
                                      |   SUPABASE (PROYECTO 'human')   |
                                      |   Schema: family_hub            |
                                      |   Schema: family_hub_private    |
                                      +---------------------------------+
```

## Capas y Responsabilidades
- **`src/domain/`**: Entidades y reglas puras de negocio. Sin dependencias externas ni de infraestructura. Ejemplo: cálculo de edad corregida, evaluación de la regla de los 3 días, determinación del estado de tolerancia de un alimento, validación de edad mínima.
- **`src/application/`**: Orquestación de casos de uso. Conecta la lógica de dominio con los repositorios y clientes de infraestructura. Ejemplo: `createBaby`, `listFeeding`, `registerFeedingEvent`, `updateFeedingEvent`.
- **`src/infrastructure/`**: Implementación de la persistencia y servicios externos. Contiene el cliente Supabase configurado para operar sobre el esquema `family_hub` (`TypedSupabaseClient`), middleware de sesión y tipos TypeScript autogenerados de la base de datos (`database.types.ts`).
- **`src/presentation/`**: Componentes de interfaz de usuario de Next.js, hooks visuales y layouts. Se organiza en `components/dashboard`, `components/family`, `components/feeding`, `components/layout` y `components/ui`.
- **`src/shared/`**: Eschemas de validación Zod compartidos entre frontend y casos de uso, constantes globales (provincias) y utilidades de estilo (`cn`).
- **`knowledge/`**: Base de conocimiento médica en Markdown con fuentes clínicas certificadas y citadas (EFSA, OMS, AEP, SEGHNP, ESPGHAN).

## Flujo completo de datos
1. El usuario interactúa con la UI en `presentation/` (ej. registra una toma de manzana en `FeedingPageClient`).
2. La UI valida la entrada en el borde utilizando un esquema Zod de `shared/schemas/`.
3. La UI invoca un caso de uso de `application/` (ej. `registerFeedingEvent`).
4. El caso de uso consulta las reglas puras en `domain/` (ej. evalúa si es alérgeno o infringe la regla de 3 días con `threeDayRule.ts`).
5. El caso de uso ejecuta la persistencia llamando a la infraestructura Supabase (`infrastructure/supabase/client.ts`).
6. Supabase procesa la petición en PostgreSQL aplicando RLS mediante `family_hub_private.is_family_member()`.
7. El resultado retorna al caso de uso y se actualiza el estado reactivo de la UI sin necesidad de recargar la página.

## Patrones utilizados
- **Clean Architecture**: Separación estricta de responsabilidades por capas.
- **Multi-Tenant via Schema & RLS**: Aislamiento lógico de datos compartiendo base de datos mediante la clave `family_id` y funciones `SECURITY DEFINER` en PostgreSQL.
- **Single Source of Truth (SSOT)**: El documento `PROJECT_CONTEXT.md` junto con los esquemas Zod y migraciones DDL constituyen la fuente única de verdad.
- **Domain-Driven Design (DDD) simplificado**: Separación por contextos delimitados (`baby`, `family`, `feeding`, `health`, `growth`).

---

# Stack Tecnológico

- **Framework**: Next.js 14.2.0 (App Router, Server & Client Components).
- **Lenguaje**: TypeScript 5.5.0 (Modo estricto activado, sin uso de `any`).
- **Base de datos**: PostgreSQL 15 (hospedado en Supabase, proyecto `human`).
- **ORM / Database Client**: `@supabase/supabase-js` (2.45.4) y `@supabase/ssr` (0.5.2) con esquemas tipados (`TypedSupabaseClient` sobre el schema `family_hub`).
- **Frontend**:
  - React 18.3.0 & React DOM 18.3.0.
  - Styling: Tailwind CSS 3.4.0, PostCSS 8.4.0, Autoprefixer 10.4.0.
  - Iconos: `lucide-react` 0.400.0.
  - Animaciones: `framer-motion` 11.3.0.
  - Formularios y Validación: `react-hook-form` 7.52.0, `@hookform/resolvers` 3.9.0, `zod` 3.23.0.
  - Estado y Data Fetching: `@tanstack/react-query` 5.51.0, `zustand` 4.5.0.
  - PWA: `next-pwa` 5.6.0.
  - Utilidades UI: `class-variance-authority` 0.7.0, `clsx` 2.1.1, `tailwind-merge` 2.4.0.
- **Backend**: Next.js App Router (Route Handlers & Server Actions) + Supabase Edge Functions & PL/pgSQL Stored Procedures.
- **Infraestructura**: Coexiste dentro del proyecto Supabase de producción `human` (`eu-west-1`), aislado en el schema Postgres `family_hub` y `family_hub_private` (ADR 0007).
- **Hosting**: Vercel / Compatible con Next.js App Router.
- **CI/CD / Testing**:
  - Vitest 2.1.0 (Suite de pruebas unitarias e integración de dominio).
  - TypeScript Compiler (`tsc --noEmit`).
  - ESLint 8.57.0 (`eslint-config-next`).
- **Dependencias importantes**:
  - `@supabase/supabase-js`: 2.45.4
  - `@supabase/ssr`: 0.5.2
  - `next`: 14.2.0
  - `react`: 18.3.0
  - `zod`: 3.23.0
  - `vitest`: 2.1.0

---

# Estructura del Repositorio

```
family-hub/
├── .env.example                # Plantilla de variables de entorno públicas
├── .env.local                  # Variables locales (no commiteadas)
├── .eslintrc.json              # Configuración de ESLint
├── .gitignore                  # Archivos ignorados por Git
├── ARCHITECTURE.md             # Documentación de capas y multi-tenancy
├── CHANGELOG.md                # Registro detallado de versiones y tareas
├── DATABASE.md                 # Documentación DDL, RLS e índices de Postgres
├── PROJECT.md                  # Resumen ejecutivo inicial del proyecto
├── PROJECT_CONTEXT.md          # SINGLE SOURCE OF TRUTH (SSOT) del proyecto
├── README.md                   # Descripción general y comandos de arranque
├── ROADMAP.md                  # Fases del desarrollo del producto
├── RULES.md                    # Las 13 reglas innegociables del proyecto
├── TASKS.md                    # Registro operativo de tareas y backlog
├── docs/                       # Documentación técnica adicional
│   └── adr/                    # Architecture Decision Records (0001 a 0007)
├── knowledge/                  # Base de conocimiento médica en Markdown
│   ├── allergens/              # 14 alérgenos EFSA clasificados
│   ├── feeding-guides/        # Guías pediátricas de alimentación
│   ├── foods/                  # Catálogo de alimentos inicial
│   ├── glossary/               # Términos médicos
│   └── medical-sources/        # Citas y fuentes oficiales (OMS, AEP, EFSA)
├── next.config.js              # Configuración de Next.js y Next-PWA
├── package.json                # Scripts y dependencias del proyecto
├── postcss.config.js           # Configuración de PostCSS
├── public/                     # Archivos estáticos e iconos PWA (192, 512, apple-touch)
├── src/                        # Código fuente principal
│   ├── app/                    # Next.js App Router (Rutas y Páginas)
│   │   ├── auth/               # Callback de autenticación Supabase
│   │   ├── dashboard/          # Rutas principales (/babies, /feeding, /growth, /health, /settings)
│   │   ├── login/              # Página de acceso por Magic Link
│   │   ├── onboarding/         # Flujo de bienvenida (crear/unirse a familia)
│   │   ├── globals.css         # Estilos globales Tailwind
│   │   ├── layout.tsx          # Layout raíz con proveedores
│   │   └── page.tsx            # Redirección raíz a login o dashboard
│   ├── application/            # Casos de uso de la aplicación
│   │   ├── auth/               # sendMagicLink.ts
│   │   ├── baby/               # createBaby.ts
│   │   ├── family/             # createFamilyWithCreator.ts, createInvite.ts, joinFamilyWithCode.ts
│   │   └── feeding/            # getFeedingRecommendation.ts, listFeeding.ts, registerFeedingEvent.ts, updateFeedingEvent.ts
│   ├── domain/                 # Entidades y reglas de negocio puras
│   │   ├── baby/               # correctedAge.ts y sus tests
│   │   ├── family/             # Tipos y roles familiares
│   │   └── feeding/            # foodStatus.ts, minimumAge.ts, progressSummary.ts, threeDayRule.ts, types.ts
│   ├── infrastructure/         # Infraestructura y persistencia
│   │   └── supabase/           # client.ts, server.ts, middleware.ts, database.types.ts
│   ├── presentation/           # Componentes UI de React
│   │   └── components/
│   │       ├── dashboard/      # DashboardClient.tsx (Pantalla "Hoy")
│   │       ├── family/         # InviteGenerator.tsx, SignOutButton.tsx
│   │       ├── feeding/        # FeedingPageClient.tsx, FoodChecklistPoster.tsx, FoodStatusCircle.tsx, QuickFeedingForm.tsx
│   │       ├── layout/         # BabyAvatar.tsx, BottomNav.tsx
│   │       └── ui/             # Componentes básicos de interfaz
│   └── shared/                 # Schemas Zod, utilidades y constantes
│       ├── constants/          # provinces.ts (52 provincias españolas)
│       ├── schemas/            # baby.ts, family.ts, feeding.ts
│       └── utils/              # cn.ts
├── supabase/                   # Migraciones SQL de Supabase
│   └── migrations/             # Archivos .sql ordenados cronológicamente (0001 a 0008)
├── tailwind.config.ts          # Configuración de colores y temas Tailwind
├── tsconfig.json               # Configuración de TypeScript
└── vitest.config.ts            # Configuración del runner de pruebas Vitest
```

## Archivos críticos
- [`PROJECT_CONTEXT.md`](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/PROJECT_CONTEXT.md): Este archivo (SSOT).
- [`RULES.md`](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/RULES.md): Las 13 reglas innegociables.
- [`src/infrastructure/supabase/client.ts`](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/infrastructure/supabase/client.ts): Cliente Supabase configurado con el schema `family_hub`.
- [`src/infrastructure/supabase/database.types.ts`](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/infrastructure/supabase/database.types.ts): Definición de tipos TypeScript autogenerados desde Supabase.
- [`src/domain/baby/correctedAge.ts`](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/domain/baby/correctedAge.ts): Lógica clínica central de edad corregida para bebés prematuros.
- [`src/domain/feeding/foodStatus.ts`](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/src/domain/feeding/foodStatus.ts): Determinación de los 4 estados de tolerancia de alimentos.

## Archivos de configuración
- `package.json`: Scripts de npm (`dev`, `build`, `start`, `lint`, `typecheck`, `test`) y dependencias.
- `tsconfig.json`: TypeScript en modo estricto con alias de rutas (`@/*`).
- `tailwind.config.ts`: Configuración de tokens de diseño y colores pastel.
- `next.config.js`: Envoltura PWA con `next-pwa`.
- `vitest.config.ts`: Entorno de ejecutor de pruebas.

---

# Componentes Principales

## 1. Módulo de Autenticación y Familia (`src/application/auth/`, `src/application/family/`)
- **Responsabilidades**: Inicio de sesión sin contraseña vía Magic Link (`sendMagicLink.ts`), creación de familia con asignación del rol `creator` (`createFamilyWithCreator.ts`), generación de códigos de invitación de 6 caracteres (`createInvite.ts`) y redención de invitaciones (`joinFamilyWithCode.ts` / `accept_family_invite` RPC).
- **Relaciones**: Asocia usuarios autenticados de `auth.users` con la entidad `families` a través de `family_members`.

## 2. Módulo de Gestión de Bebés (`src/domain/baby/`, `src/application/baby/`, `src/presentation/components/layout/BabyAvatar.tsx`)
- **Responsabilidades**: Creación y edición de bebés, cálculo automático de edad exacta (años/meses/días), cálculo de edad corregida para bebés nacidos prematuros (`correctedAge.ts`), gestión de avatar (presets vectoriales de animales o foto propia) y borrado lógico seguro (`deleted_at = now()`).
- **Relaciones**: Cada bebé pertenece obligatoriamente a una `family_id`. Es la entidad central a la que se asocian las tomas, mediciones y vacunas.

## 3. Módulo de Alimentación Complementaria (`src/domain/feeding/`, `src/application/feeding/`, `src/presentation/components/feeding/`)
- **Responsabilidades**:
  - `foodStatus.ts`: Calcula el estado de tolerancia de un alimento (Untried ⚪, Trying 🌓, Tolerated 🌑, Reaction ⚠️).
  - `minimumAge.ts`: Evalúa la edad mínima recomendada del bebé (cronológica o corregida) para consumir un alimento determinado.
  - `threeDayRule.ts`: Comprueba si la introducción de un alimento cumple la pauta de los 3 días de espera recomendada tras probar alimentos/alérgenos nuevos.
  - `progressSummary.ts`: Genera estadísticas cuantitativas de alimentos introducidos y alérgenos probados.
  - `listFeeding.ts`: Obtiene la lista completa de tomas y estado del catálogo para un bebé.
  - `registerFeedingEvent.ts`: Registra una nueva toma con reacción y notas.
  - `updateFeedingEvent.ts`: Permite la edición posterior de tomas existentes actualizando la reacción y observaciones.
  - `FeedingPageClient.tsx`: Panel principal de alimentación con conmutador de vista (Cartel Poster "Primeros Alimentos" vs. Mosaico de Tarjetas), buscador y filtros.
  - `FoodChecklistPoster.tsx`: Renderizado interactivo e imprimible en formato poster categorizado por Frutas, Verduras, Hidratos, Lácteos, Proteínas, Alérgenos y Sabores.
- **Relaciones**: Lee de `food_items`, `allergens` y `food_allergens`, y persiste en `feeding_events`.

## 4. Módulo de Crecimiento y Percentiles OMS (`src/app/dashboard/growth/`)
- **Responsabilidades**: Registro e historial de peso, talla y perímetro cefálico. Cálculo en tiempo real de percentiles OMS (p3, p50, p97) mediante modelo de interpolación lineal (0 a 12 meses). Visualización de curva de desarrollo interactiva en SVG autoadaptable con soporte para alternar entre edad cronológica y edad corregida.

## 5. Módulo de Salud y Vacunación (`src/shared/constants/provinces.ts`, `src/app/dashboard/health/`)
- **Responsabilidades**: Selección de provincia de residencia del bebé de entre las 52 provincias españolas (`provinces.ts`). Cálculo de fechas estimadas de administración de dosis vacunales según la fecha de nacimiento. Registro y sincronización en tiempo real de vacunas administradas en la tabla `vaccine_logs`.

## 6. Módulo de Desarrollo e Hitos OMS (`src/app/dashboard/growth/`)
- **Responsabilidades**: Pestaña de hitos del desarrollo infantil basados en la escala OMS (10 hitos clave). Estimación de fechas sugeridas según edad cronológica/corregida y persistencia de logros en `development_milestone_logs`.

---

# Flujo de Funcionamiento

## Flujo 1: Autenticación y Acceso Inicial
```
[Usuario ingresa email en /login]
         │
         ▼
[sendMagicLink.ts solicita OTP a Supabase Auth]
         │
         ▼
[Usuario pulsa enlace en email -> /auth/callback]
         │
         ▼
[Middleware verifica sesión y comprueba pertenencia a familia en family_members]
         │
         ├─── Si no tiene familia ───► [/onboarding (Crear familia o Introducir código)]
         │                                       │
         │                                       ▼
         │                            [createFamily / joinFamilyWithCode]
         │                                       │
         └─── Si ya tiene familia ───────────────┴───► [/dashboard (Pantalla "Hoy")]
```

## Flujo 2: Registro de Alimentación y Recálculo de Tolerancia
```
[Padre abre /dashboard/feeding y selecciona un alimento (ej. Plátano)]
         │
         ▼
[Se abre QuickFeedingForm o Modal de Alimento]
         │
         ▼
[Evaluación en tiempo real por el motor de reglas (minimumAge, threeDayRule)]
         │ (Muestra advertencia médica si infringe edad mínima o regla de 3 días, pero no bloquea)
         ▼
[Padre selecciona la reacción (Ninguna, Leve, Moderada, Grave) y añade observaciones]
         │
         ▼
[Invoca registerFeedingEvent.ts -> Supabase INSERT en feeding_events]
         │
         ▼
[Frontend recibe confirmación y reevalúa foodStatus.ts]
         │
         ▼
[Se actualiza el círculo SVG (⚪->🌓->🌑 o ⚠️) y la barra de alérgenos EFSA sin recargar la página]
```

---

# Modelo de Datos

## Entidades y Relaciones

```
+------------------+         1:N         +--------------------+
|     families     |<-------------------|   family_members   |
| (family_id UUID) |                     | (user_id -> auth)  |
+--------+---------+                     +--------------------+
         |
         | 1:N
         v
+------------------+         1:N         +--------------------+
|      babies      |<-------------------| growth_measurements|
| (baby_id UUID)   |                     +--------------------+
+----+---+----+----+         1:N         +--------------------+
     |   |    +-------------------------|    vaccine_logs    |
     |   |                               +--------------------+
     |   |                   1:N         +--------------------+
     |   +------------------------------| milestone_logs     |
     |                                   +--------------------+
     | 1:N
     v
+------------------+         N:1         +--------------------+
|  feeding_events  |-------------------->|     food_items     |
| (reaction, notes)|                     | (family_id null=gl)|
+------------------+                     +---------+----------+
                                                   | N:M (via food_allergens)
                                                   v
                                         +--------------------+
                                         |     allergens      |
                                         | (EFSA 14 catalog)  |
                                         +--------------------+
```

## Tablas del Esquema `family_hub`

### 1. `families`
- `id` (uuid, PK, default `gen_random_uuid()`)
- `name` (text, not null)
- `created_by` (uuid, FK `auth.users`, not null)
- `created_at` (timestamptz, default `now()`)
- `updated_at` (timestamptz, default `now()`)

### 2. `family_members`
- `id` (uuid, PK)
- `family_id` (uuid, FK `families.id`, not null)
- `user_id` (uuid, FK `auth.users`, not null)
- `role` (text, enum: `'creator'`, `'administrator'`, `'parent'`, `'caregiver'`, `'guest'`, default `'parent'`)
- `joined_at` (timestamptz, default `now()`)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz, nullable para soft delete)
- *Restricción única*: `UNIQUE(family_id, user_id)`

### 3. `family_invites`
- `id` (uuid, PK)
- `family_id` (uuid, FK `families.id`, not null)
- `code` (text, UNIQUE, not null) — Código de 6 caracteres
- `created_by` (uuid, FK `auth.users`, not null)
- `expires_at` (timestamptz, not null) — 7 días por defecto
- `used_by` (uuid, FK `auth.users`, nullable)
- `used_at` (timestamptz, nullable)
- `created_at` / `updated_at` (timestamptz)

### 4. `babies`
- `id` (uuid, PK)
- `family_id` (uuid, FK `families.id`, not null)
- `name` (text, not null)
- `birth_date` (date, not null)
- `due_date` (date, nullable) — Fecha prevista de parto para cálculo de edad corregida
- `gender` (text, enum: `'boy'`, `'girl'`, not null)
- `photo_url` (text, nullable) — Preset vectorial SVG o URL de foto propia
- `province` (text, nullable) — Nombre de una de las 52 provincias españolas
- `created_at` / `updated_at` / `deleted_at` (timestamptz)

### 5. `allergens` (Catálogo Global)
- `id` (uuid, PK)
- `code` (text, UNIQUE, not null) — Ej: `'gluten'`, `'peanuts'`
- `name` (text, not null)
- `description` (text, nullable)
- `source_id` (text, FK `medical_sources`)
- `created_at` / `updated_at` (timestamptz)

### 6. `food_items` (Catálogo Maestro + Alimentos de Familia)
- `id` (uuid, PK)
- `family_id` (uuid, FK `families.id`, nullable) — `null` = Alimento del catálogo maestro global; `UUID` = Alimento personalizado de una familia.
- `name` (text, not null)
- `category` (text, not null) — Ej: `'fruits'`, `'vegetables'`, `'cereals'`, `'proteins'`, `'dairy'`
- `minimum_age_months` (integer, default 6)
- `description` (text, nullable)
- `source_id` (text, nullable)
- `created_at` / `updated_at` / `deleted_at` (timestamptz)
- *Restricción única compuesta*: `UNIQUE(family_id, name)` (migración 0007 para prevenir duplicados)

### 7. `food_allergens`
- `food_item_id` (uuid, FK `food_items.id`, not null)
- `allergen_id` (uuid, FK `allergens.id`, not null)
- *PK compuesta*: `PRIMARY KEY (food_item_id, allergen_id)`

### 8. `feeding_events`
- `id` (uuid, PK)
- `baby_id` (uuid, FK `babies.id`, not null)
- `food_item_id` (uuid, FK `food_items.id`, not null)
- `introduced_at` (timestamptz, not null default `now()`)
- `reaction` (text, enum: `'none'`, `'mild'`, `'moderate'`, `'severe'`, default `'none'`)
- `notes` (text, nullable)
- `created_by` (uuid, FK `auth.users`, not null)
- `created_at` / `updated_at` / `deleted_at` (timestamptz)

### 9. `growth_measurements`
- `id` (uuid, PK)
- `baby_id` (uuid, FK `babies.id`, not null)
- `measured_at` (date, not null default `current_date`)
- `weight_kg` (numeric, nullable)
- `height_cm` (numeric, nullable)
- `head_circ_cm` (numeric, nullable)
- `notes` (text, nullable)
- `created_by` (uuid, FK `auth.users`, not null)
- `created_at` / `updated_at` / `deleted_at` (timestamptz)

### 10. `vaccine_logs`
- `id` (uuid, PK)
- `baby_id` (uuid, FK `babies.id`, not null)
- `vaccine_code` (text, not null)
- `administered_at` (date, not null default `current_date`)
- `notes` (text, nullable)
- `created_by` (uuid, FK `auth.users`, not null)
- `created_at` / `updated_at` / `deleted_at` (timestamptz)

### 11. `development_milestone_logs`
- `id` (uuid, PK)
- `baby_id` (uuid, FK `babies.id`, not null)
- `milestone_code` (text, not null)
- `achieved_at` (date, not null default `current_date`)
- `notes` (text, nullable)
- `created_by` (uuid, FK `auth.users`, not null)
- `created_at` / `updated_at` / `deleted_at` (timestamptz)

---

# API

El proyecto utiliza las APIs generadas automáticamente por PostgREST a través del cliente `@supabase/supabase-js` apuntando explícitamente al esquema `family_hub`.

## Endpoints de Autenticación y Funciones RPC de PostgreSQL

### 1. `family_hub_private.is_family_member(_family_id uuid)`
- **Tipo**: Función PL/pgSQL `SECURITY DEFINER`, `STABLE` en esquema privado.
- **Propósito**: Evalúa si `(select auth.uid())` pertenece a la familia con rol activo en `family_members`. Utilizada por todas las políticas RLS.

### 2. `family_hub_private.is_family_admin(_family_id uuid)`
- **Tipo**: Función PL/pgSQL `SECURITY DEFINER`, `STABLE`.
- **Propósito**: Comprueba si el usuario ostenta el rol de `'creator'` o `'administrator'` en la familia.

### 3. `family_hub.accept_family_invite(invite_code text)`
- **Tipo**: Función RPC expuesta `SECURITY DEFINER`.
- **Autenticación**: Requerida (Bearer Token JWT).
- **Parámetros**: `invite_code` (string de 6 caracteres).
- **Respuestas**:
  - `SUCCESS`: Retorna el `family_id` unido.
  - `ERROR`: Código de invitación inválido o expirado.

## Casos de Uso de Aplicación (Server Actions / Client Methods)

- `sendMagicLink({ email })`: Envía email de acceso OTP.
- `createFamilyWithCreator({ familyName })`: Crea la entidad `families` y el primer `family_members` con rol `creator`.
- `createInvite({ familyId })`: Genera un nuevo registro en `family_invites`.
- `createBaby({ familyId, name, birthDate, dueDate, gender, photoUrl, province })`: Registra un bebé en la familia.
- `listFeeding(babyId)`: Retorna el catálogo con el estado computado (Untried, Trying, Tolerated, Reaction) y el historial de tomas.
- `registerFeedingEvent({ babyId, foodItemId, reaction, notes })`: Inserta una toma en `feeding_events`.
- `updateFeedingEvent({ eventId, reaction, notes })`: Actualiza la reacción u observaciones de un evento existente.

---

# Reglas de Negocio

1. **Mobile First**: Toda la maquetación y controles están optimizados para su uso con una sola mano en dispositivos móviles.
2. **Edad Corregida para Prematuros**: Si `due_date` existe y es posterior a `birth_date`, el bebé se considera nacido prematuramente. Todas las evaluaciones clínicas (edad mínima para alimentos, percentiles OMS e hitos del desarrollo) se calculan contra la edad corregida (`fecha_actual - due_date`) a menos que el usuario desactive explícitamente el conmutador.
3. **Regla de los 3 Días (Alimentación)**: Al ofrecer un nuevo alimento (especialmente si contiene alérgenos), el motor sugiere mantenerlo durante 3 días consecutivos sin introducir otros alimentos nuevos para identificar alergias diferidas.
4. **Evaluación del Estado de Alimentos (`foodStatus.ts`)**:
   - `untried` (⚪ Círculo blanco): 0 tomas registradas.
   - `trying` (🌓 Círculo semi relleno): 1 o 2 tomas registradas sin ninguna reacción.
   - `tolerated` (🌑 Círculo completo): 3 o más tomas registradas sin reacción.
   - `reaction` (⚠️ Icono de alerta): 1 o más tomas con reacción registradas (`mild`, `moderate`, `severe`).
5. **Rigor Médico Estricto y Citas**: Todo contenido sobre alérgenos o alimentos restringidos proviene de guías de la EFSA, la OMS, la AEP o la SEGHNP. Ejemplos: prohibida la miel y espinacas/acelgas antes de los 12 meses (botulismo / nitratos), frutos secos enteros prohibidos antes de los 5 años (atragantamiento), pez espada prohibido antes de los 10 años (mercurio).
6. **Prevención de Duplicados de Alimentos**: Se aplica normalización insensible a mayúsculas, minúsculas, espacios y acentos al registrar alimentos personalizados, garantizando adicionalmente la integridad con el índice único `(family_id, name)`.
7. **IA Opcional**: Ninguna funcionalidad básica depende de modelos de inteligencia artificial. La capa de IA (WebLLM en cliente) es estrictamente complementaria.

---

# Configuración

## Variables de Entorno (`.env.local`)

```env
# URL base del proyecto Supabase 'human'
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co

# Clave pública anónima de Supabase 'human'
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Pasos Manuales Obligatorios en el Dashboard de Supabase (`human`)
1. **Esquemas expuestos**: Ir a Project Settings → API → Exposed Schemas y agregar `family_hub`.
2. **URLs de Redirección Auth**: Ir a Authentication → URL Configuration → Redirect URLs y agregar la URL base de la app (ej: `http://localhost:3000/auth/callback` o dominio de producción).

---

# Seguridad

- **Autenticación**: Supabase Auth con Magic Link. Los tokens JWT de sesión se gestionan mediante cookies seguras mediante `@supabase/ssr`.
- **Aislamiento Multi-Tenant (RLS)**: Habilitado en **todas** las tablas de `family_hub`. Ninguna consulta del cliente puede saltarse el filtro de `family_id`.
- **Hardening de Políticas RLS**:
  - Las consultas directas a `auth.uid()` se encapsulan como `(select auth.uid())` para prevenir la reevaluación fila por fila por el query planner de PostgreSQL.
  - La función `is_family_member` está alojada en el esquema `family_hub_private`, inaccesible directamente por PostgREST.
- **Riesgos Conocidos**: La aplicación coexiste en el mismo proyecto de Supabase que la app `human`. El aislamiento se mantiene a nivel de esquema Postgres (`family_hub` vs `public`).

---

# Rendimiento

- **Optimización de Índices**: Todas las claves foráneas (`family_id`, `baby_id`, `food_item_id`, `created_by`) cuentan con índices explícitos B-Tree creados en las migraciones.
- **Gráficas y UI Liviana**: Las curvas percentiles OMS y los círculos de estado de alimentación se renderizan mediante SVG puro sin cargar librerías masivas de canvas o charts heavy-weight.
- **Sin Polling**: La interfaz aprovecha la reactividad local con React State y actualización optimista al guardar datos.

---

# Estado Actual

- **Qué funciona y está completado**:
  - Auth Magic Link y flujo de creación/unión a familia mediante código de 6 caracteres.
  - Pantalla principal ("Hoy") con avatares pastel, edad exacta y barra de progreso cuantitativo de alimentación.
  - Panel de Alimentación Complementaria con cartel poster interactivo "Primeros Alimentos", buscador, filtros por categoría y modal de alérgenos EFSA.
  - Motor de reglas clínicas de alimentación (3 días, edad mínima/corregida, clasificación untried/trying/tolerated/reaction).
  - Registro y edición posterior de tomas de alimentos con reactividad en caliente y prevención de alimentos duplicados.
  - Módulo de Crecimiento con modelo de interpolación de percentiles OMS (peso, talla, perímetro) y gráfica SVG interactiva.
  - Cartilla vacunal regionalizada por 52 provincias españolas con cálculo exacto de fechas de dosis y persistencia en DB.
  - Registro de hitos del desarrollo infantil (OMS).
  - Exportación de informes médicos en PDF maquetados para A4.
  - Suite de 20 pruebas unitarias e integración en Vitest (100% pasando).
- **Qué está pendiente / Próximos pasos**:
  - Módulo de Sueño (TASK-017).
  - Módulo de Diario e Hitos Diarios (TASK-018).
  - Capa IA local en cliente con WebLLM sobre `knowledge/` (TASK-019).
  - Compartición avanzada con pediatras (TASK-020).
  - Verificación manual e2e en Dashboard Supabase `human` (TASK-016).

---

# Roadmap

- **Fase 0 — Fundación**: Core schema, Auth Magic Link, multi-tenancy RLS y Dashboard base. (COMPLETADO)
- **Fase 1 — Alimentación Complementaria**: Catálogo maestro, motor de reglas de dominio, registro de tomas, cartel poster "Primeros Alimentos". (COMPLETADO)
- **Fase 2 — Módulos Clínicos Adicionales**:
  - Crecimiento & Percentiles OMS (COMPLETADO)
  - Vacunas & Cartilla provincial (COMPLETADO)
  - Hitos del Desarrollo OMS (COMPLETADO)
  - Registro de Sueño (PENDIENTE - TASK-017)
  - Diario Infantil (PENDIENTE - TASK-018)
- **Fase 3 — IA & Exportación**: Capa de IA local (WebLLM) sin coste ni API key sobre la base de conocimiento y exportación pediátrica.
- **Fase 4 — SaaS Multi-Familia**: Self-service onboarding y gestión de organizaciones a escala.

---

# Decisiones Técnicas

- **ADR 0001 (2026-07-20)**: Registro obligatorio de decisiones de arquitectura mediante archivos Markdown numerados en `/docs/adr/`.
- **ADR 0002 (2026-07-21)**: Adopción del patrón RLS Multi-Tenant mediante la función PL/pgSQL `is_family_member(_family_id)`.
- **ADR 0003 (2026-07-23)**: Hardening de seguridad y rendimiento. Creación del esquema `family_hub_private` para la función RLS y encapsulamiento de `(select auth.uid())`.
- **ADR 0004 (2026-07-26)**: Flujo de invitación mediante código único de 6 caracteres con fecha de caducidad y función RPC `accept_family_invite` con `SECURITY DEFINER`.
- **ADR 0005 (2026-07-27)**: Fijado estricto de versiones de `@supabase/supabase-js` (2.45.4) y `@supabase/ssr` (0.5.2) para evitar incompatibilidades de tipos.
- **ADR 0006 (2026-07-29)**: Identificación del riesgo de reseteo de esquema al pausar/reanudar proyectos Supabase en plan gratuito.
- **ADR 0007 (2026-08-02)**: Unificación de Family Hub dentro del proyecto Supabase de producción `human` utilizando el esquema aislado `family_hub` y `family_hub_private`.

---

# Problemas Conocidos

- **Bugs abiertos**: Ninguno. Todos los bugs identificados durante la ejecución de las tareas 1-15 han sido corregidos y probados.
- **Deuda técnica (TASK-DT-001)**: Optimización periódica de políticas RLS y funciones PL/pgSQL a medida que aumente sustancialmente el volumen de datos en `feeding_events` y `growth_measurements`.
- **Configuración manual (TASK-016)**: Requiere añadir manualmente `family_hub` a "Exposed schemas" y configurar Redirect URLs en el Dashboard del proyecto Supabase `human`.

---

# Historial Relevante

- **Tarea 1 (2026-07-21)**: Setup inicial Next.js + TypeScript + Supabase + DDL núcleo (`families`, `family_members`, `babies`) + `RULES.md` + `correctedAge.ts`.
- **Tarea 2 (2026-07-24)**: Hardening de RLS en esquema `private` e índices de FKs.
- **Tarea 3 (2026-07-27)**: Auth Magic Link + invitación por código de 6 caracteres + Dashboard base.
- **Tarea 4 (2026-07-30)**: Módulo de Alimentación: Catálogo maestro, alérgenos EFSA y motor de reglas de dominio (3 días, edad mínima/corregida).
- **Tarea 5 (2026-08-01)**: Suite de 16 pruebas unitarias Vitest e iconos PWA adaptativos.
- **Tarea 6 (2026-08-02)**: Unificación dentro del proyecto Supabase `human` (Schema `family_hub`).
- **Tarea 7 (2026-08-03)**: Panel de Alimentación completo con semáforo de tolerancia, drawer deslizable y corrección de bucle de recursión RLS (`is_family_admin`).
- **Tarea 8 (2026-08-04)**: Fuentes médicas en `sources.md`, exportación PDF e iconografía Lucide.
- **Tarea 9 (2026-08-05)**: Reestructuración de Paneles, edad exacta del bebé en años/meses/días y borrado lógico seguro.
- **Tarea 10 (2026-08-06)**: Sistema de avatares vectoriales de animales en SVG y fotos de bebé.
- **Tarea 11 (2026-08-07)**: Regionalización por 52 provincias españolas y cartilla de vacunación inteligente.
- **Tarea 12 (2026-08-08)**: Módulo de Crecimiento con percentiles OMS (p3, p50, p97) y gráfica SVG interactiva.
- **Tarea 13 (2026-08-09)**: Persistencia de vacunas en `vaccine_logs`, hitos OMS en `development_milestone_logs` y alimentos personalizados.
- **Tarea 14 (2026-08-10)**: Edición posterior de tomas de alimentos, reactividad en caliente y prevención de alimentos duplicados (migración 0007).
- **Tarea 15 (2026-08-12)**: Visualización "Primeros Alimentos" (Checklist & Cartel Poster) con estados de círculos (⚪ Untried, 🌓 Trying, 🌑 Tolerated, ⚠️ Reaction) y catálogo ampliado de 181 alimentos.

---

# Convenciones del Proyecto

- **Naming**:
  - Componentes React: `PascalCase.tsx` (ej: `FoodChecklistPoster.tsx`).
  - Lógica de Dominio y Utilidades: `camelCase.ts` (ej: `foodStatus.ts`).
  - Tablas y Columnas PostgreSQL: `snake_case` (ej: `feeding_events`, `birth_date`).
  - Rutas de App Router: `kebab-case` o minúsculas.
- **Arquitectura de Código**:
  - La lógica de negocio reside únicamente en `src/domain/` y `src/application/`.
  - Ningún componente de `src/presentation/` debe ejecutar consultas SQL directas ni implementar lógica clínica.
  - TypeScript en modo estricto (`"strict": true`). Prohibido el uso de `any`.
  - Validación de esquemas Zod en todas las entradas de usuario.
- **Buenas Prácticas (Regla de Oro)**: Ninguna tarea se da por completada sin actualizar la documentación correspondiente (`PROJECT_CONTEXT.md`, `TASKS.md`, `CHANGELOG.md`).

---

# Guía para Agentes IA

1. **Lectura obligatoria**: Al iniciar cualquier tarea en este repositorio, lee atentamente este archivo `PROJECT_CONTEXT.md` y las 13 reglas innegociables descritas en [`RULES.md`](file:///c:/Users/Xaviaerox/Documents/GitHub/family-hub/RULES.md).
2. **Archivos Críticos que NUNCA deben ser alterados sin justificación técnica y ADR**:
   - `src/infrastructure/supabase/client.ts` (debe mantener siempre `db: { schema: 'family_hub' }`).
   - `src/domain/baby/correctedAge.ts` (lógica médica de edad corregida).
   - `src/domain/feeding/foodStatus.ts` (cálculo de estados de tolerancia).
   - `supabase/migrations/` (no modificar migraciones pasadas ya aplicadas; crear siempre un nuevo archivo `.sql` numerado).
3. **Reglas para añadir nuevas funcionalidades**:
   - Responde por escrito a las 5 preguntas de la Regla 13 de `RULES.md` antes de programar.
   - Crea las entidades/reglas puras en `src/domain/`.
   - Crea los casos de uso en `src/application/`.
   - Implementa la UI en `src/presentation/` respetando el diseño mobile-first y componentes reutilizables.
   - Escribe pruebas unitarias en `__tests__` con Vitest.
   - Ejecuta `npm run typecheck` y `npm test` para asegurar que no hay regresiones.
   - **OBLIGATORIO**: Actualiza `PROJECT_CONTEXT.md`, `TASKS.md` y `CHANGELOG.md` antes de dar la tarea por finalizada.
4. **Gobernanza de Versionado y Releases**:
   - `package.json` es la ÚNICA fuente técnica canónica de verdad para la versión del proyecto.
   - Ejecuta `npm run check:version` para verificar automáticamente la consistencia de versión entre `package.json`, `PROJECT_CONTEXT.md` y `CHANGELOG.md`.
   - Aplica Semantic Versioning (SemVer): PATCH para bugfixes/refactors compatibles, MINOR para nuevas funcionalidades compatibles, MAJOR para breaking changes/migraciones incompatibles.
   - NUNCA reduzcas la versión ni mantengas versiones contradictorias entre la fuente canónica y la documentación o el Service Worker/PWA.

---

# Resumen Ejecutivo

Family Hub es una plataforma PWA mobile-first concebida para simplificar la gestión clínica y el seguimiento del desarrollo infantil en el entorno familiar. Desarrollada con Next.js 14, TypeScript estricto, Tailwind CSS y Supabase (PostgreSQL), la aplicación coexiste de forma segura y aislada en el esquema Postgres `family_hub` dentro del proyecto de producción `human`.

La plataforma destaca por su rigor médico acreditado (basado en guías de la EFSA, OMS, AEP y SEGHNP), ofreciendo seguimiento de Alimentación Complementaria (catálogo de 181 alimentos, alérgenos EFSA, cartel poster interactivo "Primeros Alimentos", semáforo visual de tolerancia y motor de reglas de 3 días y edad corregida), Crecimiento (percentiles OMS interpolados en tiempo real con gráficas SVG adaptables a bebés prematuros), Salud (cartilla vacunal regionalizada para las 52 provincias españolas) y Hitos del Desarrollo OMS. Con arquitectura limpia, aislamiento multi-tenant por RLS, validación estricta con Zod y 20 pruebas unitarias e integración en Vitest, Family Hub garantiza una experiencia rápida, privada y libre de carga mental para las familias.
