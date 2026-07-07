# ADR 0007: Unificación de Family Hub dentro del proyecto Supabase `human`

## Estado
Aceptado

## Contexto
El límite de 2 proyectos gratuitos activos por cuenta obligaba a pausar
`family-hub` cada vez que no se estaba trabajando en él (ver ADR 0006).
El usuario confirmó que las mismas familias que usan `human` (app de
hábitos/evolución/crecimiento infantil) usarán previsiblemente también
Family Hub (alimentación complementaria), y que no le importa que ambas
compartan el mismo pool de usuarios (`auth.users`).

`human` es una app en producción con datos reales (5 perfiles, 1 familia,
cientos de eventos). Cualquier cambio debía garantizar cero impacto sobre
ella.

## Decisión
Family Hub se traslada íntegramente a un **schema propio (`family_hub`)
dentro del proyecto `human`**, con un schema auxiliar `family_hub_private`
para la función interna de RLS — exactamente el mismo patrón que ya usaba
`private` en el proyecto standalone (ADR 0003), simplemente renombrado
para evitar cualquier ambigüedad al convivir con el esquema de `human`.

Antes de migrar, se verificó explícitamente:
- Que no había colisión de nombres de schema (`family_hub`,
  `family_hub_private` no existían en `human`).
- Que no había colisión de tipos enum en `public` (`family_role`,
  `reaction_severity`).
- Que `human` ya tenía sus propias tablas `families`/`family_invites` en
  `public` — de ahí la necesidad de un schema separado, no opcional.

Tras la migración, se verificó que **ninguna tabla, función, policy ni
fila de `human` cambió** (conteos idénticos antes/después) y que
`get_advisors` no reportó ningún aviso nuevo achacable a `family_hub`.

El proyecto Supabase standalone `family-hub` queda **pausado
permanentemente** (no se borra, por si hiciera falta consultarlo, pero no
se reanuda salvo petición explícita).

### Pasos manuales pendientes (fuera del alcance de las herramientas usadas)
1. Añadir `family_hub` a "Exposed schemas" en Project Settings → API del
   proyecto `human`. Sin esto, PostgREST no expone las tablas de
   `family_hub` y la app no funcionará.
2. Añadir la URL de callback de Family Hub a "Redirect URLs" en
   Authentication → URL Configuration del proyecto `human`.

## Consecuencias
- Ya no existe el riesgo del ADR 0006: no hace falta volver a pausar
  nunca un proyecto para liberar cupo — `human` y `Aerogym` quedan
  siempre activos.
- Auth se comparte entre `human` y Family Hub: una misma persona puede
  entrar a ambas apps con el mismo email/sesión. Esto es una decisión
  consciente del usuario, no un efecto colateral no deseado.
- Cualquier cambio futuro en la configuración de Auth del proyecto
  `human` (plantillas de email, rate limits, proveedores) afecta a ambas
  apps por igual — hay que tenerlo en cuenta antes de tocar esa
  configuración por cualquiera de las dos apps.
- El patrón "schema propio + schema `_private` para funciones de RLS" es
  ahora el estándar para cualquier futuro proyecto que necesite convivir
  con otro en la misma base de datos.
