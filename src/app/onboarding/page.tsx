"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { createFamilyWithCreator } from "@/application/family/createFamilyWithCreator";
import { joinFamilyWithCode } from "@/application/family/joinFamilyWithCode";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";

type Mode = "choose" | "create" | "join";

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const result = await createFamilyWithCreator(supabase, {
      name: value,
      userId: userData.user.id,
    });

    setIsLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo crear la familia.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const result = await joinFamilyWithCode(supabase, { code: value });

    setIsLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo unir a la familia.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {mode === "choose" && (
          <>
            <h1 className="mb-8 text-2xl font-semibold text-neutral-900 dark:text-white">
              ¿Cómo empezamos?
            </h1>
            <div className="space-y-3">
              <Button onClick={() => setMode("create")}>Crear mi familia</Button>
              <Button variant="secondary" onClick={() => setMode("join")}>
                Unirme con un código
              </Button>
            </div>
          </>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-3">
            <h1 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
              Nombre de tu familia
            </h1>
            <Input
              placeholder="Ej. Familia García"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" isLoading={isLoading}>
              Continuar
            </Button>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-3">
            <h1 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
              Código de invitación
            </h1>
            <Input
              placeholder="Ej. 7K3MZP2A"
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              autoFocus
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" isLoading={isLoading}>
              Unirme
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
