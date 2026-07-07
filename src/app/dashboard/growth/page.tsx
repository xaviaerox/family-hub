"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { Card } from "@/presentation/components/ui/Card";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { BabyAvatar } from "@/presentation/components/layout/BabyAvatar";
import {
  getCorrectedAgeInDays,
  getChronologicalAgeInDays,
  isPrematureBirth,
} from "@/domain/baby/correctedAge";
import { Plus, Edit2, Trash2, Calendar, Scale, Ruler, Circle, AlertCircle, Award } from "lucide-react";

interface Baby {
  id: string;
  firstName: string;
  birthDate: string;
  dueDate: string | null;
  photoUrl: string | null;
  province: string | null;
}

interface LocalMeasurement {
  id: string;
  date: string;
  weight: number | null;
  height: number | null;
  head: number | null;
  ageMonths: number;
}

interface WHOCurve {
  p3: number;
  p50: number;
  p97: number;
}

interface Milestone {
  id: string;
  name: string;
  category: string;
  ageMonths: number;
  ageLabel: string;
  description: string;
}

const MILESTONES_CATALOG: Milestone[] = [
  { id: "m1", name: "Sonrisa social", category: "Social/Emocional", ageMonths: 2, ageLabel: "2 meses", description: "Sonríe a las personas y busca llamar la atención." },
  { id: "m2", name: "Sostiene la cabeza", category: "Motor Grueso", ageMonths: 2, ageLabel: "2 meses", description: "Levanta la cabeza y el pecho cuando está boca abajo." },
  { id: "m3", name: "Balbuceo / Gorjeo", category: "Comunicación", ageMonths: 4, ageLabel: "4 meses", description: "Empieza a balbucear y a imitar sonidos que escucha." },
  { id: "m4", name: "Agarra juguetes", category: "Motor Fino", ageMonths: 4, ageLabel: "4 meses", description: "Alcanza juguetes y los agarra con las manos." },
  { id: "m5", name: "Se da la vuelta", category: "Motor Grueso", ageMonths: 6, ageLabel: "6 meses", description: "Se voltea en ambas direcciones." },
  { id: "m6", name: "Se sienta con apoyo", category: "Motor Grueso", ageMonths: 6, ageLabel: "6 meses", description: "Se mantiene sentado con un poco de apoyo o cojines." },
  { id: "m7", name: "Gatea", category: "Motor Grueso", ageMonths: 9, ageLabel: "9 meses", description: "Se desplaza a gatas o arrastrándose boca abajo." },
  { id: "m8", name: "Responde a su nombre", category: "Comunicación", ageMonths: 9, ageLabel: "9 meses", description: "Voltea a mirar cuando lo llaman por su nombre." },
  { id: "m9", name: "Se pone de pie solo", category: "Motor Grueso", ageMonths: 12, ageLabel: "12 meses", description: "Se pone de pie apoyándose o sin apoyo y da algunos pasos." },
  { id: "m10", name: "Primeras palabras", category: "Comunicación", ageMonths: 12, ageLabel: "12 meses", description: "Dice palabras sencillas como 'mamá' o 'papá' con significado." },
];

const WHO_WEIGHT: Record<number, WHOCurve> = {
  0: { p3: 2.4, p50: 3.3, p97: 4.3 },
  2: { p3: 4.3, p50: 5.4, p97: 6.9 },
  4: { p3: 5.4, p50: 6.8, p97: 8.5 },
  6: { p3: 6.3, p50: 7.9, p97: 9.8 },
  8: { p3: 7.0, p50: 8.8, p97: 10.9 },
  10: { p3: 7.6, p50: 9.6, p97: 11.9 },
  12: { p3: 8.1, p50: 10.2, p97: 12.7 },
};

const WHO_HEIGHT: Record<number, WHOCurve> = {
  0: { p3: 46.0, p50: 49.5, p97: 53.0 },
  2: { p3: 52.5, p50: 56.4, p97: 60.5 },
  4: { p3: 57.0, p50: 61.5, p97: 66.0 },
  6: { p3: 60.8, p50: 65.5, p97: 70.0 },
  8: { p3: 64.0, p50: 69.0, p97: 73.8 },
  10: { p3: 66.8, p50: 72.0, p97: 77.0 },
  12: { p3: 69.2, p50: 74.8, p97: 80.2 },
};

