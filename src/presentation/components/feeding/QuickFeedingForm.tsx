"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { getFeedingRecommendation } from "@/application/feeding/getFeedingRecommendation";
import { registerFeedingEvent } from "@/application/feeding/registerFeedingEvent";
import type { FoodOption, RecentFeedingEvent } from "@/application/feeding/listFeeding";
import { Button } from "@/presentation/components/ui/Button";
import { Card } from "@/presentation/components/ui/Card";
import { Smile, Frown, Meh, AlertTriangle } from "lucide-react";

const REACTION_LABELS: Record<string, string> = {
  none: "Sin reacción",
  mild: "Leve",
  moderate: "Moderada",
  severe: "Grave",
};

export function QuickFeedingForm({
  babyId,
  createdBy,
  foodOptions,
  onRegistered,
  preselectedFoodId,
}: {
  babyId: string;
  createdBy: string;
  foodOptions: FoodOption[];
  onRegistered: (event: RecentFeedingEvent) => void;
  preselectedFoodId?: string;
}) {
  const [foodItemId, setFoodItemId] = useState(preselectedFoodId ?? foodOptions[0]?.id ?? "");
  const [reaction, setReaction] = useState<"none" | "mild" | "moderate" | "severe">("none");
  const [notes, setNotes] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedFoodId) {
      setFoodItemId(preselectedFoodId);
    }
  }, [preselectedFoodId]);

  useEffect(() => {
    if (!foodItemId) return;
    let cancelled = false;
    setIsChecking(true);
    setWarning(null);

    const supabase = createBrowserSupabaseClient();
    getFeedingRecommendation(supabase, { babyId, foodItemId }).then((rec) => {
      if (cancelled) return;
      setIsChecking(false);
      if ("error" in rec) return;

      if (!rec.minimumAge.ok) {
        setWarning(
          `Aún faltan ${rec.minimumAge.daysRemaining} días para la edad mínima recomendada de este alimento.`,
        );
      } else if (!rec.threeDayRule.ok) {
        setWarning(
          `Este alimento tiene alérgenos y en los últimos 3 días ya se introdujo por primera vez: ${rec.threeDayRule.conflictingFoodNames.join(", ")}. Se recomienda esperar antes de introducir otro alimento nuevo con alérgenos.`,
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [babyId, foodItemId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const result = await registerFeedingEvent(supabase, {
      babyId,
      foodItemId,
      occurredAt: new Date(),
      reaction,
      notes: notes.trim() || undefined,
      createdBy,
    });

    setIsSaving(true);
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo registrar.");
      return;
    }

    const food = foodOptions.find((f) => f.id === foodItemId);
    onRegistered({
      id: result.eventId!,
      occurredAt: new Date().toISOString(),
      reaction,
      notes: notes.trim() || null,
      foodItemId,
      foodName: food?.name ?? "—",
    });

    setReaction("none");
    setNotes("");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-500">Alimento</label>
          <select
            value={foodItemId}
            onChange={(e) => setFoodItemId(e.target.value)}
            className="w-full rounded-card border border-neutral-200 bg-transparent px-4 py-3.5 text-[15px] dark:border-neutral-700"
          >
            {foodOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-neutral-500">Reacción</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "none", icon: Smile, label: "Ninguna", color: "border-green-200 text-green-700 hover:bg-green-50/30", activeColor: "border-green-600 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 ring-2 ring-green-600/25" },
              { value: "mild", icon: Frown, label: "Leve", color: "border-amber-200 text-amber-700 hover:bg-amber-50/30", activeColor: "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 ring-2 ring-amber-600/25" },
              { value: "moderate", icon: Meh, label: "Mod.", color: "border-orange-200 text-orange-700 hover:bg-orange-50/30", activeColor: "border-orange-600 bg-amber-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 ring-2 ring-orange-600/25" },
              { value: "severe", icon: AlertTriangle, label: "Grave", color: "border-red-200 text-red-700 hover:bg-red-50/30", activeColor: "border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 ring-2 ring-red-600/25" },
            ].map((opt) => {
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReaction(opt.value as any)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-card border transition-all duration-200 ${
                    reaction === opt.value
                      ? opt.activeColor
                      : `${opt.color} border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300`
                  }`}
                >
                  <IconComp size={18} className="mb-1" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-500">Observaciones</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Le gustó mucho, comió la mitad, sarpullido..."
            rows={2}
            maxLength={500}
            className="w-full rounded-card border border-neutral-200 bg-transparent px-4 py-3 text-[15px] dark:border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all duration-200"
          />
        </div>

        {isChecking && <p className="text-sm text-neutral-400">Comprobando reglas…</p>}
        {warning && (
          <p className="rounded-card bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            ⚠️ {warning}
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" isLoading={isSaving}>
          Registrar ahora
        </Button>
      </form>
    </Card>
  );
}

export { REACTION_LABELS };
