import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { DashboardClient } from "@/presentation/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id, role, families(name)")
    .eq("user_id", userData.user!.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  const familyName = (membership as { families: { name: string } | null } | null)?.families?.name;

  const { data: babies } = await supabase
    .from("babies")
    .select("id, first_name, birth_date, due_date, family_id, photo_url, province")
    .eq("family_id", membership?.family_id ?? "")
    .is("deleted_at", null)
    .order("created_at");

  const { count: totalFoodsCount } = await supabase
    .from("food_items")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const babiesWithStats = await Promise.all(
    (babies ?? []).map(async (baby) => {
      const { data: events } = await supabase
        .from("feeding_events")
        .select("food_item_id")
        .eq("baby_id", baby.id)
        .is("deleted_at", null);

      const triedFoodsCount = events ? new Set(events.map((e) => e.food_item_id)).size : 0;

      return {
        id: baby.id,
        firstName: baby.first_name,
        birthDate: baby.birth_date,
        dueDate: baby.due_date,
        familyId: baby.family_id,
        triedFoodsCount,
        photoUrl: baby.photo_url,
        province: baby.province,
      };
    })
  );

  return (
    <DashboardClient
      familyName={familyName ?? "Tu familia"}
      babies={babiesWithStats}
      totalFoodsCount={totalFoodsCount ?? 0}
    />
  );
}
