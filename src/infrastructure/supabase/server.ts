import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cliente Supabase para Server Components, Route Handlers y Server Actions.
 * Proyecto "human" (unificación, ver ADR 0007), schema `family_hub`.
 * Lee/escribe cookies de sesión a través del store de Next.js.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database, "family_hub">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      db: { schema: "family_hub" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorado intencionalmente: se llama desde un Server Component
            // sin permiso de escritura; el middleware ya refresca la sesión.
          }
        },
      },
    },
  );
}
