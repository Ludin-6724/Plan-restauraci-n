"use client";

import type { Session, User } from "@supabase/supabase-js";
import { tryCreateClient } from "./client";

export async function getSession(): Promise<Session | null> {
  const sb = tryCreateClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const sb = tryCreateClient();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

export async function signInWithGoogle() {
  const sb = tryCreateClient();
  if (!sb) throw new Error("Supabase no configurado");
  const redirectTo = `${window.location.origin}/auth/callback`;
  return sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
}

/** Magic link al correo (signup abierto). */
export async function signInWithEmail(email: string) {
  const sb = tryCreateClient();
  if (!sb) throw new Error("Supabase no configurado");
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes("@")) {
    return { data: null, error: { message: "Escribe un correo válido." } as Error };
  }
  return sb.auth.signInWithOtp({
    email: clean,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });
}

export async function signOut() {
  const sb = tryCreateClient();
  if (!sb) return;
  await sb.auth.signOut();
}

export function onAuthChange(cb: (user: User | null) => void) {
  const sb = tryCreateClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
