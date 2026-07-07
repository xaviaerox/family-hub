import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export default async function FeedingRedirectPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  // Get active family membership
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userData.user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  // Get first baby of the family
  const { data: babies } = await supabase
    .from("babies")
    .select("id")
    .eq("family_id", membership.family_id)
    .is("deleted_at", null)
    .order("created_at")
    .limit(1);

  if (babies && babies.length > 0 && babies[0]?.id) {
    redirect(`/dashboard/feeding/${babies[0].id}`);
  } else {
    redirect("/dashboard");
  }
}
