import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

/**
 * Intercambia el código del magic link por una sesión y redirige según
 * si el usuario ya tiene familia (dashboard) o no (onboarding).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userData.user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  return NextResponse.redirect(
    membership ? `${origin}/dashboard` : `${origin}/onboarding`,
  );
}
