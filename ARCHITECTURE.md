# ARCHITECTURE.md

## Capas (Clean Architecture, sin sobreingeniería)

```
src/
├── domain/            Entidades y reglas puras. Sin dependencias externas.
│   ├── family/
│   └── baby/
├── application/       Casos de uso. Orquestan domain + infrastructure.
├── infrastructure/     Supabase, proveedores de IA, storage.
│   └── ai/
├── presentation/       Next.js app router, componentes, hooks.
└── shared/             Tipos y utilidades comunes, schemas Zod compartidos.
```

Regla estricta (RULES.md #2): `presentation/` nunca contiene lógica de
negocio. `domain/` nunca importa de `infrastructure/` ni `presentation/`.

## Multi-tenancy
Toda tabla de cualquier módulo cuelga de `family_id` y usa la función RLS
`family_hub_private.is_family_member()` (ADR 0002/0003, adaptado en
ADR 0007). No se implementa RLS ad-hoc por módulo.

## Infraestructura compartida (ver ADR 0007)
Family Hub no tiene proyecto Supabase propio: vive en el schema
`family_hub` (+ `family_hub_private`) dentro del proyecto `human`,
completamente aislado del schema `public` de esa app mediante schemas de
Postgres — el mismo mecanismo de aislamiento que ya usábamos con
`private`, simplemente aplicado también entre aplicaciones, no solo entre
tablas internas. Auth (`auth.users`) se comparte deliberadamente entre
ambas apps.

## Capa de IA (opcional, nunca obligatoria)

```
AI → Knowledge → PromptBuilder → AIProvider (interfaz)
                                      ├─ WebLLMProvider (por defecto: local, sin key, sin coste)
                                      └─ OpenRouterProvider (opcional, futuro)
```

- `AIProvider` es una interfaz única; cambiar de proveedor no toca el resto
  de la app.
- Por defecto se usa inferencia local en el navegador (WebLLM/WebGPU): sin
  API key, sin coste marginal, sin enviar datos fuera del dispositivo.
- El Knowledge layer lee exclusivamente de `knowledge/`, nunca inventa
  contenido médico fuera de las fuentes citadas.

## Documentación viva
Todo cambio funcional relevante actualiza en la misma tarea:
`PROJECT.md`, `ARCHITECTURE.md`, `DATABASE.md`, `CHANGELOG.md`,
`ROADMAP.md`, `TASKS.md`, y un ADR si la decisión lo justifica.
