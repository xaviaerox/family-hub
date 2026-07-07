"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { sendMagicLink } from "@/application/auth/sendMagicLink";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setStatus("error");
      setErrorMessage(
        "El enlace de acceso no es válido o ha caducado. Solicita uno nuevo."
      );
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const supabase = createBrowserSupabaseClient();
    const result = await sendMagicLink(supabase, {
      email,
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error ?? "Algo ha ido mal. Inténtalo de nuevo.");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand mark */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center mb-5 shadow-lg">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-white dark:text-neutral-900" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Family Hub
        </h1>
        <p className="mt-2 text-[15px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Tu espacio familiar seguro. Accede sin contraseña:
          te enviamos un enlace a tu email.
        </p>
      </div>

      {status === "sent" ? (
        <div className="p-5 rounded-2xl border border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-green-800 dark:text-green-300">
                ¡Enlace enviado!
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                Revisa tu bandeja de entrada en{" "}
                <span className="font-semibold">{email}</span> y pulsa el
                enlace para entrar. Caduca en 1 hora.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="mt-4 text-xs font-bold text-green-700 dark:text-green-400 underline underline-offset-2"
          >
            Usar otro email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {errorMessage && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20 flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-red-700 dark:text-red-400 leading-snug">{errorMessage}</p>
            </div>
          )}

          <Button type="submit" isLoading={status === "sending"} className="w-full justify-center">
            Enviar enlace de acceso
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        Al acceder aceptas el uso de cookies de sesión.<br />
        Tus datos están protegidos y son solo tuyos.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 bg-white dark:bg-neutral-950">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
