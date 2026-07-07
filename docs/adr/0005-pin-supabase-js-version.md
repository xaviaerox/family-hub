# ADR 0005: Fijar versión exacta de `@supabase/supabase-js`

## Estado
Aceptado

## Contexto
Al instalar dependencias con rangos `^` en `package.json`, `npm` resolvió
`@supabase/supabase-js@2.110.0`, que introdujo una firma de genéricos
distinta para `SupabaseClient<Database, ...>` (soporte multi-schema).
`@supabase/ssr@0.5.2` todavía construye sus tipos con la firma antigua de
3 genéricos. La combinación provoca errores de TypeScript al pasar el
cliente devuelto por `createBrowserClient`/`createServerClient` a
cualquier función tipada como `SupabaseClient<Database>`, con un mensaje
de error largo y confuso sobre "schema no asignable a 'public'".

## Decisión
Fijar versiones exactas (sin `^`) y compatibles entre sí:
- `@supabase/supabase-js`: `2.45.4`
- `@supabase/ssr`: `0.5.2`

No actualizar ninguna de las dos sin comprobar antes que sus firmas de
genéricos siguen siendo compatibles (`npx tsc --noEmit` limpio).

## Consecuencias
- `npx tsc --noEmit`, `next lint` y `next build` pasan sin errores.
- Cualquier actualización futura de `@supabase/supabase-js` o
  `@supabase/ssr` debe hacerse a la vez, y validarse con un build
  completo antes de aceptarla — nunca actualizar una sin la otra.
