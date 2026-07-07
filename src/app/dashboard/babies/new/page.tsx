"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { createBaby } from "@/application/baby/createBaby";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { BabyAvatar, AVATAR_PRESETS } from "@/presentation/components/layout/BabyAvatar";
import { SPANISH_PROVINCES } from "@/shared/constants/provinces";

export default function NewBabyPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [province, setProvince] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: membership } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userData.user.id)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      setIsLoading(false);
      setError("No se encontró tu familia.");
      return;
    }

    const result = await createBaby(supabase, {
      familyId: membership.family_id,
      firstName,
      birthDate,
      dueDate: dueDate || null,
      photoUrl: photoUrl.trim() || null,
      province: province || null,
    });

    setIsLoading(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo crear el bebé.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-24">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
        Añadir bebé
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-neutral-500">Avatar o Foto de perfil</label>
          
          {/* Preset Selector Grid */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1.5 scrollbar-none">
            {/* Default initials option */}
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className={`relative p-0.5 rounded-full border-2 transition-all ${
                !photoUrl
                  ? "border-neutral-950 dark:border-white scale-105"
                  : "border-transparent opacity-60"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-sm">
                {firstName ? firstName.charAt(0).toUpperCase() : "👶"}
              </div>
            </button>
            
            {AVATAR_PRESETS.map((p) => {
              const isSelected = photoUrl === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPhotoUrl(p)}
                  className={`relative p-0.5 rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-neutral-950 dark:border-white scale-105"
                      : "border-transparent opacity-60"
                  }`}
                >
                  <BabyAvatar photoUrl={p} firstName={firstName || "Bebé"} size={40} />
                </button>
              );
            })}
          </div>

          {/* Custom URL Input */}
          <input
            type="text"
            value={(AVATAR_PRESETS as readonly string[]).includes(photoUrl) ? "" : photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="O pega una URL de foto..."
            className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-xs dark:border-neutral-700 text-neutral-900 dark:text-white"
          />
        </div>

        <Input
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoFocus
          required
        />
        
        <div>
          <label className="mb-1 block text-sm text-neutral-500">Fecha de nacimiento</label>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="mb-1 block text-sm text-neutral-500">
            Fecha probable de parto (opcional, solo si fue prematuro)
          </label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-500">Provincia (para vacunación)</label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-sm dark:border-neutral-700 text-neutral-900 dark:text-white"
          >
            <option value="" className="text-neutral-500">Selecciona una provincia...</option>
            {SPANISH_PROVINCES.map((p) => (
              <option key={p} value={p} className="text-neutral-900 dark:text-neutral-900">
                {p}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <Button type="submit" isLoading={isLoading} className="w-full justify-center">
          Guardar
        </Button>
      </form>
    </main>
  );
}
