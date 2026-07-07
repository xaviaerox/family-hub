"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { Card } from "@/presentation/components/ui/Card";
import { BabyAvatar } from "@/presentation/components/layout/BabyAvatar";
import { AlertCircle, Calendar } from "lucide-react";

interface Baby {
  id: string;
  firstName: string;
  birthDate: string;
  photoUrl: string | null;
  province: string | null;
}

interface Vaccine {
  id: string;
  name: string;
  diseases: string;
  ageMonths: number;
  ageLabel: string;
  recommended: boolean;
}

const VACCINES_CATALOG: Vaccine[] = [
  { id: "v1", name: "Hexavalente (Dosis 1)", diseases: "Difteria, Tétanos, Tos ferina, Polio, Hib, Hep. B", ageMonths: 2, ageLabel: "2 meses", recommended: true },
  { id: "v2", name: "Neumococo Conjugada (Dosis 1)", diseases: "Meningitis, neumonía por neumococo", ageMonths: 2, ageLabel: "2 meses", recommended: true },
  { id: "v3", name: "Meningococo B (Dosis 1)", diseases: "Meningitis tipo B", ageMonths: 2, ageLabel: "2 meses", recommended: true },
  { id: "v4", name: "Hexavalente (Dosis 2)", diseases: "Difteria, Tétanos, Tos ferina, Polio, Hib, Hep. B", ageMonths: 4, ageLabel: "4 meses", recommended: true },
  { id: "v5", name: "Meningococo B (Dosis 2)", diseases: "Meningitis tipo B", ageMonths: 4, ageLabel: "4 meses", recommended: true },
  { id: "v6", name: "Hexavalente (Dosis 3)", diseases: "Difteria, Tétanos, Tos ferina, Polio, Hib, Hep. B", ageMonths: 11, ageLabel: "11 meses", recommended: true },
  { id: "v7", name: "Neumococo Conjugada (Dosis 2)", diseases: "Meningitis, neumonía por neumococo", ageMonths: 11, ageLabel: "11 meses", recommended: true },
  { id: "v8", name: "Triple Vírica (Dosis 1)", diseases: "Sarampión, Rubeola, Parotiditis", ageMonths: 12, ageLabel: "12 meses", recommended: true },
  { id: "v9", name: "Meningococo ACWY (Dosis 1)", diseases: "Infecciones meningocócicas tipo A, C, W, Y", ageMonths: 12, ageLabel: "12 meses", recommended: true },
];

