import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "./config";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado.");
  }
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

export function tryCreateClient() {
  if (!isSupabaseConfigured()) return null;
  try {
    return createClient();
  } catch {
    return null;
  }
}