const WHO_HEAD: Record<number, WHOCurve> = {
  0: { p3: 31.5, p50: 34.5, p97: 37.0 },
  2: { p3: 35.0, p50: 38.0, p97: 40.5 },
  4: { p3: 37.8, p50: 40.8, p97: 43.5 },
  6: { p3: 39.5, p50: 42.8, p97: 45.8 },
  8: { p3: 40.8, p50: 44.2, p97: 47.2 },
  10: { p3: 41.8, p50: 45.4, p97: 48.5 },
  12: { p3: 42.6, p50: 46.4, p97: 49.6 },
};

function interpolateWHO(catalog: Record<number, WHOCurve>, ageMonths: number): WHOCurve {
  const clamped = Math.max(0, Math.min(12, ageMonths));
  const keys = Object.keys(catalog).map(Number).sort((a, b) => a - b);

  let lowerKey = keys[0]!;
  let upperKey = keys[keys.length - 1]!;

  for (let i = 0; i < keys.length - 1; i++) {
    const k1 = keys[i]!;
    const k2 = keys[i + 1]!;
    if (clamped >= k1 && clamped <= k2) {
      lowerKey = k1;
      upperKey = k2;
      break;
    }
  }

  if (lowerKey === upperKey) {
    return catalog[lowerKey]!;
  }

  const t = (clamped - lowerKey) / (upperKey - lowerKey);
  const low = catalog[lowerKey]!;
  const high = catalog[upperKey]!;

  return {
    p3: low.p3 + (high.p3 - low.p3) * t,
    p50: low.p50 + (high.p50 - low.p50) * t,
    p97: low.p97 + (high.p97 - low.p97) * t,
  };
}

function calculatePercentile(val: number, curves: WHOCurve): number {
  const { p3, p50, p97 } = curves;
  if (val <= p3) {
    return Math.max(1, Math.round(3 * (val / p3)));
  }
  if (val === p50) {
    return 50;
  }
  if (val === p97) {
    return 97;
  }
  if (val < p50) {
    return Math.round(3 + ((val - p3) / (p50 - p3)) * 47);
  }
  return Math.round(50 + ((val - p50) / (p97 - p50)) * 47);
}

