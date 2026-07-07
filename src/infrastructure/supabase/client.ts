import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Cliente Supabase para uso en componentes de cliente ("use client").
 * Apunta al proyecto "human" (unificación, ver ADR 0007), usando el schema
 * `family_hub`, completamente aislado del schema `public` de human.
 * Nunca importar esto desde Server Components o Route Handlers: usar
 * createServerSupabaseClient (server.ts) en su lugar.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database, "family_hub">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { db: { schema: "family_hub" } },
  );
}
