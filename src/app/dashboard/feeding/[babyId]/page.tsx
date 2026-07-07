import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { listFoodOptions, listRecentFeedingEvents } from "@/application/feeding/listFeeding";
import { FeedingPageClient } from "@/presentation/components/feeding/FeedingPageClient";

export default async function FeedingPage({
  params,
}: {
  params: Promise<{ babyId: string }>;
}) {
  const { babyId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) notFound();

  const { data: baby } = await supabase
    .from("babies")
    .select("id, first_name")
    .eq("id", babyId)
    .maybeSingle();

  if (!baby) notFound();

  const [foodOptions, recentEvents, { data: allergensList }] = await Promise.all([
    listFoodOptions(supabase, baby.id),
    listRecentFeedingEvents(supabase, baby.id),
    supabase.from("allergens").select("id, name, slug").order("name"),
  ]);

  return (
    <FeedingPageClient
      babyId={baby.id}
      babyName={baby.first_name}
      createdBy={userData.user.id}
      foodOptions={foodOptions}
      initialEvents={recentEvents}
      allergens={allergensList ?? []}
    />
  );
}
