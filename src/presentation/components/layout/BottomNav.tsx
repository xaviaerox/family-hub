"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Apple, TrendingUp, ShieldAlert, Settings } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Hoy", icon: Home },
  { href: "/dashboard/feeding", label: "Alimentación", icon: Apple },
  { href: "/dashboard/growth", label: "Crecimiento", icon: TrendingUp },
  { href: "/dashboard/health", label: "Salud", icon: ShieldAlert },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200/60 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 print:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300",
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