function getVaccineDate(birthDateStr: string, ageMonths: number): string {
  const birthDate = new Date(birthDateStr);
  birthDate.setMonth(birthDate.getMonth() + ageMonths);
  return birthDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HealthPage() {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [activeBabyId, setActiveBabyId] = useState<string>("");
  const [checkedByBaby, setCheckedByBaby] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: membership } = await supabase
          .from("family_members")
          .select("family_id")
          .eq("user_id", userData.user.id)
          .is("deleted_at", null)
          .limit(1)
          .maybeSingle();

        if (membership) {
          const { data: babiesData } = await supabase
            .from("babies")
            .select("id, first_name, birth_date, photo_url, province")
            .eq("family_id", membership.family_id)
            .is("deleted_at", null)
            .order("created_at");

          if (babiesData) {
            const mapped = babiesData.map((b) => ({
              id: b.id,
              firstName: b.first_name,
              birthDate: b.birth_date,
              photoUrl: b.photo_url,
              province: b.province,
            }));
            setBabies(mapped);
            if (mapped.length > 0 && mapped[0]) {
              setActiveBabyId(mapped[0].id);
            }

            // Load vaccine logs from Supabase
            const { data: logsData } = await supabase
              .from("vaccine_logs")
              .select("baby_id, vaccine_id")
              .is("deleted_at", null);

            const initialChecked: Record<string, string[]> = {};
            if (logsData) {
              logsData.forEach((log) => {
                if (!initialChecked[log.baby_id]) {
                  initialChecked[log.baby_id] = [];
                }
                initialChecked[log.baby_id]?.push(log.vaccine_id);
              });
            }
            setCheckedByBaby(initialChecked);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const activeBaby = babies.find((b) => b.id === activeBabyId);
  const checkedIds = activeBaby ? checkedByBaby[activeBaby.id] || [] : [];

  const toggleVaccine = async (vaccineId: string) => {
    if (!activeBaby) return;
    const isCurrentlyChecked = checkedIds.includes(vaccineId);

    // Optimistic UI update
    setCheckedByBaby((prev) => {
      const babyList = prev[activeBaby.id] || [];
      const newList = isCurrentlyChecked
        ? babyList.filter((x) => x !== vaccineId)
        : [...babyList, vaccineId];
      return { ...prev, [activeBaby.id]: newList };
    });

    if (isCurrentlyChecked) {
      await supabase
        .from("vaccine_logs")
        .update({ deleted_at: new Date().toISOString() })
        .eq("baby_id", activeBaby.id)
        .eq("vaccine_id", vaccineId);
    } else {
      await supabase
        .from("vaccine_logs")
        .insert({
          baby_id: activeBaby.id,
          vaccine_id: vaccineId,
          administered_at: new Date().toISOString().slice(0, 10),
        });
    }
  };

  const progressCount = checkedIds.length;
  const totalCount = VACCINES_CATALOG.length;
  const progressPercent = totalCount > 0 ? Math.round((progressCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <main className="mx-auto max-w-md px-6 pt-10 pb-24 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
        <p className="text-xs text-neutral-400 font-medium mt-3">Cargando cartilla de vacunas...</p>
      </main>
    );
  }

  if (babies.length === 0) {
    return (
      <main className="mx-auto max-w-md px-6 pt-10 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Salud y Vacunas</h1>
          <p className="text-[15px] text-neutral-500">Cartilla de inmunización del lactante.</p>
        </div>

        <Card className="p-6 text-center border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-transparent flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-3">
            <Calendar size={22} className="text-neutral-400" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No hay bebés registrados</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Añade el perfil de tu bebé desde la pantalla principal para poder calcular su calendario de vacunas personalizado por provincia.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-24">
      {/* Baby Selector Tabs */}
      {babies.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 scrollbar-none border-b border-neutral-100 dark:border-neutral-800/65">
          {babies.map((b) => {
            const isActive = b.id === activeBabyId;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBabyId(b.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-sm"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400"
                }`}
              >
                <BabyAvatar photoUrl={b.photoUrl} firstName={b.firstName} size={20} />
                <span>{b.firstName}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeBaby && (
        <>
          {/* Header Info */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                Salud y Vacunas
              </h1>
              <p className="text-[14px] text-neutral-500">
                Cartilla de inmunización de <strong>{activeBaby.firstName}</strong>
              </p>
            </div>
            <BabyAvatar photoUrl={activeBaby.photoUrl} firstName={activeBaby.firstName} size={44} />
          </div>

          {/* Location / Province Alert Banner */}
          {activeBaby.province ? (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white shadow-sm border border-neutral-800">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-200">
                  Calendario Oficial
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  España
                </span>
              </div>
              <h3 className="text-[14px] font-bold mt-2 flex items-center gap-1.5">
                Provincia: {activeBaby.province}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Fechas calculadas con base en el calendario de vacunación oficial de tu región y el nacimiento de {activeBaby.firstName}.
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex gap-3 text-amber-800 dark:text-amber-300">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Provincia no configurada</p>
                <p className="mt-1 leading-relaxed text-amber-700/80 dark:text-amber-400/80">
                  Configura la provincia de {activeBaby.firstName} desde el Home `⚙️` para ajustar las vacunas a su región. Mostrando calendario nacional común.
                </p>
              </div>
            </div>
          )}

          {/* Progress Card */}
          <Card className="p-4 mb-6 bg-neutral-50/50 dark:bg-neutral-900/35 border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                Cobertura Vacunal
              </span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 block">
                {progressPercent}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500 font-semibold block">
                Administradas
              </span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5 block">
                {progressCount} de {totalCount} dosis
              </span>
            </div>
          </Card>

          {/* Vaccines Checklist grouped by Age */}
          <h2 className="mb-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Planificación (0 a 12 meses)
          </h2>

          <div className="space-y-6">
            {["2 meses", "4 meses", "11 meses", "12 meses"].map((ageLabel) => {
              const ageMonths = ageLabel === "2 meses" ? 2 : ageLabel === "4 meses" ? 4 : ageLabel === "11 meses" ? 11 : 12;
              const groupVaccines = VACCINES_CATALOG.filter((v) => v.ageLabel === ageLabel);
              const targetDateStr = getVaccineDate(activeBaby.birthDate, ageMonths);

              return (
                <div key={ageLabel} className="space-y-2">
                  <div className="flex justify-between items-baseline px-1 border-b border-neutral-100 dark:border-neutral-800/60 pb-1">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      A los {ageLabel}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                      Fecha: {targetDateStr}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {groupVaccines.map((v) => {
                      const isChecked = checkedIds.includes(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleVaccine(v.id)}
                          className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                            isChecked
                              ? "bg-green-50/10 border-green-200/80 dark:bg-green-950/10 dark:border-green-900/30"
                              : "bg-white border-neutral-100 dark:bg-neutral-900 dark:border-neutral-850"
                          } hover:border-neutral-200 dark:hover:border-neutral-700 active:scale-[0.99]`}
                        >
                          {/* Interactive circular checkbox */}
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs mt-0.5 transition-all ${
                              isChecked
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-neutral-300 dark:border-neutral-700 bg-transparent text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <div className="flex-1 space-y-0.5">
                            <span
                              className={`text-[14px] font-bold block ${
                                isChecked
                                  ? "text-green-800 dark:text-green-400"
                                  : "text-neutral-900 dark:text-white"
                              }`}
                            >
                              {v.name}
                            </span>
                            <span className="text-xs text-neutral-400 block leading-tight">
                              Protege contra: {v.diseases}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
