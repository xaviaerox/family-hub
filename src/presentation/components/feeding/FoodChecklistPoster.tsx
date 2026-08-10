"use client";

import React from "react";
import type { FoodOption } from "@/application/feeding/listFeeding";
import { FoodStatusCircle } from "./FoodStatusCircle";
import {
  Apple,
  Carrot,
  Wheat,
  Milk,
  Drumstick,
  Sparkles,
  ShieldAlert,
  Info,
  Heart,
  type LucideIcon
} from "lucide-react";

interface FoodChecklistPosterProps {
  foods: FoodOption[];
  babyName: string;
  onSelectFood: (food: FoodOption) => void;
}

// Map categories to display headers and color themes
const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; bgHeader: string; border: string }
> = {
  fruta: {
    label: "FRUTAS",
    icon: Apple,
    bgHeader: "bg-amber-100/70 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    border: "border-amber-200/60 dark:border-amber-900/30",
  },
  verdura: {
    label: "VERDURAS",
    icon: Carrot,
    bgHeader: "bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    border: "border-emerald-200/60 dark:border-emerald-900/30",
  },
  cereal: {
    label: "HIDRATOS Y CEREALES",
    icon: Wheat,
    bgHeader: "bg-orange-100/70 text-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
    border: "border-orange-200/60 dark:border-orange-900/30",
  },
  lácteo: {
    label: "LÁCTEOS",
    icon: Milk,
    bgHeader: "bg-sky-100/70 text-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    border: "border-sky-200/60 dark:border-sky-900/30",
  },
  proteína: {
    label: "PROTEÍNA",
    icon: Drumstick,
    bgHeader: "bg-rose-100/70 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
    border: "border-rose-200/60 dark:border-rose-900/30",
  },
  otro: {
    label: "OTROS SABORES",
    icon: Sparkles,
    bgHeader: "bg-purple-100/70 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300",
    border: "border-purple-200/60 dark:border-purple-900/30",
  },
  legumbre: {
    label: "LEGUMBRES",
    icon: Wheat,
    bgHeader: "bg-teal-100/70 text-teal-900 dark:bg-teal-950/40 dark:text-teal-300",
    border: "border-teal-200/60 dark:border-teal-900/30",
  },
};

export function FoodChecklistPoster({ foods, babyName, onSelectFood }: FoodChecklistPosterProps) {
  // Separate allergen foods and standard category foods
  const allergenFoods = foods.filter((f) => f.allergens.length > 0);

  // Group non-allergen foods by category
  const categoriesPresent = Array.from(new Set(foods.map((f) => f.category)));

  // Custom ordering for grid display
  const orderedCategories = ["fruta", "verdura", "cereal", "lácteo", "proteína", "legumbre", "otro"].filter((c) =>
    categoriesPresent.includes(c)
  );

  return (
    <div className="w-full bg-[#fdfbf7] dark:bg-neutral-950 border border-amber-100 dark:border-neutral-800 rounded-3xl p-4 sm:p-6 shadow-sm transition-all duration-200">
      {/* POSTER HEADER */}
      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
          <Heart size={13} className="fill-amber-500 text-amber-500" />
          <span>Primeros Alimentos de {babyName}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 dark:text-amber-100 tracking-tight">
          ¡Explora, prueba y disfruta cada paso!
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Guía visual interactiva de alimentación complementaria
        </p>

        {/* LEGEND BAR */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-800 px-4 py-2.5 rounded-2xl max-w-xl mx-auto shadow-xs text-xs font-medium text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-1.5">
            <FoodStatusCircle status="untried" size={16} />
            <span>No probado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FoodStatusCircle status="trying" size={16} />
            <span>Probando (1-2 tomas)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FoodStatusCircle status="tolerated" size={16} />
            <span>Tolerado (3+ tomas)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FoodStatusCircle status="reaction" size={16} />
            <span>Reacción</span>
          </div>
        </div>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {orderedCategories.map((catKey) => {
          const config = CATEGORY_CONFIG[catKey] ?? {
            label: catKey.toUpperCase(),
            icon: Sparkles,
            bgHeader: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
            border: "border-neutral-200 dark:border-neutral-800",
          };
          const IconComp = config.icon;
          const catFoods = foods.filter((f) => f.category === catKey);

          if (catFoods.length === 0) return null;

          return (
            <div
              key={catKey}
              className={`bg-white dark:bg-neutral-900 rounded-2xl border ${config.border} overflow-hidden shadow-xs flex flex-col justify-between`}
            >
              {/* CATEGORY HEADER */}
              <div className={`px-4 py-2.5 flex items-center justify-between font-bold text-xs ${config.bgHeader}`}>
                <span className="tracking-wide">{config.label}</span>
                <IconComp size={16} />
              </div>

              {/* FOOD LIST */}
              <div className="p-3 divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {catFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => onSelectFood(food)}
                    className="w-full flex items-center justify-between py-2 px-1 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors group"
                  >
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-950 dark:group-hover:text-white truncate mr-2">
                      {food.name}
                    </span>
                    <FoodStatusCircle status={food.status} size={18} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* ALÉRGENOS CARD */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="px-4 py-2.5 flex items-center justify-between font-bold text-xs bg-rose-100/70 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="tracking-wide">ALÉRGENOS PRINCIPALES</span>
            <ShieldAlert size={16} />
          </div>
          <div className="p-3 divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {allergenFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => onSelectFood(food)}
                className="w-full flex items-center justify-between py-2 px-1 text-left hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-lg transition-colors group"
              >
                <div className="flex flex-col truncate mr-2">
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-950 dark:group-hover:text-white truncate">
                    {food.name}
                  </span>
                  <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 truncate">
                    {food.allergens.map((a) => a.name).join(", ")}
                  </span>
                </div>
                <FoodStatusCircle status={food.status} size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER TIPS SECTION (Matching reference image) */}
      <div className="mt-6 pt-5 border-t border-amber-200/40 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/90 dark:bg-neutral-900/90 p-4 rounded-2xl border border-amber-100 dark:border-neutral-800 text-center flex flex-col justify-center items-center">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Inténtalo 5 veces
          </span>
          <div className="flex items-center justify-center gap-3 text-lg font-extrabold text-amber-600 dark:text-amber-400 my-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            A veces requiere paciencia. ¡Cada intento cuenta!
          </p>
        </div>

        <div className="bg-white/90 dark:bg-neutral-900/90 p-4 rounded-2xl border border-amber-100 dark:border-neutral-800 flex items-start gap-3">
          <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
            <p className="font-bold text-neutral-800 dark:text-neutral-100">Indicaciones Básicas</p>
            <p>• Introduce 1 alimento nuevo cada vez y respeta la regla de 3 días para alérgenos.</p>
            <p>• Ofrece alimentos en su forma natural, sin sal ni azúcar añadidos.</p>
            <p>• Respeta su hambre y saciedad. Cada bebé explora a su propio ritmo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
