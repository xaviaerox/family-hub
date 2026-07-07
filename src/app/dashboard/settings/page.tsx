import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { SignOutButton } from "@/presentation/components/family/SignOutButton";
import { Card } from "@/presentation/components/ui/Card";
import { InviteGenerator } from "@/presentation/components/family/InviteGenerator";
import { canManageMembers } from "@/domain/family/types";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return null;
  }

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id, role, families(name)")
    .eq("user_id", userData.user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  const familyName = (membership as { families: { name: string } | null } | null)?.families?.name;
  const role = membership?.role;

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-24">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
        Ajustes
      </h1>

      <Card className="mb-4">
        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
          Familia
        </span>
        <span className="text-[15px] font-bold text-neutral-900 dark:text-white mt-1 block">
          {familyName ?? "Sin familia"}
        </span>
      </Card>

      <Card className="mb-6">
        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
          Sesión iniciada
        </span>
        <span className="text-[15px] font-medium text-neutral-900 dark:text-white mt-1 block">
          {userData.user.email}
        </span>
      </Card>

      {role && canManageMembers(role) && membership?.family_id && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-neutral-500 uppercase tracking-wider text-xs">
            Configuración Familiar
          </h2>
          <Card>
            <InviteGenerator familyId={membership.family_id} createdBy={userData.user.id} />
          </Card>
        </div>
      )}

      <div className="mt-8">
        <SignOutButton />
      </div>
    </main>
  );
}
