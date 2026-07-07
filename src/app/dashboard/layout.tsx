import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { BottomNav } from "@/presentation/components/layout/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id, role")
    .eq("user_id", userData.user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-dvh pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
