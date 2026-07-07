"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { createInvite } from "@/application/family/createInvite";
import { Button } from "@/presentation/components/ui/Button";

/**
 * Genera un código de invitación en 1 pulsación. Solo se monta cuando el
 * usuario actual puede gestionar miembros (canManageMembers), decidido en
 * el server component padre — este componente no repite esa comprobación
 * de autorización, solo la operación en sí.
 */
export function InviteGenerator({
  familyId,
  createdBy,
}: {
  familyId: string;
  createdBy: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const result = await createInvite(supabase, {
      familyId,
      role: "parent",
      createdBy,
    });

    setIsLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo generar el código.");
      return;
    }
    setCode(result.code ?? null);
  }

  if (code) {
    return (
      <div>
        <p className="mb-1 text-sm text-neutral-500">Comparte este código:</p>
        <p className="text-3xl font-semibold tracking-widest text-neutral-900 dark:text-white">
          {code}
        </p>
        <p className="mt-2 text-xs text-neutral-400">Caduca en 7 días.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-[15px] text-neutral-600 dark:text-neutral-300">
        Invita a otro familiar o cuidador con un código.
      </p>
      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
      <Button variant="secondary" onClick={handleGenerate} isLoading={isLoading}>
        Generar código de invitación
      </Button>
    </div>
  );
}
