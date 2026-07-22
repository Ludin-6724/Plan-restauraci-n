"use client";

import type { AppData } from "@/lib/types";
import { tryCreateClient } from "./client";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const sb = tryCreateClient();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

export async function signUp(email: string, password: string) {
  const sb = tryCreateClient();
  if (!sb) throw new Error("Supabase no configurado");
  return sb.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const sb = tryCreateClient();
  if (!sb) throw new Error("Supabase no configurado");
  return sb.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const sb = tryCreateClient();
  if (!sb) return;
  await sb.auth.signOut();
}

/** Sube el snapshot local del plan a Supabase (upsert). */
export async function pushSnapshot(data: AppData): Promise<{ ok: boolean; error?: string }> {
  const sb = tryCreateClient();
  if (!sb) return { ok: false, error: "Supabase no configurado" };
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false, error: "Inicia sesión para sincronizar" };

  const { error } = await sb.from("app_snapshots").upsert({
    user_id: auth.user.id,
    data,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Descarga el snapshot de la nube. */
export async function pullSnapshot(): Promise<{ ok: boolean; data?: AppData; error?: string }> {
  const sb = tryCreateClient();
  if (!sb) return { ok: false, error: "Supabase no configurado" };
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false, error: "Inicia sesión para sincronizar" };

  const { data, error } = await sb
    .from("app_snapshots")
    .select("data")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data?.data) return { ok: false, error: "No hay backup en la nube todavía" };
  return { ok: true, data: data.data as AppData };
}
