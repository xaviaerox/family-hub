"use client";

import Image from "next/image";

export const AVATAR_PRESETS = ["koala", "panda", "lion", "bear", "bunny"] as const;
export type AvatarPreset = typeof AVATAR_PRESETS[number];

interface BabyAvatarProps {
  photoUrl: string | null;
  firstName: string;
  size?: number;
  className?: string;
}

export function BabyAvatar({ photoUrl, firstName, size = 48, className = "" }: BabyAvatarProps) {
  const isUrl = photoUrl && (photoUrl.startsWith("http://") || photoUrl.startsWith("https://") || photoUrl.startsWith("/"));
  const preset = photoUrl as AvatarPreset;
  const initial = firstName.charAt(0).toUpperCase();

  // If it's a real custom URL image
  if (isUrl) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border border-neutral-100 dark:border-neutral-800 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={photoUrl}
          alt={firstName}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized // To allow arbitrary external URLs without next.config domains whitelist errors
        />
      </div>
    );
  }

  // If it matches one of our minimal vector animal presets
  if (AVATAR_PRESETS.includes(preset)) {
    return (
      <div
        className={`relative shrink-0 rounded-full flex items-center justify-center select-none overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        {preset === "koala" && (
          <svg viewBox="0 0 100 100" className="w-full h-full bg-slate-100 dark:bg-slate-800">
            {/* Ears */}
            <circle cx="24" cy="35" r="16" fill="#94a3b8" />
            <circle cx="24" cy="35" r="10" fill="#cbd5e1" />
            <circle cx="76" cy="35" r="16" fill="#94a3b8" />
            <circle cx="76" cy="35" r="10" fill="#cbd5e1" />
            {/* Head */}
            <circle cx="50" cy="55" r="32" fill="#94a3b8" />
            {/* Eyes */}
            <circle cx="38" cy="50" r="4.5" fill="#1e293b" />
            <circle cx="62" cy="50" r="4.5" fill="#1e293b" />
            {/* Nose */}
            <ellipse cx="50" cy="60" rx="9" ry="14" fill="#334155" />
            {/* Cheeks */}
            <circle cx="32" cy="58" r="4.5" fill="#f87171" opacity="0.4" />
            <circle cx="68" cy="58" r="4.5" fill="#f87171" opacity="0.4" />
          </svg>
        )}

        {preset === "panda" && (
          <svg viewBox="0 0 100 100" className="w-full h-full bg-slate-50 dark:bg-slate-800">
            {/* Ears */}
            <circle cx="26" cy="28" r="15" fill="#1e293b" />
            <circle cx="74" cy="28" r="15" fill="#1e293b" />
            {/* Head */}
            <circle cx="50" cy="55" r="34" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Eye patches */}
            <ellipse cx="36" cy="52" rx="10" ry="12" fill="#1e293b" transform="rotate(-15 36 52)" />
            <ellipse cx="64" cy="52" rx="10" ry="12" fill="#1e293b" transform="rotate(15 64 52)" />
            {/* Eyes */}
            <circle cx="36" cy="50" r="3" fill="#ffffff" />
            <circle cx="64" cy="50" r="3" fill="#ffffff" />
            {/* Nose */}
            <polygon points="46,62 54,62 50,66" fill="#1e293b" />
            {/* Cheeks */}
            <circle cx="28" cy="62" r="4.5" fill="#f87171" opacity="0.3" />
            <circle cx="72" cy="62" r="4.5" fill="#f87171" opacity="0.3" />
          </svg>
        )}

        {preset === "lion" && (
          <svg viewBox="0 0 100 100" className="w-full h-full bg-orange-50 dark:bg-slate-900">
            {/* Mane */}
            <circle cx="50" cy="52" r="38" fill="#ea580c" />
            {/* Ears */}
            <circle cx="30" cy="30" r="10" fill="#fbbf24" />
            <circle cx="30" cy="30" r="6" fill="#ea580c" />
            <circle cx="70" cy="30" r="10" fill="#fbbf24" />
            <circle cx="70" cy="30" r="6" fill="#ea580c" />
            {/* Face */}
            <circle cx="50" cy="55" r="28" fill="#fbbf24" />
            {/* Eyes */}
            <circle cx="40" cy="50" r="3.5" fill="#1e293b" />
            <circle cx="60" cy="50" r="3.5" fill="#1e293b" />
            {/* Snout */}
            <circle cx="45" cy="64" r="6" fill="#fef08a" />
            <circle cx="55" cy="64" r="6" fill="#fef08a" />
            <polygon points="47,60 53,60 50,64" fill="#78350f" />
          </svg>
        )}

        {preset === "bear" && (
          <svg viewBox="0 0 100 100" className="w-full h-full bg-orange-50/50 dark:bg-slate-800">
            {/* Ears */}
            <circle cx="28" cy="28" r="12" fill="#78350f" />
            <circle cx="28" cy="28" r="7" fill="#fed7aa" />
            <circle cx="72" cy="28" r="12" fill="#78350f" />
            <circle cx="72" cy="28" r="7" fill="#fed7aa" />
            {/* Head */}
            <circle cx="50" cy="55" r="33" fill="#78350f" />
            {/* Eyes */}
            <circle cx="38" cy="48" r="3.5" fill="#ffffff" />
            <circle cx="38" cy="48" r="2" fill="#1e293b" />
            <circle cx="62" cy="48" r="3.5" fill="#ffffff" />
            <circle cx="62" cy="48" r="2" fill="#1e293b" />
            {/* Snout */}
            <ellipse cx="50" cy="62" rx="12" ry="9" fill="#fed7aa" />
            <ellipse cx="50" cy="59" rx="6" ry="4" fill="#1e293b" />
            {/* Smile */}
            <path d="M 46 64 Q 50 67 54 64" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}

        {preset === "bunny" && (
          <svg viewBox="0 0 100 100" className="w-full h-full bg-rose-50 dark:bg-slate-800">
            {/* Ears */}
            <ellipse cx="32" cy="24" rx="8" ry="20" fill="#f1f5f9" transform="rotate(-8 32 24)" />
            <ellipse cx="32" cy="26" rx="4" ry="15" fill="#fda4af" transform="rotate(-8 32 26)" />
            <ellipse cx="68" cy="24" rx="8" ry="20" fill="#f1f5f9" transform="rotate(8 68 24)" />
            <ellipse cx="68" cy="26" rx="4" ry="15" fill="#fda4af" transform="rotate(8 68 26)" />
            {/* Head */}
            <circle cx="50" cy="58" r="32" fill="#f1f5f9" />
            {/* Eyes */}
            <circle cx="37" cy="54" r="3.5" fill="#1e293b" />
            <circle cx="63" cy="54" r="3.5" fill="#1e293b" />
            {/* Nose */}
            <polygon points="47,62 53,62 50,65" fill="#fda4af" />
            {/* Whiskers */}
            <line x1="20" y1="62" x2="10" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="20" y1="66" x2="8" y2="67" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="80" y1="62" x2="90" y2="60" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="80" y1="66" x2="92" y2="67" stroke="#cbd5e1" strokeWidth="1.5" />
          </svg>
        )}
      </div>
    );
  }

  // Fallback: Default initials with pastel gradient
  const AVATAR_GRADIENTS = [
    "from-sky-400 to-indigo-400",
    "from-pink-400 to-rose-400",
    "from-emerald-400 to-teal-400",
    "from-amber-400 to-orange-400",
  ];
  // Stable gradient selection based on name length
  const gradientIdx = firstName.length % AVATAR_GRADIENTS.length;
  const gradient = AVATAR_GRADIENTS[gradientIdx];

  return (
    <div
      className={`rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-bold shadow-sm shrink-0 select-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.4) }}
    >
      {initial}
    </div>
  );
}
