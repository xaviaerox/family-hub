"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { Button } from "@/presentation/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      Cerrar sesión
    </Button>
  );
}
