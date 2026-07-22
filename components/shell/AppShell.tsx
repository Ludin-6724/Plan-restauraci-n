"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/lib/data-context";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { AppNav } from "@/components/nav/AppNav";
import { ForestAudio } from "@/components/forest/ForestAudio";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function AuthErrorFromUrl({ onError }: { onError: (m: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "forbidden") onError("No se pudo completar el acceso. Intenta de nuevo.");
    if (err === "auth") onError("No se pudo iniciar sesión. Intenta de nuevo.");
    if (err === "config") onError("La app aún no tiene autenticación configurada.");
  }, [searchParams, onError]);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data, ready, user, cloudStatus } = useData();
  const supabaseConfigured = isSupabaseConfigured();
  const [authError, setAuthError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted relative z-10">
        <Suspense fallback={null}>
          <AuthErrorFromUrl onError={setAuthError} />
        </Suspense>
        Cargando el bosque…
      </div>
    );
  }

  if (supabaseConfigured && !user) {
    return (
      <>
        <Suspense fallback={null}>
          <AuthErrorFromUrl onError={setAuthError} />
        </Suspense>
        <LoginScreen errorHint={authError} />
      </>
    );
  }

  if (!data.profile.onboarding_done) {
    return <Onboarding />;
  }

  return (
    <>
      <AppNav />
      <ForestAudio />
      <main className="main-pad relative z-20">
        <div className="content-center">
          <div className="flex justify-end mb-2">
            <span className="text-[10px] text-subtle uppercase tracking-wide">
              {cloudStatus === "syncing" && "Sincronizando…"}
              {cloudStatus === "saved" && "En la nube"}
              {cloudStatus === "error" && "Error de nube"}
              {cloudStatus === "offline" && "Local"}
            </span>
          </div>
          <div>{children}</div>
        </div>
      </main>
    </>
  );
}
