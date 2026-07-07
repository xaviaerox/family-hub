"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { Button } from "@/presentation/components/ui/Button";
import { Settings, ChevronRight, AlertTriangle } from "lucide-react";
import { BabyAvatar, AVATAR_PRESETS } from "@/presentation/components/layout/BabyAvatar";
import { SPANISH_PROVINCES } from "@/shared/constants/provinces";

interface Baby {
  id: string;
  firstName: string;
  birthDate: string;
  dueDate: string | null;
  familyId: string;
  triedFoodsCount: number;
  photoUrl: string | null;
  province: string | null;
}

function calculateAge(birthDateStr: string): string {
  const birthDate = new Date(birthDateStr);
  const now = new Date();

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "año" : "años"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "mes" : "meses"}`);
  if (days > 0 && years === 0) parts.push(`${days} ${days === 1 ? "día" : "días"}`);

  return parts.join(", ") || "Recién nacido";
}

export function DashboardClient({
  familyName,
  babies,
  totalFoodsCount,
}: {
  familyName: string;
  babies: Baby[];
  totalFoodsCount: number;
}) {
  const router = useRouter();
  const [babiesList, setBabiesList] = useState<Baby[]>(babies);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserSupabaseClient();

  const handleOpenEdit = (baby: Baby) => {
    setSelectedBaby(baby);
    setEditName(baby.firstName);
    setEditBirthDate(baby.birthDate);
    setEditDueDate(baby.dueDate || "");
    setEditPhotoUrl(baby.photoUrl || "");
    setEditProvince(baby.province || "");
    setShowDeleteConfirm(false);
    setError(null);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBaby) return;

    if (!editName.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!editBirthDate) {
      setError("La fecha de nacimiento es requerida.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("babies")
      .update({
        first_name: editName.trim(),
        birth_date: editBirthDate,
        due_date: editDueDate || null,
        photo_url: editPhotoUrl.trim() || null,
        province: editProvince || null,
      })
      .eq("id", selectedBaby.id);

    if (updateError) {
      setError("Error al guardar los cambios: " + updateError.message);
      setIsSaving(false);
      return;
    }

    // Update state local list
    setBabiesList((prev) =>
      prev.map((b) =>
        b.id === selectedBaby.id
          ? {
              ...b,
              firstName: editName.trim(),
              birthDate: editBirthDate,
              dueDate: editDueDate || null,
              photoUrl: editPhotoUrl.trim() || null,
              province: editProvince || null,
            }
          : b
      )
    );

    setIsSaving(false);
    setSelectedBaby(null);
  };

  const handleDeleteBaby = async () => {
    if (!selectedBaby) return;

    setIsDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("babies")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", selectedBaby.id);

    if (deleteError) {
      setError("Error al eliminar perfil: " + deleteError.message);
      setIsDeleting(false);
      return;
    }

    // Remove from state list
    setBabiesList((prev) => prev.filter((b) => b.id !== selectedBaby.id));
    setIsDeleting(false);
    setSelectedBaby(null);
    setShowDeleteConfirm(false);
  };

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-24">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900 dark:text-white">
        {familyName}
      </h1>
      <p className="mb-8 text-[15px] text-neutral-500">
        {babiesList.length > 0
          ? "Toca un bebé para registrar su alimentación."
          : "Añade a tu bebé para empezar a registrar su alimentación."}
      </p>

      <div className="mb-8 space-y-4">
        {babiesList.map((baby) => {
          const progressPercent = Math.round(
            (baby.triedFoodsCount / Math.max(1, totalFoodsCount)) * 100
          );

          return (
            <div
              key={baby.id}
              onClick={() => router.push(`/dashboard/feeding/${baby.id}`)}
              className="group relative block w-full p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-700 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Custom Avatar component */}
                <BabyAvatar photoUrl={baby.photoUrl} firstName={baby.firstName} size={48} />

                {/* Info */}
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white truncate">
                    {baby.firstName}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    {calculateAge(baby.birthDate)}
                    {baby.province ? ` • ${baby.province}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Settings gear */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(baby);
                    }}
                    className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 border border-neutral-100 dark:border-neutral-800 transition-colors"
                  >
                    <Settings size={16} />
                  </button>

                  <ChevronRight
                    size={20}
                    className="text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0"
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-neutral-50 dark:border-neutral-800/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 dark:text-neutral-500 mb-1.5">
                  <span>Progreso de alimentación</span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {baby.triedFoodsCount} / {totalFoodsCount} probados ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <Link href="/dashboard/babies/new">
          <Button variant="secondary" className="w-full justify-center">
            Añadir bebé
          </Button>
        </Link>
      </div>

      {/* EDIT/DELETE BABY MODAL */}
      {selectedBaby && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setSelectedBaby(null)} />

          <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Editar perfil de {selectedBaby.firstName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBaby(null)}
                className="w-7 h-7 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {!showDeleteConfirm ? (
              <form onSubmit={handleSaveChanges} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-500">
                    Avatar o Foto de perfil
                  </label>
                  
                  {/* Preset Selector Grid */}
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1.5 scrollbar-none">
                    {/* Default initials option */}
                    <button
                      type="button"
                      onClick={() => setEditPhotoUrl("")}
                      className={`relative p-0.5 rounded-full border-2 transition-all ${
                        !editPhotoUrl
                          ? "border-neutral-950 dark:border-white scale-105"
                          : "border-transparent opacity-60"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-sm">
                        {editName ? editName.charAt(0).toUpperCase() : "👶"}
                      </div>
                    </button>
                    
                    {AVATAR_PRESETS.map((p) => {
                      const isSelected = editPhotoUrl === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setEditPhotoUrl(p)}
                          className={`relative p-0.5 rounded-full border-2 transition-all ${
                            isSelected
                              ? "border-neutral-950 dark:border-white scale-105"
                              : "border-transparent opacity-60"
                          }`}
                        >
                          <BabyAvatar photoUrl={p} firstName={editName || "Bebé"} size={40} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom URL Input */}
                  <input
                    type="text"
                    value={(AVATAR_PRESETS as readonly string[]).includes(editPhotoUrl) ? "" : editPhotoUrl}
                    onChange={(e) => setEditPhotoUrl(e.target.value)}
                    placeholder="O pega una URL de foto..."
                    className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-xs dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-sm dark:border-neutral-700 text-neutral-900 dark:text-white"
                    placeholder="Ej. Leyre"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-sm dark:border-neutral-700 text-neutral-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 flex justify-between">
                    <span>Fecha estimada de parto</span>
                    <span className="text-[10px] text-neutral-400">(Opcional, para prematuros)</span>
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-sm dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500">
                    Provincia (España)
                  </label>
                  <select
                    value={editProvince}
                    onChange={(e) => setEditProvince(e.target.value)}
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

                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full justify-center" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    Eliminar Perfil de Bebé
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg flex gap-3 text-red-800 dark:text-red-300">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">¿Eliminar permanentemente?</p>
                    <p className="mt-1 leading-relaxed text-red-600 dark:text-red-400">
                      Esta acción eliminará el perfil de <strong>{selectedBaby.firstName}</strong> y todo su historial de tomas y alérgenos de forma irreversible.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteBaby}
                    className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 active:scale-[0.98] transition-all"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Eliminando..." : "Sí, Eliminar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
