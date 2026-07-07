# Family Hub 🏠

Una PWA móvil para familias con bebés. Registra alimentación, crecimiento, salud y hitos del desarrollo con respaldo en curvas de la OMS — desde el primer día y con soporte para bebés prematuros. ¡Desplegado y listo!

---

## Características principales

- 🍼 **Alimentación complementaria** — registro de alimentos con seguimiento de alérgenos EFSA
- 📈 **Crecimiento** — curvas de peso, talla y perímetro cefálico con percentiles OMS (término y prematuro)
- 💉 **Salud** — calendario de vacunación oficial con registro de dosis
- 🌱 **Hitos del desarrollo** — seguimiento por edad cronológica y corregida
- 👨‍👩‍👧 **Multi-familia** — sistema de roles, invitaciones y aislamiento de datos por familia

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 |
| Estilos | Tailwind CSS |
| Auth & DB | Supabase (schema `family_hub`) |
| Validación | Zod |
| Formularios | React Hook Form |
| Animaciones | Framer Motion |
| Estado | Zustand + TanStack Query |
| PWA | next-pwa |
| Testing | Vitest |

## Requisitos previos

- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com)

## Configuración local

1. **Clona el repositorio**

```bash
git clone https://github.com/xaviaerox/family-hub.git
cd family-hub
npm install
```

2. **Configura las variables de entorno**

```bash
cp .env.example .env.local
```

Edita `.env.local` con los valores de tu proyecto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-anon-key
```

> ⚠️ **Nunca** subas `.env.local` al repositorio. La `service_role` key solo se usa en variables de entorno del servidor de hosting.

3. **Configura Supabase** (solo la primera vez)

   - En **Project Settings → API → Exposed schemas**: añade `family_hub`
   - En **Authentication → URL Configuration → Redirect URLs**: añade `https://tu-dominio.com/auth/callback`

4. **Arranca el servidor de desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción local
npm run lint       # ESLint
npm run typecheck  # TypeScript sin compilar
npm run test       # Tests con Vitest
```

## Despliegue en Vercel

Este proyecto requiere un servidor Node.js (SSR, Route Handlers, Middleware de autenticación). **GitHub Pages no es compatible** — usa [Vercel](https://vercel.com) en su lugar.

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new)
2. Añade las variables de entorno en la configuración del proyecto
3. Cada `git push` a `main` despliega automáticamente

## Estructura del proyecto

```
src/
├── app/                    # Rutas Next.js (App Router)
│   ├── auth/callback/      # Intercambio del Magic Link → sesión
│   ├── login/              # Pantalla de acceso sin contraseña
│   ├── onboarding/         # Crear o unirse a una familia
│   └── dashboard/          # Módulos principales (protegidos)
├── application/            # Casos de uso (sin dependencias de framework)
├── domain/                 # Tipos de dominio puros
├── infrastructure/         # Supabase clients (server, browser, middleware)
├── presentation/           # Componentes React
└── shared/                 # Schemas Zod, utils compartidos
middleware.ts               # Protección de rutas a nivel Edge
```

## Arquitectura de autenticación

El acceso es por **Magic Link** (sin contraseña):

1. El usuario introduce su email → Supabase envía un enlace
2. El enlace apunta a `/auth/callback?code=XXX`
3. El servidor intercambia el código por una sesión y crea cookies seguras
4. El middleware valida la sesión en cada request protegido

## Licencia

Proyecto privado. Todos los derechos reservados.
