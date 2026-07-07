import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/infrastructure/supabase/database.types";

/**
 * Refresca la sesión de Supabase en cada request y protege las rutas de
 * /dashboard. La lógica de "qué hacer si no hay sesión" vive aquí porque
 * es infraestructura de routing, no una regla de dominio.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database, "family_hub">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      db: { schema: "family_hub" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding");

  if (!data.user && (isProtectedRoute || isOnboardingRoute)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
