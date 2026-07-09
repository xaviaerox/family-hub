"use client";

import { useMemo, useState } from "react";
import { QuickFeedingForm, REACTION_LABELS } from "./QuickFeedingForm";
import type { FoodOption, RecentFeedingEvent } from "@/application/feeding/listFeeding";
import { Card } from "@/presentation/components/ui/Card";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import {
  Apple,
  Carrot,
  Drumstick,
  Wheat,
  Sprout,
  Milk,
  Utensils,
  Printer,
  AlertTriangle,
  AlertCircle,
  Plus,
  CheckCircle2,
  HelpCircle,
  Pencil,
  Smile,
  Frown,
  Meh,
  type LucideIcon
} from "lucide-react";

interface DBAllergen {
  id: string;
  name: string;
  slug: string;
}

const CATEGORIES = [
  { slug: "all", label: "Todos" },
  { slug: "fruta", label: "Frutas" },
  { slug: "verdura", label: "Verduras" },
  { slug: "proteína", label: "Proteínas" },
  { slug: "cereal", label: "Cereales" },
  { slug: "legumbre", label: "Legumbres" },
  { slug: "lácteo", label: "Lácteos" },
  { slug: "otro", label: "Otros" },
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fruta: Apple,
  verdura: Carrot,
  proteína: Drumstick,
  cereal: Wheat,
  legumbre: Sprout,
  lácteo: Milk,
  otro: Utensils,
};

const STATUS_INFO = {
  untried: {
    label: "Pendiente",
    color: "bg-neutral-50 text-neutral-400 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-500",
    dot: "bg-neutral-300 dark:bg-neutral-600",
  },
  accepted: {
    label: "Tolerado",
    color: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900/30",
    dot: "bg-green-500",
  },
  mild: {
    label: "Alerta Leve",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
    dot: "bg-amber-500",
  },
  severe: {
    label: "Alergia/Grave",
    color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/30",
    dot: "bg-red-500",
  },
};