export default function GrowthPage() {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [activeBabyId, setActiveBabyId] = useState<string>("");
  const [useCorrectedAge, setUseCorrectedAge] = useState(true);
  const [measurements, setMeasurements] = useState<LocalMeasurement[]>([]);
  const [milestonesChecked, setMilestonesChecked] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab Switch: "curves" or "milestones"
  const [mainTab, setMainTab] = useState<"curves" | "milestones">("curves");
  const [activeMetric, setActiveMetric] = useState<"weight" | "height" | "head">("weight");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formHead, setFormHead] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    async function loadBabies() {
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
            .select("id, first_name, birth_date, due_date, photo_url, province")
            .eq("family_id", membership.family_id)
            .is("deleted_at", null)
            .order("created_at");

          if (babiesData) {
            const mapped = babiesData.map((b) => ({
              id: b.id,
              firstName: b.first_name,
              birthDate: b.birth_date,
              dueDate: b.due_date,
              photoUrl: b.photo_url,
              province: b.province,
            }));
            setBabies(mapped);
            if (mapped.length > 0 && mapped[0]) {
              setActiveBabyId(mapped[0].id);
            }

            // Load milestone logs from Supabase
            const { data: mLogs } = await supabase
              .from("development_milestone_logs")
              .select("baby_id, milestone_id")
              .is("deleted_at", null);

            const initialMilestones: Record<string, string[]> = {};
            if (mLogs) {
              mLogs.forEach((log) => {
                if (!initialMilestones[log.baby_id]) {
                  initialMilestones[log.baby_id] = [];
                }
                initialMilestones[log.baby_id]?.push(log.milestone_id);
              });
            }
            setMilestonesChecked(initialMilestones);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBabies();
  }, []);

  const activeBaby = babies.find((b) => b.id === activeBabyId);
  const isPremature = activeBaby ? isPrematureBirth(new Date(activeBaby.birthDate), activeBaby.dueDate ? new Date(activeBaby.dueDate) : null) : false;

  useEffect(() => {
    if (!activeBabyId) return;

    async function loadMeasurements() {
      const { data } = await supabase
        .from("growth_measurements")
        .select("id, measured_at, weight_kg, height_cm, head_circumference_cm")
        .eq("baby_id", activeBabyId)
        .is("deleted_at", null)
        .order("measured_at");

      if (data && activeBaby) {
        const birthDate = new Date(activeBaby.birthDate);
        const dueDate = activeBaby.dueDate ? new Date(activeBaby.dueDate) : null;

        const mapped: LocalMeasurement[] = data.map((m) => {
          const refDate = new Date(m.measured_at);
          let ageDays = 0;
          if (useCorrectedAge && isPrematureBirth(birthDate, dueDate)) {
            ageDays = getCorrectedAgeInDays({ birthDate, dueDate, reference: refDate });
          } else {
            ageDays = getChronologicalAgeInDays(birthDate, refDate);
          }
          const ageMonths = Math.max(0, ageDays / 30.4375);

          return {
            id: m.id,
            date: m.measured_at,
            weight: m.weight_kg ? Number(m.weight_kg) : null,
            height: m.height_cm ? Number(m.height_cm) : null,
            head: m.head_circumference_cm ? Number(m.head_circumference_cm) : null,
            ageMonths,
          };
        });
        setMeasurements(mapped);
      } else {
        setMeasurements([]);
      }
    }

    loadMeasurements();
  }, [activeBabyId, useCorrectedAge, babies]);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormWeight("");
    setFormHeight("");
    setFormHead("");
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (m: LocalMeasurement) => {
    setEditId(m.id);
    setFormDate(m.date);
    setFormWeight(m.weight ? String(m.weight) : "");
    setFormHeight(m.height ? String(m.height) : "");
    setFormHead(m.head ? String(m.head) : "");
    setFormError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta medición?")) return;

    const { error } = await supabase
      .from("growth_measurements")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      alert("Error al eliminar registro: " + error.message);
      return;
    }
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBabyId) return;

    if (!formWeight && !formHeight && !formHead) {
      setFormError("Ingresa al menos una de las mediciones.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      baby_id: activeBabyId,
      measured_at: formDate,
      weight_kg: formWeight ? parseFloat(formWeight) : null,
      height_cm: formHeight ? parseFloat(formHeight) : null,
      head_circumference_cm: formHead ? parseFloat(formHead) : null,
    };

    let resultError;
    if (editId) {
      const { error } = await supabase
        .from("growth_measurements")
        .update(payload)
        .eq("id", editId);
      resultError = error;
    } else {
      const { error } = await supabase
        .from("growth_measurements")
        .insert(payload);
      resultError = error;
    }

    if (resultError) {
      setFormError("Error al guardar: " + resultError.message);
      setIsSaving(false);
      return;
    }

    // Refresh local measurements
    setIsSaving(false);
    setShowModal(false);
    // Force refresh state by reloading active baby measurements
    setActiveBabyId("");
    setTimeout(() => setActiveBabyId(activeBabyId), 10);
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!activeBaby) return;
    const babyList = milestonesChecked[activeBaby.id] || [];
    const isChecked = babyList.includes(milestoneId);

    // Optimistic UI update
    setMilestonesChecked((prev) => {
      const list = prev[activeBaby.id] || [];
      const newList = isChecked
        ? list.filter((x) => x !== milestoneId)
        : [...list, milestoneId];
      return { ...prev, [activeBaby.id]: newList };
    });

    if (isChecked) {
      await supabase
        .from("development_milestone_logs")
        .update({ deleted_at: new Date().toISOString() })
        .eq("baby_id", activeBaby.id)
        .eq("milestone_id", milestoneId);
    } else {
      await supabase
        .from("development_milestone_logs")
        .insert({
          baby_id: activeBaby.id,
          milestone_id: milestoneId,
          achieved_at: new Date().toISOString().slice(0, 10),
        });
    }
  };

  // Metric settings helpers
  const getCatalog = () => {
    if (activeMetric === "weight") return WHO_WEIGHT;
    if (activeMetric === "height") return WHO_HEIGHT;
    return WHO_HEAD;
  };

  const getMetricDetails = () => {
    if (activeMetric === "weight") {
      return {
        title: "Peso",
        unit: "kg",
        yMin: 2.0,
        yMax: 14.0,
        getValue: (m: LocalMeasurement) => m.weight,
        gridStep: 2,
      };
    }
    if (activeMetric === "height") {
      return {
        title: "Talla / Altura",
        unit: "cm",
        yMin: 40.0,
        yMax: 85.0,
        getValue: (m: LocalMeasurement) => m.height,
        gridStep: 10,
      };
    }
    return {
      title: "Perímetro Cefálico",
      unit: "cm",
      yMin: 30.0,
      yMax: 52.0,
      getValue: (m: LocalMeasurement) => m.head,
      gridStep: 5,
    };
  };

  const { title: metricTitle, unit, yMin, yMax, getValue, gridStep } = getMetricDetails();
  const catalog = getCatalog();

  // Coordinates Mapping
  const getSvgX = (months: number) => 40 + (months / 12) * (300 - 40);
  const getSvgY = (val: number) => 145 - ((val - yMin) / (yMax - yMin)) * (145 - 15);

  // SVG path generators for WHO curves
  const getWHOPath = (curveKey: "p3" | "p50" | "p97") => {
    const points = [];
    for (let m = 0; m <= 12; m++) {
      const whoVal = interpolateWHO(catalog, m)[curveKey];
      points.push(`${getSvgX(m)},${getSvgY(whoVal)}`);
    }
    return `M ${points.join(" L ")}`;
  };

  // Filter and sort baby measurements
  const validPoints = measurements
    .filter((m) => getValue(m) !== null)
    .map((m) => ({
      x: m.ageMonths,
      y: getValue(m) as number,
      date: m.date,
    }))
    .sort((a, b) => a.x - b.x);

  const babyPath = validPoints.length > 0
    ? `M ${validPoints.map((pt) => `${getSvgX(pt.x)},${getSvgY(pt.y)}`).join(" L ")}`
    : "";

  const getMilestoneTargetDate = (birthDateStr: string, ageMonths: number): string => {
    const birthDate = new Date(birthDateStr);
    const dueDate = activeBaby?.dueDate ? new Date(activeBaby.dueDate) : null;
    
    // Adjust FPP difference if corrected age is active
    let addedDays = ageMonths * 30.4375;
    if (useCorrectedAge && isPrematureBirth(birthDate, dueDate)) {
      const diffDays = Math.round((dueDate!.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      addedDays += diffDays; // delay the milestone date by prematurity days
    }
    
    const targetDate = new Date(birthDate.getTime() + addedDays * 24 * 60 * 60 * 1000);
    return targetDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-md px-6 pt-10 pb-24 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
        <p className="text-xs text-neutral-400 font-medium mt-3">Cargando cartilla de crecimiento...</p>
      </main>
    );
  }

  if (babies.length === 0) {
    return (
      <main className="mx-auto max-w-md px-6 pt-10 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Crecimiento</h1>
          <p className="text-[15px] text-neutral-500">Curvas y percentiles oficiales de desarrollo.</p>
        </div>

        <Card className="p-6 text-center border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-transparent flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-3">
            <Scale size={22} className="text-neutral-400" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No hay bebés registrados</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Añade el perfil de tu bebé desde la pantalla principal para poder graficar sus percentiles y curva de desarrollo.
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
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Crecimiento y Desarrollo</h1>
              <p className="text-[14px] text-neutral-500">
                Cartilla evolutiva de <strong>{activeBaby.firstName}</strong>
              </p>
            </div>
            <BabyAvatar photoUrl={activeBaby.photoUrl} firstName={activeBaby.firstName} size={44} />
          </div>

          {/* Main Module Tabs Switch: Curves vs Milestones */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl">
            <button
              onClick={() => setMainTab("curves")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mainTab === "curves"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Curvas de Crecimiento
            </button>
            <button
              onClick={() => setMainTab("milestones")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mainTab === "milestones"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Hitos del Desarrollo (OMS)
            </button>
          </div>

          {/* Premature Age Mode Toggle Banner */}
          {isPremature && (
            <div className="mb-6 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/30 flex justify-between items-center text-sky-850 dark:text-sky-300">
              <div className="flex gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Bebé Prematuro</p>
                  <p className="mt-0.5 leading-relaxed text-sky-700/80 dark:text-sky-400/80">
                    Se recomienda evaluar el crecimiento usando la edad corregida.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUseCorrectedAge(!useCorrectedAge)}
                className={`ml-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  useCorrectedAge
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-transparent border-sky-300 hover:bg-sky-100 text-sky-700"
                }`}
              >
                {useCorrectedAge ? "Edad Corregida" : "Edad Cronológica"}
              </button>
            </div>
          )}

          {mainTab === "curves" ? (
            <>
              {/* Metric selector and Add button */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800/85 p-0.5 rounded-lg">
                  {(["weight", "height", "head"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setActiveMetric(m)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        activeMetric === m
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      {m === "weight" ? "Peso" : m === "height" ? "Talla" : "Cefálico"}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-white px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  <Plus size={14} /> Registrar
                </button>
              </div>

              {/* Dynamic SVG Percentile Chart */}
              <Card className="p-4 mb-6">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 flex justify-between">
                  <span>Curva de {metricTitle} (OMS)</span>
                  <span className="text-[10px] text-neutral-500 font-bold lowercase">valores en {unit}</span>
                </h3>
                
                <div className="w-full bg-neutral-50 dark:bg-neutral-950/30 rounded-xl p-3 border border-neutral-100 dark:border-neutral-800/80">
                  <svg viewBox="0 0 320 180" className="w-full h-auto overflow-visible">
                    {/* Horizontal Grid Lines */}
                    {Array.from({ length: Math.floor((yMax - yMin) / gridStep) + 1 }).map((_, i) => {
                      const val = yMin + i * gridStep;
                      const svgY = getSvgY(val);
                      return (
                        <g key={i}>
                          <line
                            x1="40"
                            y1={svgY}
                            x2="300"
                            y2={svgY}
                            stroke="#e5e5e5"
                            strokeWidth="1"
                            className="dark:stroke-neutral-800/60"
                          />
                          <text
                            x="35"
                            y={svgY + 2.5}
                            textAnchor="end"
                            className="text-[8px] fill-neutral-400 font-bold dark:fill-neutral-500"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* WHO Curves */}
                    <path
                      d={getWHOPath("p97")}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />
                    <path
                      d={getWHOPath("p50")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      opacity="0.5"
                    />
                    <path
                      d={getWHOPath("p3")}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity="0.4"
                    />

                    {/* Baby's Growth Curve */}
                    {babyPath && (
                      <path
                        d={babyPath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-neutral-900 dark:text-white"
                      />
                    )}

                    {/* Baby's data points */}
                    {validPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={getSvgX(pt.x)}
                        cy={getSvgY(pt.y)}
                        r="4"
                        className="fill-neutral-900 dark:fill-white stroke-white dark:stroke-neutral-900 stroke-2"
                      />
                    ))}

                    {/* X Axis labels (months 0 to 12) */}
                    {[0, 2, 4, 6, 8, 10, 12].map((m) => (
                      <text
                        key={m}
                        x={getSvgX(m)}
                        y="162"
                        textAnchor="middle"
                        className="text-[8px] fill-neutral-400 font-bold dark:fill-neutral-500"
                      >
                        {m}m
                      </text>
                    ))}
                  </svg>
                </div>
                
                <div className="flex justify-between mt-3 text-[10px] text-neutral-400 font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-red-400 block" /> Percentil 3 / 97</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-green-500 block" /> Mediana OMS (p50)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-neutral-900 dark:bg-white block" /> {activeBaby.firstName}</span>
                </div>
              </Card>

              {/* Measurements List Table */}
              <h2 className="mb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Registro Histórico
              </h2>
              
              {measurements.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">No hay mediciones registradas para este bebé.</p>
              ) : (
                <div className="space-y-3">
                  {measurements.map((m) => {
                    const val = getValue(m);
                    if (val === null) return null;

                    const who = interpolateWHO(catalog, m.ageMonths);
                    const pct = calculatePercentile(val, who);

                    return (
                      <div
                        key={m.id}
                        className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                            {activeMetric === "weight" ? <Scale size={16} /> : <Ruler size={16} />}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-neutral-900 dark:text-white">
                              {val} {unit}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {new Date(m.date).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md">
                              Percentil {pct}
                            </span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              {Math.round(m.ageMonths * 10) / 10} {m.ageMonths === 1 ? "mes" : "meses"}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-600"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Milestones Progress Card */}
              {(() => {
                const babyList = milestonesChecked[activeBaby.id] || [];
                const achievedCount = babyList.length;
                const percent = Math.round((achievedCount / MILESTONES_CATALOG.length) * 100);

                return (
                  <Card className="p-4 mb-6 bg-neutral-50/50 dark:bg-neutral-900/35 border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                        Desarrollo Psicomotor
                      </span>
                      <span className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 block">
                        {percent}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-500 font-semibold block">
                        Hitos Completados
                      </span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5 block">
                        {achievedCount} de {MILESTONES_CATALOG.length} hitos
                      </span>
                    </div>
                  </Card>
                );
              })()}

              {/* Milestones List grouped by Age */}
              <div className="space-y-6">
                {["2 meses", "4 meses", "6 meses", "9 meses", "12 meses"].map((ageLabel) => {
                  const ageMonths = ageLabel === "2 meses" ? 2 : ageLabel === "4 meses" ? 4 : ageLabel === "6 meses" ? 6 : ageLabel === "9 meses" ? 9 : 12;
                  const groupMilestones = MILESTONES_CATALOG.filter((m) => m.ageLabel === ageLabel);
                  const babyList = milestonesChecked[activeBaby.id] || [];
                  const targetDate = getMilestoneTargetDate(activeBaby.birthDate, ageMonths);

                  return (
                    <div key={ageLabel} className="space-y-2">
                      <div className="flex justify-between items-baseline px-1 border-b border-neutral-100 dark:border-neutral-800/60 pb-1">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                          A los {ageLabel}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                          Fecha estimada: {targetDate}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {groupMilestones.map((m) => {
                          const isChecked = babyList.includes(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => toggleMilestone(m.id)}
                              className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                                isChecked
                                  ? "bg-indigo-50/10 border-indigo-200/80 dark:bg-indigo-950/10 dark:border-indigo-900/30"
                                  : "bg-white border-neutral-100 dark:bg-neutral-900 dark:border-neutral-850"
                              } hover:border-neutral-200 dark:hover:border-neutral-700 active:scale-[0.99]`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs mt-0.5 transition-all ${
                                  isChecked
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-neutral-300 dark:border-neutral-700 bg-transparent text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[14px] font-bold block ${
                                      isChecked
                                        ? "text-indigo-800 dark:text-indigo-400"
                                        : "text-neutral-900 dark:text-white"
                                    }`}
                                  >
                                    {m.name}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-md font-bold uppercase tracking-wider">
                                    {m.category}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-400 block leading-tight">
                                  {m.description}
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
        </>
      )}

      {/* ADD/EDIT MEASUREMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />

          <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {editId ? "Editar Medición" : "Registrar Crecimiento"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-500">
                  Fecha de la medición
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-sm dark:border-neutral-700 text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-500">
                  Peso (kg)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0.5"
                  max="30"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  placeholder="Ej. 6.850"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-500">
                  Talla / Altura (cm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="30"
                  max="120"
                  value={formHeight}
                  onChange={(e) => setFormHeight(e.target.value)}
                  placeholder="Ej. 63.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-500">
                  Perímetro Cefálico (cm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="20"
                  max="70"
                  value={formHead}
                  onChange={(e) => setFormHead(e.target.value)}
                  placeholder="Ej. 41.2"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full justify-center" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Medición"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