export function FeedingPageClient({
  babyId,
  babyName,
  createdBy,
  foodOptions,
  initialEvents,
  allergens,
}: {
  babyId: string;
  babyName: string;
  createdBy: string;
  foodOptions: FoodOption[];
  initialEvents: RecentFeedingEvent[];
  allergens: DBAllergen[];
}) {
  const [events, setEvents] = useState<RecentFeedingEvent[]>(initialEvents);
  const [foods, setFoods] = useState<FoodOption[]>(foodOptions);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [preselectedFoodId, setPreselectedFoodId] = useState<string | undefined>(undefined);
  
  // Custom Food Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("fruta");
  const [customMinAge, setCustomMinAge] = useState("6");
  const [selectedAllergenIds, setSelectedAllergenIds] = useState<string[]>([]);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Edit Feeding Event Modal State
  const [editingEvent, setEditingEvent] = useState<{
    id: string;
    foodName: string;
    reaction: "none" | "mild" | "moderate" | "severe";
    notes: string | null;
  } | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const supabase = createBrowserSupabaseClient();

  const handleRegistered = (newEvent: RecentFeedingEvent) => {
    setEvents((prev) => [newEvent, ...prev]);

    setFoods((prevFoods) =>
      prevFoods.map((f) => {
        if (f.id === newEvent.foodItemId) {
          const newEntry = {
            id: newEvent.id,
            occurredAt: newEvent.occurredAt,
            reaction: newEvent.reaction,
            notes: newEvent.notes,
          };
          const updatedHistory = [newEntry, ...f.history];
          
          let newStatus: FoodOption["status"] = "accepted";
          if (newEvent.reaction === "mild") {
            newStatus = "mild";
          } else if (newEvent.reaction !== "none") {
            newStatus = "severe";
          }

          return {
            ...f,
            status: newStatus,
            history: updatedHistory,
          };
        }
        return f;
      })
    );

    setPreselectedFoodId(undefined);
  };

  const handleUpdated = (updatedEvent: {
    id: string;
    reaction: "none" | "mild" | "moderate" | "severe";
    notes: string | null;
  }) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === updatedEvent.id
          ? { ...e, reaction: updatedEvent.reaction, notes: updatedEvent.notes }
          : e
      )
    );

    setFoods((prevFoods) =>
      prevFoods.map((f) => {
        const hasEvent = f.history.some((h) => h.id === updatedEvent.id);
        if (!hasEvent) return f;

        const updatedHistory = f.history.map((h) =>
          h.id === updatedEvent.id
            ? { ...h, reaction: updatedEvent.reaction, notes: updatedEvent.notes }
            : h
        );

        let newStatus: FoodOption["status"] = "untried";
        const latest = updatedHistory[0];
        if (latest) {
          if (latest.reaction === "none") {
            newStatus = "accepted";
          } else if (latest.reaction === "mild") {
            newStatus = "mild";
          } else {
            newStatus = "severe";
          }
        }

        const updatedFood = {
          ...f,
          status: newStatus,
          history: updatedHistory,
        };

        if (selectedFood && selectedFood.id === f.id) {
          setSelectedFood(updatedFood);
        }

        return updatedFood;
      })
    );
  };

  const stats = useMemo(() => {
    const total = foods.length;
    const triedFoods = foods.filter((f) => f.status !== "untried");
    const triedCount = triedFoods.length;
    
    const allergensSet = new Set<string>();
    triedFoods.forEach((f) => {
      f.allergens.forEach((a) => allergensSet.add(a.slug));
    });
    
    const severeCount = foods.filter((f) => f.status === "severe").length;

    return {
      triedCount,
      total,
      allergensTriedCount: allergensSet.size,
      severeCount,
    };
  }, [foods]);

  // Calculate allergen states for the EFSA tracker
  const allergenStatusList = useMemo(() => {
    return allergens.map((al) => {
      // Find all foods linked to this allergen
      const linkedFoods = foods.filter((f) => f.allergens.some((a) => a.slug === al.slug));
      
      let status: "pending" | "tried" | "reaction" = "pending";
      
      for (const f of linkedFoods) {
        if (f.status === "severe" || f.status === "mild") {
          status = "reaction";
          break;
        } else if (f.status === "accepted") {
          status = "tried";
        }
      }

      return {
        id: al.id,
        name: al.name,
        slug: al.slug,
        status,
      };
    });
  }, [allergens, foods]);

  const filteredFoods = useMemo(() => {
    if (activeTab === "all") return foods;
    return foods.filter((f) => f.category === activeTab);
  }, [foods, activeTab]);

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setCustomError("Ingresa el nombre del alimento.");
      return;
    }

    setIsSavingCustom(true);
    setCustomError(null);

    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const normalizedNewName = normalizeString(customName);
    const exists = foods.some((f) => normalizeString(f.name) === normalizedNewName);

    if (exists) {
      setCustomError("Este alimento ya está registrado en tu catálogo.");
      setIsSavingCustom(false);
      return;
    }

    try {
      // Fetch baby family_id
      const { data: baby } = await supabase
        .from("babies")
        .select("family_id")
        .eq("id", babyId)
        .single();

      if (!baby) {
        setCustomError("No se pudo obtener información del bebé.");
        setIsSavingCustom(false);
        return;
      }

      // Insert food item
      const { data: newFood, error: foodError } = await supabase
        .from("food_items")
        .insert({
          name: customName.trim(),
          category: customCategory,
          min_age_days: Math.round(parseFloat(customMinAge) * 30.4375),
          source_id: "manual",
          family_id: baby.family_id,
        })
        .select()
        .single();

      if (foodError || !newFood) {
        setCustomError("Error al guardar alimento: " + foodError?.message);
        setIsSavingCustom(false);
        return;
      }

      // Link allergens if any
      if (selectedAllergenIds.length > 0) {
        const links = selectedAllergenIds.map((aid) => ({
          food_item_id: newFood.id,
          allergen_id: aid,
        }));
        const { error: linkError } = await supabase.from("food_allergens").insert(links);
        if (linkError) {
          console.error("Error linking allergens:", linkError.message);
        }
      }

      // Update local state
      const mappedAllergens = allergens.filter((a) => selectedAllergenIds.includes(a.id));
      const newOption: FoodOption = {
        id: newFood.id,
        name: newFood.name,
        category: newFood.category,
        minAgeDays: newFood.min_age_days,
        allergens: mappedAllergens,
        status: "untried",
        history: [],
      };

      setFoods((prev) => [newOption, ...prev]);
      
      // Reset form
      setCustomName("");
      setCustomCategory("fruta");
      setCustomMinAge("6");
      setSelectedAllergenIds([]);
      setShowCustomModal(false);
    } catch (err: unknown) {
      setCustomError("Error inesperado: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSavingCustom(false);
    }
  };

  const toggleFormAllergen = (id: string) => {
    setSelectedAllergenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* SCREEN CONTAINER (HIDDEN WHEN PRINTING) */}
      <main className="mx-auto max-w-md px-6 pt-10 pb-24 print:hidden">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Alimentación de {babyName}
          </h1>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900"
          >
            <Printer size={13} strokeWidth={2} />
            <span>PDF</span>
          </button>
        </div>
        <p className="text-[14px] text-neutral-500 mb-6">Registro rápido e histórico inteligente.</p>

        {/* Stats Blocks */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-950/50 border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Alimentos Probados
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats.triedCount}
                </span>
                <span className="text-xs text-neutral-400">/ {stats.total}</span>
              </div>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${(stats.triedCount / Math.max(1, stats.total)) * 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-950/50 border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Alérgenos Introducidos
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stats.allergensTriedCount}
                </span>
                <span className="text-xs text-neutral-400">/ 14</span>
              </div>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(stats.allergensTriedCount / 14) * 100}%` }}
              />
            </div>
          </Card>
        </div>

        {stats.severeCount > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-card flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Reacciones Detectadas ({stats.severeCount})
              </h4>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Se han registrado reacciones adversas. Evita esos alimentos y consulta con tu pediatra.
              </p>
            </div>
          </div>
        )}

        {/* Introduced Allergens Tracker Section */}
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Rastreador de Alérgenos (EFSA)
          </h2>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {allergenStatusList.map((al) => {
                let badgeStyle = "bg-neutral-50 text-neutral-400 border-neutral-100 dark:bg-neutral-950/20 dark:border-neutral-800";
                let statusLabel = "Pendiente";
                let Icon = HelpCircle;

                if (al.status === "tried") {
                  badgeStyle = "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/25 dark:text-green-400 dark:border-green-900/30";
                  statusLabel = "Probado (OK)";
                  Icon = CheckCircle2;
                } else if (al.status === "reaction") {
                  badgeStyle = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/30";
                  statusLabel = "Reacción";
                  Icon = AlertTriangle;
                }

                return (
                  <div
                    key={al.id}
                    className={`flex flex-col justify-between p-2.5 rounded-xl border text-left ${badgeStyle}`}
                  >
                    <span className="text-[11px] font-bold truncate block" title={al.name}>
                      {al.name.split(" (")[0]}
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-bold uppercase tracking-wider opacity-90">
                      <Icon size={11} className="shrink-0" />
                      <span>{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Registration Form */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Nueva Toma
            </h2>
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-neutral-900 dark:text-white px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 transition-colors shadow-sm"
            >
              <Plus size={12} /> Personalizado
            </button>
          </div>
          <QuickFeedingForm
            babyId={babyId}
            createdBy={createdBy}
            foodOptions={foods}
            onRegistered={handleRegistered}
            preselectedFoodId={preselectedFoodId}
          />
        </div>

        {/* Foods Map */}
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Mapa de Alimentos
          </h2>

          <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none mb-4 -mx-6 px-6">
            {CATEGORIES.map((tab) => (
              <button
                key={tab.slug}
                type="button"
                onClick={() => setActiveTab(tab.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.slug
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredFoods.map((f) => {
              const s = STATUS_INFO[f.status];
              const hasAllergens = f.allergens.length > 0;
              const IconComp = CATEGORY_ICONS[f.category] ?? Utensils;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFood(f)}
                  className="flex flex-col text-left p-3.5 rounded-card border border-neutral-100 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 active:scale-[0.98] hover:scale-[1.01] transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                      {f.category}
                    </span>
                    {hasAllergens && (
                      <span title="Contiene alérgenos">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800/50 shrink-0">
                      <IconComp size={15} strokeWidth={2} />
                    </div>
                    <span className="text-[13px] font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">
                      {f.name}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {s.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Intake Logs */}
        <div>
          <h2 className="mb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Últimas Tomas
          </h2>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-xs text-neutral-400 py-4 text-center">Aún no hay tomas registradas.</p>}
            {events.slice(0, 10).map((e) => (
              <Card key={e.id} className="flex items-center justify-between py-3.5 px-4 shadow-sm">
                <div className="space-y-0.5 flex-1 mr-4">
                  <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">
                    {e.foodName}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {new Date(e.occurredAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {e.notes && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                      &ldquo;{e.notes}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {e.reaction !== "none" && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      e.reaction === "mild" 
                        ? "bg-amber-50 text-amber-855 border-amber-250 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30"
                        : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/30"
                    }`}>
                      {REACTION_LABELS[e.reaction] || e.reaction}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent({
                        id: e.id,
                        foodName: e.foodName,
                        reaction: e.reaction as any,
                        notes: e.notes,
                      });
                    }}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                    title="Editar toma"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FOOD DETAIL DRAWER */}
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setSelectedFood(null)} />

            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    {selectedFood.category}
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1.5 flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800/80">
                      {(() => {
                        const IconComp = CATEGORY_ICONS[selectedFood.category] ?? Utensils;
                        return <IconComp size={20} strokeWidth={2} />;
                      })()}
                    </div>
                    {selectedFood.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 dark:border-neutral-800 text-sm">
                  <span className="text-neutral-400">Estado de Tolerancia</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      STATUS_INFO[selectedFood.status].color
                    }`}
                  >
                    {STATUS_INFO[selectedFood.status].label}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-neutral-100 dark:border-neutral-800 text-sm">
                  <span className="text-neutral-400">Edad mínima recomendada</span>
                  <span className="text-neutral-700 dark:text-neutral-200 font-semibold">
                    {selectedFood.minAgeDays >= 365 
                      ? `${Math.floor(selectedFood.minAgeDays / 365)} ${Math.floor(selectedFood.minAgeDays / 365) === 1 ? 'año' : 'años'}` 
                      : `${Math.floor(selectedFood.minAgeDays / 30)} meses`} ({selectedFood.minAgeDays} días)
                  </span>
                </div>
                {selectedFood.allergens.length > 0 && (
                  <div className="py-2.5 border-b border-neutral-100 dark:border-neutral-800 text-sm">
                    <span className="text-neutral-400 block mb-1.5">Alérgenos asociados</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFood.allergens.map((a) => (
                        <span
                          key={a.slug}
                          className="px-2.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-900/30"
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <Button
                  className="w-full justify-center text-[15px]"
                  onClick={() => {
                    setPreselectedFoodId(selectedFood.id);
                    setSelectedFood(null);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                >
                  Registrar toma de este alimento
                </Button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                  Historial de Tomas ({selectedFood.history.length})
                </h4>
                {selectedFood.history.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    Este alimento no se ha probado todavía.
                  </p>
                ) : (
                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-100 dark:before:bg-neutral-800">
                    {selectedFood.history.map((h, i) => (
                      <div key={i} className="pl-6 relative">
                        <div
                          className={`absolute left-2 top-1.5 w-2 h-2 rounded-full -translate-x-1/2 ring-4 ring-white dark:ring-neutral-900 ${
                            h.reaction === "none"
                              ? "bg-green-500"
                              : h.reaction === "mild"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            Toma #{selectedFood.history.length - i}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-400">
                              {new Date(h.occurredAt).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEvent({
                                  id: h.id,
                                  foodName: selectedFood.name,
                                  reaction: h.reaction as any,
                                  notes: h.notes,
                                });
                              }}
                              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              title="Editar toma"
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                        </div>
                        {h.reaction !== "none" && (
                          <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-bold mb-1 ${
                            h.reaction === "mild"
                              ? "bg-amber-50 text-amber-850 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300"
                          }`}>
                            Reacción: {REACTION_LABELS[h.reaction] || h.reaction}
                          </span>
                        )}
                        {h.notes && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 italic bg-neutral-50 dark:bg-neutral-950/30 p-2 rounded border border-neutral-100/50 dark:border-neutral-800/30 mt-1">
                            &ldquo;{h.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM FOOD MODAL */}
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setShowCustomModal(false)} />

            <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-100 dark:border-neutral-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Añadir Alimento Personalizado
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="w-7 h-7 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  ✕
                </button>
              </div>

              {customError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-xs text-red-650 dark:text-red-400">
                  {customError}
                </div>
              )}

              <form onSubmit={handleCreateCustomFood} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500">
                    Nombre del alimento
                  </label>
                  <Input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ej. Papaya, Canela, Lenteja roja"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500">
                    Categoría
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full rounded-card border border-neutral-200 bg-transparent px-4 py-2.5 text-sm dark:border-neutral-700"
                  >
                    <option value="fruta">Fruta</option>
                    <option value="verdura">Verdura</option>
                    <option value="proteína">Proteína</option>
                    <option value="cereal">Cereal</option>
                    <option value="legumbre">Legumbre</option>
                    <option value="lácteo">Lácteo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500">
                    Edad recomendada (meses)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    value={customMinAge}
                    onChange={(e) => setCustomMinAge(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-500">
                    Alérgenos Vinculados
                  </label>
                  <div className="space-y-2 border border-neutral-100 dark:border-neutral-800 rounded-xl p-3 max-h-40 overflow-y-auto">
                    {allergens.map((a) => {
                      const isLinked = selectedAllergenIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleFormAllergen(a.id)}
                          className="w-full flex items-center justify-between py-1 text-left text-xs"
                        >
                          <span className="text-neutral-700 dark:text-neutral-300 truncate mr-2">
                            {a.name.split(" (")[0]}
                          </span>
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isLinked
                                ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                : "border-neutral-300 dark:border-neutral-750"
                            }`}
                          >
                            {isLinked && "✓"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full justify-center" disabled={isSavingCustom}>
                    {isSavingCustom ? "Guardando..." : "Crear Alimento"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT EVENT MODAL */}
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setEditingEvent(null)} />

            <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-100 dark:border-neutral-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate pr-2">
                  Editar toma: {editingEvent.foodName}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="w-7 h-7 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 shrink-0"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-xs text-red-650 dark:text-red-400">
                  {editError}
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingEdit(true);
                setEditError(null);

                try {
                  const { updateFeedingEvent } = await import("@/application/feeding/updateFeedingEvent");
                  const result = await updateFeedingEvent(supabase, {
                    eventId: editingEvent.id,
                    reaction: editingEvent.reaction,
                    notes: editingEvent.notes?.trim() || null,
                  });

                  if (!result.ok) {
                    setEditError(result.error ?? "No se pudo actualizar.");
                    return;
                  }

                  handleUpdated({
                    id: editingEvent.id,
                    reaction: editingEvent.reaction,
                    notes: editingEvent.notes?.trim() || null,
                  });

                  setEditingEvent(null);
                } catch (err: unknown) {
                  setEditError("Error inesperado: " + (err instanceof Error ? err.message : String(err)));
                } finally {
                  setIsSavingEdit(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-500">
                    Reacción
                  </label>
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
                          onClick={() => setEditingEvent({ ...editingEvent, reaction: opt.value as any })}
                          className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-card border transition-all duration-200 ${
                            editingEvent.reaction === opt.value
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
                  <label className="mb-1 block text-sm font-medium text-neutral-500">
                    Observaciones
                  </label>
                  <textarea
                    value={editingEvent.notes ?? ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                    placeholder="Ej. Le gustó mucho, comió la mitad, sarpullido..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-card border border-neutral-200 bg-transparent px-4 py-3 text-[15px] dark:border-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all duration-200"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full justify-center" disabled={isSavingEdit}>
                    {isSavingEdit ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* PRINT-ONLY VECTOR LAYOUT (A4 OPTIMIZED REPORT) */}
      <div className="hidden print:block p-10 bg-white text-black min-h-screen">
        <div className="border-b-2 border-neutral-300 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Mapa de Alimentación Complementaria</h1>
            <p className="text-xs text-neutral-500 mt-1">Family Hub | Reporte Clínico de Progreso</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-500 block font-semibold">Generado</span>
            <span className="text-xs font-bold text-neutral-900">{new Date().toLocaleDateString("es-ES")}</span>
          </div>
        </div>

        {/* Baby profile header print */}
        <div className="grid grid-cols-3 gap-6 border-b border-neutral-200 pb-6 mb-6">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Bebé</span>
            <span className="text-base font-bold text-neutral-800">{babyName}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Introducidos</span>
            <span className="text-base font-bold text-neutral-800">{stats.triedCount} / {stats.total} alimentos</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Alérgenos probados</span>
            <span className="text-base font-bold text-neutral-800">{stats.allergensTriedCount} / 14 EFSA</span>
          </div>
        </div>

        {stats.severeCount > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <h4 className="text-sm font-bold text-red-800">⚠️ ALERTA: Alergias detectadas</h4>
            <p className="text-xs text-red-700 mt-0.5">
              Se han registrado reacciones moderadas o graves en {stats.severeCount} alimentos.
            </p>
          </div>
        )}

        <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-4 border-b pb-2">Catálogo Completo de Alimentos</h3>
        <table className="w-full border-collapse border border-neutral-300 text-xs">
          <thead>
            <tr className="bg-neutral-100 text-left font-bold text-neutral-700">
              <th className="border border-neutral-300 p-2">Alimento</th>
              <th className="border border-neutral-300 p-2">Categoría</th>
              <th className="border border-neutral-300 p-2">Estado</th>
              <th className="border border-neutral-300 p-2">Mínima Edad</th>
              <th className="border border-neutral-300 p-2">Última toma / Notas registradas</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((f) => {
              const s = STATUS_INFO[f.status];
              const latestToma = f.history[0];
              return (
                <tr key={f.id} className="hover:bg-neutral-50/50">
                  <td className="border border-neutral-300 p-2 font-bold text-neutral-900">{f.name}</td>
                  <td className="border border-neutral-300 p-2 capitalize text-neutral-600">{f.category}</td>
                  <td className="border border-neutral-300 p-2">
                    <span className="font-bold">{s.label}</span>
                  </td>
                  <td className="border border-neutral-300 p-2">
                    {f.minAgeDays >= 365 ? `${Math.floor(f.minAgeDays / 365)}a` : `${Math.floor(f.minAgeDays / 30)}m`}
                  </td>
                  <td className="border border-neutral-300 p-2 italic text-neutral-500">
                    {latestToma ? (
                      <>
                        {new Date(latestToma.occurredAt).toLocaleDateString("es-ES")}: {latestToma.notes || "Toma registrada sin observaciones."} {latestToma.reaction !== 'none' ? `(Reacción: ${REACTION_LABELS[latestToma.reaction]})` : ''}
                      </>
                    ) : (
                      "Pendiente de introducir."
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
